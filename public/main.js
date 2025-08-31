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
const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
  useFetchStreams: false,
});
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
const titleInput = document.getElementById('new-task-title-input');
const memoInput = document.getElementById('new-task-memo-input');
const dueDateInput = document.getElementById('due-date-input');
const colorPicker = document.getElementById('color-picker');
const selectedLabelHint = document.getElementById('selected-label-hint');

const stockList = document.getElementById('stock-tasks');
const todayList = document.getElementById('today-tasks');
const archiveList = document.getElementById('archive-tasks');

const reloadButton = document.getElementById('reload-button');
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

const taskDetailModalBackdrop = document.getElementById('task-detail-modal-backdrop');
const modalTaskTitle = document.getElementById('modal-task-title');
const modalTaskMemo = document.getElementById('modal-task-memo');
const closeTaskDetailModalButton = document.getElementById('close-task-detail-modal-button');
const modalViewMode = taskDetailModalBackdrop.querySelector('.view-mode');
const modalEditMode = taskDetailModalBackdrop.querySelector('.edit-mode');
const modalEditTitleInput = document.getElementById('modal-edit-title-input');
const modalEditMemoInput = document.getElementById('modal-edit-memo-input');
const editTaskButton = document.getElementById('edit-task-button');
const saveTaskButton = document.getElementById('save-task-button');
const cancelEditButton = document.getElementById('cancel-edit-button');


// ===== Global State =====
let currentUserId = null;
let selectedLabelId = null;
let labels = [];
let unsubscribeLabels = () => {};
let currentlyEditingTaskId = null;


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


// ===== Labels Functions =====
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


// ===== Tasks Functions (renderTask内のアイコン部分のみ変更) =====
async function loadTasks(userId) {
  stockList.innerHTML = '';
  todayList.innerHTML = '';
  const q = query(collection(db, "tasks"), where("userId", "==", userId), where("status", "in", ["stock", "today", "completed"]));
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
  const q = query(collection(db, "tasks"), where("userId", "==", userId), where("status", "==", "archived"), orderBy("createdAt", "desc"));
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
  title.textContent = data.title || data.text;
  content.appendChild(title);

  if (data.dueDate) {
    const due = document.createElement('small');
    due.className = 'due-date';
    due.textContent = `期日: ${data.dueDate.toDate().toLocaleDateString('ja-JP')}`;
    content.appendChild(due);
  }
  li.appendChild(content);

  content.addEventListener('click', () => {
    currentlyEditingTaskId = id;
    modalTaskTitle.textContent = data.title || data.text;
    modalTaskMemo.textContent = data.memo || '(メモはありません)';
    switchToViewMode();
    taskDetailModalBackdrop.classList.remove('hidden');
  });

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
      await updateDoc(doc(db, "tasks", id), { labelId: select.value || null });
      const newLabel = labels.find(l => l.id === (select.value || null));
      li.style.borderLeftColor = newLabel ? newLabel.color : '#e0e0e0';
      li.style.backgroundColor = newLabel ? `${newLabel.color}20` : '';
    });
    buttons.appendChild(select);
  }

  const actionsContainer = document.createElement('div');
  actionsContainer.className = 'task-actions-container';

  const menuButton = document.createElement('button');
  menuButton.className = 'actions-button';
  // <<< 変更点: アイコンを三点リーダーから下向き三角に変更 >>>
  menuButton.innerHTML = '&#9662;';
  actionsContainer.appendChild(menuButton);

  const dropdown = document.createElement('div');
  dropdown.className = 'actions-dropdown';

  const taskActions = [];
  if (isArchived) {
    taskActions.push({ text: 'ストックへ戻す', status: 'stock', priority: Date.now() });
  } else {
    if (data.status === 'stock') {
      taskActions.push({ text: 'Focus', status: 'today', priority: todayList.children.length });
    }
    if (data.status === 'today') {
      taskActions.push({ text: '完了', status: 'completed' });
      taskActions.push({ text: 'ストックへ', status: 'stock', priority: Date.now() });
    }
  }
  taskActions.push({ text: '削除', action: 'delete' });

  taskActions.forEach(action => {
    const item = document.createElement('div');
    item.className = 'dropdown-item';
    item.textContent = action.text;
    item.addEventListener('click', async () => {
      if (action.action === 'delete') {
        if (confirm('このタスクを完全に削除しますか？')) {
          await deleteDoc(doc(db, "tasks", id));
          loadTasks(currentUserId);
        }
      } else {
        if (action.status === 'today' && todayList.children.length >= 6) {
            alert('「Focalist」は6つまでです。');
        } else {
            const updateData = { status: action.status };
            if (action.priority !== undefined) {
                updateData.priority = action.priority;
            }
            await updateDoc(doc(db, "tasks", id), updateData);
            loadTasks(currentUserId);
        }
      }
      dropdown.classList.remove('visible');
    });
    dropdown.appendChild(item);
  });

  actionsContainer.appendChild(dropdown);
  buttons.appendChild(actionsContainer);
  li.appendChild(buttons);

  menuButton.addEventListener('click', (e) => {
    e.stopPropagation();
    closeAllDropdowns();
    dropdown.classList.toggle('visible');
  });

  if (isArchived) archiveList.appendChild(li);
  else if (data.status === 'today' || data.status === 'completed') todayList.appendChild(li);
  else stockList.appendChild(li);
}

