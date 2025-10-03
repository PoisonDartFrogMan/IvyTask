import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  deleteDoc,
  updateDoc,
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
const recurringTaskMemoInput = document.getElementById('recurring-task-memo');
const recurringTaskLabelSelect = document.getElementById('recurring-task-label');
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
const recurringModalTitle = document.querySelector('#recurring-task-modal h2');
const recurringModalSubmitButton = recurringForm?.querySelector('button[type="submit"]');
const recurringTasksContainer = document.getElementById('recurring-tasks-container');
const todayRecurringTasksList = document.getElementById('today-recurring-tasks');
const openRecurringListModalButton = document.getElementById('open-recurring-list-modal-button');
const recurringListModalBackdrop = document.getElementById('recurring-list-modal-backdrop');
const closeRecurringListModalButton = document.getElementById('close-recurring-list-modal-button');
const recurringListModalItems = document.getElementById('recurring-list-modal-items');

let recurringLabels = [];
const labelMap = new Map();
let editingRecurringTaskId = null;

export function initializeRecurringTasks(db) {
  firestoreInstance = db;
  initializeRecurringTaskForm();
  setupRecurringTaskEventListeners();
}

export function updateRecurringTaskLabels(labels) {
  recurringLabels = Array.isArray(labels) ? labels.slice() : [];
  labelMap.clear();
  recurringLabels.forEach((label) => {
    if (label?.id) {
      labelMap.set(label.id, label);
    }
  });
  refreshRecurringLabelOptions();
  renderAllRecurringTasks();
  renderTodayRecurringTasks();
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
    renderAllRecurringTasks();
  });
}

export function refreshTodayRecurringTasks() {
  renderTodayRecurringTasks();
  renderAllRecurringTasks();
}

