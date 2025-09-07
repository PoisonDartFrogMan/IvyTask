import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, onAuthStateChanged, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signOut, setPersistence, indexedDBLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  initializeFirestore, collection, addDoc, query, where, getDocs,
  getDoc, doc, deleteDoc, updateDoc, orderBy, writeBatch,
  Timestamp, onSnapshot, serverTimestamp, setDoc
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
const settingsButton = document.getElementById('settings-button');
const settingsModalBackdrop = document.getElementById('settings-modal-backdrop');
const closeSettingsModalButton = document.getElementById('close-settings-modal-button');
const wallpaperChoices = document.getElementById('wallpaper-choices');
const settingsUserIdSpan = document.getElementById('settings-user-id');
const logoutButtonModal = document.getElementById('logout-button-modal');

const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const signupButton = document.getElementById('signup-button');
const loginButton = document.getElementById('login-button');

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
const labelColorPalette = document.getElementById('label-color-palette');
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


// ===== Global State & Constants =====
let currentUserId = null;
let selectedLabelId = null;
let labels = [];
let unsubscribeLabels = () => {};
let unsubscribeTasks = () => {};
let currentlyEditingTaskId = null;
let selectedLabelColor = null;
const PASTEL_COLORS = [
  '#ffadad', '#ffd6a5', '#fdffb6', '#caffbf',
  '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff',
  '#ffb3ba', '#ffdfba', '#baffc9', '#e4e4e4'
];


// ===== Auth State Change (Top Level Controller) =====
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUserId = user.uid;
    authContainer.style.display = 'none';
    mainContainer.style.display = 'block';
    userEmailSpan.textContent = user.email;

    if (unsubscribeLabels) unsubscribeLabels();
    if (unsubscribeTasks) unsubscribeTasks();

    unsubscribeLabels = onSnapshot(query(collection(db, "labels"), where("userId", "==", user.uid)), (snapshot) => {
        labels = [];
        labelsList.innerHTML = '';
        snapshot.forEach(docSnap => {
            const label = { id: docSnap.id, ...docSnap.data() };
            labels.push(label);
            renderLabelInModal(label);
        });
        updateColorPicker();
        updateSelectedLabelHint();
    });
    
    await loadWallpaperPreference(user.uid);
    await runDailyAutomation(user.uid);
    
    unsubscribeTasks = onSnapshot(query(collection(db, "tasks"), where("userId", "==", user.uid), where("status", "in", ["stock", "today", "completed"])), (snapshot) => {
        const tasks = [];
        snapshot.forEach(d => tasks.push({ id: d.id, ...d.data() }));
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
        stockList.innerHTML = '';
        todayList.innerHTML = '';
        tasks.forEach(t => renderTask(t.id, t));
    });

    activateDragAndDrop();
  } else {
    currentUserId = null;
    authContainer.style.display = 'block';
    mainContainer.style.display = 'none';
    archiveContainer.style.display = 'none';
    if (unsubscribeLabels) unsubscribeLabels();
    if (unsubscribeTasks) unsubscribeTasks();
    applyWallpaper('default');
  }
});

// ===== Wallpaper Functions =====
async function loadWallpaperPreference(userId) {
    if (!userId) { applyWallpaper('default'); return; }
    const settingsRef = doc(db, 'settings', userId);
    try {
        const docSnap = await getDoc(settingsRef);
        applyWallpaper(docSnap.exists() && docSnap.data().theme ? docSnap.data().theme : 'default');
    } catch (error) {
        console.error("Error loading wallpaper:", error);
        applyWallpaper('default');
    }
}

async function saveWallpaperPreference(userId, theme) {
    if (!userId) return;
    const settingsRef = doc(db, 'settings', userId);
    try { await setDoc(settingsRef, { theme: theme }); } catch (error) { console.error("Error saving wallpaper:", error); }
}

function applyWallpaper(theme) {
    document.body.className = theme && theme !== 'default' ? `theme-${theme}` : '';
    document.querySelectorAll('.wallpaper-choice').forEach(c => c.classList.toggle('selected', c.dataset.theme === theme));
}


