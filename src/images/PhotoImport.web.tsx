import { useEffect, useRef, useState } from "react";
import { TextInput } from "react-native";
import { Action, Card, Copy, Heading, Notice, ui } from "../components/ui";
import { useLocal } from "../local/store";
import {
  checkDimensions,
  cropRectangle,
  inspectRaster,
  MAX_BYTES,
} from "./limits";

export default function PhotoImport({
  onAdded,
}: {
  onAdded: (id: string) => void;
}) {
  const local = useLocal();
  const [bitmap, setBitmap] = useState<ImageBitmap | null>(null);
  const [title, setTitle] = useState("");
  const [zoom, setZoom] = useState(1),
    [x, setX] = useState(50),
    [y, setY] = useState(50);
  const [working, setWorking] = useState(false),
    [error, setError] = useState("");
  const canvas = useRef<HTMLCanvasElement>(null);
  const active = useRef(true),
    pending = useRef(false);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  useEffect(() => () => bitmap?.close(), [bitmap]);
  const draw = () => {
    const context = canvas.current?.getContext("2d");
    if (!bitmap || !context) return;
    const crop = cropRectangle(bitmap.width, bitmap.height, zoom, x, y);
    context.fillStyle = "#FFFFFF";
    context.fillRect(0, 0, 1536, 1024);
    context.drawImage(
      bitmap,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      1536,
      1024,
    );
  };
  useEffect(draw, [bitmap, zoom, x, y]);
  async function load(file?: File) {
    if (!file || pending.current) return;
    pending.current = true;
    setWorking(true);
    setError("");
    try {
      if (file.size > MAX_BYTES)
        throw new Error("Choose a JPG or PNG smaller than 10 MB.");
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { mime } = inspectRaster(bytes);
      const decoded = await createImageBitmap(
        new Blob([bytes], { type: mime }),
        { imageOrientation: "from-image" },
      );
      try {
        checkDimensions(decoded.width, decoded.height);
      } catch (e) {
        decoded.close();
        throw e;
      }
      if (!active.current) {
        decoded.close();
        return;
      }
      setTitle(file.name.slice(0, 100) || "My photo");
      setZoom(1);
      setX(50);
      setY(50);
      setBitmap(decoded);
    } catch (e) {
      if (active.current)
        setError(
          e instanceof Error
            ? e.message
            : "This image could not be decoded. Choose another picture.",
        );
    } finally {
      pending.current = false;
      if (active.current) setWorking(false);
    }
  }
  async function save() {
    if (!bitmap || !canvas.current || pending.current) return;
    pending.current = true;
    setWorking(true);
    setError("");
    try {
      draw();
      const id = crypto.randomUUID();
      const data = canvas.current.toDataURL("image/jpeg", 0.9);
      await local.add({
        id,
        title: title.trim(),
        theme: "My Photo",
        source: "photo",
        addedAt: Date.now(),
        data,
        width: 1536,
        height: 1024,
      });
      onAdded(id);
    } catch (e) {
      if (active.current)
        setError(
          e instanceof Error
            ? e.message
            : "The picture could not be saved. Your crop is still here.",
        );
    } finally {
      pending.current = false;
      if (active.current) setWorking(false);
    }
  }
  return (
    <Card>
      <Heading>{bitmap ? "Crop your picture" : "Add a photo"}</Heading>
      <Copy muted>
        JPG or PNG, up to 10 MB and 24 megapixels. Your photo stays on this
        device.
      </Copy>
      <input
        aria-label="Choose photo file"
        type="file"
        accept="image/jpeg,image/png"
        disabled={working || local.busy || local.loading || !!local.error}
        onChange={(event) => {
          void load(event.target.files?.[0]);
          event.target.value = "";
        }}
        style={{ maxWidth: "100%", padding: "12px 0", minHeight: 48 }}
      />
      {!!error && <Notice error>{error}</Notice>}
      {working && <Notice>Processing picture…</Notice>}
      {bitmap && (
        <>
          <canvas
            ref={canvas}
            aria-label="3:2 crop preview"
            width={1536}
            height={1024}
            style={{
              width: "100%",
              aspectRatio: "3 / 2",
              borderRadius: 12,
              background: "#EFEEFD",
            }}
          />
          <Copy muted>
            Fixed 3:2 crop · Reused for every puzzle made from this picture
          </Copy>
          {[
            {
              name: "Zoom",
              value: zoom,
              min: 1,
              max: 3,
              step: 0.01,
              change: setZoom,
            },
            {
              name: "Horizontal position",
              value: x,
              min: 0,
              max: 100,
              step: 1,
              change: setX,
            },
            {
              name: "Vertical position",
              value: y,
              min: 0,
              max: 100,
              step: 1,
              change: setY,
            },
          ].map((control) => (
            <label
              key={control.name}
              style={{
                color: "#17124F",
                fontSize: 14,
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              {control.name}
              <input
                type="range"
                aria-label={control.name}
                min={control.min}
                max={control.max}
                step={control.step}
                value={control.value}
                disabled={working}
                onChange={(event) => control.change(Number(event.target.value))}
                style={{ width: "100%", minHeight: 40, accentColor: "#5430E8" }}
              />
            </label>
          ))}
          <Copy>Picture title</Copy>
          <TextInput
            accessibilityLabel="Imported picture title"
            style={ui.input}
            value={title}
            maxLength={100}
            onChangeText={setTitle}
            editable={!working}
          />
          <Action
            label="Add to My Collection"
            disabled={working || local.busy || !title.trim()}
            onPress={() => {
              void save();
            }}
          />
          <Action
            label="Cancel crop"
            secondary
            disabled={working}
            onPress={() => {
              setBitmap(null);
              setError("");
            }}
          />
        </>
      )}
    </Card>
  );
}
