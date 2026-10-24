import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';

// Run against Vite's development server: production React does not replay effects.
const appUrl = process.env.FCD_APP_URL || 'http://127.0.0.1:5178/';
const debugUrl = process.env.FCD_CDP_URL || 'http://127.0.0.1:9235';
for (const url of [appUrl, debugUrl]) {
  assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(new URL(url).hostname), 'Use isolated loopback test servers');
}
const { webSocketDebuggerUrl } = await (await fetch(debugUrl + '/json/version')).json();
const socket = new WebSocket(webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});
let sequence = 0, context;
const pending = new Map(), errors = [];
socket.addEventListener('message', ({ data }) => {
  const message = JSON.parse(data);
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails);
  const request = pending.get(message.id);
  if (!request) return;
  pending.delete(message.id); clearTimeout(request.timeout);
  if (message.error) request.reject(new Error(JSON.stringify(message.error)));
  else request.resolve(message.result);
});
function send(method, params = {}, sessionId) {
  return new Promise((resolve, reject) => {
    const id = ++sequence;
    const timeout = setTimeout(() => { pending.delete(id); reject(new Error('Timeout: ' + method)); }, 10000);
    pending.set(id, { resolve, reject, timeout });
    socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
  });
}
try {
  ({ browserContextId: context } = await send('Target.createBrowserContext'));
  const { targetId } = await send('Target.createTarget', { url: 'about:blank', browserContextId: context });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  await send('Runtime.enable', {}, sessionId);
  await send('Page.enable', {}, sessionId);
  async function evaluate(expression) {
    const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }, sessionId);
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  }
  async function until(check, label) {
    for (let i = 0; i < 200; i++) { if (await check()) return; await delay(50); }
    throw new Error('Timeout: ' + label);
  }
  await send('Page.navigate', { url: appUrl }, sessionId);
  await until(() => evaluate('!!document.querySelector("button[role=switch]:not(:disabled)")'), 'StrictMode editor');
  assert.equal(await evaluate('localStorage.getItem("fcd-checklist-v1")'), null);
  await evaluate('[...document.querySelectorAll("button")].find(b => b.textContent.trim() === "Ja").click()');
  assert.equal(await evaluate('JSON.parse(localStorage.getItem("fcd-checklist-v1")).selections[1]'), 1);
  await send('Page.reload', {}, sessionId);
  await until(() => evaluate('document.querySelector("[aria-label^=Score-Balken]")?.getAttribute("aria-label") === "Score-Balken 1 von 7"'), 'restored development state');
  assert.deepEqual(errors, []);
  console.log('PASS: Vite development mode and React StrictMode acquire a single editor lock, preserve the first edit and restore it without runtime errors.');
} finally {
  if (context) await send('Target.disposeBrowserContext', { browserContextId: context });
  socket.close();
  for (const request of pending.values()) clearTimeout(request.timeout);
}
