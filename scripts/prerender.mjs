import { copyFile, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const clientHtmlPath = resolve("dist/index.html");
const serverEntryPath = resolve("dist-ssr/entry-server.js");
const rootMarker = '<div id="root"></div>';

const template = await readFile(clientHtmlPath, "utf8");
if (!template.includes(rootMarker)) {
  throw new Error(`Could not find ${rootMarker} in the client build.`);
}

const { render } = await import(pathToFileURL(serverEntryPath).href);
const appHtml = render();
const prerenderedHtml = template.replace(
  rootMarker,
  `<div id="root">${appHtml}</div>`
);

await writeFile(clientHtmlPath, prerenderedHtml, "utf8");
await copyFile(resolve("Logo.png"), resolve("dist/Logo.png"));
