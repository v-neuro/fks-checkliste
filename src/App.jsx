// Testedit: Oboe tool successfully connected.
import React, { useEffect, useMemo, useState } from "react";


// FCD Diagnostic Orientation Aid – Interactive Checklist
const ITEMS = [
  { id: 1,
    label: "Besteht eine Diskrepanz zwischen dem Ausmaß der berichteten Symptome und der Alltagsfunktion?",
    onlyFull: false,
    instruction: `Ein Nachweis interner Inkonsistenz liegt vor, wenn subjektiv berichtete erhebliche kognitive Schwierigkeiten und/oder niedrige neuropsychologische Testergebnisse in starkem Gegensatz stehen zu Beispielen wie:
- der Fähigkeit, einen kognitiv anspruchsvollen Job ohne Schwierigkeiten auszuüben
- im Gespräch beobachtbaren adäquaten sprachlich‑kommunikativen Fähigkeiten
- der Fähigkeit, bestimmte Aktivitäten wie das Lesen eines Buches, das Verwalten von Finanzen und Autofahren ohne Schwierigkeiten auszuführen.`,
  },
  { id: 2,
    label: "Kann die Patientin oder der Patient detaillierte Beispiele für seine/ihre Gedächtnisbeschwerden nennen?",
    onlyFull: false,
    instruction:
      "Während des Gesprächs nennt die Patientin oder der Patient konkrete Beispiele für Gedächtnisausfälle, oft mit detaillierten und über die erfragten Informationen hinausgehenden Angaben. Die berichteten Symptome liegen häufig im Bereich normaler menschlicher Erfahrungen. Im Gegensatz zu neurodegenerativen Erkrankungen können Betroffene mit einer funktionellen kognitiven Störung oft längere Zeit ununterbrochen berichten.",
  },
  { id: 3,
    label: "Sind die kognitiven Beschwerden ablenkbar und/oder fluktuierend (z.B. variabel in unterschiedlichen Situationen)?",
    onlyFull: true,
    instruction: `Bei Patientinnen oder Patienten mit funktioneller kognitiver Störung treten Schwierigkeiten häufig nur in bestimmten Situationen auf. Zum Beispiel können sie detailliert über Episoden von Gedächtnisverlust berichten und ihre Aufmerksamkeit während des Interviews aufrechterhalten, zeigen jedoch unverhältnismäßige Beeinträchtigungen derselben Funktionen in anderen Situationen (z. B. bei kognitiven Tests oder wenn die Aufmerksamkeit auf die Symptome gelenkt wird). Dies ist nicht dasselbe wie Fluktuationen im Zeitverlauf, die bei vielen anderen Erkrankungsprozessen beobachtet werden können (z. B. bei Delir oder Lewy‑Körper‑Demenz).`,
  },
  { id: 4,
    label: "Kann die Patientin oder der Patient die Liste der verordneten Medikamente nennen und/oder frühere Interaktionen mit anderen Ärzten erinnern (z.B. frühere Diagnosen und Untersuchungen)?",
    onlyFull: true,
    instruction: `Patientinnen und Patienten mit funktioneller kognitiver Störung sind häufig in der Lage, sich an frühere Interaktionen mit anderen Ärztinnen und Ärzten zu erinnern, einschließlich spezifischer Aspekte früherer Diagnosen und Untersuchungen. Ebenso deutet die Fähigkeit, eine Liste von Medikamenten aus dem Gedächtnis wiederzugeben und deren Indikationen zu benennen, auf ein gut funktionierendes Gedächtnis hin - was oftmals im Widerspruch zu den angegebenen Symptomen steht.`,
  },
  { id: 5,
    label: "Gibt es eine Vorgeschichte einer nicht-kognitiven funktionellen neurologischen Störung und/oder funktionellen somatischen Störung (Schmerzen, Fatigue, …)?",
    onlyFull: false,
    instruction: `Das Vorliegen anderer Symptome wie chronische Schmerzen, Fatigue, Dissoziation oder das Vorliegen anderer funktioneller Diagnosen kann ein hilfreicher (aber nicht notwendiger) Hinweis auf eine funktionelle kognitive Störung sein.`,
  },
  { id: 6,
    label: "Fallen dem Betroffenen die kognitiven Veränderung stärker auf als anderen (beachten Sie dafür auch z.B. selbst initiierte Überweisung und/oder alleinige Vorstellung)?",
    onlyFull: false,
    instruction: `Bei der funktionellen kognitiven Störung deutet die Fremdanamnese oft darauf hin, dass die Sorge von Betroffenen deutlich größer ist als die der Angehörigen. Unterstützende Hinweise zeigen sich darin, dass Patientinnen oder Patienten die Klinik allein aufsuchen und/oder die Überweisung selbst initiiert haben (d. h. Betroffene haben aufgrund ihrer Bedenken selbst die Initiative ergriffen, einen Arzt aufzusuchen).`,
  },
  { id: 7,
    label: "Ist die kognitive Leistung normal oder zeigt sie ein inkonsistentes Muster (z.B. schlechteres Ergebnis beim unmittelbaren Erinnern als beim verzögerten Abruf, bessere Leistung beim Rückwärtswiederholen von Ziffern als beim Vorwärtswiederholen, ungefähre Antworten)?",
    onlyFull: true,
    instruction: `Betroffene mit funktioneller kognitiver Störung können eine normale kognitive Leistung zeigen, im Vergleich zu neurodegenerativen Erkrankungen besser abschneiden oder auch unterdurchschnittliche Ergebnisse aufweisen. Wichtiger als eine „normale“ kognitive Leistung ist jedoch das Auftreten inkonsistenter Leistungsmuster, insbesondere im selben kognitiven Funktionsbereich (z. B. schlechtere Leistung bei der unmittelbaren Erinnerung im Vergleich zur verzögerten Erinnerung, bessere Leistung beim Rückwärtswiederholen von Ziffern im Vergleich zum Vorwärtswiederholen). Dies deutet darauf hin, dass kognitive Prozesse besser funktionieren, wenn sie automatisch abgerufen werden, als wenn sie explizit gefordert sind. Einige Betroffene zeigen möglicherweise auch eine geringe Ausdauer bei Aufgaben oder geben vage Antworten, die sich mit Ermutigung verbessern. Andere beeinflussende Faktoren, wie z. B. Schwankungen im Bewusstseinszustand, starke Kopfschmerzen oder andere akute neurologische oder psychiatrische Einflussfaktoren sollten ebenfalls berücksichtigt werden, da sie Aufmerksamkeitsdefizite erklären können.`,
  },
  { id: 8,
    label: "Sind die Gedächtnissymptome im Verlauf stabil oder haben sich gebessert?",
    onlyFull: false,
    instruction: `Patientinnen und Patienten mit funktioneller kognitiver Störung können plötzlich und schwerwiegend auftretende Symptome präsentieren, die über die Zeit stabil bleiben. In anderen Fällen haben Betroffene, die sich wegen Gedächtnisproblemen vorstellen, eine lange Dauer der Symptome, die sich über die Zeit nicht verschlechtert oder aber verbessert haben. Es ist zu beachten, dass auch bei vaskulärer kognitiver Beeinträchtigung oder nach einem Schädel‑Hirn‑Trauma (SHT) stabile Symptome oder eine Verbesserung im Laufe der Zeit vorliegen kann, insbesondere bei der Behandlung von Begleiterkrankungen.`,
  },
  { id: 9,
    label: "Kann die Patientin oder der Patient den Beginn der Symptome präzise datieren (abrupter Beginn)?",
    onlyFull: false,
    instruction: `Einige Patientinnen und Patienten können den Beginn der Symptome präzise beschreiben und datieren. Dabei werden häufig Zusammenhänge zu vorangegangenen spezifischen Ereignissen geschildert, beispielsweise eine Migräneattacke, ein Dissoziationserleben, ein leichtes Schädel‑Hirn‑Trauma oder eine Virus‑Infektion. Diese Information sollte von Betroffenen selbst und nicht von den Angehörigen hervorgebracht werden.`,
  },
  { id: 10,
    label: "Gibt es einen offensichtlichen psychologischen Stressor?",
    onlyFull: false,
    instruction: `Psychologische Stressfaktoren können als prädisponierende, auslösende oder aufrechterhaltende Faktoren bei einer funktionellen kognitiven Störung wirken. Bei einem Teil der Betroffenen ist die funktionelle kognitive Störung mit depressiven Symptomen, Angstzuständen und anderen stressbezogenen Lebensereignissen verbunden. Bei einigen Betroffenen können Gedächtnissymptome mit bedeutenden Lebensereignissen wie einem kürzlichen Trauerfall oder einer körperlichen Erkrankung in Verbindung stehen. `,
  },
  { id: 11,
    label: "Kann die Patientin oder der Patient zusammengesetzte/mehrteilige Fragen beantworten?",
    onlyFull: true,
    instruction: `Es findet sich häufig eine Inkonsistenz zwischen der erhaltenen Fähigkeit, die Einzelteile einer längeren und zusammengesetzten Frage beantworten zu können, und den Gedächtnisbeschwerden der Betroffenen. Das heißt, die Fähigkeit mehrteilige Fragen zu beantworten steht nicht im Einklang mit der Schwere der berichteten Symptome. Im Allgemeinen können Betroffene mit leichter kognitiver Beeinträchtigung (MCI) bei Neurodegeneration zwar in der Lage sein, solche Fragen zu beantworten (insbesondere wenn sie hochgebildet sind); dies sollte jedoch nicht isoliert betrachtet werden - in der Regel stimmt dies bei MCI Patientinnen und Patienten mit ihren milden Symptomen überein.`,
  },
];

