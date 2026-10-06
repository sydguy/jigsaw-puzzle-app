import { useEffect, useRef, useState } from "react";
import { theme } from "../theme";
export default function CollectionMenu({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null), trigger = useRef<HTMLButtonElement>(null);
  const close = () => { setOpen(false); trigger.current?.focus(); };
  useEffect(() => {
    if (!open) return;
    const dismiss = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);
  return <div ref={root} style={{ flex: 1, minWidth: 0, position: "relative", zIndex: open ? 5 : 1 }} onKeyDown={e => {
    if (e.key === "Escape") { e.preventDefault(); close(); }
    if (e.key === "Tab") setOpen(false);
  }}>
    <div style={{ color: theme.color.textSecondary, fontSize: 12, lineHeight: "16px", fontWeight: 600 }}>{label}</div>
    <button ref={trigger} aria-label={`${label}: ${value}`} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(!open)}
      style={{ width: "100%", minHeight: 48, border: 0, background: "transparent", padding: "5px 0", cursor: "pointer" }}>
      <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, background: theme.color.surface, color: theme.color.text, borderRadius: 8, padding: "9px 10px", fontSize: 13, lineHeight: "18px", fontWeight: 600, boxShadow: "0 2px 8px #35217414" }}>
        {value}<svg width="12" height="8" viewBox="0 0 12 8" aria-hidden="true" style={{ flexShrink: 0 }}><path d="m1 1 5 5 5-5" stroke={theme.color.text} fill="none" strokeWidth="2" /></svg>
      </span>
    </button>
    {open && <div role="listbox" aria-label={label} style={{ position: "absolute", top: "100%", left: 0, right: 0, padding: 4, borderRadius: 12, background: theme.color.surface, boxShadow: "0 6px 18px #35217430" }}>
      {options.map((option, i) => <button key={option} role="option" aria-selected={value === option} onClick={() => { onChange(option); close(); }}
        onKeyDown={e => {
          const next = e.key === "ArrowDown" ? (i + 1) % options.length : e.key === "ArrowUp" ? (i + options.length - 1) % options.length : null;
          if (next !== null) { e.preventDefault(); e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("button")[next]?.focus(); }
        }}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", minHeight: 48, border: 0, borderRadius: 8, padding: 8, fontSize: 13, textAlign: "left", background: option === value ? theme.color.selected : theme.color.surface, color: theme.color.text, cursor: "pointer" }}>
        {option}<span aria-hidden="true" style={{ color: theme.color.primary }}>{option === value ? "✓" : ""}</span>
      </button>)}
    </div>}
  </div>;
}
