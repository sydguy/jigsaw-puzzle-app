import { PropsWithChildren, useEffect, useRef, useState } from "react";

/** Browsing the illustrative tray only; piece placement remains deferred. */
export default function PieceTrayScroll({ children }: PropsWithChildren) {
  const scroll = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; x: number; left: number; scale: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  useEffect(() => {
    const node = scroll.current;
    if (!node) return;
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey) return;
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? node.clientWidth : 1;
      const before = node.scrollLeft;
      node.scrollLeft += delta * unit;
      if (node.scrollLeft !== before) event.preventDefault();
    };
    node.addEventListener("wheel", wheel, { passive: false });
    return () => node.removeEventListener("wheel", wheel);
  }, []);
  const finish = () => { drag.current = null; setDragging(false); };
  return <>
    <style>{`.puzzle-piece-scroll::-webkit-scrollbar { display: none; }`}</style>
    <div ref={scroll} className="puzzle-piece-scroll" data-testid="piece-tray-scroll" role="region" aria-label="Puzzle piece tray" tabIndex={0}
      onDragStart={event => event.preventDefault()}
      onPointerDown={event => {
        if (event.pointerType !== "mouse" || event.button !== 0 || drag.current) return;
        const node = event.currentTarget;
        if (node.scrollWidth <= node.clientWidth) return;
        const bounds = node.getBoundingClientRect(), scale = bounds.width / node.offsetWidth;
        if (event.clientY >= bounds.top + node.clientHeight * scale) return;
        node.focus({ preventScroll: true });
        node.setPointerCapture(event.pointerId);
        drag.current = { id: event.pointerId, x: event.clientX, left: node.scrollLeft, scale };
        setDragging(true); event.preventDefault();
      }}
      onPointerMove={event => {
        const start = drag.current;
        if (start && start.id === event.pointerId) event.currentTarget.scrollLeft = start.left - (event.clientX - start.x) / start.scale;
      }}
      onPointerUp={event => {
        if (drag.current?.id !== event.pointerId) return;
        event.currentTarget.releasePointerCapture(event.pointerId); finish();
      }}
      onPointerCancel={finish} onLostPointerCapture={finish}
      onKeyDown={event => {
        const node = event.currentTarget;
        const delta = event.key === "ArrowRight" ? 74 : event.key === "ArrowLeft" ? -74
          : event.key === "PageDown" ? node.clientWidth : event.key === "PageUp" ? -node.clientWidth : null;
        if (delta !== null) node.scrollLeft += delta;
        else if (event.key === "Home") node.scrollLeft = 0;
        else if (event.key === "End") node.scrollLeft = node.scrollWidth;
        else return;
        event.preventDefault();
      }}
      style={{ width: "100%", minWidth: 0, height: 76, overflowX: "auto", overflowY: "hidden", touchAction: "pan-x", userSelect: "none",
        cursor: dragging ? "grabbing" : "grab", scrollbarWidth: "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px", width: "max-content" }}>{children}</div>
    </div>
  </>;
}
