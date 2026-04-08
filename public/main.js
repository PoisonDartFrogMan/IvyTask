import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, onAuthStateChanged, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signOut, setPersistence, indexedDBLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  initializeFirestore, collection, addDoc, query, where, getDocs,
  getDoc, doc, deleteDoc, updateDoc, orderBy, writeBatch,
  Timestamp, onSnapshot, serverTimestamp, setDoc, arrayUnion, deleteField
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject, listAll, getMetadata
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import {
  getMessaging, getToken
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js";
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
const messaging = getMessaging(app);
setPersistence(auth, indexedDBLocalPersistence).catch(console.error);

// マスターUID（特権ユーザー）
const MASTER_UID = "8V7CfCrj4wSD8aZymfrf1WKZaAg1";
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
const databaseContainer = document.getElementById('database-container');
const userEmailSpan = document.getElementById('user-email');
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
const taskBackStartupButton = document.getElementById('task-back-startup-button');

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
const vaultImportShareBtn = document.getElementById('vault-import-share-btn');
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

// Chat Workspace Elements
const startChatButton = document.getElementById('start-chat-button');
const chatContainer = document.getElementById('chat-container');
const chatBackStartupButton = document.getElementById('chat-back-startup-button');
const chatCreateRoomBtn = document.getElementById('chat-create-room-btn');
const chatRoomList = document.getElementById('chat-room-list');
const chatCurrentRoomName = document.getElementById('chat-current-room-name');
const chatMessages = document.getElementById('chat-messages');
const chatInputForm = document.getElementById('chat-input-form');
const chatMessageInput = document.getElementById('chat-message-input');
const chatPetSelect = document.getElementById('chat-pet-select');

let currentChatRoomId = null;
let currentChatRoom = null;
let chatRoomsUnsubscribe = null;
let chatMessagesUnsubscribe = null;
let currentSelectedPet = 'turtle';


// Archive Workspace Elements
const archiveWorkspace = document.getElementById('archive-workspace');
const startArchiveButton = document.getElementById('start-archive-button');
const archiveBackStartupButton = document.getElementById('archive-back-startup-button');
const archiveGenreInput = document.getElementById('archive-genre-input');
const archiveGenreDropdown = document.getElementById('archive-genre-dropdown');
const pdfDropZone = document.getElementById('pdf-drop-zone');
const archiveListContainer = document.getElementById('archive-list-container');
const pdfPreviewModalBackdrop = document.getElementById('pdf-preview-modal-backdrop');
const closePreviewButton = document.getElementById('close-preview-button');
// ====== DOM Elements ======
const pdfCanvasContainer = document.getElementById('pdf-canvas-container');
const imagePreviewWrapper = document.getElementById('image-preview-wrapper');
const imagePreviewCaption = document.getElementById('image-preview-caption');
const imagePreviewCaptionText = document.getElementById('image-preview-caption-text');
const imagePreviewTapHint = document.getElementById('image-preview-tap-hint');

// ===== 画像プレビューを開く共通ユーティリティ =====
function openImagePreview(pdf) {
  if (!pdfPreviewModalBackdrop) return;
  if (pdfCanvasContainer) { pdfCanvasContainer.innerHTML = ''; pdfCanvasContainer.style.display = 'none'; }

  const captionText = pdf.caption || '';

  if (imagePreviewWrapper) {
    imagePreviewWrapper.style.display = 'block';
  }
  const imgElem = document.getElementById('image-preview-element');
  if (imgElem) imgElem.src = pdf.fileUrl;

  // キャプション初期化（常に非表示スタートでトグル待ち）
  if (imagePreviewCaptionText) imagePreviewCaptionText.textContent = captionText || '（コメントなし）';
  if (imagePreviewCaption) {
    imagePreviewCaption.classList.toggle('no-comment', !captionText);
    imagePreviewCaption.classList.add('hidden-caption');
  }
  // タップヒントの表示（コメントの有無に関わらず表示）
  if (imagePreviewTapHint) imagePreviewTapHint.classList.remove('hidden-caption');

  currentPreviewPdfId = pdf.id;
  pdfPreviewModalBackdrop.classList.remove('hidden');
}

// ===== 画像プレビューを閉じる共通ユーティリティ =====
function closeImagePreview() {
  if (imagePreviewWrapper) imagePreviewWrapper.style.display = 'none';
  const imgElem = document.getElementById('image-preview-element');
  if (imgElem) imgElem.src = '';
  if (imagePreviewCaption) imagePreviewCaption.classList.add('hidden-caption');
  if (imagePreviewTapHint) imagePreviewTapHint.classList.add('hidden-caption');
}

// ===== 画像ラッパーのクリックでコメントトグル =====
if (imagePreviewWrapper) {
  imagePreviewWrapper.addEventListener('click', () => {
    if (!imagePreviewCaption) return;
    imagePreviewCaption.classList.toggle('hidden-caption');
    // タップヒントはコメント表示中は隠す
    if (imagePreviewTapHint) {
      const captionVisible = !imagePreviewCaption.classList.contains('hidden-caption');
      imagePreviewTapHint.classList.toggle('hidden-caption', captionVisible);
    }
  });
}


const archiveIcon = document.getElementById('archive-icon');
const archiveSecretCaption = document.getElementById('archive-secret-caption');
const startDiarySlideshowButton = document.getElementById('start-diary-slideshow-button');
const diarySlideshowModal = document.getElementById('diary-slideshow-modal');
const closeSlideshowButton = document.getElementById('close-slideshow-button');
const slideshowImage = document.getElementById('slideshow-image');
const slideshowCaption = document.getElementById('slideshow-caption');
const slideshowPrevButton = document.getElementById('slideshow-prev-button');
const slideshowNextButton = document.getElementById('slideshow-next-button');

// ===== Global State & Constants =====
let currentUserId = null;
let workspaceSelection = localStorage.getItem('ivy_workspace_selection') || null; // 'task' | 'todo' | 'memo' | 'vault' | null
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
// Archive State
let archivePdfs = [];
let unsubscribeArchive = () => { };
let currentArchiveFilter = 'all';
let currentArchiveSort = 'dateDesc'; // 'dateDesc', 'dateAsc', 'nameAsc', 'nameDesc'
let currentArchiveGenres = new Set();
const archiveFilterContainer = document.getElementById('archive-filter-container');
const archiveSortSelect = document.getElementById('archive-sort-select');
let currentPreviewPdfId = null;
let archiveViewMode = 'list'; // 'list' | 'grid'


// Candidate (Todo) State
let candidates = [];
let unsubscribeCandidates = () => { };
const importCSVButton = document.getElementById('import-csv-button');
const importCSVInput = document.getElementById('import-csv-input');
let editingVaultId = null;
let vaultMasterPassword = null; // New: E2EE Key (Raw Password)
let isVaultLocked = true; // New: Default locked
// DataBase State (Employee)
let employees = [];
let unsubscribeEmployees = () => { };
let editingEmployeeId = null;
let employeeSearchQuery = '';
const PASTEL_COLORS = [
  '#ffadad', '#ffd6a5', '#fdffb6', '#caffbf',
  '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff',
  '#ffb3ba', '#ffdfba', '#baffc9', '#e4e4e4'
];
const DEFAULT_CANDIDATE_TASKS = [
  '面接',
  '入社前説明',
  '関係者への求職者情報の共有',
  '経営会議への報告資料作成',
  '社内ネットワークへの人事発令',
  '入社時研修'
];

// ===== Secret Diary Feature =====
let isSecretDiaryMode = false;
let secretIconClickCount = 0;
let secretIconClickTimer = null;
let slideshowImages = [];
let currentSlideshowIndex = 0;
let slideshowInterval = null;
const SLIDESHOW_INTERVAL_MS = 5000;

if (archiveIcon) {
  archiveIcon.addEventListener('click', () => {
    // マスター以外は秘密の日記機能を無効化
    if (currentUserId !== MASTER_UID) return;

    if (isSecretDiaryMode) {
      // If already in secret mode, clicking the icon again exits it
      Swal.fire({
        title: '秘密の日記を閉じますか？',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#8D6E63',
        cancelButtonColor: '#ccc',
        confirmButtonText: 'はい',
        cancelButtonText: 'いいえ'
      }).then((result) => {
        if (result.isConfirmed) {
          isSecretDiaryMode = false;
          document.body.classList.remove('diary-mode');
          if (archiveSecretCaption) archiveSecretCaption.style.display = 'none';
          if (startDiarySlideshowButton) startDiarySlideshowButton.style.display = 'none';
          subscribeArchive(currentUserId);
          Swal.fire({
            title: '通常モードに戻りました',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
        }
      });
      return;
    }

    secretIconClickCount++;
    if (secretIconClickTimer) clearTimeout(secretIconClickTimer);

    // Reset the count after 1.5 seconds if 5 clicks are not reached
    secretIconClickTimer = setTimeout(() => {
      secretIconClickCount = 0;
    }, 1500);

    if (secretIconClickCount >= 5) {
      secretIconClickCount = 0;
      clearTimeout(secretIconClickTimer);

      const userRef = doc(db, 'users', currentUserId);
      getDoc(userRef).then((userSnap) => {
        let savedPassword = null;
        if (userSnap.exists()) {
          savedPassword = userSnap.data().secretPassword || null;
        }

        if (!savedPassword) {
          Swal.fire({
            title: '秘密のパスワードを設定',
            text: '秘密の日記へのアクセス用パスワードを入力してください。',
            input: 'password',
            inputPlaceholder: 'パスワードを入力...',
            inputAttributes: {
              autocapitalize: 'off',
              autocorrect: 'off'
            },
            showCancelButton: true,
            confirmButtonText: '設定して開く',
            cancelButtonText: 'キャンセル',
            confirmButtonColor: '#8D6E63',
            preConfirm: (password) => {
              if (!password || password.trim() === '') {
                Swal.showValidationMessage('パスワードを入力してください');
                return false;
              }
              return password;
            },
            allowOutsideClick: () => !Swal.isLoading()
          }).then(async (result) => {
            if (result.isConfirmed) {
              try {
                await setDoc(userRef, { secretPassword: result.value }, { merge: true });
                isSecretDiaryMode = true;
                document.body.classList.add('diary-mode');
                if (archiveSecretCaption) archiveSecretCaption.style.display = 'block';
                if (startDiarySlideshowButton) startDiarySlideshowButton.style.display = 'block';
                subscribeArchive(currentUserId);
                Swal.fire({
                  title: '秘密の日記が開きました',
                  icon: 'success',
                  timer: 1500,
                  showConfirmButton: false
                });
              } catch (err) {
                console.error("Error setting password", err);
                Swal.fire('エラー', 'パスワードの保存に失敗しました。', 'error');
              }
            }
          });
        } else {
          Swal.fire({
            title: '合言葉は？',
            input: 'password',
            inputPlaceholder: 'パスワードを入力...',
            inputAttributes: {
              autocapitalize: 'off',
              autocorrect: 'off'
            },
            showCancelButton: true,
            confirmButtonText: '開く',
            cancelButtonText: 'キャンセル',
            confirmButtonColor: '#8D6E63', // Retro brown
            preConfirm: (password) => {
              if (password === savedPassword) {
                return true;
              } else {
                Swal.showValidationMessage('合言葉が違います...');
                return false;
              }
            },
            allowOutsideClick: () => !Swal.isLoading()
          }).then((result) => {
            if (result.isConfirmed) {
              isSecretDiaryMode = true;
              document.body.classList.add('diary-mode');
              if (archiveSecretCaption) archiveSecretCaption.style.display = 'block';
              if (startDiarySlideshowButton) startDiarySlideshowButton.style.display = 'block';
              subscribeArchive(currentUserId);
              Swal.fire({
                title: '秘密の日記が開きました',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
              });
            }
          });
        }
      }).catch(err => {
        console.error("Error fetching user data", err);
      });
    }
  });
}

// Slideshow implementation
function renderDiarySlideshow() {
  if (!isSecretDiaryMode || slideshowImages.length === 0) return;
  const currentImg = slideshowImages[currentSlideshowIndex];
  if (slideshowImage) slideshowImage.src = currentImg.fileUrl || '';
  if (slideshowCaption) slideshowCaption.textContent = currentImg.caption || '（ひとことメモはありません）';
}

function startSlideshowTimer() {
  if (slideshowInterval) clearInterval(slideshowInterval);
  slideshowInterval = setInterval(() => {
    if (slideshowNextButton) slideshowNextButton.click();
  }, SLIDESHOW_INTERVAL_MS);
}

function stopSlideshowTimer() {
  if (slideshowInterval) {
    clearInterval(slideshowInterval);
    slideshowInterval = null;
  }
}

function resetSlideshowTimer() {
  stopSlideshowTimer();
  startSlideshowTimer();
}

if (startDiarySlideshowButton) {
  startDiarySlideshowButton.addEventListener('click', () => {
    // マスター以外はスライドショー機能を無効化
    if (currentUserId !== MASTER_UID) return;
    // Filter only images that are secret for the slideshow
    slideshowImages = archivePdfs.filter(pdf => pdf.fileType === 'image' && pdf.isSecret);
    if (slideshowImages.length === 0) {
      Swal.fire('画像がありません', 'スライドショーを再生する画像が見つかりません。', 'info');
      return;
    }
    currentSlideshowIndex = 0;
    renderDiarySlideshow();
    if (diarySlideshowModal) diarySlideshowModal.classList.remove('hidden');
    startSlideshowTimer();
  });
}

if (closeSlideshowButton) {
  closeSlideshowButton.addEventListener('click', () => {
    if (diarySlideshowModal) diarySlideshowModal.classList.add('hidden');
    stopSlideshowTimer();
  });
}

if (slideshowPrevButton) {
  slideshowPrevButton.addEventListener('click', () => {
    if (slideshowImages.length > 0) {
      currentSlideshowIndex = (currentSlideshowIndex - 1 + slideshowImages.length) % slideshowImages.length;
      renderDiarySlideshow();
      resetSlideshowTimer();
    }
  });
}

if (slideshowNextButton) {
  slideshowNextButton.addEventListener('click', () => {
    if (slideshowImages.length > 0) {
      currentSlideshowIndex = (currentSlideshowIndex + 1) % slideshowImages.length;
      renderDiarySlideshow();
      resetSlideshowTimer();
    }
  });
}
// Keyboard navigation for slideshow
window.addEventListener('keydown', (e) => {
  if (diarySlideshowModal && !diarySlideshowModal.classList.contains('hidden')) {
    if (e.key === 'ArrowRight') {
      if (slideshowNextButton) slideshowNextButton.click();
    } else if (e.key === 'ArrowLeft') {
      if (slideshowPrevButton) slideshowPrevButton.click();
    } else if (e.key === 'Escape') {
      if (closeSlideshowButton) closeSlideshowButton.click();
    }
  }
});
// ===== FCM (Push Notifications) =====
const VAPID_KEY = "BPvZ4aRQzkDO6s0Ag4GLj_yiaKq_V_XcyNH1GmP6BWR5bLHlVeyllekT-Se_avdKyFa3BEK92dF7diHUWdxIFGc"; // Set by Master

async function requestNotificationPermission(userId) {
  if (!('Notification' in window)) {
    console.log('This browser does not support notification');
    return;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      
      // サービスワーカーの登録を明示的に行う
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Service Worker registered with scope:', registration.scope);

      const token = await getToken(messaging, { 
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration 
      });

      if (token) {
        console.log('FCM Token:', token);
        // Firestoreの users/${userId} ドキュメント内に fcmTokens 配列として保存
        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, {
          fcmTokens: arrayUnion(token)
        }, { merge: true });
        console.log('FCM Token saved to Firestore.');
      } else {
        console.log('No registration token available. Request permission to generate one.');
      }
    } else {
      console.log('Unable to get permission to notify.');
    }
  } catch (err) {
    console.error('An error occurred while retrieving token. ', err);
  }
}

const INTERVIEW_STAGES = ['一次', '二次', '最終'];


// ===== Startup View Helpers =====
function showStartupScreen(showTodoMessage = false) {
  workspaceSelection = showTodoMessage ? 'todo' : null; // Keep this logic for 'todo' message, but general reset
  if (!showTodoMessage) {
    workspaceSelection = null;
    localStorage.removeItem('ivy_workspace_selection');
  }

  // Reset workspace
  document.body.removeAttribute('data-workspace');
  handleSignedOut(false);
  if (startupScreen) startupScreen.classList.remove('hidden');
  if (todoContainer) todoContainer.classList.add('hidden');
  if (memoContainer) memoContainer.classList.add('hidden');
  if (vaultContainer) vaultContainer.classList.add('hidden');
  if (databaseContainer) databaseContainer.classList.add('hidden');
  if (archiveWorkspace) archiveWorkspace.classList.add('hidden');
  if (chatContainer) chatContainer.classList.add('hidden');
  if (todoComingSoon) todoComingSoon.classList.toggle('hidden', !showTodoMessage);
}

async function enterTaskWorkspace() {
  workspaceSelection = 'task';
  localStorage.setItem('ivy_workspace_selection', 'task');
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
  if (databaseContainer) databaseContainer.classList.add('hidden');
  if (archiveWorkspace) archiveWorkspace.classList.add('hidden');
  if (chatContainer) chatContainer.classList.add('hidden');
}

function enterTodoWorkspace() {
  workspaceSelection = 'todo';
  localStorage.setItem('ivy_workspace_selection', 'todo');
  document.body.dataset.workspace = 'todo';
  if (startupScreen) startupScreen.classList.add('hidden');
  if (todoComingSoon) todoComingSoon.classList.add('hidden');
  if (mainContainer) mainContainer.style.display = 'none';
  if (archiveContainer) archiveContainer.style.display = 'none';
  if (memoContainer) memoContainer.classList.add('hidden');
  if (vaultContainer) vaultContainer.classList.add('hidden');
  if (databaseContainer) databaseContainer.classList.add('hidden');
  if (archiveWorkspace) archiveWorkspace.classList.add('hidden');
  if (chatContainer) chatContainer.classList.add('hidden');
  if (lastKnownAuthUser) {
    if (!currentUserId) currentUserId = lastKnownAuthUser.uid;
    if (authContainer) authContainer.style.display = 'none';
    if (todoContainer) todoContainer.classList.remove('hidden');
    subscribeCandidates(currentUserId);
    renderCandidates();
  } else {
    handleSignedOut(true);
  }
}

async function enterMemoWorkspace() {
  workspaceSelection = 'memo';
  localStorage.setItem('ivy_workspace_selection', 'memo');
  document.body.dataset.workspace = 'memo';
  if (startupScreen) startupScreen.classList.add('hidden');
  if (todoComingSoon) todoComingSoon.classList.add('hidden');
  if (authContainer) authContainer.style.display = 'none';
  if (mainContainer) mainContainer.style.display = 'none';
  if (archiveContainer) archiveContainer.style.display = 'none';
  if (todoContainer) todoContainer.classList.add('hidden');
  if (memoContainer) memoContainer.classList.remove('hidden');
  if (vaultContainer) vaultContainer.classList.add('hidden');
  if (databaseContainer) databaseContainer.classList.add('hidden');
  if (archiveWorkspace) archiveWorkspace.classList.add('hidden');
  if (chatContainer) chatContainer.classList.add('hidden');

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

async function enterArchiveWorkspace() {
  workspaceSelection = 'archive';
  localStorage.setItem('ivy_workspace_selection', 'archive');
  document.body.dataset.workspace = 'archive';
  if (startupScreen) startupScreen.classList.add('hidden');
  if (todoComingSoon) todoComingSoon.classList.add('hidden');
  if (authContainer) authContainer.style.display = 'none';
  if (mainContainer) mainContainer.style.display = 'none';
  if (archiveContainer) archiveContainer.style.display = 'none';

  if (todoContainer) todoContainer.classList.add('hidden');
  if (memoContainer) memoContainer.classList.add('hidden');
  if (vaultContainer) vaultContainer.classList.add('hidden');
  if (databaseContainer) databaseContainer.classList.add('hidden');
  if (chatContainer) chatContainer.classList.add('hidden');
  if (archiveWorkspace) archiveWorkspace.classList.remove('hidden');

  if (lastKnownAuthUser) {
    if (!currentUserId) currentUserId = lastKnownAuthUser.uid;
    await loadUserSettings(currentUserId);
    currentArchiveFilter = 'all'; // Reset filter when entering workspace
    if (archiveSortSelect) archiveSortSelect.value = 'dateDesc';
    currentArchiveSort = 'dateDesc';
    isSecretDiaryMode = false;
    document.body.classList.remove('diary-mode');
    if (archiveSecretCaption) archiveSecretCaption.style.display = 'none';
    if (startDiarySlideshowButton) startDiarySlideshowButton.style.display = 'none';
    subscribeArchive(currentUserId);
  } else {
    handleSignedOut(true);
  }
}

async function enterChatWorkspace() {
  workspaceSelection = 'chat';
  localStorage.setItem('ivy_workspace_selection', 'chat');
  document.body.dataset.workspace = 'chat';
  if (startupScreen) startupScreen.classList.add('hidden');
  if (todoComingSoon) todoComingSoon.classList.add('hidden');
  if (authContainer) authContainer.style.display = 'none';
  if (mainContainer) mainContainer.style.display = 'none';
  if (archiveContainer) archiveContainer.style.display = 'none';
  if (todoContainer) todoContainer.classList.add('hidden');
  if (memoContainer) memoContainer.classList.add('hidden');
  if (vaultContainer) vaultContainer.classList.add('hidden');
  if (databaseContainer) databaseContainer.classList.add('hidden');
  if (archiveWorkspace) archiveWorkspace.classList.add('hidden');
  
  if (chatContainer) {
    chatContainer.classList.remove('hidden');
    chatContainer.style.display = 'flex';
  }

  if (lastKnownAuthUser) {
    // currentUserId を確実にセット
    currentUserId = lastKnownAuthUser.uid;
    if (!currentUserId) return;

    await handleSignedIn(lastKnownAuthUser);
    
    // Unsubscribe from previous chat rooms if any
    if (chatRoomsUnsubscribe) {
      chatRoomsUnsubscribe();
      chatRoomsUnsubscribe = null;
    }
    if (chatMessagesUnsubscribe) {
      chatMessagesUnsubscribe();
      chatMessagesUnsubscribe = null;
    }
    currentChatRoomId = null;
    if (chatCurrentRoomName) chatCurrentRoomName.textContent = 'ルームを選択してください';
    if (chatMessages) chatMessages.innerHTML = '';
    if (chatInputForm) chatInputForm.classList.add('hidden');

    if (chatInputForm) chatInputForm.classList.add('hidden');

    listenChatRooms();
    // チャット画面を開いた際にも通知許可を確認
    requestNotificationPermission(currentUserId);
  } else {
    handleSignedOut(true);
  }
}

// ===== Auth State Change (Top Level Controller) =====
onAuthStateChanged(auth, async (user) => {
  lastKnownAuthUser = user;

  // マスターUID判定: ログイン確定直後に表示制御
  const startDbBtn = document.getElementById('start-database-button');
  if (user && user.uid === MASTER_UID) {
    if (startDbBtn) startDbBtn.classList.remove('hidden');
  } else {
    if (startDbBtn) startDbBtn.classList.add('hidden');
  }

  // user_profiles に保存 & 保留中の招待を処理
  if (user && user.uid && user.email) {
    const emailLower = user.email.toLowerCase();
    setDoc(doc(db, 'user_profiles', user.uid), { email: emailLower, uid: user.uid }, { merge: true })
      .catch(err => console.error('user_profiles 保存エラー:', err));

    // 自分宛の保留招待を処理（members追加 → 招待削除）
    getDocs(query(collection(db, 'chat_invitations'), where('inviteeEmail', '==', emailLower)))
      .then(async (snap) => {
        for (const inviteDoc of snap.docs) {
          const { roomId } = inviteDoc.data();
          try {
            await updateDoc(doc(db, 'chat_rooms', roomId), { members: arrayUnion(user.uid) });
            await deleteDoc(inviteDoc.ref);
          } catch (e) {
            console.error('招待処理エラー:', e);
          }
        }
      })
      .catch(err => console.error('招待確認エラー:', err));
  }

  if (workspaceSelection === 'task') {
    await enterTaskWorkspace();
  } else if (workspaceSelection === 'todo') {
    enterTodoWorkspace();
  } else if (workspaceSelection === 'memo') {
    enterMemoWorkspace();
  } else if (workspaceSelection === 'vault') {
    enterVaultWorkspace();
  } else if (workspaceSelection === 'database') {
    enterDatabaseWorkspace();
  } else if (workspaceSelection === 'archive') {
    enterArchiveWorkspace();
  } else if (workspaceSelection === 'chat') {
    enterChatWorkspace();
  } else {
    showStartupScreen(workspaceSelection === 'todo');
  }

  // ログイン成功時に通知許可を確認
  if (user) {
    requestNotificationPermission(user.uid);
  }
});

async function handleSignedIn(user) {
  if (!user || !user.uid) return;
  currentUserId = user.uid;
  authContainer.style.display = 'none';
  mainContainer.style.display = workspaceSelection === 'task' ? 'block' : 'none';
  archiveContainer.style.display = 'none';
  if (archiveWorkspace) archiveWorkspace.classList.add('hidden');
  userEmailSpan.textContent = user.email;
  setRecurringTaskUser(user.uid);
  refreshTodayRecurringTasks();
  
  if (currentUserId === MASTER_UID) {
    if (chatPetSelect && !chatPetSelect.querySelector('option[value="frog"]')) {
      const frogOption = document.createElement('option');
      frogOption.value = 'frog';
      frogOption.textContent = '🐸 黄金のカエル (Frog)';
      chatPetSelect.appendChild(frogOption);
    }
  }
  
  const userRef = doc(db, 'users', currentUserId);
  try {
    const docSnap = await getDoc(userRef);
    // 既存のpetType互換のため両方チェック、今後はselectedPetに統一
    const data = docSnap.exists() ? docSnap.data() : {};
    const loadedPet = data.selectedPet || data.petType;
    
    // loadedPet が未設定でもFirestoreへturtleの強制書き込みはしない（変数のみデフォルト）
    currentSelectedPet = loadedPet || 'turtle';
    if (chatPetSelect) {
      chatPetSelect.value = currentSelectedPet;
    }
  } catch (e) {
    console.error('ユーザーデータ読み込みエラー:', e);
  }


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
  subscribeCandidates(user.uid);
}

function handleSignedOut(showAuthScreen = true) {
  currentUserId = null;
  authContainer.style.display = showAuthScreen ? 'block' : 'none';
  mainContainer.style.display = 'none';
  archiveContainer.style.display = 'none';
  if (archiveWorkspace) archiveWorkspace.classList.add('hidden');
  teardownRecurringTasks();
  if (unsubscribeLabels) unsubscribeLabels();
  if (unsubscribeTasks) unsubscribeTasks();
  if (unsubscribeTasks) unsubscribeTasks();
  if (unsubscribeMemos) unsubscribeMemos();
  if (unsubscribeMemoFolders) unsubscribeMemoFolders();
  if (unsubscribeVaults) unsubscribeVaults();
  if (unsubscribeArchive) unsubscribeArchive();
  if (unsubscribeCandidates) unsubscribeCandidates();
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

// ===== Memos Markdown Link Feature =====

/**
 * リンク挿入の共通ヘルパー: テキストノードのmatchIndex位置に<a>タグを挿入する
 */
function insertLinkNode(node, matchIndex, cursorOffset, linkText, linkUrl, textContent) {
  // マッチ部分 + トリガー文字をテキストノードから削除
  node.textContent =
    textContent.slice(0, matchIndex) +
    textContent.slice(cursorOffset);

  const aElem = document.createElement('a');
  aElem.href = linkUrl;
  aElem.textContent = linkText;
  aElem.target = '_blank';
  aElem.rel = 'noopener noreferrer';
  aElem.contentEditable = 'false';
  aElem.className = 'memo-link';

  const insertRange = document.createRange();
  insertRange.setStart(node, matchIndex);
  insertRange.collapse(true);
  insertRange.insertNode(aElem);

  // リンク直後にノーブレークスペースを置いてカーソルを移動
  const spaceNode = document.createTextNode('\u00A0');
  aElem.parentNode.insertBefore(spaceNode, aElem.nextSibling);

  const selection = window.getSelection();
  selection.removeAllRanges();
  const afterLinkRange = document.createRange();
  afterLinkRange.setStart(spaceNode, 1);
  afterLinkRange.collapse(true);
  selection.addRange(afterLinkRange);
}

function convertMarkdownLink() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  const node = range.startContainer;

  if (node.nodeType !== Node.TEXT_NODE) return;

  const textContent = node.textContent;
  const cursorOffset = range.startOffset;

  if (cursorOffset < 1) return;
  // トリガーとなったスペース/改行の直前までの文字列を取得
  const textBeforeTrigger = textContent.slice(0, cursorOffset - 1);

  // ① Markdown記法 [テキスト](URL) を優先して検知
  const markdownRegex = /\[([^\]]+)\]\(([^)]+)\)$/;
  const mdMatch = textBeforeTrigger.match(markdownRegex);
  if (mdMatch) {
    insertLinkNode(node, mdMatch.index, cursorOffset, mdMatch[1], mdMatch[2], textContent);
    return;
  }

  // ② 生URL（https:// または http://）を末尾で検知
  const urlRegex = /https?:\/\/[^\s\u00A0]+$/;
  const urlMatch = textBeforeTrigger.match(urlRegex);
  if (urlMatch) {
    const rawUrl = urlMatch[0];
    insertLinkNode(node, urlMatch.index, cursorOffset, rawUrl, rawUrl, textContent);
    return;
  }
}

