import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../src/theme';

export default function NotFound() {
  return <View style={styles.screen}>
    <Stack.Screen options={{ title: 'Page not found' }} />
    <Text accessibilityRole="header" style={styles.title}>Page not found</Text>
    <Link href="/" style={styles.link}>Return to the start</Link>
  </View>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center', gap: 16, backgroundColor: theme.color.canvas },
  title: { color: theme.color.text, fontSize: 24, fontWeight: '700' },
  link: { color: theme.color.primary, padding: 14, minHeight: 48 }
});
