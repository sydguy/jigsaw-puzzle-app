import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { Action, Notice } from "../components/ui";
import { theme } from "../theme";
import { checkDimensions } from "./limits";

/** Browser camera adapter. Permission is requested only by the explicit button. */
export default function CameraCapture({ onCapture, disabled }: { onCapture: (file: File) => Promise<void>; disabled: boolean }) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const video = useRef<HTMLVideoElement>(null);
  const current = useRef<MediaStream | null>(null);
  const generation = useRef(0);
  const pending = useRef(false);
  const stop = useCallback(() => {
    generation.current++;
    current.current?.getTracks().forEach(track => track.stop());
    current.current = null;
    setStream(null); setReady(false); setBusy(false); pending.current = false;
  }, []);
  useFocusEffect(useCallback(() => stop, [stop]));
  useEffect(() => {
    const hidden = () => { if (document.hidden) stop(); };
    document.addEventListener("visibilitychange", hidden);
    return () => { document.removeEventListener("visibilitychange", hidden); stop(); };
  }, [stop]);
  useEffect(() => {
    if (video.current && stream) {
      video.current.srcObject = stream;
      void video.current.play().catch(() => { stop(); setError("Camera preview could not start. Please try again."); });
    }
  }, [stream, stop]);
  async function open() {
    if (pending.current || disabled) return;
    pending.current = true; setBusy(true); setError("");
    const request = ++generation.current;
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("Camera access is unavailable here. Use localhost or a secure connection, or choose Photo Gallery.");
      const media = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: "environment", width: { ideal: 1536 }, height: { ideal: 1024 } } });
      if (request !== generation.current) { media.getTracks().forEach(track => track.stop()); return; }
      current.current = media;
      media.getVideoTracks().forEach(track => track.addEventListener("ended", () => {
        if (current.current === media) { stop(); setError("The camera disconnected. Reconnect it and try again."); }
      }, { once: true }));
      setStream(media);
    } catch (e) {
      if (request !== generation.current) return;
      const name = e instanceof Error ? e.name : "";
      setError(name === "NotAllowedError" ? "Camera permission was denied. Allow camera access in your browser settings, then try again, or choose Photo Gallery."
        : name === "NotFoundError" ? "No camera was found. Connect a camera or choose Photo Gallery."
        : name === "NotReadableError" ? "The camera is busy or unavailable. Close other camera apps and try again."
        : e instanceof Error ? e.message : "The camera could not open. Please try again.");
    } finally {
      if (request === generation.current) { pending.current = false; setBusy(false); }
    }
  }
  async function capture() {
    if (!video.current || !ready || pending.current || disabled) return;
    pending.current = true; setBusy(true); setError("");
    const request = generation.current;
    try {
      const { videoWidth: width, videoHeight: height } = video.current;
      checkDimensions(width, height);
      const output = document.createElement("canvas");
      const scale = Math.min(1, 2048 / Math.max(width, height));
      output.width = Math.round(width * scale); output.height = Math.round(height * scale);
      const context = output.getContext("2d");
      if (!context) throw new Error("This browser cannot capture a picture. Choose Photo Gallery instead.");
      context.drawImage(video.current, 0, 0, output.width, output.height);
      const blob = await new Promise<Blob>((resolve, reject) => output.toBlob(value => value ? resolve(value) : reject(new Error("The picture could not be captured. Try again.")), "image/jpeg", 0.9));
      if (request !== generation.current) return;
      stop();
      await onCapture(new File([blob], `Camera ${new Date().toISOString().replace(/[:.]/g, "-")}.jpg`, { type: "image/jpeg" }));
    } catch (e) {
      if (request === generation.current) setError(e instanceof Error ? e.message : "Capture failed. Please try again.");
    } finally {
      if (request === generation.current) { pending.current = false; setBusy(false); }
    }
  }
  return <>
    {!!error && <Notice error>{error}</Notice>}
    {stream ? <>
      <video ref={video} aria-label="Live camera preview" autoPlay muted playsInline onLoadedData={() => setReady(true)}
        style={{ width: "100%", maxHeight: 320, borderRadius: 12, background: "#17124F" }} />
      <Action label="Take photo" disabled={disabled || busy || !ready} onPress={() => void capture()} />
      <Action label="Cancel camera" secondary onPress={stop} />
    </> : <button type="button" disabled={disabled || busy} onClick={() => void open()} style={{
      display: "flex", alignItems: "center", justifyContent: "center", gap: 12, width: "100%", minHeight: 56,
      border: 0, borderRadius: 12, padding: "12px 16px", color: "white", fontSize: 18, fontWeight: 700,
      background: `linear-gradient(110deg, ${theme.color.gradientStart}, ${theme.color.gradientEnd})`,
      cursor: disabled || busy ? "default" : "pointer", opacity: disabled || busy ? 0.55 : 1,
    }}>
      <svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24"><path fill="currentColor" d="M8 4h8l2 3h3a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3zm4 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10m0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6" /></svg>
      {busy ? "Opening camera…" : "Open camera"}
    </button>}
  </>;
}
