export type Picture = {
  id: string;
  title: string;
  theme: "My Photo";
  source: "photo";
  addedAt: number;
  data: string;
  width: 1536;
  height: 1024;
};
export type Preferences = { sound: boolean; haptics: boolean };
export const defaultPreferences: Preferences = { sound: true, haptics: true };
export type Draft = {
  pictureId?: string;
  gridIndex: number;
  rotation: boolean;
  timer: "stopwatch" | "countdown";
};
export const defaultDraft: Draft = {
  gridIndex: 2,
  rotation: false,
  timer: "stopwatch",
};
export function validatePicture(value: unknown): Picture {
  if (!value || typeof value !== "object")
    throw new Error(
      "A saved picture could not be read. Your stored data has been kept.",
    );
  const p = value as Partial<Picture>;
  if (
    typeof p.id !== "string" ||
    p.id.length > 80 ||
    typeof p.title !== "string" ||
    !p.title.trim() ||
    p.title.length > 100 ||
    p.source !== "photo" ||
    p.theme !== "My Photo" ||
    typeof p.addedAt !== "number" ||
    !Number.isFinite(p.addedAt) ||
    p.width !== 1536 ||
    p.height !== 1024 ||
    typeof p.data !== "string" ||
    p.data.length > 6_000_000 ||
    !/^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/.test(p.data)
  )
    throw new Error(
      "A saved picture uses unsupported or damaged data. It has not been overwritten.",
    );
  return p as Picture;
}
