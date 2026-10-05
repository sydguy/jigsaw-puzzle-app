import { Picture, Preferences } from "./types";
const unavailable = () =>
  new Error(
    "Native storage is not connected yet. Use the local browser preview.",
  );
export async function readPictures(): Promise<Picture[]> {
  throw unavailable();
}
export async function putPicture(_picture: Picture): Promise<void> {
  throw unavailable();
}
export async function removePicture(_id: string): Promise<void> {
  throw unavailable();
}
export async function readPreferences(): Promise<Preferences | null> {
  return null;
}
export async function putPreferences(_preferences: Preferences): Promise<void> {
  throw unavailable();
}
