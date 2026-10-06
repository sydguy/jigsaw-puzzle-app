import { View } from "react-native";

/** Shared trash-can silhouette for every swipe-delete card action. */
export default function DeleteIcon({ color = "#fff" }: { color?: string }) {
  return <View testID="card-delete-icon" accessible={false} style={{ width: 24, height: 26, alignItems: "center" }}>
    <View style={{ width: 9, height: 4, borderWidth: 2, borderBottomWidth: 0, borderColor: color, borderTopLeftRadius: 2, borderTopRightRadius: 2 }} />
    <View style={{ width: 22, height: 2, borderRadius: 1, backgroundColor: color }} />
    <View style={{ width: 17, height: 18, borderWidth: 2, borderTopWidth: 0, borderColor: color, borderBottomLeftRadius: 3, borderBottomRightRadius: 3, flexDirection: "row", justifyContent: "center", gap: 4, paddingTop: 3 }}>
      <View style={{ width: 2, height: 10, backgroundColor: color }} /><View style={{ width: 2, height: 10, backgroundColor: color }} />
    </View>
  </View>;
}
