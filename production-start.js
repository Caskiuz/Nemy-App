#!/usr/bin/env node
const { execSync, spawn } = require('child_process');
const path = require('path');

const configPath = path.join(__dirname, 'ecosystem.config.json');

console.log('Starting NEMY API with pm2-runtime...');

const pm2 = spawn('npx', ['pm2-runtime', 'start', configPath], {
  stdio: 'inherit',
  cwd: __dirname,
  env: { 
    ...process.env, 
    NODE_ENV: 'production', 
    PORT: '5000' 
  }
});

pm2.on('error', (err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});

pm2.on('close', (code) => {
  console.log('PM2 exited with code:', code);
  process.exit(code || 0);
});

process.on('SIGTERM', () => {
  pm2.kill('SIGTERM');
});

process.on('SIGINT', () => {
  pm2.kill('SIGINT');
});
