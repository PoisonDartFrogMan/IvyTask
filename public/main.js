alert("main.js が実行されました");
// ===== Firebase imports =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  initializeFirestore, // ★これが必須（getFirestore は不要）
  collection,
  addDoc,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  deleteDoc,
  updateDoc,
  orderBy,
  writeBatch,
  Timestamp,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ===== Firebase config =====
const firebaseConfig = {
  apiKey: "AIzaSyBeI8s103OiXXOpRpYc5WBwkJK1lFSzLwM",
  authDomain: "ivy-league-app-95a5d.firebaseapp.com",
  projectId: "ivy-league-app-95a5d",
  storageBucket: "ivy-league-app-95a5d.firebasestorage.app",
  messagingSenderId: "470602099850",
  appId: "1:470602099850:web:1ac19841730eb053341173",
  measurementId: "G-BE4QS8RP2G",
};


// ===== Initialize =====
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
  experimentalForceLongPolling: true,
  useFetchStreams: false
});
// iOS / Safari 対策：永続化方式を明示（トップレベル await 非対応端末向け）
(async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);
    console.log('Auth persistence set to browserLocalPersistence');
  } catch (e) {
    console.error('Auth persistence set failed:', e);
  }
})();

// ===== DOM =====
const authContainer = document.getElementById("auth-container");
const appContainer = document.getElementById("app-container");
const archiveContainer = document.getElementById("archive-container");
const userEmailSpan = document.getElementById("user-email");

const emailInput = document.getElementById("email-input");
const passwordInput = document.getElementById("password-input");
const signupButton = document.getElementById("signup-button");
const loginButton = document.getElementById("login-button");
// --- iOS タップ無反応デバッグ: ボタンを最前面 & クリック/タッチ両方で反応させる ---
if (loginButton) {
  // ほかの要素に覆われている可能性に備えて前面化
  loginButton.style.position = 'relative';
  loginButton.style.zIndex = '9999';
  loginButton.style.pointerEvents = 'auto';

  const debugTap = () => alert('ログインボタン: タップ/クリック検知');
  // iOS向けに touch 系も明示的にハンドリング
  loginButton.addEventListener('touchstart', debugTap, { passive: true });
  loginButton.addEventListener('touchend', debugTap,   { passive: true });
}
// ----------------------------------------------------------------------
const logoutButton = document.getElementById("logout-button");

const manageLabelsButton = document.getElementById("manage-labels-button");
const labelModalBackdrop = document.getElementById("label-modal-backdrop");
// 強制的に隠す（万一表示状態で残っていた場合の保険）
if (labelModalBackdrop) labelModalBackdrop.classList.add("hidden");
// ---- 一時診断: 最初の1回だけ、タップ/クリックが当たっている要素を可視化 ----
(function attachTapSpyOnce() {
  const once = (ev) => {
    try {
      let x = 0, y = 0, target = ev.target;
      if (ev.type.startsWith('touch') && ev.changedTouches && ev.changedTouches[0]) {
        x = ev.changedTouches[0].clientX;
        y = ev.changedTouches[0].clientY;
        const el = document.elementFromPoint(x, y);
        if (el) target = el;
      }
      const desc = `${target.tagName.toLowerCase()}#${target.id || ''}.${(target.className || '').toString().replace(/\s+/g,'.')}`;
      alert(`最初にヒットした要素: ${desc}`);
    } catch (e) {
      alert('tap-spy error: ' + e);
    } finally {
      document.removeEventListener('touchend', once, true);
      document.removeEventListener('click', once, true);
    }
  };
  document.addEventListener('touchend', once, true);
  document.addEventListener('click', once, true);
})();
// -------------------------------------------------------------------
const closeLabelModalButton = document.getElementById("close-label-modal-button");
const addLabelForm = document.getElementById("add-label-form");
const labelNameInput = document.getElementById("label-name-input");
const labelColorInput = document.getElementById("label-color-input");
const labelsList = document.getElementById("labels-list");

const todayList = document.getElementById("today-tasks");
const stockList = document.getElementById("stock-tasks");
const archiveList = document.getElementById("archive-tasks");

const resetDayButton = document.getElementById("reset-day-button");
const archiveViewButton = document.getElementById("archive-view-button");
const backToMainButton = document.getElementById("back-to-main-button");

const addButton = document.getElementById("add-task-button");
const taskInput = document.getElementById("new-task-input");
const dueDateInput = document.getElementById("due-date-input");
const colorPicker = document.getElementById("color-picker");
const selectedLabelName = document.getElementById("selected-label-name");

