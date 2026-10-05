import { useCallback, useId, useLayoutEffect, useRef, useState } from "react";
import { ScrollViewProps, View } from "react-native";
import { theme } from "../theme";

/** Shared browser scrolling surface: round violet thumb, pale full-height rail. */
export default function AppScrollView({ children, contentContainerStyle, scrollbarTopInset = 16, scrollbarBottomInset = 8 }: ScrollViewProps & { scrollbarTopInset?: number; scrollbarBottomInset?: number }) {
  const id = useId();
  const scroll = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; grab: number } | null>(null);
  const [metrics, setMetrics] = useState({ height: 0, content: 0, top: 0 });
  const sync = useCallback(() => {
    const node = scroll.current;
    if (node) setMetrics({ height: node.clientHeight, content: node.scrollHeight, top: node.scrollTop });
  }, []);
  useLayoutEffect(() => {
    const node = scroll.current;
    if (!node) return;
    const observer = new ResizeObserver(sync);
    observer.observe(node);
    if (node.firstElementChild) observer.observe(node.firstElementChild);
    sync();
    return () => observer.disconnect();
  }, [sync]);
  const max = Math.max(0, metrics.content - metrics.height);
  const rail = Math.max(0, metrics.height - scrollbarTopInset - scrollbarBottomInset);
  const thumb = Math.min(rail, Math.max(40, Math.min(80, rail * metrics.height / Math.max(1, metrics.content))));
  const travel = rail - thumb;
  const top = max ? Math.min(travel, Math.max(0, metrics.top / max * travel)) : 0;
  const seek = (position: number) => {
    if (scroll.current && travel > 0) scroll.current.scrollTop = Math.max(0, Math.min(travel, position)) / travel * max;
  };
  return <div style={{ flex: 1, minHeight: 0, position: "relative", display: "flex" }}>
    <div id={id} ref={scroll} data-testid="page-scroll" tabIndex={0} role="region" aria-label="Page content"
      onScroll={sync} style={{ flex: 1, minWidth: 0, overflowY: "auto", overflowX: "hidden", scrollbarWidth: "none", overscrollBehavior: "contain" }}>
      <View style={contentContainerStyle}>{children}</View>
    </div>
    {max > 1 && <div role="scrollbar" aria-label="Page scrollbar" aria-controls={id} aria-orientation="vertical"
      aria-valuemin={0} aria-valuemax={Math.round(max)} aria-valuenow={Math.min(Math.round(max), Math.round(metrics.top))} tabIndex={0}
      onKeyDown={event => {
        const node = scroll.current;
        if (!node) return;
        const next = event.key === "Home" ? 0 : event.key === "End" ? max
          : event.key === "ArrowDown" ? node.scrollTop + 40 : event.key === "ArrowUp" ? node.scrollTop - 40
          : event.key === "PageDown" ? node.scrollTop + metrics.height * 0.9 : event.key === "PageUp" ? node.scrollTop - metrics.height * 0.9 : null;
        if (next !== null) { event.preventDefault(); node.scrollTop = next; }
      }}
      onPointerDown={event => {
        if (!event.isPrimary || event.button !== 0) return;
        event.preventDefault(); event.currentTarget.focus();
        const box = event.currentTarget.getBoundingClientRect();
        const position = (event.clientY - box.top) / (box.height / rail);
        drag.current = { id: event.pointerId, grab: position >= top && position <= top + thumb ? position - top : thumb / 2 };
        event.currentTarget.setPointerCapture(event.pointerId);
        seek(position - drag.current.grab);
      }}
      onPointerMove={event => {
        if (drag.current?.id !== event.pointerId) return;
        const box = event.currentTarget.getBoundingClientRect();
        seek((event.clientY - box.top) / (box.height / rail) - drag.current.grab);
      }}
      onPointerUp={event => { drag.current = null; if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}
      onPointerCancel={() => { drag.current = null; }}
      style={{ position: "absolute", top: scrollbarTopInset, bottom: scrollbarBottomInset, right: 1, width: 14, touchAction: "none", cursor: "pointer" }}>
      <div data-testid="scrollbar-rail" style={{ position: "absolute", top: 0, bottom: 0, left: 4, width: 6, borderRadius: 3, background: theme.color.selected, pointerEvents: "none" }} />
      <div data-testid="scrollbar-thumb" style={{ position: "absolute", top, left: 4, width: 6, height: thumb, borderRadius: 3, background: theme.color.primary, pointerEvents: "none" }} />
    </div>}
  </div>;
}