function InstructionText({ text }) {
  if (!text) return null;
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const isList = lines.some((l) => /^[-•]/.test(l));
  if (isList) {
    return (
      <ul className="list-disc pl-5 space-y-1 text-sm leading-relaxed text-slate-700">
        {lines.map((l, i) => (
          <li key={i}>{l.replace(/^[-•]\s*/, "")}</li>
        ))}
      </ul>
    );
  }
  return (
    <p className="text-sm leading-relaxed whitespace-pre-line text-slate-700">
      {text}
    </p>
  );
}

// -1 = nicht gesetzt, 0 = Nein/nicht getestet, 1 = Ja
const initialSelections = Object.fromEntries(ITEMS.map((i) => [i.id, -1]));
const STORAGE_KEY = "fcd-checklist-v1";

function App() {
  const [isFull, setIsFull] = useState(false); // false = Kurzversion
  const [selections, setSelections] = useState(initialSelections);
  const [activeInfoId, setActiveInfoId] = useState(null);

  // Desktop inline instruction positioning (absolute panel)
  const listContainerRef = React.useRef(null);
  const itemRefs = React.useRef({});
  const [panelTop, setPanelTop] = useState(0);

  // Recompute panel top when active item changes or on resize
  useEffect(() => {
    const updateTop = () => {
      if (!activeInfoId) return;
      const el = itemRefs.current[activeInfoId];
      const container = listContainerRef.current;
      if (el && container) {
        const elTop = el.offsetTop; // relative to container
        setPanelTop(elTop);
      }
    };
    updateTop();
    window.addEventListener('resize', updateTop);
    return () => window.removeEventListener('resize', updateTop);
  }, [activeInfoId]);

  // Pop-up (Impressum & Datenschutz)
const [showLegal, setShowLegal] = useState(false);

// ESC schließt das Pop-up
useEffect(() => {
  if (!showLegal) return;
  const onKey = (e) => { if (e.key === "Escape") setShowLegal(false); };
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, [showLegal]);

  // Load persisted state
  /* eslint-disable react-hooks/set-state-in-effect -- restore client-only state after SSR hydration */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved?.selections) setSelections(saved.selections);
        if (typeof saved?.isFull === "boolean") setIsFull(saved.isFull);
      }
    } catch {
      // The checklist still works when a browser blocks local storage.
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Persist on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ selections, isFull }));
    } catch {
      // Persistence is optional; keep the in-memory checklist usable.
    }
  }, [selections, isFull]);

  const visibleItems = useMemo(
    () => ITEMS.filter((it) => (isFull ? true : !it.onlyFull)),
    [isFull]
  );

  const totalScore = useMemo(
    () =>
      Object.entries(selections)
        .filter(([id]) => visibleItems.some((v) => v.id === Number(id)))
        .reduce((sum, [, val]) => sum + (val === 1 ? 1 : 0), 0),
    [selections, visibleItems]
  );

  const maxScore = visibleItems.length;

  // Cutoff/probability visualization helpers
  const cutoff = isFull ? 6 : 4;
  const cutoffPct = maxScore ? Math.round((cutoff / maxScore) * 100) : 0;
  const probText = totalScore >= cutoff
    ? "Oberhalb des Cut-offs: hohe Spezifität (~97%) und positiver Vorhersagewert ~91% für funktionelle kognitive Störung (Pilotdaten)."
    : "Unterhalb des Cut-offs: Funktionelle kognitive Störung wenig wahrscheinlich; bitte klinische Beurteilung und Verlauf beachten.";

  const handleSet = (id, val) => {
    setSelections((prev) => ({ ...prev, [id]: val }));
  };

  const handleVersionToggle = () => {
    const nextIsFull = !isFull;
    setIsFull(nextIsFull);

    if (!nextIsFull && ITEMS.find((item) => item.id === activeInfoId)?.onlyFull) {
      setActiveInfoId(null);
    }
  };

  const handleReset = () => {
    const ok = window.confirm("Alle Antworten zurücksetzen?");
    if (!ok) return;
    setSelections(initialSelections);
    setActiveInfoId(null);
  };

  const activeItem = useMemo(
    () =>
      activeInfoId
        ? visibleItems.find((item) => item.id === activeInfoId) ?? null
        : null,
    [activeInfoId, visibleItems]
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/70 backdrop-blur border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Funktionelle kognitive Störungen – Diagnostische Orientierungshilfe
            </h1>
            <div className="mt-2 flex items-center gap-3">
              <span className="text-sm text-slate-600">Kurzversion</span>
              <button
                role="switch"
                aria-checked={isFull}
                onClick={handleVersionToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ring-1 ring-inset ${
                  isFull ? "bg-blue-600 ring-blue-600" : "bg-slate-200 ring-slate-300"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                title="Kurz-/Vollversion umschalten"
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                    isFull ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
              <span className="text-sm text-slate-600">Vollversion</span>
            </div>
            <div className="mt-2 flex items-center gap-3">
              {/* Score pill */}
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold border border-emerald-200">
                {totalScore} / {maxScore} Punkte
              </span>
            </div>
            {/* Probability visualization */}
            <div className="mt-2 w-full max-w-md">
              <div className="relative h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 transition-all ${totalScore >= cutoff ? "bg-emerald-600" : "bg-slate-400"}`}
                  style={{ width: `${Math.max(0, Math.min(100, Math.round((totalScore / maxScore) * 100)))}%` }}
                  aria-label={`Score-Balken ${totalScore} von ${maxScore}`}
                />
                <div className="absolute top-0 bottom-0" style={{ left: `${cutoffPct}%` }}>
                  <div
                    className="h-full w-0.5 bg-slate-600/60"
                    title={`Cut-off ${cutoff}`}
                    aria-label={`Cut-off ${cutoff}`}
                    role="img"
                  />
                </div>
              </div>
              <p className="mt-1 text-xs text-slate-500">{probText}</p>
            </div>
          </div>

        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 sm:py-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <section
          aria-labelledby="checklist-intro-title"
          className="md:col-span-3 rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm ring-1 ring-black/5"
        >
          <h2 id="checklist-intro-title" className="text-lg font-semibold">
            Interaktive FKS-Checkliste zur diagnostischen Orientierung
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            Diese Orientierungshilfe unterstützt Angehörige der Gesundheitsberufe bei der
            klinischen Einschätzung funktioneller kognitiver Störungen (FKS). Die Kurzversion
            umfasst sieben, die Vollversion elf Hinweise. Sie ergänzt die klinische Beurteilung,
            ersetzt aber keine ärztliche Untersuchung oder Diagnostik.
          </p>
        </section>

        {/* Items */}
        <section ref={listContainerRef} className="relative md:col-span-3 space-y-6 md:pr-[380px]">
          {ITEMS.map((it, idx) => {
              const val = selections[it.id];
              const isYes = val === 1;
              const isNo = val === 0;
              const isActive = activeInfoId === it.id;
              const isVisible = isFull || !it.onlyFull;
              const displayIndex = isFull
                ? idx + 1
                : visibleItems.findIndex((item) => item.id === it.id) + 1;

              return (
                <div
                  key={it.id}
                  ref={(el) => (itemRefs.current[it.id] = el)}
                  className={isVisible ? undefined : "hidden"}
                  aria-hidden={isVisible ? undefined : true}
                >
                  {/* Item card (left, stable width on desktop) */}
                  <div
                    className={`md:flex-grow md:basis-0 min-w-0 rounded-2xl border p-5 shadow-sm hover:shadow-md transition-shadow ring-1 ${
                      isActive
                        ? "border-blue-300 ring-blue-200 bg-white"
                        : "border-slate-200 ring-black/5 bg-white/95"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-start gap-2">
                          <span className="mt-1 text-sm font-semibold text-slate-400 flex-none">
                            {displayIndex}.
                          </span>
                          <p className="text-base sm:text-lg font-medium leading-snug flex-1 min-w-0">
                            {it.label}
                            {!isFull && it.onlyFull && (
                              <span className="ml-2 text-xs font-normal text-slate-500 align-middle">
                                (nur Vollversion)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {it.instruction && (
                        <button
                          onClick={() => setActiveInfoId((cur) => (cur === it.id ? null : it.id))}
                          className={`rounded-xl border px-3 py-1.5 text-sm transition hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            isActive
                              ? "bg-blue-50 border-blue-300 text-blue-700"
                              : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                          }`}
                          aria-pressed={isActive}
                          title="Instruktion anzeigen"
                        >
                          Instruktion
                        </button>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleSet(it.id, 0)}
                        className={`rounded-xl px-3 py-2 text-sm font-medium border transition focus:outline-none focus:ring-2 focus:ring-slate-400 ${
                          isNo
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-800 border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        Nein/nicht getestet
                      </button>
                      <button
                        onClick={() => handleSet(it.id, 1)}
                        className={`rounded-xl px-3 py-2 text-sm font-medium border transition focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                          isYes
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-white text-slate-800 border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        Ja
                      </button>
                    </div>

                    {/* Inline instruction on small screens */}
                    {it.instruction && (
                      <div
                        className={`mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 md:hidden ${
                          isActive ? "block" : "hidden"
                        }`}
                        aria-hidden={!isActive}
                      >
                        <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Instruktion</p>
                        <InstructionText text={it.instruction} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

          {/* Absolute desktop instruction panel aligned to active item */}
          {activeItem && (
            <div
              className="hidden md:block absolute right-0 w-[360px]"
              style={{ top: panelTop }}
            >
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-black/5">
                <h2 className="text-base font-semibold mb-2">Instruktionen</h2>
                <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                  Item {ITEMS.findIndex(i => i.id === activeItem.id) + 1}
                </p>
                <p className="text-sm font-medium text-slate-900 mb-2">
                  {activeItem.label}
                </p>
                <InstructionText text={activeItem.instruction} />
              </div>
            </div>
          )}

          {/* Controls below list */}
          <div className="flex items-center justify-between mt-2">
            <button
              onClick={handleReset}
              className="rounded-xl px-4 py-2 text-sm font-medium border border-slate-300 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              Zurücksetzen
            </button>
            <div className="text-sm text-slate-600">
              <span className="inline-block mr-3">Legende:</span>
              <span className="inline-flex items-center mr-3">
                <span className="h-2 w-2 rounded-full bg-emerald-600 mr-1.5"></span>
                Ja = 1 Punkt
              </span>
              <span className="inline-flex items-center">
                <span className="h-2 w-2 rounded-full bg-slate-400 mr-1.5"></span>
                Nein/nicht getestet = 0 Punkte
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/80 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col gap-4 text-xs text-slate-600 sm:text-[13px]">
          <div className="leading-relaxed">
            <p>
              Diese Checkliste basiert auf Cabreira&nbsp;et&nbsp;al., <em>BMJ Neurology Open</em> (2025).{" "}
              <a
                href="https://doi.org/10.1136/bmjno-2024-000918"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-slate-400 hover:decoration-slate-600"
              >
                https://doi.org/10.1136/bmjno-2024-000918
              </a>
            </p>

            <p className="mt-1">
              WebApp entwickelt von J.&nbsp;Jungilligens und J.&nbsp;Beckers (Klinik für Neurologie,
              Knappschaft Kliniken Universitätsklinikum Bochum) sowie S.&nbsp;Popkirov
              (Klinik für Neurologie, Universitätsklinikum Essen).
            </p>

            <p className="mt-3">
              <strong>Datenschutz:</strong> Diese WebApp verarbeitet keinerlei personenbezogene Daten.
              Alle Eingaben werden ausschließlich lokal im Browser gespeichert und nicht an Server
              oder Dritte übertragen. Es erfolgt kein Tracking, keine Identifikation und keine
              Protokollierung.
            </p>

            <p className="mt-3">
              <strong>Haftungsausschluss:</strong> Diese WebApp richtet sich ausschließlich an
              Angehörige der Gesundheitsberufe und dient als ergänzende, nicht validierte
              Orientierungshilfe. Sie ersetzt keine ärztliche Untersuchung, Diagnostik,
              klinische Bewertung oder Therapieentscheidung. Die dargestellten Cut-offs beruhen auf
              Pilotdaten und können eine klinische Beurteilung nicht ersetzen. Die Verantwortung für
              Diagnostik und Therapie liegt vollständig bei den behandelnden Ärztinnen und Ärzten.
              Eine Haftung der Autorinnen/Autoren oder Bereitstellenden für Schäden, die aus der Nutzung
              oder dem Vertrauen auf die bereitgestellten Informationen entstehen, ist – außer bei
              Vorsatz oder grober Fahrlässigkeit – ausgeschlossen.
            </p>

            <p className="mt-2">
              <button
                type="button"
                onClick={() => setShowLegal(true)}
                className="underline decoration-slate-400 hover:decoration-slate-600"
              >
                Impressum
              </button>
            </p>
          </div>
        </div>
      </footer>
      {showLegal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    {/* Overlay */}
    <div
      className="absolute inset-0 bg-black/50"
      onClick={() => setShowLegal(false)}
      aria-hidden="true"
    />
    {/* Dialog */}
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-title"
      className="relative max-w-2xl w-full rounded-2xl bg-white shadow-xl ring-1 ring-black/10"
    >
      <div className="flex items-start justify-between px-4 py-3 border-b border-slate-200">
        <h3 id="legal-title" className="text-base font-semibold">
          Impressum 
        </h3>
        <button
          type="button"
          onClick={() => setShowLegal(false)}
          className="rounded-md px-2 py-1 text-slate-600 hover:bg-slate-100"
          aria-label="Pop-up schließen"
        >
          ✕
        </button>
      </div>

            <div className="px-4 py-4 space-y-4 text-sm leading-relaxed text-slate-700">
              <section>
                <h4 className="font-semibold text-slate-900 mb-1">Impressum</h4>
                <p>
                  Verantwortlich: Dr. J. Jungilligens<br/>
                  Klinik für Neurologie, Knappschaft Kliniken Universitätsklinikum Bochum<br/>
                  In der Schornau 23–25, 44892 Bochum
                </p>
                <p className="mt-2">
                  Kontakt: <a href="mailto:neuropsychologie.bochum@knappschaft-kliniken.de"
                    className="underline decoration-slate-400 hover:decoration-slate-600">
                    neuropsychologie.bochum@knappschaft-kliniken.de
                  </a>
                </p>
                <p className="mt-2 text-slate-600">
                  Hinweis: Diese WebApp ist <strong>kein offizielles Projekt</strong> der Klinik, sondern wurde im Rahmen eines wissenschaftlichen Entwicklungs- und Informationsangebots erstellt.
                </p>
              </section>

            </div>

            <div className="px-4 py-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowLegal(false)}
                className="rounded-lg border px-3 py-1.5 text-sm bg-white hover:bg-slate-50 border-slate-300"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