// ===== Helper Functions =====
function createButton(text, className) {
  const b = document.createElement('button'); b.textContent = text; b.className = className; return b;
}
function createIconButton(src, className) {
  const b = document.createElement('button'); b.className = className;
  const i = document.createElement('img'); i.src = src; i.alt = className;
  b.appendChild(i); return b;
}


// ===== Drag & Drop and Automation =====
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
        else { blocked.push(t.title || t.text); }
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

addButton.addEventListener('click', async () => {
  const title = titleInput.value.trim();
  const memo = memoInput.value.trim();
  const due = dueDateInput.value;
  if (title === '' || !currentUserId) return;
  if (!selectedLabelId && labels.length > 0) selectedLabelId = labels[0].id;
  const data = {
    userId: currentUserId, title, memo, status: 'stock',
    priority: Date.now(), createdAt: serverTimestamp(),
    labelId: selectedLabelId || null
  };
  if (due) { data.dueDate = Timestamp.fromDate(new Date(due)); }
  await addDoc(collection(db, "tasks"), data);
  loadTasks(currentUserId);
  titleInput.value = '';
  memoInput.value = '';
  dueDateInput.value = '';
});

reloadButton.addEventListener('click', () => { location.reload(true); });
resetDayButton.addEventListener('click', async () => {
  if (!currentUserId || !confirm("Resetしますか？\n完了タスクはアーカイブされ、未完了のFocalistはストックに戻ります。")) return;
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

editTaskButton.addEventListener('click', () => {
  modalEditTitleInput.value = modalTaskTitle.textContent;
  modalEditMemoInput.value = modalTaskMemo.textContent === '(メモはありません)' ? '' : modalTaskMemo.textContent;
  switchToEditMode();
});
saveTaskButton.addEventListener('click', async () => {
  if (!currentlyEditingTaskId) return;
  const newTitle = modalEditTitleInput.value.trim();
  if (!newTitle) return alert('タイトルは必須です。');
  const newMemo = modalEditMemoInput.value.trim();
  const taskDocRef = doc(db, "tasks", currentlyEditingTaskId);
  await updateDoc(taskDocRef, { title: newTitle, memo: newMemo });
  taskDetailModalBackdrop.classList.add('hidden');
  loadTasks(currentUserId);
});
cancelEditButton.addEventListener('click', () => { switchToViewMode(); });
closeTaskDetailModalButton.addEventListener('click', () => { taskDetailModalBackdrop.classList.add('hidden'); });
taskDetailModalBackdrop.addEventListener('click', (event) => {
    if (event.target === taskDetailModalBackdrop) {
        taskDetailModalBackdrop.classList.add('hidden');
    }
});
function switchToViewMode() {
    modalViewMode.classList.remove('hidden');
    editTaskButton.classList.remove('hidden');
    modalEditMode.classList.add('hidden');
    saveTaskButton.classList.add('hidden');
    cancelEditButton.classList.add('hidden');
}
function switchToEditMode() {
    modalViewMode.classList.add('hidden');
    editTaskButton.classList.add('hidden');
    modalEditMode.classList.remove('hidden');
    saveTaskButton.classList.remove('hidden');
    cancelEditButton.classList.remove('hidden');
}

document.addEventListener('click', () => {
    closeAllDropdowns();
});
function closeAllDropdowns() {
    document.querySelectorAll('.actions-dropdown.visible').forEach(dropdown => {
        dropdown.classList.remove('visible');
    });
}

document.body.addEventListener('click', async (event) => {
    const target = event.target;
    const colorChoice = target.closest('.color-choice');
    if (colorChoice) {
      selectedLabelId = colorChoice.dataset.labelId;
      updateColorPicker();
      updateSelectedLabelHint();
      return;
    }
    if (target.classList.contains('due-date')) {
      const li = target.closest('li'); if (!li) return;
      const taskId = li.dataset.id; const ref = doc(db, "tasks", taskId);
      const span = target;
      const input = document.createElement('input');
      input.type = 'date';
      try {
        const d = await getDoc(ref);
        if (d.exists() && d.data().dueDate) {
          input.value = d.data().dueDate.toDate().toISOString().split('T')[0];
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
            return;
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
    const taskItem = target.closest('li[data-id]');
    if (taskItem) {
        if (!target.closest('.task-content') && !target.closest('.actions-button')) {
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
    }
});