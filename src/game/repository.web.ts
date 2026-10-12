import { openDatabase } from "../local/repository.web";
import { GameRecord, validateRecord } from "./record";
const future = (r: GameRecord) => r?.schema > 1 || r?.definition?.version > 1 || r?.definition?.cutVersion > 1;
export async function readGames(): Promise<{ records: GameRecord[]; issues: string[] }> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("games", "readonly"), request = tx.objectStore("games").getAll();
    tx.oncomplete = () => {
      const records: GameRecord[] = [], issues: string[] = [];
      for (const row of request.result) {
        try { if (!Number.isSafeInteger(row.revision) || row.revision < 1 || row.current?.id !== row.id) throw new Error();
          records.push({ ...validateRecord(row.current), revision: row.revision });
        } catch {
          if (row.current?.schema === 1 && !future(row.current) && row.previous?.id === row.id && Number.isSafeInteger(row.revision) && row.revision > 0) {
            try { records.push({ ...validateRecord(row.previous), revision: row.revision }); issues.push("A damaged puzzle was recovered from its last valid snapshot."); continue; } catch { /* preserve both bytes */ }
          }
          issues.push("A damaged or newer puzzle save was kept unchanged and could not be opened.");
        }
      }
      db.close(); resolve({ records, issues });
    };
    tx.onabort = tx.onerror = () => { db.close(); reject(new Error("Could not read saved puzzles. Retry without clearing storage.")); };
  });
}
export async function writeGame(record: GameRecord, expectedRevision: number): Promise<GameRecord> {
  validateRecord(record);
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("games", "readwrite"), store = tx.objectStore("games");
    const request = store.get(record.id); let error = "Could not save this action. Storage may be full or blocked. Play is paused; retry saving.";
    const next = { ...record, revision: expectedRevision + 1 };
    request.onsuccess = () => {
      const prior = request.result;
      if ((prior?.revision ?? 0) !== expectedRevision || (prior && (prior.current?.schema !== 1 || future(prior.current)))) {
        error = "This puzzle changed in another tab or uses a newer save format. Reload before continuing; the saved puzzle was kept."; tx.abort(); return;
      }
      let previous = prior?.current ?? null;
      try { if (previous) validateRecord(previous); } catch { previous = prior?.previous ?? null; }
      try { store.put({ id: record.id, revision: next.revision, current: next, previous }); } catch { tx.abort(); }
    };
    tx.oncomplete = () => { db.close(); resolve(next); };
    tx.onabort = tx.onerror = () => { db.close(); reject(new Error(error)); };
  });
}
export async function deleteGame(id: string): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => { const tx = db.transaction("games", "readwrite"); tx.objectStore("games").delete(id);
    tx.oncomplete = () => { db.close(); resolve(); }; tx.onabort = tx.onerror = () => { db.close(); reject(new Error("Could not delete this puzzle. Please retry.")); }; });
}
