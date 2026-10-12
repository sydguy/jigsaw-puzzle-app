import { useMemo } from "react";
import { Image } from "react-native";
import { art } from "../assets";
import PuzzleImage from "../components/PuzzleImage";
import type { HomePuzzle } from "../home/review";
import { theme } from "../theme";

export function ProgressRing({ percent }: { percent: number }) {
  return <svg width="78" height="78" viewBox="0 0 100 100" aria-hidden="true">
    <defs><linearGradient id="progress-colour" x1="0" y1="0" x2="1" y2="1"><stop stopColor={theme.color.primary}/><stop offset="1" stopColor={theme.color.success}/></linearGradient></defs>
    <circle cx="50" cy="50" r="42" fill="none" stroke={theme.color.border} strokeWidth="10" />
    <circle cx="50" cy="50" r="42" fill="none" stroke="url(#progress-colour)" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${percent * 2.639} 264`} transform="rotate(-90 50 50)" />
    <text x="50" y="59" textAnchor="middle" fill={theme.color.text} fontSize="26" fontWeight="700" fontFamily="system-ui, sans-serif">{percent}%</text>
  </svg>;
}

/** Static seam illustration only; this does not generate playable cuts. */
export function BoardSeams({ rows, columns }: { rows: number; columns: number }) {
  const paths = useMemo(() => {
    const paths: string[] = [], w = 1000 / columns, h = 1000 / rows;
    for (let row = 1; row < rows; row++) for (let col = 0; col < columns; col++) {
      const x = col * w, y = row * h, tab = h * .18 * ((col + row) % 2 ? 1 : -1);
      paths.push(`M${x} ${y} h${w*.35} C${x+w*.48} ${y},${x+w*.3} ${y+tab},${x+w*.5} ${y+tab} S${x+w*.52} ${y},${x+w*.65} ${y} H${x+w}`);
    }
    for (let col = 1; col < columns; col++) for (let row = 0; row < rows; row++) {
      const x = col * w, y = row * h, tab = w * .18 * ((col + row) % 2 ? -1 : 1);
      paths.push(`M${x} ${y} v${h*.35} C${x} ${y+h*.48},${x+tab} ${y+h*.3},${x+tab} ${y+h*.5} S${x} ${y+h*.52},${x} ${y+h*.65} V${y+h}`);
    }
    return paths.join(" ");
  }, [rows, columns]);
  return <svg data-testid="puzzle-seams" data-rows={rows} data-columns={columns} viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
    <path d={paths} stroke="#17124f60" strokeWidth=".65" vectorEffect="non-scaling-stroke" fill="none" />
  </svg>;
}

export function TrayPiece({ puzzle, index }: { puzzle: HomePuzzle; index: number }) {
  const clip = "path('M 10 12 L 26 12 C 29 12 22 1 32 1 C 42 1 35 12 38 12 L 54 12 L 54 27 C 54 30 64 23 64 33 C 64 43 54 36 54 39 L 54 54 L 38 54 C 35 54 42 64 32 64 C 22 64 29 54 26 54 L 10 54 L 10 39 C 10 36 0 43 0 33 C 0 23 10 30 10 27 Z')";
  return <div aria-hidden="true" style={{ width: 64, height: 66, flexShrink: 0, filter: "drop-shadow(0 2px 2px #17124f22)" }}>
    <div style={{ width: 64, height: 64, clipPath: clip, position: "relative", background: theme.color.selected }}>
      <div style={{ position: "absolute", width: 192, left: -(index % 3) * 64, top: -(Math.floor(index / 3) % 3) * 64 }}><PuzzleImage {...puzzle} square /></div>
    </div>
  </div>;
}

export type ToolName = "Hint" | "Preview" | "Restart" | "Shuffle" | "Play" | "Rotate";
export function ToolIcon({ name, size = 28 }: { name: ToolName; size?: number }) {
  const source = name === "Restart" ? art.puzzleRestart : name === "Shuffle" ? art.puzzleShuffle : name === "Preview" ? art.puzzlePreview : null;
  if (source) return <Image accessible={false} source={source} resizeMode="contain" style={{ width: size, height: size }} />;
  return <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    {name === "Play" ? <path d="M10 5 27 16 10 27Z" fill="white" stroke="none" />
      : name === "Hint" ? <><path d="M11 22c0-4-4-5-4-10a9 9 0 0 1 18 0c0 5-4 6-4 10Z" fill="white"/><path d="M12 26h8m-6 4h4M2 12H0m30 0h2M4 3l2 2m22-2-2 2"/></>
      : <><path d="M26 10A12 12 0 1 0 27 22" strokeWidth="3.5"/><path d="M26 2v10H16" fill="none" strokeWidth="3.5"/></>}
  </svg>;
}
