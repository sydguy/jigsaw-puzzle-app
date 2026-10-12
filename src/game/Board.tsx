import { Text, View } from "react-native";
import type { GameBoardProps } from "./Board.types";
export default function GameBoard({ size }: GameBoardProps) {
  return <View style={{ width: size, height: size, justifyContent: "center" }}><Text>Gameplay is available in the browser development build. Native rendering and device gestures await native integration.</Text></View>;
}
