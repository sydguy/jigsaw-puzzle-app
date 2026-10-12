// Consume the supplied export without copying or editing the reference tokens.
import { designTokens } from "../design/system/tokens";

export const theme = {
  ...designTokens,
  puzzle: {
    ...designTokens.puzzle,
    grids: Array.from({ length: 16 }, (_, index): readonly [number, number] => [index + 5, index + 5]),
    presets: [25, 64, 100, 225] as const,
  },
  gradient: {
    ...designTokens.gradient,
    preview: { ...designTokens.gradient.preview, colors: ["#F79B31", "#E8600B"] as const },
  },
  color: {
    ...designTokens.color,
    // Shared owner-approved treatment for deletable cards.
    cardDelete: "#F52235",
    // Owner-approved bright green treatment, scoped to free catalogue access.
    freeAccessText: "#318019",
    freeAccessBorder: "#75D743",
    freeAccessSurface: "#EFFFE7",
    freeAccessBadge: "#A2EB69",
    freeAccessBadgeText: "#236711",
  },
};
