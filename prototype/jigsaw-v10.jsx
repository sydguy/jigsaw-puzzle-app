import { useState, useEffect, useRef, useCallback, useMemo } from "react";

/* edges = [top,right,bottom,left]: 0 flat | +1 tab | -1 blank.
   Adjacent facing edges always sum to 0, so tabs mesh into blanks. */

const REF = { rows: 3, cols: 3 };
const CAP = 900;                       // max natural board long-side (sprite resolution)
const DRAG_THRESHOLD = 8;              // px of movement before a press becomes a drag

function demoCanvas(w = 440, h = 360) {
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
  const x = cv.getContext("2d");
  const g = x.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, "#5b8dee"); g.addColorStop(.55, "#a5c8f0"); g.addColorStop(1, "#cdeafd");
  x.fillStyle = g; x.fillRect(0, 0, w, h);
  x.fillStyle = "#f7c86b"; x.beginPath(); x.arc(w * .5, h * .4, Math.min(w, h) * .2, 0, 7); x.fill();
  x.fillStyle = "#e05a5a"; x.fillRect(w * .2, h * .66, w * .13, h * .22); x.fillRect(w * .67, h * .66, w * .13, h * .22);
  x.fillStyle = "#4caf7d"; x.beginPath(); x.moveTo(w * .5, h * .18); x.lineTo(w * .66, h * .46); x.lineTo(w * .34, h * .46); x.closePath(); x.fill();
  x.fillStyle = "rgba(255,255,255,.92)"; x.font = `bold ${Math.round(w * .05)}px system-ui`; x.textAlign = "center";
  x.fillText("Upload a photo!", w / 2, h * .93);
  return cv;
}

const rnd = () => Math.random() < .5 ? -1 : 1;

function buildEdges(rows, cols) {
  const E = Array.from({ length: rows * cols }, () => [0, 0, 0, 0]);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const id = r * cols + c;
    if (c < cols - 1) { const s = rnd(); E[id][1] = s; E[id + 1][3] = -s; }
    if (r < rows - 1) { const s = rnd(); E[id][2] = s; E[id + cols][0] = -s; }
  }
  return E;
}

const rot = (e, q) => { const k = ((q % 4) + 4) % 4; return [0, 1, 2, 3].map(i => e[(i - k + 4) % 4]); };

function edgePath(ctx, S, E, nx, ny, v, t) {
  if (v === 0) { ctx.lineTo(E[0], E[1]); return; }
  const ux = E[0] - S[0], uy = E[1] - S[1], L = Math.hypot(ux, uy);
  const dx = ux / L, dy = uy / L, d = v * t;
  const P = (a, h) => [S[0] + dx * a + nx * h, S[1] + dy * a + ny * h];
  ctx.lineTo(...P(.4 * L, 0));
  let p = P(.5 * L, 0), q = P(.32 * L, d), e = P(.5 * L, d); ctx.bezierCurveTo(p[0], p[1], q[0], q[1], e[0], e[1]);
  p = P(.68 * L, d); q = P(.5 * L, 0); e = P(.6 * L, 0); ctx.bezierCurveTo(p[0], p[1], q[0], q[1], e[0], e[1]);
  p = P(.73 * L, 0); q = P(.87 * L, 0); e = P(L, 0); ctx.bezierCurveTo(p[0], p[1], q[0], q[1], e[0], e[1]);
}

function sprite(img, row, col, cw, ch, t, boardW, boardH, edges) {
  const W = cw + 2 * t, H = ch + 2 * t;
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d");
  const TL = [t, t], TR = [t + cw, t], BR = [t + cw, t + ch], BL = [t, t + ch];
  ctx.beginPath(); ctx.moveTo(TL[0], TL[1]);
  edgePath(ctx, TL, TR, 0, -1, edges[0], t);
  edgePath(ctx, TR, BR, 1, 0, edges[1], t);
  edgePath(ctx, BR, BL, 0, 1, edges[2], t);
  edgePath(ctx, BL, TL, -1, 0, edges[3], t);
  ctx.closePath();
  ctx.save(); ctx.clip();
  ctx.drawImage(img, 0, 0, img.width, img.height, t - col * cw, t - row * ch, boardW, boardH);
  ctx.restore();
  ctx.lineWidth = 1; ctx.strokeStyle = "rgba(255,255,255,.5)"; ctx.stroke();
  ctx.lineWidth = .6; ctx.strokeStyle = "rgba(0,0,0,.16)"; ctx.stroke();
  return cv.toDataURL();
}

