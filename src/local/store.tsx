import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  defaultDraft,
  defaultPreferences,
  Draft,
  Picture,
  Preferences,
} from "./types";
import * as repository from "./repository";
function useLocalState() {
  const [pictures, setPictures] = useState<Picture[]>([]);
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [draft, setDraft] = useState<Draft>(defaultDraft);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const reload = async () => {
    setLoading(true);
    setError("");
    try {
      const [images, settings] = await Promise.all([
        repository.readPictures(),
        repository.readPreferences(),
      ]);
      setPictures(images);
      setPreferences(settings ?? defaultPreferences);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load local data.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void reload();
  }, []);
  const mutate = async (work: () => Promise<void>) => {
    if (lock.current || loading || error)
      throw new Error(
        "Local storage is not ready. Retry loading before making changes.",
      );
    lock.current = true;
    setBusy(true);
    try {
      await work();
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  return {
    pictures,
    preferences,
    draft,
    setDraft,
    loading,
    error,
    busy,
    reload,
    add: (picture: Picture) =>
      mutate(async () => {
        await repository.putPicture(picture);
        setPictures((items) => [...items, picture]);
      }),
    rename: (picture: Picture, title: string) =>
      mutate(async () => {
        const updated = { ...picture, title: title.trim() };
        await repository.putPicture(updated);
        setPictures((items) =>
          items.map((item) => (item.id === picture.id ? updated : item)),
        );
      }),
    remove: (picture: Picture) =>
      mutate(async () => {
        await repository.removePicture(picture.id);
        setPictures((items) => items.filter((item) => item.id !== picture.id));
        setDraft((value) =>
          value.pictureId === picture.id
            ? { ...value, pictureId: undefined }
            : value,
        );
      }),
    savePreferences: (value: Preferences) =>
      mutate(async () => {
        await repository.putPreferences(value);
        setPreferences(value);
      }),
  };
}
const LocalContext = createContext<ReturnType<typeof useLocalState> | null>(
  null,
);
export function LocalProvider({ children }: PropsWithChildren) {
  return (
    <LocalContext.Provider value={useLocalState()}>
      {children}
    </LocalContext.Provider>
  );
}
export function useLocal() {
  const state = useContext(LocalContext);
  if (!state) throw new Error("LocalProvider missing");
  return state;
}
