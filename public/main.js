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
import {
  getStorage, ref as storageRef, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import {
  initializeRecurringTasks,
  setRecurringTaskUser,
  refreshTodayRecurringTasks,
  teardownRecurringTasks,
  updateRecurringTaskLabels
} from './recurring-tasks.js';

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
const storage = getStorage(app);
setPersistence(auth, indexedDBLocalPersistence).catch(console.error);
initializeRecurringTasks(db);


// ===== DOM Elements =====
const startupScreen = document.getElementById('startup-screen');
const startTaskButton = document.getElementById('start-task-button');
const startTodoButton = document.getElementById('start-todo-button');
const startMemoButton = document.getElementById('start-memo-button');
const todoComingSoon = document.getElementById('todo-coming-soon');
const todoContainer = document.getElementById('todo-container');
const todoBackStartupButton = document.getElementById('todo-back-startup-button');

const openCandidatePanelButton = document.getElementById('open-candidate-panel');
const candidatePanel = document.getElementById('candidate-panel');
const candidateForm = document.getElementById('candidate-form');
const candidateNameInput = document.getElementById('candidate-name');
const candidateStartInput = document.getElementById('candidate-start');
const candidateDeptInput = document.getElementById('candidate-dept');
const candidateGradeInput = document.getElementById('candidate-grade');
const candidateNoteInput = document.getElementById('candidate-note');
const candidateTypeInput = document.getElementById('candidate-type');
const candidateList = document.getElementById('candidate-list');
const candidateModalBackdrop = document.getElementById('candidate-modal-backdrop');
const candidateDetailForm = document.getElementById('candidate-detail-form');
const candidateDetailNameInput = document.getElementById('candidate-detail-name');
const candidateDetailStartInput = document.getElementById('candidate-detail-start');
const candidateDetailDeptInput = document.getElementById('candidate-detail-dept');
const candidateDetailGradeInput = document.getElementById('candidate-detail-grade');
const candidateDetailNoteInput = document.getElementById('candidate-detail-note');
const candidateDetailTypeInput = document.getElementById('candidate-detail-type');
const candidateDetailTasks = document.getElementById('candidate-detail-tasks');
const candidateModalCloseButton = document.getElementById('candidate-modal-close');
const interviewModalBackdrop = document.getElementById('candidate-interview-modal-backdrop');
const interviewModal = document.getElementById('candidate-interview-modal');
const interviewModalSaveButton = document.getElementById('interview-modal-save');
const interviewModalCancelButton = document.getElementById('interview-modal-cancel');
const interviewModalList = document.getElementById('interview-modal-list');
const onboardingModalBackdrop = document.getElementById('onboarding-modal-backdrop');
const onboardingModal = document.getElementById('onboarding-modal');
const onboardingDatetimeInput = document.getElementById('onboarding-datetime');
const onboardingItemsCheckbox = document.getElementById('onboarding-items-checkbox');
const onboardingModalSaveButton = document.getElementById('onboarding-modal-save');
const onboardingModalCancelButton = document.getElementById('onboarding-modal-cancel');
const todoSettingsButton = document.getElementById('todo-settings-button');
const todoSettingsModalBackdrop = document.getElementById('todo-settings-modal-backdrop');
const closeTodoSettingsModalButton = document.getElementById('close-todo-settings-modal-button');
const todoUpdatesList = document.getElementById('todo-updates-list');
const authContainer = document.getElementById('auth-container');
const mainContainer = document.getElementById('app-container');
const archiveContainer = document.getElementById('archive-container');
const userEmailSpan = document.getElementById('user-email');
const settingsButton = document.getElementById('settings-button');
const settingsModalBackdrop = document.getElementById('settings-modal-backdrop');
const closeSettingsModalButton = document.getElementById('close-settings-modal-button');
const wallpaperChoices = document.getElementById('wallpaper-choices');
const customWallpaperInput = document.getElementById('custom-wallpaper-input');
const chooseCustomWallpaperButton = document.getElementById('choose-custom-wallpaper-button');
const sleepToggle = document.getElementById('sleep-toggle');
const sleepSecondsInput = document.getElementById('sleep-seconds');
const returnStartupButton = document.getElementById('return-startup-button');
const settingsUserIdSpan = document.getElementById('settings-user-id');
const logoutButtonModal = document.getElementById('logout-button-modal');

const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const signupButton = document.getElementById('signup-button');
const loginButton = document.getElementById('login-button');

const addButton = document.getElementById('add-task-button');
const openAddTaskModalButton = document.getElementById('open-add-task-modal-button');
const addTaskModalBackdrop = document.getElementById('add-task-modal-backdrop');
const closeAddTaskModalButton = document.getElementById('close-add-task-modal-button');
const titleInput = document.getElementById('new-task-title-input');
const memoInput = document.getElementById('new-task-memo-input');
const dueDateInput = document.getElementById('due-date-input');
const dueYearInput = document.getElementById('due-year');
const dueMonthInput = document.getElementById('due-month');
const dueDayInput = document.getElementById('due-day');
const colorPicker = document.getElementById('color-picker');
const selectedLabelHint = document.getElementById('selected-label-hint');

const stockList = document.getElementById('stock-tasks');
const todayList = document.getElementById('today-tasks');
const archiveList = document.getElementById('archive-tasks');
const archiveSelectAllCheckbox = document.getElementById('archive-select-all-checkbox');
const archiveDeleteSelectedButton = document.getElementById('archive-delete-selected-button');

const reloadButton = document.getElementById('reload-button');
const resetDayButton = document.getElementById('reset-day-button');
const archiveViewButton = document.getElementById('archive-view-button');
const backToMainButton = document.getElementById('back-to-main-button');
const backToMainButtonTop = document.getElementById('back-to-main-button-top');

const manageLabelsButton = document.getElementById('manage-labels-button');
const labelModalBackdrop = document.getElementById('label-modal-backdrop');
const closeLabelModalButton = document.getElementById('close-label-modal-button');
const addLabelForm = document.getElementById('add-label-form');
const labelNameInput = document.getElementById('label-name-input');
const labelColorPalette = document.getElementById('label-color-palette');
const labelsList = document.getElementById('labels-list');

// Updates UI elements
const updatesWindow = document.getElementById('updates-window');
const updatesListCompact = document.getElementById('updates-list-compact');
const updatesModalBackdrop = document.getElementById('updates-modal-backdrop');
const updatesListFull = document.getElementById('updates-list-full');
const closeUpdatesModalButton = document.getElementById('close-updates-modal-button');

// Feedback elements (omitted UI): No longer used

const taskDetailModalBackdrop = document.getElementById('task-detail-modal-backdrop');
const modalTaskTitle = document.getElementById('modal-task-title');
const modalTaskMemo = document.getElementById('modal-task-memo');
const closeTaskDetailModalButton = document.getElementById('close-task-detail-modal-button');
const modalViewMode = taskDetailModalBackdrop.querySelector('.view-mode');
const modalEditMode = taskDetailModalBackdrop.querySelector('.edit-mode');
const modalEditTitleInput = document.getElementById('modal-edit-title-input');
const modalEditMemoInput = document.getElementById('modal-edit-memo-input');
const modalEditDueDateInput = document.getElementById('modal-edit-due-date-input');
const editTaskButton = document.getElementById('edit-task-button');
const saveTaskButton = document.getElementById('save-task-button');
const cancelEditButton = document.getElementById('cancel-edit-button');

// Memo Workspace Elements
const memoContainer = document.getElementById('memo-container');
const startMemoButtonStartup = document.getElementById('start-memo-button'); // already got above but redundant ref is ok or reuse
const memoBackStartupButton = document.getElementById('memo-back-startup-button');
const memoList = document.getElementById('memo-list');
const addMemoButton = document.getElementById('add-memo-button');
const memoEditorArea = document.querySelector('.memo-editor-area'); // use class or add id? class is fine
const memoEditorPlaceholder = document.getElementById('memo-editor-placeholder');
const memoEditor = document.getElementById('memo-editor');
const memoTitleInput = document.getElementById('memo-title-input');
const memoTitleSaveButton = document.getElementById('memo-title-save-button');
const memoLastUpdated = document.getElementById('memo-last-updated');
const deleteMemoButton = document.getElementById('delete-memo-button');
const memoContentEditor = document.getElementById('memo-content-editor');
const memoImageInput = document.getElementById('memo-image-input');
const insertImageButton = document.getElementById('insert-image-button');
const memoBackButton = document.getElementById('memo-back-button');
const imageEditorModalBackdrop = document.getElementById('image-editor-modal-backdrop');
const imageEditorPreview = document.getElementById('image-editor-preview');
const imageEditorCancel = document.getElementById('image-editor-cancel');
const imageEditorSave = document.getElementById('image-editor-save');
const imageEditorWidth = document.getElementById('image-editor-width');
const imageEditorHeight = document.getElementById('image-editor-height');
const toolbarBold = document.getElementById('toolbar-bold');
const toolbarColor = document.getElementById('toolbar-color');
const toolbarColorPalette = document.getElementById('toolbar-color-palette');
const memoSearchInput = document.getElementById('memo-search-input');
const memoTagsList = document.getElementById('memo-tags-list');
const memoTagInput = document.getElementById('memo-tag-input');

// Vault Workspace Elements
const vaultContainer = document.getElementById('vault-container');
const startVaultButton = document.getElementById('start-vault-button');
const vaultBackButton = document.getElementById('vault-back-startup-button');
const vaultLockButton = document.getElementById('vault-lock-button'); // New
const vaultAddButton = document.getElementById('vault-add-button');
const vaultSearchInput = document.getElementById('vault-search-input');
const vaultListEl = document.getElementById('vault-list');
const vaultModalBackdrop = document.getElementById('vault-modal-backdrop');
const vaultModalTitle = document.getElementById('vault-modal-title');
const vaultForm = document.getElementById('vault-form');
const vaultInputTitle = document.getElementById('vault-input-title');
const vaultInputUrl = document.getElementById('vault-input-url');
const vaultInputLoginId = document.getElementById('vault-input-login-id');
const vaultInputPassword = document.getElementById('vault-input-password');
const vaultInputMemo = document.getElementById('vault-input-memo');
const vaultModalTogglePw = document.getElementById('vault-modal-toggle-pw');
const vaultModalCancel = document.getElementById('vault-modal-cancel');
const vaultLockScreen = document.getElementById('vault-lock-screen'); // New
const vaultMasterPasswordInput = document.getElementById('vault-master-password-input'); // New
const vaultUnlockButton = document.getElementById('vault-unlock-button'); // New


// ===== Global State & Constants =====
let currentUserId = null;
let workspaceSelection = null; // 'task' | 'todo' | 'memo' | null
let lastKnownAuthUser = null;
let selectedLabelId = null;
let labels = [];
let unsubscribeLabels = () => { };
let unsubscribeTasks = () => { };
let currentlyEditingTaskId = null;
let currentlyEditingTaskDueDate = null; // Date or null
let selectedLabelColor = null;
const selectedArchivedTaskIds = new Set();
// Sleep mode state
let sleepEnabled = false;
let sleepSeconds = 60; // default
let sleepTimerId = null;
const THEME_KEYS = ['pastel', 'okinawa', 'jungle', 'dolphins', 'sunny', 'happyhacking', 'skycastle', 'lunar', 'custom'];
let customWallpaperDataUrl = null; // base64 JPEG stored per device (IndexedDB), not synced
let currentCandidateId = null;
let currentDetailTasks = [];
let currentInterviewTaskId = null;
let currentInterviews = [];
let currentOnboardingTaskId = null;
// Memo State
let memos = [];
let currentMemoId = null;
let unsubscribeMemos = () => { };
let memoFolders = []; // { id, name, userId, order }
let unsubscribeMemoFolders = () => { };
let currentViewFolderId = 'all'; // 'all', 'uncategorized', or folderId
let memoSaveTimeout = null;
let memoSearchQuery = ''; // Search query state
// Vault State
let vaults = [];
let unsubscribeVaults = () => { };
let vaultSearchQuery = '';
let editingVaultId = null;
let vaultMasterPassword = null; // New: E2EE Key (Raw Password)
let isVaultLocked = true; // New: Default locked
const PASTEL_COLORS = [
  '#ffadad', '#ffd6a5', '#fdffb6', '#caffbf',
  '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff',
  '#ffb3ba', '#ffdfba', '#baffc9', '#e4e4e4'
];
const CANDIDATE_STORAGE_KEY = 'todo_candidates_v1';
const DEFAULT_CANDIDATE_TASKS = [
  '面接',
  '入社前説明',
  '関係者への求職者情報の共有',
  '経営会議への報告資料作成',
  '社内ネットワークへの人事発令',
  '入社時研修'
];
const INTERVIEW_STAGES = ['一次', '二次', '最終'];


// ===== Startup View Helpers =====
function showStartupScreen(showTodoMessage = false) {
  workspaceSelection = showTodoMessage ? 'todo' : null; // Keep this logic for 'todo' message, but general reset
  if (!showTodoMessage) workspaceSelection = null;

  // Reset workspace
  document.body.removeAttribute('data-workspace');
  handleSignedOut(false);
  if (startupScreen) startupScreen.classList.remove('hidden');
  if (todoContainer) todoContainer.classList.add('hidden');
  if (memoContainer) memoContainer.classList.add('hidden');
  if (vaultContainer) vaultContainer.classList.add('hidden');
  if (todoComingSoon) todoComingSoon.classList.toggle('hidden', !showTodoMessage);
}

async function enterTaskWorkspace() {
  workspaceSelection = 'task';
  document.body.dataset.workspace = 'task';
  if (todoComingSoon) todoComingSoon.classList.add('hidden');
  if (startupScreen) startupScreen.classList.add('hidden');
  if (lastKnownAuthUser) {
    await handleSignedIn(lastKnownAuthUser);
  } else {
    handleSignedOut(true);
  }
  if (todoContainer) todoContainer.classList.add('hidden');
  if (memoContainer) memoContainer.classList.add('hidden');
  if (vaultContainer) vaultContainer.classList.add('hidden');
}

function enterTodoWorkspace() {
  workspaceSelection = 'todo';
  document.body.dataset.workspace = 'todo';
  if (startupScreen) startupScreen.classList.add('hidden');
  if (todoComingSoon) todoComingSoon.classList.add('hidden');
  if (authContainer) authContainer.style.display = 'none';
  if (mainContainer) mainContainer.style.display = 'none';
  if (archiveContainer) archiveContainer.style.display = 'none';
  if (todoContainer) todoContainer.classList.remove('hidden');
  if (memoContainer) memoContainer.classList.add('hidden');
  if (vaultContainer) vaultContainer.classList.add('hidden');
  renderCandidates();
}

async function enterMemoWorkspace() {
  workspaceSelection = 'memo';
  document.body.dataset.workspace = 'memo';
  if (startupScreen) startupScreen.classList.add('hidden');
  if (todoComingSoon) todoComingSoon.classList.add('hidden');
  if (authContainer) authContainer.style.display = 'none';
  if (mainContainer) mainContainer.style.display = 'none';
  if (archiveContainer) archiveContainer.style.display = 'none';
  if (todoContainer) todoContainer.classList.add('hidden');
  if (memoContainer) memoContainer.classList.remove('hidden');
  if (vaultContainer) vaultContainer.classList.add('hidden');

  if (lastKnownAuthUser) {
    if (!currentUserId) currentUserId = lastKnownAuthUser.uid;
    // We need to ensure settings are loaded for wallpaper
    await loadUserSettings(currentUserId);
    // We need to ensure settings are loaded for wallpaper
    await loadUserSettings(currentUserId);
    subscribeMemoFolders(currentUserId);
    subscribeMemos(currentUserId);
  } else {
    // If somehow entered without user, show auth
    handleSignedOut(true);
  }
}

// ===== Auth State Change (Top Level Controller) =====
onAuthStateChanged(auth, async (user) => {
  lastKnownAuthUser = user;
  if (workspaceSelection === 'task') {
    await enterTaskWorkspace();
  } else if (workspaceSelection === 'todo') {
    enterTodoWorkspace();
  } else if (workspaceSelection === 'memo') {
    enterMemoWorkspace();
  } else if (workspaceSelection === 'vault') {
    enterVaultWorkspace();
  } else {
    showStartupScreen(workspaceSelection === 'todo');
  }
});

async function handleSignedIn(user) {
  currentUserId = user.uid;
  authContainer.style.display = 'none';
  mainContainer.style.display = 'block';
  archiveContainer.style.display = 'none';
  userEmailSpan.textContent = user.email;
  setRecurringTaskUser(user.uid);
  refreshTodayRecurringTasks();

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
    updateRecurringTaskLabels(labels);
  });

  await loadUserSettings(user.uid);
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
}

