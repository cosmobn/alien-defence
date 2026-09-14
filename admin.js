const state = {
  tables: {},
  currentTable: null,
  currentConfig: null,
  rows: [],
  editingRow: null,
  page: 1,
  limit: 50,
  total: 0,
  deletePending: false
};

const nodes = {
  tableNav: document.getElementById('tableNav'),
  tableTitle: document.getElementById('tableTitle'),
  adminIdentity: document.getElementById('adminIdentity'),
  logoutButton: document.getElementById('logoutButton'),
  searchInput: document.getElementById('searchInput'),
  refreshButton: document.getElementById('refreshButton'),
  createButton: document.getElementById('createButton'),
  rowCount: document.getElementById('rowCount'),
  activeTable: document.getElementById('activeTable'),
  dbStatus: document.getElementById('dbStatus'),
  dataHead: document.getElementById('dataHead'),
  dataBody: document.getElementById('dataBody'),
  emptyState: document.getElementById('emptyState'),
  dialog: document.getElementById('recordDialog'),
  recordForm: document.getElementById('recordForm'),
  dialogTitle: document.getElementById('dialogTitle'),
  formFields: document.getElementById('formFields'),
  formMessage: document.getElementById('formMessage'),
  overviewGrid: document.getElementById('overviewGrid'),
  previousPageButton: document.getElementById('previousPageButton'),
  nextPageButton: document.getElementById('nextPageButton'),
  pageStatus: document.getElementById('pageStatus')
};

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) window.location.href = 'admin-login.html';
    throw new Error(data.error || 'Request failed.');
  }
  return data;
}

async function init() {
  const me = await api('/api/auth/me');
  if (!me.admin) {
    window.location.href = 'admin-login.html';
    return;
  }
  nodes.adminIdentity.textContent = `${me.admin.username} (${me.admin.role})`;

  const [tablesResponse] = await Promise.all([
    api('/api/tables'),
    checkHealth(),
    loadOverview()
  ]);
  state.tables = tablesResponse.tables;
  state.currentTable = Object.keys(state.tables)[0];
  renderNavigation();
  bindEvents();
  await loadTable(state.currentTable);
  if (window.lucide) window.lucide.createIcons();
}

async function checkHealth() {
  try {
    const health = await api('/api/health');
    nodes.dbStatus.textContent = health.database ? 'Online' : 'Offline';
  } catch (error) {
    nodes.dbStatus.textContent = 'Offline';
  }
}

function bindEvents() {
  nodes.searchInput.addEventListener('input', () => {
    state.page = 1;
    loadTable(state.currentTable);
  });
  nodes.refreshButton.addEventListener('click', () => loadTable(state.currentTable));
  nodes.previousPageButton.addEventListener('click', () => {
    if (state.page > 1) loadTable(state.currentTable, state.page - 1);
  });
  nodes.nextPageButton.addEventListener('click', () => {
    if (state.page * state.limit < state.total) loadTable(state.currentTable, state.page + 1);
  });
  nodes.createButton.addEventListener('click', () => openRecordDialog());
  nodes.logoutButton.addEventListener('click', async () => {
    await api('/api/auth/logout', { method: 'POST' });
    window.location.href = 'admin-login.html';
  });
  nodes.recordForm.addEventListener('submit', saveRecord);
  document.querySelectorAll('[data-close-dialog]').forEach(button => {
    button.addEventListener('click', () => nodes.dialog.close());
  });
}

function renderNavigation() {
  nodes.tableNav.replaceChildren(...Object.entries(state.tables).map(([key, config]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = key === state.currentTable ? 'active' : '';
    button.innerHTML = `<i data-lucide="${iconForTable(key)}"></i><span>${config.label}</span>`;
    button.addEventListener('click', () => loadTable(key));
    return button;
  }));
}

function iconForTable(table) {
  return {
    players: 'users',
    game_sessions: 'activity',
    wave_results: 'radio-tower',
    upgrades: 'wrench',
    purchased_upgrades: 'shopping-bag',
    admin_users: 'shield-check'
  }[table] || 'database';
}

async function loadTable(table, page = 1) {
  state.currentTable = table;
  state.currentConfig = state.tables[table];
  state.rows = [];
  state.page = page;
  nodes.tableTitle.textContent = state.currentConfig.label;
  nodes.activeTable.textContent = table;
  nodes.createButton.disabled = !state.currentConfig.writable.length;
  renderNavigation();
  renderShell();
  const search = encodeURIComponent(nodes.searchInput.value.trim());
  const response = await api(`/api/tables/${table}?page=${page}&limit=${state.limit}&search=${search}`);
  state.rows = response.rows;
  state.total = response.total;
  updatePagination();
  renderRows();
  if (window.lucide) window.lucide.createIcons();
}

async function loadOverview() {
  try {
    const response = await api('/api/admin/overview');
    const labels = {
      players: 'Total Players',
      active_players: 'Active Players',
      completed_games: 'Completed Games',
      highest_score: 'Highest Score',
      admin_actions: 'Admin Actions'
    };
    nodes.overviewGrid.replaceChildren(...Object.entries(labels).map(([key, label]) => {
      const card = document.createElement('article');
      const title = document.createElement('span');
      title.textContent = label;
      const value = document.createElement('strong');
      value.textContent = Number(response.overview[key]).toLocaleString();
      card.append(title, value);
      return card;
    }));
  } catch (error) {
    nodes.overviewGrid.textContent = error.message;
  }
}

