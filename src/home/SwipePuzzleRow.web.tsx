import { PropsWithChildren, useRef, useState } from "react";
import { theme } from "../theme";

type Props = PropsWithChildren<{ title: string; open: boolean; onOpenChange: (open: boolean) => void; onDelete: () => void }>;
const reveal = 80;

/** Browser review gesture: horizontal swipes reveal an explicit, confirmed delete. */
export default function SwipePuzzleRow({ children, title, open, onOpenChange, onDelete }: Props) {
  const [drag, setDrag] = useState<number | null>(null);
  const gesture = useRef<{ id: number; x: number; y: number; scale: number; start: number; offset: number; axis: "x" | "y" | null } | null>(null);
  const suppressClick = useRef(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const remove = useRef<HTMLButtonElement>(null);
  const offset = drag ?? (open ? -reveal : 0);
  const closeDialog = () => { dialog.current?.close(); remove.current?.focus(); };
  return <div data-testid="swipe-puzzle-row" role="group" tabIndex={0}
    aria-label={title + ". Swipe left or press Left Arrow to reveal Delete."}
    onKeyDown={event => {
      if (event.target !== event.currentTarget) return;
      if (["ArrowLeft", "Delete", "Backspace"].includes(event.key)) { event.preventDefault(); onOpenChange(true); }
      if (["ArrowRight", "Escape"].includes(event.key)) { event.preventDefault(); onOpenChange(false); }
    }}
    style={{ position: "relative", borderRadius: 12, overflow: "hidden", flexShrink: 0, touchAction: "pan-y", userSelect: "none" }}
    onDragStart={event => event.preventDefault()}
    onPointerDown={event => {
      if (!event.isPrimary || event.button !== 0 || (event.target as HTMLElement).closest('[data-delete-action], dialog')) return;
      suppressClick.current = false;
      const scale = event.currentTarget.getBoundingClientRect().width / event.currentTarget.offsetWidth;
      gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, scale, start: offset, offset, axis: null };
    }}
    onPointerMove={event => {
      const g = gesture.current;
      if (!g || event.pointerId !== g.id) return;
      const dx = (event.clientX - g.x) / g.scale;
      const dy = (event.clientY - g.y) / g.scale;
      if (!g.axis && Math.max(Math.abs(dx), Math.abs(dy)) > 8) {
        g.axis = Math.abs(dx) > Math.abs(dy) * 1.25 ? "x" : "y";
        if (g.axis === "x") event.currentTarget.setPointerCapture(event.pointerId);
      }
      if (g.axis !== "x") return;
      event.preventDefault(); suppressClick.current = true;
      g.offset = Math.max(-reveal, Math.min(0, g.start + dx));
      setDrag(g.offset);
    }}
    onPointerUp={event => {
      const g = gesture.current;
      if (!g || event.pointerId !== g.id) return;
      gesture.current = null; setDrag(null);
      if (g.axis === "x") onOpenChange(g.offset < -reveal / 2);
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    }}
    onPointerCancel={() => { gesture.current = null; setDrag(null); }}
    onClickCapture={event => {
      if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false; }
    }}>
    <button ref={remove} data-delete-action aria-label={"Delete " + title} tabIndex={open ? 0 : -1}
      onClick={() => dialog.current?.showModal()}
      style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: reveal, border: 0, background: theme.color.danger,
        color: theme.color.surface, fontSize: 13, fontWeight: 700, cursor: "pointer", visibility: offset < 0 ? "visible" : "hidden" }}>
      Delete
    </button>
    <div style={{ transform: `translateX(${offset}px)`, position: "relative", pointerEvents: open && drag === null ? "none" : undefined }}>{children}</div>
    <dialog ref={dialog} aria-label={"Delete " + title + "?"} onClick={event => event.stopPropagation()}
      style={{ padding: 20, maxWidth: 300, width: "calc(100vw - 64px)", border: "1px solid " + theme.color.border, borderRadius: 16,
        color: theme.color.text, background: theme.color.surface, boxShadow: "0 12px 36px #17124f33", fontFamily: "system-ui, sans-serif" }}>
      <h2 style={{ fontSize: 20, margin: "0 0 12px" }}>Delete this puzzle?</h2>
      <p style={{ fontSize: 14, lineHeight: "21px", margin: "0 0 8px" }}>{title}. Your picture stays in My Collection.</p>
      <p style={{ fontSize: 12, color: theme.color.textSecondary }}>This removes a seed puzzle from this preview only.</p>
      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 16 }}>
        <button autoFocus onClick={closeDialog} style={{ minHeight: 48, padding: "0 16px", borderRadius: 8, border: "1px solid " + theme.color.border, background: theme.color.surface, color: theme.color.text, cursor: "pointer" }}>Cancel</button>
        <button onClick={() => { dialog.current?.close(); onDelete(); }} style={{ minHeight: 48, padding: "0 16px", borderRadius: 8, border: 0, background: theme.color.danger, color: theme.color.surface, cursor: "pointer" }}>Delete puzzle</button>
      </div>
    </dialog>
  </div>;
}
