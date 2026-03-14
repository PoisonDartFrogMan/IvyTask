importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBeI8s103OiXXOpRpYc5WBwkJK1lFSzLwM",
  authDomain: "ivy-league-app-95a5d.firebaseapp.com",
  projectId: "ivy-league-app-95a5d",
  storageBucket: "ivy-league-app-95a5d.firebasestorage.app",
  messagingSenderId: "470602099850",
  appId: "1:470602099850:web:1ac19841730eb053341173",
  measurementId: "G-BE4QS8RP2G"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png' // 必要に応じて適切なアイコンパスに変更してください
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