if (memoContentEditor) {
  memoContentEditor.addEventListener('keyup', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      convertMarkdownLink();
    }
  });

  // ===== URL ペースト時の自動リンク変換 ＆ 画像ペースト =====
  memoContentEditor.addEventListener('paste', (e) => {
    // ── ① 画像ファイルが含まれる場合は最優先で画像エディタへ ──
    const files = e.clipboardData.files;
    if (files && files.length > 0) {
      const imageFile = Array.from(files).find(f => f.type.startsWith('image/'));
      if (imageFile) {
        e.preventDefault();
        openImageEditor(imageFile);
        return;
      }
    }

    const text = e.clipboardData.getData('text/plain').trim();

    // ── ② URL単体の場合は <a> タグに変換 ──
    const isUrl = /^https?:\/\/\S+$/.test(text);

    if (isUrl) {
      e.preventDefault();

      const aElem = document.createElement('a');
      aElem.href = text;
      aElem.textContent = text;
      aElem.target = '_blank';
      aElem.rel = 'noopener noreferrer';
      aElem.contentEditable = 'false';
      aElem.className = 'memo-link';

      const selection = window.getSelection();
      if (!selection.rangeCount) return;

      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(aElem);

      // リンク直後にノーブレークスペースを置いてカーソルを移動
      const spaceNode = document.createTextNode('\u00A0');
      aElem.parentNode.insertBefore(spaceNode, aElem.nextSibling);

      const afterRange = document.createRange();
      afterRange.setStart(spaceNode, 1);
      afterRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(afterRange);

      // 自動保存トリガー
      memoContentEditor.dispatchEvent(new Event('input'));

      // Swal トースト通知
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'リンクに変換しました',
        showConfirmButton: false,
        timer: 1800,
        timerProgressBar: true,
      });
    } else {
      // ── ③ URL以外はプレーンテキストとして貼り付け（書式を剥がす） ──
      e.preventDefault();
      const plain = e.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, plain);
    }
  });
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

