import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, onAuthStateChanged, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signOut, setPersistence, indexedDBLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  initializeFirestore, collection, addDoc, query, where, getDocs,
  getDoc, doc, deleteDoc, updateDoc, orderBy, writeBatch,
  Timestamp, onSnapshot, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ===== Firebase config & Initialize =====
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
// <<< 修正: iOSログイン問題を解決したFirestore初期化 >>>
const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
  useFetchStreams: false,
});
// <<< 修正: 永続化設定を改善 >>>
setPersistence(auth, indexedDBLocalPersistence).catch(console.error);


// ===== DOM Elements =====
const authContainer = document.getElementById('auth-container');
const mainContainer = document.getElementById('app-container');
const archiveContainer = document.getElementById('archive-container');
const userEmailSpan = document.getElementById('user-email');

const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const signupButton = document.getElementById('signup-button');
const loginButton = document.getElementById('login-button');
const logoutButton = document.getElementById('logout-button');

const addButton = document.getElementById('add-task-button');
const taskInput = document.getElementById('new-task-input');
const dueDateInput = document.getElementById('due-date-input');
const colorPicker = document.getElementById('color-picker');
const selectedLabelHint = document.getElementById('selected-label-hint');

const stockList = document.getElementById('stock-tasks');
const todayList = document.getElementById('today-tasks');
const archiveList = document.getElementById('archive-tasks');

const resetDayButton = document.getElementById('reset-day-button');
const archiveViewButton = document.getElementById('archive-view-button');
const backToMainButton = document.getElementById('back-to-main-button');

const manageLabelsButton = document.getElementById('manage-labels-button');
const labelModalBackdrop = document.getElementById('label-modal-backdrop');
const closeLabelModalButton = document.getElementById('close-label-modal-button');
const addLabelForm = document.getElementById('add-label-form');
const labelNameInput = document.getElementById('label-name-input');
const labelColorInput = document.getElementById('label-color-input');
const labelsList = document.getElementById('labels-list');


// ===== Global State =====
let currentUserId = null;
let selectedLabelId = null;
let labels = [];
let unsubscribeLabels = () => {};


// ===== Auth State Change (Top Level Controller) =====
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUserId = user.uid;
    authContainer.style.display = 'none';
    mainContainer.style.display = 'block';
    userEmailSpan.textContent = user.email;

    if (unsubscribeLabels) unsubscribeLabels();
    unsubscribeLabels = loadLabels(currentUserId);

    await runDailyAutomation(currentUserId);
    loadTasks(currentUserId);
    activateDragAndDrop();
  } else {
    currentUserId = null;
    authContainer.style.display = 'block';
    mainContainer.style.display = 'none';
    archiveContainer.style.display = 'none';
    if (unsubscribeLabels) unsubscribeLabels();
  }
});


// ===== Labels Functions (移植) =====
function loadLabels(userId) {
  const labelsQuery = query(collection(db, "labels"), where("userId", "==", userId));
  return onSnapshot(labelsQuery, (snapshot) => {
    labelsList.innerHTML = '';
    labels = [];
    snapshot.forEach(docSnap => {
      const label = { id: docSnap.id, ...docSnap.data() };
      labels.push(label);
      renderLabelInModal(label);
    });
    updateColorPicker();
    updateSelectedLabelHint();
  });
}

function renderLabelInModal(label) {
  const li = document.createElement('li');
  li.className = 'label-item';
  li.dataset.id = label.id;

  const colorCircle = document.createElement('div');
  colorCircle.className = 'label-color-circle';
  colorCircle.style.backgroundColor = label.color;

  const nameSpan = document.createElement('span');
  nameSpan.className = 'label-name';
  nameSpan.textContent = label.name;

  const input = document.createElement('input');
  input.type = 'text';
  input.value = label.name;
  input.maxLength = 12;
  input.className = 'hidden';

  const editBtn = createButton('編集', 'edit-label-btn');
  const saveBtn = createButton('保存', 'save-label-btn hidden');
  const cancelBtn = createButton('取消', 'cancel-label-btn hidden');
  const deleteBtn = createButton('削除', 'delete-label-btn');

  li.append(colorCircle, nameSpan, input, editBtn, saveBtn, cancelBtn, deleteBtn);
  labelsList.appendChild(li);
}

