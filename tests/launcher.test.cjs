const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, mkdirSync, copyFileSync, cpSync, writeFileSync, rmSync, readFileSync, chmodSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

// Run the real launcher against a disposable engine. No packages, credentials,
// Zalo connection, or user config are needed or read. `dotEnv` is written as the
// install folder's .env; `env` replaces the environment the launcher starts with;
// `dotenv: true` puts the real dotenv package beside it, as an install has it.
function run(args, engine = true, source = 'console.log(JSON.stringify(process.argv.slice(2)));', opts = {}) {
  const dir = mkdtempSync(path.join(tmpdir(), 'zalo-wrapper-test-'));
  try {
    copyFileSync(path.join(__dirname, '..', 'mcp-server.js'), path.join(dir, 'mcp-server.js'));
    if (opts.dotEnv !== undefined) writeFileSync(path.join(dir, '.env'), opts.dotEnv);
    if (opts.dotenv) {
      cpSync(path.dirname(require.resolve('dotenv/package.json')), path.join(dir, 'node_modules', 'dotenv'), {
        recursive: true,
      });
    }
    if (engine) {
      const cli = path.join(dir, 'node_modules', '@ardennguyen', 'zalo-agent-cli');
      const bin = path.join(dir, 'node_modules', '.bin');
      mkdirSync(cli, { recursive: true });
      mkdirSync(bin, { recursive: true });
      writeFileSync(path.join(bin, process.platform === 'win32' ? 'zalo-agent.cmd' : 'zalo-agent'), '');
      writeFileSync(path.join(cli, 'package.json'), JSON.stringify({ bin: { 'zalo-agent': 'engine.cjs' } }));
      writeFileSync(path.join(cli, 'engine.cjs'), source);
    }
    return spawnSync(process.execPath, [path.join(dir, 'mcp-server.js'), ...args], {
      encoding: 'utf8', timeout: 10000, windowsHide: true, ...(opts.env && { env: opts.env }),
    });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

for (const args of [['--account', '1234567890123456789'], ['--account=1234567890123456789']]) {
  test(`forwards exact string ID with ${args[0]}`, () => {
    const result = run(args);
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(JSON.parse(result.stdout), ['mcp', 'start', '--account', '1234567890123456789']);
  });
}

test('omitting account preserves engine default', () => {
  const result = run([]);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), ['mcp', 'start']);
});

test('account composes with HTTP and masked authorization', () => {
  const result = run(['--http', '4567', '--auth', 'test-token', '--account', '101']);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), ['mcp', 'start', '--account', '101', '--http', '4567', '--auth', 'test-token']);
  assert.ok(!result.stderr.includes('test-token'));
});

test('forwards additional mcp start and global storage flags (--host, --config, --data-dir, --media-dir, --no-self-heal)', () => {
  const result = run([
    '--http',
    '--host', '0.0.0.0',
    '--config', '/tmp/mcp.json',
    '--config-dir', '/etc/zalo',
    '--credentials-dir', '/etc/zalo-creds',
    '--data-dir', '/var/lib/zalo',
    '--media-dir', '/mnt/media',
    '--oa-dir', '/etc/zalo-oa',
    '--no-self-heal',
  ]);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(
    JSON.parse(result.stdout),
    [
      'mcp', 'start',
      '--http', '3847',
      '--host', '0.0.0.0',
      '--config', '/tmp/mcp.json',
      '--config-dir', '/etc/zalo',
      '--credentials-dir', '/etc/zalo-creds',
      '--data-dir', '/var/lib/zalo',
      '--media-dir', '/mnt/media',
      '--oa-dir', '/etc/zalo-oa',
      '--no-self-heal',
    ]
  );
});