if (startArchiveButton) {
  startArchiveButton.addEventListener('click', () => { enterArchiveWorkspace(); });
}
if (archiveBackStartupButton) {
  archiveBackStartupButton.addEventListener('click', () => { showStartupScreen(); });
}
if (startChatButton) {
  startChatButton.addEventListener('click', () => { enterChatWorkspace(); });
}
if (chatBackStartupButton) {
  chatBackStartupButton.addEventListener('click', () => { 
    if (chatRoomsUnsubscribe) {
      chatRoomsUnsubscribe();
      chatRoomsUnsubscribe = null;
    }
    if (chatMessagesUnsubscribe) {
      chatMessagesUnsubscribe();
      chatMessagesUnsubscribe = null;
    }
    showStartupScreen(); 
  });
}
if (chatCreateRoomBtn) {
  chatCreateRoomBtn.addEventListener('click', () => createChatRoom());
}
const chatInviteBtn = document.getElementById('chat-invite-btn');
if (chatInviteBtn) {
  chatInviteBtn.addEventListener('click', () => inviteToChatRoom());
}
if (chatPetSelect) {
  chatPetSelect.addEventListener('change', async (e) => {
    const newPet = e.target.value;
    currentSelectedPet = newPet;
    // currentUserId が null の場合（スタートアップ画面）でも auth.currentUser から取得して保存
    const saveUserId = currentUserId || auth.currentUser?.uid;
    if (saveUserId) {
      try {
        await setDoc(doc(db, 'users', saveUserId), { selectedPet: newPet }, { merge: true });
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'パートナーを変更しました', showConfirmButton: false, timer: 1500 });
      } catch (err) {
        console.error('Error saving pet type:', err);
      }
    } else {
      console.warn('パートナー保存失敗: ユーザーIDが取得できません');
    }
  });
}
if (chatInputForm) {
  chatInputForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (chatMessageInput) {
      sendChatMessage(chatMessageInput.value);
    }
  });
}

if (closePreviewButton) {
  closePreviewButton.addEventListener('click', () => {
    if (pdfPreviewModalBackdrop) pdfPreviewModalBackdrop.classList.add('hidden');
    if (pdfCanvasContainer) { pdfCanvasContainer.innerHTML = ''; pdfCanvasContainer.style.display = ''; }
    closeImagePreview();
    currentPreviewPdfId = null;
  });
}
if (pdfPreviewModalBackdrop) {
  pdfPreviewModalBackdrop.addEventListener('click', (e) => {
    if (e.target === pdfPreviewModalBackdrop) {
      pdfPreviewModalBackdrop.classList.add('hidden');
      if (pdfCanvasContainer) { pdfCanvasContainer.innerHTML = ''; pdfCanvasContainer.style.display = ''; }
      closeImagePreview();
      currentPreviewPdfId = null;
    }
  });
}

if (openCandidatePanelButton) {
  openCandidatePanelButton.addEventListener('click', () => {
    if (candidatePanel) candidatePanel.classList.remove('hidden');
    if (candidateNameInput) candidateNameInput.focus();
  });
}
if (candidateForm) {
  candidateForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUserId) return;
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
    try {
      await addDoc(collection(db, 'candidates'), {
        userId: currentUserId,
        name, start, dept, grade, note, type,
        tasks,
        interviews: normalizeInterviews([]),
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error('candidates addDoc error:', err);
      alert('追加失敗: ' + err.message);
      return;
    }
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
  candidateDetailForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentCandidateId) return closeCandidateModal();
    const tasks = readDetailTasks();
    await updateDoc(doc(db, 'candidates', currentCandidateId), {
      name: candidateDetailNameInput?.value.trim() || '',
      start: candidateDetailStartInput?.value.trim() || '',
      dept: candidateDetailDeptInput?.value.trim() || '',
      grade: candidateDetailGradeInput?.value.trim() || '',
      note: candidateDetailNoteInput?.value.trim() || '',
      type: candidateDetailTypeInput?.value.trim() || '',
      tasks,
      interviews: currentInterviews
    });
    closeCandidateModal();
  });
}

