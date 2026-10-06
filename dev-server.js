const { spawn } = require('child_process');
const path = require('path');

const nextBin = path.resolve(__dirname, 'node_modules/next/dist/bin/next');

console.log('[DevServer] Starting Next.js on http://0.0.0.0:3000 ...');

const child = spawn(process.execPath, [nextBin, 'dev', '-p', '3000', '-H', '0.0.0.0'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: '3000',
    HOSTNAME: '0.0.0.0',
  },
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});

process.on('SIGINT', () => child.kill('SIGINT'));
process.on('SIGTERM', () => child.kill('SIGTERM'));