// ===== State =====
let currentUserId = null;
let labels = [];
let selectedLabelId = null;
let unsubscribeLabels = () => {};
// ▼▼ ここから追加：ラベルのプルダウンを組み立て＆全selectを再構築 ▼▼
function buildLabelOptions(selectEl, selectedLabelId) {
  // 既存のoptionをクリア
  selectEl.innerHTML = "";

  // 先頭に「ラベルなし」
  const none = document.createElement("option");
  none.value = "";
  none.textContent = "ラベルなし";
  selectEl.appendChild(none);

  // Firestoreから取得済みの labels 配列でoptionを作る
  labels.forEach(l => {
    const opt = document.createElement("option");
    opt.value = l.id;
    opt.textContent = l.name;
    selectEl.appendChild(opt);
  });

  // 現在の選択を維持
  selectEl.value = selectedLabelId || "";
}

// 画面上にある全てのラベル<select>を最新labelsで作り直す
function rebuildAllLabelDropdowns() {
  document.querySelectorAll('.label-select').forEach(sel => {
    const current = sel.value;                 // 現在選ばれている値を覚えておく
    buildLabelOptions(sel, current);           // 最新labelsで作り直す
  });
}
// ▲▲ ここまで追加 ▲▲
// ===== Auth =====
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUserId = user.uid;
    userEmailSpan.textContent = user.email;
    authContainer.classList.add("hidden");
    appContainer.classList.remove("hidden");
    archiveContainer.classList.add("hidden");

    if (unsubscribeLabels) unsubscribeLabels();
    unsubscribeLabels = subscribeLabels(currentUserId);

    await runDailyAutomation(currentUserId);
    await loadTasks(currentUserId);
  } else {
    currentUserId = null;
    authContainer.classList.remove("hidden");
    appContainer.classList.add("hidden");
    archiveContainer.classList.add("hidden");
    if (unsubscribeLabels) unsubscribeLabels();
  }
});

signupButton.addEventListener("click", () => {
  const email = emailInput.value.trim();
  const pw = passwordInput.value.trim();
  if (!email || !pw) return alert("メールアドレスとパスワードを入力してください。");
  createUserWithEmailAndPassword(auth, email, pw).catch((e) => alert("サインアップ失敗: " + e.message));
});
loginButton.addEventListener("click", async () => {
  alert("ログインボタン: ハンドラー起動"); // iPhoneでイベントが届いているか確認
  const email = emailInput.value.trim();
  const pw = passwordInput.value.trim();
  if (!email || !pw) return alert("メールアドレスとパスワードを入力してください。");
  try {
    await signInWithEmailAndPassword(auth, email, pw);
    alert("ログイン成功");
  } catch (e) {
    alert("ログイン失敗: " + (e && e.message ? e.message : e));
    console.error("signIn error:", e);
  }
});
logoutButton.addEventListener("click", () => signOut(auth));

// すべてのタスク行の <select class="label-select"> を labels で作り直す
function refreshAllTaskLabelSelects() {
  const selects = document.querySelectorAll('.label-select');
  selects.forEach(sel => {
    const keep = sel.dataset.labelId ?? sel.value ?? ""; // 現在の選択を保存
    sel.innerHTML = "";

    // 「ラベルなし」
    sel.appendChild(new Option("ラベルなし", "", keep === ""));

    // 現在の labels を全部入れる
    labels.forEach(l => {
      sel.appendChild(new Option(l.name, l.id, false, l.id === keep));
    });
  });
}

// 追加フォームの「選択中：◯◯」表記を最新にする
function refreshAddFormLabelName() {
  const name = labels.find(l => l.id === selectedLabelId)?.name ?? "ラベルなし";
  selectedLabelName.textContent = `選択中：${name}`;
}
async function hardRefreshLabelsUI() {
  // ラベル onSnapshot が走って DOM 更新が終わるのを 1 tick 待つ
  await new Promise(r => setTimeout(r, 0));
  // タスクを作り直す（各 <select> も再生成される）
  stockList.innerHTML = '';
  todayList.innerHTML = '';
  await loadTasks(currentUserId);
}
// ===== Labels =====
async function subscribeLabels(userId) {
  const labelsQuery = query(collection(db, "labels"), where("userId", "==", userId));
  return onSnapshot(labelsQuery, async (snapshot) => {
    labels = [];
    labelsList.innerHTML = "";
    snapshot.forEach((docSnap) => labels.push({ id: docSnap.id, ...docSnap.data() }));

    // モーダル表示
    labels.forEach(renderLabelRow);

    // カラーピッカー & 追加フォームの既定選択
    updateColorPicker();

    // 既存タスクのラベルセレクト更新
    refreshAllTaskLabelSelects();

    // 追加フォームの「選択中」表示更新
    refreshAddFormLabelName();

    // ラベル変更後にプルダウンも強制的に最新化
    await hardRefreshLabelsUI();
  });
}

