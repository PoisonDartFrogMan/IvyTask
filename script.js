// Firebase SDKから、我々が必要とする「能力」をインポートする
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ----------------------------------------
// ① Firebaseの初期設定（これはHTMLからコピーされたものと同じ）
// ----------------------------------------
const firebaseConfig = {
  // (君の秘密の鍵がここにある)
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // ★認証機能の準備

// ----------------------------------------
// ② 操作するHTML要素を取得
// ----------------------------------------
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const signupButton = document.getElementById('signup-button');
const loginButton = document.getElementById('login-button');
const logoutButton = document.getElementById('logout-button');
const userEmailSpan = document.getElementById('user-email');
// (タスク追加関連の要素取得もここに書いても良いが、一旦省略)


// ----------------------------------------
// ③ 認証関連のボタンがクリックされた時の処理
// ----------------------------------------
// サインアップ
signupButton.addEventListener('click', () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log('サインアップ成功！:', userCredential.user);
    })
    .catch((error) => {
      alert('サインアップ失敗…: ' + error.message);
    });
});

// ログイン
loginButton.addEventListener('click', () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log('ログイン成功！:', userCredential.user);
    })
    .catch((error) => {
      alert('ログイン失敗…: ' + error.message);
    });
});

// ログアウト
logoutButton.addEventListener('click', () => {
  signOut(auth).then(() => {
    console.log('ログアウト成功！');
  }).catch((error) => {
    console.error('ログアウト失敗…:', error);
  });
});


// ----------------------------------------
// ④「門番」：ユーザーのログイン状態を監視する
// ----------------------------------------
onAuthStateChanged(auth, (user) => {
  if (user) {
    // ログインしている場合
    console.log(user.email + ' がログイン中');
    authContainer.style.display = 'none'; // 認証フォームを隠す
    appContainer.style.display = 'block'; // アプリ本体を表示する
    userEmailSpan.textContent = user.email;
  } else {
    // ログアウトしている場合
    console.log('誰もログインしていない');
    authContainer.style.display = 'block'; // 認証フォームを表示する
    appContainer.style.display = 'none'; // アプリ本体を隠す
  }
});