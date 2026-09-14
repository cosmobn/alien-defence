const messageNode = document.getElementById('authMessage');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

async function submitAuth(path, form) {
  messageNode.textContent = 'Checking credentials...';
  messageNode.className = 'form-message';
  const payload = Object.fromEntries(new FormData(form).entries());
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Authentication failed.');
  }
  window.location.href = 'index.html';
}

async function wireAuth() {
  const me = await fetch('/api/player/me').then(response => response.json()).catch(() => ({ player: null }));
  if (me.player) {
    window.location.href = 'index.html';
    return;
  }

  const form = loginForm || signupForm;
  const path = loginForm ? '/api/player/login' : '/api/player/signup';
  form.addEventListener('submit', async event => {
    event.preventDefault();
    try {
      await submitAuth(path, form);
    } catch (error) {
      messageNode.textContent = error.message;
      messageNode.className = 'form-message error';
    }
  });
}

wireAuth();