function handleSignedOut(showAuthScreen = true) {
  currentUserId = null;
  authContainer.style.display = showAuthScreen ? 'block' : 'none';
  mainContainer.style.display = 'none';
  archiveContainer.style.display = 'none';
  teardownRecurringTasks();
  if (unsubscribeLabels) unsubscribeLabels();
  if (unsubscribeTasks) unsubscribeTasks();
  if (unsubscribeTasks) unsubscribeTasks();
  if (unsubscribeMemos) unsubscribeMemos();
  if (unsubscribeMemoFolders) unsubscribeMemoFolders();
  if (unsubscribeVaults) unsubscribeVaults();
  sleepEnabled = false; if (sleepTimerId) { clearTimeout(sleepTimerId); sleepTimerId = null; }
  exitSleep();
  applyWallpaper('default');
}

// ===== Wallpaper Functions =====
async function loadUserSettings(userId) {
  if (!userId) { applyWallpaper('default'); return; }
  const settingsRef = doc(db, 'settings', userId);
  try {
    const docSnap = await getDoc(settingsRef);
    const data = docSnap.exists() ? docSnap.data() : {};
    const theme = data.theme || 'default';
    // Load custom wallpaper from this device (IndexedDB), not from Firestore
    await loadCustomWallpaperFromDevice(userId);
    applyWallpaper(theme === 'custom' && !customWallpaperDataUrl ? 'default' : theme);
    // Sleep settings
    sleepEnabled = !!data.sleepEnabled;
    sleepSeconds = typeof data.sleepSeconds === 'number' ? Math.min(180, Math.max(1, Math.floor(data.sleepSeconds))) : 60;
    if (sleepToggle) sleepToggle.checked = sleepEnabled;
    if (sleepSecondsInput) sleepSecondsInput.value = sleepSeconds;
    scheduleSleepTimer();
  } catch (error) {
    console.error("Error loading settings:", error);
    applyWallpaper('default');
    sleepEnabled = false; sleepSeconds = 60; scheduleSleepTimer();
  }
}

async function saveWallpaperPreference(userId, theme) {
  if (!userId) return;
  const settingsRef = doc(db, 'settings', userId);
  try { await setDoc(settingsRef, { theme: theme }, { merge: true }); } catch (error) { console.error("Error saving wallpaper:", error); }
}

async function saveSleepPreference(userId, enabled, seconds) {
  if (!userId) return;
  const settingsRef = doc(db, 'settings', userId);
  try { await setDoc(settingsRef, { sleepEnabled: !!enabled, sleepSeconds: seconds }, { merge: true }); } catch (error) { console.error("Error saving sleep settings:", error); }
}

function applyWallpaper(theme) {
  // Preserve other classes like 'sleeping' while switching theme classes
  THEME_KEYS.forEach(k => document.body.classList.remove(`theme-${k}`));
  if (theme && theme !== 'default') {
    document.body.classList.add(`theme-${theme}`);
  }
  document.querySelectorAll('.wallpaper-choice').forEach(c => c.classList.toggle('selected', c.dataset.theme === theme));
}

function scheduleSleepTimer() {
  if (sleepTimerId) { clearTimeout(sleepTimerId); sleepTimerId = null; }
  if (sleepEnabled && sleepSeconds > 0) {
    sleepTimerId = setTimeout(enterSleep, sleepSeconds * 1000);
  }
}

// ===== Updates (GitHub) =====
const GITHUB_REPO = 'PoisonDartFrogMan/IvyTask';
const UPDATES_CACHE_KEY = 'ivy_updates_cache_v1';
const UPDATES_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

async function fetchGithubUpdates() {
  try {
    // Try cache first
    const cached = localStorage.getItem(UPDATES_CACHE_KEY);
    if (cached) {
      const { ts, items } = JSON.parse(cached);
      if (Array.isArray(items) && Date.now() - ts < UPDATES_CACHE_TTL_MS) {
        return items;
      }
    }

    // Prefer releases
    const relRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases?per_page=20`, { headers: { 'Accept': 'application/vnd.github+json' } });
    let items = [];
    if (relRes.ok) {
      const releases = await relRes.json();
      if (Array.isArray(releases) && releases.length > 0) {
        items = releases.map(r => ({
          title: r.name || r.tag_name || '(no title)',
          date: r.published_at || r.created_at || r.created_at,
          url: r.html_url
        }));
      }
    }

    // Fallback to commits
    if (items.length === 0) {
      const comRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/commits?per_page=20`, { headers: { 'Accept': 'application/vnd.github+json' } });
      if (comRes.ok) {
        const commits = await comRes.json();
        if (Array.isArray(commits)) {
          items = commits.map(c => ({
            title: (c.commit && c.commit.message ? c.commit.message.split('\n')[0] : '(commit)'),
            date: (c.commit && c.commit.author && c.commit.author.date) || null,
            url: c.html_url
          }));
        }
      }
    }

    // Cache and return
    const normalized = items.map(i => ({
      title: i.title || '(no title)',
      date: i.date ? new Date(i.date).toISOString() : null,
      url: i.url || '#'
    }));
    localStorage.setItem(UPDATES_CACHE_KEY, JSON.stringify({ ts: Date.now(), items: normalized }));
    return normalized;
  } catch (e) {
    console.warn('Failed to fetch updates', e);
    return [];
  }
}

