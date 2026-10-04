import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Canvas, Group, Path, Skia } from '@shopify/react-native-skia';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';

const CELL = 24;
const WIDTH = 24 * CELL;
const HEIGHT = 16 * CELL;
// Synthetic deterministic paths exercise rendering, not approved engine/cut generation.
function makePaths() {
  return Array.from({ length: 384 }, (_, id) => {
    const row = Math.floor(id / 24), col = id % 24;
    const x = col * CELL, y = row * CELL;
    const path = Skia.Path.Make();
    path.moveTo(x, y);
    const edge = (sx: number, sy: number, dx: number, dy: number, bulge: number) => {
      path.lineTo(sx + dx * .35, sy + dy * .35);
      path.cubicTo(sx + dx * .15 - dy * bulge, sy + dy * .15 + dx * bulge,
        sx + dx * .85 - dy * bulge, sy + dy * .85 + dx * bulge,
        sx + dx * .65, sy + dy * .65);
      path.lineTo(sx + dx, sy + dy);
    };
    edge(x, y, CELL, 0, row === 0 ? 0 : -.28);
    edge(x + CELL, y, 0, CELL, col === 23 ? 0 : -.28);
    edge(x + CELL, y + CELL, -CELL, 0, row === 15 ? 0 : .28);
    edge(x, y + CELL, 0, -CELL, col === 0 ? 0 : .28);
    path.close();
    return { path, color: `hsl(${220 + row * 4 + col * 2}, 65%, ${64 + (id % 3) * 6}%)` };
  });
}
export default function Board() {
  const [width, setWidth] = useState(600);
  const paths = useMemo(makePaths, []);
  const zoom = useSharedValue(1), startZoom = useSharedValue(1);
  const x = useSharedValue(0), y = useSharedValue(0), sx = useSharedValue(0), sy = useSharedValue(0);
  const fit = Math.min(1.4, Math.max(.1, (width - 16) / WIDTH));
  const transform = useDerivedValue(() => [{ translateX: x.value + 8 }, { translateY: y.value + 8 }, { scale: fit * zoom.value }]);
  const pan = Gesture.Pan().onStart(() => { sx.value = x.value; sy.value = y.value; })
    .onUpdate(e => { x.value = sx.value + e.translationX; y.value = sy.value + e.translationY; });
  const pinch = Gesture.Pinch().onStart(() => { startZoom.value = zoom.value; })
    .onUpdate(e => { zoom.value = Math.max(.5, Math.min(4, startZoom.value * e.scale)); });
  return <View style={{ gap: 10 }}>
    <View onLayout={e => setWidth(e.nativeEvent.layout.width)} style={{ width: '100%', overflow: 'hidden', backgroundColor: '#ece8f5', borderRadius: 12 }}>
      <GestureDetector gesture={Gesture.Simultaneous(pan, pinch)}>
        <Canvas style={{ width: '100%', height: HEIGHT * fit + 16 }}>
          <Group transform={transform}>
            {paths.map(({ path, color }, id) => <Group key={id}><Path path={path} color={color} /><Path path={path} color="#35245d" style="stroke" strokeWidth={.7} /></Group>)}
          </Group>
        </Canvas>
      </GestureDetector>
    </View>
    <View style={{ flexDirection: 'row', gap: 12 }}>
      {[['Zoom in', () => { zoom.value = Math.min(4, zoom.value * 1.25); }], ['Zoom out', () => { zoom.value = Math.max(.5, zoom.value / 1.25); }], ['Fit', () => { zoom.value = 1; x.value = 0; y.value = 0; }]].map(([label, action]) =>
        <Pressable key={label as string} accessibilityRole="button" onPress={action as () => void} style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 12, backgroundColor: '#eee9ff', borderRadius: 8 }}><Text style={{ color: '#462bd9' }}>{label as string}</Text></Pressable>)}
    </View>
  </View>;
}
