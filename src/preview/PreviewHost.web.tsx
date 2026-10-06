import { PropsWithChildren, useState } from "react";
import { useWindowDimensions } from "react-native";
import { DeviceContext } from "./context";
import { usePathname } from "expo-router";
import { HomePuzzle, HomeReviewContext, HomeState } from "../home/review";
import { CreateReviewContext, CreateReviewState } from "../create/review";

// Keep visual fixtures and their artwork out of production bundles.
const homeSeeds: readonly HomePuzzle[] = __DEV__ ? require("./homeSeeds.web").homeSeeds : [];
const mobileHomeSeeds: readonly HomePuzzle[] = __DEV__ ? require("./homeSeeds.web").mobileHomeSeeds : [];
const createReviewImage = __DEV__ ? require("../../graphics/create-review/mountain-lake.png") : null;

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
  const [homeState, setHomeState] = useState<HomeState>("empty");
  const [homeMessage, setHomeMessage] = useState("");
  const [createState, setCreateState] = useState<CreateReviewState>("before");
  const pathname = usePathname();
  const onHome = pathname === "/";
  const viewport = useWindowDimensions();
  const device = devices[index]!;
  const onCreate = pathname === "/create" && !device.tablet;
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
          {__DEV__ && onHome && <label style={{ fontSize: 14 }}>
            Home review{" "}
            <select aria-label="Home review state" value={homeState}
              onChange={event => { setHomeState(event.target.value as HomeState); setHomeMessage(""); }}
              style={{ padding: 10, borderRadius: 8, border: "1px solid #8D84B2", color: "#17124F", background: "#fff" }}>
              <option value="empty">Empty · zero themes</option>
              <option value="populated">Populated · seed data</option>
            </select>
          </label>}
          {__DEV__ && onCreate && <label style={{ fontSize: 14 }}>
            Create Puzzle review{" "}
            <select aria-label="Create Puzzle review state" value={createState}
              onChange={event => setCreateState(event.target.value as CreateReviewState)}
              style={{ padding: 10, borderRadius: 8, border: "1px solid #8D84B2", color: "#17124F", background: "#fff" }}>
              <option value="before">Before adding image</option>
              <option value="after">After adding image</option>
            </select>
          </label>}
        </div>
      </header>
      {__DEV__ && onCreate && <aside style={{ padding: "8px 20px", fontSize: 12, color: "#625B87", background: "#EFEEFD" }}>
        Visual review only · After adding image uses your selected picture or sample artwork · Switching states does not save or delete pictures · Gameplay is not connected yet
      </aside>}
      {__DEV__ && onHome && <aside style={{ padding: "8px 20px", fontSize: 12, color: "#625B87", background: "#EFEEFD" }}>
        Home visual review · {homeState === "populated" ? "Sample puzzles and balances only" : "Empty new-user state"} · No real puzzle or purchase data
        {homeMessage && <div role="status" style={{ marginTop: 8, color: "#17124F", fontSize: 14 }}>{homeMessage}</div>}
      </aside>}
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
              <HomeReviewContext.Provider value={{ state: __DEV__ ? homeState : "empty", puzzles: __DEV__ && homeState === "populated" ? (device.tablet ? homeSeeds.slice(0, 5) : mobileHomeSeeds) : [], notify: setHomeMessage }}>
                <CreateReviewContext.Provider value={__DEV__ ? { state: createState, setState: setCreateState, image: createReviewImage } : null}>
                  {children}
                </CreateReviewContext.Provider>
              </HomeReviewContext.Provider>
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
