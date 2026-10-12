/** Pure gameplay rules. No UI, storage, network or clock reads. */
export type Edge = -1 | 0 | 1;
export type Edges = [Edge, Edge, Edge, Edge];
export type Definition = { version: 1; cutVersion: 1; side: number; edges: Edges[]; rotation: boolean;
  timer: "countdown" | "stopwatch" | "none"; durationMs: number | null; timingVersion: string };
export type Attempt = { id: string; board: (number | null)[]; tray: number[]; turns: number[]; selected: number | null;
  moves: number; elapsedMs: number; status: "ready" | "running" | "paused" | "timeout" | "completed";
  startedAt: number | null; completedAt: number | null; continuedUntimed: boolean };
export type Action = { type: "start" | "pause" | "shuffle" | "rotate" | "hint" | "untimed" }
  | { type: "select"; piece: number } | { type: "place"; piece: number; slot: number }
  | { type: "return"; piece: number };
const integer = (n: unknown, min: number, max: number): n is number => typeof n === "number" && Number.isInteger(n) && n >= min && n <= max;
export function shuffled<T>(values: readonly T[], random = Math.random): T[] {
  const out = [...values];
  for (let i = out.length - 1; i > 0; i--) { const j = Math.min(i, Math.max(0, Math.floor(random() * (i + 1)))); [out[i], out[j]] = [out[j]!, out[i]!]; }
  return out;
}
export function definition(side: number, rotation: boolean, timer: Definition["timer"], random = Math.random): Definition {
  if (!integer(side, 5, 20) || typeof rotation !== "boolean" || !["countdown", "stopwatch", "none"].includes(timer)) throw new Error("Invalid puzzle configuration.");
  const edges: Edges[] = Array.from({ length: side * side }, () => [0, 0, 0, 0]);
  for (let id = 0; id < edges.length; id++) {
    if (id % side < side - 1) { const sign = random() < .5 ? -1 : 1; edges[id]![1] = sign; edges[id + 1]![3] = -sign as Edge; }
    if (id < edges.length - side) { const sign = random() < .5 ? -1 : 1; edges[id]![2] = sign; edges[id + side]![0] = -sign as Edge; }
  }
  return { version: 1, cutVersion: 1, side, edges, rotation, timer,
    durationMs: timer === "countdown" ? Math.ceil(side * side * 20 / 60) * 60_000 : null, timingVersion: "2026-10-13-20s-ceil-minute" };
}
export function newAttempt(d: Definition, id: string, random = Math.random): Attempt {
  return { id, board: Array(d.side ** 2).fill(null), tray: shuffled(d.edges.map((_, i) => i), random),
    turns: d.edges.map(() => d.rotation ? Math.floor(random() * 4) % 4 : 0), selected: null,
    moves: 0, elapsedMs: 0, status: "ready", startedAt: null, completedAt: null, continuedUntimed: false };
}
export function rotated(edges: Edges, turn: number): Edges { return [0, 1, 2, 3].map(i => edges[(i - turn + 4) % 4]!) as Edges; }
export function neighbours(side: number, slot: number) { return [slot >= side ? slot - side : -1, slot % side < side - 1 ? slot + 1 : -1,
  slot < side * (side - 1) ? slot + side : -1, slot % side ? slot - 1 : -1]; }