function subscribeCandidates(userId) {
  if (unsubscribeCandidates) unsubscribeCandidates();
  const q = query(collection(db, 'candidates'), where('userId', '==', userId));
  unsubscribeCandidates = onSnapshot(q, (snapshot) => {
    candidates = [];
    snapshot.forEach(docSnap => {
      candidates.push(normalizeCandidate({ id: docSnap.id, ...docSnap.data() }));
    });
    renderCandidates(candidates);
  }, (err) => {
    console.error('candidates onSnapshot error:', err);
  });
}
function renderCandidates(list = candidates) {
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
      deleteDoc(doc(db, 'candidates', c.id));
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
  const candidate = candidates.find(c => c.id === id);
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

const openSettingsModal = async () => {
  if (auth.currentUser) { settingsUserIdSpan.textContent = auth.currentUser.email; }
  settingsModalBackdrop.classList.remove('hidden');
  document.body.classList.add('modal-open');
  ensureUpdatesLoaded();
  // スタートアップ画面では currentUserId=null のため auth.currentUser からフォールバック
  const modalUserId = currentUserId || auth.currentUser?.uid;
  // 設定を開くたびに最新のペット選択をFirestoreから取得してセレクトに反映
  if (modalUserId && chatPetSelect) {
    // マスターの場合はfrogオプションを確保
    if (modalUserId === MASTER_UID && !chatPetSelect.querySelector('option[value="frog"]')) {
      const frogOption = document.createElement('option');
      frogOption.value = 'frog';
      frogOption.textContent = '🐸 黄金のカエル (Frog)';
      chatPetSelect.appendChild(frogOption);
    }
    try {
      const userSnap = await getDoc(doc(db, 'users', modalUserId));
      if (userSnap.exists()) {
        const data = userSnap.data();
        const savedPet = data.selectedPet || data.petType || 'turtle';
        currentSelectedPet = savedPet;
        chatPetSelect.value = savedPet;
      } else if (currentSelectedPet) {
        chatPetSelect.value = currentSelectedPet;
      }
    } catch (e) {
      console.error('設定モーダル: ペット読み込みエラー', e);
      if (currentSelectedPet) chatPetSelect.value = currentSelectedPet;
    }
  }
};
document.getElementById('startup-settings-button')?.addEventListener('click', openSettingsModal);
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
  localStorage.setItem('ivy_workspace_selection', 'vault');
  document.body.dataset.workspace = 'vault';
  if (startupScreen) startupScreen.classList.add('hidden');
  if (todoComingSoon) todoComingSoon.classList.add('hidden');
  if (authContainer) authContainer.style.display = 'none';
  if (mainContainer) mainContainer.style.display = 'none';
  if (archiveContainer) archiveContainer.style.display = 'none';
  if (todoContainer) todoContainer.classList.add('hidden');
  if (memoContainer) memoContainer.classList.add('hidden');
  if (vaultContainer) vaultContainer.classList.remove('hidden');
  if (databaseContainer) databaseContainer.classList.add('hidden');
  if (archiveWorkspace) archiveWorkspace.classList.add('hidden');
  if (chatContainer) chatContainer.classList.add('hidden');

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

    const shareBtn = document.createElement('button');
    shareBtn.className = 'vault-share-btn';
    shareBtn.textContent = '共有';
    shareBtn.addEventListener('click', () => shareVaultItem(v));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'vault-delete-btn';
    deleteBtn.textContent = '削除';
    deleteBtn.addEventListener('click', () => deleteVault(v.id, v.title));
    actions.append(editBtn, shareBtn, deleteBtn);
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

function generateShareKey() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let key = '';
  for (let i = 0; i < 6; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

async function shareVaultItem(v) {
  if (!confirm(`「${v.title || '(無題)'}」を共有しますか？\n共有用のワンタイムキーを発行します。`)) return;

  const shareKey = generateShareKey();

  const shareData = {
    title: v.title,
    category: v.category || '',
    url: v.url || '',
    loginId: v.loginId || '',
    password: v.password || '', // そのまま転送
    memo: v.memo || '',
    createdAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'shared_vault_items', shareKey), shareData);
    
    Swal.fire({
      title: '🔑 共有キー発行',
      html: `
        <p>以下のキーを受信者に伝えてください（1回使い切り）。</p>
        <div style="font-size: 2rem; font-family: monospace; font-weight: bold; margin: 20px 0; letter-spacing: 4px; color: #7c4dff;">
          ${shareKey}
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'コピーして閉じる',
      cancelButtonText: '閉じる',
    }).then((result) => {
      if (result.isConfirmed) {
        navigator.clipboard.writeText(shareKey).then(() => {
          Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'キーをコピーしました', showConfirmButton: false, timer: 1500 });
        });
      }
    });

  } catch (err) {
    console.error('Vault share error:', err);
    alert('共有キーの発行に失敗しました。');
  }
}

async function importSharedVaultItem() {
  const { value: shareKey } = await Swal.fire({
    title: '共有キーを入力',
    input: 'text',
    inputLabel: '送信者から受け取った6桁のキー',
    inputPlaceholder: 'XXXXXX',
    showCancelButton: true,
    confirmButtonText: 'インポート',
    cancelButtonText: 'キャンセル',
    inputValidator: (value) => {
      if (!value) {
        return 'キーを入力してください！';
      }
    }
  });

  if (!shareKey) return;
  const normalizedKey = shareKey.trim().toUpperCase();

  try {
    const docRef = doc(db, 'shared_vault_items', normalizedKey);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      
      const newData = {
        userId: currentUserId,
        title: data.title,
        category: data.category || '',
        url: data.url || '',
        loginId: data.loginId || '',
        password: data.password || '',
        memo: data.memo || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'vaults'), newData);
      await deleteDoc(docRef);

      Swal.fire('インポート完了', 'データを追加しました。', 'success');
    } else {
      Swal.fire('エラー', '無効なキー、または既に使用されています。', 'error');
    }
  } catch (err) {
    console.error('Vault import error:', err);
    Swal.fire('エラー', 'インポート時にエラーが発生しました。', 'error');
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

if (vaultImportShareBtn) {
  vaultImportShareBtn.addEventListener('click', () => importSharedVaultItem());
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

  let settingsData = {};
  try {
    const settingsRef = doc(db, 'settings', currentUserId);
    const docSnap = await getDoc(settingsRef);
    settingsData = docSnap.exists() ? docSnap.data() : {};
  } catch (error) {
    console.error("Verification error (getDoc):", error);
    alert('Firestoreへのアクセスに失敗しました。ネットワーク接続を確認して再読み込みしてください。\n\n詳細: ' + error.message);
    return;
  }

  if (!settingsData.vaultVerification) {
    // First time setup or no verification data: encrypt fixed string
    try {
      const verificationData = await encryptPassword("IVY_VAULT_VALID", inputPassword);
      const settingsRef = doc(db, 'settings', currentUserId);
      await setDoc(settingsRef, { vaultVerification: verificationData }, { merge: true });
      unlockVault(inputPassword);
      vaultMasterPasswordInput.value = '';
    } catch (error) {
      console.error("Verification error (initial setup):", error);
      alert('初期設定に失敗しました。再読み込みしてください。\n\n詳細: ' + error.message);
    }
  } else {
    // Verification exists: try to decrypt
    const decrypted = await decryptPassword(settingsData.vaultVerification, inputPassword);
    if (decrypted === "IVY_VAULT_VALID") {
      unlockVault(inputPassword);
      vaultMasterPasswordInput.value = '';
    } else {
      alert('マスターパスワードが違います。');
      vaultMasterPasswordInput.value = '';
      vaultMasterPasswordInput.focus();
    }
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

if (taskBackStartupButton) {
  taskBackStartupButton.addEventListener('click', () => {
    showStartupScreen();
  });
}

// CSV Import Logic
if (importCSVButton && importCSVInput) {
  importCSVButton.addEventListener('click', () => {
    importCSVInput.click();
  });

  importCSVInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvData = event.target.result;
      await processCSVData(csvData);
      importCSVInput.value = ''; // Reset
    };
    reader.readAsText(file);
  });
}

async function processCSVData(csvText) {
  if (!currentUserId) {
    alert('ユーザー認証エラー: 再ログインしてください。');
    return;
  }

  const lines = csvText.split(/\r\n|\n/);
  const dataLines = lines.filter(line => line.trim() !== '');

  if (dataLines.length < 2) {
    alert('CSVデータが空か、ヘッダーのみです。');
    return;
  }

  // Header: 氏名,入社予定日,配属予定部署,グレード,メモ,区分
  // Index: 0, 1, 2, 3, 4, 5
  // We assume the first line is header. We won't strictly validate header names for flexibility, but assume order.

  const newCandidates = [];
  let successCount = 0;
  let failCount = 0;

  // Start from index 1 (skip header)
  for (let i = 1; i < dataLines.length; i++) {
    const line = dataLines[i];
    const columns = line.split(',').map(c => c.trim());

    // Basic validation: Name is required
    // name is index 0
    const name = columns[0];
    if (!name) {
      failCount++;
      continue;
    }

    const start = columns[1] || '';
    const dept = columns[2] || '';
    const grade = columns[3] || '';
    const note = columns[4] || '';
    const type = columns[5] || '';

    const tasks = DEFAULT_CANDIDATE_TASKS.map((t, idx) => ({
      id: `t-${Date.now()}-${i}-${idx}`, // Unique ID
      text: t,
      done: false,
      stage: '',
      schedule: '',
      infoProvided: false,
      onboardingSchedule: '',
      onboardingItemsProvided: false
    }));

    newCandidates.push({
      userId: currentUserId,
      name, start, dept, grade, note, type,
      tasks,
      interviews: [],
      createdAt: serverTimestamp() // We can't batch serverTimestamp easily in a loop if we want accurate order? Actually fine.
    });
  }

  if (newCandidates.length === 0) {
    alert('インポートできるデータがありませんでした。');
    return;
  }

  if (!confirm(`${newCandidates.length}件のデータをインポートしますか？`)) return;

  try {
    const batch = writeBatch(db);
    // Firestore batch limit is 500. If more, we need multiple batches.
    // For simplicity, assuming < 500 for now.

    newCandidates.forEach(c => {
      const ref = doc(collection(db, 'candidates'));
      batch.set(ref, c);
      successCount++;
    });

    await batch.commit();
    alert(`インポート完了: ${successCount}件成功`);
  } catch (e) {
    console.error('CSV Import Error:', e);
    alert('インポートに失敗しました: ' + e.message);
  }
}
// Helper for Employee ID Formatting
function formatEmpId(id) {
  if (!id) return '';
  // Remove non-numeric characters if needed, or just pad what we have? 
  // User asked for "1 -> 0001", "20 -> 0020". Implies numeric handling.
  // But some companies have alphanumeric. Let's try to parse int, if it's a number, pad it.
  // If it's already a string like "A1", padding might be weird.
  // Requirement says "1 is 0001". I'll assume they want numeric padding.

  const num = parseInt(id, 10);
  if (!isNaN(num)) {
    return num.toString().padStart(4, '0');
  }
  return id;
}

function formatDateForInput(dateStr) {
  if (!dateStr) return '';
  // Try to parse YYYY/MM/DD or YYYY-MM-DD
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return ''; // Invalid date

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// DataBase Logic
// DOM Elements
const startDatabaseButton = document.getElementById('start-database-button');
const databaseBackStartupButton = document.getElementById('database-back-startup-button');
const databaseAddButton = document.getElementById('database-add-button');
const databaseSearchInput = document.getElementById('database-search-input');
const databaseList = document.getElementById('database-list');

const employeeModalBackdrop = document.getElementById('employee-modal-backdrop');
const employeeModalTitle = document.getElementById('employee-modal-title');
const employeeForm = document.getElementById('employee-form');
const empInputName = document.getElementById('emp-input-name');
const empInputId = document.getElementById('emp-input-id');
const empInputDept = document.getElementById('emp-input-dept'); // Division
const empInputDepartment = document.getElementById('emp-input-department'); // Department
const empInputTitle = document.getElementById('emp-input-title');
const empInputGrade = document.getElementById('emp-input-grade');
const empInputBirthday = document.getElementById('emp-input-birthday');
const empInputAge = document.getElementById('emp-input-age');
const empInputHireDate = document.getElementById('emp-input-hire-date');
const empInputTenure = document.getElementById('emp-input-tenure');
const empInputContractType = document.getElementById('emp-input-contract-type');
const empInputContractEnd = document.getElementById('emp-input-contract-end');
const empInputBusinessUnit = document.getElementById('emp-input-business-unit');
const empInputResignationDate = document.getElementById('emp-input-resignation-date');
const empInputStatus = document.getElementById('emp-input-status');
const empInputEmail = document.getElementById('emp-input-email');
const empInputPhone = document.getElementById('emp-input-phone');
const empInputNote = document.getElementById('emp-input-note');
const employeeModalCancel = document.getElementById('employee-modal-cancel');

// Bulk delete state
let selectedEmployeeIds = new Set();

// Column Selection & CSV Elements
const databaseColumnsButton = document.getElementById('database-columns-button');
const databaseImportButton = document.getElementById('database-import-button');
const databaseExportButton = document.getElementById('database-export-button');
const databaseImportInput = document.getElementById('database-import-input');
const columnModalBackdrop = document.getElementById('column-modal-backdrop');
const columnCheckboxes = document.getElementById('column-checkboxes');
const columnModalCancel = document.getElementById('column-modal-cancel');
const columnModalSave = document.getElementById('column-modal-save');
const databaseTableHeaderRow = document.getElementById('database-table-header-row');
const databaseBulkToolbar = document.getElementById('database-bulk-toolbar');
const databaseBulkCount = document.getElementById('database-bulk-count');
const databaseBulkDeleteButton = document.getElementById('database-bulk-delete-button');
const databaseBulkClearButton = document.getElementById('database-bulk-clear-button');

// Filter Elements
const databaseFilterButton = document.getElementById('database-filter-button');
const filterModalBackdrop = document.getElementById('filter-modal-backdrop');
const filterModalReset = document.getElementById('filter-modal-reset');
const filterModalCancel = document.getElementById('filter-modal-cancel');
const filterModalApply = document.getElementById('filter-modal-apply');
const filterInputsContainer = document.getElementById('filter-inputs-container');

// Column Definitions
const ALL_COLUMNS = [
  { id: 'empId', label: '社員番号', default: true },
  { id: 'name', label: '氏名', default: true },
  { id: 'dept', label: '部門', default: true },
  { id: 'department', label: '部署', default: true },
  { id: 'title', label: '役職', default: false },
  { id: 'grade', label: 'グレード', default: true },
  { id: 'birthday', label: '誕生日', default: false },
  { id: 'age', label: '年齢', default: false },
  { id: 'hireDate', label: '入社日', default: true },
  { id: 'tenure', label: '在籍期間', default: false },
  { id: 'contractType', label: '契約形態', default: false },
  { id: 'contractEnd', label: '契約満了日', default: false },
  { id: 'businessUnit', label: '事業部', default: false },
  { id: 'resignationDate', label: '退職日', default: false },
  { id: 'status', label: '在籍状況', default: true },
  { id: 'email', label: 'メール', default: false },
  { id: 'phone', label: '電話番号', default: false },
  { id: 'note', label: 'メモ', default: false }
];

let visibleColumns = JSON.parse(localStorage.getItem('ivy_database_columns')) || ALL_COLUMNS.filter(c => c.default).map(c => c.id);
let currentSort = { key: 'empId', order: 'asc' };
let currentFilters = {}; // Dynamically populated { key: value }

async function enterDatabaseWorkspace() {
  workspaceSelection = 'database';
  localStorage.setItem('ivy_workspace_selection', 'database');
  document.body.dataset.workspace = 'database';
  if (startupScreen) startupScreen.classList.add('hidden');
  if (todoComingSoon) todoComingSoon.classList.add('hidden');
  if (authContainer) authContainer.style.display = 'none';
  if (mainContainer) mainContainer.style.display = 'none';
  if (archiveContainer) archiveContainer.style.display = 'none';
  if (todoContainer) todoContainer.classList.add('hidden');
  if (memoContainer) memoContainer.classList.add('hidden');
  if (vaultContainer) vaultContainer.classList.add('hidden');
  if (chatContainer) chatContainer.classList.add('hidden');
  if (databaseContainer) databaseContainer.classList.remove('hidden');

  if (lastKnownAuthUser) {
    if (!currentUserId) currentUserId = lastKnownAuthUser.uid;
    await loadUserSettings(currentUserId);
    subscribeEmployees(currentUserId);
  } else {
    handleSignedOut(true);
  }
}

function subscribeEmployees(userId) {
  if (unsubscribeEmployees) unsubscribeEmployees();
  const q = query(collection(db, 'employees'), where('userId', '==', userId)); // orderBy if indices available
  unsubscribeEmployees = onSnapshot(q, (snapshot) => {
    employees = [];
    snapshot.forEach(docSnap => {
      const d = docSnap.data();
      // Calculate age/tenure on fly if needed for sort/display
      const age = calculateAge(d.birthday);
      const tenure = calculateTenure(d.hireDate);

      employees.push({
        id: docSnap.id,
        ...d,
        age: age ? `${age}歳` : '',
        tenure: tenure || ''
      });
    });
    // Initial sort
    sortEmployees();
    renderEmployeeList();
  });
}

function sortEmployees() {
  employees.sort((a, b) => {
    let valA = a[currentSort.key] || '';
    let valB = b[currentSort.key] || '';

    // Numeric sort for Employee ID
    if (currentSort.key === 'empId') {
      const numA = parseInt(valA, 10);
      const numB = parseInt(valB, 10);
      if (!isNaN(numA) && !isNaN(numB)) {
        valA = numA;
        valB = numB;
      }
    }

    // Numeric sort for Grade/Age if needed, but strings work for now roughly
    // Special handling for numeric-like strings could be added here

    if (valA < valB) return currentSort.order === 'asc' ? -1 : 1;
    if (valA > valB) return currentSort.order === 'asc' ? 1 : -1;
    return 0;
  });
}

function handleSort(key) {
  if (currentSort.key === key) {
    currentSort.order = currentSort.order === 'asc' ? 'desc' : 'asc';
  } else {
    currentSort.key = key;
    currentSort.order = 'asc';
  }
  sortEmployees();
  renderEmployeeList();
}

function renderEmployeeList() {
  if (!databaseList) return;
  databaseList.innerHTML = '';

  const q = employeeSearchQuery.toLowerCase();
  const filtered = employees.filter(e => {
    // Search Filter
    const matchesSearch = !q || (
      (e.name || '').toLowerCase().includes(q) ||
      (e.empId || '').toLowerCase().includes(q) ||
      (e.dept || '').toLowerCase().includes(q) ||
      (e.grade || '').toLowerCase().includes(q) ||
      (e.status || '').toLowerCase().includes(q)
    );
    if (!matchesSearch) return false;

    // Advanced Filters (Dynamic)
    for (const key in currentFilters) {
      if (!currentFilters[key]) continue; // Skip empty filters

      const filterVal = currentFilters[key];
      const empVal = e[key];

      // Determine type of match based on column definition or implicit rule
      // For now:
      // - Date/Selects: Exact string match
      // - Text: Partial match (case insensitive)

      const colDef = ALL_COLUMNS.find(c => c.id === key);
      const isSelect = ['dept', 'department', 'title', 'grade', 'contractType', 'businessUnit', 'status'].includes(key);
      const isDate = ['birthday', 'hireDate', 'contractEnd', 'resignationDate'].includes(key);

      if (isSelect || isDate) {
        if (empVal !== filterVal) return false;
      } else {
        // Text partial match
        if (!(empVal || '').toLowerCase().includes(filterVal.toLowerCase())) return false;
      }
    }

    return true;
  });

  if (filtered.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="7" style="text-align:center; padding: 20px;">データが見つかりません</td>';
    databaseList.appendChild(tr);
    return;
  }

  // Render Headers
  databaseTableHeaderRow.innerHTML = '';
  const activeCols = ALL_COLUMNS.filter(c => visibleColumns.includes(c.id));

  // Checkbox header (select all)
  const thCheck = document.createElement('th');
  thCheck.className = 'bulk-check-col';
  const selectAllCheckbox = document.createElement('input');
  selectAllCheckbox.type = 'checkbox';
  selectAllCheckbox.title = 'すべて選択';
  selectAllCheckbox.addEventListener('change', () => {
    if (selectAllCheckbox.checked) {
      filtered.forEach(e => selectedEmployeeIds.add(e.id));
    } else {
      filtered.forEach(e => selectedEmployeeIds.delete(e.id));
    }
    updateBulkToolbar();
    renderEmployeeList();
  });
  thCheck.appendChild(selectAllCheckbox);
  databaseTableHeaderRow.appendChild(thCheck);

  activeCols.forEach(c => {
    const th = document.createElement('th');
    th.textContent = c.label;
    th.style.cursor = 'pointer';
    th.addEventListener('click', () => handleSort(c.id));

    // Sort Indicator
    if (currentSort.key === c.id) {
      const span = document.createElement('span');
      span.className = 'sort-indicator active';
      span.textContent = currentSort.order === 'asc' ? '▲' : '▼';
      th.appendChild(span);
    } else {
      const span = document.createElement('span');
      span.className = 'sort-indicator';
      span.textContent = '▲'; // Default faint indicator
      th.appendChild(span);
    }

    databaseTableHeaderRow.appendChild(th);
  });
  const thAction = document.createElement('th');
  thAction.textContent = '操作';
  databaseTableHeaderRow.appendChild(thAction);

  filtered.forEach(e => {
    const tr = document.createElement('tr');
    if (e.csvUpdated) tr.classList.add('csv-updated-row');
    if (selectedEmployeeIds.has(e.id)) tr.classList.add('bulk-selected-row');

    // Checkbox cell
    const tdCheck = document.createElement('td');
    tdCheck.className = 'bulk-check-col';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = selectedEmployeeIds.has(e.id);
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        selectedEmployeeIds.add(e.id);
      } else {
        selectedEmployeeIds.delete(e.id);
      }
      updateBulkToolbar();
      tr.classList.toggle('bulk-selected-row', checkbox.checked);
      // Update select-all state
      const allChecked = filtered.every(emp => selectedEmployeeIds.has(emp.id));
      selectAllCheckbox.checked = allChecked;
      selectAllCheckbox.indeterminate = !allChecked && filtered.some(emp => selectedEmployeeIds.has(emp.id));
    });
    tdCheck.appendChild(checkbox);
    tr.appendChild(tdCheck);

    activeCols.forEach((c, colIndex) => {
      const td = document.createElement('td');
      if (c.id === 'status') {
        const span = document.createElement('span');
        span.className = `status-badge ${getStatusClass(e.status)}`;
        span.textContent = e.status || '-';
        td.appendChild(span);
      } else if (c.id === 'empId') {
        td.textContent = formatEmpId(e.empId) || '-';
      } else {
        td.textContent = e[c.id] || '-';
      }
      // Show update dot on the first column
      if (colIndex === 0 && e.csvUpdated) {
        const dot = document.createElement('span');
        dot.className = 'csv-update-dot';
        dot.title = 'CSVで更新されました';
        td.insertBefore(dot, td.firstChild);
        td.style.position = 'relative';
      }
      tr.appendChild(td);
    });

    // Actions
    const tdAction = document.createElement('td');
    const editBtn = document.createElement('button');
    editBtn.textContent = '編集';
    editBtn.className = 'small';
    editBtn.style.marginRight = '5px';
    editBtn.addEventListener('click', () => openEmployeeModal(e.id));

    const delBtn = document.createElement('button');
    delBtn.textContent = '削除';
    delBtn.className = 'small danger';
    delBtn.addEventListener('click', () => deleteEmployee(e.id, e.name));

    tdAction.appendChild(editBtn);
    tdAction.appendChild(delBtn);

    tr.appendChild(tdAction);

    databaseList.appendChild(tr);
  });

  // Set select-all checkbox initial state
  const allChecked = filtered.length > 0 && filtered.every(e => selectedEmployeeIds.has(e.id));
  const someChecked = filtered.some(e => selectedEmployeeIds.has(e.id));
  selectAllCheckbox.checked = allChecked;
  selectAllCheckbox.indeterminate = !allChecked && someChecked;
}

function updateBulkToolbar() {
  if (!databaseBulkToolbar) return;
  if (selectedEmployeeIds.size > 0) {
    databaseBulkToolbar.classList.remove('hidden');
    databaseBulkCount.textContent = `${selectedEmployeeIds.size}件選択中`;
  } else {
    databaseBulkToolbar.classList.add('hidden');
  }
}

async function bulkDeleteEmployees() {
  const count = selectedEmployeeIds.size;
  if (count === 0) return;
  if (!confirm(`選択した ${count} 件を削除しますか？\nこの操作は取り消せません。`)) return;

  try {
    const ids = [...selectedEmployeeIds];
    const chunkSize = 400;
    for (let i = 0; i < ids.length; i += chunkSize) {
      const batch = writeBatch(db);
      ids.slice(i, i + chunkSize).forEach(id => {
        batch.delete(doc(db, 'employees', id));
      });
      await batch.commit();
    }
    selectedEmployeeIds.clear();
    updateBulkToolbar();
  } catch (err) {
    console.error('Bulk delete error:', err);
    alert('削除に失敗しました: ' + err.message);
  }
}

function getStatusClass(status) {
  if (status === '在籍') return 'status-active';
  if (status === '休職') return 'status-warning';
  if (status === '退職') return 'status-inactive';
  return '';
}

function openEmployeeModal(id = null) {
  if (id) {
    // Edit
    editingEmployeeId = id;
    const e = employees.find(x => x.id === id);
    if (!e) return;
    employeeModalTitle.textContent = '職員を編集';
    empInputName.value = e.name || '';
    empInputId.value = formatEmpId(e.empId || '');
    empInputDept.value = e.dept || '';
    empInputDepartment.value = e.department || '';
    empInputTitle.value = e.title || '';
    empInputGrade.value = e.grade || '';
    empInputTitle.value = e.title || '';
    empInputGrade.value = e.grade || '';
    empInputBirthday.value = formatDateForInput(e.birthday || '');
    empInputHireDate.value = formatDateForInput(e.hireDate || '');
    empInputContractType.value = e.contractType || '無期';
    empInputContractEnd.value = formatDateForInput(e.contractEnd || '');
    empInputBusinessUnit.value = e.businessUnit || '';
    empInputResignationDate.value = formatDateForInput(e.resignationDate || '');
    empInputStatus.value = e.status || '在籍';
    empInputEmail.value = e.email || '';
    empInputPhone.value = e.phone || '';
    empInputNote.value = e.note || '';

    updateAge();
    updateTenure();
  } else {
    // Add
    editingEmployeeId = null;
    employeeModalTitle.textContent = '職員を追加';
    employeeForm.reset();
    empInputStatus.value = '在籍';
    empInputContractType.value = '無期';
    updateAge(); // Clear
    updateTenure(); // Clear
  }
  employeeModalBackdrop.classList.remove('hidden');
}

function closeEmployeeModal() {
  employeeModalBackdrop.classList.add('hidden');
  editingEmployeeId = null;
  employeeForm.reset();
}

async function saveEmployee() {
  if (!currentUserId) return;

  const data = {
    userId: currentUserId,
    name: empInputName.value.trim(),
    empId: formatEmpId(empInputId.value.trim()),
    dept: empInputDept.value.trim(),
    department: empInputDepartment.value.trim(),
    title: empInputTitle.value.trim(),
    grade: empInputGrade.value.trim(),
    birthday: empInputBirthday.value,
    hireDate: empInputHireDate.value,
    contractType: empInputContractType.value,
    contractEnd: empInputContractEnd.value,
    businessUnit: empInputBusinessUnit.value,
    resignationDate: empInputResignationDate.value,
    status: empInputStatus.value,
    email: empInputEmail.value.trim(),
    phone: empInputPhone.value.trim(),
    note: empInputNote.value.trim(),
    updatedAt: serverTimestamp()
  };

  if (!data.name || !data.empId) {
    alert('氏名と社員番号は必須です。');
    return;
  }

  try {
    if (editingEmployeeId) {
      await updateDoc(doc(db, 'employees', editingEmployeeId), data);
    } else {
      data.createdAt = serverTimestamp();
      await addDoc(collection(db, 'employees'), data);
    }
    closeEmployeeModal();
  } catch (err) {
    console.error('Error saving employee:', err);
    alert('保存に失敗しました: ' + err.message);
  }
}

async function deleteEmployee(id, name) {
  if (!confirm(`${name} を削除しますか？`)) return;
  try {
    await deleteDoc(doc(db, 'employees', id));
  } catch (err) {
    console.error('Error deleting employee:', err);
    alert('削除に失敗しました: ' + err.message);
  }
}

// DataBase Listeners
if (startDatabaseButton) {
  startDatabaseButton.addEventListener('click', () => enterDatabaseWorkspace());
}

if (databaseBackStartupButton) {
  databaseBackStartupButton.addEventListener('click', () => showStartupScreen());
}

if (databaseAddButton) {
  databaseAddButton.addEventListener('click', () => openEmployeeModal());
}

if (employeeModalCancel) {
  employeeModalCancel.addEventListener('click', () => closeEmployeeModal());
}

if (employeeForm) {
  employeeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveEmployee();
  });
}

if (employeeModalBackdrop) {
  employeeModalBackdrop.addEventListener('click', (e) => {
    if (e.target === employeeModalBackdrop) closeEmployeeModal();
  });
}

if (databaseSearchInput) {
  databaseSearchInput.addEventListener('input', () => {
    employeeSearchQuery = databaseSearchInput.value.trim();
    renderEmployeeList();
  });
}

// Auto Calculate Age & Tenure
if (empInputBirthday) {
  empInputBirthday.addEventListener('change', updateAge);
}
if (empInputHireDate) {
  empInputHireDate.addEventListener('change', updateTenure);
}

function updateAge() {
  const diff = calculateAge(empInputBirthday.value);
  empInputAge.value = diff !== null ? `${diff}歳` : '';
}

function updateTenure() {
  const tenure = calculateTenure(empInputHireDate.value);
  empInputTenure.value = tenure || '';
}

function calculateAge(dateString) {
  if (!dateString) return null;
  const today = new Date();
  const birthDate = new Date(dateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function calculateTenure(dateString) {
  if (!dateString) return null;
  const start = new Date(dateString);
  const now = new Date();

  if (start > now) return '入社前';

  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();

  if (days < 0) {
    months--;
    // Get days in previous month
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  return `${years}年${months}ヶ月${days}日`;
}

// Column Selection Logic
function openColumnModal() {
  columnCheckboxes.innerHTML = '';
  ALL_COLUMNS.forEach(c => {
    const div = document.createElement('div');
    div.className = 'column-checkbox-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `col-check-${c.id}`;
    checkbox.value = c.id;
    checkbox.checked = visibleColumns.includes(c.id);

    const label = document.createElement('label');
    label.htmlFor = `col-check-${c.id}`;
    label.textContent = c.label;

    div.appendChild(checkbox);
    div.appendChild(label);
    columnCheckboxes.appendChild(div);
  });
  columnModalBackdrop.classList.remove('hidden');
}

function closeColumnModal() {
  columnModalBackdrop.classList.add('hidden');
}

function saveColumnSelection() {
  const checked = Array.from(columnCheckboxes.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
  if (checked.length === 0) {
    alert('少なくとも1つの項目を選択してください。');
    return;
  }
  visibleColumns = checked;
  localStorage.setItem('ivy_database_columns', JSON.stringify(visibleColumns));
  renderEmployeeList();
  closeColumnModal();
}

// Filter Logic
function openFilterModal() {
  filterInputsContainer.innerHTML = '';

  ALL_COLUMNS.forEach(col => {
    const row = document.createElement('div');
    row.className = 'form-row';

    const label = document.createElement('label');
    label.textContent = col.label;
    label.htmlFor = `filter-input-${col.id}`;

    let input;

    const isSelect = ['dept', 'department', 'title', 'grade', 'contractType', 'businessUnit', 'status'].includes(col.id);
    const isDate = ['birthday', 'hireDate', 'contractEnd', 'resignationDate'].includes(col.id);

    if (isSelect) {
      input = document.createElement('select');
      input.id = `filter-input-${col.id}`;
      input.dataset.key = col.id; // Store key for easy retrieval

      // Get unique values
      const uniqueVals = [...new Set(employees.map(e => e[col.id]).filter(v => v))].sort();

      const optAll = document.createElement('option');
      optAll.value = '';
      optAll.textContent = 'すべて';
      input.appendChild(optAll);

      uniqueVals.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v;
        opt.textContent = v;
        input.appendChild(opt);
      });

    } else {
      input = document.createElement('input');
      input.id = `filter-input-${col.id}`;
      input.dataset.key = col.id;
      if (isDate) {
        input.type = 'date';
      } else {
        input.type = 'text';
      }
    }

    // Set current value
    if (currentFilters[col.id]) {
      input.value = currentFilters[col.id];
    }

    row.appendChild(label);
    row.appendChild(input);
    filterInputsContainer.appendChild(row);
  });

  filterModalBackdrop.classList.remove('hidden');
}

function closeFilterModal() {
  filterModalBackdrop.classList.add('hidden');
}

function applyFilters() {
  currentFilters = {}; // Reset and rebuild
  const inputs = filterInputsContainer.querySelectorAll('select, input');
  inputs.forEach(input => {
    const key = input.dataset.key;
    const val = input.value;
    if (val) {
      currentFilters[key] = val;
    }
  });

  renderEmployeeList();
  closeFilterModal();
}

function resetFilters() {
  const inputs = filterInputsContainer.querySelectorAll('select, input');
  inputs.forEach(input => input.value = '');
}

// CSV Export Logic
function exportEmployeeCSV() {
  if (employees.length === 0) {
    alert('エクスポートするデータがありません。');
    return;
  }

  // Headers
  const header = ALL_COLUMNS.map(c => c.label).join(',') + '\n';

  // Rows
  const rows = employees.map(e => {
    return ALL_COLUMNS.map(c => {
      let val = e[c.id] || '';
      // Escape commas and quotes
      if (val.toString().includes(',') || val.toString().includes('"') || val.toString().includes('\n')) {
        val = `"${val.toString().replace(/"/g, '""')}"`;
      }
      return val;
    }).join(',');
  }).join('\n');

  const csvContent = '\uFEFF' + header + rows; // Add BOM for Excel
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `employees_${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// CSV Import Logic
async function importEmployeeCSV(file) {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    const text = e.target.result;
    const lines = text.split(/\r\n|\n/);
    if (lines.length < 2) return;

    const parseCSVLine = (line) => {
      const arr = [];
      let quote = false;
      let start = 0;
      for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') quote = !quote;
        else if (line[i] === ',' && !quote) {
          let val = line.slice(start, i);
          if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1).replace(/""/g, '"');
          arr.push(val);
          start = i + 1;
        }
      }
      let lastVal = line.slice(start);
      if (lastVal.startsWith('"') && lastVal.endsWith('"')) lastVal = lastVal.slice(1, -1).replace(/""/g, '"');
      arr.push(lastVal);
      return arr;
    };

    const headerLine = lines[0];
    const headers = parseCSVLine(headerLine).map(h => h.trim());

    const colMap = {};
    ALL_COLUMNS.forEach(c => {
      const idx = headers.indexOf(c.label);
      if (idx !== -1) colMap[c.id] = idx;
    });

    if (Object.keys(colMap).length === 0) {
      alert('CSVのヘッダーが認識できませんでした。正しいフォーマットか確認してください。');
      return;
    }

    const csvEmployees = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const vals = parseCSVLine(lines[i]);
      const emp = {};

      let hasData = false;
      Object.keys(colMap).forEach(key => {
        const val = vals[colMap[key]];
        if (val) {
          if (key === 'empId') {
            emp[key] = formatEmpId(val.trim());
          } else if (['birthday', 'hireDate', 'contractEnd', 'resignationDate'].includes(key)) {
            emp[key] = formatDateForInput(val.trim());
          } else {
            emp[key] = val.trim();
          }
          hasData = true;
        }
      });

      if (hasData && emp.name && emp.empId) {
        csvEmployees.push(emp);
      }
    }

    if (csvEmployees.length === 0) {
      alert('インポート可能なデータがありませんでした。必須項目（氏名、社員番号）を確認してください。');
      return;
    }

    // Build map of existing employees by empId
    const existingByEmpId = {};
    employees.forEach(emp => {
      if (emp.empId) existingByEmpId[emp.empId] = emp;
    });

    // Classify: new vs updated
    const toAdd = [];
    const toUpdate = []; // { id, changes }
    const compareKeys = Object.keys(colMap).filter(k => k !== 'empId');

    csvEmployees.forEach(csvEmp => {
      const existing = existingByEmpId[csvEmp.empId];
      if (!existing) {
        toAdd.push(csvEmp);
      } else {
        const changes = {};
        compareKeys.forEach(key => {
          const csvVal = csvEmp[key] || '';
          const existVal = existing[key] || '';
          if (csvVal !== existVal) changes[key] = csvVal;
        });
        if (Object.keys(changes).length > 0) {
          toUpdate.push({ id: existing.id, changes });
        }
      }
    });

    if (toAdd.length === 0 && toUpdate.length === 0) {
      alert('差分はありませんでした。データは最新の状態です。');
      return;
    }

    const summaryParts = [];
    if (toAdd.length > 0) summaryParts.push(`新規追加: ${toAdd.length}件`);
    if (toUpdate.length > 0) summaryParts.push(`更新: ${toUpdate.length}件`);
    if (!confirm(`${summaryParts.join('、')}\n\nインポートを実行しますか？`)) return;

    try {
      const chunkSize = 400;

      // Step 1: Clear csvUpdated flag from all previously marked records
      const markedEmployees = employees.filter(emp => emp.csvUpdated);
      for (let i = 0; i < markedEmployees.length; i += chunkSize) {
        const batch = writeBatch(db);
        markedEmployees.slice(i, i + chunkSize).forEach(emp => {
          batch.update(doc(db, 'employees', emp.id), { csvUpdated: deleteField() });
        });
        await batch.commit();
      }

      // Step 2: Add new records
      for (let i = 0; i < toAdd.length; i += chunkSize) {
        const batch = writeBatch(db);
        toAdd.slice(i, i + chunkSize).forEach(emp => {
          const ref = doc(collection(db, 'employees'));
          batch.set(ref, { ...emp, userId: currentUserId, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        });
        await batch.commit();
      }

      // Step 3: Update changed records and mark them
      for (let i = 0; i < toUpdate.length; i += chunkSize) {
        const batch = writeBatch(db);
        toUpdate.slice(i, i + chunkSize).forEach(({ id, changes }) => {
          batch.update(doc(db, 'employees', id), { ...changes, updatedAt: serverTimestamp(), csvUpdated: true });
        });
        await batch.commit();
      }

      alert('インポートが完了しました。');
    } catch (err) {
      console.error('Import Error:', err);
      alert('インポートに失敗しました: ' + err.message);
    }
  };
  reader.readAsText(file);
}

// Event Listeners for New Features
if (databaseColumnsButton) {
  databaseColumnsButton.addEventListener('click', openColumnModal);
}
if (columnModalCancel) {
  columnModalCancel.addEventListener('click', closeColumnModal);
}
if (columnModalSave) {
  columnModalSave.addEventListener('click', saveColumnSelection);
}
if (columnModalBackdrop) {
  columnModalBackdrop.addEventListener('click', (e) => {
    if (e.target === columnModalBackdrop) closeColumnModal();
  });
}
if (databaseExportButton) {
  databaseExportButton.addEventListener('click', exportEmployeeCSV);
}
if (databaseImportButton) {
  databaseImportButton.addEventListener('click', () => databaseImportInput.click());
}
if (databaseImportInput) {
  databaseImportInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      importEmployeeCSV(e.target.files[0]);
      e.target.value = ''; // Reset
    }
  });
}
if (databaseBulkDeleteButton) {
  databaseBulkDeleteButton.addEventListener('click', bulkDeleteEmployees);
}
if (databaseBulkClearButton) {
  databaseBulkClearButton.addEventListener('click', () => {
    selectedEmployeeIds.clear();
    updateBulkToolbar();
    renderEmployeeList();
  });
}

// Event Listeners for Filter
if (databaseFilterButton) {
  databaseFilterButton.addEventListener('click', openFilterModal);
}
if (filterModalCancel) {
  filterModalCancel.addEventListener('click', closeFilterModal);
}
if (filterModalApply) {
  filterModalApply.addEventListener('click', applyFilters);
}
if (filterModalReset) {
  filterModalReset.addEventListener('click', resetFilters);
}
if (filterModalBackdrop) {
  filterModalBackdrop.addEventListener('click', (e) => {
    if (e.target === filterModalBackdrop) closeFilterModal();
  });
}

// Migration Logic
const migrateCandidateButton = document.getElementById('migrate-candidate-button');

if (migrateCandidateButton) {
  migrateCandidateButton.addEventListener('click', async () => {
    if (!currentCandidateId) return;
    const candidate = candidates.find(c => c.id === currentCandidateId);
    if (!candidate) return;

    if (!confirm(`求職者「${candidate.name}」をデータベース（職員名簿）に登録しますか？`)) return;

    try {
      // Prepare Employee Data
      const hireDate = candidate.start ? formatDateForInput(candidate.start) : '';

      const empData = {
        userId: currentUserId,
        name: candidate.name,
        dept: candidate.dept || '', // Division (部門) map to dept? Or Department? Plan said "dept -> dept (mapped to 部門)"
        department: candidate.dept || '', // Map to both for safety as input is ambiguous
        grade: candidate.grade || '',
        contractType: candidate.type || '',
        hireDate: hireDate,
        note: candidate.note || '',
        status: '在籍', // Default to Active
        // Legacy fields or empty
        empId: '', // Needs manual entry later
        title: '',
        birthday: '',
        age: '',
        tenure: calculateTenure(hireDate),
        email: '',
        phone: '',
        contractEnd: '',
        businessUnit: '',
        resignationDate: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Add to employees
      await addDoc(collection(db, 'employees'), empData);

      alert('データベースへの登録が完了しました。');

      // Ask to delete from Candidates
      if (confirm(`登録が完了しました。Todoリストから「${candidate.name}」を削除しますか？`)) {
        await deleteDoc(doc(db, 'candidates', currentCandidateId));
        closeCandidateModal();
      }

    } catch (e) {
      console.error('Migration failed:', e);
      alert('移行に失敗しました: ' + e.message);
    }
  });
}

// ===== Archive Logic =====
function subscribeArchive(userId) {
  if (unsubscribeArchive) unsubscribeArchive();

  if (archiveSortSelect) {
    archiveSortSelect.onchange = (e) => {
      currentArchiveSort = e.target.value;
      subscribeArchive(currentUserId);
    };
  }

  let sortField = "createdAt";
  let sortDirection = "desc";

  if (currentArchiveSort === 'dateDesc') {
    sortField = "createdAt";
    sortDirection = "desc";
  } else if (currentArchiveSort === 'dateAsc') {
    sortField = "createdAt";
    sortDirection = "asc";
  } else if (currentArchiveSort === 'nameAsc') {
    sortField = "fileName";
    sortDirection = "asc";
  } else if (currentArchiveSort === 'nameDesc') {
    sortField = "fileName";
    sortDirection = "desc";
  }

  let q;
  if (currentArchiveFilter === 'all') {
    q = query(collection(db, "pdfs"), where("userId", "==", userId), orderBy(sortField, sortDirection));
  } else {
    q = query(collection(db, "pdfs"), where("userId", "==", userId), where("genre", "==", currentArchiveFilter), orderBy(sortField, sortDirection));
  }

  unsubscribeArchive = onSnapshot(q, (snapshot) => {
    archivePdfs = [];
    if (archiveListContainer) archiveListContainer.innerHTML = '';

    if (currentArchiveFilter === 'all') {
      currentArchiveGenres.clear();
    }

    snapshot.forEach(docSnap => {
      const pdf = { id: docSnap.id, ...docSnap.data() };

      // Frontend filtering based on secret diary mode
      // If diary mode is OFF, hide items that have isSecret === true
      // If diary mode is ON, ONLY show items that have isSecret === true
      if (!isSecretDiaryMode && pdf.isSecret === true) {
        return; // Skip rendering secret items in normal mode
      }
      if (isSecretDiaryMode && pdf.isSecret !== true) {
        return; // Skip rendering normal items in secret mode
      }

      archivePdfs.push(pdf);

      if (currentArchiveFilter === 'all' && pdf.genre) {
        currentArchiveGenres.add(pdf.genre);
      }

      renderArchivePdf(pdf);
    });

    renderArchiveFilters();
    renderRecentSection();

    // ストレージゲージ更新（Firebase Storageから実サイズを取得）
    calcStorageUsage();
  });
}

async function calcStorageUsage() {
  if (!currentUserId) return;
  const label = document.getElementById('storage-gauge-label');
  if (label) label.textContent = '計算中...';

  try {
    const folders = [
      storageRef(storage, `pdfs/${currentUserId}`),
      storageRef(storage, `memos/${currentUserId}`)
    ];
    let totalBytes = 0;
    for (const folder of folders) {
      const result = await listAll(folder);
      const sizes = await Promise.all(result.items.map(item => getMetadata(item).then(m => m.size).catch(() => 0)));
      totalBytes += sizes.reduce((a, b) => a + b, 0);
    }
    updateStorageGauge(totalBytes);
  } catch (err) {
    console.error('ストレージ使用量取得エラー:', err);
    if (label) label.textContent = '取得失敗';
  }
}

function updateStorageGauge(usedBytes) {
  const LIMIT_BYTES = 5 * 1024 * 1024 * 1024; // Firebase Spark: 5GB
  const pct = Math.min(usedBytes / LIMIT_BYTES * 100, 100);
  const bar = document.getElementById('storage-gauge-bar');
  const label = document.getElementById('storage-gauge-label');
  if (!bar || !label) return;

  bar.style.width = `${pct.toFixed(1)}%`;
  bar.style.background = pct > 80 ? '#f44336' : pct > 60 ? '#ff9800' : '#4CAF50';

  const fmt = (b) => b >= 1024 ** 3 ? `${(b / 1024 ** 3).toFixed(2)} GB`
    : b >= 1024 ** 2 ? `${(b / 1024 ** 2).toFixed(1)} MB`
    : b >= 1024 ? `${(b / 1024).toFixed(0)} KB` : `${b} B`;

  label.textContent = usedBytes > 0
    ? `${fmt(usedBytes)} / 5 GB (${pct.toFixed(1)}%)`
    : '計測データなし（既存ファイルは集計外）';
}


function renderArchiveFilters() {
  if (!archiveFilterContainer) return;
  archiveFilterContainer.innerHTML = '';

  const allBtn = document.createElement('button');
  allBtn.className = `archive-filter-btn ${currentArchiveFilter === 'all' ? 'active' : ''}`;
  allBtn.textContent = 'すべて';
  allBtn.onclick = () => {
    if (currentArchiveFilter === 'all') return;
    currentArchiveFilter = 'all';
    subscribeArchive(currentUserId);
  };
  archiveFilterContainer.appendChild(allBtn);

  const sortedGenres = Array.from(currentArchiveGenres).sort();

  sortedGenres.forEach(genre => {
    const btn = document.createElement('button');
    btn.className = `archive-filter-btn ${currentArchiveFilter === genre ? 'active' : ''}`;
    btn.textContent = genre;
    btn.onclick = () => {
      if (currentArchiveFilter === genre) return;
      currentArchiveFilter = genre;
      subscribeArchive(currentUserId);
    };
    archiveFilterContainer.appendChild(btn);
  });

  // カスタムドロップダウンへジャンル一覧を同期する
  updateGenreDropdown(sortedGenres);
}

// ===== ジャンルドロップダウン管理 =====
// 現在のジャンル一覧を保持する（フィルタリング用）
let _allGenres = [];

function updateGenreDropdown(genres) {
  _allGenres = genres;
  renderGenreDropdownItems(genres);
}

function renderGenreDropdownItems(genres) {
  if (!archiveGenreDropdown) return;
  archiveGenreDropdown.innerHTML = '';

  if (genres.length === 0) {
    const emptyLi = document.createElement('li');
    const emptyBtn = document.createElement('button');
    emptyBtn.type = 'button';
    emptyBtn.textContent = '（登録済みジャンルなし）';
    emptyBtn.style.color = 'var(--text-secondary)';
    emptyBtn.style.fontStyle = 'italic';
    emptyBtn.disabled = true;
    emptyLi.appendChild(emptyBtn);
    archiveGenreDropdown.appendChild(emptyLi);
    return;
  }

  genres.forEach(genre => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = genre;
    btn.addEventListener('mousedown', (e) => {
      // blur より先に値をセットするため mousedown を使う
      e.preventDefault();
      if (archiveGenreInput) archiveGenreInput.value = genre;
      closeGenreDropdown();
    });
    btn.addEventListener('touchend', (e) => {
      e.preventDefault();
      if (archiveGenreInput) archiveGenreInput.value = genre;
      closeGenreDropdown();
    });
    li.appendChild(btn);
    archiveGenreDropdown.appendChild(li);
  });
}

function openGenreDropdown() {
  if (!archiveGenreDropdown) return;
  // 入力値でフィルタリング
  const q = (archiveGenreInput?.value || '').trim().toLowerCase();
  const filtered = q
    ? _allGenres.filter(g => g.toLowerCase().includes(q))
    : _allGenres;
  renderGenreDropdownItems(filtered);
  archiveGenreDropdown.classList.remove('hidden');
}

function closeGenreDropdown() {
  if (archiveGenreDropdown) archiveGenreDropdown.classList.add('hidden');
}

// イベントリスナーを初期化（一度だけ登録）
(function initGenreDropdownEvents() {
  if (!archiveGenreInput) return;

  // フォーカス・クリックで開く（スマホ・PC共通）
  archiveGenreInput.addEventListener('focus', openGenreDropdown);
  archiveGenreInput.addEventListener('click', openGenreDropdown);

  // 入力中にリアルタイムフィルタリング
  archiveGenreInput.addEventListener('input', openGenreDropdown);

  // フォーカスアウトで閉じる（mousedown の後に発火するため遅延不要）
  archiveGenreInput.addEventListener('blur', () => {
    // 少し遅延してタップ選択と競合しないようにする
    setTimeout(closeGenreDropdown, 150);
  });

  // ドロップダウン外クリックで閉じる
  document.addEventListener('click', (e) => {
    if (!archiveGenreInput.contains(e.target) && !archiveGenreDropdown?.contains(e.target)) {
      closeGenreDropdown();
    }
  }, { passive: true });
})();

function renderArchivePdf(pdf) {
  if (!archiveListContainer) return;

  if (archiveViewMode === 'grid') {
    // ===== グリッドモード =====
    const card = document.createElement('li');
    card.className = 'archive-grid-card';

    const thumb = document.createElement('div');
    thumb.className = 'archive-grid-thumb';
    if (pdf.fileType === 'image') {
      const img = document.createElement('img');
      img.src = pdf.fileUrl;
      img.alt = pdf.fileName;
      thumb.appendChild(img);
    } else {
      thumb.textContent = '📄';
      thumb.classList.add('archive-grid-thumb-icon');
    }
    card.appendChild(thumb);

    const cardTitle = document.createElement('div');
    cardTitle.className = 'archive-grid-title';
    cardTitle.textContent = pdf.fileName;
    card.appendChild(cardTitle);

    const cardActions = document.createElement('div');
    cardActions.className = 'archive-item-actions';
    cardActions.appendChild(buildViewBtn(pdf));
    cardActions.appendChild(buildShareBtn(pdf));
    cardActions.appendChild(buildDeleteBtn(pdf));
    card.appendChild(cardActions);

    archiveListContainer.appendChild(card);
  } else {
    // ===== リストモード =====
    const li = document.createElement('li');

    // ─── メイン行 ───────────────────────────────────────
    const mainRow = document.createElement('div');
    mainRow.className = 'archive-list-item-main';

    const infoContainer = document.createElement('div');
    infoContainer.style.display = 'flex';
    infoContainer.style.alignItems = 'center';
    infoContainer.style.flexGrow = '1';
    infoContainer.style.minWidth = '0';

    if (pdf.fileType === 'image') {
      const thumbImg = document.createElement('img');
      thumbImg.src = pdf.fileUrl;
      thumbImg.style.width = '48px';
      thumbImg.style.height = '48px';
      thumbImg.style.objectFit = 'cover';
      thumbImg.style.marginRight = '12px';
      thumbImg.style.borderRadius = '6px';
      thumbImg.style.flexShrink = '0';
      infoContainer.appendChild(thumbImg);
    } else {
      const iconSpan = document.createElement('span');
      iconSpan.textContent = '📄';
      iconSpan.style.fontSize = '24px';
      iconSpan.style.marginRight = '12px';
      iconSpan.style.flexShrink = '0';
      infoContainer.appendChild(iconSpan);
    }

    const infoDiv = document.createElement('div');
    infoDiv.className = 'archive-item-info';

    const titleDiv = document.createElement('div');
    titleDiv.className = 'archive-item-title';
    titleDiv.textContent = pdf.fileName;

    const metaDiv = document.createElement('div');
    metaDiv.className = 'archive-item-meta';

    const genreSpan = document.createElement('span');
    genreSpan.className = 'archive-item-genre';
    genreSpan.style.cursor = 'pointer';
    genreSpan.title = 'クリックしてジャンルを編集';
    genreSpan.textContent = pdf.genre || '未分類';
    genreSpan.onclick = async () => {
      const newGenre = prompt('新しいジャンルを入力してください:', pdf.genre || '');
      if (newGenre !== null && newGenre.trim() !== pdf.genre) {
        try {
          await updateDoc(doc(db, "pdfs", pdf.id), { genre: newGenre.trim() });
        } catch (error) {
          console.error("Error updating genre:", error);
          alert('ジャンルの更新に失敗しました。');
        }
      }
    };
    metaDiv.appendChild(genreSpan);

    if (pdf.createdAt) {
      const dateSpan = document.createElement('span');
      dateSpan.className = 'archive-item-date';
      dateSpan.textContent = new Date(pdf.createdAt.toMillis()).toLocaleString('ja-JP', { dateStyle: 'short', timeStyle: 'short' });
      metaDiv.appendChild(dateSpan);
    }

    infoDiv.appendChild(titleDiv);
    infoDiv.appendChild(metaDiv);
    infoContainer.appendChild(infoDiv);

    // ─── アクションボタン ────────────────────────────────
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'archive-item-actions';
    actionsDiv.appendChild(buildViewBtn(pdf));
    actionsDiv.appendChild(buildShareBtn(pdf));

    // 💬 コメントトグルボタン
    const captionToggleBtn = document.createElement('button');
    captionToggleBtn.type = 'button';
    captionToggleBtn.className = 'archive-caption-toggle-btn' + (pdf.caption ? ' has-comment' : '');
    captionToggleBtn.title = 'コメントを編集';
    captionToggleBtn.textContent = '💬';

    actionsDiv.appendChild(captionToggleBtn);
    actionsDiv.appendChild(buildDeleteBtn(pdf));

    mainRow.appendChild(infoContainer);
    mainRow.appendChild(actionsDiv);
    li.appendChild(mainRow);

    // ─── コメント入力行 ──────────────────────────────────
    const captionRow = document.createElement('div');
    captionRow.className = 'archive-item-caption-row collapsed';
    // 展開アニメーション用に最大高さを設定
    captionRow.style.maxHeight = '200px';

    const captionLabel = document.createElement('div');
    captionLabel.className = 'archive-caption-label';
    captionLabel.innerHTML = '💬 コメント';

    const captionTextarea = document.createElement('textarea');
    captionTextarea.className = 'archive-caption-textarea';
    captionTextarea.placeholder = 'このファイルへのコメントやメモを入力...';
    captionTextarea.value = pdf.caption || '';

    const captionActionsRow = document.createElement('div');
    captionActionsRow.className = 'archive-caption-actions';

    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'archive-caption-save-btn';
    saveBtn.textContent = '保存';
    saveBtn.onclick = async () => {
      const newCaption = captionTextarea.value.trim();
      try {
        await updateDoc(doc(db, 'pdfs', pdf.id), { caption: newCaption });
        // トグルボタンの has-comment クラスを更新
        if (newCaption) {
          captionToggleBtn.classList.add('has-comment');
        } else {
          captionToggleBtn.classList.remove('has-comment');
        }
        Swal.fire({
          toast: true, position: 'top-end', icon: 'success',
          title: 'コメントを保存しました', showConfirmButton: false, timer: 1800
        });
        // 保存後に折りたたむ
        captionRow.classList.add('collapsed');
      } catch (err) {
        console.error('Caption save error:', err);
        Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: '保存に失敗しました', showConfirmButton: false, timer: 2000 });
      }
    };

    captionActionsRow.appendChild(saveBtn);
    captionRow.appendChild(captionLabel);
    captionRow.appendChild(captionTextarea);
    captionRow.appendChild(captionActionsRow);
    li.appendChild(captionRow);

    // トグルボタンのクリックで開閉
    captionToggleBtn.onclick = () => {
      const isCollapsed = captionRow.classList.contains('collapsed');
      captionRow.classList.toggle('collapsed');
      if (isCollapsed) {
        captionTextarea.focus();
      }
    };

    archiveListContainer.appendChild(li);
  }
}

// ===== PDF.js によるプレビュー関数 =====
async function openPdfPreview(url) {
  if (!pdfCanvasContainer) return;
  pdfCanvasContainer.innerHTML = '<p style="color:#ccc;text-align:center;padding:20px;">読み込み中...</p>';

  try {
    // PDF.js をESモジュールとして動的インポート
    const pdfjsLib = await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.min.mjs');
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.worker.min.mjs';

    const loadingTask = pdfjsLib.getDocument(url);
    const pdfDoc = await loadingTask.promise;
    pdfCanvasContainer.innerHTML = '';

    const dpr = window.devicePixelRatio || 1;
    // コンテナ幅に合わせたスケールを計算（最大幅基準）
    const containerWidth = pdfCanvasContainer.clientWidth || window.innerWidth;

    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1 });
      // コンテナ幅いっぱいになるスケールを算出
      const scale = (containerWidth / viewport.width) * dpr;
      const scaledViewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      canvas.className = 'pdf-page-canvas';
      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;
      // CSS上の表示サイズはコンテナ幅に合わせる
      canvas.style.width = containerWidth + 'px';
      canvas.style.height = (scaledViewport.height / dpr) + 'px';

      const ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise;
      pdfCanvasContainer.appendChild(canvas);
    }
  } catch (err) {
    console.error('PDF.js render error:', err);
    pdfCanvasContainer.innerHTML =
      '<p style="color:#f87171;text-align:center;padding:20px;">PDFの読み込みに失敗しました。<br>' + err.message + '</p>';
  }
}

// ===== ボタンファクトリ =====
function buildViewBtn(pdf) {
  const viewBtn = document.createElement('button');
  viewBtn.type = 'button';
  viewBtn.className = 'archive-icon-btn';
  viewBtn.title = '閲覧する';
  viewBtn.textContent = '🔍';
  viewBtn.onclick = (e) => {
    e.preventDefault();
    if (pdf.fileType === 'image') {
      openImagePreview(pdf);
    } else {
      if (pdfCanvasContainer) pdfCanvasContainer.style.display = '';
      if (imagePreviewWrapper) imagePreviewWrapper.style.display = 'none';
      currentPreviewPdfId = pdf.id;
      if (pdfPreviewModalBackdrop) pdfPreviewModalBackdrop.classList.remove('hidden');
      openPdfPreview(pdf.fileUrl);
    }
  };
  return viewBtn;
}

function buildShareBtn(pdf) {
  const shareBtn = document.createElement('button');
  shareBtn.type = 'button';
  shareBtn.className = 'archive-icon-btn';
  shareBtn.title = '共有する';
  shareBtn.textContent = '⬆️';
  shareBtn.onclick = async (e) => {
    e.preventDefault();
    if (navigator.share) {
      try { await navigator.share({ title: pdf.fileName, url: pdf.fileUrl }); }
      catch (err) { if (err.name !== 'AbortError') console.error('Share failed:', err); }
    } else {
      try {
        await navigator.clipboard.writeText(pdf.fileUrl);
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'リンクをコピーしました', showConfirmButton: false, timer: 1500 });
      } catch (err) { console.error('Clipboard write failed:', err); }
    }
  };
  return shareBtn;
}

function buildDeleteBtn(pdf) {
  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'archive-icon-btn danger-btn';
  deleteBtn.title = '削除する';
  deleteBtn.textContent = '🗑️';
  deleteBtn.onclick = async (e) => {
    e.preventDefault();
    if (confirm(`本当に「${pdf.fileName}」を削除しますか？`)) {
      try {
        const fileRef = storageRef(storage, pdf.fileUrl);
        await deleteObject(fileRef);
        await deleteDoc(doc(db, "pdfs", pdf.id));
      } catch (error) {
        console.error("Error deleting PDF: ", error);
        alert('削除に失敗しました。詳細: ' + error.message);
      }
    }
  };
  return deleteBtn;
}

// ===== 最近追加されたファイル =====
function renderRecentSection() {
  const section = document.getElementById('archive-recent-section');
  if (!section) return;

  // createdAt 降順で最大5件
  const recent = [...archivePdfs]
    .filter(p => p.createdAt)
    .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
    .slice(0, 5);

  if (recent.length === 0) {
    section.innerHTML = '';
    return;
  }

  section.innerHTML = '';
  const heading = document.createElement('p');
  heading.className = 'archive-recent-heading';
  heading.textContent = '🕒 最近追加したファイル';
  section.appendChild(heading);

  const rail = document.createElement('div');
  rail.className = 'archive-recent-rail';

  recent.forEach(pdf => {
    const card = document.createElement('div');
    card.className = 'archive-recent-card';

    const thumb = document.createElement('div');
    thumb.className = 'archive-recent-thumb';
    if (pdf.fileType === 'image') {
      const img = document.createElement('img');
      img.src = pdf.fileUrl;
      img.alt = pdf.fileName;
      thumb.appendChild(img);
    } else {
      thumb.textContent = '📄';
      thumb.classList.add('archive-recent-thumb-icon');
    }
    card.appendChild(thumb);

    const name = document.createElement('div');
    name.className = 'archive-recent-name';
    name.textContent = pdf.fileName;
    card.appendChild(name);

    // クリックでプレビュー
    card.onclick = () => {
      if (pdf.fileType === 'image') {
        openImagePreview(pdf);
      } else {
        if (pdfCanvasContainer) pdfCanvasContainer.style.display = '';
        if (imagePreviewWrapper) imagePreviewWrapper.style.display = 'none';
        currentPreviewPdfId = pdf.id;
        if (pdfPreviewModalBackdrop) pdfPreviewModalBackdrop.classList.remove('hidden');
        openPdfPreview(pdf.fileUrl);
      }
    };

    rail.appendChild(card);
  });

  section.appendChild(rail);
}

// ===== グリッド/リスト切り替えイベント =====
(function initArchiveViewToggle() {
  const listBtn = document.getElementById('archive-view-list-btn');
  const gridBtn = document.getElementById('archive-view-grid-btn');
  if (!listBtn || !gridBtn) return;

  function applyMode(mode) {
    archiveViewMode = mode;
    if (mode === 'grid') {
      archiveListContainer?.classList.add('grid-mode');
      gridBtn.classList.add('active');
      listBtn.classList.remove('active');
    } else {
      archiveListContainer?.classList.remove('grid-mode');
      listBtn.classList.add('active');
      gridBtn.classList.remove('active');
    }
    // 再描画
    if (archiveListContainer) archiveListContainer.innerHTML = '';
    archivePdfs.forEach(pdf => renderArchivePdf(pdf));
  }

  listBtn.onclick = () => applyMode('list');
  gridBtn.onclick = () => applyMode('grid');
})()


function initArchiveDropZone() {
  if (!pdfDropZone) return;

  pdfDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    pdfDropZone.classList.add('dragover');
  });

  pdfDropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    pdfDropZone.classList.remove('dragover');
  });

  const archiveFileInput = document.getElementById('archive-file-input');

  pdfDropZone.addEventListener('click', () => {
    if (archiveFileInput) archiveFileInput.click();
  });

  if (archiveFileInput) {
    archiveFileInput.addEventListener('change', async (e) => {
      const files = e.target.files;
      if (files.length > 0) {
        await handlePdfUpload(files[0]);
        archiveFileInput.value = ''; // Reset input to allow selecting the same file again
      }
    });
  }

  pdfDropZone.addEventListener('drop', async (e) => {
    e.preventDefault();
    pdfDropZone.classList.remove('dragover');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await handlePdfUpload(files[0]);
    }
  });

  async function handlePdfUpload(file) {
    if (!currentUserId) return;

    const isImage = file.type.startsWith('image/');
    const isDoc = file.type === 'application/pdf';

    if (!isImage && !isDoc) {
      alert('PDFまたは画像ファイルのみアップロード可能です。');
      return;
    }

    const fileTypeStr = isImage ? 'image' : 'pdf';

    const genre = (archiveGenreInput?.value || '').trim();
    pdfDropZone.innerHTML = '<p>アップロード中...</p>';

    try {
      const fileRef = storageRef(storage, `pdfs/${currentUserId}/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const fileUrl = await getDownloadURL(fileRef);

      const docData = {
        userId: currentUserId,
        fileName: file.name,
        fileUrl: fileUrl,
        fileSize: file.size,
        genre: genre,
        fileType: fileTypeStr,
        createdAt: serverTimestamp()
      };

      if (isSecretDiaryMode) {
        docData.isSecret = true;
        docData.caption = (archiveSecretCaption?.value || '').trim();
      } else {
        docData.isSecret = false;
      }

      await addDoc(collection(db, "pdfs"), docData);

      if (archiveGenreInput) archiveGenreInput.value = '';
      if (archiveSecretCaption) archiveSecretCaption.value = '';
    } catch (error) {
      console.error("Error uploading PDF: ", error);
      alert('アップロードに失敗しました。');
    } finally {
      pdfDropZone.innerHTML = '<p>ここにPDFをドラッグ＆ドロップ、またはここをクリックしてファイルを選択</p>';
    }
  }
}

