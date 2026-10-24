# Sicherheitsprüfung – FKS-Checkliste

## Folgeaktualisierung aller Projektpakete – 24.10.2026

Auf anschließenden ausdrücklichen Auftrag wurden **alle 15 direkten npm-Pakete
auf den aktuellen stabilen `latest`-Stand** gebracht, einschließlich neuer
Hauptversionen. 14 Pakete wurden geändert; react-chartjs-2 war bereits aktuell.
`npm update --ignore-scripts` aktualisierte außerdem sämtliche auflösbaren
Unterabhängigkeiten innerhalb der Herstelleranforderungen. Vorher wurde der
vollständige Updateplan mit `--dry-run` geprüft. Keine Installationsskripte,
Prereleases oder erzwungenen Peer-/Override-Auflösungen verwendet.

| Direktes Paket | Stand nach Sicherheitsfix → aktueller geprüfter Stand |
| --- | --- |
| chart.js | 4.5.1 → 4.6.1 |
| react / react-dom | jeweils 19.2.3 → 19.3.1 |
| react-chartjs-2 | 5.3.1 → 5.3.1, bereits aktuell |
| @eslint/js | 9.39.1 → 10.0.1 |
| eslint | 9.39.1 → 10.13.0 |
| @tailwindcss/postcss / tailwindcss | jeweils 4.1.18 → 4.3.3 |
| @types/react | 19.2.7 → 19.3.0 |
| @types/react-dom | 19.2.3 → 19.3.0 |
| @vitejs/plugin-react | 5.1.2 → 6.1.2 |
| eslint-plugin-react-hooks | 7.0.1 → 7.1.1 |
| eslint-plugin-react-refresh | 0.4.24 → 0.5.7 |
| globals | 16.5.0 → 17.13.0 |
| vite | 7.3.7 → 8.3.5 |

