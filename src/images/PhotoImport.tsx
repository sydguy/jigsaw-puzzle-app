import { Notice } from "../components/ui";
export default function PhotoImport({
  onAdded,
  mode = "photo",
}: {
  onAdded: (id: string) => void;
  mode?: "photo" | "camera";
  mobile?: boolean;
}) {
  return (
    <Notice>
      Native {mode === "camera" ? "camera capture" : "photo import"} is not connected yet. Use the local browser preview to
      review this flow.
    </Notice>
  );
}
