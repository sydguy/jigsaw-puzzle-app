import { memo, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { GameBoardProps } from "./Board.types";
import { sprites } from "./canvas";
import { complies } from "./engine";
import { theme } from "../theme";

const Piece = memo(function Piece({ sprite, turn, selected }: { sprite?: HTMLCanvasElement; turn: number; selected: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => { const c = ref.current; if (!c || !sprite) return; const ctx = c.getContext("2d")!; ctx.clearRect(0, 0, 128, 128);
    ctx.save(); ctx.translate(64, 64); ctx.rotate(turn * Math.PI / 2); ctx.drawImage(sprite, -60, -60, 120, 120); ctx.restore(); }, [sprite, turn]);
  return <canvas ref={ref} width={128} height={128} aria-hidden style={{ width: 64, height: 64, pointerEvents: "none", filter: selected ? "drop-shadow(0 0 3px #6040ff)" : "drop-shadow(0 2px 2px #17124f22)" }}/>;
});
type Press = { pointer: number; piece: number | null; source: "tray" | "board"; x: number; y: number; mode: "pending" | "drag" | "scroll"; left: number; scale: number };
export default function GameBoard({ record, size, zoom, setZoom, disabled: blocked, dispatch, onError, controls }: GameBoardProps) {
  const { definition: d, attempt: a } = record;
  const [art, setArt] = useState<HTMLCanvasElement[]>([]), [focus, setFocus] = useState(0);
  const [imageError, setImageError] = useState("");
  const disabled = blocked || art.length !== d.edges.length;
  const viewport = useRef<HTMLDivElement>(null), board = useRef<HTMLCanvasElement>(null), tray = useRef<HTMLDivElement>(null), ghost = useRef<HTMLCanvasElement>(null), shell = useRef<HTMLDivElement>(null);
  const press = useRef<Press | null>(null), points = useRef(new Map<number, { x: number; y: number }>()), pinch = useRef<{ distance: number; zoom: number; x: number; y: number; left: number; top: number } | null>(null);
  const latest = useRef({ a, disabled, dispatch, art }); latest.current = { a, disabled, dispatch, art };
  const uri = (record.puzzle.image as { uri: string }).uri;
  useEffect(() => { let alive = true; setArt([]); setImageError(""); sprites(uri, d).then(value => { if (alive) setArt(value); }).catch(e => { if (alive) { setImageError(e.message); onError(e.message); } }); return () => { alive = false; }; }, [record.id, d.edges, uri]);
  useLayoutEffect(() => {
    const canvas = board.current; if (!canvas) return;
    const px = Math.min(2048, Math.round(size * zoom * Math.min(window.devicePixelRatio || 1, 2)));
    canvas.width = canvas.height = px;
    const ctx = canvas.getContext("2d")!; ctx.clearRect(0, 0, px, px); ctx.fillStyle = theme.color.surfaceSoft; ctx.fillRect(0, 0, px, px);
    const cell = px / d.side;
    ctx.strokeStyle = "#DAD7EE"; ctx.lineWidth = 1;
    for (let i = 0; i <= d.side; i++) { ctx.beginPath(); ctx.moveTo(i * cell, 0); ctx.lineTo(i * cell, px); ctx.moveTo(0, i * cell); ctx.lineTo(px, i * cell); ctx.stroke(); }
    for (let slot = 0; slot < a.board.length; slot++) {
      const id = a.board[slot]; if (id === null || !art[id!]) continue;
      ctx.save(); ctx.translate((slot % d.side + .5) * cell, (Math.floor(slot / d.side) + .5) * cell); ctx.rotate(a.turns[id!]! * Math.PI / 2);
      ctx.drawImage(art[id!]!, -cell * .75, -cell * .75, cell * 1.5, cell * 1.5); ctx.restore();
      if (id === a.selected) { ctx.strokeStyle = complies(d, a, id!, slot) ? theme.color.primary : "#E8600B"; ctx.lineWidth = 3; ctx.strokeRect(slot % d.side * cell + 2, Math.floor(slot / d.side) * cell + 2, cell - 4, cell - 4); }
    }
  }, [art, a.board, a.turns, a.selected, d.side, size, zoom]);
  const cellAt = (x: number, y: number) => {
    const c = board.current?.getBoundingClientRect(), vp = viewport.current?.getBoundingClientRect();
    if (!c || !vp || x < vp.left || x >= vp.right || y < vp.top || y >= vp.bottom || x < c.left || x >= c.right || y < c.top || y >= c.bottom) return null;
    return Math.floor((y - c.top) / c.height * d.side) * d.side + Math.floor((x - c.left) / c.width * d.side);
  };
  const tapCell = (slot: number) => { if (disabled) return; const id = a.board[slot];
    if (a.selected !== null && a.selected !== id) dispatch({ type: "place", piece: a.selected, slot });
    else if (id !== null && id !== undefined) dispatch({ type: "select", piece: id });
  };
  const showGhost = (p: Press, x: number, y: number) => {
    const c = ghost.current, root = shell.current; if (!c || !root || p.piece === null) return;
    const sprite = latest.current.art[p.piece]; if (!sprite) return;
    const bounds = root.getBoundingClientRect(), scale = bounds.width / root.offsetWidth;
    c.style.display = "block"; c.style.transform = `translate(${(x - bounds.left) / scale - 40}px, ${(y - bounds.top) / scale - 40}px)`;
    const ctx = c.getContext("2d")!; ctx.clearRect(0, 0, 160, 160); ctx.save(); ctx.translate(80, 80); ctx.rotate(latest.current.a.turns[p.piece]! * Math.PI / 2); ctx.drawImage(sprite, -75, -75, 150, 150); ctx.restore();
  };
  const down = (e: ReactPointerEvent, source: "tray" | "board", piece: number | null) => {
    if (e.button !== 0) return;
    if (source === "board") {
      points.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (points.current.size === 2) {
        const [p, q] = [...points.current.values()]; press.current = null; if (ghost.current) ghost.current.style.display = "none";
        pinch.current = { distance: Math.hypot(p!.x - q!.x, p!.y - q!.y), zoom, x: (p!.x + q!.x) / 2, y: (p!.y + q!.y) / 2, left: viewport.current!.scrollLeft, top: viewport.current!.scrollTop };
        e.currentTarget.setPointerCapture(e.pointerId); e.preventDefault(); return;
      }
    }
    if (press.current) return;
    if (disabled && source === "board") piece = null;
    const node = shell.current!;
    press.current = { pointer: e.pointerId, source, piece, x: e.clientX, y: e.clientY, mode: "pending", left: tray.current?.scrollLeft ?? 0, scale: node.getBoundingClientRect().width / node.offsetWidth };
    e.currentTarget.setPointerCapture(e.pointerId); e.preventDefault();
  };
  const move = (e: ReactPointerEvent) => {
    if (points.current.has(e.pointerId)) points.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch.current && points.current.size >= 2) {
      const [p, q] = [...points.current.values()], base = pinch.current;
      const next = Math.max(1, Math.min(4, base.zoom * Math.hypot(p!.x - q!.x, p!.y - q!.y) / Math.max(1, base.distance)));
      setZoom(next);
      const vp = viewport.current!, scale = vp.getBoundingClientRect().width / vp.offsetWidth;
      vp.scrollLeft = (base.left + size / 2) * (next / base.zoom) - size / 2 - ((p!.x + q!.x) / 2 - base.x) / scale;
      vp.scrollTop = (base.top + size / 2) * (next / base.zoom) - size / 2 - ((p!.y + q!.y) / 2 - base.y) / scale;
      return;
    }
    const p = press.current; if (!p || p.pointer !== e.pointerId) return;
    const dx = (e.clientX - p.x) / p.scale, dy = (e.clientY - p.y) / p.scale;
    if (p.mode === "pending" && Math.hypot(dx, dy) > 8) p.mode = p.source === "tray" && Math.abs(dx) > Math.abs(dy) * 1.15 ? "scroll" : "drag";
    if (p.mode === "scroll" && tray.current) tray.current.scrollLeft = p.left - dx;
    else if (p.mode === "drag" && !latest.current.disabled) showGhost(p, e.clientX, e.clientY);
  };
  const up = (e: ReactPointerEvent) => {
    points.current.delete(e.pointerId);
    if (pinch.current) { if (!points.current.size) pinch.current = null; press.current = null; return; }
    const p = press.current; if (!p || p.pointer !== e.pointerId) return;
    press.current = null; if (ghost.current) ghost.current.style.display = "none";
    if (disabled) return;
    if (p.mode === "pending") { if (p.source === "tray" && p.piece !== null) dispatch({ type: "select", piece: p.piece }); else { const slot = cellAt(e.clientX, e.clientY); if (slot !== null) tapCell(slot); } }
    else if (p.mode === "drag" && p.piece !== null) {
      const slot = cellAt(e.clientX, e.clientY), bounds = tray.current?.getBoundingClientRect();
      if (slot !== null) dispatch({ type: "place", piece: p.piece, slot });
      else if (bounds && p.source === "board" && e.clientX >= bounds.left && e.clientX <= bounds.right && e.clientY >= bounds.top && e.clientY <= bounds.bottom) dispatch({ type: "return", piece: p.piece });
    }
  };
  const cancel = () => { press.current = null; points.current.clear(); pinch.current = null; if (ghost.current) ghost.current.style.display = "none"; };
  useEffect(() => { if (disabled) cancel(); }, [disabled]);
  useEffect(() => {
    const node = tray.current; if (!node) return;
    const wheel = (event: WheelEvent) => { if (event.ctrlKey) return; const before = node.scrollLeft; node.scrollLeft += (Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY) * (event.deltaMode === 1 ? 16 : 1); if (before !== node.scrollLeft) event.preventDefault(); };
    node.addEventListener("wheel", wheel, { passive: false }); return () => node.removeEventListener("wheel", wheel);
  }, []);
  useEffect(() => { if (zoom === 1 && viewport.current) { viewport.current.scrollLeft = 0; viewport.current.scrollTop = 0; } }, [zoom]);
  return <div ref={shell} style={{ width: "100%", position: "relative" }}>
    {imageError && <p role="alert">{imageError} Reload to retry; your saved progress has been kept.</p>}
    <style>{`.game-tray::-webkit-scrollbar,.game-board-viewport::-webkit-scrollbar{display:none} .game-cell:focus-visible {outline-offset:-3px!important}`}</style>
    <div ref={viewport} className="game-board-viewport" data-testid="game-board-viewport" style={{ width: size, height: size, overflow: "auto", scrollbarWidth: "none", margin: "auto", borderRadius: 12, touchAction: "none" }}
      onPointerDown={e => { const slot = cellAt(e.clientX, e.clientY); down(e, "board", slot === null ? null : a.board[slot]!); }} onPointerMove={move} onPointerUp={up} onPointerCancel={cancel}>
      <div data-testid="puzzle-board" style={{ width: size * zoom, height: size * zoom, position: "relative" }}>
        <canvas ref={board} aria-hidden style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}/>
        <div role="grid" aria-label={`${d.side} by ${d.side} puzzle board`} aria-rowcount={d.side} aria-colcount={d.side} data-testid="puzzle-seams" data-rows={d.side} data-columns={d.side}
          style={{ display: "grid", gridTemplateColumns: `repeat(${d.side},1fr)`, position: "absolute", inset: 0 }}>
          {a.board.map((id, slot) => <button key={slot} className="game-cell" role="gridcell" data-slot={slot} data-piece={id ?? ""} aria-label={`Row ${Math.floor(slot / d.side) + 1}, column ${slot % d.side + 1}${id === null ? ", empty" : `, piece ${id + 1}`}`} aria-selected={id !== null && id === a.selected} aria-disabled={disabled}
            tabIndex={focus === slot ? 0 : -1} onFocus={() => setFocus(slot)} onClick={e => { if (e.detail === 0) tapCell(slot); }}
            onKeyDown={e => { const delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -d.side, ArrowDown: d.side }[e.key];
              if (delta !== undefined) { e.preventDefault(); const next = Math.max(0, Math.min(a.board.length - 1, slot + delta)); setFocus(next); (e.currentTarget.parentElement?.children[next] as HTMLElement)?.focus(); }
              if (e.key.toLowerCase() === "r" && !disabled) dispatch({ type: "rotate" }); }}
            style={{ padding: 0, border: 0, background: "transparent", minWidth: 0, cursor: disabled ? "default" : "pointer", touchAction: "none" }}/>) }
        </div>
      </div>
    </div>
    {controls}
    <div data-testid="puzzle-tray" style={{ borderRadius: 14, background: "white", padding: "5px 0", marginTop: 0 }}>
      <div ref={tray} role="region" aria-label="Puzzle piece tray" tabIndex={0} data-testid="piece-tray-scroll" className="game-tray"
        onPointerMove={move} onPointerUp={up} onPointerCancel={cancel}
        onKeyDown={e => { if (e.target !== e.currentTarget) return; if (e.key === "ArrowRight") e.currentTarget.scrollLeft += 74; else if (e.key === "ArrowLeft") e.currentTarget.scrollLeft -= 74; else if (e.key === "Home") e.currentTarget.scrollLeft = 0; else if (e.key === "End") e.currentTarget.scrollLeft = e.currentTarget.scrollWidth; else return; e.preventDefault(); }}
        style={{ height: 76, overflowX: "auto", overflowY: "hidden", scrollbarWidth: "none", touchAction: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 8px", width: "max-content", minWidth: "100%", height: 70, boxSizing: "border-box" }}>
          {a.tray.map(id => <button key={id} data-piece={id} data-testid="tray-piece" aria-label={`Select piece ${id + 1}`} aria-pressed={a.selected === id} aria-disabled={disabled}
            onPointerDown={e => down(e, "tray", id)} onClick={e => { if (e.detail === 0 && !disabled) dispatch({ type: "select", piece: id }); }}
            style={{ background: a.selected === id ? theme.color.selected : "transparent", border: `2px solid ${a.selected === id ? theme.color.primary : "transparent"}`, borderRadius: 10, padding: 0, width: 68, height: 68, flexShrink: 0, cursor: disabled ? "default" : "grab", touchAction: "none" }}>
            <Piece sprite={art[id]} turn={a.turns[id]!} selected={a.selected === id}/>
          </button>)}
          {!a.tray.length && <span style={{ color: theme.color.textSecondary, fontSize: 12, padding: 12 }}>All pieces are on the board</span>}
        </div>
      </div>
    </div>
    <canvas ref={ghost} width={160} height={160} style={{ display: "none", pointerEvents: "none", position: "absolute", width: 80, height: 80, top: 0, left: 0, zIndex: 30, filter: "drop-shadow(0 4px 4px #17124f55)" }}/>
  </div>;
}
