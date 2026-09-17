const { spawn, execSync } = require('child_process');
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

// Resolve the zalo-agent CLI entry point directly (avoids .cmd shell issues on Windows)
const isWin = process.platform === 'win32';
const cliDir = path.join(__dirname, 'node_modules', '@ardennguyen', 'zalo-agent-cli');
const cliBinCheck = isWin
  ? path.join(__dirname, 'node_modules', '.bin', 'zalo-agent.cmd')
  : path.join(__dirname, 'node_modules', '.bin', 'zalo-agent');

// Auto-install dependencies if the CLI binary is missing
if (!fs.existsSync(cliBinCheck)) {
  console.error('zalo-agent-cli not found. Running npm install...');
  try {
    const npmCmd = isWin ? 'npm.cmd' : 'npm';
    execSync(`${npmCmd} install`, { cwd: __dirname, stdio: 'inherit' });
    console.error('Dependencies installed successfully.');
  } catch (err) {
    console.error('Failed to install dependencies:', err.message);
    process.exit(1);
  }
}

// Resolve the actual JS entry point from the CLI package's bin field
const cliPkg = require(path.join(cliDir, 'package.json'));
const cliBinRelative = cliPkg.bin['zalo-agent'];
const cliEntryPoint = path.join(cliDir, cliBinRelative);

// Prepare arguments for the Zalo agent CLI
const args = [cliEntryPoint, 'mcp', 'start'];

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

console.error(`Starting Zalo MCP Server via: node ${args.join(' ')}`);

// Spawn the zalo-agent CLI in mcp mode using node directly (cross-platform)
const child = spawn(process.execPath, args, {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: process.env
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