function formatDateShort(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}/${m}/${dd}`;
  } catch { return ''; }
}

function renderUpdatesCompact(items) {
  const target = updatesListCompact;
  if (!target) return;
  target.innerHTML = '';
  if (!items || items.length === 0) {
    const li = document.createElement('li');
    li.className = 'updates-item';
    const span = document.createElement('span'); span.textContent = '更新情報を取得できませんでした。';
    const time = document.createElement('time'); time.textContent = '';
    li.append(span, time);
    target.appendChild(li);
    return;
  }
  items.slice(0, 3).forEach(i => {
    const li = document.createElement('li');
    li.className = 'updates-item';
    const title = document.createElement('span'); title.textContent = i.title; title.className = 'updates-title';
    const time = document.createElement('time'); time.textContent = formatDateShort(i.date);
    li.append(title, time);
    target.appendChild(li);
  });
}

function renderUpdatesFull(items, target = updatesListFull) {
  if (!target) return;
  target.innerHTML = '';
  if (!items || items.length === 0) {
    const li = document.createElement('li');
    li.className = 'updates-item';
    const span = document.createElement('span'); span.textContent = '更新情報はありません。';
    const time = document.createElement('time'); time.textContent = '';
    li.append(span, time);
    target.appendChild(li);
    return;
  }
  items.forEach(i => {
    const li = document.createElement('li');
    li.className = 'updates-item';
    const title = document.createElement('span'); title.textContent = i.title; title.className = 'updates-title';
    const time = document.createElement('time'); time.textContent = formatDateShort(i.date);
    li.append(title, time);
    target.appendChild(li);
  });
}

async function ensureUpdatesLoaded() {
  const items = await fetchGithubUpdates();
  renderUpdatesCompact(items);
  // If modal is open, also refresh full list
  if (updatesModalBackdrop && !updatesModalBackdrop.classList.contains('hidden')) {
    renderUpdatesFull(items, updatesListFull);
  }
  if (todoSettingsModalBackdrop && !todoSettingsModalBackdrop.classList.contains('hidden')) {
    renderUpdatesFull(items, todoUpdatesList);
  }
}

function enterSleep() {
  document.body.classList.add('sleeping');
}

function exitSleep() {
  document.body.classList.remove('sleeping');
  scheduleSleepTimer();
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
  selectedArchivedTaskIds.clear();
  if (archiveSelectAllCheckbox) {
    archiveSelectAllCheckbox.checked = false;
    archiveSelectAllCheckbox.indeterminate = false;
  }
  updateArchiveSelectionUI();
  const q = query(collection(db, "tasks"), where("userId", "==", userId), where("status", "==", "archived"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  snap.forEach(d => renderTask(d.id, d.data(), true));
  updateArchiveSelectionUI();
}

function updateArchiveSelectionUI() {
  if (!archiveDeleteSelectedButton || !archiveSelectAllCheckbox || !archiveList) return;
  const checkboxes = archiveList.querySelectorAll('.archive-select-checkbox');
  const total = checkboxes.length;
  const selected = selectedArchivedTaskIds.size;

  archiveDeleteSelectedButton.disabled = selected === 0;

  if (total === 0) {
    archiveSelectAllCheckbox.checked = false;
    archiveSelectAllCheckbox.indeterminate = false;
    archiveSelectAllCheckbox.disabled = true;
  } else {
    archiveSelectAllCheckbox.disabled = false;
    archiveSelectAllCheckbox.checked = selected === total;
    archiveSelectAllCheckbox.indeterminate = selected > 0 && selected < total;
  }
}

function renderTask(id, data, isArchived = false) {
  const li = document.createElement('li');
  li.dataset.id = id;
  if (data.status === 'completed') li.classList.add('completed');
  const label = labels.find(l => l.id === data.labelId);
  li.style.borderLeftColor = label ? label.color : '#e0e0e0';
  li.style.backgroundColor = label ? `${label.color}20` : 'transparent';
  let archiveCheckbox = null;
  if (isArchived) {
    li.classList.add('archive-item');
    const selectCell = document.createElement('div');
    selectCell.className = 'archive-select-cell';
    archiveCheckbox = document.createElement('input');
    archiveCheckbox.type = 'checkbox';
    archiveCheckbox.className = 'archive-select-checkbox';
    archiveCheckbox.dataset.taskId = id;
    archiveCheckbox.addEventListener('click', (event) => event.stopPropagation());
    archiveCheckbox.addEventListener('change', () => {
      if (archiveCheckbox.checked) {
        selectedArchivedTaskIds.add(id);
      } else {
        selectedArchivedTaskIds.delete(id);
      }
      updateArchiveSelectionUI();
    });
    selectCell.appendChild(archiveCheckbox);
    if (selectedArchivedTaskIds.has(id)) {
      archiveCheckbox.checked = true;
    }
    li.appendChild(selectCell);
  }
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
  // タスク本体をクリックしたら内容/メモのポップアップ（閲覧モード）
  // ただし、期日クリックはインライン編集に委ねる
  content.addEventListener('click', (e) => {
    if (e.target.classList?.contains('due-date') || e.target.closest?.('.due-date')) {
      return; // グローバルの期日編集ハンドラに任せる
    }
    e.stopPropagation();
    currentlyEditingTaskId = id;
    currentlyEditingTaskDueDate = data.dueDate ? data.dueDate.toDate() : null;
    modalTaskTitle.textContent = data.title || data.text;
    modalTaskMemo.textContent = data.memo || '(メモはありません)';
    switchToViewMode();
    taskDetailModalBackdrop.classList.remove('hidden');
  });
  // コンテンツクリックでは編集モーダルを開かない（編集はメニューから）
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
    // 明示的に編集を選べるようにする
    taskActions.push({ text: '編集', action: 'edit' });
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
      if (action.action === 'edit') {
        currentlyEditingTaskId = id;
        currentlyEditingTaskDueDate = data.dueDate ? data.dueDate.toDate() : null;
        modalTaskTitle.textContent = data.title || data.text;
        modalTaskMemo.textContent = data.memo || '(メモはありません)';
        switchToViewMode();
        taskDetailModalBackdrop.classList.remove('hidden');
      } else if (action.action === 'delete') {
        if (confirm('このタスクを完全に削除しますか？')) {
          await deleteDoc(doc(db, "tasks", id));
          // その場でUIからも消す（特にアーカイブ画面はonSnapshotの監視外）
          li.remove();
          selectedArchivedTaskIds.delete(id);
          updateArchiveSelectionUI();
        }
      } else {
        if (action.status === 'today' && todayList.children.length >= 6) { return alert('「Focalist」は6つまでです。'); }
        const updateData = { status: action.status };
        if (action.priority !== undefined) { updateData.priority = action.priority; }
        await updateDoc(doc(db, "tasks", id), updateData);
        // アーカイブ画面での操作時は、変更後にアーカイブ一覧から取り除く
        if (isArchived) {
          li.remove();
          selectedArchivedTaskIds.delete(id);
          updateArchiveSelectionUI();
        }
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
  if (isArchived) {
    updateArchiveSelectionUI();
  }
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

// ... (Existing code ends here)

// ===== Memo Functions =====

// Event Listeners
if (startMemoButton) {
  startMemoButton.addEventListener('click', () => {
    if (lastKnownAuthUser) {
      enterMemoWorkspace();
    } else {
      // Need login
      workspaceSelection = 'memo';
      handleSignedOut(true);
    }
  });
}

if (memoBackStartupButton) {
  memoBackStartupButton.addEventListener('click', () => {
    showStartupScreen();
  });
}

if (addMemoButton) {
  addMemoButton.addEventListener('click', async () => {
    if (!currentUserId) return;
    await createNewMemo();
  });
}

if (memoContentEditor) {
  memoContentEditor.addEventListener('input', () => {
    if (memoSaveTimeout) clearTimeout(memoSaveTimeout);
    memoLastUpdated.textContent = "保存中...";
    memoSaveTimeout = setTimeout(() => {
      saveCurrentMemo();
    }, 1000); // Auto-save after 1 second of inactivity
  });
}

if (memoTitleSaveButton) {
  memoTitleSaveButton.addEventListener('click', () => {
    saveCurrentMemo();
  });
}

if (deleteMemoButton) {
  deleteMemoButton.addEventListener('click', async () => {
    if (currentMemoId && confirm('このメモを削除しますか？')) {
      await deleteDoc(doc(db, "memos", currentMemoId));
      currentMemoId = null;
      renderMemoEditorState();
    }
  });
}

// ===== Memo Folders Logic =====
const memoFolderList = document.getElementById('memo-folder-list');
const createFolderButton = document.getElementById('create-folder-button');
const memoFolderSelect = document.getElementById('memo-folder-select');

function subscribeMemoFolders(userId) {
  if (unsubscribeMemoFolders) unsubscribeMemoFolders();
  // Ensure we sort by some order or creation time if needed. Currently no explicit order field, use createdAt or name
  // Let's add createdAt to folder creation
  const q = query(collection(db, "memo_folders"), where("userId", "==", userId));
  unsubscribeMemoFolders = onSnapshot(q, (snapshot) => {
    memoFolders = [];
    snapshot.forEach(docSnap => {
      memoFolders.push({ id: docSnap.id, ...docSnap.data() });
    });
    // Sort by name or custom order
    memoFolders.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    renderMemoFolderList();
    renderMemoFolderSelect(); // Update editor dropdown
    // If deleted current folder, switch to all
    if (currentViewFolderId !== 'all' && currentViewFolderId !== 'uncategorized' && !memoFolders.find(f => f.id === currentViewFolderId)) {
      currentViewFolderId = 'all';
    }
    // Re-render list because folder counts or selection capabilities might change
    renderMemoList(); // Counts need memos, memos need folders? Actually just count display from Memos.
  });
}

function renderMemoFolderList() {
  if (!memoFolderList) return;
  memoFolderList.innerHTML = '';

  // Static Folders
  const allItem = createFolderListItem('all', 'すべてのメモ', memos.length);
  const uncategorizedCount = memos.filter(m => !m.folderId).length;
  const uncategorizedItem = createFolderListItem('uncategorized', '未分類', uncategorizedCount);

  memoFolderList.appendChild(allItem);
  memoFolderList.appendChild(uncategorizedItem);

  // User Folders
  memoFolders.forEach(f => {
    // Count logic: Memos having this folderId
    const count = memos.filter(m => m.folderId === f.id).length;
    memoFolderList.appendChild(createFolderListItem(f.id, f.name, count));
  });
}

function createFolderListItem(id, name, count) {
  const li = document.createElement('li');
  li.className = 'folder-item';
  if (currentViewFolderId === id) li.classList.add('selected');

  const spanName = document.createElement('span');
  spanName.textContent = name;

  const spanCount = document.createElement('span');
  spanCount.className = 'folder-count';
  spanCount.textContent = count;

  li.appendChild(spanName);
  li.appendChild(spanCount);

  li.addEventListener('click', () => {
    currentViewFolderId = id;
    renderMemoFolderList(); // Update highlight
    renderMemoList(); // Update content filtering
    // If mobile, maybe close sidebar? No specification.
  });

  return li;
}

if (createFolderButton) {
  createFolderButton.addEventListener('click', async () => {
    const name = prompt('新しいフォルダ名を入力してください:');
    if (!name || !name.trim()) return;
    try {
      if (!currentUserId) return;
      await addDoc(collection(db, "memo_folders"), {
        userId: currentUserId,
        name: name.trim(),
        createdAt: serverTimestamp()
      });
      // Snapshot will update UI
    } catch (e) {
      console.error("Error creating folder:", e);
      alert("フォルダ作成に失敗しました");
    }
  });
}

// Update the dropdown in the editor
function renderMemoFolderSelect() {
  if (!memoFolderSelect) return;
  // Keep selected value if possible
  const currentVal = memoFolderSelect.value;
  memoFolderSelect.innerHTML = '';

  const optUncat = document.createElement('option');
  optUncat.value = ''; // empty string for uncategorized/null
  optUncat.textContent = '未分類';
  memoFolderSelect.appendChild(optUncat);

  memoFolders.forEach(f => {
    const opt = document.createElement('option');
    opt.value = f.id;
    opt.textContent = f.name;
    memoFolderSelect.appendChild(opt);
  });

  // Restore selection or default to current memo's folder
  // Handled in renderMemoEditorState
}

if (memoFolderSelect) {
  memoFolderSelect.addEventListener('change', () => {
    // User changed folder in editor
    saveCurrentMemo(); // Save immediately with new folder
  });
}

// ===== Tags Logic =====
function renderMemoTags(tags) {
  if (!memoTagsList) return;
  memoTagsList.innerHTML = '';
  tags.forEach(tag => {
    const chip = document.createElement('div');
    chip.className = 'memo-tag-chip';

    const span = document.createElement('span');
    span.textContent = tag;

    const removeBtn = document.createElement('button');
    removeBtn.className = 'tag-remove-btn';
    removeBtn.innerHTML = '&times;';
    removeBtn.title = 'タグを削除';
    removeBtn.addEventListener('click', () => {
      chip.remove();
      saveCurrentMemo();
    });

    chip.appendChild(span);
    chip.appendChild(removeBtn);
    memoTagsList.appendChild(chip);
  });
}

if (memoTagInput) {
  memoTagInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = memoTagInput.value.trim();
      if (!val) return;

      // Handle # prefix logic if user typed it
      const cleanVal = val.startsWith('#') ? val.substring(1) : val;
      if (!cleanVal) return;

      // Add tag visual
      const currentTags = Array.from(memoTagsList.querySelectorAll('.memo-tag-chip span')).map(s => s.textContent);
      if (!currentTags.includes(cleanVal)) {
        // Optimistic render
        const newTags = [...currentTags, cleanVal];
        renderMemoTags(newTags);
        saveCurrentMemo();
      }

      memoTagInput.value = '';
    }
  });
}

// ===== Memo Logic =====
function subscribeMemos(userId) {
  if (unsubscribeMemos) unsubscribeMemos();
  // Remove orderBy to avoid needing a composite index (Fix for Missing Index error)
  const q = query(collection(db, "memos"), where("userId", "==", userId));

  unsubscribeMemos = onSnapshot(q, (snapshot) => {
    memos = [];
    snapshot.forEach(docSnap => {
      memos.push({ id: docSnap.id, ...docSnap.data() });
    });

    // Sort client-side
    memos.sort((a, b) => {
      const ta = a.updatedAt ? a.updatedAt.toMillis() : 0;
      const tb = b.updatedAt ? b.updatedAt.toMillis() : 0;
      return tb - ta; // Descending
    });

    // After memos update, we also need to update folder counts
    renderMemoFolderList();
    renderMemoList();

    // If current memo was deleted remotely, clear editor
    if (currentMemoId && !memos.find(m => m.id === currentMemoId)) {
      currentMemoId = null;
    }
    renderMemoEditorState();
  }, (error) => {
    console.error("Error subscribing to memos:", error);
    if (error.code === 'failed-precondition') {
      alert("初回のみ、データベースのインデックス構築に時間がかかる場合があります。しばらく待ってからリロードしてください。（開発者用ログ: Missing Index）");
    }
  });
}

async function createNewMemo() {
  if (!currentUserId) return;

  // Determine initial folder
  let initialFolderId = null;
  if (currentViewFolderId && currentViewFolderId !== 'all' && currentViewFolderId !== 'uncategorized') {
    initialFolderId = currentViewFolderId;
  }

  try {
    const docRef = await addDoc(collection(db, "memos"), {
      userId: currentUserId,
      title: '',
      content: '',
      folderId: initialFolderId, // Set folder if in view
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    currentMemoId = docRef.id;
    // Focus editor
    setTimeout(() => {
      const el = document.querySelector(`[data-memo-id="${currentMemoId}"]`);
      if (el) el.click();
      if (memoTitleInput) memoTitleInput.focus();
    }, 100);
  } catch (e) {
    console.error("Error creating memo:", e);
    alert("メモの作成に失敗しました。");
  }
}

async function saveCurrentMemo() {
  if (!currentMemoId || !memoContentEditor) return;

  // Clone content to strip handles before saving
  const clone = memoContentEditor.cloneNode(true);
  clone.querySelectorAll('.memo-resize-handle, .memo-delete-handle, .memo-image-selected, .selected').forEach(el => {
    if (el.classList.contains('memo-resize-handle') || el.classList.contains('memo-delete-handle')) {
      el.remove();
    } else {
      el.classList.remove('memo-image-selected');
      el.classList.remove('selected');
    }
  });

  const content = clone.innerHTML;
  const title = memoTitleInput ? memoTitleInput.value : '';
  const folderId = memoFolderSelect ? memoFolderSelect.value : null;

  // Collect tags from UI
  const currentTags = [];
  if (memoTagsList) {
    memoTagsList.querySelectorAll('.memo-tag-chip').forEach(chip => {
      const text = chip.querySelector('span')?.textContent;
      if (text) currentTags.push(text);
    });
  }

  try {
    await updateDoc(doc(db, "memos", currentMemoId), {
      title: title,
      content: content,
      folderId: folderId, // Save Folder ID
      tags: currentTags,  // Save Tags
      updatedAt: serverTimestamp()
    });
    const now = new Date();
    memoLastUpdated.textContent = `保存済み: ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
  } catch (e) {
    console.error("Error saving memo:", e);
    memoLastUpdated.textContent = "保存に失敗しました";
  }
}

// Bulk delete selection state
let selectedMemoIds = new Set();
const bulkDeleteMemoBtn = document.getElementById('bulk-delete-memo-button');

function renderMemoList() {
  if (!memoList) return;
  memoList.innerHTML = '';

  // 1. Filter by Folder
  let displayMemos = memos;
  if (currentViewFolderId === 'uncategorized') {
    displayMemos = memos.filter(m => !m.folderId);
  } else if (currentViewFolderId !== 'all') {
    displayMemos = memos.filter(m => m.folderId === currentViewFolderId);
  }

  // 2. Filter by Search Query
  if (memoSearchQuery) {
    const q = memoSearchQuery.toLowerCase();
    const isTagSearch = q.startsWith('#');
    const searchVal = isTagSearch ? q.substring(1) : q;

    displayMemos = displayMemos.filter(m => {
      if (isTagSearch) {
        // Tag match
        return m.tags && m.tags.some(t => t.toLowerCase().includes(searchVal));
      }

      const title = (m.title || '').toLowerCase();
      // Simple content text extraction (rough)
      const contentText = (m.content || '').replace(/<[^>]*>/g, '').toLowerCase();
      return title.includes(q) || contentText.includes(q) || (m.tags && m.tags.some(t => t.toLowerCase().includes(q)));
    });
  }

  const bulkBtn = document.getElementById('bulk-delete-memo-button');

  function updateBulkDeleteButtonState() {
    if (!bulkBtn) return;
    if (selectedMemoIds.size > 0) {
      bulkBtn.classList.remove('hidden');
    } else {
      bulkBtn.classList.add('hidden');
    }
  }

  if (memos.length === 0) {
    const emptyLi = document.createElement('li');
    emptyLi.textContent = 'メモがありません';
    emptyLi.style.padding = '16px';
    emptyLi.style.color = 'var(--text-secondary)';
    emptyLi.style.textAlign = 'center';
    memoList.appendChild(emptyLi);
    if (bulkBtn) bulkBtn.classList.add('hidden');
    return;
  }

  if (displayMemos.length === 0) {
    const emptyLi = document.createElement('li');
    emptyLi.textContent = '一致するメモがありません';
    emptyLi.style.padding = '16px';
    emptyLi.style.color = 'var(--text-secondary)';
    emptyLi.style.textAlign = 'center';
    memoList.appendChild(emptyLi);
    // Even if filtered out, allow bulk delete? No, maybe hide.
    if (bulkBtn) bulkBtn.classList.add('hidden');
    return;
  }

  updateBulkDeleteButtonState();

  displayMemos.forEach(memo => {
    const li = document.createElement('li');
    li.className = 'memo-item';
    if (memo.id === currentMemoId) li.classList.add('selected');
    li.dataset.memoId = memo.id;

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'memo-checkbox';
    checkbox.checked = selectedMemoIds.has(memo.id);

    checkbox.addEventListener('click', (e) => {
      e.stopPropagation();
      if (checkbox.checked) {
        selectedMemoIds.add(memo.id);
      } else {
        selectedMemoIds.delete(memo.id);
      }
      updateBulkDeleteButtonState();
    });

    const infoDiv = document.createElement('div');
    infoDiv.className = 'memo-info';

    const preview = document.createElement('div');
    preview.className = 'memo-item-preview';
    if (memo.title) {
      preview.textContent = memo.title;
      preview.style.fontWeight = 'bold';
    } else {
      preview.textContent = memo.content ? memo.content.substring(0, 30).replace(/<[^>]*>/g, '') : '(新規メモ)';
      if (!memo.content) preview.style.fontStyle = 'italic';
    }

    const dateSpan = document.createElement('div');
    dateSpan.className = 'memo-item-date';

    // Helper for date formatting
    const formatDate = (t) => {
      if (!t) return '---';
      const d = t.toDate();
      const dateStr = d.toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' });
      const timeStr = d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
      return `${dateStr} ${timeStr}`;
    };

    const createdStr = formatDate(memo.createdAt);
    const updatedStr = formatDate(memo.updatedAt);

    // Use innerHTML for multi-line
    dateSpan.innerHTML = `作: ${createdStr}<br>更: ${updatedStr}`;

    infoDiv.appendChild(preview);

    // Render Tags in List
    if (memo.tags && memo.tags.length > 0) {
      const tagsDiv = document.createElement('div');
      tagsDiv.className = 'memo-item-tags';
      memo.tags.forEach(tag => {
        const chip = document.createElement('span');
        chip.className = 'memo-tag-chip-small';
        chip.textContent = tag;
        tagsDiv.appendChild(chip);
      });
      infoDiv.appendChild(tagsDiv);
    }

    infoDiv.appendChild(dateSpan);

    li.appendChild(checkbox);
    li.appendChild(infoDiv);

    li.addEventListener('click', () => {
      currentMemoId = memo.id;
      // Update selection UI immediately for responsiveness
      document.querySelectorAll('.memo-item').forEach(i => i.classList.remove('selected'));
      li.classList.add('selected');
      renderMemoEditorState();

      // Mobile responsiveness: show editor
      const layout = document.querySelector('.memo-layout');
      if (layout) layout.classList.add('editor-active');
    });

    memoList.appendChild(li);
  });

  // Add bulk delete listener if not added
  if (bulkBtn && !bulkBtn.dataset.listenerAdded) {
    bulkBtn.addEventListener('click', async () => {
      if (selectedMemoIds.size === 0) return;
      if (!confirm(`${selectedMemoIds.size}件のメモを削除しますか？`)) return;

      try {
        const batch = writeBatch(db);
        selectedMemoIds.forEach(id => {
          batch.delete(doc(db, "memos", id));
        });
        await batch.commit();
        selectedMemoIds.clear();
      } catch (e) {
        console.error("Error bulk deleting:", e);
        alert("削除に失敗しました");
      }
    });
    bulkBtn.dataset.listenerAdded = "true";
  }
}