export function teardownRecurringTasks() {
  activeUserId = null;
  teardownRecurringListener();
  clearRecurringTaskList();
  closeRecurringModal();
  closeRecurringListModal();
  updateRecurringTaskLabels([]);
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
  refreshRecurringLabelOptions(false, '');
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

  if (openRecurringListModalButton) {
    openRecurringListModalButton.addEventListener('click', () => {
      if (!activeUserId) {
        alert('ログイン後に繰り返しタスクを閲覧できます。');
        return;
      }
      openRecurringListModal();
    });
  }

  if (closeRecurringListModalButton) {
    closeRecurringListModalButton.addEventListener('click', () => {
      closeRecurringListModal();
    });
  }

  if (recurringListModalBackdrop) {
    recurringListModalBackdrop.addEventListener('click', (event) => {
      if (event.target === recurringListModalBackdrop) {
        closeRecurringListModal();
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

function refreshRecurringLabelOptions(preserveSelection = true, explicitValue = null) {
  if (!recurringTaskLabelSelect) return;
  const oldValue = explicitValue !== null ? explicitValue : (preserveSelection ? recurringTaskLabelSelect.value : '');
  recurringTaskLabelSelect.innerHTML = '';

  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'ラベルなし';
  recurringTaskLabelSelect.appendChild(defaultOption);

  recurringLabels.forEach((label) => {
    const option = document.createElement('option');
    option.value = label.id;
    option.textContent = label.name;
    recurringTaskLabelSelect.appendChild(option);
  });

  if (oldValue && !recurringLabels.some((label) => label.id === oldValue)) {
    const orphanOption = document.createElement('option');
    orphanOption.value = oldValue;
    orphanOption.textContent = '(削除済みラベル)';
    recurringTaskLabelSelect.appendChild(orphanOption);
  }

  recurringTaskLabelSelect.value = oldValue || '';
}

async function addRecurringTask() {
  if (!recurringTaskInput || !recurringTypeSelect || !firestoreInstance || !activeUserId) return;
  const title = recurringTaskInput.value.trim();
  const memo = (recurringTaskMemoInput?.value || '').trim();
  const labelId = (recurringTaskLabelSelect?.value || '').trim();
  const type = recurringTypeSelect.value;
  if (!title || !type) {
    alert('タスク内容と繰り返しの種類を入力してください。');
    return;
  }

  const schedule = buildScheduleFromForm(type);
  if (!schedule) return;

  const baseData = {
    title,
    memo,
    labelId: labelId || null,
    schedule,
  };

  try {
    if (editingRecurringTaskId) {
      const ref = doc(firestoreInstance, 'recurring_tasks', editingRecurringTaskId);
      await updateDoc(ref, {
        ...baseData,
        memo: memo,
        updatedAt: serverTimestamp(),
      });
    } else {
      await addDoc(collection(firestoreInstance, 'recurring_tasks'), {
        ...baseData,
        memo,
        userId: activeUserId,
        createdAt: serverTimestamp(),
      });
    }
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

function openRecurringTaskEditorById(taskId) {
  const target = cachedRecurringTasks.find((item) => item.id === taskId);
  if (!target) return;
  if (recurringListModalBackdrop && !recurringListModalBackdrop.classList.contains('hidden')) {
    closeRecurringListModal();
  }
  prepareRecurringFormForEdit(target);
  recurringModalBackdrop?.classList.remove('hidden');
  document.body.classList.add('modal-open');
}

function prepareRecurringFormForEdit(task) {
  resetRecurringForm();
  editingRecurringTaskId = task.id;
  if (recurringModalTitle) { recurringModalTitle.textContent = '繰り返しタスクを編集'; }
  if (recurringModalSubmitButton) { recurringModalSubmitButton.textContent = '更新'; }

  if (recurringTaskInput) { recurringTaskInput.value = task.title || ''; }
  if (recurringTaskMemoInput) { recurringTaskMemoInput.value = task.memo || ''; }
  refreshRecurringLabelOptions(false, task.labelId || '');

  const schedule = task.schedule || {};
  const type = schedule.type || 'weekly';
  if (recurringTypeSelect) {
    recurringTypeSelect.value = type;
  }
  toggleRecurringOptions(type);

  if (type === 'weekly' && weeklyOptions) {
    const days = Array.isArray(schedule.days) ? schedule.days.map((d) => parseInt(d, 10)) : [];
    weeklyOptions.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
      const value = parseInt(checkbox.value, 10);
      checkbox.checked = days.includes(value);
    });
  }

  if (type === 'monthly') {
    if (monthlyTypeSelect) {
      monthlyTypeSelect.value = schedule.subtype === 'week' ? 'week' : 'date';
      monthlyTypeSelect.dispatchEvent(new Event('change'));
    }
    if (monthlyTypeSelect?.value === 'week') {
      if (monthlyWeekSelect) { monthlyWeekSelect.value = String(schedule.week || 1); }
      if (monthlyWeekdaySelect) { monthlyWeekdaySelect.value = String(schedule.weekday ?? 0); }
    } else {
      if (monthlyDateSelect) { monthlyDateSelect.value = String(schedule.date || 1); }
    }
  }

  if (type === 'yearly') {
    if (yearlyMonthSelect) {
      yearlyMonthSelect.value = String(schedule.month || yearlyMonthSelect.value || '1');
      updateYearlyDates(parseInt(yearlyMonthSelect.value || '1', 10));
    }
    if (yearlyDateSelect) {
      const monthNum = parseInt(yearlyMonthSelect?.value || '1', 10);
      updateYearlyDates(monthNum);
      yearlyDateSelect.value = String(schedule.date || yearlyDateSelect.value || '1');
    }
  }
}

function resetRecurringForm() {
  if (!recurringForm) return;
  recurringForm.reset();
  editingRecurringTaskId = null;
  weeklyOptions?.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
    checkbox.checked = false;
  });
  recurringTaskMemoInput && (recurringTaskMemoInput.value = '');
  refreshRecurringLabelOptions(false, '');
  monthlyDateSelector?.classList.remove('hidden');
  monthlyWeekSelector?.classList.add('hidden');
  toggleRecurringOptions('');
  if (yearlyMonthSelect && yearlyMonthSelect.options.length > 0) {
    yearlyMonthSelect.value = yearlyMonthSelect.options[0].value;
  }
  const monthValue = parseInt(yearlyMonthSelect?.value || '1', 10) || 1;
  updateYearlyDates(monthValue);
  if (yearlyDateSelect && yearlyDateSelect.options.length > 0) {
    yearlyDateSelect.value = yearlyDateSelect.options[0].value;
  }
  if (recurringTypeSelect) { recurringTypeSelect.value = ''; }
  if (monthlyTypeSelect) { monthlyTypeSelect.value = 'date'; }
  if (recurringModalTitle) { recurringModalTitle.textContent = '繰り返しタスクを追加'; }
  if (recurringModalSubmitButton) { recurringModalSubmitButton.textContent = '保存'; }
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

  const today = getStartOfToday();
  const focalistCutoff = getFocalistCutoffDate(today);

  const matches = cachedRecurringTasks
    .map((task) => {
      const nextDate = getNextOccurrenceDate(task.schedule, today, task.lastCompletedDate);
      return { task, nextDate };
    })
    .filter(({ task, nextDate }) => {
      if (!nextDate) return false;
      if (nextDate.getTime() > focalistCutoff.getTime()) return false;
      const key = formatDateKey(nextDate);
      return task.lastCompletedDate !== key;
    })
    .sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime());

  matches.forEach(({ task, nextDate }) => {
    todayRecurringTasksList.appendChild(buildRecurringTaskItem(task, nextDate, { mode: 'focalist', nextDateKey: formatDateKey(nextDate) }));
  });

  const shouldHide = matches.length === 0;
  recurringTasksContainer?.classList.toggle('hidden', shouldHide);
}

function renderAllRecurringTasks() {
  if (!recurringListModalItems) return;

  recurringListModalItems.innerHTML = '';

  if (cachedRecurringTasks.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'recurring-task-item empty';
    const content = document.createElement('div');
    content.className = 'task-content';
    const text = document.createElement('span');
    text.textContent = '繰り返しタスクはまだ登録されていません。';
    content.appendChild(text);
    empty.appendChild(content);
    recurringListModalItems.appendChild(empty);
    return;
  }

  const today = getStartOfToday();
  cachedRecurringTasks
    .map((task) => ({
      task,
      nextDate: getNextOccurrenceDate(task.schedule, today, task.lastCompletedDate),
    }))
    .sort((a, b) => {
      const aTime = a.nextDate ? a.nextDate.getTime() : Number.MAX_SAFE_INTEGER;
      const bTime = b.nextDate ? b.nextDate.getTime() : Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    })
    .forEach(({ task, nextDate }) => {
      recurringListModalItems.appendChild(buildRecurringTaskItem(task, nextDate, { mode: 'modal' }));
    });
}

function getStartOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function getFocalistCutoffDate(todayStart) {
  const cutoff = new Date(todayStart);
  cutoff.setDate(cutoff.getDate() + 1);
  return cutoff;
}

function getNextOccurrenceDate(schedule, referenceDate, lastCompletedDateKey) {
  if (!schedule) return null;
  const start = new Date(referenceDate);
  start.setHours(0, 0, 0, 0);

  if (lastCompletedDateKey) {
    const completedDate = parseDateKey(lastCompletedDateKey);
    if (completedDate && completedDate.getTime() >= start.getTime()) {
      start.setTime(completedDate.getTime());
      start.setDate(start.getDate() + 1);
    }
  }

  switch (schedule.type) {
    case 'weekly':
      return getNextWeeklyOccurrence(schedule.days, start);
    case 'monthly':
      if (schedule.subtype === 'week') {
        return getNextMonthlyWeekOccurrence(schedule.week, schedule.weekday, start);
      }
      return getNextMonthlyDateOccurrence(schedule.date, start);
    case 'yearly':
      return getNextYearlyOccurrence(schedule.month, schedule.date, start);
    default:
      return null;
  }
}

function getNextWeeklyOccurrence(days, referenceDate) {
  if (!Array.isArray(days) || days.length === 0) return null;
  const normalized = Array.from(new Set(days.map((d) => parseInt(d, 10)))).filter((d) => d >= 0 && d <= 6).sort((a, b) => a - b);
  if (normalized.length === 0) return null;

  for (let offset = 0; offset < 14; offset++) {
    const candidate = new Date(referenceDate);
    candidate.setDate(candidate.getDate() + offset);
    if (normalized.includes(candidate.getDay())) {
      return candidate;
    }
  }
  return null;
}

function getNextMonthlyDateOccurrence(dayOfMonth, referenceDate) {
  const targetDay = parseInt(dayOfMonth, 10);
  if (isNaN(targetDay) || targetDay < 1 || targetDay > 31) return null;

  for (let offset = 0; offset < 24; offset++) {
    const year = referenceDate.getFullYear();
    const monthIndex = referenceDate.getMonth() + offset;
    const daysInMonth = getDaysInMonth(year, monthIndex);
    const day = Math.min(targetDay, daysInMonth);
    const candidate = new Date(year, monthIndex, day);
    if (candidate.getTime() >= referenceDate.getTime()) {
      return candidate;
    }
  }
  return null;
}

function getNextMonthlyWeekOccurrence(week, weekday, referenceDate) {
  const targetWeek = parseInt(week, 10);
  const targetWeekday = parseInt(weekday, 10);
  if (isNaN(targetWeek) || isNaN(targetWeekday) || targetWeekday < 0 || targetWeekday > 6) return null;

  for (let offset = 0; offset < 24; offset++) {
    const year = referenceDate.getFullYear();
    const monthIndex = referenceDate.getMonth() + offset;
    const candidate = getSpecificWeekdayOfMonth(year, monthIndex, targetWeek, targetWeekday);
    if (candidate && candidate.getTime() >= referenceDate.getTime()) {
      return candidate;
    }
  }
  return null;
}

function getSpecificWeekdayOfMonth(year, monthIndex, week, weekday) {
  if (week === -1) {
    const lastDay = new Date(year, monthIndex + 1, 0);
    const diff = (lastDay.getDay() - weekday + 7) % 7;
    lastDay.setDate(lastDay.getDate() - diff);
    return lastDay;
  }

  const firstDay = new Date(year, monthIndex, 1);
  const offset = (weekday - firstDay.getDay() + 7) % 7;
  const day = 1 + offset + (week - 1) * 7;
  const candidate = new Date(year, monthIndex, day);
  if (candidate.getMonth() !== ((monthIndex % 12) + 12) % 12) {
    return null;
  }
  return candidate;
}

function getNextYearlyOccurrence(month, day, referenceDate) {
  const targetMonth = parseInt(month, 10);
  const targetDay = parseInt(day, 10);
  if (isNaN(targetMonth) || isNaN(targetDay) || targetMonth < 1 || targetMonth > 12 || targetDay < 1 || targetDay > 31) {
    return null;
  }

  for (let offset = 0; offset < 3; offset++) {
    const year = referenceDate.getFullYear() + offset;
    const daysInMonth = getDaysInMonth(year, targetMonth - 1);
    const dayInMonth = Math.min(targetDay, daysInMonth);
    const candidate = new Date(year, targetMonth - 1, dayInMonth);
    if (candidate.getTime() >= referenceDate.getTime()) {
      return candidate;
    }
  }
  return null;
}

function getDaysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateKey(key) {
  if (!key || typeof key !== 'string') return null;
  const [y, m, d] = key.split('-').map((part) => parseInt(part, 10));
  if ([y, m, d].some((n) => Number.isNaN(n))) return null;
  const date = new Date(y, (m || 1) - 1, d || 1);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function formatDateForDisplay(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}

async function completeRecurringTask(taskId, occurrenceKey) {
  if (!taskId || !occurrenceKey || !firestoreInstance) return false;
  try {
    await updateDoc(doc(firestoreInstance, 'recurring_tasks', taskId), {
      lastCompletedDate: occurrenceKey,
      lastCompletedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Failed to complete recurring task:', error);
    alert('完了処理に失敗しました。時間をおいて再度お試しください。');
    return false;
  }
}

function buildRecurringTaskItem(task, nextOccurrence, options = {}) {
  const li = document.createElement('li');
  li.className = 'recurring-task-item';
  li.dataset.id = task.id;

  const textContainer = document.createElement('div');
  textContainer.className = 'task-content';

  const titleSpan = document.createElement('span');
  titleSpan.textContent = task.title || task.text || '';
  textContainer.appendChild(titleSpan);

  const scheduleInfo = document.createElement('small');
  scheduleInfo.className = 'schedule-text';
  scheduleInfo.textContent = getScheduleText(task.schedule);
  textContainer.appendChild(scheduleInfo);

  if (nextOccurrence) {
    const nextInfo = document.createElement('small');
    nextInfo.className = 'schedule-text';
    nextInfo.textContent = `次回: ${formatDateForDisplay(nextOccurrence)}`;
    textContainer.appendChild(nextInfo);
  }

  if (task.labelId) {
    const label = labelMap.get(task.labelId);
    if (label) {
      const badge = document.createElement('span');
      badge.className = 'task-label-badge';
      badge.textContent = label.name;
      badge.style.backgroundColor = label.color;
      textContainer.appendChild(badge);
    } else {
      const badge = document.createElement('span');
      badge.className = 'task-label-badge';
      badge.textContent = '削除済みラベル';
      badge.style.backgroundColor = '#b0b0b0';
      textContainer.appendChild(badge);
    }
  }

  if (task.memo) {
    const memo = document.createElement('span');
    memo.className = 'task-memo-text';
    memo.textContent = task.memo;
    textContainer.appendChild(memo);
  }

  if (task.lastCompletedDate) {
    const lastCompleted = parseDateKey(task.lastCompletedDate);
    if (lastCompleted) {
      const lastCompletedInfo = document.createElement('small');
      lastCompletedInfo.className = 'schedule-text';
      lastCompletedInfo.textContent = `最終完了: ${formatDateForDisplay(lastCompleted)}`;
      textContainer.appendChild(lastCompletedInfo);
    }
  }

  li.appendChild(textContainer);

  const actions = document.createElement('div');
  actions.className = 'task-buttons';

  if (options.mode === 'focalist' && nextOccurrence && options.nextDateKey) {
    const completeButton = document.createElement('button');
    completeButton.className = 'complete-recurring-btn';
    completeButton.type = 'button';
    completeButton.textContent = '完了';
    completeButton.addEventListener('click', async (event) => {
      event.stopPropagation();
      completeButton.disabled = true;
      const success = await completeRecurringTask(task.id, options.nextDateKey);
      if (!success) {
        completeButton.disabled = false;
      }
    });
    actions.appendChild(completeButton);
  }

  const editButton = document.createElement('button');
  editButton.className = 'edit-recurring-btn';
  editButton.type = 'button';
  editButton.textContent = '編集';
  editButton.addEventListener('click', () => openRecurringTaskEditorById(task.id));
  actions.appendChild(editButton);

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

function clearRecurringTaskList() {
  cachedRecurringTasks = [];
  todayRecurringTasksList?.replaceChildren();
  recurringTasksContainer?.classList.add('hidden');
  recurringListModalItems?.replaceChildren();
}

function closeRecurringModal() {
  recurringModalBackdrop?.classList.add('hidden');
  document.body.classList.remove('modal-open');
  resetRecurringForm();
}

function openRecurringListModal() {
  renderAllRecurringTasks();
  recurringListModalBackdrop?.classList.remove('hidden');
  document.body.classList.add('modal-open');
}

function closeRecurringListModal() {
  recurringListModalBackdrop?.classList.add('hidden');
  document.body.classList.remove('modal-open');
}

setInterval(() => {
  if (!activeUserId) return;
  renderTodayRecurringTasks();
  renderAllRecurringTasks();
}, 60 * 60 * 1000);