const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const vibrate = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };

export default function Jigsaw() {
  const [imgSrc, setImgSrc] = useState(null);
  const [imgEl, setImgEl] = useState(null);
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [rotate, setRotate] = useState(false);   // rotation enabled? (replaces age dropdown)
  const [geom, setGeom] = useState({ cwR: 0, chR: 0, tR: 0, natW: 0, natH: 0 });
  const [pieces, setPieces] = useState([]);
  const [tray, setTray] = useState([]);
  const [grid, setGrid] = useState([]);
  const [sel, setSel] = useState(null);          // tap-selected: {src:'tray',id} | {src:'cell',slot}
  const [press, setPress] = useState(null);       // pointer-down feedback: {src, key}
  const [drag, setDrag] = useState(null);         // active drag ghost: {pid,source,slot,x,y}
  const [moves, setMoves] = useState(0);
  const [secs, setSecs] = useState(0);
  const [run, setRun] = useState(false);
  const [solved, setSolved] = useState(false);
  const [peek, setPeek] = useState(false);
  const [saved, setSaved] = useState(null);
  const [bump, setBump] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [celebrated, setCelebrated] = useState(false);
  const [view, setView] = useState({ w: 360, h: 460 });
  const [vpw, setVpw] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);

  const fileRef = useRef(null);
  const timer = useRef(null);
  const viewportRef = useRef(null);
  const dragRef = useRef(null);

  const isMobile = vpw < 760;
  const isNarrow = vpw < 720;
  const maxGrid = isMobile ? 6 : 10;

  // viewport + window measurement
  useEffect(() => {
    const onResize = () => setVpw(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  useEffect(() => {
    if (!viewportRef.current) return;
    const el = viewportRef.current;
    const ro = new ResizeObserver(() => {
      setView({ w: el.clientWidth, h: Math.min(Math.round(window.innerHeight * 0.6), 560) });
    });
    ro.observe(el);
    setView({ w: el.clientWidth, h: Math.min(Math.round(window.innerHeight * 0.6), 560) });
    return () => ro.disconnect();
  }, []);

  // clamp grid to device max
  useEffect(() => {
    if (rows > maxGrid) setRows(maxGrid);
    if (cols > maxGrid) setCols(maxGrid);
  }, [maxGrid]); // eslint-disable-line

  // demo image
  useEffect(() => { setImgSrc(demoCanvas().toDataURL()); }, []);
  useEffect(() => { if (!imgSrc) return; const im = new Image(); im.onload = () => setImgEl(im); im.src = imgSrc; }, [imgSrc]);

  const init = useCallback(() => {
    if (!imgEl) return;
    const s = Math.min(1, CAP / Math.max(imgEl.width, imgEl.height));
    const natW0 = imgEl.width * s, natH0 = imgEl.height * s;
    const cwR = Math.max(28, Math.floor(natW0 / cols));
    const chR = Math.max(28, Math.floor(natH0 / rows));
    const natW = cwR * cols, natH = chR * rows;
    const tR = Math.max(5, Math.round(0.2 * Math.min(cwR, chR)));
    REF.rows = rows; REF.cols = cols;
    const E = buildEdges(rows, cols);
    const ps = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const id = r * cols + c;
      const rotation = rotate ? [0, 90, 180, 270][(Math.random() * 4) | 0] : 0;
      ps.push({ id, row: r, col: c, edges: E[id], rotation, sprite: sprite(imgEl, r, c, cwR, chR, tR, natW, natH, E[id]) });
    }
    setGeom({ cwR, chR, tR, natW, natH });
    setPieces(ps); setTray(shuffle(ps.map(p => p.id))); setGrid(Array(rows * cols).fill(null));
    setSel(null); setPress(null); setDrag(null); setMoves(0); setSecs(0); setRun(false);
    setSolved(false); setPeek(false); setSaved(null); setZoom(1);
    clearInterval(timer.current);
  }, [imgEl, rows, cols, rotate]);

  useEffect(() => { init(); }, [init]);

  useEffect(() => {
    if (run && !solved && !peek) timer.current = setInterval(() => setSecs(s => s + 1), 1000);
    else clearInterval(timer.current);
    return () => clearInterval(timer.current);
  }, [run, solved, peek]);

  useEffect(() => {
    if (peek) return;
    if (!pieces.length || grid.some(v => v === null)) return;
    const ok = grid.every((pid, slot) => { const p = pieces[pid]; return p && p.row * cols + p.col === slot && p.rotation === 0; });
    if (ok) { setSolved(true); clearInterval(timer.current); }
  }, [grid, pieces, cols, peek]);

  // after the win, let the ticks celebrate briefly, then clear them for a clean picture
  useEffect(() => {
    if (!solved) { setCelebrated(false); return; }
    const t = setTimeout(() => setCelebrated(true), 1700);
    return () => clearTimeout(t);
  }, [solved]);

  function shuffle(a) { const x = [...a]; for (let i = x.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0;[x[i], x[j]] = [x[j], x[i]]; } return x; }

  // Full compliance check for a piece at a given rotation in a slot:
  //  - outer frame edges must be flat, AND
  //  - every edge touching a placed neighbour must mesh (tab meets blank).
  const complies = (pid, rotation, slot, g) => {
    const R = Math.floor(slot / cols), C = slot % cols;
    const re = rot(pieces[pid].edges, rotation / 90);
    const onB = [R === 0, C === cols - 1, R === rows - 1, C === 0];
    for (let i = 0; i < 4; i++) if (onB[i] && re[i] !== 0) return false;     // outer frame must be flat
    const nbr = [R > 0 ? slot - cols : -1, C < cols - 1 ? slot + 1 : -1, R < rows - 1 ? slot + cols : -1, C > 0 ? slot - 1 : -1];
    const opp = [2, 3, 0, 1];
    for (let i = 0; i < 4; i++) {
      const ns = nbr[i]; if (ns < 0 || g[ns] == null) continue;
      const np = pieces[g[ns]]; const ne = rot(np.edges, np.rotation / 90);
      if (re[i] + ne[opp[i]] !== 0) return false;                            // must mesh with placed neighbour
    }
    return true;
  };

  // Whether a piece MAY be dropped into a slot at all.
  //  - Rotation OFF: gated — it only drops where it complies upright.
  //  - Rotation ON: always allowed; the piece then stays "locked selected" until
  //    the player rotates it into compliance (see lockedSlot).
  const gateOK = (pid, slot, g) => rotate ? true : complies(pid, 0, slot, g);
  const compliesNow = (pid, slot, g) => complies(pid, pieces[pid].rotation, slot, g);

  const flash = k => { setBump(k); setTimeout(() => setBump(null), 450); };
  const ensureRun = () => { if (!run) setRun(true); };

  // ---- placement primitives (shared by tap + drag). After a placement, if
  // rotation is on and the piece does not yet comply, it stays selected (locked). ----
  const dropTrayToCell = (pid, slot) => {
    const occ = grid[slot];
    const gCheck = occ != null ? grid.map((v, i) => (i === slot ? null : v)) : grid;
    if (!gateOK(pid, slot, gCheck)) { flash(slot); return; }
    const ng = [...grid]; ng[slot] = pid;
    setGrid(ng);
    setTray(tr => { const w = tr.filter(x => x !== pid); return occ != null ? [...w, occ] : w; });
    setMoves(m => m + 1);
    setSel(rotate && !compliesNow(pid, slot, ng) ? { src: "cell", slot } : null);
  };
  const moveCellToCell = (from, slot) => {
    if (from === slot) return;
    const mv = grid[from], tg = grid[slot];
    let ng;
    if (tg == null) {
      const gCheck = grid.map((v, i) => (i === from ? null : v));
      if (!gateOK(mv, slot, gCheck)) { flash(slot); return; }
      ng = [...grid]; ng[slot] = mv; ng[from] = null;
    } else {
      const gCheck = grid.map((v, i) => (i === from || i === slot ? null : v));
      if (!rotate && !(complies(mv, 0, slot, gCheck) && complies(tg, 0, from, gCheck))) { flash(slot); return; }
      ng = [...grid]; ng[slot] = mv; ng[from] = tg;
    }
    setGrid(ng);
    setMoves(m => m + 1);
    setSel(rotate && !compliesNow(mv, slot, ng) ? { src: "cell", slot } : null);
  };
  const returnToTray = slot => {
    const pid = grid[slot]; if (pid == null) return;
    setGrid(g => { const n = [...g]; n[slot] = null; return n; });
    setTray(tr => [...tr, pid]); setMoves(m => m + 1); setSel(null);
  };

  // A selected board piece that does not comply in its current rotation is "locked":
  // it cannot be deselected or another piece picked up — only rotated (or sent back to
  // the tray) — until both the edge rule and every neighbour's notches line up.
  const lockedSlot = (rotate && sel?.src === "cell" && grid[sel.slot] != null
    && !compliesNow(grid[sel.slot], sel.slot, grid)) ? sel.slot : null;

  // ---- tap flow (no freeze: a non-complying piece may still be moved/rotated) ----
  const tapTray = pid => {
    if (peek || solved) return; ensureRun();
    if (sel?.src === "tray" && sel.id === pid) return setSel(null);
    if (sel?.src === "cell") { dropTrayToCell(pid, sel.slot); return; }
    setSel({ src: "tray", id: pid });
  };
  const tapCell = slot => {
    if (peek || solved) return; ensureRun();
    const pid = grid[slot];
    if (!sel) { if (pid != null) setSel({ src: "cell", slot }); return; }
    if (sel.src === "tray") { dropTrayToCell(sel.id, slot); return; }
    if (sel.slot === slot) {
      // re-tapping the selected piece releases it only if it complies here now;
      // if it doesn't fit in this spot/orientation it stays selected (rotate or move it).
      if (lockedSlot === slot) return;
      return setSel(null);
    }
    moveCellToCell(sel.slot, slot);   // shift to another cell → compliance re-checked there
  };

  // ---- rotation ----
  const turn = slot => { if (peek || solved || !rotate) return; const pid = grid[slot]; setPieces(ps => ps.map(p => p.id === pid ? { ...p, rotation: (p.rotation + 90) % 360 } : p)); setMoves(m => m + 1); };
  const turnTray = pid => { if (peek || solved || !rotate) return; setPieces(ps => ps.map(p => p.id === pid ? { ...p, rotation: (p.rotation + 90) % 360 } : p)); };

  // ---- pointer (unified tap + drag) ----
  const pointerDown = (e, source, key) => {
    if (peek || solved) return;
    e.stopPropagation();
    const pid = source === "tray" ? key : grid[key];
    if (pid == null) return;
    dragRef.current = { pid, source, slot: source === "cell" ? key : null, sx: e.clientX, sy: e.clientY, started: false, pointerId: e.pointerId };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
    setPress({ src: source, key });
    vibrate(8);
  };
  const pointerMove = e => {
    const d = dragRef.current; if (!d || e.pointerId !== d.pointerId) return;
    const dx = e.clientX - d.sx, dy = e.clientY - d.sy;
    if (!d.started && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
      d.started = true; setPress(null);
      setDrag({ pid: d.pid, source: d.source, slot: d.slot, x: e.clientX, y: e.clientY });
    }
    if (d.started) setDrag(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : prev);
  };
  const cellFromPoint = (clientX, clientY) => {
    const vp = viewportRef.current; if (!vp) return null;
    const rect = vp.getBoundingClientRect();
    const x = (clientX - rect.left + vp.scrollLeft) / scale;
    const y = (clientY - rect.top + vp.scrollTop) / scale;
    if (x < 0 || y < 0 || x >= natW || y >= natH) return null;
    const c = Math.floor(x / cwR), r = Math.floor(y / chR);
    if (c < 0 || c >= cols || r < 0 || r >= rows) return null;
    return r * cols + c;
  };
  const pointerUp = e => {
    const d = dragRef.current; if (!d || e.pointerId !== d.pointerId) return;
    dragRef.current = null;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (err) {}
    setPress(null);
    if (d.started) {
      setDrag(null);
      const target = cellFromPoint(e.clientX, e.clientY);
      if (target != null) {
        ensureRun();
        if (d.source === "tray") dropTrayToCell(d.pid, target);
        else moveCellToCell(d.slot, target);
      } else {
        const el = document.elementFromPoint(e.clientX, e.clientY);
        const trayEl = el && el.closest ? el.closest("[data-tray]") : null;
        if (trayEl && d.source === "cell") { ensureRun(); returnToTray(d.slot); }
      }
    } else {
      if (d.source === "tray") tapTray(d.pid); else tapCell(d.slot);
    }
  };

  const togglePeek = () => {
    if (!peek) {
      setSaved({ grid: [...grid], tray: [...tray], rot: pieces.map(p => p.rotation) });
      setGrid(pieces.map(p => p.id)); setPieces(ps => ps.map(p => ({ ...p, rotation: 0 }))); setPeek(true); setSel(null);
    } else {
      setGrid(saved.grid); setTray(saved.tray);
      setPieces(ps => ps.map((p, i) => ({ ...p, rotation: saved.rot[i] }))); setPeek(false);
    }
  };
  const onFile = e => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => setImgSrc(r.result); r.readAsDataURL(f); };

  // ---- display geometry ----
  const { cwR, chR, tR, natW, natH } = geom;
  const fitFactor = useMemo(() => {
    if (!natW || !natH) return 1;
    return Math.min(view.w / natW, view.h / natH, 1.6);
  }, [view, natW, natH]);
  const scale = fitFactor * zoom;
  const cellDisp = cwR * scale;
  const showBadge = cellDisp > 30;
  const showGlow = cellDisp > 14;
  const badgeNat = Math.min(Math.min(cwR, chR) * 0.4, 13 / (scale || 1)); // ~13px on screen

  const inGrid = new Set(grid.filter(v => v != null));
  const trayBox = Math.max(40, Math.min(isMobile ? 56 : 72, (cwR + 2 * tR) * 0.5));
  const trayScale = trayBox / (cwR + 2 * tR || 1);
  const correct = (pid, slot) => { const p = pieces[pid]; return p && p.row * cols + p.col === slot && p.rotation === 0; };
  const S = sheet;
  const range = [];
  for (let i = 3; i <= maxGrid; i++) range.push(i);

  return (
    <div style={S.wrap}>
      <style>{css}</style>

      <div style={S.top}>
        <div style={S.title}>Jigsaw puzzle</div>
        <div style={S.stats}><span>Moves <b style={S.b}>{moves}</b></span><span>Time <b style={S.b}>{fmt(secs)}</b></span></div>
      </div>

      <div style={S.upload} onClick={() => fileRef.current?.click()}>
        📷 Upload your picture — any shape, square or not
        <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: "none" }} />
      </div>

      <div style={S.controls}>
        <label style={{ ...S.toggle, ...(rotate ? S.toggleOn : {}) }}>
          <input type="checkbox" checked={rotate} onChange={e => setRotate(e.target.checked)} style={{ margin: 0 }} />
          Rotation {rotate ? "on" : "off"}
        </label>
        <label style={S.gridPick}>Rows
          <select style={S.selSm} value={rows} onChange={e => setRows(Number(e.target.value))}>{range.map(n => <option key={n} value={n}>{n}</option>)}</select>
        </label>
        <label style={S.gridPick}>Cols
          <select style={S.selSm} value={cols} onChange={e => setCols(Number(e.target.value))}>{range.map(n => <option key={n} value={n}>{n}</option>)}</select>
        </label>
        <button style={S.btn} onClick={init}>↺ New</button>
        <button style={{ ...S.btn, ...(peek ? {} : S.primary) }} onClick={togglePeek}>{peek ? "🙈 Hide" : "👁 Solution"}</button>
      </div>

      {solved && !peek && <div style={S.win}>🎉 Solved in {moves} moves · {fmt(secs)}<button style={S.sbtn} onClick={init}>Play again</button></div>}
      {peek && <div style={S.peekBar}>Showing the finished picture — your progress is saved<button style={S.sbtn} onClick={togglePeek}>Hide &amp; continue</button></div>}

      {/* contextual action toolbar for the selected piece */}
      {!peek && !solved && sel && (
        <div style={{ ...S.toolbar, ...(lockedSlot != null ? S.toolbarLock : {}) }}>
          <span style={{ ...S.toolLabel, ...(lockedSlot != null ? S.toolLabelLock : {}) }}>
            {lockedSlot != null ? "Doesn't fit here — rotate it, or move it somewhere it fits" : sel.src === "tray" ? "Tray piece selected" : "Board piece selected"}
          </span>
          {rotate && <button style={S.toolBtn} onClick={() => sel.src === "tray" ? turnTray(sel.id) : turn(sel.slot)}>↻ Rotate</button>}
          {sel.src === "cell" && <button style={S.toolBtn} onClick={() => returnToTray(sel.slot)}>↩ To tray</button>}
          {lockedSlot == null && <button style={S.toolBtn} onClick={() => setSel(null)}>✕ Deselect</button>}
        </div>
      )}

      <div style={{ ...S.main, flexDirection: isNarrow ? "column" : "row" }}>
        {/* BOARD COLUMN */}
        <div style={{ flex: isNarrow ? "1 1 auto" : "1 1 62%", minWidth: 0 }}>
          <div style={S.barRow}>
            <span style={S.label}>Board</span>
            <span style={S.zoomBox}>
              <button style={S.zoomBtn} onClick={() => setZoom(z => Math.max(1, +(z - 0.25).toFixed(2)))}>−</button>
              <input type="range" min="1" max="5" step="0.25" value={zoom} onChange={e => setZoom(Number(e.target.value))} style={{ width: 90 }} />
              <button style={S.zoomBtn} onClick={() => setZoom(z => Math.min(5, +(z + 0.25).toFixed(2)))}>+</button>
              <button style={S.zoomFit} onClick={() => setZoom(1)}>Fit</button>
            </span>
          </div>

          <div ref={viewportRef} style={{ ...S.viewport, height: Math.max(160, Math.round(natH * fitFactor) + 2) }}>
            <div style={{ width: natW * scale, height: natH * scale, position: "relative" }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: natW, height: natH, transform: `scale(${scale})`, transformOrigin: "0 0", background: "#eef0f2" }}>
                {/* slot layer (matrix + tap + drop targets) */}
                {grid.map((pid, slot) => {
                  const r = Math.floor(slot / cols), c = slot % cols;
                  const bad = bump === slot;
                  const selCell = sel?.src === "cell" && sel.slot === slot;
                  const locked = lockedSlot === slot;
                  return (
                    <div key={"s" + slot} data-slot={slot}
                      onClick={() => { if (grid[slot] == null) tapCell(slot); }}
                      style={{ position: "absolute", left: c * cwR, top: r * chR, width: cwR, height: chR, boxSizing: "border-box", border: "0.5px solid #d7dadd", cursor: peek ? "default" : "pointer", zIndex: 1, outline: locked ? "2px solid #e8a33d" : selCell ? "2px solid #378ADD" : bad ? "2px solid #e24b4a" : "none", outlineOffset: -2, background: bad ? "rgba(226,75,74,.14)" : "transparent" }} />
                  );
                })}
                {/* piece layer */}
                {grid.map((pid, slot) => {
                  if (pid == null) return null;
                  const r = Math.floor(slot / cols), c = slot % cols;
                  const locked = lockedSlot === slot;
                  const active = (sel?.src === "cell" && sel.slot === slot) || (press?.src === "cell" && press.key === slot);
                  const dragging = drag && drag.source === "cell" && drag.slot === slot;
                  const ok = correct(pid, slot);
                  return (
                    <div key={"p" + slot} data-slot={slot}
                      onPointerDown={e => pointerDown(e, "cell", slot)} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp}
                      style={{ position: "absolute", left: c * cwR - tR, top: r * chR - tR, width: cwR + 2 * tR, height: chR + 2 * tR, zIndex: active ? 40 : 5, opacity: dragging ? .3 : 1, touchAction: "none", cursor: peek ? "default" : "grab" }}>
                      <img src={pieces[pid].sprite} alt="" draggable={false}
                        style={{ width: "100%", height: "100%", transform: `rotate(${peek ? 0 : pieces[pid].rotation}deg) scale(${active ? 1.07 : 1})`, transformOrigin: "center", pointerEvents: "none", filter: !peek && ok && showGlow && !solved ? "drop-shadow(0 0 4px rgba(25,170,110,.95))" : "drop-shadow(0 1px 1.5px rgba(0,0,0,.22))" }} />
                      {locked && <div className="jp-ring jp-ring-lock" style={{ position: "absolute", inset: 0, borderRadius: 6, pointerEvents: "none" }} />}
                      {active && !locked && <div className="jp-ring" style={{ position: "absolute", inset: 0, borderRadius: 6, pointerEvents: "none" }} />}
                      {!peek && ok && showBadge && !celebrated && (
                        <div className={solved ? "jp-tick jp-celebrate" : "jp-tick"} style={{ position: "absolute", left: tR + 3, top: tR + 3, width: badgeNat, height: badgeNat, borderRadius: "50%", background: "rgba(22,168,107,.92)", border: `${badgeNat * 0.12}px solid #fff`, boxShadow: `0 0 ${badgeNat * 0.18}px rgba(0,0,0,.3)`, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", animationDelay: solved ? `${(Math.floor(slot / cols) + (slot % cols)) * 35}ms` : undefined }}>
                          <span style={{ color: "#fff", fontSize: badgeNat * 0.62, fontWeight: 800, lineHeight: 1 }}>✓</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {!peek && <div style={S.note}>
            {rotate
              ? "Tap or drag a piece onto the board. Wherever it sits, if its notches don't meet the neighbours or a tab pokes past the outer edge, it stays selected — rotate it in place, or move it to another cell, until it fits (a wrong-but-fitting spot is allowed). It releases the moment it complies where it is."
              : "Tap a piece then a cell, or drag it onto the board. A piece only drops where its edges fit the pieces already placed; border pieces need their flat side facing out."}
          </div>}
        </div>

        {/* TRAY COLUMN */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={S.label}>{peek ? "Tray" : `Pieces · ${inGrid.size}/${rows * cols} placed`}</div>
          <div data-tray="1" style={{ ...S.tray, maxHeight: isNarrow ? 180 : Math.round(window.innerHeight * 0.55) }}>
            {peek ? <span style={S.muted}>Hidden while viewing the solution</span>
              : tray.map(pid => {
                const active = (sel?.src === "tray" && sel.id === pid) || (press?.src === "tray" && press.key === pid);
                const dragging = drag && drag.source === "tray" && drag.pid === pid;
                const w = (cwR + 2 * tR) * trayScale, h = (chR + 2 * tR) * trayScale;
                return (
                  <div key={pid} data-piece={pid}
                    onPointerDown={e => pointerDown(e, "tray", pid)} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp}
                    style={{ ...S.slot, width: w, height: h, opacity: dragging ? .3 : 1, zIndex: active ? 5 : 1, touchAction: "none", outline: active ? "2.5px solid #378ADD" : "none", outlineOffset: 1 }}>
                    <img src={pieces[pid].sprite} alt="" draggable={false} style={{ width: "100%", height: "100%", transform: `rotate(${pieces[pid].rotation}deg) scale(${active ? 1.08 : 1})`, transformOrigin: "center", pointerEvents: "none" }} />
                    {active && <div className="jp-ring" style={{ position: "absolute", inset: 0, borderRadius: 6, pointerEvents: "none" }} />}
                  </div>
                );
              })}
          </div>
          {!peek && <div style={S.hintSmall}>Tap to select · drag onto the board · drop a placed piece back here to return it</div>}
        </div>
      </div>

      {/* drag ghost */}
      {drag && (
        <div style={{ position: "fixed", left: drag.x, top: drag.y, width: (cwR + 2 * tR) * scale, height: (chR + 2 * tR) * scale, transform: `translate(-50%,-50%)`, pointerEvents: "none", zIndex: 1000, opacity: .92 }}>
          <img src={pieces[drag.pid].sprite} alt="" style={{ width: "100%", height: "100%", transform: `rotate(${pieces[drag.pid].rotation}deg)`, transformOrigin: "center", filter: "drop-shadow(0 4px 8px rgba(0,0,0,.4))" }} />
        </div>
      )}
    </div>
  );
}

const css = `
@keyframes jpPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(55,138,221,.6); } 50% { box-shadow: 0 0 0 7px rgba(55,138,221,0); } }
.jp-ring { box-shadow: 0 0 0 2px #378ADD, 0 0 0 0 rgba(55,138,221,.6); animation: jpPulse 1.1s ease-in-out infinite; }
@keyframes jpPulseLock { 0%,100% { box-shadow: 0 0 0 0 rgba(232,163,61,.7); } 50% { box-shadow: 0 0 0 7px rgba(232,163,61,0); } }
.jp-ring-lock { box-shadow: 0 0 0 2.5px #e8a33d, 0 0 0 0 rgba(232,163,61,.7); animation: jpPulseLock .9s ease-in-out infinite; }
.jp-tick { transition: transform .15s ease; }
@keyframes jpCelebrate {
  0%   { transform: scale(1);   opacity: 1; box-shadow: 0 0 2px rgba(25,170,110,.4); }
  35%  { transform: scale(1.7); opacity: 1; box-shadow: 0 0 12px 3px rgba(25,200,120,.9); }
  70%  { transform: scale(1.5); opacity: 1; box-shadow: 0 0 8px 2px rgba(25,200,120,.6); }
  100% { transform: scale(1.35); opacity: 0; box-shadow: 0 0 0 rgba(25,200,120,0); }
}
.jp-celebrate { animation: jpCelebrate .85s ease-out forwards; }
`;

const sheet = {
  wrap: { fontFamily: "system-ui, sans-serif", maxWidth: 1100, margin: "0 auto", padding: 14, color: "#1c1c1c" },
  top: { display: "flex", alignItems: "center", gap: 12, marginBottom: 10, flexWrap: "wrap" },
  title: { fontSize: 18, fontWeight: 600, flex: 1 },
  stats: { display: "flex", gap: 16, fontSize: 13, color: "#666" },
  b: { color: "#111", fontWeight: 600 },
  upload: { border: "1.5px dashed #c2c2c2", borderRadius: 10, padding: "10px 14px", textAlign: "center", fontSize: 13, color: "#666", cursor: "pointer", marginBottom: 10 },
  controls: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 10 },
  toggle: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, padding: "7px 11px", borderRadius: 8, border: "0.5px solid #cfcfcf", background: "#fff", cursor: "pointer", userSelect: "none" },
  toggleOn: { background: "#eef4fb", borderColor: "#9cc2ea", color: "#2a6cb0", fontWeight: 600 },
  selSm: { fontSize: 13, padding: "5px 6px", borderRadius: 7, border: "0.5px solid #cfcfcf", background: "#fff", cursor: "pointer", marginLeft: 5 },
  gridPick: { fontSize: 12, color: "#555", display: "inline-flex", alignItems: "center", gap: 2 },
  btn: { fontSize: 13, padding: "7px 12px", borderRadius: 8, border: "0.5px solid #bdbdbd", background: "#fff", cursor: "pointer" },
  primary: { background: "#378ADD", color: "#fff", border: "none" },
  sbtn: { fontSize: 12, padding: "5px 10px", borderRadius: 7, border: "0.5px solid #bbb", background: "#fff", cursor: "pointer", marginLeft: 10 },
  win: { background: "#e8f7ef", color: "#1e6b40", borderRadius: 10, padding: "9px 14px", fontSize: 14, fontWeight: 600, marginBottom: 10, display: "flex", alignItems: "center" },
  peekBar: { background: "#fff7e0", color: "#7a5200", borderRadius: 10, padding: "9px 14px", fontSize: 13, marginBottom: 10, display: "flex", alignItems: "center" },
  toolbar: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", background: "#eef4fb", border: "0.5px solid #cfe0f3", borderRadius: 10, padding: "7px 10px", marginBottom: 10 },
  toolbarLock: { background: "#fdeecf", border: "0.5px solid #f0cf97" },
  toolLabel: { fontSize: 12, color: "#3a6ea5", fontWeight: 600 },
  toolLabelLock: { color: "#9a6a10" },
  toolBtn: { fontSize: 13, padding: "5px 11px", borderRadius: 8, border: "0.5px solid #b8cfe8", background: "#fff", cursor: "pointer" },
  main: { display: "flex", gap: 16, alignItems: "flex-start" },
  barRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  label: { fontSize: 12, color: "#888", letterSpacing: ".03em" },
  zoomBox: { display: "flex", alignItems: "center", gap: 6 },
  zoomBtn: { width: 26, height: 26, borderRadius: 7, border: "0.5px solid #c9c9c9", background: "#fff", cursor: "pointer", fontSize: 16, lineHeight: 1 },
  zoomFit: { fontSize: 12, padding: "4px 9px", borderRadius: 7, border: "0.5px solid #c9c9c9", background: "#fff", cursor: "pointer" },
  viewport: { width: "100%", overflow: "auto", borderRadius: 8, border: "0.5px solid #d7d7d7", background: "#e9ebee", WebkitOverflowScrolling: "touch" },
  tray: { display: "flex", flexWrap: "wrap", gap: 7, padding: 10, border: "0.5px solid #d7d7d7", borderRadius: 10, minHeight: 90, background: "#f6f6f6", alignContent: "flex-start", overflow: "auto" },
  slot: { position: "relative", display: "flex", alignItems: "center", justifyContent: "center", cursor: "grab", borderRadius: 6, touchAction: "none" },
  muted: { fontSize: 12, color: "#aaa", alignSelf: "center" },
  note: { fontSize: 12, color: "#999", marginTop: 8, lineHeight: 1.5 },
  hintSmall: { fontSize: 11.5, color: "#aaa", marginTop: 8, lineHeight: 1.5 },
};
