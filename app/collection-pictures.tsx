import { Platform } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Notice, Screen } from "../src/components/ui";
import MobileCollectionPictures from "../src/images/MobileCollectionPictures";
import { useDevice } from "../src/preview/context";

export default function CollectionPictures() {
  const { collection, returnTo } = useLocalSearchParams<{ collection?: string; returnTo?: string }>();
  const { tablet } = useDevice();
  const back = () => router.canGoBack() ? router.back() : router.replace("/sources?returnTo=create");
  if (!__DEV__ || Platform.OS !== "web" || tablet) return <Screen title="Collection pictures" back={back}>
    <Notice>{tablet ? "Collection picture selection is being reviewed on mobile first." : "The curated catalogue is being prepared."}</Notice>
  </Screen>;
  return <MobileCollectionPictures key={collection} collectionId={collection ?? "nature"} returnTo={returnTo} onBack={back} />;
}