function updateColorPicker() {
  colorPicker.innerHTML = '';
  if (labels.length === 0) {
    colorPicker.innerHTML = '<p class="no-labels-message">ラベルがありません。「ラベルを編集」から作成してください。</p>';
    selectedLabelId = null;
    return;
  }
  labels.forEach(label => {
    const choice = document.createElement('div');
    choice.className = 'color-choice';
    choice.dataset.labelId = label.id;
    choice.style.backgroundColor = label.color;
    choice.title = label.name;
    colorPicker.appendChild(choice);
  });

  if (!labels.some(l => l.id === selectedLabelId) && labels.length > 0) {
    selectedLabelId = labels[0].id;
  }
  colorPicker.querySelectorAll('.color-choice').forEach(el => el.classList.remove('selected'));
  const sel = colorPicker.querySelector(`[data-label-id="${selectedLabelId}"]`);
  if (sel) sel.classList.add('selected');
}

function updateSelectedLabelHint() {
  const lbl = labels.find(l => l.id === selectedLabelId);
  selectedLabelHint.textContent = lbl ? `選択中：${lbl.name}` : '';
}


// ===== Tasks Functions (移植) =====
async function loadTasks(userId) {
  stockList.innerHTML = '';
  todayList.innerHTML = '';

  const q = query(collection(db, "tasks"),
    where("userId", "==", userId),
    where("status", "in", ["stock", "today", "completed"])
  );
  const snap = await getDocs(q);
  const tasks = [];
  snap.forEach(d => tasks.push({ id: d.id, ...d.data() }));

  tasks.sort((a, b) => {
    if (a.status === 'stock' && b.status === 'stock') {
      const ad = a.dueDate, bd = b.dueDate;
      if (ad && !bd) return -1;
      if (!ad && bd) return 1;
      if (ad && bd) return ad.toMillis() - bd.toMillis();
    }
    const order = { today: 1, completed: 2, stock: 3 };
    if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
    return (a.priority || 0) - (b.priority || 0);
  });

  tasks.forEach(t => renderTask(t.id, t));
}