initArchiveDropZone();

// =========================================================================
// Chat Workspace Logic
// =========================================================================

function listenChatRooms() {
  if (!currentUserId) return;
  const q = query(
    collection(db, 'chat_rooms'),
    where('members', 'array-contains', currentUserId),
    orderBy('createdAt', 'desc')
  );
  
  chatRoomsUnsubscribe = onSnapshot(q, (snapshot) => {
    chatRoomList.innerHTML = '';
    snapshot.forEach(doc => {
      const room = doc.data();
      room.id = doc.id;
      
      const li = document.createElement('li');
      li.className = 'chat-room-item';
      if (room.id === currentChatRoomId) li.classList.add('active');
      
      const icon = document.createElement('span');
      icon.textContent = '💬';
      
      const name = document.createElement('span');
      name.className = 'chat-room-name';
      name.textContent = room.name;
      
      li.append(icon, name);

      // Show delete button if current user created the room
      if (room.createdBy === currentUserId) {
        const delBtn = document.createElement('button');
        delBtn.innerHTML = '&#128465;'; // Trash
        delBtn.className = 'chat-room-delete-btn';
        delBtn.title = 'ルーム削除';
        delBtn.style.padding = '0 5px';
        delBtn.style.marginLeft = 'auto';
        delBtn.style.background = 'transparent';
        delBtn.style.border = 'none';
        delBtn.style.cursor = 'pointer';
        delBtn.style.fontSize = '1.1rem';
        
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation(); // Avoid triggering selectChatRoom
          deleteChatRoom(room.id, room.name);
        });
        li.appendChild(delBtn);
      }
      
      li.addEventListener('click', () => selectChatRoom(room));
      
      chatRoomList.appendChild(li);
    });
  });
}