function renderMemoEditorState() {
  if (!memoEditor || !memoEditorPlaceholder) return;

  if (currentMemoId) {
    const memo = memos.find(m => m.id === currentMemoId);
    if (!memo) {
      currentMemoId = null;
      renderMemoEditorState();
      return;
    }

    memoEditorPlaceholder.classList.add('hidden');
    memoEditor.classList.remove('hidden');

    // Update title
    if (memoTitleInput) {
      memoTitleInput.value = memo.title || '';
    }

    // Update Folder Select
    if (memoFolderSelect) {
      memoFolderSelect.value = memo.folderId || '';
    }

    // Update Tags
    renderMemoTags(memo.tags || []);

    // Update innerHTML if not focused
    if (document.activeElement !== memoContentEditor) {
      memoContentEditor.innerHTML = memo.content || '';
    } else if (memo.content === '' && memoContentEditor.innerHTML === '') {
      memoContentEditor.innerHTML = '';
    }

    // Make sure all images have draggable=false (to prevent native ghost)
    makeElementsFreeDraggable();

    const formatDateFull = (t) => {
      if (!t) return '---';
      const d = t.toDate();
      return `${d.toLocaleDateString('ja-JP')} ${d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`;
    };

    const createdText = memo.createdAt ? formatDateFull(memo.createdAt) : '---';
    const updatedText = memo.updatedAt ? formatDateFull(memo.updatedAt) : '---';

    memoLastUpdated.textContent = `作成: ${createdText} / 最終更新: ${updatedText}`;

  } else {
    memoEditorPlaceholder.classList.remove('hidden');
    memoEditor.classList.add('hidden');
    if (memoContentEditor) memoContentEditor.innerHTML = '';

    // Mobile responsiveness
    const layout = document.querySelector('.memo-layout');
    if (layout) layout.classList.remove('editor-active');
  }
}

// Image Handling & Cropper
let cropper = null;
let currentImageFile = null;
let currentlyEditingImg = null; // DOM element <img> being edited

async function openImageEditor(source) {
  if (!source) return;

  let blob = null;

  try {
    if (typeof source === 'string') {
      memoLastUpdated.textContent = "画像を読み込み中...";
      const response = await fetch(source);
      blob = await response.blob();
      currentImageFile = { name: `edited_${Date.now()}.png` };
    } else {
      // New upload
      blob = source;
      currentImageFile = source;
      currentlyEditingImg = null;
    }

    if (!blob) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      imageEditorPreview.src = e.target.result;
      imageEditorModalBackdrop.classList.remove('hidden');

      if (cropper) {
        cropper.destroy();
      }
      cropper = new Cropper(imageEditorPreview, {
        viewMode: 1,
        dragMode: 'move',
        autoCropArea: 1,
        restore: false,
        guides: true,
        center: true,
        highlight: false,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: false,
        crop(event) {
          // Update inputs only if user is NOT typing
          if (document.activeElement !== imageEditorWidth && document.activeElement !== imageEditorHeight) {
            imageEditorWidth.value = Math.round(event.detail.width);
            imageEditorHeight.value = Math.round(event.detail.height);
          }
        }
      });
      memoLastUpdated.textContent = "";
    };
    reader.readAsDataURL(blob);

  } catch (e) {
    console.error("Error loading image for editing:", e);
    alert("画像の読み込みに失敗しました（CORS制限の可能性があります）");
    memoLastUpdated.textContent = "読み込み失敗";
  }
}

// Logic to maintain aspect ratio when typing
if (imageEditorWidth && imageEditorHeight) {
  imageEditorWidth.addEventListener('input', () => {
    if (!cropper) return;
    const data = cropper.getData();
    const ratio = data.width / data.height;
    const newWidth = parseInt(imageEditorWidth.value) || 0;
    imageEditorHeight.value = Math.round(newWidth / ratio);
  });

  imageEditorHeight.addEventListener('input', () => {
    if (!cropper) return;
    const data = cropper.getData();
    const ratio = data.width / data.height;
    const newHeight = parseInt(imageEditorHeight.value) || 0;
    imageEditorWidth.value = Math.round(newHeight * ratio);
  });
}

function closeImageEditor() {
  imageEditorModalBackdrop.classList.add('hidden');
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
  imageEditorPreview.src = '';
  currentImageFile = null;
  currentlyEditingImg = null;
  // Reset input so change event fires again if same file selected
  if (memoImageInput) memoImageInput.value = '';
}

async function uploadCroppedImage(blob) {
  if (!blob || !currentUserId) return;

  try {
    memoLastUpdated.textContent = "画像をアップロード中...";
    const fileName = currentImageFile ? currentImageFile.name : `image_${Date.now()}.png`;
    const filePath = `memos/${currentUserId}/${Date.now()}_${fileName}`;
    const imageRef = storageRef(storage, filePath);

    await uploadBytes(imageRef, blob);
    const downloadURL = await getDownloadURL(imageRef);

    if (currentlyEditingImg) {
      // Replace existing image
      currentlyEditingImg.src = downloadURL;
    } else if (memoContentEditor) {
      // Insert new image manually to control attributes
      memoContentEditor.focus();
      // Fallback or explicit insertion
      const img = document.createElement('img');
      img.src = downloadURL;
      img.style.maxWidth = "100%";
      img.style.borderRadius = "4px";
      img.style.cursor = "move";
      img.draggable = false;
      // Default to inline for new images, user can drag to float.
      // Or maybe float immediately? "Standard flow" is better initial default unless user drags.

      // Insert at cursor
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(img);
        // Move cursor after image
        range.setStartAfter(img);
        range.setEndAfter(img);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        memoContentEditor.appendChild(img);
      }
    }
    // Trigger save
    saveCurrentMemo();
    closeImageEditor();
  } catch (e) {
    console.error("Upload error:", e);
    const msg = e.code ? e.code : e.message;
    memoLastUpdated.textContent = `エラー: ${msg}`;
    alert(`画像のアップロードに失敗しました: ${msg}`);
  }
}

// Helper to setup free drag
function makeElementsFreeDraggable() {
  if (!memoContentEditor) return;
  const elements = memoContentEditor.querySelectorAll('img, .memo-box');
  elements.forEach(el => {
    el.draggable = false;
    el.style.cursor = 'move';
  });
}

// Element Selection and Resizing Logic
let selectedElement = null; // Renamed from selectedImage
let resizeHandle = null;
let deleteHandle = null;
let isResizing = false;
let isDraggingElement = false;
let dragTarget = null;
let startX = 0;
let startY = 0;
let initialLeft = 0;
let initialTop = 0;
let initialWidth = 0;
let initialHeight = 0;
let didMove = false;

// Box Drawing Logic
let isDrawingBox = false;
const insertBoxButton = document.getElementById('insert-box-button');
let currentDrawingBox = null;

if (insertBoxButton) {
  insertBoxButton.addEventListener('click', () => {
    isDrawingBox = true;
    memoContentEditor.style.cursor = 'crosshair';
    // Clear selection
    deselectElement();
    memoLastUpdated.textContent = 'ドラッグして枠を描画してください';
  });
}

function deselectElement() {
  if (selectedElement) {
    selectedElement.classList.remove('memo-image-selected');
    selectedElement.classList.remove('selected');
    if (resizeHandle) {
      resizeHandle.remove();
      resizeHandle = null;
    }
    if (deleteHandle) {
      deleteHandle.remove();
      deleteHandle = null;
    }
    selectedElement = null;
  }
}

function selectElement(el) {
  if (selectedElement === el) return;
  deselectElement();
  selectedElement = el;

  if (el.tagName === 'IMG') {
    el.classList.add('memo-image-selected');
  } else if (el.classList.contains('memo-box')) {
    el.classList.add('selected');
    // Sync toolbar color indicator
    const indicator = document.getElementById('toolbar-color')?.querySelector('.color-indicator');
    if (indicator) {
      indicator.style.color = el.style.borderColor || '#555';
    }
  }

  // Create handle
  resizeHandle = document.createElement('div');
  resizeHandle.className = 'memo-resize-handle';
  memoContentEditor.appendChild(resizeHandle);

  // Create delete handle
  deleteHandle = document.createElement('div');
  deleteHandle.className = 'memo-delete-handle';
  deleteHandle.innerHTML = '×';
  // Prevent drag start on handle
  deleteHandle.addEventListener('mousedown', (e) => { e.stopPropagation(); });
  deleteHandle.addEventListener('touchstart', (e) => { e.stopPropagation(); });

  const deleteAction = (e) => {
    e.stopPropagation();
    if (confirm('この要素を削除しますか？')) {
      selectedElement.remove();
      deselectElement();
      saveCurrentMemo();
    }
  };
  deleteHandle.addEventListener('click', deleteAction);
  // Touch often fires click, but sticking to click is safer if propagation stopped.

  memoContentEditor.appendChild(deleteHandle);

  updateResizeHandlePosition();
}

function updateResizeHandlePosition() {
  if (!selectedElement || !resizeHandle) return;

  const elRect = selectedElement.getBoundingClientRect();
  const containerRect = memoContentEditor.getBoundingClientRect();

  const scrollL = memoContentEditor.scrollLeft;
  const scrollT = memoContentEditor.scrollTop;

  const left = elRect.left - containerRect.left + scrollL + elRect.width;
  const top = elRect.top - containerRect.top + scrollT + elRect.height;

  resizeHandle.style.left = `${left}px`;
  resizeHandle.style.top = `${top}px`;

  if (deleteHandle) {
    // Top-Right corner
    const delLeft = elRect.left - containerRect.left + scrollL + elRect.width;
    const delTop = elRect.top - containerRect.top + scrollT;
    deleteHandle.style.left = `${delLeft}px`;
    deleteHandle.style.top = `${delTop}px`;
  }
}

if (memoContentEditor) {
  // Global Deselect on clicking background
  memoContentEditor.addEventListener('mousedown', (e) => {
    if (isDrawingBox) return; // Drawing handled below
    if (e.target === memoContentEditor) {
      deselectElement();
    }
  });

  memoContentEditor.addEventListener('mousedown', (e) => {
    // 0. Handle Box Drawing Start
    if (isDrawingBox && e.target === memoContentEditor) {
      e.preventDefault();
      startX = e.clientX;
      startY = e.clientY;

      const containerRect = memoContentEditor.getBoundingClientRect();
      const scrollL = memoContentEditor.scrollLeft;
      const scrollT = memoContentEditor.scrollTop;

      const relativeX = startX - containerRect.left + scrollL;
      const relativeY = startY - containerRect.top + scrollT;

      currentDrawingBox = document.createElement('div');
      currentDrawingBox.className = 'memo-box';
      currentDrawingBox.style.left = `${relativeX}px`;
      currentDrawingBox.style.top = `${relativeY}px`;
      currentDrawingBox.style.width = '0px';
      currentDrawingBox.style.height = '0px';

      memoContentEditor.appendChild(currentDrawingBox);
      return;
    }

    // 1. Handle Resize Start
    if (e.target.classList.contains('memo-resize-handle')) {
      e.preventDefault();
      e.stopPropagation();
      isResizing = true;
      startX = e.clientX;
      startY = e.clientY;
      initialWidth = selectedElement.offsetWidth;
      initialHeight = selectedElement.offsetHeight;
      return;
    }

    // 2. Handle Element (Image/Box) Drag Start
    if (e.target.tagName === 'IMG' || e.target.classList.contains('memo-box')) {
      if (isDrawingBox) return; // Don't allow drag while drawing mode is active (though shouldn't happen if clicking on element)

      e.preventDefault();
      // If clicking a different element, select it first
      if (selectedElement !== e.target) {
        selectElement(e.target);
      }

      isDraggingElement = true;
      dragTarget = e.target;
      startX = e.clientX;
      startY = e.clientY;
      didMove = false;

      const computed = window.getComputedStyle(dragTarget);
      if (computed.position === 'absolute') {
        initialLeft = parseFloat(computed.left) || 0;
        initialTop = parseFloat(computed.top) || 0;
      } else {
        const rect = dragTarget.getBoundingClientRect();
        const containerRect = memoContentEditor.getBoundingClientRect();
        initialLeft = rect.left - containerRect.left + memoContentEditor.scrollLeft;
        initialTop = rect.top - containerRect.top + memoContentEditor.scrollTop;
      }
    }
  });

  // Mouse Move
  document.addEventListener('mousemove', (e) => {
    // Drawing Box
    if (isDrawingBox && currentDrawingBox) {
      e.preventDefault();
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      // Allow dragging in any direction
      if (dx >= 0) {
        currentDrawingBox.style.width = `${dx}px`;
      } else {
        // Dragging left
        // We set new left and width
        // But need initial reference?
        // Simpler implementation: just width/height > 0
        // For accurate reverse dragging, we need startX/Y relative to container.
        // Let's stick to simple right-down drawing for MVP or calculate properly.
      }
      currentDrawingBox.style.width = `${Math.abs(dx)}px`;
      currentDrawingBox.style.height = `${Math.abs(dy)}px`;

      // Handle negative direction
      const containerRect = memoContentEditor.getBoundingClientRect();
      const scrollL = memoContentEditor.scrollLeft;
      const scrollT = memoContentEditor.scrollTop;
      const relativeStartX = startX - containerRect.left + scrollL;
      const relativeStartY = startY - containerRect.top + scrollT;

      if (dx < 0) {
        currentDrawingBox.style.left = `${relativeStartX + dx}px`;
      }
      if (dy < 0) {
        currentDrawingBox.style.top = `${relativeStartY + dy}px`;
      }

      return;
    }

    if (isResizing && selectedElement) {
      e.preventDefault();
      const dx = e.clientX - startX;
      // const dy = e.clientY - startY; 

      const newW = Math.max(20, initialWidth + dx);
      selectedElement.style.width = `${newW}px`;

      if (selectedElement.tagName === 'IMG') {
        // Maintain aspect ratio for images
        selectedElement.style.height = 'auto';
      } else {
        // Free aspect ratio for boxes
        const dy = e.clientY - startY;
        const newH = Math.max(20, initialHeight + dy);
        selectedElement.style.height = `${newH}px`;
      }

      updateResizeHandlePosition();
      return;
    }

    if (isDraggingElement && dragTarget) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        didMove = true;
      }

      if (didMove) {
        if (dragTarget.style.position !== 'absolute') {
          dragTarget.style.position = 'absolute';
          dragTarget.style.zIndex = '100'; // High z-index while dragging
          dragTarget.style.width = dragTarget.offsetWidth + 'px';
        }
        dragTarget.style.left = (initialLeft + dx) + 'px';
        dragTarget.style.top = (initialTop + dy) + 'px';

        // If we are dragging the selected element, update handle too
        if (dragTarget === selectedElement) {
          updateResizeHandlePosition();
        }
      }
    }
  });

  // Mouse Up
  document.addEventListener('mouseup', (e) => {
    // Finish Drawing
    if (isDrawingBox && currentDrawingBox) {
      isDrawingBox = false;
      currentDrawingBox = null;
      memoContentEditor.style.cursor = 'text';
      saveCurrentMemo();
      makeElementsFreeDraggable(); // Ensure new box is draggable
      memoLastUpdated.textContent = '保存済み';
      return;
    }
    // Cancel drawing if clicked without dragging or released outside
    if (isDrawingBox && !currentDrawingBox) {
      // Just clicked? Cancel mode
      isDrawingBox = false;
      memoContentEditor.style.cursor = 'text';
      memoLastUpdated.textContent = '';
    }

    if (isResizing) {
      isResizing = false;
      saveCurrentMemo();
      return;
    }

    if (isDraggingElement && dragTarget) {
      if (!didMove) {
        // Clicked. Already selected.
      } else {
        // Drag finished
        // Reset z-index to allow DOM ordering to take effect
        // unless we want to keep it floating "above" text permanently?
        // But for layering feature, we rely on DOM order.
        if (dragTarget.style.position === 'absolute') {
          dragTarget.style.zIndex = '';
        }
        saveCurrentMemo();
      }
    }
    isDraggingElement = false;
    dragTarget = null;
  });

  // Double Click to Open Editor
  memoContentEditor.addEventListener('dblclick', (e) => {
    if (e.target.tagName === 'IMG') {
      currentlyEditingImg = e.target;
      openImageEditor(e.target.src);
      // Also deselect to avoid artifacts in editor?
      deselectElement();
    }
  });

  // Remove element on Backspace?
  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Backspace' || e.key === 'Delete') && selectedElement) {
      // If editing text inside box? Box is container?
      // Current implementation: Box is empty div.
      // Prevent if focus is inside? 
      if (memoContentEditor.contains(document.activeElement)) {
        // If user is typing text, don't delete box?
        // But selectedElement is set via click.
        // If we add support for text inside box later, check selection.
      }
      selectedElement.remove();
      deselectElement();
      saveCurrentMemo();
    }
  });

  // Touch support for mobile
  memoContentEditor.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];

    // 1. Handle Resize Start (Touch)
    if (e.target.classList.contains('memo-resize-handle')) {
      e.stopPropagation(); // Don't deselect
      // Prevent default to stop scrolling/zooming while resizing?
      // e.preventDefault(); 
      isResizing = true;
      startX = touch.clientX;
      startY = touch.clientY;
      initialWidth = selectedElement.offsetWidth;
      initialHeight = selectedElement.offsetHeight;
      return;
    }

    // 2. Handle Element Drag Start (Touch)
    if (e.target.tagName === 'IMG' || e.target.classList.contains('memo-box')) {
      // If clicking a different element, select it first
      if (selectedElement !== e.target) {
        selectElement(e.target);
      }

      isDraggingElement = true;
      dragTarget = e.target;
      startX = touch.clientX;
      startY = touch.clientY;
      didMove = false;

      const computed = window.getComputedStyle(dragTarget);
      if (computed.position === 'absolute') {
        initialLeft = parseFloat(computed.left) || 0;
        initialTop = parseFloat(computed.top) || 0;
      } else {
        const rect = dragTarget.getBoundingClientRect();
        const containerRect = memoContentEditor.getBoundingClientRect();
        initialLeft = rect.left - containerRect.left + memoContentEditor.scrollLeft;
        initialTop = rect.top - containerRect.top + memoContentEditor.scrollTop;
      }
    }
  }, { passive: false });

  document.addEventListener('touchmove', (e) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];

    // Resizing
    if (isResizing && selectedElement) {
      e.preventDefault(); // Stop scroll
      const dx = touch.clientX - startX;
      // Simple Width/Height scaling
      const newW = Math.max(20, initialWidth + dx);

      selectedElement.style.width = `${newW}px`;
      if (selectedElement.tagName === 'IMG') {
        selectedElement.style.height = 'auto';
      } else {
        const dy = touch.clientY - startY;
        const newH = Math.max(20, initialHeight + dy);
        selectedElement.style.height = `${newH}px`;
      }
      updateResizeHandlePosition();
      return;
    }

    // Dragging
    if (isDraggingElement && dragTarget) {
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;

      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        didMove = true;
        e.preventDefault(); // Stop scrolling once we are definitely dragging
      }

      if (didMove) {
        if (dragTarget.style.position !== 'absolute') {
          dragTarget.style.position = 'absolute';
          dragTarget.style.zIndex = '10';
          dragTarget.style.width = dragTarget.offsetWidth + 'px';
        }
        dragTarget.style.left = (initialLeft + dx) + 'px';
        dragTarget.style.top = (initialTop + dy) + 'px';

        if (dragTarget === selectedImage) {
          updateResizeHandlePosition();
        }
      }
    }
  }, { passive: false });

  document.addEventListener('touchend', (e) => {
    if (isResizing) {
      isResizing = false;
      saveCurrentMemo();
      return;
    }

    if (isDraggingElement && dragTarget) {
      if (!didMove) {
        // Tap. Do nothing (Select happened in touchstart).
      } else {
        // Drag finished
        if (dragTarget.style.position === 'absolute') {
          dragTarget.style.zIndex = '';
        }
        saveCurrentMemo();
      }
    }
    isDraggingElement = false;
    dragTarget = null;
  });
}

