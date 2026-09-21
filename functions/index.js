const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const path = require("path");

admin.initializeApp();

// リージョンを日本（東京）に固定
setGlobalOptions({ region: "asia-northeast1" });

// OpenAI API KeyをFirebase Secretとして管理
const openaiApiKey = defineSecret("OPENAI_API_KEY");

// マスターのUID（フロントエンドと同じ値）
const MASTER_UID = "8V7CfCrj4wSD8aZymfrf1WKZaAg1";

// Whisper APIの最大ファイルサイズ（25MB）
// Whisper APIの実質的な上限（25MB公称だが multipart overhead 分を引いた安全値）
const WHISPER_MAX_BYTES = 24 * 1024 * 1024; // 24MB

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
 * MIME タイプから適切な拡張子を返す
 */
function mimeToExt(mimeType, fallback = ".webm") {
  if (!mimeType) return fallback;
  if (mimeType.includes("m4a"))  return ".m4a";
  if (mimeType.includes("mp4"))  return ".mp4";
  if (mimeType.includes("mp3") || mimeType.includes("mpeg")) return ".mp3";
  if (mimeType.includes("wav"))  return ".wav";
  if (mimeType.includes("ogg"))  return ".ogg";
  if (mimeType.includes("flac")) return ".flac";
  return fallback;
}

/**
 * バッファの先頭バイト（マジックバイト）から実際の音声フォーマットを検出する
 * ブラウザが file.type を正しく返さない場合（m4a など）に備えた信頼性の高い検出
 */