Der lokal installierte Paketbaum änderte 46 Pakete, fügte 15 hinzu und entfernte
30. Vite 8 verwendet Rolldown/Oxc; Rollup und esbuild werden dafür nicht mehr
benötigt. Gemäß [Vite-Migrationshinweisen](https://vite.dev/guide/migration.html)
wurde `build.target` ausdrücklich auf Chrome/Edge 107, Firefox 104 und Safari 16
festgelegt, um die bisherigen Browser-Zielversionen beizubehalten. Die bestehende
Flat-Config arbeitet auch mit [ESLint 10](https://eslint.org/docs/latest/use/migrate-to-10.0.0).

Der zusätzliche Entwicklungs-Browsertest fand eine StrictMode-Race in der während
der vorigen Sicherheitsprüfung eingeführten Tab-Sperre: beim Effekt-Neustart konnte
ein noch ausstehender eigener Lock-Request wie ein zweiter Tab wirken. Die
Sperrinitialisierung in `src/use-checklist.js` wartet jetzt auf das Ende des eigenen
vorherigen Requests. Die gezielte Regression `npm run test:dev-browser` prüft
Erststart ohne Schreiben, Bearbeitung und Reload unter Entwicklungs-StrictMode.
Fachliche Berechnungen und gespeicherte Antwortformate wurden bei diesem Folgeupdate
nicht geändert. Node 22.23.4 erfüllt alle neuen Paketanforderungen; die
Systeminstallation von Node wurde weiterhin nicht verändert.

**Unterabhängigkeiten:** Der vollständige `npm outdated --all --json`-Abgleich
zeigt keine installierten Pakete mit `current != wanted`. Einige Pakete sind
durch ihre Hersteller auf ältere Linien oder genaue Versionen gebunden, etwa
Babel 7 durch eslint-plugin-react-hooks (`^7.24.4`), Lightning CSS 1.32.0 durch
Tailwind (exakter Pin), Nano ID 3 durch PostCSS und @kurkle/color 0.3 durch Chart.js.
Insgesamt haben 50 installierte Unterpaketnamen einen neueren globalen `latest`-Tag,
der außerhalb der jeweiligen Anforderungen liegt. Diese werden nicht gegen die
Vorgaben der übergeordneten Pakete ausgetauscht. Nicht benötigte optionale
Peer-Pakete und Binärpakete anderer Betriebssysteme werden nicht zusätzlich installiert.

Erneut bestanden: **Build, Lint, 5 Unit-/Artefakttests, 11 Produktions-Browserszenarien
und `npm ls --all`**. Auch der tatsächliche Vite-8-Entwicklungsablauf mit React
StrictMode, erstem Speichern und Wiederherstellung wurde in einem frischen lokalen
Browserkontext geprüft. **npm-Audit vollständig und separat für Produktion: jeweils
0 Treffer. OSV: 205 Lockfile-Pakete geprüft, 0 Treffer.** Die Browserkontexte wurden
verworfen; eigene Testserver und der eigene Browserprozess wurden beendet.

Quellen, exakte Registry-Abfragen, Peer-/Engine-Anforderungen, der vollständige
Versionsvergleich und die neuen Testergebnisse stehen in
[`security-evidence/package-update.json`](security-evidence/package-update.json).
`advisories.json` dokumentiert weiterhin die vorausgegangene gezielte
Sicherheitskorrektur und ihren damaligen Buildstand. Für den aktuellen Paketstand
ist `package-update.json` maßgeblich. Die dort verzeichnete Lockfile-Prüfsumme
bezieht sich auf das vollständige Paketupdate.

Die Änderungen bleiben auf `security/review-2026-10-24` lokal und wurden nicht
veröffentlicht. Die nachstehenden Hosting-, Datenschutz-, Clientupdate- und
Rückfallschritte gelten weiterhin. Ein Rückfall auf den vorherigen lokalen
Sicherheitsstand muss Manifest, Lockfile und Vite-Konfiguration gemeinsam
zurücknehmen und mit einem erneuten Build verifiziert werden.

---

## Ursprüngliche Sicherheitsprüfung – historischer Stand vor dem vollständigen Paketupdate


Prüfdatum: **24.10.2026**, Europe/Berlin. Ausgang: `main`, Commit
`5353f91` (`5353f91 Modernisiere Design der FKS-Checkliste`), sauberer Arbeitsstand.
Prüfbranch: `security/review-2026-10-24`. Keine geltenden `AGENTS.md` im Projekt
oder den geprüften übergeordneten Verzeichnissen gefunden. Änderungen liegen lokal;
es erfolgten kein Push und kein Deployment.

## Ergebnis und tatsächliche Architektur

**Lokal behoben und getestet:** ungültige gespeicherte Antworten mit verfälschtem Score,
vorübergehendes Überschreiben beim Wiederherstellen, konkurrierende Tab-Schreibvorgänge,
unsichtbare Speicherfehler sowie 16 durch den Audit beanstandete Entwicklungspakete.
Sicherheitsheader sind lokal konfiguriert und im Browser getestet. Ihre produktive
Übernahme bleibt offen.

Das Projekt verwendet React/React DOM **19.2.3**, Vite, Tailwind 4, npm und
`package-lock.json` (Lockfile v3). Chart.js 4.5.1 und react-chartjs-2 5.3.1 sind
installiert, werden im Anwendungscode aber nicht verwendet. Direkte Pakete und
transitive Änderungen sind im Lockfile nachvollziehbar.

Die Produktion besteht aus statischen Dateien in `dist/`. Der Build rendert mit
`react-dom/server` einmalig in `dist-ssr/` und fügt das Ergebnis in das Client-HTML
ein. Es gibt keinen erkennbaren produktiven Node-Server, keine Server Functions,
keine React Server Components, kein PHP, Next.js, Backend oder Datenbankserver.
Node wird zum Entwickeln, Bauen und Testen benötigt. `dist-ssr/` wird nicht ausgeliefert.
`vite preview` ist laut [Vite-Dokumentation](https://vite.dev/guide/static-deploy.html)
für lokale Vorschauen vorgesehen.

Es gibt einen gemeinsamen LocalStorage-Datensatz `fcd-checklist-v1` mit elf Antworten
(`-1`, `0`, `1`) und dem Kurz-/Vollmodus. Keine Fallverwaltung, IndexedDB,
SessionStorage, Authentifizierung, Passwortfenster, Backup-/Dateiimporte,
Zeichnungen, CSV-/PDF-Exporte oder Service Worker vorhanden. Das Webmanifest allein
begründet keinen garantierten Offlinebetrieb. Ursprünglich waren weder Tests noch
eine Typprüfung konfiguriert; die App verwendet JavaScript/JSX.

## Bestätigte Anwendungsbefunde

| Befund | Reproduktion und Auswirkung | Lokale Korrektur |
| --- | --- | --- |
| Integrität: ungeprüfter LocalStorage | Ein gespeichertes `selections` mit `1: 1`, `01: 1`, `1e0: 1` erzeugte drei Punkte für ein einziges Item. Arrays, falsche Typen und fremde Schlüssel wurden nicht konsequent zurückgewiesen. Keine entfernte Angreiferkontrolle nachgewiesen. | Vollständiges Schema, exakt elf kanonische IDs, ausschließlich numerische `-1/0/1`, boolescher Modus, keine Zusatzfelder, maximal 4096 Zeichen vor JSON-Parsing. Fehlerhafte Bestände bleiben unverändert, bis ein Zurücksetzen bestätigt wird. |
| Integrität: Schreiben vor abgeschlossener Wiederherstellung | Instrumentierte Original-App schrieb beim Start zunächst den leeren Stand, anschließend die restaurierten Antworten. Ein Abbruch dazwischen kann den Bestand verlieren. | Beim Start wird ausschließlich gelesen; erst Nutzeränderungen schreiben. Eingaben bleiben bis zum Laden gesperrt. |
| Integrität: mehrere Tabs | Zweiter Tab überschreibt beim Bearbeiten die neuere Antwort des ersten Tabs mit seinem alten Gesamtstand. | Originweite Web-Locks-Sperre über Wiederherstellung und Bearbeitung. Zweiter Tab bearbeitet und schreibt nicht. Nach Schließen des ersten Tabs erneut laden. Sperre wird bei Verlassen freigegeben; Rücknavigation lädt den aktuellen Stand unter neuer Sperre. |
| Verfügbarkeit/Transparenz: Schreibfehler | Speicherfehler wurden still abgefangen; Nutzer konnten fälschlich von gesicherten Antworten ausgehen. | Sichtbarer Hinweis bei blockiertem Speicher, Quotenfehler oder fehlenden Web Locks; dann nur Bearbeitung im Arbeitsspeicher ohne gemeinsame Schreibvorgänge. |
| Auslieferung: fehlende Header | Die einmal lesend geprüfte öffentliche Startseitenantwort enthielt keine CSP, Referrer-Policy, X-Content-Type-Options, X-Frame-Options oder Permissions-Policy. | `vercel.json` ergänzt diese Header und legt `dist` als Ausgabe fest. Lokal mit echten HTTP-Headern geprüft; produktiv noch offen. |

`src/checklist-storage.js` prüft gespeicherte Eingaben; `src/use-checklist.js` hält
Sperre, Wiederherstellung und synchrones Speichern zusammen. Ein vollständiger
Datensatz wird mit einem atomaren `localStorage.setItem` ersetzt, ohne vorheriges
Löschen. Scheitert das Schreiben, bleibt der vorige gespeicherte Stand bestehen;
die aktuelle Eingabe bleibt im Arbeitsspeicher und die App warnt vor Verlust beim
Schließen. Es gibt keine mehrteilige Datenbanktransaktion, die einen eigenen
Rollback erfordern würde. `0` und unbeantwortetes `-1` bleiben unterscheidbar.
Scores, Cut-offs und Itemtexte sind unverändert.

Zusätzlich stoppen Storage-Events und ein Vergleich vor jedem Schreiben bei
Änderungen durch ältere Tabs. Das ist keine vollständig atomare Transaktionssperre
gegen alte Versionen, andere Same-Origin-Skripte oder Browserwerkzeuge. **Vor der
Übernahme müssen alte App-Tabs geschlossen werden.** Ohne Web Locks bleiben
Bestände lesbar, werden aber nicht gemeinsam überschrieben. Ungültige Bestände
können dann nur durch eine neue Checkliste im Arbeitsspeicher umgangen werden.

## Abhängigkeiten und Quellenstand

`npm audit` und `npm audit --omit=dev` wurden vor und nach dem Update ausgeführt.
Anfangs: **16 betroffene Pakete, 45 einzelne Advisories**; npm-Einstufung zwölfmal
hoch, dreimal mittel, einmal niedrig. Produktionsaudit bereits anfangs ohne Treffer.
Nachher: **beide npm-Audits 0 Treffer**. OSV prüfte 240 Lockfile-Pakete vorher
(16 Pakettreffer) und 246 nachher (0 Treffer), einschließlich optionaler Pakete
anderer Plattformen. Die Zahl entspricht nicht der Anzahl lokal installierter Pakete.

Die folgenden Fixgrenzen beziehen sich auf die tatsächlich verwendeten Versionslinien
und alle zugehörigen Advisories zusammen. Links nennen repräsentative Befunde;
**alle 45 GHSA, zugeordnete CVEs, betroffene Bereiche, GitHub-/OSV-Fixversionen,
Herstellerquellen und genaue Versionsänderungen** stehen in
[`security-evidence/advisories.json`](security-evidence/advisories.json).

| Paket | Vorher → geprüft | Mindestfix der verwendeten Linie | Anwendbarkeit / Beispielquelle |
| --- | --- | --- | --- |
| Vite | 7.2.7 → **7.3.7** | 7.3.7 | Entwicklungsserver: Datei-/Zugriffsschutzumgehung, WebSocket, Editoraufrufe; [CVE-2026-39364 / GHSA-v2wj-q39q-566r](https://github.com/vitejs/vite/security/advisories/GHSA-v2wj-q39q-566r), weitere neun Advisories in Evidenz. |
| Rollup | 4.50.2 → 4.65.0 | 4.59.0 | Buildwerkzeug; Pfadmanipulation/Dateischreiben: [CVE-2026-27606](https://github.com/advisories/GHSA-mw96-cpmx-2vgc). |
| @babel/core | 7.28.5 → 7.29.7 | 7.29.6 | Build, nicht vertrauenswürdige Source Maps: [CVE-2026-49356](https://github.com/advisories/GHSA-4x5r-pxfx-6jf8). |
| PostCSS | 8.5.6 → 8.5.31 | 8.5.23 | CSS-Build, Source-Map-Dateizugriffe und HTML-Einbettung: [CVE-2026-45623](https://github.com/advisories/GHSA-6g55-p6wh-862q), drei weitere. App verwendet externe CSS-Dateien. |
| source-map-js | 1.2.1 → 1.2.2 | 1.2.2 | Build, manipulierte Source Maps: [CVE-2026-93749](https://github.com/advisories/GHSA-68fv-2mgg-jv7q). |
| picomatch | 4.0.3 → 4.0.7 | 4.0.4 | Glob-Werkzeuge, fremde Muster: [CVE-2026-33671](https://github.com/advisories/GHSA-c2c7-rcm5-vvqj), auch CVE-2026-33672. |
| minimatch | 3.1.2 → 3.1.5 | 3.1.4 | Lint, ReDoS bei fremden Mustern: [CVE-2026-26996](https://github.com/advisories/GHSA-3ppc-4f35-3m26), CVE-2026-27903/-27904. |
| brace-expansion | 1.1.12 → 1.1.21 | 1.1.21 | Lint-Globs, Ressourcenerschöpfung: [GHSA-q2hr-2g5m-vwhr](https://github.com/advisories/GHSA-q2hr-2g5m-vwhr), sechs weitere. |
| js-yaml | 4.1.0 → 4.3.2 | 4.3.2 | Lint-Konfiguration, Prototype Pollution/DoS bei fremdem YAML: [CVE-2025-64718](https://github.com/advisories/GHSA-mh29-5h37-fv8m), vier weitere. |
| flatted | 3.3.3 → 3.4.4 | 3.4.2 | Lint-Cache, rekursives Parsing/Prototype Pollution: [CVE-2026-32141](https://github.com/advisories/GHSA-25h7-pfq9-p65f), CVE-2026-33228. |
| ajv | 6.12.6 → 6.15.0 | 6.14.0 | Lint-Schema, ReDoS mit `$data`: [CVE-2025-69873](https://github.com/advisories/GHSA-2g4f-4pwh-qvx6); im App-Code nicht genutzt. |
| @humanfs/node | 0.16.7 → 0.16.8 | 0.16.8 | Lint-Dateiwerkzeug, Symlink-Kopieren: [GHSA-p498-v437-472g](https://github.com/advisories/GHSA-p498-v437-472g); kein entsprechender App-Pfad. |
| browserslist | 4.26.2 → 4.29.4 | 4.28.7 | Build, fremde Abfragen/Statistikdateien: [CVE-2026-73088](https://github.com/advisories/GHSA-73wf-gq98-2v4g), CVE-2026-73089. |
| baseline-browser-mapping | 2.8.4 → 2.11.32 | 2.11.0 | Build, ungültige Eingaben: [CVE-2026-45819](https://github.com/advisories/GHSA-w5vr-8v7q-w6rv). |
| nanoid | 3.3.11 → 3.3.20 | 3.3.18 | Build-Abhängigkeit, ungültige Generatorgrößen: [CVE-2026-67213](https://github.com/advisories/GHSA-2v37-7h3g-55p8), zwei weitere; keine App-Nutzung. |
| zod | 4.1.13 → 4.6.7 | 4.6.6 | React-Hooks-Lintwerkzeug, übergroße Sammlungen: [GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5); keine Browser-App-Nutzung. |

Versionsbetroffenheit der Entwicklungspakete ist bestätigt. Externe Erreichbarkeit
eines Vite-Entwicklungsservers oder fremde Build-Eingaben sind **nicht nachgewiesen**.
Die Standardkonfiguration veröffentlicht keinen `--host`-Server. Windows-spezifische
Vite-Befunde sind auf dem geprüften macOS nicht unmittelbar auslösbar; sie werden
dennoch durch das Update für andere Entwickler behoben. Statische Produktionsdateien
enthalten keinen Vite-Server. Hersteller- und npm-Schweregrade können voneinander abweichen.

Vor Installation wurde `npm audit fix --dry-run --ignore-scripts --json` geprüft.
Anschließend `npm audit fix --ignore-scripts`, ohne `--force` oder direkte Major-Updates.
40 lokal installierte Pakete wurden geändert, eines hinzugefügt. Nur Vite änderte
sich unter den direkten Abhängigkeiten; React und die übrigen direkten Pakete bleiben
gleich. Nötige Unterabhängigkeiten umfassen esbuild 0.25.9 → 0.28.2 und Babel-Helfer.
Die Vite-Untergrenze im Manifest lautet jetzt `^7.3.7`; Lockfile enthält Integritätswerte.

Der frisch abgerufene [CISA-KEV-Katalog](https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json)
hat Version **2026.10.23**, 1756 Einträge. Für die ermittelten Paket-CVEs und die unten
aufgelisteten Node-CVEs gab es keine Übereinstimmung. Das ist kein Beweis fehlender
Ausnutzung. Katalogdatum, Prüfsumme und Abrufzeit stehen in der Evidenzdatei.

## Node und nicht betroffene Server-Advisories

Gefundene Standardlaufzeit: **Node 22.18.0**, npm 10.9.3, ohne bisherige Versionsvorgabe.
Geprüft wurde mit **Node 22.23.4**, npm 10.9.9 aus
`/private/tmp/node-v22.23.4-darwin-arm64/bin`. Archivprüfsumme stimmt mit der neu
abgerufenen offiziellen `SHASUMS256.txt` überein; die verwendete Binärdatei wurde mit
dem Archiv verglichen. Keine Änderung der allgemeinen Node-Systeminstallation.

Die [Herstellermeldung vom 21.10.2026](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases)
und [Release 22.23.4](https://nodejs.org/en/blog/release/v22.23.4) bestätigen aktuelle
Korrekturen für die 22er-Reihe: CVE-2026-105482 (DNS), -106069/-106072 (TLS),
-111497 (Brotli), -105481 (HTTP-Agent), -106074 (Snapshot-Zufallswerte), -106073
(Permission Model). Die Version 22.18.0 liegt vor diesen Fixes. Die App stellt keine
entsprechenden Node-Endpunkte bereit; ein öffentlicher Angriff auf diese Laufzeit ist
nicht nachgewiesen. Build-/Entwicklungsumgebungen benötigen trotzdem Updates.
Die Meldung behandelt zusätzlich CVEs anderer Node-Linien, die hier nicht pauschal
als betroffen gewertet werden. Frühere Sicherheitsupdates sind kumulativ enthalten;
die aufgeführten CVEs sind keine vollständige historische Node-CVE-Inventur.

`.nvmrc`, `engines`, `.npmrc` mit `engine-strict=true` und eine Versionsprüfung vor
Dev, Build und Preview verlangen Node 22 ab 22.23.4. Die alte Standardlaufzeit wurde
testweise erfolgreich zurückgewiesen. Der Hosting-Build muss tatsächlich auf einen
gepatchten Node-22-Stand eingestellt werden; seine Version ist nicht zugänglich.

[CVE-2025-55182 / React Server Components](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components)
ist hier nicht anwendbar: keine `react-server-dom-*`-Pakete, kein RSC-Plugin und keine
Server-Function-Endpunkte. Das einmalige `renderToString` beim Build ändert diese
Abgrenzung nicht. Andere Server-Stacks wurden mangels Projektbestand nicht untersucht.

## Auslieferung, Daten und Prüfgrenzen

`vercel.json` folgt der [Vercel-Headerkonfiguration](https://vercel.com/docs/project-configuration/vercel-json#headers).
Die CSP erlaubt eigene externe Skripte und den exakten SHA-256-Hash des statischen
JSON-LD-Blocks, kein beliebiges Inline-JavaScript und kein `eval`. Die Anwendung
benötigt keine Netzwerk-API; `connect-src 'none'`. Einbettung, Plugins, Formversand
und Worker sind gesperrt. Inline-Stilattribute bleiben für die vorhandenen
Scorebalken zugelassen; Skriptattribute sind gesperrt. Referrer werden unterdrückt,
MIME-Sniffing, Framing, Kamera, Mikrofon und Geolocation eingeschränkt.
Bei Änderungen am JSON-LD muss dessen Hash angepasst werden; ein Test prüft die Bindung.

Ein einzelner öffentlicher **HEAD-Abruf** von
`https://fks-checkliste.vercel.app/` ergab HTTP 200, `Server: Vercel`, HSTS und
`Cache-Control: public, max-age=0, must-revalidate`. Die oben genannten zusätzlichen
Header fehlten in dieser Antwort. Das beweist weder den veröffentlichten Commit
noch Header auf anderen Pfaden, Hosting-Zugriffsschutz oder die Build-Laufzeit.
Es wurden keine öffentlichen Exploit-/Lasttests ausgeführt.

Keine `dangerouslySetInnerHTML`, `document.write`, dynamischen HTML-Templates,
`eval` oder fremden Bildquellen im App-Code gefunden. Texte werden von React als
Text gerendert. Das einzige externe Inhaltsziel ist ein festes Literaturziel mit
`noopener noreferrer`. Metadaten-URLs und der JSON-LD-Kontext erzeugen allein keine
App-Netzwerkanfrage. Kein bestätigter DOM-XSS-Pfad. Import-/CSV-/PDF-, Daten-URL-,
Sessionnamensraum- und Zeichnungsprüfungen sind mangels dieser Funktionen nicht
anwendbar; es wurden keine sachfremden neuen Funktionen eingeführt.

`public/` und Build-Ausgabe wurden einschließlich Dateitypen und Symlinks geprüft.
Der Release enthält HTML, JS, CSS, Logo, Manifest, Sitemap, Robots-Datei und das
vorhandene Vite-SVG. Keine Source Maps, `.env`, Backups, Konfigurationen,
Server-Bundles oder sonstige unerwartete Dateien gefunden. Das vorhandene Logo
liegt zusätzlich als gehashtes Asset vor; kein Geheimnisbefund.

Aktueller Projektbestand und **27 lokal erreichbare Git-Commits mit 55 eindeutigen
Dateiblobs** wurden auf sechs Signaturfamilien geprüft: private Schlüssel,
AWS-/GitHub-/Dienst-Tokens, URLs mit Kennwörtern und typische Geheimniszuweisungen.
Keine Treffer. Der öffentliche Google-Site-Verifikationswert ist ein vorgesehenes
Publikationsartefakt, kein Zugangsschlüssel. Die Prüfung ersetzt keinen vollständigen
Secret-Scanner und erfasst keine unzugängliche Remote-/gelöschte Historie.
Es wurden keine Geheimniswerte ausgegeben oder Zugangsdaten rotiert.

Keine Projekt-/Betriebslogs vorhanden. Nur eigene Build-, Audit- und Testausgaben
wurden zusätzlich gelesen; Sandbox-DNS-/Portfehler wurden durch autorisierte
Wiederholung aufgelöst. **Keine Aussage zur Abwesenheit früherer Kompromittierung**
möglich; Hosting-/Zugriffslogs und Betreiberkonfiguration fehlen. Kein pauschales
Durchsuchen des Rechners, keine produktiven Datenänderungen oder Beweislöschungen.

## Verifikation

Alle Endprüfungen mit der korrigierten Node-Laufzeit:

| Befehl / Prüfung | Ergebnis |
| --- | --- |
| `npm run build` | Client- und Prerender-Build erfolgreich; statischer Inhalt erhalten. |
| `npm test` | 5 Tests erfolgreich: Schemaprüfung, numerische Nullwerte, unabhängige Zustände, Produktions-CSP/JSON-LD, Artefaktgrenzen. |
| `npm run lint` | Erfolgreich. |
| Typprüfung | Nicht konfiguriert; keine TypeScript-Konfiguration vorhanden. |
| `npm run test:browser` | 11 Szenarien erfolgreich, zusätzlich Prüfung auf Runtimefehler und fremde Netzwerkanfragen. |
| `FCD_BASELINE_DIST=/private/tmp/fcd-security-baseline/dist npm run test:browser` | Drei ursprüngliche Fehler reproduziert: leeres Zwischenschreiben, Score-Alias, verlorene Tab-Antwort. Originalcode von `HEAD`, isoliert gebaut mit bereits korrigierten Buildpaketen. |
| `npm audit --json`, `npm audit --omit=dev --json` | Nach Update jeweils 0 Treffer, Exit 0. |
| OSV Querybatch, GitHub Advisory API, CISA KEV | Vorher-/Nachher-Abgleich und 45 Einzelmeldungen ohne Abruffehler dokumentiert. |
| `npm ls --all --json`, `git diff --check` | Konsistenter Paketbaum, keine Whitespacefehler. |
| `node scripts/check-runtime.mjs` mit System-Node | Erwartet Exit 1 für 22.18.0; unter 22.23.4 erfolgreich. |

Browserprüfungen verwenden ausschließlich synthetische Antworten, neue wegwerfbare
Chromium-Kontexte und einen kurzlebigen HTTP-Server auf Loopback. Die Header aus
`vercel.json` werden dabei tatsächlich als HTTP-Header gesendet. Geprüft: kein
Startschreiben, Reload, Alias-/Schema-Ablehnung mit Erhalt des Originals, abgebrochenes
Zurücksetzen, Tab-Sperre und gleichzeitiger Start, Sperrfreigabe, Quotenfehler,
blockierter Speicher, fehlende Web Locks, ungültiger Stand ohne Web Locks,
Legacy-Tab-Konflikte, Rücknavigation, CSP gegen injizierte Inline-Skripte,
7-/11-Punkte-Scores, Moduswechsel, Reset und Impressum. Keine Runtimefehler,
keine fremden App-Anfragen, keine Service-Worker-Registrierung oder Cache-Storage-Einträge.

Zwischenläufe fanden eine unzulässige Web-Locks-Optionskombination, die korrigiert
wurde. Testabfragen wurden außerdem gegen noch leere Navigationsdokumente abgesichert.
Nur die erfolgreichen Endstände werden oben als bestanden ausgewiesen. Testserver
werden im `finally` beendet und Browserkontexte verworfen; der selbst gestartete
Chrome-Testprozess wurde nach Abschluss beendet. Andere Browserprozesse bleiben unberührt.

## Offene Risiken und Übernahme

Es gibt **keinen Passwortschutz**. Ein später ergänztes Browser-Flag oder ein
eingebetteter Passwort-Hash wäre keine belastbare Zugriffskontrolle. Die App ist
als öffentliche Information nutzbar; falls beschränkter Zugang erforderlich ist,
muss der Betreiber Hostingzugriffsschutz vor die statischen Dateien schalten und
dessen Durchsetzung separat prüfen. Es wurde kein Login-Backend erfunden.

Antworten bleiben unverschlüsselt im Browserprofil und können durch andere
Same-Origin-Skripte, Erweiterungen oder Personen mit Profil-/Gerätezugriff gelesen
oder verändert werden. Die App hat keine Fallidentität: vor neuer Beurteilung
zurücksetzen, keine parallelen Personen im selben Profil bearbeiten. Kein CSV-/PDF-
oder Backup-Export vorhanden; somit keine App-Exportverschlüsselung zu prüfen.
Browserprofilkopien und manuell angefertigte Dateien benötigen eigenen Schutz.
Datenschutzhinweise in App und README wurden an diese tatsächlichen Grenzen angepasst.

1. Änderungen auf diesem Branch prüfen und übernehmen. Node 22 ab 22.23.4 aktivieren,
   `npm ci --ignore-scripts`, `npm run build`, `npm test`, `npm run lint` ausführen.
   Für Browsertests einen separaten Chrome-Prozess mit leerem Profil und nur auf
   Loopback erreichbarem Remote-Debugging starten; `FCD_CDP_URL` übergeben. Niemals
   einen produktiv genutzten Browser oder reale Antworten verwenden.
2. Hosting-Git-Anbindung, Build-Node-Version, Buildbefehl und Ausgabe `dist/` prüfen.
   Alle externen Analytics-/Toolbar-/Skript-Injektionen gesondert bewerten: die CSP
   kann sie blockieren. Bei anderem Hosting die Header gleichwertig konfigurieren.
   Deployments und Push wurden in dieser Prüfung nicht durchgeführt.
3. Vor einem späteren Release laufende Beurteilungen beenden bzw. organisatorisch
   sichern. Alle alten App-Tabs und installierten Standalone-Fenster schließen.
   Keine Browserdaten löschen: gültige Bestände bleiben im bestehenden Format lesbar.
4. Nach autorisierter Bereitstellung auf Startseite **und Assets** die Header,
   HTTPS, aktuelle Assetreferenzen, MIME-Typen und Fehlerantworten prüfen. Mit
   synthetischen Antworten Reload, Nullwerte, Kurz-/Vollscore, zweiten Tab und Reset
   verifizieren. Erst danach produktive Behebung bestätigen.
5. Bereits installierte Manifest-/PWA-Clients müssen geschlossen und online neu
   geöffnet werden. Es gibt keinen projektierten Service Worker und keine Push-
   oder Zwangsupdatefunktion. Das HTML soll revalidiert werden; es lädt gehashte Assets.
   Einen unerwartet vorhandenen älteren Worker zunächst untersuchen, dessen Herkunft
   klären und eine kontrollierte Migration planen. Nicht pauschal Caches oder
   Browserdaten löschen und keine laufenden Beurteilungen durch Updates abbrechen.
6. Rückfall: vor Übernahme Ausgangscommit/Deployment festhalten. Bei Problemen ein
   zuvor geprüftes statisches Deployment über den Hostingprozess zurücknehmen;
   dabei werden die alten Sicherheitsmängel wieder eingeführt. Alternativ die
   betreffenden Änderungen auf einem separaten Branch zurücknehmen und neu testen.
   Der LocalStorage-Schlüssel und das gültige Datenformat bleiben kompatibel;
   neuere und ältere Tabs dürfen auch beim Rückfall nicht parallel laufen.

**Offen/nicht prüfbar:** produktive Übernahme aller Korrekturen, tatsächlicher
Deployment-Commit, Hosting-Buildlaufzeit und Zugangsschutz, Betriebslogs,
historische Client-Caches außerhalb der isolierten Tests, Verhalten anderer
Browser und Geräte. Lokale Tests belegen keine produktive Behebung und keine
allgemeine Garantie der Sicherheitsfreiheit.