async function loadArchivedTasks(userId) {
  archiveList.innerHTML = '';
  const q = query(collection(db, "tasks"),
    where("userId", "==", userId),
    where("status", "==", "archived"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  snap.forEach(d => renderTask(d.id, d.data(), true));
}

function renderTask(id, data, isArchived = false) {
  const li = document.createElement('li');
  li.dataset.id = id;
  if (data.status === 'completed') li.classList.add('completed');

  const label = labels.find(l => l.id === data.labelId);
  li.style.borderLeftColor = label ? label.color : '#e0e0e0';
  li.style.backgroundColor = label ? `${label.color}20` : '';

  const content = document.createElement('div');
  content.className = 'task-content';
  const title = document.createElement('span');
  title.textContent = data.text;
  content.appendChild(title);

  if (data.dueDate) {
    const due = document.createElement('small');
    due.className = 'due-date';
    due.textContent = `期日: ${data.dueDate.toDate().toLocaleDateString('ja-JP')}`;
    content.appendChild(due);
  }
  li.appendChild(content);

  const buttons = document.createElement('div');
  buttons.className = 'task-buttons';

  if (!isArchived) {
    const select = document.createElement('select');
    select.className = 'label-select';
    const optNone = document.createElement('option');
    optNone.value = '';
    optNone.textContent = 'ラベルなし';
    select.appendChild(optNone);

    labels.forEach(l => {
      const o = document.createElement('option');
      o.value = l.id; o.textContent = l.name;
      if (l.id === data.labelId) o.selected = true;
      select.appendChild(o);
    });
    select.addEventListener('change', async () => {
      const newId = select.value || null;
      await updateDoc(doc(db, "tasks", id), { labelId: newId });
      const lbl = labels.find(l => l.id === newId);
      li.style.borderLeftColor = lbl ? lbl.color : '#e0e0e0';
      li.style.backgroundColor = lbl ? `${lbl.color}20` : '';
    });
    buttons.appendChild(select);
  }

  if (isArchived) {
    buttons.appendChild(createButton('ストックへ戻す', 'unarchive-btn'));
  } else {
    if (data.status === 'stock') buttons.appendChild(createButton('Focus', 'move-btn'));
    if (data.status === 'today') {
      buttons.appendChild(createButton('完了', 'complete-btn'));
      buttons.appendChild(createButton('ストックへ', 'move-to-stock-btn'));
    }
  }
  buttons.appendChild(createIconButton('trash-icon.png', 'delete-btn'));
  li.appendChild(buttons);

  if (isArchived) archiveList.appendChild(li);
  else if (data.status === 'today' || data.status === 'completed') todayList.appendChild(li);
  else stockList.appendChild(li);
}


// ===== Helper Functions (移植) =====
function createButton(text, className) {
  const b = document.createElement('button'); b.textContent = text; b.className = className; return b;
}
function createIconButton(src, className) {
  const b = document.createElement('button'); b.className = className;
  const i = document.createElement('img'); i.src = src; i.alt = className;
  b.appendChild(i); return b;
}


// ===== Drag & Drop and Automation (移植) =====
function activateDragAndDrop() {
  new Sortable(todayList, {
    animation: 150,
    onEnd: async (evt) => {
      const items = evt.to.children;
      const batch = writeBatch(db);
      Array.from(items).forEach((item, idx) => {
        if (item.dataset.id) {
          batch.update(doc(db, "tasks", item.dataset.id), { priority: idx });
        }
      });
      await batch.commit();
    }
  });
}

async function runDailyAutomation(userId) {
  const allTasksQuery = query(collection(db, "tasks"), where("userId", "==", userId), where("status", "in", ["stock", "today"]));
  const snap = await getDocs(allTasksQuery);
  let all = []; snap.forEach(d => all.push({ ref: d.ref, ...d.data() }));
  let todayCount = all.filter(t => t.status === 'today').length;
  const stocks = all.filter(t => t.status === 'stock');

  const today = new Date(), tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  today.setHours(0, 0, 0, 0); tomorrow.setHours(0, 0, 0, 0);

  const toMove = [], blocked = [];
  stocks.forEach(t => {
    if (t.dueDate) {
      const dd = t.dueDate.toDate(); dd.setHours(0, 0, 0, 0);
      if (dd.getTime() === tomorrow.getTime()) {
        if (todayCount < 6) { toMove.push(t.ref); todayCount++; }
        else { blocked.push(t.text); }
      }
    }
  });
  if (toMove.length > 0) {
    const batch = writeBatch(db);
    toMove.forEach((ref, i) => batch.update(ref, { status: 'today', priority: todayCount + i }));
    await batch.commit();
  }
  if (blocked.length > 0) {
    alert(`以下のタスクは、期日が明日ですが、「Focalist」が満杯のため移動できませんでした：\n\n- ${blocked.join('\n- ')}`);
  }
}


// ===== Event Listeners =====
// Auth buttons
signupButton.addEventListener('click', () => {
  const email = emailInput.value, password = passwordInput.value;
  if (!email || !password) return alert("メールアドレスとパスワードを入力してください。");
  createUserWithEmailAndPassword(auth, email, password).catch(err => alert('サインアップ失敗: ' + err.message));
});
loginButton.addEventListener('click', () => {
  const email = emailInput.value, password = passwordInput.value;
  if (!email || !password) return alert("メールアドレスとパスワードを入力してください。");
  signInWithEmailAndPassword(auth, email, password).catch(err => alert('ログイン失敗: ' + err.message));
});
logoutButton.addEventListener('click', () => signOut(auth));

// New Task Add Button
addButton.addEventListener('click', async () => {
  const text = taskInput.value.trim();
  const due = dueDateInput.value;
  if (text === '' || !currentUserId) return;
  if (!selectedLabelId && labels.length > 0) selectedLabelId = labels[0].id;

  const data = {
    userId: currentUserId, text, status: 'stock',
    priority: Date.now(), createdAt: serverTimestamp(),
    labelId: selectedLabelId || null
  };
  if (due) { data.dueDate = Timestamp.fromDate(new Date(due)); }

  await addDoc(collection(db, "tasks"), data);
  loadTasks(currentUserId);
  taskInput.value = ''; dueDateInput.value = '';
});

// Main controls
resetDayButton.addEventListener('click', async () => {
  if (!currentUserId || !confirm("Resetしますか？\n完了したタスクはアーカイブされ、未完了のFocalistはストックに戻ります。")) return;
  const q = query(collection(db, "tasks"), where("userId", "==", currentUserId), where("status", "in", ["today", "completed"]));
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  snap.forEach(d => {
    const t = d.data();
    if (t.status === 'completed') batch.update(d.ref, { status: 'archived' });
    else if (t.status === 'today') batch.update(d.ref, { status: 'stock', priority: Date.now() });
  });
  await batch.commit();
  loadTasks(currentUserId);
});
archiveViewButton.addEventListener('click', () => {
  mainContainer.style.display = 'none';
  archiveContainer.style.display = 'block';
  loadArchivedTasks(currentUserId);
});
backToMainButton.addEventListener('click', () => {
  archiveContainer.style.display = 'none';
  mainContainer.style.display = 'block';
  loadTasks(currentUserId);
});

// Label Modal Controls
manageLabelsButton.addEventListener('click', () => labelModalBackdrop.classList.remove('hidden'));
closeLabelModalButton.addEventListener('click', () => labelModalBackdrop.classList.add('hidden'));

addLabelForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = labelNameInput.value.trim();
  const color = labelColorInput.value;
  if (!name || !currentUserId) return;
  if (labels.some(l => l.name === name)) return alert('同じ名前のラベルは既に存在します。');
  await addDoc(collection(db, "labels"), { userId: currentUserId, name, color, createdAt: serverTimestamp() });
  labelNameInput.value = '';
});