// Listeners
// Text Formatting Toolbar Logic
if (toolbarBold) {
  toolbarBold.addEventListener('mousedown', (e) => {
    e.preventDefault(); // Prevent losing focus from editor
    document.execCommand('bold', false, null);
    updateToolbarState();
  });
}

if (toolbarColor) {
  toolbarColor.addEventListener('mousedown', (e) => {
    e.preventDefault();
    toolbarColorPalette.classList.toggle('hidden');
  });
}

const toolbarLayerFront = document.getElementById('toolbar-layer-front');
const toolbarLayerBack = document.getElementById('toolbar-layer-back');

if (toolbarLayerFront) {
  toolbarLayerFront.addEventListener('click', (e) => {
    e.preventDefault();
    if (selectedElement && folderIdIsAbsolute(selectedElement)) {
      memoContentEditor.appendChild(selectedElement);
      // Re-select to ensure handles are on top
      const el = selectedElement;
      deselectElement(); // removes handles
      selectElement(el); // adds handles at end
      saveCurrentMemo();
    }
  });
}

if (toolbarLayerBack) {
  toolbarLayerBack.addEventListener('click', (e) => {
    e.preventDefault();
    if (selectedElement && folderIdIsAbsolute(selectedElement)) {
      if (memoContentEditor.firstChild) {
        memoContentEditor.insertBefore(selectedElement, memoContentEditor.firstChild);
      } else {
        memoContentEditor.appendChild(selectedElement);
      }
      const el = selectedElement;
      deselectElement();
      selectElement(el);
      saveCurrentMemo();
    }
  });
}

function folderIdIsAbsolute(el) {
  // Use computed style to detect position: absolute even from CSS classes
  return window.getComputedStyle(el).position === 'absolute';
}

if (toolbarColorPalette) {
  toolbarColorPalette.querySelectorAll('.color-dot').forEach(btn => {
    btn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      const color = btn.dataset.color;

      // Handle Box Color
      if (selectedElement && selectedElement.classList.contains('memo-box')) {
        const borderColor = color === 'inherit' ? '#555' : color;
        selectedElement.style.borderColor = borderColor;
        saveCurrentMemo();
      }
      // Handle Image Border? (Optional, future)
      // Default: Handle Text Color
      else {
        if (color === 'inherit') {
          document.execCommand('removeFormat', false, 'foreColor');
          document.execCommand('foreColor', false, '#333333');
        } else {
          document.execCommand('foreColor', false, color);
        }
      }

      toolbarColorPalette.classList.add('hidden');

      const indicator = toolbarColor.querySelector('.color-indicator');
      if (indicator) indicator.style.color = color === 'inherit' ? 'var(--text-primary)' : color;
    });
  });

  document.addEventListener('mousedown', (e) => {
    if (toolbarColor && !toolbarColor.contains(e.target) && !toolbarColorPalette.contains(e.target)) {
      toolbarColorPalette.classList.add('hidden');
    }
  });
}

function updateToolbarState() {
  // Optional: Update button state
}

if (memoContentEditor) {
  memoContentEditor.addEventListener('keyup', updateToolbarState);
  memoContentEditor.addEventListener('mouseup', updateToolbarState);
  memoContentEditor.addEventListener('touchend', updateToolbarState);
}

if (insertImageButton && memoImageInput) {
  insertImageButton.addEventListener('click', () => {
    memoImageInput.click();
  });

  memoImageInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      openImageEditor(e.target.files[0]);
    }
  });

  // Click listener for image edit is moved to mouseup logic to distinguish from drag

}

if (imageEditorCancel) {
  imageEditorCancel.addEventListener('click', closeImageEditor);
}

if (imageEditorSave) {
  imageEditorSave.addEventListener('click', () => {
    if (cropper) {
      // Use inputs for output size
      const w = parseInt(imageEditorWidth.value);
      const h = parseInt(imageEditorHeight.value);
      const options = (w > 0 && h > 0) ? { width: w, height: h } : {};

      cropper.getCroppedCanvas(options).toBlob((blob) => {
        uploadCroppedImage(blob);
      });
    }
  });
}

if (memoSearchInput) {
  memoSearchInput.addEventListener('input', (e) => {
    memoSearchQuery = e.target.value.trim();
    renderMemoList();
  });
}

if (memoBackButton) {
  memoBackButton.addEventListener('click', () => {
    currentMemoId = null; // Deselect
    renderMemoEditorState();
  });
}
// We need a "back" button in editor header for mobile?
// Current design didn't include it in HTML, let's add it dynamically if needed or just rely on Sidebar toggle?
// On mobile, sidebar is hidden when editor is active. We need a way to go back to list.
// Let's add a back button to .memo-editor-header if not present, only visible on mobile via CSS?
// For now, let's assume user uses the "Delete" button or we add a "Done" button.
// Actually, let's add a "Back" button to the editor header in JS for simplicity, or just update HTML later.
// For this iteration, I'll add a back chevron to the header via JS.
const memoHeader = document.querySelector('.memo-editor-header');
if (memoHeader && !document.getElementById('memo-mobile-back')) {
  const backBtn = document.createElement('button');
  backBtn.id = 'memo-mobile-back';
  backBtn.className = 'icon-button mobile-only';
  backBtn.textContent = '←';
  backBtn.style.marginRight = 'auto'; // Push others to right
  backBtn.style.fontSize = '1.2rem';
  backBtn.addEventListener('click', () => {
    currentMemoId = null; // Deselect
    renderMemoEditorState();
  });
  // Insert at beginning
  memoHeader.insertBefore(backBtn, memoHeader.firstChild);
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

if (startTaskButton) {
  startTaskButton.addEventListener('click', () => { enterTaskWorkspace(); });
}
if (startTodoButton) {
  startTodoButton.addEventListener('click', () => { enterTodoWorkspace(); });
}
if (todoBackStartupButton) {
  todoBackStartupButton.addEventListener('click', () => { showStartupScreen(); });
}

if (openCandidatePanelButton) {
  openCandidatePanelButton.addEventListener('click', () => {
    if (candidatePanel) candidatePanel.classList.remove('hidden');
    if (candidateNameInput) candidateNameInput.focus();
  });
}
if (candidateForm) {
  candidateForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = (candidateNameInput?.value || '').trim();
    const start = (candidateStartInput?.value || '').trim();
    const dept = (candidateDeptInput?.value || '').trim();
    const grade = (candidateGradeInput?.value || '').trim();
    const note = (candidateNoteInput?.value || '').trim();
    const type = (candidateTypeInput?.value || '').trim();
    if (!name) return;
    const tasks = DEFAULT_CANDIDATE_TASKS.map((t, idx) => ({
      id: `t-${Date.now()}-${idx}`,
      text: t,
      done: false,
      stage: '',
      schedule: '',
      infoProvided: false,
      onboardingSchedule: '',
      onboardingItemsProvided: false
    }));
    const next = [...loadCandidates(), { id: Date.now().toString(), name, start, dept, grade, note, type, tasks, interviews: normalizeInterviews([]) }];
    saveCandidates(next);
    renderCandidates(next);
    if (candidateNameInput) candidateNameInput.value = '';
    if (candidateStartInput) candidateStartInput.value = '';
    if (candidateDeptInput) candidateDeptInput.value = '';
    if (candidateGradeInput) candidateGradeInput.value = '';
    if (candidateNoteInput) candidateNoteInput.value = '';
    if (candidateTypeInput) candidateTypeInput.value = '';
    candidateNameInput?.focus();
  });
}
if (candidateModalCloseButton && candidateModalBackdrop) {
  candidateModalCloseButton.addEventListener('click', () => closeCandidateModal());
  candidateModalBackdrop.addEventListener('click', (e) => { if (e.target === candidateModalBackdrop) closeCandidateModal(); });
}
if (interviewModalBackdrop) {
  interviewModalBackdrop.addEventListener('click', (e) => { if (e.target === interviewModalBackdrop) closeInterviewModal(); });
}
if (interviewModalCancelButton) {
  interviewModalCancelButton.addEventListener('click', closeInterviewModal);
}
if (interviewModalSaveButton) {
  interviewModalSaveButton.addEventListener('click', saveInterviewDetails);
}
if (onboardingModalBackdrop) {
  onboardingModalBackdrop.addEventListener('click', (e) => { if (e.target === onboardingModalBackdrop) closeOnboardingModal(); });
}
if (onboardingModalCancelButton) {
  onboardingModalCancelButton.addEventListener('click', closeOnboardingModal);
}
if (onboardingModalSaveButton) {
  onboardingModalSaveButton.addEventListener('click', saveOnboardingDetails);
}
if (todoSettingsButton) {
  todoSettingsButton.addEventListener('click', async () => {
    todoSettingsModalBackdrop?.classList.remove('hidden');
    document.body.classList.add('modal-open');
    const items = await fetchGithubUpdates();
    renderUpdatesFull(items, todoUpdatesList);
  });
}
const closeTodoSettings = () => {
  todoSettingsModalBackdrop?.classList.add('hidden');
  document.body.classList.remove('modal-open');
};
if (closeTodoSettingsModalButton) closeTodoSettingsModalButton.addEventListener('click', closeTodoSettings);
if (todoSettingsModalBackdrop) {
  todoSettingsModalBackdrop.addEventListener('click', (e) => { if (e.target === todoSettingsModalBackdrop) closeTodoSettings(); });
}
if (candidateDetailForm) {
  candidateDetailForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentCandidateId) return closeCandidateModal();
    const list = loadCandidates();
    const idx = list.findIndex(c => c.id === currentCandidateId);
    if (idx === -1) return closeCandidateModal();
    const tasks = readDetailTasks();
    list[idx] = {
      ...list[idx],
      name: candidateDetailNameInput?.value.trim() || '',
      start: candidateDetailStartInput?.value.trim() || '',
      dept: candidateDetailDeptInput?.value.trim() || '',
      grade: candidateDetailGradeInput?.value.trim() || '',
      note: candidateDetailNoteInput?.value.trim() || '',
      type: candidateDetailTypeInput?.value.trim() || '',
      tasks,
      interviews: currentInterviews
    };
    saveCandidates(list);
    renderCandidates(list);
    closeCandidateModal();
  });
}

