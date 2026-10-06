import type { CSSProperties } from "react";
import { theme } from "../theme";

/** Matching gallery/camera actions on the mobile source panels. */
export const sourceAction: CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "center", gap: 12, width: "100%", minHeight: 56,
  border: 0, borderRadius: 12, padding: "12px 16px", color: "white", fontSize: 18, fontWeight: 700,
  background: `linear-gradient(110deg, ${theme.color.gradientStart}, ${theme.color.gradientEnd})`,
  whiteSpace: "nowrap",
};
