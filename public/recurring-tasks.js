import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let firestoreInstance = null;
let activeUserId = null;
let unsubscribeRecurring = null;
let cachedRecurringTasks = [];
let eventListenersInitialized = false;

const recurringModalBackdrop = document.getElementById('recurring-task-modal-backdrop');
const recurringForm = document.getElementById('recurring-task-form');
const recurringTaskInput = document.getElementById('recurring-task-input');
const recurringTypeSelect = document.getElementById('recurring-type');
const monthlyTypeSelect = document.getElementById('monthly-type');
const monthlyDateSelect = document.getElementById('monthly-date');
const monthlyWeekSelect = document.getElementById('monthly-week');
const monthlyWeekdaySelect = document.getElementById('monthly-weekday');
const yearlyMonthSelect = document.getElementById('yearly-month');
const yearlyDateSelect = document.getElementById('yearly-date');
const weeklyOptions = document.getElementById('weekly-options');
const monthlyOptions = document.getElementById('monthly-options');
const yearlyOptions = document.getElementById('yearly-options');
const monthlyDateSelector = document.getElementById('monthly-date-selector');
const monthlyWeekSelector = document.getElementById('monthly-week-selector');
const openRecurringModalButton = document.getElementById('open-recurring-task-modal-button');
const closeRecurringModalButton = document.getElementById('close-recurring-modal-button');
const recurringTasksContainer = document.getElementById('recurring-tasks-container');
const todayRecurringTasksList = document.getElementById('today-recurring-tasks');

export function initializeRecurringTasks(db) {
  firestoreInstance = db;
  initializeRecurringTaskForm();
  setupRecurringTaskEventListeners();
}

export function setRecurringTaskUser(userId) {
  activeUserId = userId;
  teardownRecurringListener();
  clearRecurringTaskList();
  if (!userId || !firestoreInstance) {
    return;
  }
  const col = collection(firestoreInstance, 'recurring_tasks');
  const q = query(col, where('userId', '==', userId));
  unsubscribeRecurring = onSnapshot(q, (snapshot) => {
    cachedRecurringTasks = snapshot.docs
      .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
      .sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() ?? 0;
        const bTime = b.createdAt?.toMillis?.() ?? 0;
        return aTime - bTime;
      });
    renderTodayRecurringTasks();
  });
}

export function refreshTodayRecurringTasks() {
  renderTodayRecurringTasks();
}

export function teardownRecurringTasks() {
  activeUserId = null;
  teardownRecurringListener();
  clearRecurringTaskList();
  closeRecurringModal();
}

function teardownRecurringListener() {
  if (unsubscribeRecurring) {
    unsubscribeRecurring();
    unsubscribeRecurring = null;
  }
}

function initializeRecurringTaskForm() {
  if (!monthlyDateSelect || !yearlyMonthSelect || !yearlyDateSelect) return;

  monthlyDateSelect.innerHTML = '';
  for (let i = 1; i <= 31; i++) {
    const option = document.createElement('option');
    option.value = String(i);
    option.textContent = `${i}日`;
    monthlyDateSelect.appendChild(option);
  }

  yearlyMonthSelect.innerHTML = '';
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  months.forEach((label, idx) => {
    const option = document.createElement('option');
    option.value = String(idx + 1);
    option.textContent = label;
    yearlyMonthSelect.appendChild(option);
  });
  updateYearlyDates(1);
}

function setupRecurringTaskEventListeners() {
  if (eventListenersInitialized) return;
  eventListenersInitialized = true;

  if (openRecurringModalButton) {
    openRecurringModalButton.addEventListener('click', () => {
      if (!activeUserId) {
        alert('ログイン後に繰り返しタスクを追加できます。');
        return;
      }
      resetRecurringForm();
      recurringModalBackdrop?.classList.remove('hidden');
      document.body.classList.add('modal-open');
    });
  }

  if (closeRecurringModalButton) {
    closeRecurringModalButton.addEventListener('click', () => {
      closeRecurringModal();
    });
  }

  if (recurringModalBackdrop) {
    recurringModalBackdrop.addEventListener('click', (event) => {
      if (event.target === recurringModalBackdrop) {
        closeRecurringModal();
      }
    });
  }

  if (recurringForm) {
    recurringForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      await addRecurringTask();
    });
  }

  if (recurringTypeSelect) {
    recurringTypeSelect.addEventListener('change', (event) => {
      const value = event.target.value;
      toggleRecurringOptions(value);
    });
  }

  if (monthlyTypeSelect) {
    monthlyTypeSelect.addEventListener('change', (event) => {
      const value = event.target.value;
      const isWeekBased = value === 'week';
      monthlyDateSelector?.classList.toggle('hidden', isWeekBased);
      monthlyWeekSelector?.classList.toggle('hidden', !isWeekBased);
    });
  }

  if (yearlyMonthSelect) {
    yearlyMonthSelect.addEventListener('change', (event) => {
      const month = parseInt(event.target.value, 10);
      updateYearlyDates(isNaN(month) ? 1 : month);
    });
  }
}