function loadCandidates() {
  try {
    const raw = localStorage.getItem(CANDIDATE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) return parsed.map(normalizeCandidate);
  } catch (e) { console.warn('Failed to parse candidates', e); }
  return [];
}
function saveCandidates(list) {
  try { localStorage.setItem(CANDIDATE_STORAGE_KEY, JSON.stringify(list)); } catch (e) { console.warn('Failed to save candidates', e); }
}
function renderCandidates(list = loadCandidates()) {
  if (!candidateList) return;
  candidateList.innerHTML = '';
  if (!list.length) {
    candidateList.classList.add('empty-state');
    const li = document.createElement('li');
    li.className = 'candidate-empty';
    li.textContent = 'まだ登録がありません。';
    candidateList.appendChild(li);
    return;
  }
  candidateList.classList.remove('empty-state');
  list.forEach(c => {
    const li = document.createElement('li');
    li.dataset.id = c.id;
    const info = document.createElement('div');
    const nameSpan = document.createElement('div');
    nameSpan.className = 'candidate-name';
    nameSpan.textContent = c.name;
    const meta = document.createElement('div');
    meta.className = 'candidate-meta';
    const parts = [];
    if (c.start) parts.push(`入社予定日: ${c.start}`);
    if (c.dept) parts.push(`部署: ${c.dept}`);
    if (c.grade) parts.push(`グレード: ${c.grade}`);
    if (c.type) parts.push(`区分: ${c.type}`);
    if (c.note) parts.push(c.note);
    meta.textContent = parts.join(' / ');
    info.appendChild(nameSpan);
    info.appendChild(meta);
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'candidate-remove';
    removeBtn.innerHTML = '<span class=\"icon\">🗑️</span>削除';
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!confirm('この求職者を削除しますか？')) return;
      const next = loadCandidates().filter(item => item.id !== c.id);
      saveCandidates(next);
      renderCandidates(next);
    });
    li.append(info, removeBtn);
    li.addEventListener('click', (e) => {
      if (e.target.closest('.candidate-remove')) return;
      openCandidateModal(c.id);
    });
    candidateList.appendChild(li);
  });
}

function normalizeCandidate(c) {
  const tasks = Array.isArray(c.tasks) && c.tasks.length
    ? c.tasks.map((t, idx) => ({
      id: t.id || `t-${c.id || idx}-${idx}`,
      text: t.text || t,
      done: !!t.done,
      stage: t.stage || '',
      schedule: t.schedule || '',
      infoProvided: !!t.infoProvided,
      onboardingSchedule: t.onboardingSchedule || '',
      onboardingItemsProvided: !!t.onboardingItemsProvided
    }))
    : DEFAULT_CANDIDATE_TASKS.map((t, idx) => ({
      id: `t-${c.id || 'new'}-${idx}`,
      text: t,
      done: false,
      stage: '',
      schedule: '',
      infoProvided: false,
      onboardingSchedule: '',
      onboardingItemsProvided: false
    }));
  return { ...c, tasks, interviews: normalizeInterviews(c.interviews) };
}

function normalizeInterviews(interviews) {
  const base = INTERVIEW_STAGES.map(stage => ({ stage, schedule: '', infoProvided: false }));
  if (!Array.isArray(interviews)) return base;
  return base.map(row => {
    const found = interviews.find(i => i.stage === row.stage);
    if (found) return { stage: row.stage, schedule: found.schedule || '', infoProvided: !!found.infoProvided };
    return row;
  });
}

function openCandidateModal(id) {
  const list = loadCandidates();
  const candidate = list.find(c => c.id === id);
  if (!candidate || !candidateModalBackdrop) return;
  currentCandidateId = id;
  currentDetailTasks = (candidate.tasks || []).map(t => ({ ...t }));
  if (candidateDetailNameInput) candidateDetailNameInput.value = candidate.name || '';
  if (candidateDetailStartInput) candidateDetailStartInput.value = candidate.start || '';
  if (candidateDetailDeptInput) candidateDetailDeptInput.value = candidate.dept || '';
  if (candidateDetailGradeInput) candidateDetailGradeInput.value = candidate.grade || '';
  if (candidateDetailNoteInput) candidateDetailNoteInput.value = candidate.note || '';
  if (candidateDetailTypeInput) candidateDetailTypeInput.value = candidate.type || '';
  currentInterviews = normalizeInterviews(candidate.interviews || []);
  renderDetailTasks(currentDetailTasks);
  candidateModalBackdrop.classList.remove('hidden');
}

function renderDetailTasks(tasks) {
  if (!candidateDetailTasks) return;
  candidateDetailTasks.innerHTML = '';
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.dataset.taskId = task.id;
    const label = document.createElement('label');
    label.style.display = 'flex';
    label.style.alignItems = 'center';
    label.style.gap = '8px';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = !!task.done;
    cb.dataset.id = task.id;
    const span = document.createElement('span');
    span.textContent = task.text;
    const meta = document.createElement('div');
    meta.className = 'candidate-meta';
    const metaParts = [];
    if (task.stage) metaParts.push(task.stage);
    if (task.schedule) metaParts.push(task.schedule);
    if (task.infoProvided) metaParts.push('面接官へ情報提供済み');
    meta.textContent = metaParts.join(' / ');
    meta.style.color = 'var(--text-secondary)';
    meta.style.fontSize = '0.9rem';
    label.append(cb, span);
    li.append(label);
    candidateDetailTasks.appendChild(li);
    if (task.text && task.text.includes('面接')) {
      li.addEventListener('click', (e) => {
        if (e.target === cb) return;
        openInterviewModal();
      });
    }
    if (task.text && task.text.includes('入社前説明')) {
      li.addEventListener('click', (e) => {
        if (e.target === cb) return;
        openOnboardingModal(task.id);
      });
    }
  });
}

function renderInterviewModalList() {
  if (!interviewModalList) return;
  interviewModalList.innerHTML = '';
  currentInterviews.forEach((iv) => {
    const li = document.createElement('li');
    const stage = document.createElement('div');
    stage.className = 'stage-label';
    stage.textContent = iv.stage;
    const dt = document.createElement('input');
    dt.type = 'datetime-local';
    dt.value = iv.schedule || '';
    const infoRow = document.createElement('label');
    infoRow.className = 'info-provided';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = !!iv.infoProvided;
    const text = document.createElement('span');
    text.textContent = '面接官へ情報提供済み';
    infoRow.append(cb, text);
    li.append(stage, dt, infoRow);
    interviewModalList.appendChild(li);
  });
}

function readDetailTasks() {
  return currentDetailTasks.map(task => {
    const cb = candidateDetailTasks?.querySelector(`input[data-id="${task.id}"]`);
    return {
      ...task,
      done: cb ? cb.checked : !!task.done
    };
  });
}

function closeCandidateModal() {
  currentCandidateId = null;
  currentDetailTasks = [];
  currentInterviews = [];
  currentOnboardingTaskId = null;
  closeInterviewModal();
  closeOnboardingModal();
  if (candidateModalBackdrop) candidateModalBackdrop.classList.add('hidden');
}

function openInterviewModal(taskId) {
  currentInterviewTaskId = taskId || null;
  renderInterviewModalList();
  if (interviewModalBackdrop) interviewModalBackdrop.classList.remove('hidden');
}

function closeInterviewModal() {
  currentInterviewTaskId = null;
  if (interviewModalBackdrop) interviewModalBackdrop.classList.add('hidden');
}

function openOnboardingModal(taskId) {
  currentOnboardingTaskId = taskId;
  const task = currentDetailTasks.find(t => t.id === taskId);
  if (onboardingDatetimeInput) onboardingDatetimeInput.value = task?.onboardingSchedule || '';
  if (onboardingItemsCheckbox) onboardingItemsCheckbox.checked = !!task?.onboardingItemsProvided;
  if (onboardingModalBackdrop) onboardingModalBackdrop.classList.remove('hidden');
}

function closeOnboardingModal() {
  currentOnboardingTaskId = null;
  if (onboardingModalBackdrop) onboardingModalBackdrop.classList.add('hidden');
}

function saveOnboardingDetails() {
  if (!currentOnboardingTaskId) return closeOnboardingModal();
  const schedule = onboardingDatetimeInput?.value || '';
  const itemsProvided = onboardingItemsCheckbox?.checked || false;
  currentDetailTasks = currentDetailTasks.map(t => t.id === currentOnboardingTaskId ? { ...t, onboardingSchedule: schedule, onboardingItemsProvided: itemsProvided } : t);
  renderDetailTasks(currentDetailTasks);
  closeOnboardingModal();
}

function saveInterviewDetails() {
  if (!interviewModalList) return closeInterviewModal();
  // Save from modal list inputs
  const rows = Array.from(interviewModalList?.querySelectorAll('li') || []);
  currentInterviews = rows.map(row => {
    const stage = row.querySelector('.stage-label')?.textContent || '';
    const schedule = row.querySelector('input[type="datetime-local"]')?.value || '';
    const infoProvided = !!row.querySelector('input[type="checkbox"]')?.checked;
    return { stage, schedule, infoProvided };
  });
  // Mirror first stage info into the interview task meta (for quick glance)
  const first = currentInterviews.find(iv => iv.schedule) || currentInterviews[0] || { stage: '', schedule: '', infoProvided: false };
  currentDetailTasks = currentDetailTasks.map(t => {
    if (t.text && t.text.includes('面接')) {
      return { ...t, stage: first.stage, schedule: first.schedule, infoProvided: first.infoProvided };
    }
    return t;
  });
  renderDetailTasks(currentDetailTasks);
  closeInterviewModal();
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
logoutButtonModal.addEventListener('click', () => {
  showStartupScreen();
  signOut(auth);
});
if (returnStartupButton) {
  returnStartupButton.addEventListener('click', () => {
    closeSettings();
    showStartupScreen();
  });
}

// ===== Due date segmented inputs (YYYY / MM / DD) =====
(function setupSegmentedDueDateInputs() {
  if (!dueYearInput || !dueMonthInput || !dueDayInput || !dueDateInput) return;

  const clamp = (num, min, max) => Math.min(max, Math.max(min, num));

  const normalize = () => {
    const y = dueYearInput.value.replace(/\D+/g, '');
    const m = dueMonthInput.value.replace(/\D+/g, '');
    const d = dueDayInput.value.replace(/\D+/g, '');
    dueYearInput.value = y.slice(0, 4);
    dueMonthInput.value = m.slice(0, 2);
    dueDayInput.value = d.slice(0, 2);
  };

  const composeAndValidate = () => {
    normalize();
    if (dueYearInput.value.length !== 4 || dueMonthInput.value.length === 0 || dueDayInput.value.length === 0) {
      dueDateInput.value = '';
      return;
    }
    const y = parseInt(dueYearInput.value, 10);
    let m = parseInt(dueMonthInput.value, 10);
    let d = parseInt(dueDayInput.value, 10);
    if (isNaN(y) || isNaN(m) || isNaN(d)) { dueDateInput.value = ''; return; }
    m = clamp(m, 1, 12);
    const lastDay = new Date(y, m, 0).getDate();
    d = clamp(d, 1, lastDay);
    const mm = String(m).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    const dateStr = `${y}-${mm}-${dd}`;
    const dt = new Date(dateStr);
    if (!isNaN(dt.getTime()) && dt.getFullYear() === y && (dt.getMonth() + 1) === parseInt(mm, 10) && dt.getDate() === parseInt(dd, 10)) {
      dueDateInput.value = dateStr;
    } else {
      dueDateInput.value = '';
    }
  };

  const autoAdvance = (current, next, maxLen) => {
    current.addEventListener('input', () => {
      if (current.value.replace(/\D+/g, '').length >= maxLen) {
        next?.focus();
        next?.select?.();
      }
      composeAndValidate();
    });
  };

  const autoBackspace = (current, prev) => {
    current.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && current.selectionStart === 0 && current.selectionEnd === 0 && !current.value) {
        prev?.focus();
        prev?.select?.();
        e.preventDefault();
      }
    });
  };

  // Initialize from any existing hidden value (if any)
  const initFromHidden = () => {
    const v = (dueDateInput.value || '').trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
      const [yy, mm, dd] = v.split('-');
      dueYearInput.value = yy; dueMonthInput.value = mm; dueDayInput.value = dd;
    } else {
      dueYearInput.value = ''; dueMonthInput.value = ''; dueDayInput.value = '';
    }
  };

  // Wire up events
  autoAdvance(dueYearInput, dueMonthInput, 4);
  autoAdvance(dueMonthInput, dueDayInput, 2);
  autoAdvance(dueDayInput, null, 2);
  autoBackspace(dueMonthInput, dueYearInput);
  autoBackspace(dueDayInput, dueMonthInput);
  [dueYearInput, dueMonthInput, dueDayInput].forEach(el => {
    el.addEventListener('input', composeAndValidate);
    el.addEventListener('blur', composeAndValidate);
  });

  // Reset fields whenever the add modal opens
  if (openAddTaskModalButton && addTaskModalBackdrop) {
    openAddTaskModalButton.addEventListener('click', () => {
      initFromHidden();
      composeAndValidate();
    });
  }
})();

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
  // 追加モーダルを閉じる
  if (addTaskModalBackdrop) addTaskModalBackdrop.classList.add('hidden');
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

function exitArchiveView() {
  archiveContainer.style.display = 'none';
  mainContainer.style.display = 'block';
  selectedArchivedTaskIds.clear();
  if (archiveSelectAllCheckbox) {
    archiveSelectAllCheckbox.checked = false;
    archiveSelectAllCheckbox.indeterminate = false;
  }
  updateArchiveSelectionUI();
}

if (backToMainButton) {
  backToMainButton.addEventListener('click', exitArchiveView);
}
if (backToMainButtonTop) {
  backToMainButtonTop.addEventListener('click', exitArchiveView);
}

if (archiveSelectAllCheckbox) {
  archiveSelectAllCheckbox.addEventListener('change', () => {
    if (!archiveList) return;
    selectedArchivedTaskIds.clear();
    const checkboxes = archiveList.querySelectorAll('.archive-select-checkbox');
    checkboxes.forEach(cb => {
      cb.checked = archiveSelectAllCheckbox.checked;
      const taskId = cb.dataset.taskId;
      if (archiveSelectAllCheckbox.checked && taskId) {
        selectedArchivedTaskIds.add(taskId);
      }
    });
    updateArchiveSelectionUI();
  });
}

if (archiveDeleteSelectedButton) {
  archiveDeleteSelectedButton.addEventListener('click', async () => {
    if (selectedArchivedTaskIds.size === 0) return;
    if (!confirm('選択したアーカイブ済みタスクを削除しますか？')) return;
    const ids = Array.from(selectedArchivedTaskIds);
    const batch = writeBatch(db);
    ids.forEach(taskId => {
      batch.delete(doc(db, 'tasks', taskId));
    });
    try {
      await batch.commit();
      ids.forEach(taskId => {
        const el = archiveList?.querySelector(`li[data-id="${taskId}"]`);
        if (el) el.remove();
        selectedArchivedTaskIds.delete(taskId);
      });
      updateArchiveSelectionUI();
    } catch (error) {
      console.error('Failed to delete archived tasks:', error);
      alert('選択したタスクの削除に失敗しました。時間をおいて再度お試しください。');
    }
  });
}

