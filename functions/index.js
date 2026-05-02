const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const { Readable } = require("stream");
const path = require("path");

admin.initializeApp();

// リージョンを日本（東京）に固定
setGlobalOptions({ region: "asia-northeast1" });

// OpenAI API KeyをFirebase Secretとして管理
const openaiApiKey = defineSecret("OPENAI_API_KEY");

// マスターのUID（フロントエンドと同じ値）
const MASTER_UID = "8V7CfCrj4wSD8aZymfrf1WKZaAg1";

// Whisper APIの最大ファイルサイズ（25MB）
const WHISPER_MAX_BYTES = 25 * 1024 * 1024;

// ========== 既存: ペット通知 ==========
exports.sendPetNotification = onDocumentCreated("chat_messages/{messageId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) return;

  const msg = snapshot.data();
  const { roomId, senderId, senderName, senderPet } = msg;

  // 1. ルームを取得してメンバーを探す
  const roomSnap = await admin.firestore().collection("chat_rooms").doc(roomId).get();
  if (!roomSnap.exists) return;

  const members = roomSnap.data().members || [];
  const recipients = members.filter(id => id !== senderId);
  if (recipients.length === 0) return;

  // 2. 受信者のFCMトークンを集める
  let tokens = [];
  for (const uid of recipients) {
    const userSnap = await admin.firestore().collection("users").doc(uid).get();
    if (userSnap.exists) {
      const userTokens = userSnap.data().fcmTokens || [];
      tokens = tokens.concat(userTokens);
    }
  }

  if (tokens.length === 0) return;

  // 3. ペットの種類に合わせて通知内容を決定
  let title = "";
  let body = "";

  switch (senderPet) {
    case "frog":
      title = "黄金のカエルくんが到着したよ！🐸✨";
      body = `${senderName}さんからのお手紙を大切に抱えて、ひょっこり現れたみたい。`;
      break;
    case "turtle":
      title = "カメさんがパタパタ泳いできたよ！🐢";
      body = `${senderName}さんからのお手紙を背負って、やっと到着！`;
      break;
    case "clownfish":
      title = "クマノミちゃんがスイスイ到着！🐠✨";
      body = `${senderName}さんからの伝言だよ！泡と一緒にパチンとはじけて届けちゃうね！`;
      break;
    case "manta":
      title = "優雅なマンタが潮風を運んできたよ 🌊";
      body = `${senderName}さんからの素敵なお手紙が届いたみたい。`;
      break;
    case "eel":
      title = "ニョキッ！チンアナゴが顔を出したよ！🐚";
      body = `${senderName}さんからのお手紙を持って、足元からひょっこり現れたみたい！`;
      break;
    default:
      title = "動物さんがお手紙を運んできたよ！🐾";
      body = `${senderName}さんからのメッセージです。`;
  }

  body += "\nアプリを開いてお迎えしてあげてね！";

  // 4. 通知を送る
  const message = {
    tokens: tokens,
    notification: {
      title: title,
      body: body,
    },
    webpush: {
      notification: {
        icon: `/img/pets/${senderPet}.png`
      }
    }
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`Successfully sent ${response.successCount} messages; Failed ${response.failureCount} messages.`);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
});


// ========== 新規: Coral-Voice AI 文字起こし ==========

/**
 * Buffer を指定バイト数ずつ分割する
 */
function splitBuffer(buffer, chunkSize) {
  const chunks = [];
  let offset = 0;
  while (offset < buffer.length) {
    chunks.push(buffer.slice(offset, offset + chunkSize));
    offset += chunkSize;
  }
  return chunks;
}

/**
 * Buffer から Node.js Readable ストリームを生成し
 * Blob 相当のオブジェクトを返す（openai SDK の File 互換）
 */
function bufferToFile(buffer, filename, mimeType) {
  // openai SDK v4 は File オブジェクト（Web API）か Readable を受け付ける
  // Node.js 環境では Readable を使う
  const readable = Readable.from(buffer);
  readable.path = filename; // openai SDK がファイル名を読む
  readable.headers = { "content-type": mimeType };
  return readable;
}