for (const args of [
  ['login'],
  ['--data-dir', '/mnt/db', '--credentials-dir', '/mnt/creds', 'login'],
  ['--config-dir=/etc/zalo', '--json', 'account', 'list'],
  ['--account', '101', 'msg', 'list', '--json'],
  ['--account=202', 'status'],
  ['msg', 'list', '--json'],
  ['oa', 'init', '--app-id', '123', '--secret', 'abc'],
  ['oa', 'refresh'],
  ['listen', '--account', '101'],
  ['mcp', 'start', '--http', '3847'],
  ['bank', 'accounts', '-l', '5'],
  ['mcp', 'wait', '--timeout', '30'],
  ['group', 'leave', '123', '-s'],
  ['friend', 'qr', '101', '202'],
  ['listen', '--events', 'message,typing,upload'],
  ['--help'],
  ['-h'],
  ['--version'],
  ['-V'],
]) {
  test(`passes CLI commands and flags through verbatim: ${JSON.stringify(args)}`, () => {
    const result = run(args);
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(JSON.parse(result.stdout), args);
  });
}

for (const args of [
  ['--account'], ['--account='], ['--account', '--http'], ['--account', 'alias'],
  ['--account', '0'], ['--account', '-1'], ['--account', '01'], ['--account', '1.5'],
  ['--account', '1e3'], ['--account', '101', '--account=202'],
]) {
  test(`refuses invalid account before install: ${JSON.stringify(args)}`, () => {
    const result = run(args, false);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /full numeric account ID/);
    assert.doesNotMatch(result.stderr, /Running npm install|Starting Zalo/);
    assert.equal(result.stdout, '');
  });
}

test('an engine rejecting the flag fails rather than retrying without it', () => {
  const result = run(['--account', '101'], true, "console.error('unknown option --account'); process.exit(1);");
  assert.equal(result.status, 1);
  assert.match(result.stderr, /unknown option --account/);
  assert.equal(result.stdout, '');
});

// The engine takes more secrets on the command line than the bearer token: the OAuth client secret
// and, since 2.5.3, the webhook signing secret. The launcher logs the command it starts to stderr
// (client logs, systemd journal), so none of them may appear there; the engine still gets them.
for (const [flag, value] of [
  ['--auth', 'tok-123'],
  ['--client-secret', 'cs-456'],
  ['--webhook-secret', 'wh-789'],
  ['--webhook', 'https://crm.example.com/hooks/tok-321'],
]) {
  for (const spelling of ['separate', 'equals']) {
    test(`never logs the value of ${flag} (${spelling}) but still forwards it`, () => {
      const args = spelling === 'separate' ? ['--http', '4567', flag, value] : ['--http', '4567', `${flag}=${value}`];
      const result = run(args);
      assert.equal(result.status, 0, result.stderr);
      assert.ok(!result.stderr.includes(value), `${flag} value leaked into stderr: ${result.stderr}`);
      assert.match(result.stderr, /Starting Zalo MCP Server via/);
      const forwarded = JSON.parse(result.stdout);
      assert.ok(spelling === 'separate' ? forwarded.includes(value) : forwarded.includes(`${flag}=${value}`));
    });
  }
}

test('requires engine 3.0.0 or newer, and installs nothing older', () => {
  const pkg = require('../package.json');
  assert.equal(pkg.dependencies['@ardennguyen/zalo-agent-cli'], '^3.0.0');
  // ^3.0.0 is >=3.0.0 <4.0.0: 3.0.0 itself is allowed, 2.x is not (its MCP contract differs).
  const [maj, min] = pkg.dependencies['@ardennguyen/zalo-agent-cli'].slice(1).split('.').map(Number);
  assert.deepEqual([maj, min], [3, 0]);
});

// The README promises stdio by default; the install writes ZALO_MCP_HTTP_PORT into the folder's .env as the port
// `--http` uses without one. Handed on, the engine read it as "serve HTTP", so a stdio client config got an HTTP server.
const ENGINE_ENV = "console.log(JSON.stringify({ argv: process.argv.slice(2), port: process.env.ZALO_MCP_HTTP_PORT ?? null, mine: process.env.MINE ?? null }));";
const baseEnv = () => {
  const env = { ...process.env };
  for (const k of Object.keys(env)) if (k.startsWith('ZALO_MCP_HTTP_PORT') || k === 'MINE') delete env[k];
  return env;
};

