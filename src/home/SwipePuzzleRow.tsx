import { PropsWithChildren, useMemo, useRef, useState } from "react";
import { Alert, PanResponder, Pressable, Text, View } from "react-native";
import { theme } from "../theme";

type Props = PropsWithChildren<{ title: string; open: boolean; onOpenChange: (open: boolean) => void; onDelete: () => void }>;

// Native counterpart remains unverified until physical-device testing resumes.
export default function SwipePuzzleRow({ children, title, open, onOpenChange, onDelete }: Props) {
  const [drag, setDrag] = useState<number | null>(null);
  const start = useRef(0);
  const pan = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy) * 1.25,
    onPanResponderGrant: () => { start.current = open ? -80 : 0; },
    onPanResponderMove: (_, g) => setDrag(Math.max(-80, Math.min(0, start.current + g.dx))),
    onPanResponderRelease: (_, g) => { setDrag(null); onOpenChange(start.current + g.dx < -40); },
    onPanResponderTerminate: () => setDrag(null),
  }), [open, onOpenChange]);
  const offset = drag ?? (open ? -80 : 0);
  const confirm = () => Alert.alert("Delete this puzzle?", title + ". Your picture stays in My Collection. This is seed preview data only.", [
    { text: "Cancel", style: "cancel" }, { text: "Delete puzzle", style: "destructive", onPress: onDelete },
  ]);
  return <View {...pan.panHandlers} style={{ position: "relative", borderRadius: 12, overflow: "hidden" }}
    accessibilityActions={[{ name: "delete", label: "Delete " + title }]}
    onAccessibilityAction={event => { if (event.nativeEvent.actionName === "delete") confirm(); }}>
    {offset < 0 && <Pressable accessibilityRole="button" accessibilityLabel={"Delete " + title} onPress={confirm}
      style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 80, backgroundColor: theme.color.danger, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: theme.color.surface, fontWeight: "700" }}>Delete</Text>
    </Pressable>}
    <View pointerEvents={open && drag === null ? "none" : "auto"} style={{ transform: [{ translateX: offset }] }}>{children}</View>
  </View>;
}
