// Firebase SDKを読み込んで初期化
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Firebase構成（既存の.firebase-configと同様に設定）
const firebaseConfig = {
    apiKey: "AIzaSyBeI8s103OiXXOpRpYc5WBwkJK1lFSzLwM",
    authDomain: "ivy-league-app-95a5d.firebaseapp.com",
    projectId: "ivy-league-app-95a5d",
    storageBucket: "ivy-league-app-95a5d.firebasestorage.app",
    messagingSenderId: "470602099850",
    appId: "1:470602099850:web:1ac19841730eb053341173",
    measurementId: "G-BE4QS8RP2G"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// イベント処理
document.getElementById("resetForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;

  sendPasswordResetEmail(auth, email)
    .then(() => {
      document.getElementById("result").textContent =
        "パスワード再設定リンクをメールで送信しました。";
    })
    .catch((error) => {
      document.getElementById("result").textContent = "エラー：" + error.message;
    });
});