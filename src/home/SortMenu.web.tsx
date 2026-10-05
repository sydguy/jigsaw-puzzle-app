import { useEffect, useRef, useState } from "react";
import { theme } from "../theme";
import { HomeSort, sortOptions } from "./review";

export default function SortMenu({ value, onChange, compact = false }: { value: HomeSort; onChange: (value: HomeSort) => void; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const options = useRef<(HTMLButtonElement | null)[]>([]);
  const keyboardOpen = useRef(false);
  useEffect(() => {
    if (!open) return;
    if (keyboardOpen.current) options.current[sortOptions.indexOf(value)]?.focus();
    const dismiss = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open, value]);
  const close = () => { setOpen(false); trigger.current?.focus(); };
  return (
    <div ref={root} style={{ position: "relative", minWidth: compact ? 110 : 164, ...(compact ? { height: 32 } : {}) }} onKeyDown={(event) => {
      if (event.key === "Escape") { event.preventDefault(); close(); }
      if (event.key === "Tab") setOpen(false);
    }}>
      <button ref={trigger} aria-label={"Sort puzzles: " + value} aria-haspopup="listbox" aria-expanded={open}
        onClick={event => { keyboardOpen.current = event.detail === 0; setOpen(!open); }} style={{ minHeight: 48, width: "100%", padding: compact ? "8px 0" : "10px 12px", display: "flex", gap: 12,
          alignItems: "center", justifyContent: "space-between", border: "1px solid " + theme.color.controlBorder,
          borderRadius: theme.radius.control, background: compact ? "transparent" : theme.color.surface, color: theme.color.text, cursor: "pointer", fontSize: compact ? 11 : 14, fontWeight: compact && open ? 400 : 600,
          ...(compact ? { border: 0, position: "absolute", top: -8, left: 0 } : {}) }}>
        <span data-testid="sort-trigger-face" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: compact ? 8 : 12, width: "100%",
          ...(compact ? { boxSizing: "border-box", height: 28, padding: "0 9px", lineHeight: "16px", whiteSpace: "nowrap", border: "1px solid " + theme.color.border, borderRadius: 9, background: open ? theme.color.surfaceSoft : theme.color.surface, boxShadow: "0 2px 5px #3521740f" } : {}) }}>
          {value}{compact ? <svg aria-hidden="true" width="12" height="8" viewBox="0 0 12 8" style={{ flexShrink: 0 }}><path d="M1 1.5 6 6.5 11 1.5" fill="none" stroke={theme.color.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> : <span aria-hidden="true" style={{ color: theme.color.textSecondary, fontSize: 20 }}>⌄</span>}
        </span>
      </button>
      {open && <div role="listbox" aria-label="Sort puzzles" style={{ position: "absolute", top: compact ? "100%" : "calc(100% + 8px)", right: compact ? -3 : 0,
        width: compact ? 122 : 208, boxSizing: compact ? "border-box" : undefined, padding: compact ? 4 : 8, borderRadius: compact ? 12 : theme.radius.card, border: "1px solid " + theme.color.border,
        background: theme.color.surface, boxShadow: "0 8px 24px #35217424", zIndex: 50 }}>
        {sortOptions.map((option, index) => <button key={option} ref={node => { options.current[index] = node; }}
          role="option" aria-selected={value === option} onClick={() => { onChange(option); close(); }}
          onKeyDown={event => {
            const next = event.key === "ArrowDown" ? (index + 1) % 3 : event.key === "ArrowUp" ? (index + 2) % 3
              : event.key === "Home" ? 0 : event.key === "End" ? 2 : null;
            if (next !== null) { event.preventDefault(); options.current[next]?.focus(); }
          }}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: compact ? 4 : 12, width: "100%", minHeight: compact ? 28 : 48,
            border: 0, borderRadius: compact ? 7 : theme.radius.control, padding: compact ? "4px 6px" : 12, cursor: "pointer", fontSize: compact ? 11 : 14, lineHeight: compact ? "16px" : undefined, textAlign: "left", whiteSpace: "nowrap",
            color: compact ? theme.color.text : value === option ? theme.color.primary : theme.color.text, background: value === option ? theme.color.selected : theme.color.surface }}>
          {option}{compact ? <svg aria-hidden="true" width="13" height="12" viewBox="0 0 13 12" style={{ flexShrink: 0, visibility: value === option ? "visible" : "hidden" }}><path d="m1.5 6 3.5 3.5 6.5-7" fill="none" stroke={theme.color.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> : <span aria-hidden="true">{value === option ? "✓" : ""}</span>}
        </button>)}
      </div>}
    </div>
  );
}
