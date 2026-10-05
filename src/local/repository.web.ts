import { Picture, Preferences, validatePicture } from "./types";
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("jigsaw-browser-preview", 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore("pictures", { keyPath: "id" });
      request.result.createObjectStore("preferences");
    };
    request.onerror = () =>
      reject(
        new Error(
          "Browser storage is unavailable or uses a newer version. Your data has not been changed.",
        ),
      );
    request.onblocked = () =>
      reject(new Error("Close other preview tabs, then retry storage."));
    request.onsuccess = () => {
      request.result.onversionchange = () => request.result.close();
      resolve(request.result);
    };
  });
}
async function transact<T>(
  store: string,
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const fail = () => {
      database.close();
      reject(
        new Error(
          "Could not save or read local data. Storage may be full or blocked. Your previous saved data has been kept.",
        ),
      );
    };
    try {
      const transaction = database.transaction(store, mode);
      const request = action(transaction.objectStore(store));
      // Request success alone is not a durable acknowledgement. Wait for commit.
      transaction.oncomplete = () => {
        database.close();
        resolve(request.result);
      };
      transaction.onabort = transaction.onerror = fail;
    } catch {
      fail();
    }
  });
}
export async function readPictures(): Promise<Picture[]> {
  const rows: unknown[] = await transact("pictures", "readonly", (store) =>
    store.getAll(),
  );
  return rows.map(validatePicture);
}
export async function putPicture(picture: Picture): Promise<void> {
  validatePicture(picture);
  await transact("pictures", "readwrite", (store) => store.put(picture));
}
export async function removePicture(id: string): Promise<void> {
  await transact("pictures", "readwrite", (store) => store.delete(id));
}
export async function readPreferences(): Promise<Preferences | null> {
  const value: unknown = await transact("preferences", "readonly", (store) =>
    store.get("guest"),
  );
  if (value == null) return null;
  if (
    typeof value !== "object" ||
    !("sound" in value) ||
    !("haptics" in value) ||
    typeof value.sound !== "boolean" ||
    typeof value.haptics !== "boolean"
  )
    throw new Error(
      "Saved preferences could not be read. Existing data was kept.",
    );
  return { sound: value.sound, haptics: value.haptics };
}
export async function putPreferences(preferences: Preferences): Promise<void> {
  await transact("preferences", "readwrite", (store) =>
    store.put(preferences, "guest"),
  );
}
