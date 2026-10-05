import { useLocal } from "../local/store";
import { Action, Notice } from "./ui";
import { View } from "react-native";
export function StorageStatus() {
  const local = useLocal();
  if (local.loading) return <Notice>Loading your local collection…</Notice>;
  if (local.error)
    return (
      <View style={{ gap: 8 }}>
        <Notice error>{local.error}</Notice>
        <Action
          label="Retry loading"
          onPress={() => {
            void local.reload();
          }}
          secondary
        />
      </View>
    );
  return null;
}
