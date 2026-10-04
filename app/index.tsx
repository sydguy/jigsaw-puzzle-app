import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../src/theme';

/** Minimal foundation screen. Production Home is implemented after M1/M2 gates. */
export default function Index() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>PROJECT FOUNDATION</Text>
        <Text accessibilityRole="header" style={styles.title}>Jigsaw Fun Time</Text>
        <Text style={styles.body}>Expo · React Native · TypeScript</Text>
        <View style={styles.divider} />
        <Text style={styles.body}>A clean starting point for your puzzle app.</Text>
        <Text style={styles.caption}>Expo Router is running. Design tokens are connected. Gameplay and services have not been added.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.color.canvas, justifyContent: 'center', padding: theme.space[6] },
  card: { width: '100%', maxWidth: 560, alignSelf: 'center', padding: theme.space[8], borderRadius: theme.radius.card, borderWidth: 1, borderColor: theme.color.border, backgroundColor: theme.color.surface, gap: theme.space[4] },
  eyebrow: { color: theme.color.primary, fontSize: theme.type.caption.size, lineHeight: theme.type.caption.lineHeight, fontWeight: '700', letterSpacing: 1.4 },
  title: { color: theme.color.text, fontSize: theme.type.display.size, lineHeight: theme.type.display.lineHeight, fontWeight: theme.type.display.weight },
  body: { color: theme.color.text, fontSize: theme.type.body.size, lineHeight: theme.type.body.lineHeight },
  caption: { color: theme.color.textSecondary, fontSize: theme.type.label.size, lineHeight: theme.type.body.lineHeight },
  divider: { height: 1, backgroundColor: theme.color.border }
});
