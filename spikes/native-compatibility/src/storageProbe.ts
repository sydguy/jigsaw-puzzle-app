import { openDatabaseAsync } from 'expo-sqlite';

export async function probeStorage(): Promise<string> {
  const db = await openDatabaseAsync('compatibility-probe.db');
  try {
    await db.execAsync('CREATE TABLE IF NOT EXISTS probe (id INTEGER PRIMARY KEY, value TEXT NOT NULL)');
    const token = `probe-${Date.now()}`;
    await db.withExclusiveTransactionAsync(async tx => {
      await tx.runAsync('INSERT OR REPLACE INTO probe (id,value) VALUES (?,?)', 1, token);
    });
    const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM probe WHERE id = ?', 1);
    if (row?.value !== token) throw new Error('SQLite roundtrip failed');
    return 'Native SQLite transaction/readback passed. Process-kill durability remains untested.';
  } finally { await db.closeAsync(); }
}
