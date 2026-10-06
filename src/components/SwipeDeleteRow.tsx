import { useMemo, useRef, useState } from "react";
import { Alert, PanResponder, Pressable, Text, View } from "react-native";
import { theme } from "../theme";
import DeleteIcon from "./DeleteIcon";
import { SwipeDeleteProps } from "./swipeDeleteTypes";


// Native counterpart remains unverified until physical-device testing resumes.
export default function SwipeDeleteRow({ children, title, open, onOpenChange, onDelete, objectLabel, description, note, testID = "swipe-delete-row" }: SwipeDeleteProps) {
  const busy = useRef(false);
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
  const confirm = () => { if (busy.current) return; Alert.alert(`Delete this ${objectLabel}?`, `${title}. ${description}${note ? " " + note : ""}`, [
    { text: "Cancel", style: "cancel" }, { text: `Delete ${objectLabel}`, style: "destructive", onPress: async () => { if (busy.current) return; busy.current = true; try { await onDelete(); } catch (e) { Alert.alert("Could not delete", e instanceof Error ? e.message : "Please retry."); } finally { busy.current = false; } } },
  ]); };
  return <View testID={testID} {...pan.panHandlers} style={{ position: "relative", borderRadius: 12, overflow: "hidden", width: "100%", minWidth: 0 }}
    accessibilityActions={[{ name: "delete", label: "Delete " + title }]}
    onAccessibilityAction={event => { if (event.nativeEvent.actionName === "delete") confirm(); }}>
    {offset < 0 && <Pressable accessibilityRole="button" accessibilityLabel={"Delete " + title} onPress={confirm}
      style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 80, backgroundColor: theme.color.cardDelete, alignItems: "center", justifyContent: "center", gap: 6 }}>
      <DeleteIcon />
      <Text style={{ color: theme.color.surface, fontWeight: "700" }}>Delete</Text>
    </Pressable>}
    <View pointerEvents={open && drag === null ? "none" : "auto"} style={{ transform: [{ translateX: offset }] }}>{children}</View>
  </View>;
}