manageLabelsButton.addEventListener('click', () => {
  initializeLabelColorPalette();
  labelModalBackdrop.classList.remove('hidden');
});
closeLabelModalButton.addEventListener('click', () => labelModalBackdrop.classList.add('hidden'));

// 追加: 新規タスクモーダルの開閉
if (openAddTaskModalButton && addTaskModalBackdrop) {
  openAddTaskModalButton.addEventListener('click', () => {
    addTaskModalBackdrop.classList.remove('hidden');
    // 直近のラベル状態を反映
    updateColorPicker();
    updateSelectedLabelHint();
    // 初期フォーカス
    setTimeout(() => { titleInput?.focus(); }, 0);
  });
}
if (closeAddTaskModalButton && addTaskModalBackdrop) {
  closeAddTaskModalButton.addEventListener('click', () => addTaskModalBackdrop.classList.add('hidden'));
  addTaskModalBackdrop.addEventListener('click', (e) => { if (e.target === addTaskModalBackdrop) { addTaskModalBackdrop.classList.add('hidden'); } });
}
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
  if (modalEditDueDateInput) {
    modalEditDueDateInput.value = currentlyEditingTaskDueDate ? new Date(currentlyEditingTaskDueDate).toISOString().split('T')[0] : '';
  }
  switchToEditMode();
});
saveTaskButton.addEventListener('click', async () => {
  if (!currentlyEditingTaskId) return;
  const newTitle = modalEditTitleInput.value.trim();
  if (!newTitle) return alert('タイトルは必須です。');
  const update = { title: newTitle, memo: modalEditMemoInput.value.trim() };
  if (modalEditDueDateInput) {
    const v = (modalEditDueDateInput.value || '').trim();
    update.dueDate = v ? Timestamp.fromDate(new Date(v)) : null;
  }
  await updateDoc(doc(db, "tasks", currentlyEditingTaskId), update);
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
  if (auth.currentUser) { settingsUserIdSpan.textContent = auth.currentUser.email; }
  settingsModalBackdrop.classList.remove('hidden');
  document.body.classList.add('modal-open');
  // Load updates when settings opens
  ensureUpdatesLoaded();
});
const closeSettings = () => {
  settingsModalBackdrop.classList.add('hidden');
  document.body.classList.remove('modal-open');
};
closeSettingsModalButton.addEventListener('click', closeSettings);
settingsModalBackdrop.addEventListener('click', (e) => { if (e.target === settingsModalBackdrop) { closeSettings(); } });
wallpaperChoices.addEventListener('click', (e) => {
  const choice = e.target.closest('.wallpaper-choice');
  if (choice) {
    const theme = choice.dataset.theme;
    if (theme === 'custom' && !customWallpaperDataUrl) {
      // No image yet → prompt upload
      if (chooseCustomWallpaperButton) chooseCustomWallpaperButton.click();
      return;
    }
    applyWallpaper(theme);
    saveWallpaperPreference(currentUserId, theme);
  }
});

// Open updates modal on window click
if (updatesWindow && updatesModalBackdrop) {
  updatesWindow.addEventListener('click', async () => {
    updatesModalBackdrop.classList.remove('hidden');
    const items = await fetchGithubUpdates();
    renderUpdatesFull(items);
  });
}
if (closeUpdatesModalButton && updatesModalBackdrop) {
  closeUpdatesModalButton.addEventListener('click', () => updatesModalBackdrop.classList.add('hidden'));
  updatesModalBackdrop.addEventListener('click', (e) => { if (e.target === updatesModalBackdrop) { updatesModalBackdrop.classList.add('hidden'); } });
}

if (chooseCustomWallpaperButton && customWallpaperInput) {
  chooseCustomWallpaperButton.addEventListener('click', (e) => {
    e.stopPropagation();
    customWallpaperInput.click();
  });
  customWallpaperInput.addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('画像ファイルを選択してください。'); return; }
    try {
      const { full, thumb } = await prepareWallpaperDataUrls(file);
      customWallpaperDataUrl = full;
      setCustomWallpaperVars(full, thumb);
      await saveCustomWallpaperToDevice(currentUserId, full, thumb);
      applyWallpaper('custom');
      await saveWallpaperPreference(currentUserId, 'custom');
    } catch (err) {
      console.error('Failed to set custom wallpaper:', err);
      alert('壁紙の設定に失敗しました。別の画像でお試しください。');
    } finally {
      customWallpaperInput.value = '';
    }
  });
}

// (Feedback sending removed per request)

function setCustomWallpaperVars(fullDataUrl, thumbDataUrl) {
  const root = document.documentElement;
  if (fullDataUrl) root.style.setProperty('--custom-wallpaper', `url('${fullDataUrl}')`);
  if (thumbDataUrl) root.style.setProperty('--custom-wallpaper-thumb', `url('${thumbDataUrl}')`);
  if (!thumbDataUrl && fullDataUrl) {
    // Use full as thumb fallback (not ideal but fine)
    root.style.setProperty('--custom-wallpaper-thumb', `url('${fullDataUrl}')`);
  }
}
function clearCustomWallpaperVars() {
  const root = document.documentElement;
  root.style.removeProperty('--custom-wallpaper');
  root.style.removeProperty('--custom-wallpaper-thumb');
}

