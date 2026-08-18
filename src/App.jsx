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
      <ul className="list-disc pl-5 space-y-1.5 text-sm leading-relaxed text-[#24465f] marker:text-[#255e8a]">
        {lines.map((l, i) => (
          <li key={i}>{l.replace(/^[-•]\s*/, "")}</li>
        ))}
      </ul>
    );
  }
  return (
    <p className="text-sm leading-relaxed whitespace-pre-line text-[#24465f]">
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
    <div className="relative min-h-screen overflow-x-clip text-[#002747]">
      <div
        className="pointer-events-none absolute -right-24 top-[28rem] h-80 w-80 rounded-full bg-[#aec8db]/20 blur-3xl"
        aria-hidden="true"
      />
      {/* Header */}
      <header className="relative border-b border-[#aec8db]/60 bg-gradient-to-br from-white via-[#f4f9fc] to-[#dceaf3]">
        <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-9">
          <div className="flex items-start justify-between gap-6">
            <h1 className="max-w-4xl text-2xl font-bold leading-tight tracking-[-0.025em] text-[#002747] sm:text-3xl lg:text-[2.15rem]">
              Funktionelle kognitive Störungen – Diagnostische Orientierungshilfe
            </h1>
            <img
              src="/Logo.png"
              alt="Verhaltensneurologie"
              width="2953"
              height="2362"
              decoding="async"
              fetchPriority="high"
              className="hidden w-28 flex-none rounded-xl bg-white/80 p-1.5 shadow-sm ring-1 ring-[#aec8db]/50 sm:block lg:w-32"
            />
          </div>

          <section
            aria-labelledby="checklist-intro-title"
            className="relative mt-6 max-w-4xl overflow-hidden rounded-3xl border border-[#c9dce8] bg-white/80 p-5 shadow-[0_14px_40px_-30px_rgba(0,39,71,0.55)] sm:p-6"
          >
            <div className="absolute inset-y-0 left-0 w-1.5 bg-[#255e8a]" aria-hidden="true" />
            <h2 id="checklist-intro-title" className="text-lg font-bold text-[#002747]">
              Interaktive FKS-Checkliste zur diagnostischen Orientierung
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#45657c]">
              Diese Orientierungshilfe unterstützt Angehörige der Gesundheitsberufe bei der
              klinischen Einschätzung funktioneller kognitiver Störungen (FKS). Die Kurzversion
              umfasst sieben, die Vollversion elf Hinweise. Sie ergänzt die klinische Beurteilung,
              ersetzt aber keine ärztliche Untersuchung oder Diagnostik.
            </p>
          </section>

          <div className="mt-6 inline-flex items-center gap-1 rounded-2xl border border-[#aec8db]/70 bg-white/75 p-1.5 shadow-sm" aria-label="Version der Checkliste">
            <span className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${!isFull ? "bg-[#e2eef5] text-[#002747]" : "text-[#597386]"}`}>
              Kurzversion
            </span>
            <button
              role="switch"
              aria-checked={isFull}
              onClick={handleVersionToggle}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ring-1 ring-inset ${
                isFull ? "bg-[#255e8a] ring-[#255e8a]" : "bg-[#d4e3ed] ring-[#aec8db]"
              } focus:outline-none focus:ring-2 focus:ring-[#255e8a] focus:ring-offset-2`}
              title="Kurz-/Vollversion umschalten"
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                  isFull ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${isFull ? "bg-[#e2eef5] text-[#002747]" : "text-[#597386]"}`}>
              Vollversion
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <section className="grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_360px]">
          <aside className="sticky top-3 z-20 space-y-4 self-start md:top-5 md:col-start-2 md:row-start-1">
            <div className="rounded-3xl border border-white/80 bg-white/95 p-4 shadow-[0_18px_45px_-24px_rgba(0,39,71,0.55)] ring-1 ring-[#aec8db]/50 backdrop-blur sm:p-5">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5f7b8e]">Aktueller Score</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-4xl font-bold tracking-tight text-[#002747]">{totalScore}</span>
                    <span className="text-sm font-medium text-[#5f7b8e]">von {maxScore} Punkten</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 w-full">
                <div className="mb-2 flex items-center justify-between text-xs font-medium text-[#5f7b8e]">
                  <span>Punkte</span>
                  <span>Cut-off: {cutoff}</span>
                </div>
                <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-[#dce8ef]">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full transition-all duration-300 ${totalScore >= cutoff ? "bg-[#d46a2c]" : "bg-[#255e8a]"}`}
                    style={{ width: `${Math.max(0, Math.min(100, Math.round((totalScore / maxScore) * 100)))}%` }}
                    aria-label={`Score-Balken ${totalScore} von ${maxScore}`}
                  />
                  <div className="absolute inset-y-0" style={{ left: `${cutoffPct}%` }}>
                    <div
                      className="h-full w-0.5 bg-[#002747]/70"
                      title={`Cut-off ${cutoff}`}
                      aria-label={`Cut-off ${cutoff}`}
                      role="img"
                    />
                  </div>
                </div>
                <p className={`mt-3 rounded-2xl border px-3.5 py-3 text-xs leading-relaxed ${totalScore >= cutoff ? "border-[#efbd9c] bg-[#fff3ea] text-[#8a3e16]" : "border-[#c9dce8] bg-[#edf5fa] text-[#365b75]"}`}>
                  {probText}
                </p>
              </div>
            </div>

            {activeItem && (
              <div className="hidden overflow-hidden rounded-3xl border border-[#b9d0df] bg-white shadow-[0_18px_45px_-30px_rgba(0,39,71,0.65)] md:block">
                <div className="border-b border-[#d8e6ee] bg-gradient-to-r from-[#e7f1f7] to-[#f5f9fc] px-5 py-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#255e8a]">Instruktionen</p>
                </div>
                <div className="max-h-[calc(100vh-22rem)] overflow-y-auto p-5">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#6a8496]">
                    Item {ITEMS.findIndex(i => i.id === activeItem.id) + 1}
                  </p>
                  <p className="mb-3 text-sm font-semibold leading-snug text-[#002747]">
                    {activeItem.label}
                  </p>
                  <InstructionText text={activeItem.instruction} />
                </div>
              </div>
            )}
          </aside>

          {/* Items */}
          <div className="space-y-4 md:col-start-1 md:row-start-1">
          {ITEMS.map((it, idx) => {
              const val = selections[it.id];
              const isYes = val === 1;
              const isNo = val === 0;
              const isActive = activeInfoId === it.id;
              const isVisible = isFull || !it.onlyFull;
              const displayIndex = isFull || !isVisible
                ? idx + 1
                : visibleItems.findIndex((item) => item.id === it.id) + 1;

              return (
                <div
                  key={it.id}
                  className={isVisible ? undefined : "hidden"}
                  aria-hidden={isVisible ? undefined : true}
                >
                  {/* Item card (left, stable width on desktop) */}
                  <div
                    className={`min-w-0 rounded-3xl border p-5 shadow-[0_10px_30px_-26px_rgba(0,39,71,0.65)] transition-all duration-200 md:flex-grow md:basis-0 sm:p-6 ${
                      isActive
                        ? "border-[#6f9fbe] bg-white ring-4 ring-[#aec8db]/25"
                        : "border-[#d5e3ec] bg-white/95 hover:-translate-y-0.5 hover:border-[#aec8db] hover:shadow-[0_18px_40px_-28px_rgba(0,39,71,0.6)]"
                    }`}
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      <span className={`mt-0.5 flex-none text-sm font-bold leading-6 ${isActive ? "text-[#255e8a]" : "text-[#7892a4]"}`}>
                        {displayIndex}.
                      </span>
                      <div className="flex-1">
                        <div className="flex items-start gap-2">
                          <p className="min-w-0 flex-1 text-base font-semibold leading-snug text-[#0b3656] sm:text-lg">
                            {it.label}
                            {!isFull && it.onlyFull && (
                              <span className="ml-2 align-middle text-xs font-normal text-[#668092]">
                                (nur Vollversion)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {it.instruction && (
                        <button
                          onClick={() => setActiveInfoId((cur) => (cur === it.id ? null : it.id))}
                          className={`rounded-xl border px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#255e8a] focus:ring-offset-2 ${
                            isActive
                              ? "border-[#6f9fbe] bg-[#e5f0f6] text-[#174e77]"
                              : "border-[#c9dce8] bg-white text-[#365b75] hover:border-[#8cb1ca] hover:bg-[#f4f9fc]"
                          }`}
                          aria-pressed={isActive}
                          title="Instruktion anzeigen"
                        >
                          <span className="sm:hidden">Info</span>
                          <span className="hidden sm:inline">Instruktion</span>
                        </button>
                      )}
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[#e3edf3] pt-4">
                      <button
                        onClick={() => handleSet(it.id, 0)}
                        className={`rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#52758d] focus:ring-offset-2 ${
                          isNo
                            ? "border-[#002747] bg-[#002747] text-white shadow-sm"
                            : "border-[#c9dce8] bg-white text-[#36566e] hover:border-[#8eabba] hover:bg-[#f4f8fa]"
                        }`}
                      >
                        Nein/nicht getestet
                      </button>
                      <button
                        onClick={() => handleSet(it.id, 1)}
                        className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#255e8a] focus:ring-offset-2 ${
                          isYes
                            ? "border-[#255e8a] bg-[#255e8a] text-white shadow-sm"
                            : "border-[#c9dce8] bg-white text-[#36566e] hover:border-[#8eabba] hover:bg-[#f4f8fa]"
                        }`}
                      >
                        Ja
                      </button>
                    </div>

                    {/* Inline instruction on small screens */}
                    {it.instruction && (
                      <div
                        className={`mt-4 rounded-2xl border border-[#c9dce8] bg-[#f0f7fb] p-4 md:hidden ${
                          isActive ? "block" : "hidden"
                        }`}
                        aria-hidden={!isActive}
                      >
                        <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[#255e8a]">Instruktion</p>
                        <InstructionText text={it.instruction} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

          {/* Controls below list */}
          <div className="mt-4">
            <button
              onClick={handleReset}
              className="rounded-xl border border-[#b9d0df] bg-white px-4 py-2.5 text-sm font-semibold text-[#365b75] transition hover:border-[#8cb1ca] hover:bg-[#f4f9fc] focus:outline-none focus:ring-2 focus:ring-[#255e8a] focus:ring-offset-2"
            >
              Zurücksetzen
            </button>
          </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-[#aec8db]/60 bg-[#e8f1f6]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-7 text-xs text-[#4d6c81] sm:px-6 sm:text-[13px]">
          <div className="leading-relaxed">
            <p>
              Diese Checkliste basiert auf Cabreira&nbsp;et&nbsp;al., <em>BMJ Neurology Open</em> (2025).{" "}
              <a
                href="https://doi.org/10.1136/bmjno-2024-000918"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#255e8a] underline decoration-[#8cb1ca] underline-offset-2 hover:decoration-[#255e8a]"
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
                className="font-medium text-[#255e8a] underline decoration-[#8cb1ca] underline-offset-2 hover:decoration-[#255e8a]"
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
      className="relative max-w-2xl w-full overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-[#aec8db]"
    >
      <div className="flex items-start justify-between border-b border-[#c9dce8] bg-[#edf5fa] px-5 py-4">
        <h3 id="legal-title" className="text-base font-bold text-[#002747]">
          Impressum 
        </h3>
        <button
          type="button"
          onClick={() => setShowLegal(false)}
          className="rounded-lg px-2 py-1 text-[#45657c] hover:bg-[#dceaf3]"
          aria-label="Pop-up schließen"
        >
          ✕
        </button>
      </div>

            <div className="space-y-4 px-5 py-5 text-sm leading-relaxed text-[#365b75]">
              <section>
                <h4 className="mb-1 font-semibold text-[#002747]">Impressum</h4>
                <p>
                  Verantwortlich: Dr. J. Jungilligens<br/>
                  Klinik für Neurologie, Knappschaft Kliniken Universitätsklinikum Bochum<br/>
                  In der Schornau 23–25, 44892 Bochum
                </p>
                <p className="mt-2">
                  Kontakt: <a href="mailto:neuropsychologie.bochum@knappschaft-kliniken.de"
                    className="text-[#255e8a] underline decoration-[#8cb1ca] hover:decoration-[#255e8a]">
                    neuropsychologie.bochum@knappschaft-kliniken.de
                  </a>
                </p>
                <p className="mt-2 text-[#597386]">
                  Hinweis: Diese WebApp ist <strong>kein offizielles Projekt</strong> der Klinik, sondern wurde im Rahmen eines wissenschaftlichen Entwicklungs- und Informationsangebots erstellt.
                </p>
              </section>

            </div>

            <div className="flex justify-end border-t border-[#d5e3ec] bg-[#f8fbfd] px-5 py-4">
              <button
                type="button"
                onClick={() => setShowLegal(false)}
                className="rounded-xl border border-[#255e8a] bg-[#255e8a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#174e77] focus:outline-none focus:ring-2 focus:ring-[#255e8a] focus:ring-offset-2"
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
