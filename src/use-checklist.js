import { useEffect, useRef, useState } from "react";
import { emptyChecklist, LOCK_NAME, parseChecklist, STORAGE_KEY } from "./checklist-storage.js";

export function useChecklist() {
  const [data, setData] = useState(emptyChecklist);
  const [phase, setPhase] = useState("loading");
  const [resume, setResume] = useState(0);
  const [canReplaceInvalid, setCanReplaceInvalid] = useState(false);
  const current = useRef(data);
  const storage = useRef({ active: false, raw: null });
  const lockSequence = useRef(Promise.resolve());

  useEffect(() => {
    let stopped = false;
    let release;
    const load = persistent => {
      if (stopped) return;
      let raw;
      try { raw = localStorage.getItem(STORAGE_KEY); }
      catch { setPhase("memory"); return; }
      storage.current = { active: persistent, raw };
      setCanReplaceInvalid(persistent);
      try {
        const saved = parseChecklist(raw);
        current.current = saved;
        setData(saved);
        setPhase(persistent ? "ready" : "memory");
      } catch { setPhase("invalid"); }
    };
    if (navigator.locks?.request) {
      // StrictMode remounts effects before pending Web Locks callbacks finish.
      // Settle this hook's previous request before asking for its next lock.
      const request = lockSequence.current.catch(() => {}).then(() => {
        if (stopped) return;
        return navigator.locks.request(LOCK_NAME, { ifAvailable: true }, async lock => {
          if (stopped) return;
          if (!lock) { setPhase("blocked"); return; }
          // Hold the lock across restoration and every write, until this page leaves.
          const held = new Promise(resolve => { release = resolve; });
          load(true);
          await held;
        });
      });
      lockSequence.current = request;
      request.catch(() => { if (!stopped) load(false); });
    } else load(false);

    const leave = () => {
      stopped = true;
      storage.current.active = false;
      release?.();
      setPhase("loading");
    };
    const returnToPage = event => { if (event.persisted) setResume(value => value + 1); };
    const changed = event => {
      if (storage.current.active && event.storageArea === localStorage &&
          (event.key === STORAGE_KEY || event.key === null)) {
        storage.current.active = false;
        setPhase("conflict");
      }
    };
    window.addEventListener("pagehide", leave);
    window.addEventListener("pageshow", returnToPage);
    window.addEventListener("storage", changed);
    return () => {
      stopped = true;
      storage.current.active = false;
      release?.();
      window.removeEventListener("pagehide", leave);
      window.removeEventListener("pageshow", returnToPage);
      window.removeEventListener("storage", changed);
    };
  }, [resume]);

  const update = (change, resetInvalid = false) => {
    if (!["ready", "memory"].includes(phase) && !(phase === "invalid" && resetInvalid)) return;
    const next = change(current.current);
    if (storage.current.active) {
      try {
        // Older app tabs do not participate in Web Locks. Detect their writes too.
        if (localStorage.getItem(STORAGE_KEY) !== storage.current.raw) {
          storage.current.active = false;
          setPhase("conflict");
          return;
        }
        const raw = JSON.stringify(next);
        localStorage.setItem(STORAGE_KEY, raw); // One atomic write; no delete-first window.
        storage.current.raw = raw;
        setPhase("ready");
      } catch {
        storage.current.active = false;
        setPhase("memory");
      }
    } else if (resetInvalid) setPhase("memory");
    current.current = next;
    setData(next);
  };
  return { ...data, phase, update, canReplaceInvalid };
}
