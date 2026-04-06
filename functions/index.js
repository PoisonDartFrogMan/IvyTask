const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");

admin.initializeApp();

// リージョンを日本（東京）に固定
setGlobalOptions({ region: "asia-northeast1" });

exports.sendPetNotification = onDocumentCreated("chat_messages/{messageId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) return;

  const msg = snapshot.data();
  // messagesコレクションに保存されているフィールド名を確認してね！
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