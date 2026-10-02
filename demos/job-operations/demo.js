const state = { snapshot: null, selected: null };
const RU = document.documentElement.lang === 'ru';
const labels = RU ? {
  DISCOVERED: 'Найдена', QUALIFIED: 'Подходит', MATERIALS_READY: 'Материалы готовы',
  SENT_CONFIRMED: 'Отправка подтверждена', REPLIED: 'Получен ответ', EXCLUDED: 'Исключена',
} : {
  DISCOVERED: 'Discovered', QUALIFIED: 'Qualified', MATERIALS_READY: 'Materials ready',
  SENT_CONFIRMED: 'Send confirmed', REPLIED: 'Reply received', EXCLUDED: 'Excluded',
};
const copy = RU ? {
  fictional: 'вымышленная компания', placeholder: 'Выберите вымышленную вакансию, чтобы увидеть следующий шаг и подтверждения статуса.',
  source: 'Источники и устранение дублей', row: 'строка источника', rows: 'строки источников', one: 'одна вакансия',
  fit: 'Оценка соответствия', next: 'Следующий шаг', stages: 'Этапы в этом примере',
  loadError: 'Не удалось загрузить вымышленный набор. Обновите страницу или посмотрите исходники стенда.',
} : {
  fictional: 'fictional', placeholder: 'Select a fictional opportunity to inspect its next action and status evidence.',
  source: 'Source and deduplication', row: 'source row', rows: 'source rows', one: 'one opportunity',
  fit: 'Fit assessment', next: 'Next action', stages: 'Observed stages in this demo',
  loadError: 'The synthetic snapshot could not be loaded. Refresh the page or inspect the public source.',
};
const translations = {
  'SYN-001': {
    company: 'Астра Демо', role: 'Руководитель HR Operations', fit: 'Высокое соответствие',
    reason: 'Опыт управления кадровыми процессами и внедрения изменений соответствует требованиям.',
    next_action: 'Адаптировать резюме под HR Operations; проверить оплату и формат работы.',
    all_sources: 'Карьерная страница + сайт вакансий',
    evidence: ['Вымышленная вакансия', 'Оценка соответствия на демоданных'],
  },
  'SYN-002': {
    company: 'Харбор Демо', role: 'Менеджер AI-внедрения', fit: 'Частичное соответствие',
    reason: 'Опыт внедрения подходит; самостоятельная работа с LLM API в production пока не подтверждена.',
    next_action: 'До отклика проверить обязательные технические требования.',
    all_sources: 'Описание проекта агентства',
    evidence: ['Вымышленное описание проекта', 'Проверка требований на демоданных', 'Черновик материалов; отправки не было'],
  },
  'SYN-003': {
    company: 'Филдноут Демо', role: 'Операционный менеджер', fit: 'Высокое соответствие',
    reason: 'Опыт межкомандных процессов и кадровых операций соответствует роли.',
    next_action: 'Ждать ответа; напомнить о себе только после согласованного срока.',
    all_sources: 'Карьерная страница',
    evidence: ['Вымышленная вакансия', 'Оценка соответствия на демоданных', 'Адаптированный черновик', 'Вымышленное подтверждение DEMO-SEND-003'],
  },
  'SYN-004': {
    company: 'Нортлайн Демо', role: 'Менеджер продуктовых операций', fit: 'Частичное соответствие',
    reason: 'Кейс по выпуску продукта релевантен; опыт продуктовой аналитики в production требует проверки.',
    next_action: 'Ответить на вымышленный вопрос о задачах роли перед следующим этапом.',
    all_sources: 'Проектная площадка',
    evidence: ['Вымышленное описание проекта', 'Оценка соответствия на демоданных', 'Адаптированные материалы', 'Вымышленное подтверждение DEMO-SEND-004', 'Вымышленный ответ DEMO-REPLY-004'],
  },
  'SYN-005': {
    company: 'Прежний работодатель Демо', role: 'Руководитель HR-проекта', fit: 'Исключена',
    reason: 'Вымышленное правило исключения: прежний работодатель.',
    next_action: 'Не связываться.', all_sources: 'Карьерная страница',
    evidence: ['Вымышленная вакансия', 'Проверка исключения на демоданных; контакта не было'],
  },
};
function localized(record) {
  if (!RU) return record;
  const translated = translations[record.opportunity_id];
  return translated ? {...record, ...translated, events: record.events.map((event, index) => ({...event, evidence: translated.evidence[index] ?? event.evidence}))} : record;
}
const $ = selector => document.querySelector(selector);
function matches(record, filter) {
  if (filter === 'active') return record.stage !== 'EXCLUDED';
  if (filter === 'sent') return ['SENT_CONFIRMED', 'REPLIED'].includes(record.stage);
  if (filter === 'replied') return record.stage === 'REPLIED';
  if (filter === 'excluded') return record.stage === 'EXCLUDED';
  return true;
}
function renderList() {
  const records = $('#records');
  records.replaceChildren();
  const view = state.snapshot.opportunities.filter(record => matches(record, $('#stage-filter').value));
  $('#filter-empty').hidden = view.length !== 0;
  for (const record of view) {
    const display = localized(record);
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'record';
    button.setAttribute('aria-pressed', String(state.selected === record.opportunity_id));
    const left = document.createElement('span');
    const id = document.createElement('span'); id.className = 'record-id'; id.textContent = record.opportunity_id;
    const title = document.createElement('span'); title.className = 'record-title'; title.textContent = display.role;
    const company = document.createElement('span'); company.className = 'record-company'; company.textContent = `${display.company} · ${copy.fictional}`;
    left.append(id, document.createElement('br'), title, document.createElement('br'), company);
    const stage = document.createElement('span'); stage.className = `record-stage ${record.stage.toLowerCase()}`; stage.textContent = labels[record.stage];
    button.append(left, stage);
    button.addEventListener('click', () => { state.selected = record.opportunity_id; renderList(); renderDetail(); });
    records.append(button);
  }
}
function addBlock(root, title, value) {
  const section = document.createElement('section'); section.className = 'detail-block';
  const heading = document.createElement('h4'); heading.textContent = title;
  const text = document.createElement('p'); text.textContent = value;
  section.append(heading, text); root.append(section);
}
function renderDetail() {
  const root = $('#detail-content'); root.replaceChildren();
  const source = state.snapshot.opportunities.find(item => item.opportunity_id === state.selected);
  if (!source) { const p = document.createElement('p'); p.className = 'placeholder'; p.textContent = copy.placeholder; root.append(p); return; }
  const record = localized(source);
  const head = document.createElement('div'); head.className = 'detail-head';
  const id = document.createElement('span'); id.className = 'record-id'; id.textContent = `${record.opportunity_id} · ${RU ? 'ВЫМЫШЛЕННАЯ ВАКАНСИЯ' : 'FICTIONAL'}`;
  const title = document.createElement('h3'); title.textContent = record.role;
  const company = document.createElement('p'); company.textContent = record.company;
  const badge = document.createElement('span'); badge.className = `status ${record.stage.toLowerCase()}`; badge.textContent = labels[record.stage];
  head.append(id, title, company, badge); root.append(head);
  addBlock(root, copy.source, `${record.all_sources}. ${record.source_count} ${record.source_count === 1 ? copy.row : copy.rows} → ${copy.one}.`);
  addBlock(root, copy.fit, `${record.fit}. ${record.reason}`);
  addBlock(root, copy.next, record.next_action);
  const section = document.createElement('section'); section.className = 'detail-block';
  const heading = document.createElement('h4'); heading.textContent = copy.stages;
  const list = document.createElement('ol'); list.className = 'timeline';
  for (const event of record.events) {
    const item = document.createElement('li');
    const seq = document.createElement('span'); seq.className = 'seq'; seq.textContent = String(event.seq).padStart(2, '0');
    const content = document.createElement('span');
    const strong = document.createElement('strong'); strong.textContent = labels[event.stage];
    const small = document.createElement('small'); small.textContent = event.evidence;
    content.append(strong, small); item.append(seq, content); list.append(item);
  }
  section.append(heading, list); root.append(section);
}
async function load() {
  try {
    const response = await fetch(RU ? '../data/snapshot.json' : 'data/snapshot.json', {cache: 'no-store'});
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const snapshot = await response.json();
    if (snapshot.dataset !== 'FICTIONAL_DEMO_ONLY' || !Array.isArray(snapshot.opportunities)) throw new Error('Unexpected dataset');
    state.snapshot = snapshot;
    $('#raw-count').textContent = snapshot.metrics.raw_leads;
    $('#unique-count').textContent = snapshot.metrics.unique_opportunities;
    $('#excluded-count').textContent = snapshot.metrics.excluded;
    $('#sent-count').textContent = snapshot.metrics.confirmed_sends;
    $('#reply-count').textContent = snapshot.metrics.replies;
    state.selected = snapshot.opportunities[0]?.opportunity_id ?? null;
    $('#load-state').hidden = true;
    renderList(); renderDetail();
  } catch {
    $('#load-state').textContent = copy.loadError;
  }
}
$('#stage-filter').addEventListener('change', () => {
  if (!state.snapshot) return;
  const visible = state.snapshot.opportunities.filter(record => matches(record, $('#stage-filter').value));
  if (!visible.some(record => record.opportunity_id === state.selected)) {
    state.selected = visible[0]?.opportunity_id ?? null;
  }
  renderList(); renderDetail();
});
load();
