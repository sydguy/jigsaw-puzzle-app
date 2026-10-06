import { useRef, useState } from "react";
import { Pressable, ScrollView, ScrollViewProps, View } from "react-native";
import { theme } from "../theme";

/** Same indicator geometry on native; physical-device validation is deferred. */
export default function AppScrollView({ children, onScroll, onLayout, onContentSizeChange, scrollbarTopInset = 16, scrollbarBottomInset = 8, showScrollbar = true, ...props }: ScrollViewProps & { scrollbarTopInset?: number; scrollbarBottomInset?: number; showScrollbar?: boolean }) {
  const scroll = useRef<ScrollView>(null);
  const [height, setHeight] = useState(0);
  const [content, setContent] = useState(0);
  const [offset, setOffset] = useState(0);
  const max = Math.max(0, content - height);
  const rail = Math.max(0, height - scrollbarTopInset - scrollbarBottomInset);
  const thumb = Math.min(rail, Math.max(40, Math.min(80, rail * height / Math.max(1, content))));
  const top = max ? Math.max(0, Math.min(rail - thumb, offset / max * (rail - thumb))) : 0;
  return <View style={{ flex: 1, minHeight: 0 }}>
    <ScrollView {...props} ref={scroll} showsVerticalScrollIndicator={false} scrollEventThrottle={16}
      onLayout={event => { setHeight(event.nativeEvent.layout.height); onLayout?.(event); }}
      onContentSizeChange={(width, size) => { setContent(size); onContentSizeChange?.(width, size); }}
      onScroll={event => { setOffset(event.nativeEvent.contentOffset.y); onScroll?.(event); }}>{children}</ScrollView>
    {showScrollbar && max > 1 && <Pressable accessibilityRole="adjustable" accessibilityLabel="Page scrollbar"
      accessibilityValue={{ min: 0, max: Math.round(max), now: Math.min(Math.round(max), Math.max(0, Math.round(offset))) }}
      accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
      onAccessibilityAction={event => scroll.current?.scrollTo({ y: Math.max(0, Math.min(max, offset + (event.nativeEvent.actionName === "increment" ? 80 : -80))), animated: false })}
      onPress={event => scroll.current?.scrollTo({ y: Math.max(0, Math.min(1, (event.nativeEvent.locationY - thumb / 2) / Math.max(1, rail - thumb))) * max, animated: false })}
      style={{ position: "absolute", top: scrollbarTopInset, bottom: scrollbarBottomInset, right: 1, width: 14 }}>
      <View pointerEvents="none" style={{ position: "absolute", top: 0, bottom: 0, left: 4, width: 6, borderRadius: 3, backgroundColor: theme.color.selected }} />
      <View pointerEvents="none" style={{ position: "absolute", top, left: 4, width: 6, height: thumb, borderRadius: 3, backgroundColor: theme.color.primary }} />
    </Pressable>}
  </View>;
}