// ===== Labels Functions =====
function initializeLabelColorPalette() {
  labelColorPalette.innerHTML = '';
  PASTEL_COLORS.forEach((color, index) => {
    const choice = document.createElement('div');
    choice.className = 'palette-choice';
    choice.style.backgroundColor = color;
    choice.dataset.color = color;
    if (index === 0) {
      choice.classList.add('selected');
      selectedLabelColor = color;
    }
    choice.addEventListener('click', () => {
      labelColorPalette.querySelectorAll('.palette-choice').forEach(c => c.classList.remove('selected'));
      choice.classList.add('selected');
      selectedLabelColor = color;
    });
    labelColorPalette.appendChild(choice);
  });
}

function renderLabelInModal(label) {
  const li = document.createElement('li');
  li.className = 'label-item';
  li.dataset.id = label.id;
  const viewContainer = document.createElement('div');
  viewContainer.className = 'label-view-container';
  const colorCircle = document.createElement('div');
  colorCircle.className = 'label-color-circle';
  colorCircle.style.backgroundColor = label.color;
  const nameSpan = document.createElement('span');
  nameSpan.className = 'label-name';
  nameSpan.textContent = label.name;
  viewContainer.append(colorCircle, nameSpan);
  const editContainer = document.createElement('div');
  editContainer.className = 'label-edit-container hidden';
  const input = document.createElement('input');
  input.type = 'text';
  input.value = label.name;
  input.maxLength = 12;
  input.className = 'label-edit-input';
  const editPalette = document.createElement('div');
  editPalette.className = 'edit-color-palette';
  PASTEL_COLORS.forEach(color => {
      const choice = document.createElement('div');
      choice.className = 'palette-choice';
      choice.style.backgroundColor = color;
      choice.dataset.color = color;
      if (color === label.color) { choice.classList.add('selected'); }
      choice.addEventListener('click', () => {
          editPalette.querySelectorAll('.palette-choice').forEach(c => c.classList.remove('selected'));
          choice.classList.add('selected');
      });
      editPalette.appendChild(choice);
  });
  editContainer.append(input, editPalette);
  const buttonsContainer = document.createElement('div');
  buttonsContainer.className = 'label-buttons-container';
  const editBtn = createButton('編集', 'edit-label-btn');
  const saveBtn = createButton('保存', 'save-label-btn hidden');
  const cancelBtn = createButton('取消', 'cancel-label-btn hidden');
  const deleteBtn = createButton('削除', 'delete-label-btn');
  buttonsContainer.append(editBtn, saveBtn, cancelBtn, deleteBtn);
  li.append(viewContainer, editContainer, buttonsContainer);
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


// ===== Tasks Functions =====
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
  li.style.backgroundColor = label ? `${label.color}20` : 'transparent';
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
    select.addEventListener('change', () => updateDoc(doc(db, "tasks", id), { labelId: select.value || null }));
    buttons.appendChild(select);
  }
  const actionsContainer = document.createElement('div');
  actionsContainer.className = 'task-actions-container';
  const menuButton = document.createElement('button');
  menuButton.className = 'actions-button';
  menuButton.innerHTML = '&#9662;';
  actionsContainer.appendChild(menuButton);
  const dropdown = document.createElement('div');
  dropdown.className = 'actions-dropdown';
  const taskActions = [];
  if (isArchived) {
    taskActions.push({ text: 'ストックへ戻す', status: 'stock', priority: Date.now() });
  } else {
    if (data.status === 'stock') { taskActions.push({ text: 'Focus', status: 'today', priority: todayList.children.length }); }
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
      dropdown.classList.remove('visible');
      if (action.action === 'delete') {
        if (confirm('このタスクを完全に削除しますか？')) {
          await deleteDoc(doc(db, "tasks", id));
          // その場でUIからも消す（特にアーカイブ画面はonSnapshotの監視外）
          li.remove();
        }
      } else {
        if (action.status === 'today' && todayList.children.length >= 6) { return alert('「Focalist」は6つまでです。'); }
        const updateData = { status: action.status };
        if (action.priority !== undefined) { updateData.priority = action.priority; }
        await updateDoc(doc(db, "tasks", id), updateData);
        // アーカイブ画面での操作時は、変更後にアーカイブ一覧から取り除く
        if (isArchived) { li.remove(); }
      }
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

function createButton(text, className) {
  const b = document.createElement('button'); b.textContent = text; b.className = className; return b;
}

function activateDragAndDrop() {
  new Sortable(todayList, {
    animation: 150,
    onEnd: async (evt) => {
      const batch = writeBatch(db);
      Array.from(evt.to.children).forEach((item, idx) => {
        if (item.dataset.id) { batch.update(doc(db, "tasks", item.dataset.id), { priority: idx }); }
      });
      await batch.commit();
    }
  });
}

// <<< 変更点: 翌日期日のタスクを自動でFocalistに移動するロジックを復元 >>>
async function runDailyAutomation(userId) {
    const q = query(collection(db, "tasks"), where("userId", "==", userId), where("status", "in", ["stock", "today"]));
    const snap = await getDocs(q);
    const all = []; snap.forEach(d => all.push({ ref: d.ref, ...d.data() }));
    let todayCount = all.filter(t => t.status === 'today').length;
    const stocks = all.filter(t => t.status === 'stock');
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);

    stocks.forEach(t => {
        if (t.dueDate) {
            const dd = t.dueDate.toDate(); dd.setHours(0, 0, 0, 0);
            if (dd.getTime() === tomorrow.getTime() && todayCount < 6) {
                updateDoc(t.ref, { status: 'today', priority: todayCount });
                todayCount++;
            }
        }
    });
}

