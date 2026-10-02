const KEY = 'kadrline-portfolio-sandbox-v1';
const labels = {
  onboarding: 'New employee onboarding',
  deadline: 'Document deadline',
  'role-change': 'Role change',
};
const owners = {
  onboarding: 'HR operations owner',
  deadline: 'Document control owner',
  'role-change': 'HR business partner',
};
const stageNames = ['Request recorded', 'Input validated', 'Owner assigned', 'Result recorded'];
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
    saveStatus.textContent = 'Saved in this browser';
  } catch {
    saveStatus.textContent = 'Browser storage unavailable · current changes are not saved';
  }
}
function render() {
  const active = !!record;
  document.querySelector('#empty').hidden = active;
  document.querySelector('#flow').hidden = !active;
  if (!active) return;
  document.querySelector('#request-id').textContent = `DEMO REQUEST · ${record.id}`;
  document.querySelector('#summary-title').textContent = `${labels[record.type]} · ${record.role}`;
  document.querySelector('#summary-note').textContent = record.note;
  const details = [
    `Target date: ${record.due}`,
    'Required fields checked; no legal assessment performed',
    `Responsible role: ${owners[record.type]}`,
    'Closed in this sandbox; external completion is not asserted',
  ];
  document.querySelector('#steps').innerHTML = stageNames.map((name, index) => {
    const state = index < record.stage || (record.stage === 3 && index === 3) ? 'done' : index === record.stage ? 'current' : 'pending';
    const stateText = state === 'done' ? 'Done' : state === 'current' ? 'Current' : 'Next';
    return `<li><span class="step-num">0${index + 1}</span><div><div class="step-title">${escapeHtml(name)}</div><div class="step-detail">${escapeHtml(details[index])}</div></div><span class="step-state ${state}">${stateText}</span></li>`;
  }).join('');
  const copy = [
    ['Validate input', 'Check the required fields before work is assigned.'],
    ['Assign owner', 'Give one responsible role and a target date to the task.'],
    ['Record result', 'Close the demo task with an explicit status.'],
    ['Completed', 'This simulated workflow is closed. Reset to try another case.'],
  ][record.stage];
  document.querySelector('#next-action').innerHTML = `<strong>Next action: ${copy[0]}</strong>${copy[1]}`;
  advance.textContent = record.stage === 3 ? 'Workflow complete' : copy[0] + ' →';
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
    error.textContent = 'Choose a workflow, enter a role (3+ characters), target date and context (10+ characters).';
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
    saveStatus.textContent = 'Local only · no server';
  } catch {
    saveStatus.textContent = 'Could not clear browser storage · clear site data in browser settings';
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
if (record) saveStatus.textContent = 'Restored from this browser';
render();
