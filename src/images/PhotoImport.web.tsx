import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Action, Card, Copy, Heading, Notice, ui } from "../components/ui";
import { useLocal } from "../local/store";
import { theme } from "../theme";
import CameraCapture from "./CameraCapture.web";
import CropEditor from "./CropEditor.web";
import { Crop, validateCrop } from "./cropGeometry";
import { sourceAction } from "./sourceAction.web";
import {
  checkDimensions,
  cropRectangle,
  inspectRaster,
  MAX_BYTES,
} from "./limits";

export default function PhotoImport({
  onAdded,
  mode = "photo",
  mobile = false,
}: {
  onAdded: (id: string) => void;
  mode?: "photo" | "camera";
  mobile?: boolean;
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
  const fileInput = useRef<HTMLInputElement>(null);
  const active = useRef(true),
    pending = useRef(false);
  useFocusEffect(useCallback(() => {
    active.current = true;
    return () => {
      active.current = false;
      setBitmap(null);
    };
  }, []));
  useEffect(() => () => bitmap?.close(), [bitmap]);
  const draw = (selected?: Crop) => {
    const context = canvas.current?.getContext("2d");
    if (!bitmap || !context) return;
    const crop = selected ?? cropRectangle(bitmap.width, bitmap.height, zoom, x, y);
    validateCrop(crop, bitmap.width, bitmap.height);
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
  async function save(selected?: Crop) {
    if (!bitmap || !canvas.current || pending.current) return;
    pending.current = true;
    setWorking(true);
    setError("");
    try {
      draw(selected);
      const id = crypto.randomUUID();
      const data = canvas.current.toDataURL("image/jpeg", 0.9);
      await local.add({
        id,
        title: title.trim(),
        theme: "My Photo",
        source: mode,
        addedAt: Date.now(),
        data,
        width: 1536,
        height: 1024,
      });
      if (active.current) onAdded(id);
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
  if (mobile && bitmap) return <>
    <canvas ref={canvas} width={1536} height={1024} style={{ display: "none" }} />
    <CropEditor bitmap={bitmap} working={working || local.busy} error={error}
      onCancel={() => { setBitmap(null); setError(""); }} onDone={crop => void save(crop)} />
  </>;
  return (
    <Card style={mobile ? [styles.card, !bitmap && styles.sourcePanel] : undefined}>
      {mobile ? <View style={{ gap: 8 }}>
        <Text accessibilityRole="header" style={[styles.heading, styles.sourceHeading]}>{mode === "camera" ? "Take a picture" : "Add a photo"}</Text>
        <Text style={styles.copy}>{mode === "camera"
        ? "JPG or PNG, up to 10 MB. Use your camera to add one photo to create puzzle. Your photo stays on this device."
        : "JPG or PNG, up to 10 MB. Select one photo from your device gallery to create puzzle. Your photo stays on this device."}</Text>
      </View> : <><Heading>{bitmap ? "Crop your picture" : "Add a photo"}</Heading><Copy muted>
        JPG or PNG, up to 10 MB and 24 megapixels. Your photo stays on this
        device.
      </Copy></>}
      {mode === "photo" && <input
        ref={fileInput}
        aria-label="Choose photo file"
        type="file"
        accept="image/jpeg,image/png"
        disabled={working || local.busy || local.loading || !!local.error}
        onChange={(event) => {
          void load(event.target.files?.[0]);
          event.target.value = "";
        }}
        style={mobile ? { display: "none" } : { maxWidth: "100%", padding: "12px 0", minHeight: 48 }}
      />}
      {mobile && mode === "photo" && !bitmap && <button type="button" disabled={working || local.busy || local.loading || !!local.error}
        onClick={() => fileInput.current?.click()} style={{ ...sourceAction,
          cursor: working || local.busy || local.loading || local.error ? "default" : "pointer",
          opacity: working || local.busy || local.loading || local.error ? 0.55 : 1 }}>
        <svg aria-hidden="true" width="26" height="26" viewBox="0 0 40 38" style={{ flexShrink: 0 }}>
          <rect x="2" y="3" width="28" height="24" rx="4" fill="none" stroke="white" strokeWidth="2.5" />
          <path d="M3 22l9-11 7 8 5-7 6 10v4H3z" fill="white" />
          <circle cx="29" cy="27" r="10" fill={theme.color.primary} stroke="white" strokeWidth="1.5" />
          <path d="M29 33V22m-4 4 4-4 4 4" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Choose file
      </button>}
      {mode === "camera" && !bitmap && <CameraCapture onCapture={load} disabled={working || local.busy || local.loading || !!local.error} />}
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

const styles = StyleSheet.create({
  card: { padding: 16, paddingVertical: 20, gap: 16, borderRadius: 16, borderWidth: 0, boxShadow: "0 4px 16px #3521740f" },
  sourcePanel: { minHeight: 196, paddingVertical: 8, justifyContent: "space-between" },
  heading: { color: theme.color.text, fontSize: 24, lineHeight: 32, fontWeight: "700" },
  sourceHeading: { fontSize: 20, lineHeight: 28 },
  copy: { color: theme.color.textSecondary, fontSize: 16, lineHeight: 24 },
});
