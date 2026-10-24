const [major, minor, patch] = process.versions.node.split(".").map(Number);
if (major !== 22 || minor < 23 || (minor === 23 && patch < 4)) {
  console.error("Dieses Projekt benötigt Node 22 ab 22.23.4. Bitte die Laufzeit aus .nvmrc verwenden.");
  process.exit(1);
}
