import { Pressable, StyleSheet, View } from "react-native";
import { theme } from "../theme";

export default function BackButton({ onPress }: { onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={onPress} style={styles.target}>
    <View testID="back-button-circle" style={styles.circle}>
      <View testID="back-button-arrow" style={styles.arrow} />
    </View>
  </Pressable>;
}

const styles = StyleSheet.create({
  target: { width: 48, height: 48, alignItems: "flex-start", justifyContent: "center" },
  circle: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.color.selected, alignItems: "center", justifyContent: "center" },
  arrow: { width: 11, height: 11, borderLeftWidth: 3, borderBottomWidth: 3, borderColor: "#000000", transform: [{ rotate: "45deg" }], marginLeft: 4 },
});