export function complies(d: Definition, a: Attempt, piece: number, slot: number, ignoreSelected = false): boolean {
  const edges = rotated(d.edges[piece]!, a.turns[piece]!);
  return neighbours(d.side, slot).every((cell, i) => {
    if (cell < 0) return edges[i] === 0;
    const other = a.board[cell];
    return other === null || (ignoreSelected && other === a.selected) || edges[i]! + rotated(d.edges[other!]!, a.turns[other!]!)[(i + 2) % 4]! === 0;
  });
}
export function correctCount(a: Attempt) { return a.board.reduce<number>((n, piece, slot) => n + (piece === slot && a.turns[piece] === 0 ? 1 : 0), 0); }
export function locked(d: Definition, a: Attempt) { const slot = a.board.indexOf(a.selected); return a.selected !== null && slot >= 0 && !complies(d, a, a.selected, slot); }
function finish(d: Definition, a: Attempt, now: number): Attempt {
  return correctCount(a) === d.side ** 2 ? { ...a, status: "completed", completedAt: now, selected: null } : a;
}
export function advance(d: Definition, a: Attempt, deltaMs: number): Attempt {
  if (a.status !== "running" || d.timer === "none" || !Number.isFinite(deltaMs) || deltaMs <= 0) return a;
  const elapsedMs = a.elapsedMs + deltaMs;
  if (d.durationMs !== null && !a.continuedUntimed && elapsedMs >= d.durationMs) return { ...a, elapsedMs: d.durationMs, status: "timeout" };
  return { ...a, elapsedMs };
}
export function act(d: Definition, a: Attempt, action: Action, now: number, random = Math.random): Attempt {
  if (action.type === "start") return a.status === "ready" || a.status === "paused" ? { ...a, status: "running", startedAt: a.startedAt ?? now } : a;
  if (action.type === "pause") return a.status === "running" ? { ...a, status: "paused" } : a;
  if (action.type === "untimed") return a.status === "timeout" ? { ...a, status: "paused", continuedUntimed: true } : a;
  if (a.status !== "running") return a;
  const total = d.side ** 2;
  if ("piece" in action && !integer(action.piece, 0, total - 1)) return a;
  if (action.type === "select") {
    if (locked(d, a) && action.piece !== a.selected) return a;
    if (a.selected === action.piece) return d.rotation ? act(d, a, { type: "rotate" }, now) : { ...a, selected: null };
    return { ...a, selected: action.piece };
  }
  if (action.type === "shuffle") return { ...a, tray: shuffled(a.tray, random) };
  if (action.type === "rotate") {
    if (!d.rotation || a.selected === null) return a;
    const turns = [...a.turns]; turns[a.selected] = (turns[a.selected]! + 1) % 4;
    const next = { ...a, turns }, slot = a.board.indexOf(a.selected);
    if (slot >= 0 && complies(d, next, a.selected, slot)) next.selected = null;
    return finish(d, next, now);
  }
  if (action.type === "return") {
    if (locked(d, a) && action.piece !== a.selected) return a;
    const slot = a.board.indexOf(action.piece); if (slot < 0) return a;
    const board = [...a.board]; board[slot] = null;
    return { ...a, board, tray: [...a.tray, action.piece], selected: null, moves: a.moves + 1 };
  }
  if (action.type === "place") {
    const { piece, slot } = action;
    if (!integer(slot, 0, total - 1) || (locked(d, a) && piece !== a.selected)) return a;
    const from = a.board.indexOf(piece), occupant = a.board[slot]!;
    if (from === slot) return a;
    const next: Attempt = { ...a, board: [...a.board], tray: [...a.tray], selected: piece };
    next.board[slot] = piece;
    if (from >= 0) next.board[from] = occupant;
    else { next.tray = next.tray.filter(id => id !== piece); if (occupant !== null) next.tray.push(occupant); }
    // Validate displaced piece against the FINAL board, including the moving neighbour.
    if (from >= 0 && occupant !== null && !complies(d, next, occupant, from)) return a;
    const fits = complies(d, next, piece, slot);
    if (!d.rotation && !fits) return a;
    next.selected = fits ? null : piece;
    next.moves++;
    return finish(d, next, now);
  }
  if (action.type === "hint") {
    const corners = [0, d.side - 1, total - d.side, total - 1];
    const unsolved = (id: number) => a.board[id] !== id || a.turns[id] !== 0;
    const id = corners.find(unsolved) ?? a.tray[0] ?? a.board.find((id): id is number => id !== null && unsolved(id));
    if (id === undefined) return a;
    const next: Attempt = { ...a, board: [...a.board], tray: [...a.tray], turns: [...a.turns], selected: null, moves: a.moves + 1 };
    const evict = (slot: number) => { const pid = next.board[slot]; if (pid !== null && pid !== undefined) { next.board[slot] = null; next.tray.push(pid); } };
    const old = next.board.indexOf(id); if (old >= 0) next.board[old] = null;
    evict(id); next.tray = next.tray.filter(pid => pid !== id); next.board[id] = id; next.turns[id] = 0;
    for (const slot of neighbours(d.side, id)) if (slot >= 0 && next.board[slot] !== null && !complies(d, next, next.board[slot]!, slot)) evict(slot);
    // A formerly selected non-compliant piece also needs a safe home in the tray.
    for (let slot = 0; slot < total; slot++) if (next.board[slot] !== null && !complies(d, next, next.board[slot]!, slot)) evict(slot);
    return finish(d, next, now);
  }
  return a;
}
export function validate(d: Definition, a: Attempt): void {
  const fail = () => { throw new Error("Saved puzzle is damaged or unsupported. The original save has been kept."); };
  if (!d || !a || d.version !== 1 || d.cutVersion !== 1 || !integer(d.side, 5, 20) || typeof d.rotation !== "boolean" || !["countdown", "stopwatch", "none"].includes(d.timer)) return fail();
  const n = d.side ** 2;
  if (!Array.isArray(d.edges) || d.edges.length !== n || d.edges.some(e => !Array.isArray(e) || e.length !== 4 || e.some(v => !integer(v, -1, 1)))) return fail();
  if (typeof d.timingVersion !== "string" || d.timingVersion.length > 80 || (d.timer === "countdown" ? !integer(d.durationMs, 60000, 86400000) : d.durationMs !== null)) return fail();
  for (let id = 0; id < n; id++) for (const [dir, slot] of neighbours(d.side, id).entries()) {
    if (slot < 0 ? d.edges[id]![dir] !== 0 : d.edges[id]![dir] === 0 || d.edges[id]![dir]! + d.edges[slot]![(dir + 2) % 4]! !== 0) return fail();
  }
  if (!Array.isArray(a.board) || a.board.length !== n || !Array.isArray(a.tray) || a.tray.length > n || !Array.isArray(a.turns) || a.turns.length !== n || a.turns.some(t => !integer(t, 0, d.rotation ? 3 : 0))) return fail();
  const ids = [...a.board.filter(p => p !== null), ...a.tray];
  if (ids.length !== n || new Set(ids).size !== n || ids.some(p => !integer(p, 0, n - 1)) || (a.selected !== null && !integer(a.selected, 0, n - 1))) return fail();
  if (!integer(a.moves, 0, Number.MAX_SAFE_INTEGER) || !Number.isFinite(a.elapsedMs) || a.elapsedMs < 0 || a.elapsedMs > Number.MAX_SAFE_INTEGER || typeof a.id !== "string" || !a.id || a.id.length > 100 || typeof a.continuedUntimed !== "boolean") return fail();
  if (!["ready", "running", "paused", "timeout", "completed"].includes(a.status) || (a.startedAt !== null && !integer(a.startedAt, 0, Number.MAX_SAFE_INTEGER)) || (a.completedAt !== null && !integer(a.completedAt, 0, Number.MAX_SAFE_INTEGER))) return fail();
  if ((a.status === "ready" && (a.startedAt !== null || a.moves !== 0 || a.elapsedMs !== 0 || a.board.some(p => p !== null))) || (a.status !== "ready" && a.startedAt === null)) return fail();
  if ((a.status === "completed") !== (correctCount(a) === n) || (a.status === "completed") !== (a.completedAt !== null)) return fail();
  if (a.continuedUntimed && d.timer !== "countdown") return fail();
  if (d.durationMs !== null && !a.continuedUntimed && (a.elapsedMs > d.durationMs || (a.elapsedMs === d.durationMs && a.status === "running"))) return fail();
  if (a.status === "timeout" && (d.durationMs === null || a.continuedUntimed || a.elapsedMs < d.durationMs)) return fail();
  for (let slot = 0; slot < n; slot++) {
    const piece = a.board[slot];
    if (piece !== null && !(d.rotation && piece === a.selected) && !complies(d, a, piece!, slot, d.rotation)) return fail();
  }
}
