// Consume the supplied export without copying or editing the reference tokens.
import { designTokens } from "../design/system/tokens";

export const theme = {
  ...designTokens,
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