function updatePagination() {
  const pageCount = Math.max(1, Math.ceil(state.total / state.limit));
  nodes.pageStatus.textContent = `Page ${state.page} of ${pageCount}`;
  nodes.previousPageButton.disabled = state.page <= 1;
  nodes.nextPageButton.disabled = state.page >= pageCount;
}

function renderShell() {
  const headers = state.currentConfig.writable.length
    ? [...state.currentConfig.columns, 'actions']
    : state.currentConfig.columns;
  const headerRow = document.createElement('tr');
  headerRow.replaceChildren(...headers.map(column => {
    const th = document.createElement('th');
    th.textContent = column === 'actions' ? '' : labelize(column);
    return th;
  }));
  nodes.dataHead.replaceChildren(headerRow);
  nodes.dataBody.replaceChildren();
  nodes.emptyState.hidden = true;
}

function renderRows() {
  const query = nodes.searchInput.value.trim().toLowerCase();
  const rows = state.rows.filter(row => {
    if (!query) return true;
    return Object.values(row).some(value => String(value ?? '').toLowerCase().includes(query));
  });

  nodes.rowCount.textContent = rows.length;
  nodes.emptyState.hidden = rows.length > 0;
  nodes.dataBody.replaceChildren(...rows.map(row => {
    const tr = document.createElement('tr');
    const cells = state.currentConfig.columns.map(column => {
      const td = document.createElement('td');
      td.textContent = formatValue(row[column]);
      return td;
    });
    if (state.currentConfig.writable.length) {
      const actionCell = document.createElement('td');
      actionCell.className = 'row-actions';
      actionCell.append(editButton(row), deleteButton(row));
      tr.replaceChildren(...cells, actionCell);
    } else {
      tr.replaceChildren(...cells);
    }
    return tr;
  }));
  if (window.lucide) window.lucide.createIcons();
}

function editButton(row) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'icon-button small';
  button.title = 'Edit';
  button.setAttribute('aria-label', 'Edit record');
  button.innerHTML = '<i data-lucide="pencil"></i>';
  button.addEventListener('click', () => openRecordDialog(row));
  return button;
}

function deleteButton(row) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'icon-button small danger';
  button.title = 'Delete';
  button.setAttribute('aria-label', 'Delete record');
  button.innerHTML = '<i data-lucide="trash-2"></i>';
  button.addEventListener('click', () => deleteRecord(row));
  return button;
}

function openRecordDialog(row = null) {
  state.editingRow = row;
  nodes.dialogTitle.textContent = row ? 'Edit Record' : 'New Record';
  nodes.formMessage.textContent = '';
  nodes.formMessage.className = 'form-message';
  nodes.formFields.replaceChildren(...state.currentConfig.writable.map(column => buildField(column, row)));
  nodes.dialog.showModal();
}

function buildField(column, row) {
  const type = state.currentConfig.types[column] || 'text';
  const label = document.createElement('label');
  const span = document.createElement('span');
  span.textContent = labelize(column);

  let input;
  if (type === 'textarea') {
    input = document.createElement('textarea');
    input.rows = 4;
  } else if (type === 'select') {
    input = document.createElement('select');
    (state.currentConfig.options[column] || []).forEach(value => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      input.append(option);
    });
  } else {
    input = document.createElement('input');
    input.type = type;
  }

  input.name = column;
  if ((state.currentConfig.required || []).includes(column)) input.required = true;
  if (type === 'number') input.step = '1';
  if (type === 'checkbox') input.checked = Boolean(row ? row[column] : false);
  else input.value = row ? valueForInput(row[column], type) : '';

  label.append(span, input);
  return label;
}

async function saveRecord(event) {
  event.preventDefault();
  const payload = {};
  const formData = new FormData(nodes.recordForm);
  for (const column of state.currentConfig.writable) {
    const type = state.currentConfig.types[column];
    payload[column] = type === 'checkbox'
      ? nodes.recordForm.elements[column].checked
      : formData.get(column);
  }

  const pk = state.currentConfig.primaryKey;
  const path = state.editingRow
    ? `/api/tables/${state.currentTable}/${state.editingRow[pk]}`
    : `/api/tables/${state.currentTable}`;
  const method = state.editingRow ? 'PUT' : 'POST';

  try {
    await api(path, { method, body: JSON.stringify(payload) });
    nodes.dialog.close();
    await loadTable(state.currentTable);
  } catch (error) {
    nodes.formMessage.textContent = error.message;
    nodes.formMessage.className = 'form-message error';
  }
}

async function deleteRecord(row) {
  if (state.deletePending) return;
  const pk = state.currentConfig.primaryKey;
  const confirmed = window.confirm(`Delete ${state.currentTable} #${row[pk]}? This may permanently remove data.`);
  if (!confirmed) return;
  if (['players', 'game_sessions', 'admin_users'].includes(state.currentTable) &&
      window.prompt('Type DELETE to confirm this destructive action.') !== 'DELETE') return;
  state.deletePending = true;
  try {
    await api(`/api/tables/${state.currentTable}/${row[pk]}`, { method: 'DELETE' });
    await loadTable(state.currentTable, state.page);
  } catch (error) {
    window.alert(error.message);
  } finally {
    state.deletePending = false;
  }
}

function labelize(value) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}

function formatValue(value) {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return new Date(value).toLocaleString();
  }
  return String(value);
}

function valueForInput(value, type) {
  if (!value) return '';
  if (type === 'datetime-local') {
    const date = new Date(value);
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  }
  return value;
}

init().catch(error => {
  console.error(error);
  if (error.message.includes('Admin login')) window.location.href = 'admin-login.html';
});
