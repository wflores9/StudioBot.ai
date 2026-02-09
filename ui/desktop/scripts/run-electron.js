const waitOn = require('wait-on');
const { spawn } = require('child_process');
const path = require('path');

const url = process.env.ELECTRON_START_URL || 'http://localhost:3001';

console.log(`Waiting for ${url}...`);

waitOn({ resources: [url], timeout: 120000 }, (err) => {
  if (err) {
    console.error('Timeout waiting for web server:', err.message || err);
    process.exit(1);
  }

  const electronBin = path.join(__dirname, '..', 'node_modules', '.bin', process.platform === 'win32' ? 'electron.cmd' : 'electron');
  console.log('Starting Electron using', electronBin);

  let child;
  if (process.platform === 'win32') {
    // Use cmd.exe to run the .cmd wrapper on Windows to avoid spawn EINVAL
    child = spawn(process.env.comspec || 'cmd.exe', ['/c', electronBin, '.'], {
      stdio: 'inherit',
      env: Object.assign({}, process.env, { ELECTRON_START_URL: url }),
    });
  } else {
    child = spawn(electronBin, ['.'], {
      stdio: 'inherit',
      env: Object.assign({}, process.env, { ELECTRON_START_URL: url }),
    });
  }

  child.on('close', (code) => process.exit(code));
});
