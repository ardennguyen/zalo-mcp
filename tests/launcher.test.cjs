const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

// Run the real launcher against a disposable engine. No packages, credentials,
// Zalo connection, or user config are needed or read.
function run(args, engine = true, source = 'console.log(JSON.stringify(process.argv.slice(2)));') {
  const dir = mkdtempSync(path.join(tmpdir(), 'zalo-wrapper-test-'));
  try {
    copyFileSync(path.join(__dirname, '..', 'mcp-server.js'), path.join(dir, 'mcp-server.js'));
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
      encoding: 'utf8', timeout: 10000, windowsHide: true,
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

test('requires engine 2.5.0 or newer, and installs nothing older', () => {
  const pkg = require('../package.json');
  assert.equal(pkg.dependencies['@ardennguyen/zalo-agent-cli'], '^2.5.0');
  // ^2.5.0 is >=2.5.0 <3.0.0: 2.5.0 itself is allowed, 2.4.x is not.
  const [maj, min] = pkg.dependencies['@ardennguyen/zalo-agent-cli'].slice(1).split('.').map(Number);
  assert.deepEqual([maj, min], [2, 5]);
});