function renderLabelRow(label) {
  const li = document.createElement("li");
  li.className = "label-item";
  li.dataset.id = label.id;

  const circle = document.createElement("div");
  circle.className = "label-color-circle";
  circle.style.backgroundColor = label.color;

  const name = document.createElement("input");
  name.className = "label-name-input";
  name.value = label.name;
  name.maxLength = 12;

  const saveBtn = document.createElement("button");
  saveBtn.className = "save-label-btn";
  saveBtn.textContent = "保存";

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-label-btn";
  deleteBtn.textContent = "削除";

  const colorInput = document.createElement("input");
  colorInput.type = "color";
  colorInput.value = label.color;
  colorInput.className = "label-row-color";

  li.appendChild(circle);
  li.appendChild(name);
  li.appendChild(colorInput);
  li.appendChild(saveBtn);
  li.appendChild(deleteBtn);
  labelsList.appendChild(li);

  colorInput.addEventListener("input", () => {
    circle.style.backgroundColor = colorInput.value;
  });

  saveBtn.addEventListener("click", async () => {
    const newName = name.value.trim();
    const newColor = colorInput.value;
    if (!newName) return alert("ラベル名を入力してください");
    await updateDoc(doc(db, "labels", label.id), { name: newName, color: newColor });
  });

  deleteBtn.addEventListener("click", async () => {
    if (!confirm(`「${label.name}」を削除しますか？\nこのラベルが設定されたタスクは「ラベルなし」になります。`)) return;
    // 依存タスクの labelId を null に
    const qTasks = query(collection(db, "tasks"), where("userId", "==", currentUserId), where("labelId", "==", label.id));
    const snap = await getDocs(qTasks);
    const batch = writeBatch(db);
    snap.forEach((d) => batch.update(d.ref, { labelId: null }));
    batch.delete(doc(db, "labels", label.id));
    await batch.commit();
  });
}

function updateColorPicker() {
  colorPicker.innerHTML = "";
  if (labels.length === 0) {
    selectedLabelId = null;
    selectedLabelName.textContent = "選択中：ラベルなし";
    colorPicker.innerHTML = `<p class="no-labels-message">ラベルがありません。「ラベルを編集」から作成してください。</p>`;
    return;
  }
  if (!labels.some(l => l.id === selectedLabelId)) {
    selectedLabelId = labels[0]?.id ?? null;
  }
  labels.forEach((l) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "color-choice";
    dot.style.backgroundColor = l.color;
    dot.dataset.labelId = l.id;
    dot.title = l.name;
    if (l.id === selectedLabelId) dot.classList.add("selected");
    colorPicker.appendChild(dot);
  });
  applySelectedLabelHint();
}

function applySelectedLabelHint() {
  const selected = labels.find(l => l.id === selectedLabelId);
  selectedLabelName.textContent = `選択中：${selected ? selected.name : "ラベルなし"}`;
}

colorPicker.addEventListener("click", (e) => {
  const btn = e.target.closest(".color-choice");
  if (!btn) return;
  selectedLabelId = btn.dataset.labelId || null;
  document.querySelectorAll(".color-choice").forEach(x => x.classList.remove("selected"));
  btn.classList.add("selected");
  applySelectedLabelHint();
});

manageLabelsButton.addEventListener("click", () => labelModalBackdrop.classList.remove("hidden"));
closeLabelModalButton.addEventListener("click", () => labelModalBackdrop.classList.add("hidden"));

addLabelForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = labelNameInput.value.trim();
  const color = labelColorInput.value;
  if (!name) return;
  if (!currentUserId) return;
  if (labels.some(l => l.name === name)) return alert("同じ名前のラベルが既に存在します。");
  await addDoc(collection(db, "labels"), {
    userId: currentUserId,
    name,
    color,
    createdAt: serverTimestamp(),
  });
  labelNameInput.value = "";
});

