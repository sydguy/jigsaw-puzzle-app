import { Notice } from "../components/ui";
export default function PhotoImport({
  onAdded,
}: {
  onAdded: (id: string) => void;
}) {
  return (
    <Notice>
      Native photo import is not connected yet. Use the local browser preview to
      review this flow.
    </Notice>
  );
}