async function deleteChatRoom(roomId, roomName) {
  const result = await Swal.fire({
    title: 'ルーム削除',
    html: `本当にルーム「<b>${roomName}</b>」を削除しますか？<br><br><span style="color:var(--danger, #ff4d4f); font-size: 0.9em;">※この操作は取り消せません。中のメッセージもすべて一括削除されます。</span>`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: 'var(--danger, #ff4d4f)',
    confirmButtonText: '削除する',
    cancelButtonText: 'キャンセル'
  });

  if (result.isConfirmed) {
    try {
      // 1. Delete all chat_messages associated with it
      const q = query(collection(db, 'chat_messages'), where('roomId', '==', roomId));
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.docs.forEach(docSnap => batch.delete(docSnap.ref));
      await batch.commit();

      // 2. Delete the room itself
      await deleteDoc(doc(db, 'chat_rooms', roomId));

      // 3. Clear current view if active
      if (currentChatRoomId === roomId) {
        currentChatRoomId = null;
        if (chatCurrentRoomName) chatCurrentRoomName.textContent = 'ルームを選択してください';
        if (chatMessages) chatMessages.innerHTML = '';
        if (chatInputForm) chatInputForm.classList.add('hidden');
        if (chatMessagesUnsubscribe) {
          chatMessagesUnsubscribe();
          chatMessagesUnsubscribe = null;
        }
      }

      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'ルームを削除しました', showConfirmButton: false, timer: 1500 });
    } catch (err) {
      console.error('Error deleting chat room:', err);
      Swal.fire('エラー', 'ルームの削除に失敗しました', 'error');
    }
  }
}