// ===== Tasks =====
async function loadTasks(userId) {
  todayList.innerHTML = "";
  stockList.innerHTML = "";

  const q = query(
    collection(db, "tasks"),
    where("userId", "==", userId),
    where("status", "in", ["stock", "today", "completed"])
  );
  const snap = await getDocs(q);
  const tasks = [];
  snap.forEach((d) => tasks.push({ id: d.id, ...d.data() }));

  tasks.sort((a, b) => {
    const order = { today: 1, completed: 2, stock: 3 };
    if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
    if (a.status === "stock") {
      const ad = a.dueDate, bd = b.dueDate;
      if (ad && !bd) return -1;
      if (!ad && bd) return 1;
      if (ad && bd) return ad.toMillis() - bd.toMillis();
    }
    return (a.priority ?? 0) - (b.priority ?? 0);
  });

  tasks.forEach((t) => renderTask(t.id, t));
  refreshAllTaskLabelSelects();
}

async function loadArchivedTasks(userId) {
  archiveList.innerHTML = "";
  const q = query(
    collection(db, "tasks"),
    where("userId", "==", userId),
    where("status", "==", "archived"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  snap.forEach((d) => renderTask(d.id, d.data(), true));
}

function renderTask(id, data, isArchived = false) {
  const li = document.createElement("li");
  li.dataset.id = id;
  if (data.status === "completed") li.classList.add("completed");

  // 左の色・背景
  const label = labels.find(l => l.id === data.labelId);
  li.style.borderLeftColor = label ? label.color : "#e0e0e0";
  if (label) li.style.backgroundColor = `${label.color}20`;

  // 内容
  const body = document.createElement("div");
  body.className = "task-content";
  const title = document.createElement("span");
  title.textContent = data.text ?? "";
  body.appendChild(title);
  if (data.dueDate) {
    const due = document.createElement("small");
    due.className = "due-date";
    due.textContent = `期日: ${data.dueDate.toDate().toLocaleDateString("ja-JP")}`;
    body.appendChild(due);
  }

  li.appendChild(body);

  // ラベル選択（アーカイブ以外）
  if (!isArchived) {
    const sel = document.createElement("select");
    sel.className = "label-select";
    sel.dataset.taskId = id;
    sel.dataset.labelId = data.labelId ?? "";
    li.appendChild(sel);
    buildLabelOptions(sel, sel.dataset.labelId);
  }

  // ボタン群
  const btns = document.createElement("div");
  btns.className = "task-buttons";
  if (isArchived) {
    btns.appendChild(btn("ストックへ戻す", "unarchive-btn"));
  } else {
    if (data.status === "stock") btns.appendChild(btn("Focus", "move-btn"));
    if (data.status === "today") {
      btns.appendChild(btn("完了", "complete-btn"));
      btns.appendChild(btn("ストックへ", "move-to-stock-btn"));
    }
  }
  btns.appendChild(iconBtn("trash-icon.png", "delete-btn"));
  li.appendChild(btns);

  // 追加
  if (isArchived) archiveList.appendChild(li);
  else if (data.status === "today" || data.status === "completed") todayList.appendChild(li);
  else stockList.appendChild(li);
}

function btn(text, cls) {
  const b = document.createElement("button");
  b.textContent = text;
  b.className = cls;
  return b;
}
function iconBtn(src, cls) {
  const b = document.createElement("button");
  b.className = cls;
  const img = document.createElement("img");
  img.src = "trash-icon.png";
  img.alt = "delete";
  b.appendChild(img);
  return b;
}


function getTaskLabelIdFromRow(li) {
  // 背景色からは取らない。Firestoreを再取得しない簡易手段としてdatasetに持たせていないので null でもOK
  return null;
}

// クリック委譲（ボタン類 / dueDate編集 / ラベル変更）
document.body.addEventListener("click", async (e) => {
  // カード内の due 日付クリック → date入力
  if (e.target.classList.contains("due-date")) {
    const li = e.target.closest("li");
    if (!li) return;
    const taskId = li.dataset.id;
    const ref = doc(db, "tasks", taskId);

    const input = document.createElement("input");
    input.type = "date";
    const snap = await getDoc(ref);
    if (snap.exists() && snap.data().dueDate) {
      const dt = snap.data().dueDate.toDate();
      input.value = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
    }
    e.target.replaceWith(input);
    input.focus();
    const save = async () => {
      if (input.value) {
        await updateDoc(ref, { dueDate: Timestamp.fromDate(new Date(input.value)) });
      }
      await loadTasks(currentUserId);
    };
    input.addEventListener("blur", save);
    input.addEventListener("keydown", (ev) => ev.key === "Enter" && input.blur());
    return;
  }

  // タスク操作ボタン
  const li = e.target.closest("li");
  if (!li || !li.dataset.id) return;
  const taskId = li.dataset.id;
  const ref = doc(db, "tasks", taskId);

  if (e.target.closest(".delete-btn")) {
    if (confirm("このタスクを完全に削除しますか？")) {
      await deleteDoc(ref);
      li.remove();
    }
    return;
  }
  if (e.target.closest(".move-btn")) {
    if (todayList.children.length >= 6) return alert("「Focalist」は6つまでです。");
    await updateDoc(ref, { status: "today", priority: todayList.children.length });
    await loadTasks(currentUserId);
    return;
  }
  if (e.target.closest(".complete-btn")) {
    await updateDoc(ref, { status: "completed" });
    await loadTasks(currentUserId);
    return;
  }
  if (e.target.closest(".move-to-stock-btn")) {
    await updateDoc(ref, { status: "stock", priority: Date.now() });
    await loadTasks(currentUserId);
    return;
  }
  if (e.target.closest(".unarchive-btn")) {
    await updateDoc(ref, { status: "stock", priority: Date.now() });
    await loadArchivedTasks(currentUserId);
    return;
  }
});

// ラベル変更（change）
document.body.addEventListener("change", async (e) => {
  const sel = e.target.closest("select.label-select");
  if (!sel) return;
  const li = sel.closest("li");
  if (!li) return;
  const taskId = li.dataset.id;
  const ref = doc(db, "tasks", taskId);
  const newLabelId = sel.value || null;
  await updateDoc(ref, { labelId: newLabelId });
  sel.dataset.labelId = newLabelId || "";
  // 見た目の色も更新
  const label = labels.find(l => l.id === newLabelId);
  li.style.borderLeftColor = label ? label.color : "#e0e0e0";
  li.style.backgroundColor = label ? `${label.color}20` : "transparent";
});

// 追加
addButton.addEventListener("click", async () => {
  const text = taskInput.value.trim();
  const due = dueDateInput.value;
  if (!text || !currentUserId) return;

  const payload = {
    userId: currentUserId,
    text,
    status: "stock",
    priority: Date.now(),
    createdAt: serverTimestamp(),
    labelId: selectedLabelId ?? null,
  };
  if (due) payload.dueDate = Timestamp.fromDate(new Date(due));

  await addDoc(collection(db, "tasks"), payload);
  taskInput.value = "";
  dueDateInput.value = "";
  await loadTasks(currentUserId);
});

// Reset
resetDayButton.addEventListener("click", async () => {
  if (!currentUserId) return;
  if (!confirm("Resetしますか？\n完了したタスクはアーカイブされ、未完了のFocalistはストックに戻ります。")) return;
  const q = query(collection(db, "tasks"), where("userId", "==", currentUserId), where("status", "in", ["today", "completed"]));
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  snap.forEach((d) => {
    const t = d.data();
    if (t.status === "completed") batch.update(d.ref, { status: "archived" });
    else if (t.status === "today") batch.update(d.ref, { status: "stock", priority: Date.now() });
  });
  await batch.commit();
  await loadTasks(currentUserId);
});

// アーカイブ切替
archiveViewButton.addEventListener("click", async () => {
  appContainer.classList.add("hidden");
  archiveContainer.classList.remove("hidden");
  await loadArchivedTasks(currentUserId);
});
backToMainButton.addEventListener("click", async () => {
  archiveContainer.classList.add("hidden");
  appContainer.classList.remove("hidden");
  await loadTasks(currentUserId);
});

// 日次オート（明日が期日のストック→今日へ）
async function runDailyAutomation(userId) {
  const q = query(collection(db, "tasks"), where("userId", "==", userId), where("status", "in", ["stock", "today"]));
  const snap = await getDocs(q);
  const all = [];
  snap.forEach((d) => all.push({ ref: d.ref, ...d.data() }));

  let todayCount = all.filter(t => t.status === "today").length;
  const stocks = all.filter(t => t.status === "stock");

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  today.setHours(0, 0, 0, 0);
  tomorrow.setHours(0, 0, 0, 0);

  const toMove = [];
  const blocked = [];
  for (const t of stocks) {
    if (t.dueDate) {
      const d = t.dueDate.toDate();
      d.setHours(0, 0, 0, 0);
      if (d.getTime() === tomorrow.getTime()) {
        if (todayCount < 6) {
          toMove.push(t.ref);
          todayCount++;
        } else {
          blocked.push(t.text);
        }
      }
    }
  }
  if (toMove.length) {
    const batch = writeBatch(db);
    toMove.forEach((r, i) => batch.update(r, { status: "today", priority: todayCount + i }));
    await batch.commit();
  }
  if (blocked.length) {
    alert(`以下のタスクは期日が明日ですが、「Focalist」が満杯のため移動できませんでした：\n\n- ${blocked.join("\n- ")}`);
  }
}