import { useEffect, useRef } from "react";
import type { GameDialogProps } from "./Dialog.types";
import { theme } from "../theme";
export default function GameDialog({ title, text, actions, onCancel, celebrate }: GameDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const before = document.activeElement as HTMLElement | null; ref.current?.showModal(); ref.current?.querySelector<HTMLButtonElement>("button")?.focus(); return () => { before?.focus(); }; }, []);
  return <dialog ref={ref} aria-labelledby="game-dialog-title" aria-describedby="game-dialog-text" onCancel={e => { e.preventDefault(); onCancel?.(); }}
    style={{ border: `1px solid ${theme.color.border}`, borderRadius: 16, padding: 24, maxWidth: 380, width: "calc(100% - 64px)", color: theme.color.text, background: "white", boxShadow: "0 12px 40px #17124f40" }}>
    {celebrate && <><style>{`@keyframes puzzle-win{0%{transform:scale(.7);opacity:.3}60%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}} .puzzle-win{animation:puzzle-win 650ms ease-out} @media(prefers-reduced-motion:reduce){.puzzle-win{animation:none}}`}</style><div className="puzzle-win" aria-hidden style={{ color: theme.color.primary, fontSize: 36, textAlign: "center", marginBottom: 8 }}>✦ ✓ ✦</div></>}
    <h2 id="game-dialog-title" style={{ margin: "0 0 12px", fontSize: 22 }}>{title}</h2><p id="game-dialog-text" style={{ lineHeight: 1.5, whiteSpace: "pre-line" }}>{text}</p>
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{actions.map(a => <button key={a.label} onClick={a.onPress} style={{ minHeight: 48, padding: "8px 16px", borderRadius: 12, border: `1px solid ${theme.color.primary}`, color: a.secondary ? theme.color.primary : "white", background: a.secondary ? "white" : theme.color.primary, fontWeight: 700 }}>{a.label}</button>)}</div>
  </dialog>;
}