async function createChatRoom() {
  if (!currentUserId || !lastKnownAuthUser) {
    alert('ログインが必要です。');
    return;
  }

  const { value: formValues } = await Swal.fire({
    title: '新規ルーム作成',
    html:
      '<input id="swal-input-room-name" class="swal2-input" placeholder="ルーム名（必須）">',
    focusConfirm: false,
    showCancelButton: true,
    preConfirm: () => {
      const name = document.getElementById('swal-input-room-name').value.trim();
      if (!name) {
        Swal.showValidationMessage('ルーム名が必要です！');
        return false;
      }
      return { name };
    }
  });

  if (formValues && formValues.name) {
    try {
      const roomData = {
        name: formValues.name,
        createdBy: currentUserId,
        members: [currentUserId],
        createdAt: serverTimestamp()
      };
      await addDoc(collection(db, 'chat_rooms'), roomData);
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'ルームを作成しました', showConfirmButton: false, timer: 1500 });
    } catch (err) {
      console.error('Error creating room', err);
      alert('ルームの作成に失敗しました。');
    }
  }
}

async function inviteToChatRoom() {
  if (!currentChatRoomId || !currentUserId) return;

  const { value: email } = await Swal.fire({
    title: 'メンバーを招待',
    input: 'email',
    inputLabel: '招待するユーザーのメールアドレス',
    inputPlaceholder: 'example@email.com',
    showCancelButton: true,
    confirmButtonText: '招待',
    cancelButtonText: 'キャンセル',
    inputValidator: (value) => {
      if (!value) return 'メールアドレスを入力してください';
    }
  });

  if (!email) return;

  const normalizedEmail = email.toLowerCase().trim();

  // 自分自身チェック
  if (lastKnownAuthUser && normalizedEmail === lastKnownAuthUser.email.toLowerCase()) {
    Swal.fire('エラー', '自分自身は招待できません。', 'error');
    return;
  }

  try {
    // user_profiles でUID検索（すでにログイン済みの場合）
    const profileSnap = await getDocs(query(collection(db, 'user_profiles'), where('email', '==', normalizedEmail)));

    if (!profileSnap.empty) {
      // プロフィールあり → 直接 members に追加
      const inviteeUid = profileSnap.docs[0].data().uid;
      if (currentChatRoom?.members?.includes(inviteeUid)) {
        Swal.fire('確認', 'そのユーザーはすでにメンバーです。', 'info');
        return;
      }
      await updateDoc(doc(db, 'chat_rooms', currentChatRoomId), { members: arrayUnion(inviteeUid) });
    } else {
      // プロフィールなし → 招待を保存（次回ログイン時に自動追加）
      const existingSnap = await getDocs(query(
        collection(db, 'chat_invitations'),
        where('roomId', '==', currentChatRoomId),
        where('inviteeEmail', '==', normalizedEmail)
      ));
      if (!existingSnap.empty) {
        Swal.fire('確認', 'すでに招待済みです。相手が次回ログイン時に自動で参加します。', 'info');
        return;
      }
      await addDoc(collection(db, 'chat_invitations'), {
        roomId: currentChatRoomId,
        roomName: currentChatRoom?.name ?? '',
        inviteeEmail: normalizedEmail,
        inviterUid: currentUserId,
        createdAt: serverTimestamp()
      });
    }

    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `${normalizedEmail} を招待しました`, showConfirmButton: false, timer: 2000 });
  } catch (err) {
    console.error('招待エラー:', err);
    Swal.fire('エラー', '招待に失敗しました。', 'error');
  }
}

