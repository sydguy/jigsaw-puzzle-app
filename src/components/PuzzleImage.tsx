import { Image, ImageSourcePropType, View } from "react-native";
import type { HomePuzzle } from "../home/review";

/** The same full 3:2 picture in Home and setup, including legacy review sprites. */
export default function PuzzleImage({ image, mobileImage, mobileCrop: crop, title }: {
  image: ImageSourcePropType; mobileImage?: HomePuzzle["mobileImage"];
  mobileCrop?: HomePuzzle["mobileCrop"]; title: string;
}) {
  return <View accessibilityRole="image" accessibilityLabel={title} style={{ width: "100%", aspectRatio: 1.5, overflow: "hidden" }}>
    {crop && mobileImage ? <Image accessible={false} source={mobileImage} resizeMode="stretch" style={{
      position: "absolute", width: `${crop.sourceWidth / crop.width * 100}%`, height: `${crop.sourceHeight / crop.height * 100}%`,
      left: `${-crop.x / crop.width * 100}%`, top: `${-crop.y / crop.height * 100}%`,
    }} /> : <Image accessible={false} source={image} resizeMode="contain" style={{ width: "100%", height: "100%" }} />}
  </View>;
}
