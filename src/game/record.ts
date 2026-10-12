import type { HomePuzzle } from "../home/review";
import { Attempt, Definition, correctCount, validate } from "./engine";
import { inspectRaster } from "../images/limits";
const checkedImages = new Set<string>();
function checkImage(uri: string) {
  if (checkedImages.has(uri)) return;
  // Canvas saves have small JPEG headers. Bound dimensions before bitmap decode;
  // unsupported/corrupt headers fail without allocating a full decoded image.
  const binary = atob(uri.slice(uri.indexOf(",") + 1, uri.indexOf(",") + 1 + 131072));
  const info = inspectRaster(Uint8Array.from(binary, c => c.charCodeAt(0)));
  if (info.mime !== "image/jpeg" || info.width !== 1024 || info.height !== 1024) throw new Error("Saved puzzle image dimensions are invalid.");
  if (checkedImages.size >= 4) checkedImages.delete(checkedImages.values().next().value!);
  checkedImages.add(uri);
}
export type GameRecord = { schema: 1; id: string; revision: number; puzzle: HomePuzzle; definition: Definition; attempt: Attempt; rewardIds?: string[];
  attemptsStarted: number; lastStartedAt: number | null; history: { id: string; moves: number; elapsedMs: number; status: Attempt["status"]; startedAt: number | null; completedAt: number | null; continuedUntimed: boolean }[] };
export function validateRecord(value: unknown): GameRecord {
  const r = value as GameRecord;
  if (!r || r.schema !== 1 || typeof r.id !== "string" || !r.id || r.id.length > 160 || !Number.isSafeInteger(r.revision) || r.revision < 0) throw new Error("Unsupported puzzle save. Existing data was kept.");
  validate(r.definition, r.attempt);
  if (r.rewardIds !== undefined && (!Array.isArray(r.rewardIds) || r.rewardIds.length > 100000 || r.rewardIds.some(id => typeof id !== "string" || id.length > 160) || new Set(r.rewardIds).size !== r.rewardIds.length)) throw new Error("Saved reward state is invalid.");
  const p = r.puzzle, image = p?.image as { uri?: unknown };
  if (!p || p.id !== r.id || typeof p.title !== "string" || !p.title || p.title.length > 150 || typeof image?.uri !== "string" || image.uri.length > 6_000_000 || !/^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/.test(image.uri) ||
    !p.settings || p.settings.gridIndex !== r.definition.side - 5 || p.settings.rotation !== r.definition.rotation || p.settings.timer !== r.definition.timer ||
    (p.settings.pictureId !== undefined && (typeof p.settings.pictureId !== "string" || p.settings.pictureId.length > 80)) || p.pieces !== r.definition.side ** 2 ||
    typeof p.created !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(p.created) || typeof p.lastPlayed !== "string" || p.lastPlayed.length > 40 || !Number.isFinite(p.progress) || p.progress < 0 || p.progress > 100 ||
    !Number.isSafeInteger(r.attemptsStarted) || r.attemptsStarted < 0 || (r.lastStartedAt !== null && (!Number.isSafeInteger(r.lastStartedAt) || r.lastStartedAt < 0)) ||
    !Array.isArray(r.history) || r.history.length > 10000) throw new Error("Saved puzzle metadata is damaged. Existing data was kept.");
  checkImage(image.uri);
  const validTime = (v: unknown) => v === null || (typeof v === "number" && Number.isSafeInteger(v) && v >= 0);
  for (const h of r.history) if (!h || typeof h.id !== "string" || !h.id || h.id.length > 100 || !Number.isSafeInteger(h.moves) || h.moves < 0 || !Number.isFinite(h.elapsedMs) || h.elapsedMs < 0 || h.elapsedMs > Number.MAX_SAFE_INTEGER || !["ready", "running", "paused", "timeout", "completed"].includes(h.status) || !validTime(h.startedAt) || !validTime(h.completedAt) || typeof h.continuedUntimed !== "boolean" || (h.status === "completed") !== (h.completedAt !== null)) throw new Error("Invalid attempt history.");
  if (new Set([r.attempt.id, ...r.history.map(h => h.id)]).size !== r.history.length + 1 || r.attemptsStarted !== r.history.filter(h => h.startedAt !== null).length + (r.attempt.startedAt === null ? 0 : 1)) throw new Error("Saved attempt counts are inconsistent.");
  return r;
}
export function homePuzzle(r: GameRecord): HomePuzzle { return { ...r.puzzle, progress: r.attempt.status === "completed" ? 100 : Math.min(99, Math.round(correctCount(r.attempt) / r.definition.side ** 2 * 100)),
  lastPlayed: r.lastStartedAt ? new Date(r.lastStartedAt).toISOString() : "", reviewLastPlayedLabel: r.lastStartedAt ? undefined : "Not yet" }; }