document.addEventListener('click', () => { closeAllDropdowns(); });
function closeAllDropdowns() {
    document.querySelectorAll('.actions-dropdown.visible').forEach(d => d.classList.remove('visible'));
}

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
logoutButtonModal.addEventListener('click', () => signOut(auth));

addButton.addEventListener('click', async () => {
  const title = titleInput.value.trim();
  const memo = memoInput.value.trim();
  if (title === '' || !currentUserId) return;
  const data = {
    userId: currentUserId, title, memo, status: 'stock',
    priority: Date.now(), createdAt: serverTimestamp(),
    labelId: selectedLabelId || null,
    dueDate: dueDateInput.value ? Timestamp.fromDate(new Date(dueDateInput.value)) : null
  };
  await addDoc(collection(db, "tasks"), data);
  titleInput.value = ''; memoInput.value = ''; dueDateInput.value = '';
});

reloadButton.addEventListener('click', () => { location.reload(true); });
// <<< 変更点: Resetボタンのロジックを復元し、確認メッセージも修正 >>>
resetDayButton.addEventListener('click', async () => {
  const confirmationMessage = "Resetしますか？\n完了タスクはアーカイブされ、未完了タスクは期日が翌日に変更されストックに戻ります。";
  if (!currentUserId || !confirm(confirmationMessage)) return;

  const q = query(collection(db, "tasks"), where("userId", "==", currentUserId), where("status", "in", ["today", "completed"]));
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowTimestamp = Timestamp.fromDate(tomorrow);

  snap.forEach(d => {
    const t = d.data();
    if (t.status === 'completed') {
      batch.update(d.ref, { status: 'archived' });
    } else if (t.status === 'today') {
      batch.update(d.ref, {
        status: 'stock',
        priority: Date.now(),
        dueDate: tomorrowTimestamp
      });
    }
  });
  await batch.commit();
});

archiveViewButton.addEventListener('click', () => {
  mainContainer.style.display = 'none';
  archiveContainer.style.display = 'block';
  loadArchivedTasks(currentUserId);
});
backToMainButton.addEventListener('click', () => {
  archiveContainer.style.display = 'none';
  mainContainer.style.display = 'block';
});

manageLabelsButton.addEventListener('click', () => {
  initializeLabelColorPalette();
  labelModalBackdrop.classList.remove('hidden');
});
closeLabelModalButton.addEventListener('click', () => labelModalBackdrop.classList.add('hidden'));
addLabelForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = labelNameInput.value.trim();
  if (!name || !selectedLabelColor || !currentUserId) return;
  if (labels.some(l => l.name === name)) return alert('同じ名前のラベルは既に存在します。');
  await addDoc(collection(db, "labels"), { userId: currentUserId, name, color: selectedLabelColor, createdAt: serverTimestamp() });
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
  await updateDoc(doc(db, "tasks", currentlyEditingTaskId), { title: newTitle, memo: modalEditMemoInput.value.trim() });
  taskDetailModalBackdrop.classList.add('hidden');
});
cancelEditButton.addEventListener('click', () => { switchToViewMode(); });
closeTaskDetailModalButton.addEventListener('click', () => { taskDetailModalBackdrop.classList.add('hidden'); });
taskDetailModalBackdrop.addEventListener('click', (e) => { if (e.target === taskDetailModalBackdrop) { taskDetailModalBackdrop.classList.add('hidden'); } });

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