for (const dotenv of [false, true]) {
  test(`no arguments serves stdio although the folder's .env names an HTTP port (${dotenv ? 'dotenv' : 'built-in reader'})`, () => {
    const result = run([], true, ENGINE_ENV, { dotEnv: 'ZALO_MCP_HTTP_PORT=3999\nZALO_MCP_HTTP_PORT_101=4000\n', env: baseEnv(), dotenv });
    assert.equal(result.status, 0, result.stderr);
    // stdout is the JSON-RPC channel: only the engine's own output may reach it (dotenv 17 logs unless quiet).
    assert.deepEqual(JSON.parse(result.stdout), { argv: ['mcp', 'start'], port: null, mine: null });
  });
}

test("--http without a port takes the .env port", () => {
  const result = run(['--http'], true, ENGINE_ENV, { dotEnv: 'ZALO_MCP_HTTP_PORT=3999\n', env: baseEnv() });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout).argv, ['mcp', 'start', '--http', '3999']);
});

test('a port set in the real environment keeps the engine meaning, and wins over the .env', () => {
  const env = { ...baseEnv(), ZALO_MCP_HTTP_PORT: '4001', MINE: 'shell' };
  const result = run([], true, ENGINE_ENV, { dotEnv: 'ZALO_MCP_HTTP_PORT=3999\nMINE=file\n', env });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), { argv: ['mcp', 'start'], port: '4001', mine: 'shell' });
});

// The pin: npm installs a published package's dependencies by its npm-shrinkwrap.json (package-lock.json is never
// published), and the install and update scripts run `npm ci` on it, so every install serves the engine pinned here.
test('the engine pin ships in the package and satisfies the range', () => {
  const pkg = require('../package.json');
  const wrap = JSON.parse(readFileSync(path.join(__dirname, '..', 'npm-shrinkwrap.json'), 'utf8'));
  const pinned = wrap.packages['node_modules/@ardennguyen/zalo-agent-cli'].version;
  assert.match(pinned, /^3\.\d+\.\d+$/, 'an exact engine 3.x version');
  assert.equal(wrap.packages[''].dependencies['@ardennguyen/zalo-agent-cli'], pkg.dependencies['@ardennguyen/zalo-agent-cli']);
  const packed = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], {
    cwd: path.join(__dirname, '..'), encoding: 'utf8', timeout: 60000, shell: process.platform === 'win32',
  });
  assert.equal(packed.status, 0, packed.stderr);
  const files = JSON.parse(packed.stdout)[0].files.map((f) => f.path);
  assert.ok(files.includes('npm-shrinkwrap.json'), `not in the package: ${files.join(', ')}`);
});

test('update installs the pinned engine (npm ci), never the newest one', { skip: process.platform === 'win32' }, () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'zalo-wrapper-update-'));
  try {
    for (const f of ['zalo-mcp.sh', 'package.json', 'npm-shrinkwrap.json', '.env.example']) {
      copyFileSync(path.join(__dirname, '..', f), path.join(dir, f));
    }
    // A stand-in npm on PATH that records each call and succeeds.
    const bin = path.join(dir, 'bin');
    mkdirSync(bin);
    writeFileSync(path.join(bin, 'npm'), '#!/bin/sh\necho "$*" >> "$NPM_LOG"\nexit 0\n');
    chmodSync(path.join(bin, 'npm'), 0o755);
    const log = path.join(dir, 'npm.log');
    const result = spawnSync('bash', ['zalo-mcp.sh', 'update'], {
      cwd: dir, encoding: 'utf8', timeout: 30000,
      env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, NPM_LOG: log },
    });
    assert.equal(result.status, 0, result.stdout + result.stderr);
    const calls = readFileSync(log, 'utf8').trim().split('\n');
    assert.ok(calls.some((c) => c.startsWith('ci')), `no npm ci: ${calls.join(' | ')}`);
    assert.ok(!calls.some((c) => c.includes('zalo-agent-cli@latest')), `installed the newest engine: ${calls.join(' | ')}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