async function addRecurringTask() {
  if (!recurringTaskInput || !recurringTypeSelect || !firestoreInstance || !activeUserId) return;
  const title = recurringTaskInput.value.trim();
  const type = recurringTypeSelect.value;
  if (!title || !type) {
    alert('タスク内容と繰り返しの種類を入力してください。');
    return;
  }

  const schedule = buildScheduleFromForm(type);
  if (!schedule) return;

  const payload = {
    userId: activeUserId,
    title,
    schedule,
    createdAt: serverTimestamp(),
  };

  try {
    await addDoc(collection(firestoreInstance, 'recurring_tasks'), payload);
    resetRecurringForm();
    closeRecurringModal();
  } catch (error) {
    console.error('Error adding recurring task:', error);
    alert('繰り返しタスクの追加に失敗しました。');
  }
}

function buildScheduleFromForm(type) {
  switch (type) {
    case 'weekly':
      if (!weeklyOptions) return null;
      const selectedDays = Array.from(weeklyOptions.querySelectorAll('input[type="checkbox"]:checked'))
        .map((input) => parseInt(input.value, 10))
        .filter((value) => !isNaN(value))
        .sort((a, b) => a - b);
      if (selectedDays.length === 0) {
        alert('曜日を選択してください。');
        return null;
      }
      return { type: 'weekly', days: selectedDays };

    case 'monthly':
      if (!monthlyTypeSelect) return null;
      if (monthlyTypeSelect.value === 'date') {
        const date = parseInt(monthlyDateSelect?.value || '', 10);
        if (isNaN(date)) {
          alert('日にちを選択してください。');
          return null;
        }
        return { type: 'monthly', subtype: 'date', date };
      }
      const week = parseInt(monthlyWeekSelect?.value || '', 10);
      const weekday = parseInt(monthlyWeekdaySelect?.value || '', 10);
      if (isNaN(week) || isNaN(weekday)) {
        alert('週と曜日を選択してください。');
        return null;
      }
      return { type: 'monthly', subtype: 'week', week, weekday };

    case 'yearly':
      const month = parseInt(yearlyMonthSelect?.value || '', 10);
      const date = parseInt(yearlyDateSelect?.value || '', 10);
      if (isNaN(month) || isNaN(date)) {
        alert('月と日を選択してください。');
        return null;
      }
      return { type: 'yearly', month, date };

    default:
      alert('繰り返しの種類を選択してください。');
      return null;
  }
}

function resetRecurringForm() {
  if (!recurringForm) return;
  recurringForm.reset();
  weeklyOptions?.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
    checkbox.checked = false;
  });
  monthlyDateSelector?.classList.remove('hidden');
  monthlyWeekSelector?.classList.add('hidden');
  toggleRecurringOptions('');
  updateYearlyDates(parseInt(yearlyMonthSelect?.value || '1', 10) || 1);
}

function toggleRecurringOptions(type) {
  [weeklyOptions, monthlyOptions, yearlyOptions].forEach((element) => {
    element?.classList.add('hidden');
  });
  if (!type) return;
  const map = {
    weekly: weeklyOptions,
    monthly: monthlyOptions,
    yearly: yearlyOptions,
  };
  map[type]?.classList.remove('hidden');
}

function updateYearlyDates(month) {
  if (!yearlyDateSelect) return;
  const daysInMonth = new Date(2024, month, 0).getDate();
  const previousValue = yearlyDateSelect.value;
  yearlyDateSelect.innerHTML = '';
  for (let i = 1; i <= daysInMonth; i++) {
    const option = document.createElement('option');
    option.value = String(i);
    option.textContent = `${i}日`;
    yearlyDateSelect.appendChild(option);
  }
  if (previousValue) {
    const optionToRestore = yearlyDateSelect.querySelector(`option[value="${previousValue}"]`);
    if (optionToRestore) {
      optionToRestore.selected = true;
      return;
    }
  }
  yearlyDateSelect.selectedIndex = 0;
}

