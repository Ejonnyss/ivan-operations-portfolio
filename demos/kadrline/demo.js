const KEY = 'kadrline-portfolio-sandbox-v1';
const RU = document.documentElement.lang === 'ru';
const labels = RU ? {
  onboarding: 'Оформление нового сотрудника',
  deadline: 'Срок кадрового документа',
  'role-change': 'Изменение должности',
} : {
  onboarding: 'New employee onboarding',
  deadline: 'Document deadline',
  'role-change': 'Role change',
};
const owners = RU ? {
  onboarding: 'Специалист по кадровому делопроизводству',
  deadline: 'Ответственный за кадровые документы',
  'role-change': 'HR-бизнес-партнёр',
} : {
  onboarding: 'HR operations owner',
  deadline: 'Document control owner',
  'role-change': 'HR business partner',
};
const stageNames = RU
  ? ['Заявка создана', 'Данные проверены', 'Ответственный назначен', 'Результат записан']
  : ['Request recorded', 'Input validated', 'Owner assigned', 'Result recorded'];
const words = RU ? {
  saved: 'Сохранено в этом браузере',
  unsaved: 'Хранилище недоступно · текущие изменения не сохранены',
  request: 'ДЕМО-ЗАЯВКА',
  targetDate: 'Срок',
  validated: 'Обязательные поля проверены; юридическая оценка не проводилась',
  responsible: 'Ответственная роль',
  closed: 'Заявка закрыта в демо; выполнение вне стенда не подтверждено',
  done: 'Готово', current: 'Сейчас', next: 'Далее',
  actions: [
    ['Проверить данные', 'Проверьте обязательные поля перед назначением ответственного.'],
    ['Назначить ответственного', 'Укажите одну ответственную роль и срок задачи.'],
    ['Записать результат', 'Закройте демо-заявку с явным статусом.'],
    ['Завершено', 'Демо-сценарий закрыт. Сбросьте стенд, чтобы попробовать другую заявку.'],
  ],
  nextAction: 'Следующий шаг', workflowComplete: 'Сценарий завершён',
  validation: 'Выберите тип заявки, укажите роль (от 3 символов), срок и описание (от 10 символов).',
  localOnly: 'Только в браузере · без сервера',
  clearFailed: 'Не удалось очистить хранилище · удалите данные сайта в настройках браузера',
  restored: 'Восстановлено из этого браузера',
} : {
  saved: 'Saved in this browser',
  unsaved: 'Browser storage unavailable · current changes are not saved',
  request: 'DEMO REQUEST',
  targetDate: 'Target date',
  validated: 'Required fields checked; no legal assessment performed',
  responsible: 'Responsible role',
  closed: 'Closed in this sandbox; external completion is not asserted',
  done: 'Done', current: 'Current', next: 'Next',
  actions: [
    ['Validate input', 'Check the required fields before work is assigned.'],
    ['Assign owner', 'Give one responsible role and a target date to the task.'],
    ['Record result', 'Close the demo task with an explicit status.'],
    ['Completed', 'This simulated workflow is closed. Reset to try another case.'],
  ],
  nextAction: 'Next action', workflowComplete: 'Workflow complete',
  validation: 'Choose a workflow, enter a role (3+ characters), target date and context (10+ characters).',
  localOnly: 'Local only · no server',
  clearFailed: 'Could not clear browser storage · clear site data in browser settings',
  restored: 'Restored from this browser',
};
const form = document.querySelector('#request-form');
const error = document.querySelector('#form-error');
const reset = document.querySelector('#reset');
const advance = document.querySelector('#advance');
const download = document.querySelector('#download');
const saveStatus = document.querySelector('#save-status');
let record = null;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
function parseRecord() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (!saved || !labels[saved.type] || !Number.isInteger(saved.stage) || saved.stage < 0 || saved.stage > 3) return null;
    if (typeof saved.role !== 'string' || typeof saved.note !== 'string' || typeof saved.due !== 'string') return null;
    return saved;
  } catch { return null; }
}
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(record));
    saveStatus.textContent = words.saved;
  } catch {
    saveStatus.textContent = words.unsaved;
  }
}
function render() {
  const active = !!record;
  document.querySelector('#empty').hidden = active;
  document.querySelector('#flow').hidden = !active;
  if (!active) return;
  document.querySelector('#request-id').textContent = `${words.request} · ${record.id}`;
  document.querySelector('#summary-title').textContent = `${labels[record.type]} · ${record.role}`;
  document.querySelector('#summary-note').textContent = record.note;
  const details = [
    `${words.targetDate}: ${record.due}`,
    words.validated,
    `${words.responsible}: ${owners[record.type]}`,
    words.closed,
  ];
  document.querySelector('#steps').innerHTML = stageNames.map((name, index) => {
    const state = index < record.stage || (record.stage === 3 && index === 3) ? 'done' : index === record.stage ? 'current' : 'pending';
    const stateText = state === 'done' ? words.done : state === 'current' ? words.current : words.next;
    return `<li><span class="step-num">0${index + 1}</span><div><div class="step-title">${escapeHtml(name)}</div><div class="step-detail">${escapeHtml(details[index])}</div></div><span class="step-state ${state}">${stateText}</span></li>`;
  }).join('');
  const actionCopy = words.actions[record.stage];
  document.querySelector('#next-action').innerHTML = `<strong>${words.nextAction}: ${actionCopy[0]}</strong>${actionCopy[1]}`;
  advance.textContent = record.stage === 3 ? words.workflowComplete : actionCopy[0] + ' →';
  advance.disabled = record.stage === 3;
}
function validDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}
form.addEventListener('submit', event => {
  event.preventDefault();
  const type = document.querySelector('#request-type').value;
  const role = document.querySelector('#role').value.trim();
  const due = document.querySelector('#due-date').value;
  const note = document.querySelector('#note').value.trim();
  if (!labels[type] || role.length < 3 || !validDate(due) || note.length < 10) {
    error.textContent = words.validation;
    error.hidden = false;
    return;
  }
  error.hidden = true;
  record = {schema: 1, id: `SYN-${Date.now().toString(36).toUpperCase()}`, type, role, due, note, stage: 0, createdAt: new Date().toISOString(), history: [{stage: 0, at: new Date().toISOString()}]};
  save(); render();
  document.querySelector('#flow-title').scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
});
advance.addEventListener('click', () => {
  if (!record || record.stage === 3) return;
  record.stage += 1;
  record.history.push({stage: record.stage, at: new Date().toISOString()});
  save(); render();
});
reset.addEventListener('click', () => {
  record = null;
  try {
    localStorage.removeItem(KEY);
    saveStatus.textContent = words.localOnly;
  } catch {
    saveStatus.textContent = words.clearFailed;
  }
  form.reset(); error.hidden = true; render();
});
download.addEventListener('click', () => {
  if (!record) return;
  const blob = new Blob([JSON.stringify({...record, demo: true, integration: 'none'}, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = `${record.id.toLowerCase()}.json`; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
record = parseRecord();
if (record) saveStatus.textContent = words.restored;
render();
