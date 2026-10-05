import { useEffect, useRef, useState } from "react";
import { theme } from "../theme";
import { HomeSort, sortOptions } from "./review";

export default function SortMenu({ value, onChange }: { value: HomeSort; onChange: (value: HomeSort) => void }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const options = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => {
    if (!open) return;
    options.current[sortOptions.indexOf(value)]?.focus();
    const dismiss = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open, value]);
  const close = () => { setOpen(false); trigger.current?.focus(); };
  return (
    <div ref={root} style={{ position: "relative", minWidth: 164 }} onKeyDown={(event) => {
      if (event.key === "Escape") { event.preventDefault(); close(); }
      if (event.key === "Tab") setOpen(false);
    }}>
      <button ref={trigger} aria-label={"Sort puzzles: " + value} aria-haspopup="listbox" aria-expanded={open}
        onClick={() => setOpen(!open)} style={{ minHeight: 48, width: "100%", padding: "10px 12px", display: "flex", gap: 12,
          alignItems: "center", justifyContent: "space-between", border: "1px solid " + theme.color.controlBorder,
          borderRadius: theme.radius.control, background: theme.color.surface, color: theme.color.text, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
        {value}<span aria-hidden="true" style={{ color: theme.color.primary, fontSize: 20 }}>⌄</span>
      </button>
      {open && <div role="listbox" aria-label="Sort puzzles" style={{ position: "absolute", top: "calc(100% + 8px)", right: 0,
        width: 208, padding: 8, borderRadius: theme.radius.card, border: "1px solid " + theme.color.border,
        background: theme.color.surface, boxShadow: "0 8px 24px #35217424", zIndex: 50 }}>
        {sortOptions.map((option, index) => <button key={option} ref={node => { options.current[index] = node; }}
          role="option" aria-selected={value === option} onClick={() => { onChange(option); close(); }}
          onKeyDown={event => {
            const next = event.key === "ArrowDown" ? (index + 1) % 3 : event.key === "ArrowUp" ? (index + 2) % 3
              : event.key === "Home" ? 0 : event.key === "End" ? 2 : null;
            if (next !== null) { event.preventDefault(); options.current[next]?.focus(); }
          }}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, width: "100%", minHeight: 48,
            border: 0, borderRadius: theme.radius.control, padding: 12, cursor: "pointer", fontSize: 14, textAlign: "left",
            color: value === option ? theme.color.primary : theme.color.text, background: value === option ? theme.color.selected : theme.color.surface }}>
          {option}<span aria-hidden="true">{value === option ? "✓" : ""}</span>
        </button>)}
      </div>}
    </div>
  );
}
