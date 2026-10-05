import { createContext, useContext } from "react";

export const DeviceContext = createContext({
  tablet: false,
  width: 390,
  height: 844,
});
export const useDevice = () => useContext(DeviceContext);
