import { PropsWithChildren } from "react";
import SwipeDeleteRow from "../components/SwipeDeleteRow";
type Props = PropsWithChildren<{ title: string; open: boolean; onOpenChange: (open: boolean) => void; onDelete: () => void }>;
export default function SwipePuzzleRow(props: Props) {
  return <SwipeDeleteRow {...props} testID="swipe-puzzle-row" objectLabel="puzzle" description="Your picture stays in My Collection." note="This removes a seed puzzle from this preview only." />;
}
