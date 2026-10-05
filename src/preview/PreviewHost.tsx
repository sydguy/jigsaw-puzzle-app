import { PropsWithChildren } from "react";
import { useWindowDimensions } from "react-native";
import { DeviceContext } from "./context";

export default function PreviewHost({ children }: PropsWithChildren) {
  const { width, height } = useWindowDimensions();
  return (
    <DeviceContext.Provider
      value={{ width, height, tablet: Math.min(width, height) >= 600 }}
    >
      {children}
    </DeviceContext.Provider>
  );
}
