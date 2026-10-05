import { PropsWithChildren, useState } from "react";
import { useWindowDimensions } from "react-native";
import { DeviceContext } from "./context";

const devices = [
  { name: "iPhone layout", width: 390, height: 844, tablet: false },
  { name: "Android phone layout", width: 412, height: 915, tablet: false },
  { name: "Tablet portrait", width: 768, height: 1024, tablet: true },
  { name: "Tablet landscape", width: 1024, height: 768, tablet: true },
] as const;

/** Browser-only review controls; no OS or entitlement emulation. */
export default function PreviewHost({ children }: PropsWithChildren) {
  const [index, setIndex] = useState(0);
  const [fit, setFit] = useState(true);
  const viewport = useWindowDimensions();
  const device = devices[index]!;
  const scale = fit
    ? Math.min(
        1,
        Math.max(240, viewport.width - 36) / device.width,
        Math.max(380, viewport.height - 145) / device.height,
      )
    : 1;
  return (
    <div
      style={{
        height: "100dvh",
        overflow: "auto",
        background: "#E9E8F2",
        fontFamily: "system-ui, sans-serif",
        color: "#17124F",
      }}
    >
      <style>{`:focus-visible { outline: 3px solid #2F23B9 !important; outline-offset: 3px; } body { margin: 0; } button, input, select { font: inherit; }`}</style>
      <header
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          padding: "12px 20px",
          background: "#fff",
          borderBottom: "1px solid #DAD7EE",
        }}
      >
        <div>
          <strong>Jigsaw Fun Time</strong>
          <div style={{ fontSize: 12, color: "#625B87", marginTop: 4 }}>
            Local browser preview · Native services unverified
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 12,
          }}
        >
          <label style={{ fontSize: 14 }}>
            Preview layout{" "}
            <select
              aria-label="Preview layout"
              value={index}
              onChange={(event) => setIndex(Number(event.target.value))}
              style={{
                marginLeft: 8,
                padding: 10,
                borderRadius: 8,
                border: "1px solid #8D84B2",
                background: "#fff",
                color: "#17124F",
              }}
            >
              {devices.map((item, i) => (
                <option key={item.name} value={i}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label style={{ fontSize: 14 }}>
            <input
              type="checkbox"
              checked={fit}
              onChange={(event) => setFit(event.target.checked)}
            />{" "}
            Fit to window
          </label>
        </div>
      </header>
      <main
        style={{
          padding: "20px 16px",
          minWidth: fit ? undefined : device.width + 32,
        }}
      >
        <div
          style={{
            width: device.width * scale,
            height: device.height * scale,
            margin: "0 auto",
            position: "relative",
          }}
        >
          <div
            data-testid="device-frame"
            style={{
              width: device.width,
              height: device.height,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              borderRadius: device.tablet ? 24 : 34,
              overflow: "hidden",
              background: "#F7F7FE",
              boxShadow: "0 12px 36px #17124f24",
              outline: "6px solid #292638",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <DeviceContext.Provider value={device}>
              {children}
            </DeviceContext.Provider>
          </div>
        </div>
        <p
          style={{
            fontSize: 12,
            textAlign: "center",
            color: "#625B87",
            margin: "14px 0 0",
          }}
        >
          {device.width} × {device.height} · {Math.round(scale * 100)}% · Layout
          preview, not an iOS/Android simulator
        </p>
      </main>
    </div>
  );
}