async function selectChatRoom(room) {
  currentChatRoomId = room.id;
  currentChatRoom = room;
  if (chatCurrentRoomName) chatCurrentRoomName.textContent = room.name;
  if (chatInputForm) chatInputForm.classList.remove('hidden');

  // Show/hide invite button based on whether user is room creator
  const inviteBtn = document.getElementById('chat-invite-btn');
  if (inviteBtn) {
    inviteBtn.classList.remove('hidden');
  }
  
  // Highlight active room in list
  document.querySelectorAll('.chat-room-item').forEach(el => el.classList.remove('active'));
  const items = Array.from(chatRoomList.children);
  const activeItem = items.find(li => li.querySelector('.chat-room-name').textContent === room.name);
  if (activeItem) activeItem.classList.add('active');

  listenChatMessages(room.id);
}

function listenChatMessages(roomId) {
  if (chatMessagesUnsubscribe) {
    chatMessagesUnsubscribe();
  }
  
  if (chatMessages) chatMessages.innerHTML = '';
  
  const q = query(collection(db, 'chat_messages'), where('roomId', '==', roomId), orderBy('createdAt', 'asc'));
  
  let isInitialLoad = true;

  chatMessagesUnsubscribe = onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const msg = change.doc.data();
        msg.id = change.doc.id;
        appendChatMessage(msg);


        // 初回ロード以外・自分以外のメッセージ・アプリが非アクティブのとき通知
        if (!isInitialLoad && msg.senderId !== currentUserId && document.hidden) {
          if (Notification.permission === 'granted') {
            new Notification(msg.senderName || '新しいメッセージ', {
              body: msg.text,
              icon: '/icon-192.png',
              tag: roomId  // 同じルームの通知は1つにまとめる
            });
          }
        }
      }
    });

    isInitialLoad = false;

    // Auto-scroll to bottom
    if (chatMessages) {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  });
}

function appendChatMessage(msg) {
  if (!chatMessages) return;
  
  const wrapper = document.createElement('div');
  wrapper.className = 'chat-message';
  
  if (msg.senderId === currentUserId) {
    wrapper.classList.add('self');
  } else {
    wrapper.classList.add('other');
    const sender = document.createElement('div');
    sender.className = 'chat-message-sender';
    sender.textContent = msg.senderName || 'Anonymous';
    wrapper.appendChild(sender);
  }

  // Check if it's an unread message from someone else
  const isUnreadOther = msg.senderId !== currentUserId && (!msg.openedBy || !msg.openedBy.includes(currentUserId));
  
  const contentWrapper = document.createElement('div');
  
  if (isUnreadOther) {
    // Render Envelope
    const envelope = document.createElement('div');
    envelope.className = 'message-envelope pet-arrival-animation';
    // Use the senderPet or default to a generic icon
    const petIcon = msg.senderPet ? `<img src="/img/pets/${msg.senderPet}.png" class="pet-icon-small" alt="${msg.senderPet}">` : '📮';
    
    envelope.innerHTML = `
      <div class="envelope-body">
        <span class="envelope-icon">${petIcon}</span>
        <span class="envelope-text">お手紙が届いています（タップして開封）</span>
      </div>
    `;
    
    envelope.addEventListener('click', async () => {
      // Mark as read
      try {
        await updateDoc(doc(db, 'chat_messages', msg.id), {
          openedBy: arrayUnion(currentUserId)
        });
      } catch (err) {
        console.error("Failed to mark message as read:", err);
      }
      // UI is local optimistic update or let onSnapshot handle it?
      // Since it's onSnapshot 'modified', it's better to handle 'modified' in docChanges. 
      // But we just append now. So let's optimistically replace it.
      envelope.classList.add('pop-open');
      setTimeout(() => {
        wrapper.replaceChild(renderNormalBubble(msg), envelope);
      }, 300);
    });
    
    wrapper.appendChild(envelope);
  } else {
    // Render normally
    wrapper.appendChild(renderNormalBubble(msg));
  }
  
  chatMessages.appendChild(wrapper);
}

function renderNormalBubble(msg) {
  const bubble = document.createElement('div');
  bubble.className = 'chat-message-bubble';
  bubble.textContent = msg.text;
  return bubble;
}


async function sendChatMessage(text) {
  if (!text.trim() || !currentChatRoomId || !currentUserId || !lastKnownAuthUser) {
    console.error("Missing required chat message params.");
    return;
  }
  if (chatMessageInput) chatMessageInput.value = '';
  
  const userEmail = lastKnownAuthUser?.email || 'User';
  const senderName = userEmail.split('@')[0];
  
  try {
    await addDoc(collection(db, 'chat_messages'), {
      roomId: currentChatRoomId,
      text: text.trim(),
      senderId: currentUserId,
      senderName: senderName,
      senderPet: currentSelectedPet,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.error('Error sending message:', err);
    Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: '送信失敗', showConfirmButton: false, timer: 1500 });
  }
}
