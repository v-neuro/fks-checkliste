import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { pathToFileURL } from 'node:url';

// Chromium CDP, no added npm dependencies. All data lives in disposable contexts.
const baseline = !!process.env.FCD_BASELINE_DIST;
const directory = baseline ? pathToFileURL(process.env.FCD_BASELINE_DIST + '/') : new URL('../dist/', import.meta.url);
const files = new Map();
async function collect(dir, prefix = '') {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) await collect(new URL(entry.name + '/', dir), prefix + entry.name + '/');
    else files.set('/' + prefix + entry.name, await readFile(new URL(entry.name, dir)));
  }
}
await collect(directory);
const config = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url)));
const headers = baseline ? {} : Object.fromEntries(config.headers[0].headers.map(h => [h.key, h.value]));
const server = createServer((request, response) => {
  const path = new URL(request.url, 'http://localhost').pathname;
  if (path === '/empty.html') { response.writeHead(200, { ...headers, 'Content-Type': 'text/html' }).end('<!doctype html><title>Isolated test</title>'); return; }
  const name = path === '/' ? '/index.html' : path, body = files.get(name);
  if (!body) { response.writeHead(404).end(); return; }
  const mime = { html: 'text/html', js: 'text/javascript', css: 'text/css', png: 'image/png', svg: 'image/svg+xml', webmanifest: 'application/manifest+json' }[name.split('.').at(-1)];
  response.writeHead(200, { ...headers, 'Content-Type': mime || 'application/octet-stream', 'Cache-Control': 'no-store' }).end(body);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
let socket, context, sequence = 0;
const pending = new Map(), errors = [], requests = [];
function send(method, params = {}, sessionId) {
  return new Promise((resolve, reject) => {
    const id = ++sequence;
    const timeout = setTimeout(() => { pending.delete(id); reject(new Error('Timeout: ' + method)); }, 10000);
    pending.set(id, { resolve, reject, timeout });
    socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
  });
}
async function evaluate(page, expression) {
  const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true, userGesture: true }, page.sessionId);
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
async function until(check, label) {
  for (let i = 0; i < 200; i++) { if (await check()) return; await delay(50); }
  throw new Error('Timeout: ' + label);
}
const key = 'fcd-checklist-v1';
const seed = { selections: Object.fromEntries(Array.from({ length: 11 }, (_, i) => [i + 1, -1])), isFull: false };
seed.selections[1] = 1;
seed.selections[2] = 0;
const rawSeed = JSON.stringify(seed);
async function newPage(script = '') {
  const { targetId } = await send('Target.createTarget', { url: 'about:blank', browserContextId: context });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  const page = { targetId, sessionId };
  await send('Page.enable', {}, sessionId);
  await send('Runtime.enable', {}, sessionId);
  await send('Network.enable', {}, sessionId);
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `
    if (location.origin === ${JSON.stringify(origin)}) {
      ${script}
      window.storageWrites = [];
      const original = Storage.prototype.setItem;
      Storage.prototype.setItem = function(key, value) { if(key === '${key}') window.storageWrites.push(value); return original.call(this, key, value); };
      window.confirm = () => true;
      window.violations = [];
      document.addEventListener('securitypolicyviolation', e => window.violations.push(e.violatedDirective));
    }
  ` }, sessionId);
  return page;
}
const navigate = (page, path = '/') => send('Page.navigate', { url: origin + path }, page.sessionId);
const ready = page => until(() => evaluate(page, '!!document.querySelector("button[role=switch]:not(:disabled)")'), 'editable checklist');
const stored = page => evaluate(page, `localStorage.getItem('${key}')`);
const score = page => evaluate(page, 'document.querySelector("[aria-label^=Score-Balken]")?.getAttribute("aria-label")');
const click = (page, label, index = 0) => evaluate(page, `(() => {
  const b = [...document.querySelectorAll('button')].filter(b => b.textContent.trim() === ${JSON.stringify(label)})[${index}];
  if(!b || b.disabled) throw new Error('Unavailable button: ' + ${JSON.stringify(label)}); b.click();
})()`);
const seedScript = raw => `if (!localStorage.getItem('synthetic-seeded')) { localStorage.setItem('${key}', ${JSON.stringify(raw)}); localStorage.setItem('synthetic-seeded', 'true'); }`;
async function scenario(name, run) {
  ({ browserContextId: context } = await send('Target.createBrowserContext'));
  try { await run(); console.log('PASS: ' + name); }
  finally { await send('Target.disposeBrowserContext', { browserContextId: context }); context = undefined; }
}
try {
  const debugUrl = process.env.FCD_CDP_URL || 'http://127.0.0.1:9235';
  assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(new URL(debugUrl).hostname), 'Use a loopback-only test browser');
  const { webSocketDebuggerUrl } = await (await fetch(debugUrl + '/json/version')).json();
  socket = new WebSocket(webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  socket.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data);
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails);
    if (message.method === 'Network.requestWillBeSent') requests.push(message.params.request.url);
    const request = pending.get(message.id);
    if (!request) return;
    clearTimeout(request.timeout); pending.delete(message.id);
    if (message.error) request.reject(new Error(JSON.stringify(message.error))); else request.resolve(message.result);
  });

  await scenario('restoration does not overwrite saved answers during hydration', async () => {
    const page = await newPage(seedScript(rawSeed)); await navigate(page); await ready(page);
    await until(async () => /1 von 7/.test(await score(page)), 'restored seed');
    const writes = await evaluate(page, 'window.storageWrites');
    if (baseline) { assert.ok(writes.some(raw => JSON.parse(raw).selections[1] === -1)); console.log('REPRODUCED: initial empty state is written before restored state.'); }
    else assert.deepEqual(writes, []);
    assert.equal(await stored(page), rawSeed);
    await click(page, 'Ja', 1);
    await until(async () => JSON.parse(await stored(page)).selections[2] === 1, 'persist answer');
    await send('Page.reload', {}, page.sessionId); await ready(page);
    await until(async () => /2 von 7/.test(await score(page)), 'restored updated answers');
  });

  await scenario('untrusted selection aliases cannot inflate the score', async () => {
    const bad = JSON.stringify({ ...seed, selections: { ...seed.selections, '01': 1, '1e0': 1 } });
    const page = await newPage(seedScript(bad)); await navigate(page);
    if (baseline) { await ready(page); await until(async () => /3 von 7/.test(await score(page)), 'inflated score'); console.log('REPRODUCED: one selected Ja produces three points through alias keys.'); }
    else {
      await until(() => evaluate(page, 'document.body?.textContent.includes("gespeicherte Stand ist ungültig")'), 'invalid state warning');
      assert.equal(await stored(page), bad); assert.deepEqual(await evaluate(page, 'window.storageWrites'), []);
      await evaluate(page, 'window.confirm = () => false');
      await click(page, 'Ungültigen Speicherstand zurücksetzen');
      assert.equal(await stored(page), bad);
      await evaluate(page, 'window.confirm = () => true');
      await click(page, 'Ungültigen Speicherstand zurücksetzen'); await ready(page);
      assert.equal(JSON.parse(await stored(page)).selections[1], -1);
    }
  });

  await scenario('one editor per stored checklist; blocked tabs never write', async () => {
    const owner = await newPage(seedScript(rawSeed)); await navigate(owner); await ready(owner);
    await until(async () => /1 von 7/.test(await score(owner)), 'owner restored');
    const other = await newPage(); await navigate(other);
    if (baseline) {
      await ready(other); await until(async () => /1 von 7/.test(await score(other)), 'other restored'); await click(owner, 'Ja', 1); await until(async () => JSON.parse(await stored(owner)).selections[2] === 1, 'owner edit');
      await click(other, 'Ja', 4); await until(async () => JSON.parse(await stored(owner)).selections[5] === 1, 'stale edit');
      assert.equal(JSON.parse(await stored(owner)).selections[2], 0);
      console.log('REPRODUCED: a second tab overwrites the first tab’s answer with its stale copy.');
    } else {
      await until(() => evaluate(other, 'document.body?.textContent.includes("bereits in einem anderen Tab")'), 'tab lock');
      assert.deepEqual(await evaluate(other, 'window.storageWrites'), []);
      await click(owner, 'Ja', 1); await until(async () => JSON.parse(await stored(owner)).selections[2] === 1, 'owner edit');
      const raw = await stored(owner);
      await send('Target.closeTarget', { targetId: owner.targetId });
      await send('Page.reload', {}, other.sessionId); await ready(other);
      assert.equal(await stored(other), raw); assert.match(await score(other), /2 von 7/);
    }
  });
  if (baseline) { console.log('Baseline reproduction complete.'); }
  else {
    await scenario('simultaneous tabs elect exactly one editor', async () => {
      const pages = await Promise.all([newPage(seedScript(rawSeed)), newPage(seedScript(rawSeed))]);
      await Promise.all(pages.map(p => navigate(p)));
      await until(async () => {
        const states = await Promise.all(pages.map(p => evaluate(p, '({ready:!!document.querySelector("button[role=switch]:not(:disabled)"), blocked:document.body?.textContent.includes("bereits in einem anderen Tab")})')));
        return states.filter(s => s.ready).length === 1 && states.filter(s => s.blocked).length === 1;
      }, 'one editor');
    });
    await scenario('quota errors preserve the old snapshot and warn about unsaved edits', async () => {
      const page = await newPage(seedScript(rawSeed) + `const set = Storage.prototype.setItem; Storage.prototype.setItem = function(k,v) { if(k==='${key}') throw new DOMException('Synthetic quota', 'QuotaExceededError'); return set.call(this,k,v); };`);
      await navigate(page); await ready(page); await click(page, 'Ja', 1);
      await until(() => evaluate(page, '!!document.querySelector("[role=alert]")'), 'storage error warning');
      assert.equal(await stored(page), rawSeed); assert.match(await score(page), /2 von 7/);
    });
    await scenario('missing Web Locks permits memory-only edits without shared storage writes', async () => {
      const page = await newPage(seedScript(rawSeed) + `Object.defineProperty(navigator,'locks',{value:undefined});`);
      await navigate(page); await ready(page); await click(page, 'Ja', 1);
      await until(async () => /2 von 7/.test(await score(page)), 'memory edit');
      assert.ok(await evaluate(page, '!!document.querySelector("[role=alert]")'));
      assert.equal(await stored(page), rawSeed); assert.deepEqual(await evaluate(page, 'window.storageWrites'), []);
    });
    await scenario('blocked LocalStorage keeps the checklist usable with a clear warning', async () => {
      const page = await newPage(`Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Synthetic blocked storage','SecurityError');}});`);
      await navigate(page); await ready(page); await click(page, 'Ja');
      await until(async () => /1 von 7/.test(await score(page)), 'blocked storage edit');
      assert.ok(await evaluate(page, '!!document.querySelector("[role=alert]")'));
    });
    await scenario('invalid data without Web Locks stays untouched when starting in memory', async () => {
      const page = await newPage(seedScript('{invalid') + `Object.defineProperty(navigator,'locks',{value:undefined});`);
      await navigate(page);
      await until(() => evaluate(page, 'document.body?.textContent.includes("gespeicherte Stand ist ungültig")'), 'invalid unsupported storage');
      await click(page, 'Ohne Speicherung fortfahren'); await ready(page); await click(page, 'Ja');
      await until(async () => /1 von 7/.test(await score(page)), 'new memory checklist');
      assert.equal(await stored(page), '{invalid'); assert.deepEqual(await evaluate(page, 'window.storageWrites'), []);
    });
    await scenario('legacy-tab changes halt editing instead of silently overwriting', async () => {
      const page = await newPage(seedScript(rawSeed)); await navigate(page); await ready(page);
      const legacy = await newPage(); await navigate(legacy, '/empty.html');
      await until(() => evaluate(legacy, 'document.title === "Isolated test"'), 'legacy page');
      const changed = JSON.stringify({ ...seed, isFull: true });
      await evaluate(legacy, `localStorage.setItem('${key}', ${JSON.stringify(changed)})`);
      await until(() => evaluate(page, 'document.body?.textContent.includes("außerhalb dieses Tabs geändert")'), 'conflict warning');
      assert.equal(await stored(page), changed);
    });
    await scenario('back navigation restores a valid locked snapshot', async () => {
      const page = await newPage(seedScript(rawSeed)); await navigate(page); await ready(page);
      const { currentIndex, entries } = await send('Page.getNavigationHistory', {}, page.sessionId);
      await navigate(page, '/empty.html'); await until(() => evaluate(page, 'document.title === "Isolated test"'), 'leave app');
      const other = await newPage(); await navigate(other); await ready(other);
      await click(other, 'Ja', 1); await until(async () => JSON.parse(await stored(other)).selections[2] === 1, 'new owner edit');
      await send('Target.closeTarget', { targetId: other.targetId });
      await send('Page.navigateToHistoryEntry', { entryId: entries[currentIndex].id }, page.sessionId); await ready(page);
      assert.match(await score(page), /2 von 7/);
    });
    await scenario('CSP blocks inline scripts; all scores, modes, reset and legal dialog still work', async () => {
      const page = await newPage(); await navigate(page); await ready(page);
      await evaluate(page, `(() => { const s=document.createElement('script'); s.textContent='window.injected=true'; document.body.append(s); })()`);
      await until(() => evaluate(page, 'window.violations.includes("script-src-elem")'), 'inline CSP rejection');
      assert.equal(await evaluate(page, 'window.injected'), undefined);
      await evaluate(page, 'window.violations = []');
      await evaluate(page, 'document.querySelector("button[role=switch]").click()');
      await until(async () => /von 11/.test(await score(page)), 'full mode');
      for (let i = 0; i < 11; i++) await click(page, 'Ja', i);
      await until(async () => /11 von 11/.test(await score(page)), 'full score');
      await evaluate(page, 'document.querySelector("button[role=switch]").click()');
      await until(async () => /7 von 7/.test(await score(page)), 'short score');
      await click(page, 'Zurücksetzen'); await until(async () => /0 von 7/.test(await score(page)), 'reset');
      await click(page, 'Impressum'); await until(() => evaluate(page, '!!document.querySelector("[role=dialog]")'), 'legal dialog');
      await click(page, 'Schließen');
      assert.deepEqual(await evaluate(page, 'window.violations'), []);
      assert.equal(await evaluate(page, 'navigator.serviceWorker.getRegistrations().then(r => r.length)'), 0);
      assert.deepEqual(await evaluate(page, 'caches.keys()'), []);
    });
  }
  assert.deepEqual(errors, []);
  assert.ok(requests.every(url => url.startsWith(origin + '/')), 'App requests must remain on the isolated origin');
  console.log('PASS: no runtime errors, no external app requests.');
} finally {
  if (context && socket?.readyState === WebSocket.OPEN) await send('Target.disposeBrowserContext', { browserContextId: context });
  socket?.close();
  for (const request of pending.values()) { clearTimeout(request.timeout); request.reject(new Error('Test ended')); }
  await new Promise(resolve => server.close(resolve));
}
