const state = { snapshot: null, selected: null };
const labels = {
  DISCOVERED: 'Discovered', QUALIFIED: 'Qualified', MATERIALS_READY: 'Materials ready',
  SENT_CONFIRMED: 'Send confirmed', REPLIED: 'Reply received', EXCLUDED: 'Excluded',
};
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
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'record';
    button.setAttribute('aria-pressed', String(state.selected === record.opportunity_id));
    const left = document.createElement('span');
    const id = document.createElement('span'); id.className = 'record-id'; id.textContent = record.opportunity_id;
    const title = document.createElement('span'); title.className = 'record-title'; title.textContent = record.role;
    const company = document.createElement('span'); company.className = 'record-company'; company.textContent = `${record.company} · fictional`;
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
  const record = state.snapshot.opportunities.find(item => item.opportunity_id === state.selected);
  if (!record) { const p = document.createElement('p'); p.className = 'placeholder'; p.textContent = 'Select a fictional opportunity to inspect its next action and status evidence.'; root.append(p); return; }
  const head = document.createElement('div'); head.className = 'detail-head';
  const id = document.createElement('span'); id.className = 'record-id'; id.textContent = `${record.opportunity_id} · FICTIONAL`;
  const title = document.createElement('h3'); title.textContent = record.role;
  const company = document.createElement('p'); company.textContent = record.company;
  const badge = document.createElement('span'); badge.className = `status ${record.stage.toLowerCase()}`; badge.textContent = labels[record.stage];
  head.append(id, title, company, badge); root.append(head);
  addBlock(root, 'Source and deduplication', `${record.all_sources}. ${record.source_count} source row${record.source_count === 1 ? '' : 's'} → one opportunity.`);
  addBlock(root, 'Fit assessment', `${record.fit}. ${record.reason}`);
  addBlock(root, 'Next action', record.next_action);
  const section = document.createElement('section'); section.className = 'detail-block';
  const heading = document.createElement('h4'); heading.textContent = 'Observed stages in this demo';
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
    const response = await fetch('data/snapshot.json', {cache: 'no-store'});
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
    $('#load-state').textContent = 'The synthetic snapshot could not be loaded. Refresh the page or inspect the public source.';
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
