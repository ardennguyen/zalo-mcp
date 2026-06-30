const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Load environment variables from local .env if it exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  try {
    require('dotenv').config({ path: envPath });
  } catch (err) {
    console.error('dotenv not found, loading environment variables manually...');
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const parts = trimmed.split('=');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
          process.env[key] = val;
        }
      }
    });
  }
}

// In Windows, we run npx.cmd; on Unix/macOS, we run npx
const isWin = process.platform === 'win32';
const npxCmd = isWin ? 'npx.cmd' : 'npx';

// Prepare base arguments for the Zalo agent CLI
const args = ['zalo-agent', 'mcp', 'start'];

// Check if user requested HTTP transport mode via arguments
const httpIndex = process.argv.indexOf('--http');
if (httpIndex !== -1) {
  args.push('--http');
  // Check if a specific port number is provided immediately after --http
  const nextArg = process.argv[httpIndex + 1];
  if (nextArg && !nextArg.startsWith('-')) {
    args.push(nextArg);
  } else {
    // Fallback to ZALO_MCP_HTTP_PORT in env, or default to 3847
    args.push(process.env.ZALO_MCP_HTTP_PORT || '3847');
  }
}

// Forward any authorization token arguments for HTTP mode
const authIndex = process.argv.indexOf('--auth');
if (authIndex !== -1) {
  args.push('--auth');
  const nextArg = process.argv[authIndex + 1];
  if (nextArg && !nextArg.startsWith('-')) {
    args.push(nextArg);
  }
}

console.error(`Starting Zalo MCP Server via: npx ${args.join(' ')}`);

// Spawn the zalo-agent CLI in mcp mode
const child = spawn(npxCmd, args, {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: process.env,
  shell: true
});

// Pipe parent stdin to child stdin
process.stdin.pipe(child.stdin);

// Pipe child stdout to parent stdout
child.stdout.pipe(process.stdout);

// Pipe child stderr to parent stderr (for logging/debugging in the client)
child.stderr.pipe(process.stderr);

child.on('error', (err) => {
  console.error('Failed to start Zalo MCP child process:', err);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  console.error(`Zalo MCP Server process exited with code ${code} and signal ${signal}`);
  process.exit(code || 0);
});
