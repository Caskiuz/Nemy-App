const { spawn } = require('child_process');
const path = require('path');

const configPath = path.join(__dirname, 'ecosystem.config.json');
const pm2 = spawn('npx', ['pm2-runtime', 'start', configPath], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'production', PORT: '5000' }
});

pm2.on('error', (err) => {
  console.error('Failed to start PM2:', err);
  process.exit(1);
});

pm2.on('close', (code) => {
  process.exit(code || 0);
});
