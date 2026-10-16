#!/usr/bin/env node
const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const userArgs = process.argv.slice(2);

// Global flags registered on the root zalo-agent program that can precede either
// a CLI subcommand (`zalo-mcp --data-dir /mnt/db login`) or MCP server flags.
const GLOBAL_VALUE_FLAGS = new Set([
  '--config-dir',
  '--credentials-dir',
  '--data-dir',
  '--media-dir',
  '--oa-dir',
]);

function findFirstCommandOrFlag(argv) {
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token === '--json') continue;
    if (GLOBAL_VALUE_FLAGS.has(token)) {
      i++; // skip the directory value
      continue;
    }
    if ([...GLOBAL_VALUE_FLAGS].some(f => token.startsWith(`${f}=`))) {
      continue;
    }
    return token;
  }
  return undefined;
}

// Determine whether invocation is MCP server mode (no args or only MCP server flags)
// vs. CLI pass-through mode (subcommands like `login`, `msg`, `oa`, `listen`, `mcp`,
// or top-level help/version flags).
const firstArg = findFirstCommandOrFlag(userArgs);
const isMcpServerMode = !firstArg || (
  firstArg.startsWith('-') &&
  !['-h', '--help', '-V', '--version'].includes(firstArg)
);

// Validate --account before dependency installation or authentication in MCP server mode.
// IDs stay strings: Zalo UIDs can exceed Number.MAX_SAFE_INTEGER. Never fall back to active.
let accountId;
if (isMcpServerMode) {
  const accountArgs = userArgs.filter(arg => arg === '--account' || arg.startsWith('--account='));
  if (accountArgs.length) {
    const option = accountArgs[0];
    accountId = option === '--account'
      ? userArgs[userArgs.indexOf('--account') + 1]
      : option.slice('--account='.length);
    if (accountArgs.length !== 1 || !/^[1-9][0-9]*$/.test(accountId || '')) {
      console.error('--account requires one full numeric account ID (not a name or alias).');
      process.exit(1);
    }
  }
}

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

// Resolve the zalo-agent CLI entry point (supports local node_modules or hoisted global install)
const isWin = process.platform === 'win32';
function resolveEnginePkgPath() {
  const localPkgPath = path.join(__dirname, 'node_modules', '@ardennguyen', 'zalo-agent-cli', 'package.json');
  const localBinCheck = isWin
    ? path.join(__dirname, 'node_modules', '.bin', 'zalo-agent.cmd')
    : path.join(__dirname, 'node_modules', '.bin', 'zalo-agent');
  if (fs.existsSync(localPkgPath) && fs.existsSync(localBinCheck)) {
    return localPkgPath;
  }
  try {
    return require.resolve('@ardennguyen/zalo-agent-cli/package.json', { paths: [__dirname] });
  } catch {
    return null;
  }
}

let cliPkgPath = resolveEnginePkgPath();

// Auto-install dependencies if the CLI package is missing in a local deployment folder
if (!cliPkgPath) {
  console.error('zalo-agent-cli not found. Running npm install...');
  try {
    const npmCmd = isWin ? 'npm.cmd' : 'npm';
    execSync(`${npmCmd} install`, { cwd: __dirname, stdio: 'inherit' });
    console.error('Dependencies installed successfully.');
    cliPkgPath = resolveEnginePkgPath();
  } catch (err) {
    console.error('Failed to install dependencies:', err.message);
    process.exit(1);
  }
}

if (!cliPkgPath || !fs.existsSync(cliPkgPath)) {
  console.error('Failed to locate @ardennguyen/zalo-agent-cli package.json.');
  process.exit(1);
}

// Resolve the actual JS entry point from the CLI package's bin field
const cliDir = path.dirname(cliPkgPath);
const cliPkg = JSON.parse(fs.readFileSync(cliPkgPath, 'utf8'));
const cliBinRelative = typeof cliPkg.bin === 'string' ? cliPkg.bin : cliPkg.bin['zalo-agent'];
const cliEntryPoint = path.join(cliDir, cliBinRelative);

// CLI pass-through mode: forward all commands and arguments directly to zalo-agent-cli
if (!isMcpServerMode) {
  const child = spawn(process.execPath, [cliEntryPoint, ...userArgs], {
    stdio: 'inherit',
    env: process.env
  });

  child.on('error', (err) => {
    console.error('Failed to start Zalo CLI process:', err);
    process.exit(1);
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 0);
  });
  return;
}

// MCP Server mode: build arguments for `zalo-agent mcp start`
const args = [cliEntryPoint, 'mcp', 'start'];
if (accountId !== undefined) args.push('--account', accountId);

for (let i = 0; i < userArgs.length; i++) {
  const arg = userArgs[i];

  // Handled above via validated accountId
  if (arg === '--account') {
    i++;
    continue;
  }
  if (arg.startsWith('--account=')) {
    continue;
  }

  // HTTP transport mode with optional port or ZALO_MCP_HTTP_PORT / 3847 fallback
  if (arg === '--http') {
    args.push('--http');
    const nextArg = userArgs[i + 1];
    if (nextArg && !nextArg.startsWith('-')) {
      args.push(nextArg);
      i++;
    } else {
      args.push(process.env.ZALO_MCP_HTTP_PORT || '3847');
    }
    continue;
  }
  if (arg.startsWith('--http=')) {
    const val = arg.slice('--http='.length);
    args.push('--http', val || process.env.ZALO_MCP_HTTP_PORT || '3847');
    continue;
  }

  // Forward authorization token for HTTP mode
  if (arg === '--auth') {
    args.push('--auth');
    const nextArg = userArgs[i + 1];
    if (nextArg && !nextArg.startsWith('-')) {
      args.push(nextArg);
      i++;
    }
    continue;
  }

  // Forward any other mcp start flags (e.g. --config, --host, --no-delivered-receipts, --no-self-heal)
  args.push(arg);
}

// Never log the bearer token: it would end up in the systemd journal / client logs
const loggedArgs = args.map((arg, i) => {
  if (args[i - 1] === '--auth') return '***';
  if (arg.startsWith('--auth=')) return '--auth=***';
  return arg;
});
console.error(`Starting Zalo MCP Server via: node ${loggedArgs.join(' ')}`);

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
