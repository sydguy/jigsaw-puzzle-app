import React, { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Board from './Board';
import { probeStorage } from './storageProbe';

export default function App() {
  const [sample, setSample] = useState('No frame sample recorded');
  const [storage, setStorage] = useState('Storage probe not run');
  const [sampling, setSampling] = useState(false);
  function measure() {
    setSampling(true);
    setSample('Sampling 180 frames; move or zoom the board…');
    const deltas: number[] = [];
    let previous = 0;
    function frame(now: number) {
      if (previous) deltas.push(now - previous);
      previous = now;
      if (deltas.length < 180) requestAnimationFrame(frame);
      else {
        deltas.sort((a, b) => a - b);
        const p95 = deltas[Math.floor(deltas.length * .95)] ?? 0;
        setSample(`180-frame sample · p95 ${p95.toFixed(1)} ms · ${Platform.OS} · diagnostic only`);
        setSampling(false);
      }
    }
    requestAnimationFrame(frame);
  }
  return <GestureHandlerRootView style={{ flex: 1 }}>
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>M1 · LOCAL TECHNICAL PROOF</Text>
        <Text style={styles.title}>Jigsaw compatibility lab</Text>
        <Text style={styles.body}>Expo SDK 55 · React Native · Skia · 384 synthetic pieces</Text>
        <Text style={styles.notice}>This is a renderer experiment, not the app’s design or playable puzzle. Native performance, billing and ads are not verified.</Text>
        <Board />
        <Text style={styles.body}>Pan the canvas. Use zoom controls or pinch on a touch device. Resize the browser to review available space.</Text>
        <View style={styles.actions}>
          <Pressable accessibilityRole="button" disabled={sampling} style={styles.button} onPress={measure}><Text style={styles.buttonText}>{sampling ? 'Sampling…' : 'Sample frame timing'}</Text></Pressable>
          <Pressable accessibilityRole="button" style={styles.button} onPress={async () => { try { setStorage(await probeStorage()); } catch { setStorage('Storage probe failed; inspect local diagnostics.'); } }}><Text style={styles.buttonText}>Probe storage</Text></Pressable>
        </View>
        <Text accessibilityLiveRegion="polite" style={styles.result}>{sample}</Text>
        <Text accessibilityLiveRegion="polite" style={styles.result}>{storage}</Text>
      </View>
    </ScrollView>
  </GestureHandlerRootView>;
}
const styles = StyleSheet.create({
  page: { padding: 20, flexGrow: 1, backgroundColor: '#f3f0ff', alignItems: 'center' },
  card: { padding: 24, backgroundColor: 'white', borderRadius: 20, width: '100%', maxWidth: 920, gap: 16 },
  eyebrow: { color: '#6747bd', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  title: { color: '#251846', fontSize: 30, fontWeight: '700' },
  body: { color: '#514568', fontSize: 16, lineHeight: 24 },
  notice: { backgroundColor: '#fff6dc', padding: 14, borderRadius: 10, color: '#644b16', lineHeight: 22 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  button: { minHeight: 48, padding: 14, borderRadius: 10, backgroundColor: '#462bd9', justifyContent: 'center' },
  buttonText: { color: 'white', fontWeight: '600' },
  result: { color: '#33284b', lineHeight: 22 }
});