/**
 * Cloud Functions: transcribeAudio
 * - マスターUID のみ実行可能
 * - Firebase Storage にアップロードされた音声ファイルを取得
 * - 25MB 以下 → 直接 Whisper API
 * - 25MB 超   → チャンクに分割して並列リクエスト → テキスト結合
 * - 完了後 Storage の一時ファイルを削除（自動クリーンアップ）
 */
exports.transcribeAudio = onCall(
  { secrets: [openaiApiKey], timeoutSeconds: 540, memory: "1GiB" },
  async (request) => {
    // ===== 認証・権限チェック =====
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "ログインが必要です。");
    }
    if (request.auth.uid !== MASTER_UID) {
      throw new HttpsError("permission-denied", "この機能はマスターのみ使用できます。");
    }

    const { storagePath, mimeType = "audio/webm", language = "ja" } = request.data;
    if (!storagePath) {
      throw new HttpsError("invalid-argument", "storagePath が必要です。");
    }

    const bucket = admin.storage().bucket();
    const file = bucket.file(storagePath);

    let audioBuffer;
    try {
      const [contents] = await file.download();
      audioBuffer = contents;
    } catch (err) {
      console.error("Storage ダウンロードエラー:", err);
      throw new HttpsError("not-found", "音声ファイルの取得に失敗しました。");
    }

    console.log(`音声ファイルサイズ: ${audioBuffer.length} bytes`);

    // OpenAI クライアントを初期化
    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey: openaiApiKey.value() });

    let transcribedText = "";

    try {
      if (audioBuffer.length <= WHISPER_MAX_BYTES) {
        // ===== 通常モード: 直接送信 =====
        console.log("通常モード: 直接 Whisper API へ送信");
        const audioFile = bufferToFile(audioBuffer, path.basename(storagePath), mimeType);
        const response = await openai.audio.transcriptions.create({
          model: "whisper-1",
          file: audioFile,
          language: language,
        });
        transcribedText = response.text || "";
      } else {
        // ===== 長時間モード: チャンク分割 + 並列処理 =====
        console.log(`長時間モード: ${Math.ceil(audioBuffer.length / WHISPER_MAX_BYTES)} チャンクに分割`);
        const chunks = splitBuffer(audioBuffer, WHISPER_MAX_BYTES);
        const ext = path.extname(storagePath) || ".webm";

        // 並列で Whisper API にリクエスト（最大 5 並列に制限）
        const CONCURRENCY = 5;
        const results = new Array(chunks.length).fill("");

        for (let i = 0; i < chunks.length; i += CONCURRENCY) {
          const batch = chunks.slice(i, i + CONCURRENCY);
          const batchPromises = batch.map(async (chunk, batchIdx) => {
            const chunkIdx = i + batchIdx;
            const chunkFilename = `chunk_${chunkIdx}${ext}`;
            console.log(`チャンク ${chunkIdx + 1}/${chunks.length} を処理中 (${chunk.length} bytes)`);
            const audioFile = bufferToFile(chunk, chunkFilename, mimeType);
            const response = await openai.audio.transcriptions.create({
              model: "whisper-1",
              file: audioFile,
              language: language,
            });
            return { idx: chunkIdx, text: response.text || "" };
          });

          const batchResults = await Promise.all(batchPromises);
          batchResults.forEach(({ idx, text }) => {
            results[idx] = text;
          });
        }

        transcribedText = results.join("\n\n");
      }
    } catch (err) {
      console.error("Whisper API エラー:", err);
      throw new HttpsError("internal", `文字起こしに失敗しました: ${err.message}`);
    } finally {
      // ===== 自動クリーンアップ: Storage から一時ファイルを削除 =====
      try {
        await file.delete();
        console.log(`一時ファイルを削除しました: ${storagePath}`);
      } catch (deleteErr) {
        // 削除失敗は致命的ではないので警告のみ
        console.warn(`一時ファイルの削除に失敗しました: ${storagePath}`, deleteErr);
      }
    }

    return {
      text: transcribedText,
      chunkCount: audioBuffer.length > WHISPER_MAX_BYTES
        ? Math.ceil(audioBuffer.length / WHISPER_MAX_BYTES)
        : 1,
    };
  }
);