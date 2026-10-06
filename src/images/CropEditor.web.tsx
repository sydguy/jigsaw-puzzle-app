import { CSSProperties, KeyboardEvent, PointerEvent, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Image } from "react-native";
import { art } from "../assets";
import { theme } from "../theme";
import { Corner, Crop, initialCrop, moveCrop, resizeCrop } from "./cropGeometry";

const corners: { id: Corner; label: string; x: number; y: number }[] = [
  { id: "nw", label: "top left", x: 0, y: 0 }, { id: "ne", label: "top right", x: 1, y: 0 },
  { id: "sw", label: "bottom left", x: 0, y: 1 }, { id: "se", label: "bottom right", x: 1, y: 1 },
];
const action: CSSProperties = { boxSizing: "border-box", minHeight: theme.size.buttonMinimumHeight, minWidth: 88, padding: "12px 20px", border: 0,
  borderRadius: theme.radius.control, background: theme.color.primary, color: theme.color.surface,
  fontSize: theme.type.label.size, lineHeight: `${theme.type.label.lineHeight}px`, fontWeight: 600, cursor: "pointer" };
const headerAction: CSSProperties = { ...action, width: 104, minWidth: 104, padding: "4px 0", background: "transparent", display: "flex", alignItems: "center" };
const actionFace: CSSProperties = { boxSizing: "border-box", width: "100%", minHeight: 40, padding: "8px 12px", borderRadius: theme.radius.control,
  display: "flex", alignItems: "center", justifyContent: "center" };

