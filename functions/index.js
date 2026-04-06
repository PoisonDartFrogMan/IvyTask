const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.sendPetNotification = functions.firestore
  .document("chat_messages/{messageId}")
  .onCreate(async (snap, context) => {
    const msg = snap.data();
    const { roomId, senderId, senderName, senderPet } = msg;

    // Fetch the room to find members
    const roomSnap = await admin.firestore().collection("chat_rooms").doc(roomId).get();
    if (!roomSnap.exists) return;
    
    const members = roomSnap.data().members || [];
    const recipients = members.filter(id => id !== senderId);
    if (recipients.length === 0) return;

    // Collect FCM tokens for recipients
    let tokens = [];
    for (const uid of recipients) {
      const userSnap = await admin.firestore().collection("users").doc(uid).get();
      if (userSnap.exists) {
        const userTokens = userSnap.data().fcmTokens || [];
        tokens = tokens.concat(userTokens);
      }
    }

    if (tokens.length === 0) return;

    // Determine notification text based on pet type
    let title = "";
    let body = "";

    switch (senderPet) {
      case "frog":
        title = "黄金のカエルくんが到着したよ！🐸✨";
        body = `${senderName}さんからのお手紙を大切に抱えて、ひょっこり現れたみたい。アプリを開いて受け取ってあげてね。`;
        break;
      case "turtle":
        title = "カメさんがパタパタ泳いできたよ！🐢";
        body = `${senderName}さんからのお手紙を背負って、やっと到着！ちょっと一休みさせてあげてね。`;
        break;
      case "clownfish":
        title = "クマノミちゃんがスイスイ到着！🐠✨";
        body = `${senderName}さんからの伝言だよ！泡と一緒にパチンとはじけて届けちゃうね！`;
        break;
      case "manta":
        title = "優雅なマンタが潮風を運んできたよ 🌊";
        body = `${senderName}さんからの素敵なお手紙が届いたみたい。ゆっくり開いてみてね。`;
        break;
      case "eel":
        title = "ニョキッ！チンアナゴが顔を出したよ！🐚";
        body = `${senderName}さんからのお手紙を持って、足元からひょっこり現れたみたい！`;
        break;
      default:
        title = "動物さんがお手紙を運んできたよ！🐾";
        body = `${senderName}さんからのメッセージです。`;
    }

    // Add common suffix
    body += "\nアプリを開いてお迎えしてあげてね！";

    // Notification payload
    const payload = {
      notification: {
        title: title,
        body: body,
        icon: `/img/pets/${senderPet}.png`
      }
    };

    try {
      const response = await admin.messaging().sendEachForMulticast({
        tokens: tokens,
        notification: payload.notification
      });
      console.log(`Successfully sent ${response.successCount} messages; Failed ${response.failureCount} messages.`);
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  });
