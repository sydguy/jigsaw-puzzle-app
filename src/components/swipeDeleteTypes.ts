import { PropsWithChildren } from "react";
export type SwipeDeleteProps = PropsWithChildren<{
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void | Promise<void>;
  objectLabel: "picture" | "puzzle";
  description: string;
  note?: string;
  testID?: string;
}>;