// ==== Local (IndexedDB) storage for custom wallpaper ====
async function idbOpen() {
  return await new Promise((resolve, reject) => {
    const req = indexedDB.open('ivy-task-local', 1);
    req.onupgradeneeded = (e) => {
      const db = req.result;
      if (!db.objectStoreNames.contains('kv')) {
        db.createObjectStore('kv', { keyPath: 'k' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(key, value) {
  const db = await idbOpen();
  return await new Promise((resolve, reject) => {
    const tx = db.transaction('kv', 'readwrite');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore('kv').put({ k: key, v: value });
  });
}

async function idbGet(key) {
  const db = await idbOpen();
  return await new Promise((resolve, reject) => {
    const tx = db.transaction('kv', 'readonly');
    tx.onerror = () => reject(tx.error);
    const req = tx.objectStore('kv').get(key);
    req.onsuccess = () => resolve(req.result ? req.result.v : null);
    req.onerror = () => reject(req.error);
  });
}

async function saveCustomWallpaperToDevice(userId, full, thumb) {
  const uid = userId || 'anon';
  await idbSet(`cw:full:${uid}`, full);
  if (thumb) await idbSet(`cw:thumb:${uid}`, thumb);
}

async function loadCustomWallpaperFromDevice(userId) {
  const uid = userId || 'anon';
  const full = await idbGet(`cw:full:${uid}`);
  const thumb = await idbGet(`cw:thumb:${uid}`);
  if (full) {
    customWallpaperDataUrl = full;
    setCustomWallpaperVars(full, thumb || null);
  } else {
    customWallpaperDataUrl = null;
    clearCustomWallpaperVars();
  }
}

async function prepareWallpaperDataUrls(file) {
  const img = await readFileToImage(file);
  const full = await resizeToDataUrl(img, 1920, 1080, 0.85, 900_000);
  const thumb = await resizeToDataUrl(img, 400, 300, 0.7, 150_000);
  return { full, thumb };
}

function readFileToImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function resizeToDataUrl(img, maxW, maxH, quality = 0.85, targetMaxBytes) {
  const { width, height } = constrainSize(img.width, img.height, maxW, maxH);
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);
  let q = quality;
  let dataUrl = canvas.toDataURL('image/jpeg', q);
  // Simple quality step-down loop to stay under target size
  while (targetMaxBytes && dataUrl.length * 0.75 > targetMaxBytes && q > 0.4) {
    q -= 0.1;
    dataUrl = canvas.toDataURL('image/jpeg', q);
  }
  return dataUrl;
}

function constrainSize(w, h, maxW, maxH) {
  const ratio = Math.min(maxW / w, maxH / h, 1);
  return { width: Math.round(w * ratio), height: Math.round(h * ratio) };
}

if (sleepToggle) {
  sleepToggle.addEventListener('change', () => {
    sleepEnabled = sleepToggle.checked;
    if (!sleepEnabled) { exitSleep(); }
    scheduleSleepTimer();
    saveSleepPreference(currentUserId, sleepEnabled, Math.min(180, Math.max(1, parseInt(sleepSecondsInput.value || '60', 10))));
  });
}

if (sleepSecondsInput) {
  const onSecondsChange = () => {
    let v = parseInt(sleepSecondsInput.value || '60', 10);
    if (isNaN(v)) v = 60;
    v = Math.min(180, Math.max(1, v));
    sleepSecondsInput.value = v;
    sleepSeconds = v;
    scheduleSleepTimer();
    saveSleepPreference(currentUserId, sleepEnabled, sleepSeconds);
  };
  sleepSecondsInput.addEventListener('change', onSecondsChange);
  sleepSecondsInput.addEventListener('input', () => {
    // live update but not spammy; just reschedule locally
    let v = parseInt(sleepSecondsInput.value || '60', 10);
    if (!isNaN(v)) {
      v = Math.min(180, Math.max(1, v));
      sleepSeconds = v; scheduleSleepTimer();
    }
  });
}

['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'].forEach(evt => {
  document.addEventListener(evt, () => {
    if (sleepEnabled) {
      if (document.body.classList.contains('sleeping')) {
        exitSleep();
      } else {
        scheduleSleepTimer();
      }
    }
  }, { passive: true });
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
  if (labelRow) {
    const id = labelRow.dataset.id;
    const viewContainer = labelRow.querySelector('.label-view-container');
    const editContainer = labelRow.querySelector('.label-edit-container');
    const buttonsContainer = labelRow.querySelector('.label-buttons-container');

    if (target.classList.contains('edit-label-btn')) {
      viewContainer.classList.add('hidden');
      editContainer.classList.remove('hidden');
      buttonsContainer.querySelectorAll('.edit-label-btn, .delete-label-btn').forEach(el => el.classList.add('hidden'));
      buttonsContainer.querySelectorAll('.save-label-btn, .cancel-label-btn').forEach(el => el.classList.remove('hidden'));
      return;
    }
    if (target.classList.contains('cancel-label-btn')) {
      viewContainer.classList.remove('hidden');
      editContainer.classList.add('hidden');
      buttonsContainer.querySelectorAll('.edit-label-btn, .delete-label-btn').forEach(el => el.classList.remove('hidden'));
      buttonsContainer.querySelectorAll('.save-label-btn, .cancel-label-btn').forEach(el => el.classList.add('hidden'));
      const originalColor = labels.find(l => l.id === id).color;
      editContainer.querySelectorAll('.palette-choice').forEach(c => c.classList.toggle('selected', c.dataset.color === originalColor));
      return;
    }
    if (target.classList.contains('save-label-btn')) {
      const newName = editContainer.querySelector('.label-edit-input').value.trim();
      const selectedColorEl = editContainer.querySelector('.palette-choice.selected');
      const newColor = selectedColorEl ? selectedColorEl.dataset.color : labels.find(l => l.id === id).color;
      if (!newName) return alert('ラベル名を入力してください。');
      if (labels.some(l => l.name === newName && l.id !== id)) return alert('同名のラベルが存在します。');
      await updateDoc(doc(db, "labels", id), { name: newName, color: newColor });
      return;
    }
    if (target.classList.contains('delete-label-btn')) {
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


// ===== Vault Functions =====

// ===== Vault Crypto & State Functions =====

async function deriveKey(password, salt) {
  const passwordBuffer = new TextEncoder().encode(password);
  const importKey = await window.crypto.subtle.importKey(
    'raw', passwordBuffer, { name: 'PBKDF2' }, false, ['deriveKey']
  );
  return window.crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt, iterations: 100_000, hash: 'SHA-256' },
    importKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptPassword(plainText, masterPassword) {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(masterPassword, salt);
  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    new TextEncoder().encode(plainText)
  );
  return {
    encryptedData: arrayBufferToBase64(encrypted),
    iv: arrayBufferToBase64(iv),
    salt: arrayBufferToBase64(salt)
  };
}

async function decryptPassword(encryptedObj, masterPassword) {
  try {
    const salt = base64ToArrayBuffer(encryptedObj.salt);
    const iv = base64ToArrayBuffer(encryptedObj.iv);
    const encryptedData = base64ToArrayBuffer(encryptedObj.encryptedData);
    const key = await deriveKey(masterPassword, salt);
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encryptedData
    );
    return new TextDecoder().decode(decrypted);
  } catch (e) {
    console.error('Decryption failed:', e);
    return null; // Identify failure
  }
}

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

function lockVault() {
  isVaultLocked = true;
  vaultMasterPassword = null;
  if (vaultListEl) vaultListEl.innerHTML = '';
  if (vaultLockScreen) vaultLockScreen.classList.remove('hidden');
  if (vaultLockButton) vaultLockButton.classList.add('hidden');
  if (vaultMasterPasswordInput) vaultMasterPasswordInput.value = '';
}

function unlockVault(password) {
  if (!password) return;
  vaultMasterPassword = password;
  isVaultLocked = false;
  if (vaultLockScreen) vaultLockScreen.classList.add('hidden');
  if (vaultLockButton) vaultLockButton.classList.remove('hidden');
  // onSnapshot が既にデータを保持している場合は renderVaultList を直接呼ぶ。
  // subscribeVaults 呼び出し後に unlockVault が呼ばれるケースでは
  // onSnapshot コールバックからの renderVaultList と競合しないよう、
  // vaults に既にデータがある場合のみここで描画する。
  if (vaults.length > 0) {
    renderVaultList();
  }
}


// Global State for Vault Sort & Filter
let currentVaultSort = 'newest';
let currentVaultCategory = 'all';

// DOM Elements for Vault Sort & Filter
const vaultSortSelect = document.getElementById('vault-sort-select');
const vaultFilterCategory = document.getElementById('vault-filter-category');
const vaultInputCategory = document.getElementById('vault-input-category');
const vaultCategorySuggestions = document.getElementById('vault-category-suggestions');

async function enterVaultWorkspace() {
  workspaceSelection = 'vault';
  document.body.dataset.workspace = 'vault';
  if (startupScreen) startupScreen.classList.add('hidden');
  if (todoComingSoon) todoComingSoon.classList.add('hidden');
  if (authContainer) authContainer.style.display = 'none';
  if (mainContainer) mainContainer.style.display = 'none';
  if (archiveContainer) archiveContainer.style.display = 'none';
  if (todoContainer) todoContainer.classList.add('hidden');
  if (memoContainer) memoContainer.classList.add('hidden');
  if (vaultContainer) vaultContainer.classList.remove('hidden');

  if (lastKnownAuthUser) {
    if (!currentUserId) currentUserId = lastKnownAuthUser.uid;
    await loadUserSettings(currentUserId);

    // Check lock state
    if (!vaultMasterPassword) {
      lockVault();
    } else {
      isVaultLocked = false;
      if (vaultLockScreen) vaultLockScreen.classList.add('hidden');
      if (vaultLockButton) vaultLockButton.classList.remove('hidden');
    }

    subscribeVaults(currentUserId);
  } else {
    handleSignedOut(true);
  }
}

function subscribeVaults(userId) {
  if (unsubscribeVaults) unsubscribeVaults();

  // クライアントサイドソートのため orderBy は使用しない
  const q = query(
    collection(db, 'vaults'),
    where('userId', '==', userId)
  );

  unsubscribeVaults = onSnapshot(q, async (snapshot) => {
    vaults = []; // 【重要】初期化

    snapshot.forEach(d => vaults.push({ id: d.id, ...d.data() }));

    // Sort logic moved to renderVaultList

    await renderVaultList();
  }, (error) => {
    console.error("Vault読み込みエラー:", error);
  });
}

async function renderVaultList() {
  if (!vaultListEl) return;
  vaultListEl.innerHTML = '';

  if (isVaultLocked) return;

  // 1. Extract Categories
  const categories = new Set();
  vaults.forEach(v => {
    if (v.category) categories.add(v.category);
  });
  const sortedCategories = Array.from(categories).sort();

  // 2. Update UI Controls (Filter & Suggestions)
  // Save current selection to restore if possible
  const currentFilterVal = vaultFilterCategory ? vaultFilterCategory.value : 'all';

  if (vaultFilterCategory) {
    vaultFilterCategory.innerHTML = '<option value="all">すべて</option>';
    sortedCategories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      vaultFilterCategory.appendChild(opt);
    });
    // Restore selection if it still exists, otherwise 'all'
    if (sortedCategories.includes(currentVaultCategory)) {
      vaultFilterCategory.value = currentVaultCategory;
    } else {
      vaultFilterCategory.value = 'all';
      currentVaultCategory = 'all';
    }
  }

  if (vaultCategorySuggestions) {
    vaultCategorySuggestions.innerHTML = '';
    sortedCategories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      vaultCategorySuggestions.appendChild(opt);
    });
  }

  // 3. Filter
  let filtered = vaults.filter(v => {
    // Initial search filter
    if (vaultSearchQuery) {
      const q = vaultSearchQuery.toLowerCase();
      const matchesSearch = (v.title || '').toLowerCase().includes(q)
        || (v.loginId || '').toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }
    // Category filter
    if (currentVaultCategory !== 'all') {
      if (v.category !== currentVaultCategory) return false;
    }
    return true;
  });

  // 4. Sort
  filtered.sort((a, b) => {
    if (currentVaultSort === 'newest') {
      const ta = a.createdAt ? a.createdAt.toMillis() : 0;
      const tb = b.createdAt ? b.createdAt.toMillis() : 0;
      return tb - ta;
    } else if (currentVaultSort === 'oldest') {
      const ta = a.createdAt ? a.createdAt.toMillis() : 0;
      const tb = b.createdAt ? b.createdAt.toMillis() : 0;
      return ta - tb;
    } else if (currentVaultSort === 'name-asc') {
      const nameA = (a.title || '').toLowerCase();
      const nameB = (b.title || '').toLowerCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    }
    return 0;
  });

  if (filtered.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'vault-empty';
    empty.textContent = vaults.length === 0 ? 'まだパスワードが登録されていません' : '該当する項目がありません';
    vaultListEl.appendChild(empty);
    return;
  }

  for (const v of filtered) {
    const li = document.createElement('li');
    li.className = 'vault-item';
    li.dataset.id = v.id;

    // Header: title + category + actions
    const header = document.createElement('div');
    header.className = 'vault-item-header';

    // Title Wrapper
    const titleWrapper = document.createElement('div');
    titleWrapper.style.display = 'flex';
    titleWrapper.style.alignItems = 'center';
    titleWrapper.style.gap = '8px';

    const titleEl = document.createElement('span');
    titleEl.className = 'vault-item-title';
    titleEl.textContent = v.title || '(無題)';
    titleWrapper.appendChild(titleEl);

    if (v.category) {
      const catBadge = document.createElement('span');
      catBadge.className = 'vault-category-badge';
      catBadge.textContent = v.category;
      catBadge.style.fontSize = '0.75rem';
      catBadge.style.padding = '2px 6px';
      catBadge.style.backgroundColor = '#e0e0e0';
      catBadge.style.borderRadius = '4px';
      catBadge.style.color = '#333';
      titleWrapper.appendChild(catBadge);
    }
    header.appendChild(titleWrapper);

    const actions = document.createElement('div');
    actions.className = 'vault-item-actions';
    const editBtn = document.createElement('button');
    editBtn.className = 'vault-edit-btn';
    editBtn.textContent = '編集';
    editBtn.addEventListener('click', () => openVaultModal(v.id));
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'vault-delete-btn';
    deleteBtn.textContent = '削除';
    deleteBtn.addEventListener('click', () => deleteVault(v.id, v.title));
    actions.append(editBtn, deleteBtn);
    header.appendChild(actions);
    li.appendChild(header);

    // URL
    if (v.url) {
      const urlEl = document.createElement('a');
      urlEl.className = 'vault-item-url';
      urlEl.href = v.url.startsWith('http') ? v.url : `https://${v.url}`;
      urlEl.target = '_blank';
      urlEl.rel = 'noopener noreferrer';
      urlEl.textContent = v.url;
      li.appendChild(urlEl);
    }

    // Fields
    const fields = document.createElement('div');
    fields.className = 'vault-item-fields';

    // Login ID
    if (v.loginId) {
      const idRow = document.createElement('div');
      idRow.className = 'vault-field-row';
      const idLabel = document.createElement('span');
      idLabel.className = 'vault-field-label';
      idLabel.textContent = 'ID';
      const idValue = document.createElement('span');
      idValue.className = 'vault-field-value';
      idValue.textContent = v.loginId;
      const idCopyBtn = document.createElement('button');
      idCopyBtn.className = 'vault-copy-btn';
      idCopyBtn.textContent = '📋';
      idCopyBtn.title = 'IDをコピー';
      idCopyBtn.addEventListener('click', () => vaultCopyToClipboard(v.loginId, idCopyBtn));
      idRow.append(idLabel, idValue, idCopyBtn);
      fields.appendChild(idRow);
    }

    // Password
    if (v.password) {
      let plainPw = '';
      if (typeof v.password === 'object' && v.password.encryptedData) {
        const decrypted = await decryptPassword(v.password, vaultMasterPassword);
        plainPw = decrypted !== null ? decrypted : '⛔ 復号失敗';
      } else {
        plainPw = v.password; // Legacy or plain
      }

      const pwRow = document.createElement('div');
      pwRow.className = 'vault-field-row';
      const pwLabel = document.createElement('span');
      pwLabel.className = 'vault-field-label';
      pwLabel.textContent = 'PW';
      const pwValue = document.createElement('span');
      pwValue.className = 'vault-field-value masked';
      pwValue.textContent = '••••••••';
      pwValue.dataset.plain = plainPw;
      pwValue.dataset.visible = 'false';

      const pwToggle = document.createElement('button');
      pwToggle.className = 'vault-toggle-btn';
      pwToggle.textContent = '👁️';
      pwToggle.title = 'パスワードを表示';
      pwToggle.addEventListener('click', () => {
        const isVisible = pwValue.dataset.visible === 'true';
        pwValue.textContent = isVisible ? '••••••••' : pwValue.dataset.plain;
        pwValue.classList.toggle('masked', isVisible);
        pwValue.dataset.visible = String(!isVisible);
        pwToggle.textContent = isVisible ? '👁️' : '🙈';
        pwToggle.title = isVisible ? 'パスワードを表示' : 'パスワードを隠す';
      });
      const pwCopyBtn = document.createElement('button');
      pwCopyBtn.className = 'vault-copy-btn';
      pwCopyBtn.textContent = '📋';
      pwCopyBtn.title = 'パスワードをコピー';
      pwCopyBtn.addEventListener('click', () => vaultCopyToClipboard(plainPw, pwCopyBtn));
      pwRow.append(pwLabel, pwValue, pwToggle, pwCopyBtn);
      fields.appendChild(pwRow);
    }

    li.appendChild(fields);

    // Memo
    if (v.memo) {
      const memoEl = document.createElement('div');
      memoEl.className = 'vault-item-memo';
      memoEl.textContent = v.memo;
      li.appendChild(memoEl);
    }

    vaultListEl.appendChild(li);
  }
}

async function openVaultModal(vaultId) {
  if (vaultId) {
    // Edit mode
    editingVaultId = vaultId;
    const v = vaults.find(x => x.id === vaultId);
    if (!v) return;
    vaultModalTitle.textContent = 'パスワードを編集';
    vaultInputTitle.value = v.title || '';
    vaultInputCategory.value = v.category || '';
    vaultInputUrl.value = v.url || '';
    vaultInputLoginId.value = v.loginId || '';

    let plainPw = '';
    if (v.password) {
      if (typeof v.password === 'object' && v.password.encryptedData) {
        const decrypted = await decryptPassword(v.password, vaultMasterPassword);
        plainPw = decrypted !== null ? decrypted : '⛔ 復号失敗';
      } else {
        plainPw = v.password;
      }
    }
    vaultInputPassword.value = plainPw || '';
    vaultInputMemo.value = v.memo || '';
  } else {
    // Add mode
    editingVaultId = null;
    vaultModalTitle.textContent = 'パスワードを追加';
    vaultForm.reset();
  }
  // Reset password visibility in modal
  vaultInputPassword.type = 'password';
  vaultModalTogglePw.textContent = '👁️';
  vaultModalBackdrop.classList.remove('hidden');
}

function closeVaultModal() {
  vaultModalBackdrop.classList.add('hidden');
  editingVaultId = null;
  vaultForm.reset();
}

async function saveVault() {
  if (!currentUserId) return;

  let pwToSave = vaultInputPassword.value;
  // Encrypt
  if (pwToSave) {
    if (!vaultMasterPassword) {
      alert('マスターパスワードが設定されていません。一度ロック解除してください。');
      return;
    }
    pwToSave = await encryptPassword(pwToSave, vaultMasterPassword);
  }

  const data = {
    userId: currentUserId,
    title: vaultInputTitle.value.trim(),
    category: vaultInputCategory.value.trim(),
    url: vaultInputUrl.value.trim(),
    loginId: vaultInputLoginId.value.trim(),
    password: pwToSave,
    memo: vaultInputMemo.value.trim(),
    updatedAt: serverTimestamp()
  };
  if (!data.title) {
    alert('サービス名を入力してください。');
    return;
  }
  try {
    if (editingVaultId) {
      await updateDoc(doc(db, 'vaults', editingVaultId), data);
    } else {
      data.createdAt = serverTimestamp();
      await addDoc(collection(db, 'vaults'), data);
    }
    closeVaultModal();
  } catch (err) {
    console.error('Vault save error:', err);
    alert('保存に失敗しました。');
  }
}

async function deleteVault(id, title) {
  if (!confirm(`「${title || '(無題)'}」を削除しますか？`)) return;
  try {
    await deleteDoc(doc(db, 'vaults', id));
  } catch (err) {
    console.error('Vault delete error:', err);
    alert('削除に失敗しました。');
  }
}

function vaultCopyToClipboard(text, btnEl) {
  navigator.clipboard.writeText(text).then(() => {
    const original = btnEl.textContent;
    btnEl.textContent = '✅';
    setTimeout(() => { btnEl.textContent = original; }, 1200);
  }).catch(err => {
    console.error('Copy failed:', err);
  });
}

// Vault Event Listeners
if (vaultSortSelect) {
  vaultSortSelect.addEventListener('change', () => {
    currentVaultSort = vaultSortSelect.value;
    renderVaultList();
  });
}

if (vaultFilterCategory) {
  vaultFilterCategory.addEventListener('change', () => {
    currentVaultCategory = vaultFilterCategory.value;
    renderVaultList();
  });
}

if (startVaultButton) {
  startVaultButton.addEventListener('click', () => {
    if (lastKnownAuthUser) {
      enterVaultWorkspace();
    } else {
      workspaceSelection = 'vault';
      handleSignedOut(true);
    }
  });
}

if (vaultBackButton) {
  vaultBackButton.addEventListener('click', () => {
    showStartupScreen();
  });
}

if (vaultAddButton) {
  vaultAddButton.addEventListener('click', () => openVaultModal());
}

if (vaultForm) {
  vaultForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveVault();
  });
}

if (vaultModalCancel) {
  vaultModalCancel.addEventListener('click', () => closeVaultModal());
}

if (vaultModalBackdrop) {
  vaultModalBackdrop.addEventListener('click', (e) => {
    if (e.target === vaultModalBackdrop) closeVaultModal();
  });
}

if (vaultModalTogglePw) {
  vaultModalTogglePw.addEventListener('click', () => {
    const isPw = vaultInputPassword.type === 'password';
    vaultInputPassword.type = isPw ? 'text' : 'password';
    vaultModalTogglePw.textContent = isPw ? '🙈' : '👁️';
  });
}

if (vaultSearchInput) {
  vaultSearchInput.addEventListener('input', () => {
    vaultSearchQuery = vaultSearchInput.value.trim();
    renderVaultList();
  });
}

async function attemptUnlock(inputPassword) {
  if (!inputPassword || !currentUserId) return;

  try {
    const settingsRef = doc(db, 'settings', currentUserId);
    const docSnap = await getDoc(settingsRef);
    const settingsData = docSnap.exists() ? docSnap.data() : {};

    if (!settingsData.vaultVerification) {
      // First time setup or no verification data: encrypt fixed string
      // Use the input password to encrypt the validation string
      const verificationData = await encryptPassword("IVY_VAULT_VALID", inputPassword);
      await setDoc(settingsRef, { vaultVerification: verificationData }, { merge: true });

      // Unlock success
      unlockVault(inputPassword);
      vaultMasterPasswordInput.value = '';
    } else {
      // Verification exists: try to decrypt
      try {
        const decrypted = await decryptPassword(settingsData.vaultVerification, inputPassword);
        if (decrypted === "IVY_VAULT_VALID") {
          // Unlock success
          unlockVault(inputPassword);
          vaultMasterPasswordInput.value = '';
        } else {
          throw new Error("Invalid password content");
        }
      } catch (decryptError) {
        console.error("Decryption failed:", decryptError);
        alert('マスターパスワードが違います。');
        vaultMasterPasswordInput.value = '';
        vaultMasterPasswordInput.focus();
      }
    }
  } catch (error) {
    console.error("Verification error:", error);
    alert('エラーが発生しました。再読み込みしてください。');
  }
}

if (vaultLockButton) {
  vaultLockButton.addEventListener('click', () => {
    lockVault();
  });
}

if (vaultUnlockButton) {
  vaultUnlockButton.addEventListener('click', () => {
    attemptUnlock(vaultMasterPasswordInput.value);
  });
}

if (vaultMasterPasswordInput) {
  vaultMasterPasswordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      attemptUnlock(vaultMasterPasswordInput.value);
    }
  });
}