/** Local browser adapter; the OS file picker supplies the image, no upload occurs. */
export default function CropEditor({ bitmap, working, error, onCancel, onDone }: {
  bitmap: ImageBitmap; working: boolean; error: string; onCancel: () => void; onDone: (crop: Crop) => void;
}) {
  const anchor = useRef<HTMLSpanElement>(null), root = useRef<HTMLDivElement>(null);
  const area = useRef<HTMLDivElement>(null), photo = useRef<HTMLCanvasElement>(null);
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [crop, setCrop] = useState(() => initialCrop(bitmap.width, bitmap.height));
  const [showHint, setShowHint] = useState(true);
  const drag = useRef<{ pointer: number; x: number; y: number; scale: number; crop: Crop; corner?: Corner } | null>(null);
  useLayoutEffect(() => { setHost(anchor.current?.closest<HTMLElement>('[data-testid="device-frame"]') ?? document.body); }, []);
  useLayoutEffect(() => {
    if (!host || !root.current || !area.current) return;
    const previous = document.activeElement as HTMLElement | null;
    const siblings = Array.from(host.children).filter(n => n !== root.current) as HTMLElement[];
    const inert = siblings.map(n => n.inert);
    siblings.forEach(n => { n.inert = true; });
    root.current.querySelector<HTMLButtonElement>("button")?.focus();
    const node = area.current;
    const measure = () => setSize({ width: node.clientWidth, height: node.clientHeight });
    const observer = new ResizeObserver(measure); observer.observe(node); measure();
    return () => { observer.disconnect(); siblings.forEach((n, i) => { n.inert = inert[i]!; }); previous?.focus(); };
  }, [host]);
  useEffect(() => {
    if (!host || !photo.current) return;
    // Bound the display canvas; the original bitmap is used separately for output.
    const scale = Math.min(1, 2048 / Math.max(bitmap.width, bitmap.height));
    photo.current.width = Math.max(1, Math.round(bitmap.width * scale));
    photo.current.height = Math.max(1, Math.round(bitmap.height * scale));
    photo.current.getContext("2d")?.drawImage(bitmap, 0, 0, photo.current.width, photo.current.height);
  }, [host, bitmap]);
  const scale = Math.min(size.width / bitmap.width, size.height / bitmap.height);
  const width = bitmap.width * scale, height = bitmap.height * scale;
  const begin = (event: PointerEvent<HTMLDivElement | HTMLButtonElement>, corner?: Corner) => {
    if (working || drag.current || event.button !== 0 || !photo.current) return;
    event.preventDefault(); event.stopPropagation(); event.currentTarget.focus();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { pointer: event.pointerId, x: event.clientX, y: event.clientY,
      scale: photo.current.getBoundingClientRect().width / bitmap.width, crop, corner };
  };
  const move = (event: PointerEvent) => {
    const start = drag.current;
    if (!start || event.pointerId !== start.pointer || working) return;
    const dx = (event.clientX - start.x) / start.scale, dy = (event.clientY - start.y) / start.scale;
    setCrop(start.corner ? resizeCrop(start.crop, start.corner, dx, dy, bitmap.width, bitmap.height)
      : moveCrop(start.crop, dx, dy, bitmap.width, bitmap.height));
  };
  const finish = (event: PointerEvent) => { if (event.pointerId === drag.current?.pointer) drag.current = null; };
  const keyboard = (event: KeyboardEvent, corner?: Corner) => {
    const step = (event.shiftKey ? 10 : 2) / (scale || 1);
    const dx = event.key === "ArrowLeft" ? -step : event.key === "ArrowRight" ? step : 0;
    const dy = event.key === "ArrowUp" ? -step : event.key === "ArrowDown" ? step : 0;
    if ((!dx && !dy) || working) return;
    event.preventDefault(); event.stopPropagation();
    setCrop(value => corner ? resizeCrop(value, corner, dx, dy, bitmap.width, bitmap.height) : moveCrop(value, dx, dy, bitmap.width, bitmap.height));
  };
  return <><span ref={anchor} />{host && createPortal(<div ref={root} role="dialog" aria-modal="true" aria-label="Crop your picture" data-testid="crop-editor"
    onPointerDownCapture={() => setShowHint(false)} onKeyDownCapture={() => setShowHint(false)}
    onKeyDown={event => {
      if (event.key === "Escape" && !working) { event.preventDefault(); onCancel(); }
      if (event.key === "Tab") {
        const items = Array.from(root.current!.querySelectorAll<HTMLElement>('button:not(:disabled), [tabindex="0"]'));
        const next = items[(items.indexOf(document.activeElement as HTMLElement) + (event.shiftKey ? -1 : 1) + items.length) % items.length];
        if (next) { event.preventDefault(); next.focus(); }
      }
    }} style={{ position: host === document.body ? "fixed" : "absolute", inset: 0, zIndex: 1000, background: "#0C1421", color: "white", display: "flex", flexDirection: "column", overflow: "hidden" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 12px 4px", flexShrink: 0 }}>
      <button type="button" style={{ ...headerAction, color: theme.color.primary, opacity: working ? 0.6 : 1 }} disabled={working} onClick={onCancel}>
        <span style={{ ...actionFace, border: `1px solid ${theme.color.controlBorder}`, background: theme.color.surface }}>Cancel</span>
      </button>
      <span style={{ fontSize: 14, fontWeight: 600 }}>Crop · 3:2</span>
      <button type="button" style={{ ...headerAction, opacity: working ? 0.6 : 1 }} disabled={working}
        onClick={() => { drag.current = null; onDone(crop); }}>
        <span style={{ ...actionFace, background: `linear-gradient(110deg, ${theme.color.gradientStart}, ${theme.color.gradientEnd})` }}>{working ? "Saving…" : "Done"}</span>
      </button>
    </div>
    <div ref={area} style={{ flex: 1, minHeight: 0, margin: "12px 14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "relative", width, height, flexShrink: 0 }}>
        <canvas ref={photo} aria-label="Full selected picture" data-testid="crop-full-image" style={{ display: "block", width: "100%", height: "100%" }} />
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{ position: "absolute", left: crop.x * scale, top: crop.y * scale, width: crop.width * scale, height: crop.height * scale, boxShadow: "0 0 0 10000px #0009" }} />
        </div>
        <div role="button" tabIndex={working ? -1 : 0} aria-label="Move crop selection" aria-describedby="crop-help" aria-disabled={working}
          data-testid="crop-selection" data-crop={JSON.stringify(crop)} data-image-width={bitmap.width} data-image-height={bitmap.height}
          onPointerDown={event => begin(event)} onPointerMove={move} onPointerUp={finish} onPointerCancel={finish} onLostPointerCapture={finish}
          onKeyDown={event => keyboard(event)} style={{ position: "absolute", boxSizing: "border-box", left: crop.x * scale, top: crop.y * scale,
            width: crop.width * scale, height: crop.height * scale, border: "2px solid white", cursor: "move", touchAction: "none" }} />
        {corners.map(corner => <button key={corner.id} type="button" aria-label={`Resize crop ${corner.label}`} disabled={working}
          onPointerDown={event => begin(event, corner.id)} onPointerMove={move} onPointerUp={finish} onPointerCancel={finish} onLostPointerCapture={finish}
          onKeyDown={event => keyboard(event, corner.id)}
          style={{ position: "absolute", left: (crop.x + corner.x * crop.width) * scale - 24, top: (crop.y + corner.y * crop.height) * scale - 24,
            width: 48, height: 48, border: 0, padding: 0, background: "transparent", display: "grid", placeItems: "center", touchAction: "none", cursor: corner.id === "nw" || corner.id === "se" ? "nwse-resize" : "nesw-resize" }}>
          <span style={{ width: 12, height: 12, background: "white", borderRadius: 999, boxShadow: "0 1px 4px #0008" }} />
        </button>)}
        {showHint && <div data-testid="crop-drag-hint" aria-hidden="true" style={{ position: "absolute", pointerEvents: "none",
          left: "50%", top: (crop.y + crop.height * 0.75) * scale, transform: "translate(-50%, -50%)", maxWidth: "calc(100% - 24px)",
          display: "flex", alignItems: "center", gap: 4, padding: "2px 14px 2px 4px", borderRadius: 999, background: "#101C28DD",
          boxShadow: "0 2px 12px #0003", whiteSpace: "nowrap" }}>
          <Image source={art.cropDrag} accessible={false} resizeMode="contain" style={{ width: 52, height: 52, flexShrink: 0 }} />
          <span style={{ fontSize: 13, lineHeight: "18px", fontWeight: 500 }}>Drag to change selected area</span>
        </div>}
      </div>
    </div>
    <div style={{ flexShrink: 0, padding: "0 20px 16px", textAlign: "center" }}>
      <p id="crop-help" style={{ fontSize: 14, lineHeight: "20px", margin: "0 0 4px" }}>Drag to move · Drag corners to resize</p>
      <button type="button" style={{ ...action, background: "transparent", fontSize: 14 }} disabled={working}
        onClick={() => setCrop(initialCrop(bitmap.width, bitmap.height))}>Reset crop</button>
      {!!error && <p role="alert" style={{ color: "#FFE0E0", margin: "4px 0", fontSize: 14 }}>{error}</p>}
    </div>
  </div>, host)}</>;
}