settingsButton.addEventListener('click', () => {
    if(auth.currentUser){ settingsUserIdSpan.textContent = auth.currentUser.email; }
    settingsModalBackdrop.classList.remove('hidden');
});
closeSettingsModalButton.addEventListener('click', () => { settingsModalBackdrop.classList.add('hidden'); });
settingsModalBackdrop.addEventListener('click', (e) => { if (e.target === settingsModalBackdrop) { settingsModalBackdrop.classList.add('hidden'); } });
wallpaperChoices.addEventListener('click', (e) => {
    const choice = e.target.closest('.wallpaper-choice');
    if (choice) {
        applyWallpaper(choice.dataset.theme);
        saveWallpaperPreference(currentUserId, choice.dataset.theme);
    }
});

document.body.addEventListener('click', async (event) => {
    const target = event.target;
    if (target.closest('.color-choice')) {
      selectedLabelId = target.closest('.color-choice').dataset.labelId;
      updateColorPicker();
      updateSelectedLabelHint();
      return;
    }
    if (target.classList.contains('due-date')) {
      const li = target.closest('li[data-id]'); if (!li) return;
      const ref = doc(db, "tasks", li.dataset.id);
      const input = document.createElement('input');
      input.type = 'date';
      const d = await getDoc(ref);
      if (d.exists() && d.data().dueDate) { input.value = d.data().dueDate.toDate().toISOString().split('T')[0]; }
      target.replaceWith(input);
      input.focus();
      const save = () => updateDoc(ref, { dueDate: input.value ? Timestamp.fromDate(new Date(input.value)) : null });
      input.addEventListener('blur', save);
      input.addEventListener('keydown', e => { if (e.key === 'Enter') input.blur(); });
      return;
    }
    const labelRow = target.closest('.label-item');
    if(labelRow){
        const id = labelRow.dataset.id;
        const viewContainer = labelRow.querySelector('.label-view-container');
        const editContainer = labelRow.querySelector('.label-edit-container');
        const buttonsContainer = labelRow.querySelector('.label-buttons-container');

        if(target.classList.contains('edit-label-btn')){
            viewContainer.classList.add('hidden');
            editContainer.classList.remove('hidden');
            buttonsContainer.querySelectorAll('.edit-label-btn, .delete-label-btn').forEach(el => el.classList.add('hidden'));
            buttonsContainer.querySelectorAll('.save-label-btn, .cancel-label-btn').forEach(el => el.classList.remove('hidden'));
            return;
        }
        if(target.classList.contains('cancel-label-btn')){
            viewContainer.classList.remove('hidden');
            editContainer.classList.add('hidden');
            buttonsContainer.querySelectorAll('.edit-label-btn, .delete-label-btn').forEach(el => el.classList.remove('hidden'));
            buttonsContainer.querySelectorAll('.save-label-btn, .cancel-label-btn').forEach(el => el.classList.add('hidden'));
            const originalColor = labels.find(l=>l.id===id).color;
            editContainer.querySelectorAll('.palette-choice').forEach(c => c.classList.toggle('selected', c.dataset.color === originalColor));
            return;
        }
        if(target.classList.contains('save-label-btn')){
            const newName = editContainer.querySelector('.label-edit-input').value.trim();
            const selectedColorEl = editContainer.querySelector('.palette-choice.selected');
            const newColor = selectedColorEl ? selectedColorEl.dataset.color : labels.find(l=>l.id===id).color;
            if(!newName) return alert('ラベル名を入力してください。');
            if(labels.some(l=>l.name===newName && l.id!==id)) return alert('同名のラベルが存在します。');
            await updateDoc(doc(db, "labels", id), { name: newName, color: newColor });
            return;
        }
        if(target.classList.contains('delete-label-btn')){
            const labelObj = labels.find(l => l.id === id);
            if (!confirm(`ラベル「${labelObj?.name || ''}」を削除しますか？\n関連するタスクのラベルは解除されます。`)) return;
            const qTasks = query(collection(db, "tasks"), where("userId", "==", currentUserId), where("labelId", "==", id));
            const snap = await getDocs(qTasks);
            const batch = writeBatch(db);
            snap.forEach(d => batch.update(d.ref, { labelId: null }));
            batch.delete(doc(db, "labels", id));
            await batch.commit();
            if (selectedLabelId === id) selectedLabelId = null;
            return;
        }
    }
});
