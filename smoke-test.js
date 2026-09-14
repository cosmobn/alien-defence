const { spawn } = require('child_process');

const PORT = process.env.PORT || 3100;
const baseUrl = `http://127.0.0.1:${PORT}`;
const server = spawn(process.execPath, ['server.js'], {
  env: { ...process.env, PORT },
  stdio: ['ignore', 'pipe', 'pipe']
});

let output = '';
server.stdout.on('data', data => {
  output += data.toString();
});
server.stderr.on('data', data => {
  output += data.toString();
});

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function request(path) {
  const response = await fetch(`${baseUrl}${path}`);
  return { path, status: response.status, text: await response.text() };
}

async function run() {
  await wait(1200);
  const pages = [
    '/', '/index.html', '/admin-login.html', '/admin-signup.html', '/admin.html',
    '/player-login.html', '/player-signup.html',
    '/style.css', '/admin.css', '/game.js', '/admin.js', '/player-auth.js'
  ];
  const results = [];
  for (const page of pages) {
    results.push(await request(page));
  }
  const health = await request('/api/health');
  const failed = results.filter(result => result.status !== 200);
  const missingMarkers = [
    ['/', 'Alien Signal Defense'],
    ['/admin-login.html', 'Admin Login'],
    ['/admin-signup.html', 'Admin Signup'],
    ['/admin.html', 'Admin Console'],
    ['/player-login.html', 'Commander Login'],
    ['/player-signup.html', 'Create Account']
  ].filter(([path, marker]) => {
    const result = results.find(item => item.path === path);
    return !result || !result.text.includes(marker);
  });

  console.log('Smoke pages:', results.map(result => `${result.path} ${result.status}`).join(', '));
  console.log(`Health: ${health.status} ${health.text.slice(0, 180)}`);

  if (failed.length || missingMarkers.length) {
    console.error('Smoke test failed.');
    process.exitCode = 1;
  }
}

run()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    server.kill();
    await wait(200);
    if (process.exitCode) console.error(output);
  });
