export const STORAGE_KEY = "fcd-checklist-v1";
export const LOCK_NAME = `${STORAGE_KEY}:editor`;
const ids = Array.from({ length: 11 }, (_, index) => String(index + 1));

export function emptyChecklist() {
  return { selections: Object.fromEntries(ids.map(id => [id, -1])), isFull: false };
}

// LocalStorage is untrusted input. Keep the legacy format but accept only its schema.
export function parseChecklist(raw) {
  if (raw === null) return emptyChecklist();
  if (typeof raw !== "string" || raw.length > 4096) throw new Error("Invalid size");
  const saved = JSON.parse(raw);
  if (!saved || Array.isArray(saved) || typeof saved !== "object" ||
      Object.keys(saved).sort().join() !== "isFull,selections" ||
      typeof saved.isFull !== "boolean") throw new Error("Invalid checklist");
  const values = saved.selections;
  if (!values || Array.isArray(values) || typeof values !== "object" ||
      Object.keys(values).length !== ids.length ||
      !Object.keys(values).every(id => ids.includes(id)) ||
      !ids.every(id => Object.hasOwn(values, id) && [-1, 0, 1].includes(values[id]))) {
    throw new Error("Invalid selections");
  }
  return { selections: Object.fromEntries(ids.map(id => [id, values[id]])), isFull: saved.isFull };
}