function renderTodayRecurringTasks() {
  if (!todayRecurringTasksList) return;
  todayRecurringTasksList.innerHTML = '';
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const matches = cachedRecurringTasks.filter((task) => shouldDisplayTaskToday(task.schedule, today));
  matches.forEach((task) => {
    todayRecurringTasksList.appendChild(buildRecurringTaskItem(task));
  });

  const shouldHide = matches.length === 0;
  recurringTasksContainer?.classList.toggle('hidden', shouldHide);
}

function shouldDisplayTaskToday(schedule, date) {
  if (!schedule) return false;
  const dayOfWeek = date.getDay();
  const dayOfMonth = date.getDate();
  const month = date.getMonth() + 1;

  switch (schedule.type) {
    case 'weekly':
      return Array.isArray(schedule.days) && schedule.days.includes(dayOfWeek);

    case 'monthly':
      if (schedule.subtype === 'date') {
        return schedule.date === dayOfMonth;
      }
      if (schedule.subtype === 'week') {
        if (schedule.week === -1) {
          return schedule.weekday === dayOfWeek && isLastWeekdayOfMonth(date);
        }
        return schedule.week === getWeekNumberInMonth(date) && schedule.weekday === dayOfWeek;
      }
      return false;

    case 'yearly':
      return schedule.month === month && schedule.date === dayOfMonth;

    default:
      return false;
  }
}

function buildRecurringTaskItem(task) {
  const li = document.createElement('li');
  li.className = 'recurring-task-item';
  li.dataset.id = task.id;

  const textContainer = document.createElement('div');
  textContainer.className = 'task-content';

  const titleSpan = document.createElement('span');
  titleSpan.textContent = task.title || '';
  textContainer.appendChild(titleSpan);

  const scheduleInfo = document.createElement('small');
  scheduleInfo.className = 'schedule-text';
  scheduleInfo.textContent = getScheduleText(task.schedule);
  textContainer.appendChild(scheduleInfo);

  li.appendChild(textContainer);

  const actions = document.createElement('div');
  actions.className = 'task-buttons';

  const deleteButton = document.createElement('button');
  deleteButton.className = 'delete-recurring-btn';
  deleteButton.type = 'button';
  deleteButton.textContent = '削除';
  deleteButton.addEventListener('click', () => deleteRecurringTask(task.id));

  actions.appendChild(deleteButton);
  li.appendChild(actions);
  return li;
}

async function deleteRecurringTask(taskId) {
  if (!firestoreInstance || !taskId) return;
  if (!confirm('この繰り返しタスクを削除しますか？')) return;
  try {
    await deleteDoc(doc(firestoreInstance, 'recurring_tasks', taskId));
  } catch (error) {
    console.error('Error deleting recurring task:', error);
    alert('繰り返しタスクの削除に失敗しました。');
  }
}

function getScheduleText(schedule) {
  if (!schedule) return '';
  switch (schedule.type) {
    case 'weekly':
      return `毎週 ${formatDays(schedule.days)}`;
    case 'monthly':
      if (schedule.subtype === 'date') {
        return `毎月 ${schedule.date}日`;
      }
      return `毎月 ${formatWeek(schedule.week)}${formatDay(schedule.weekday)}曜日`;
    case 'yearly':
      return `毎年 ${schedule.month}月${schedule.date}日`;
    default:
      return '';
  }
}

function formatDays(days) {
  if (!Array.isArray(days) || days.length === 0) return '';
  const labels = ['日', '月', '火', '水', '木', '金', '土'];
  return days.map((day) => labels[day] || '').filter(Boolean).join('・') + '曜日';
}

function formatWeek(week) {
  switch (week) {
    case 1: return '第1';
    case 2: return '第2';
    case 3: return '第3';
    case 4: return '第4';
    case -1: return '最終';
    default: return '';
  }
}

function formatDay(day) {
  const labels = ['日', '月', '火', '水', '木', '金', '土'];
  return labels[day] || '';
}

function getWeekNumberInMonth(date) {
  const day = date.getDate();
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const offset = first.getDay();
  return Math.ceil((day + offset) / 7);
}

function isLastWeekdayOfMonth(date) {
  const nextWeek = new Date(date);
  nextWeek.setDate(date.getDate() + 7);
  return nextWeek.getMonth() !== date.getMonth();
}

function clearRecurringTaskList() {
  todayRecurringTasksList?.replaceChildren();
  recurringTasksContainer?.classList.add('hidden');
}

function closeRecurringModal() {
  recurringModalBackdrop?.classList.add('hidden');
  document.body.classList.remove('modal-open');
}

setInterval(() => {
  if (!activeUserId) return;
  renderTodayRecurringTasks();
}, 60 * 60 * 1000);