function detectAudioFormat(buffer) {
  if (!buffer || buffer.length < 12) return null;

  // WebM: 1A 45 DF A3
  if (buffer[0] === 0x1A && buffer[1] === 0x45 &&
      buffer[2] === 0xDF && buffer[3] === 0xA3) {
    return { ext: ".webm", mime: "audio/webm" };
  }

  // RIFF/WAV: 52 49 46 46
  if (buffer[0] === 0x52 && buffer[1] === 0x49 &&
      buffer[2] === 0x46 && buffer[3] === 0x46) {
    return { ext: ".wav", mime: "audio/wav" };
  }

  // MP3 ID3タグ付き: 49 44 33
  if (buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33) {
    return { ext: ".mp3", mime: "audio/mpeg" };
  }

  // MP3 sync word: FF Ex / FF Fx
  if (buffer[0] === 0xFF && (buffer[1] & 0xE0) === 0xE0) {
    return { ext: ".mp3", mime: "audio/mpeg" };
  }

  // FLAC: 66 4C 61 43
  if (buffer[0] === 0x66 && buffer[1] === 0x4C &&
      buffer[2] === 0x61 && buffer[3] === 0x43) {
    return { ext: ".flac", mime: "audio/flac" };
  }

  // OGG: 4F 67 67 53
  if (buffer[0] === 0x4F && buffer[1] === 0x67 &&
      buffer[2] === 0x67 && buffer[3] === 0x53) {
    return { ext: ".ogg", mime: "audio/ogg" };
  }

  // M4A / MP4: MPEG-4コンテナは offset 4 に "ftyp" ボックスを持つ
  if (buffer[4] === 0x66 && buffer[5] === 0x74 &&
      buffer[6] === 0x79 && buffer[7] === 0x70) {
    // brand (bytes 8-11) で M4A か一般 MP4 かを区別
    const brand = buffer.slice(8, 12).toString("ascii");
    if (/M4A |m4a |M4P |f4a /i.test(brand)) {
      return { ext: ".m4a", mime: "audio/x-m4a" };
    }
    return { ext: ".mp4", mime: "audio/mp4" };
  }

  return null;
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

    // /tmp への書き出しユーティリティ
    const fs = require("fs");
    const os = require("os");

    // マジックバイトでフォーマット自動検出（ブラウザのMIMEタイプより確実）
    const detected = detectAudioFormat(audioBuffer);
    const ext = detected ? detected.ext : mimeToExt(mimeType);
    console.log(`フォーマット検出: ${detected ? detected.ext + " (" + detected.mime + ")" : "不明 → " + mimeToExt(mimeType) + " (MIMEより)"}`);


    const ffmpeg = require("fluent-ffmpeg");
    const ffmpegPath = require("ffmpeg-static");
    ffmpeg.setFfmpegPath(ffmpegPath);

    /**
     * Whisper API に送信
     */
    async function callWhisper(stream) {
      const response = await openai.audio.transcriptions.create({
        model: "whisper-1",
        file: stream,
        language: language,
      });
      return response.text || "";
    }

    let transcribedText = "";
    let chunkCount = 1;

    try {
      if (audioBuffer.length <= WHISPER_MAX_BYTES) {
        // ===== 通常モード: 直接送信 =====
        console.log("通常モード: 直接 Whisper API へ送信");
        const tmpPath = path.join(os.tmpdir(), `audio_${Date.now()}${ext}`);
        fs.writeFileSync(tmpPath, audioBuffer);
        try {
          transcribedText = await callWhisper(fs.createReadStream(tmpPath));
        } finally {
          try { fs.unlinkSync(tmpPath); } catch (_) {}
        }
      } else {
        // ===== 長時間モード: ffmpeg で正しく分割 & 圧縮 =====
        console.log("長時間モード: ffmpegで分割・圧縮を開始");
        const inputPath = path.join(os.tmpdir(), `input_${Date.now()}${ext}`);
        fs.writeFileSync(inputPath, audioBuffer);
        
        const outputPrefix = `chunk_${Date.now()}_`;
        const outputPattern = path.join(os.tmpdir(), `${outputPrefix}%03d.mp3`);

        await new Promise((resolve, reject) => {
          ffmpeg(inputPath)
            .outputOptions([
              "-f segment",
              "-segment_time 1200", // 20分（1200秒）ごとに分割。64kbpsなら20分で約10MB
              "-c:a libmp3lame",
              "-b:a 64k",
              "-ac 1",
              "-ar 16000"
            ])
            .output(outputPattern)
            .on("end", resolve)
            .on("error", reject)
            .run();
        });

        // 生成されたチャンクファイルを取得
        const files = fs.readdirSync(os.tmpdir()).filter(f => f.startsWith(outputPrefix) && f.endsWith(".mp3")).sort();
        chunkCount = files.length;
        console.log(`分割完了: ${chunkCount} 個のMP3ファイルが生成されました`);

        const CONCURRENCY = 3;
        const results = new Array(chunkCount).fill("");

        for (let i = 0; i < chunkCount; i += CONCURRENCY) {
          const batch = files.slice(i, i + CONCURRENCY);
          const batchPromises = batch.map(async (filename, batchIdx) => {
            const chunkIdx = i + batchIdx;
            const chunkPath = path.join(os.tmpdir(), filename);
            const stats = fs.statSync(chunkPath);
            console.log(`チャンク ${chunkIdx + 1}/${chunkCount} を処理中 (${stats.size} bytes)`);
            
            try {
              const text = await callWhisper(fs.createReadStream(chunkPath));
              return { idx: chunkIdx, text };
            } finally {
              try { fs.unlinkSync(chunkPath); } catch (_) {}
            }
          });

          const batchResults = await Promise.all(batchPromises);
          batchResults.forEach(({ idx, text }) => { results[idx] = text; });
        }

        transcribedText = results.join("\n\n");
        try { fs.unlinkSync(inputPath); } catch (_) {} // 元の一時ファイルも削除
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
        console.warn(`一時ファイルの削除に失敗しました: ${storagePath}`, deleteErr);
      }
    }

    return { text: transcribedText, chunkCount };
  }
);

// ========== 新規: ジェミ子（実際はOpenAI）による要約機能 ==========
exports.summarizeText = onCall(
  { secrets: [openaiApiKey], timeoutSeconds: 120, memory: "256MiB" },
  async (request) => {
    // ===== 認証・権限チェック =====
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "ログインが必要です。");
    }
    if (request.auth.uid !== MASTER_UID) {
      throw new HttpsError("permission-denied", "この機能はマスターのみ使用できます。");
    }

    const { text, promptTemplate } = request.data;
    if (!text) {
      throw new HttpsError("invalid-argument", "要約対象のテキストが必要です。");
    }

    try {
      const { default: OpenAI } = await import("openai");
      const openai = new OpenAI({ apiKey: openaiApiKey.value() });
      
      const prompt = promptTemplate || `以下の内容を議事録として要点を分かりやすくまとめてください：\n\n${text}`;
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini", // 高速・安価な要約用モデル
        messages: [{ role: "user", content: prompt }],
      });
      
      return { summary: response.choices[0].message.content };
    } catch (err) {
      console.error("要約API エラー:", err);
      throw new HttpsError("internal", `要約処理に失敗しました: ${err.message}`);
    }
  }
);
