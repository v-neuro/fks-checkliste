import assert from "node:assert/strict";
import test from "node:test";
import { emptyChecklist, parseChecklist } from "../src/checklist-storage.js";

test("legacy state preserves every answer, including zero and unset values", () => {
  const saved = emptyChecklist();
  saved.isFull = true;
  saved.selections[1] = 0;
  saved.selections[11] = 1;
  assert.deepEqual(parseChecklist(JSON.stringify(saved)), saved);
  assert.deepEqual(parseChecklist(null), emptyChecklist());
});

test("rejects malformed, oversized, nested and unexpected persisted data", () => {
  const saved = emptyChecklist();
  const bad = ["", "{", "null", "[]", "true", " ".repeat(4097),
    JSON.stringify({ ...saved, isFull: "false" }),
    JSON.stringify({ ...saved, selections: [] }),
    JSON.stringify({ ...saved, selections: { ...saved.selections, 1: "1" } }),
    JSON.stringify({ ...saved, selections: { ...saved.selections, 1: 2 } }),
    JSON.stringify({ ...saved, selections: { ...saved.selections, 1: {} } }),
    JSON.stringify({ ...saved, selections: { ...saved.selections, "01": 1 } }),
    JSON.stringify({ ...saved, selections: { 1: 1 } }),
    JSON.stringify({ ...saved, unknown: true }),
    JSON.stringify(saved).replace('"selections":{', '"selections":{"__proto__":{"polluted":true},'),
    JSON.stringify(saved).replace('"selections":{', '"selections":{"constructor":{},'),
  ];
  for (const raw of bad) assert.throws(() => parseChecklist(raw));
  assert.equal({}.polluted, undefined);
});

test("normalizes to independent records without sharing mutable defaults", () => {
  const a = parseChecklist(null);
  a.selections[1] = 1;
  assert.equal(parseChecklist(null).selections[1], -1);
});