// Delegated Event Listener for dynamic elements
document.body.addEventListener('click', async (event) => {
    const target = event.target;

    // カラー選択
    const colorChoice = target.closest('.color-choice');
    if (colorChoice) {
      selectedLabelId = colorChoice.dataset.labelId;
      updateColorPicker();
      updateSelectedLabelHint();
      return;
    }

    // 期日インライン編集
    if (target.classList.contains('due-date')) {
      const li = target.closest('li'); if (!li) return;
      const taskId = li.dataset.id; const ref = doc(db, "tasks", taskId);
      const span = target;
      const input = document.createElement('input');
      input.type = 'date';
      try {
        const d = await getDoc(ref);
        if (d.exists() && d.data().dueDate) {
          const dt = d.data().dueDate.toDate();
          input.value = dt.toISOString().split('T')[0];
        }
      } catch (e) { console.error(e); }
      span.replaceWith(input); input.focus();
      const save = async () => {
        if (input.value) await updateDoc(ref, { dueDate: Timestamp.fromDate(new Date(input.value)) });
        loadTasks(currentUserId);
      };
      input.addEventListener('blur', save);
      input.addEventListener('keydown', e => { if (e.key === 'Enter') input.blur(); });
      return;
    }

    // ラベル編集モード切替
    const labelRow = target.closest('.label-item');
    if(labelRow){
        const id = labelRow.dataset.id;
        const nameSpan = labelRow.querySelector('.label-name');
        const input = labelRow.querySelector('input[type="text"]');

        if(target.classList.contains('edit-label-btn')){
            labelRow.querySelectorAll('.label-name, .edit-label-btn').forEach(el=>el.classList.add('hidden'));
            labelRow.querySelectorAll('input[type="text"], .save-label-btn, .cancel-label-btn').forEach(el=>el.classList.remove('hidden'));
            return;
        }
        if(target.classList.contains('cancel-label-btn')){
            input.value = nameSpan.textContent;
            labelRow.querySelectorAll('.label-name, .edit-label-btn').forEach(el=>el.classList.remove('hidden'));
            labelRow.querySelectorAll('input[type="text"], .save-label-btn, .cancel-label-btn').forEach(el=>el.classList.add('hidden'));
            return;
        }
        if(target.classList.contains('save-label-btn')){
            const newName = input.value.trim();
            if(!newName) return alert('ラベル名を入力してください。');
            if(labels.some(l=>l.name===newName && l.id!==id)) return alert('同名のラベルが存在します。');
            await updateDoc(doc(db, "labels", id), { name: newName });
            return; // onSnapshotがUIを更新
        }
        if(target.classList.contains('delete-label-btn')){
            const labelObj = labels.find(l => l.id === id);
            if (!confirm(`ラベル「${labelObj?.name || ''}」を削除しますか？\n関連するタスクのラベルは解除されます。`)) return;
            const qTasks = query(collection(db, "tasks"), where("userId", "==", currentUserId), where("labelId", "==", id));
            const snap = await getDocs(qTasks);
            const batch = writeBatch(db);
            snap.forEach(d => batch.update(doc(db, "tasks", d.id), { labelId: null }));
            batch.delete(doc(db, "labels", id));
            await batch.commit();
            if (selectedLabelId === id) selectedLabelId = null;
            loadTasks(currentUserId);
            return;
        }
    }

    // 既存タスクの各種操作
    const taskItem = target.closest('li[data-id]');
    if (taskItem) {
        const taskId = taskItem.dataset.id;
        const taskDocRef = doc(db, "tasks", taskId);
        let needsReload = false, archiveReload = false;

        if (target.closest('.delete-btn')) {
            if (confirm('このタスクを完全に削除しますか？')) {
                await deleteDoc(taskDocRef);
                taskItem.remove();
            }
        } else if (target.closest('.move-btn')) {
            if (todayList.children.length < 6) {
                await updateDoc(taskDocRef, { status: 'today', priority: todayList.children.length });
                needsReload = true;
            } else alert('「Focalist」は6つまでです。');
        } else if (target.closest('.complete-btn')) {
            await updateDoc(taskDocRef, { status: 'completed' });
            needsReload = true;
        } else if (target.closest('.move-to-stock-btn')) {
            await updateDoc(taskDocRef, { status: 'stock', priority: Date.now() });
            needsReload = true;
        } else if (target.closest('.unarchive-btn')) {
            await updateDoc(taskDocRef, { status: 'stock', priority: Date.now() });
            archiveReload = true;
        }

        if (needsReload) loadTasks(currentUserId);
        if (archiveReload) loadArchivedTasks(currentUserId);
    }
});