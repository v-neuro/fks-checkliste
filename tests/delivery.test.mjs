import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir, lstat } from "node:fs/promises";
import test from "node:test";

test("production JSON-LD hash matches the CSP and scripts remain external", async () => {
  const config = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url)));
  const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
  const csp = config.headers[0].headers.find(h => h.key === 'Content-Security-Policy').value;
  assert.equal(config.outputDirectory, 'dist');
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/\bsrc=/.test(match[1])) { assert.match(match[1], /src="\/assets\//); continue; }
    assert.match(match[1], /type="application\/ld\+json"/);
    const hash = createHash('sha256').update(match[2]).digest('base64');
    assert.ok(csp.includes(`'sha256-${hash}'`), 'Update the JSON-LD CSP hash when changing its content');
  }
  const scriptPolicy = csp.split(';').find(d => d.trim().startsWith('script-src '));
  assert.ok(!/unsafe-inline|unsafe-eval/.test(scriptPolicy));
  assert.ok(csp.includes("frame-ancestors 'none'"));
  assert.ok(csp.includes("connect-src 'none'"));
  assert.match(html, /Interaktive FKS-Checkliste/); // Preserve prerendered content.
});

test("public and shipped build have no unexpected files or symlinks", async () => {
  async function list(dir, prefix = '') {
    const files = [];
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const url = new URL(entry.name, dir), name = prefix + entry.name;
      assert.equal((await lstat(url)).isSymbolicLink(), false, name);
      if (entry.isDirectory()) files.push(...await list(new URL(entry.name + '/', dir), name + '/'));
      else files.push(name);
    }
    return files;
  }
  assert.deepEqual((await list(new URL('../public/', import.meta.url))).sort(), ['robots.txt', 'site.webmanifest', 'sitemap.xml', 'vite.svg']);
  const files = await list(new URL('../dist/', import.meta.url));
  for (const name of files) assert.match(name, /^(?:index\.html|Logo\.png|robots\.txt|sitemap\.xml|site\.webmanifest|vite\.svg|assets\/[\w-]+\.(?:js|css|png))$/);
  assert.ok(!files.some(name => /\.map$|entry-server|package|backup|\.env/.test(name)));
});
