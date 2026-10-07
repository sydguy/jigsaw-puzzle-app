import { PropsWithChildren, useState } from "react";
import { useWindowDimensions } from "react-native";
import { DeviceContext } from "./context";
import { usePathname } from "expo-router";
import { HomePuzzle, HomeReviewContext, HomeState } from "../home/review";
import { CreateReviewContext, CreateReviewState, ReviewPicture } from "../create/review";
import { SourceReviewContext } from "../images/sourceReview";
import { CollectionReviewContext } from "../collection/review";
import { SettingsReviewContext } from "../settings/review";

// Keep visual fixtures and their artwork out of production bundles.
const homeSeeds: readonly HomePuzzle[] = __DEV__ ? require("./homeSeeds.web").homeSeeds : [];
const mobileHomeSeeds: readonly HomePuzzle[] = __DEV__ ? require("./homeSeeds.web").mobileHomeSeeds : [];
const createReviewImage = __DEV__ ? require("../../graphics/create-review/mountain-lake.png") : null;
const collectionItems = __DEV__ ? require("./myCollectionSeeds.web").myCollectionSeeds : [];

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
  const [homePuzzle, setHomePuzzle] = useState<HomePuzzle | null>(null);
  const [createdPuzzles, setCreatedPuzzles] = useState<HomePuzzle[]>([]);
  const [createMessage, setCreateMessage] = useState("");
  const [sourceMessage, setSourceMessage] = useState("");
  const [selectedPicture, setSelectedPicture] = useState<ReviewPicture | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [profile, setProfile] = useState({ fullName: "Sarah Johnson", email: "sarah@example.com" });
  const [privacy, setPrivacy] = useState({ analytics: false, marketing: false });
  const [settingsMessage, setSettingsMessage] = useState("");
  const pathname = usePathname();
  const onHome = pathname === "/";
  const onSources = pathname === "/sources" || pathname === "/collection-pictures";
  const viewport = useWindowDimensions();
  const device = devices[index]!;
  const onCreate = pathname === "/create" && !device.tablet;
  const onCollection = pathname === "/collection" && !device.tablet;
  const onSettings = pathname === "/settings" && !device.tablet;
  // Compare phone typography at the same zoom while retaining each layout's dimensions.
  const fitWidth = device.tablet ? device.width : Math.max(...devices.filter(item => !item.tablet).map(item => item.width));
  const fitHeight = device.tablet ? device.height : Math.max(...devices.filter(item => !item.tablet).map(item => item.height));
  const scale = fit
    ? Math.min(
        1,
        Math.max(240, viewport.width - 36) / fitWidth,
        Math.max(380, viewport.height - 145) / fitHeight,
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
          {__DEV__ && onCreate && !homePuzzle && <label style={{ fontSize: 14 }}>
            Create Puzzle review{" "}
            <select aria-label="Create Puzzle review state" value={createState}
              onChange={event => setCreateState(event.target.value as CreateReviewState)}
              style={{ padding: 10, borderRadius: 8, border: "1px solid #8D84B2", color: "#17124F", background: "#fff" }}>
              <option value="before">Before adding image</option>
              <option value="after">After adding image</option>
            </select>
          </label>}
          {__DEV__ && onSettings && <label style={{ fontSize: 14 }}>Account review{" "}
            <select aria-label="Settings account review" value={signedIn ? "signed-in" : "guest"} onChange={event => { setSignedIn(event.target.value === "signed-in"); setSettingsMessage(""); }} style={{ padding: 10, borderRadius: 8, border: "1px solid #8D84B2", background: "#fff", color: "#17124F" }}>
              <option value="guest">Not signed in</option><option value="signed-in">Signed in · sample profile</option>
            </select>
          </label>}
        </div>
      </header>
      {__DEV__ && onCollection && <aside style={{ padding: "8px 20px", fontSize: 12, color: "#625B87", background: "#EFEEFD" }}>
        Collection visual review · Your photos and sample theme pictures share one list · Theme artwork and usage statistics are review fixtures
      </aside>}
      {__DEV__ && onSettings && <aside style={{ padding: "8px 20px", fontSize: 12, color: "#625B87", background: "#EFEEFD" }}>
        Settings appearance review only · Account, optional tracking and policy services are not connected · Preview changes stay in memory and do not change your saved pictures
        {settingsMessage && <div role="status">{settingsMessage}</div>}
      </aside>}
      {__DEV__ && onSources && <aside style={{ padding: "8px 20px", fontSize: 12, color: "#625B87", background: "#EFEEFD" }}>
        Local image-source preview · Curated artwork, owned labels and balances are sample data only · Add Picture previews the selection without saving or spending · Purchases unavailable
        {sourceMessage && <div role="status" style={{ marginTop: 4, color: "#17124F" }}>{sourceMessage}</div>}
      </aside>}
      {__DEV__ && (onCreate || (pathname === "/create" && homePuzzle)) && <aside style={{ padding: "8px 20px", fontSize: 12, color: "#625B87", background: "#EFEEFD" }}>
        {homePuzzle ? "Home puzzle review · New puzzle entries stay in preview memory · Play Again / Continue require the gameplay engine"
          : "Visual review only · After adding image uses your selected picture or sample artwork · Switching states does not save or delete pictures · Gameplay is not connected yet"}
        {createMessage && <div role="status">{createMessage}</div>}
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
              <HomeReviewContext.Provider value={{ state: __DEV__ ? homeState : "empty", puzzles: __DEV__ && homeState === "populated" ? [...createdPuzzles, ...(device.tablet ? homeSeeds.slice(0, 5) : mobileHomeSeeds)] : [], notify: setHomeMessage,
                addPuzzle: __DEV__ ? puzzle => { setCreatedPuzzles(current => current.some(item => item.id === puzzle.id) ? current : [puzzle, ...current]); setHomeState("populated"); setHomeMessage("New puzzle added to this browser review. The original puzzle is unchanged. Preview entries reset on reload."); } : undefined }}>
                <CreateReviewContext.Provider value={__DEV__ ? { state: createState, setState: setCreateState, image: createReviewImage, selectedPicture, setSelectedPicture, homePuzzle, setHomePuzzle, notify: setCreateMessage } : null}>
                  <CollectionReviewContext.Provider value={__DEV__ ? { items: collectionItems } : null}>
                    <SettingsReviewContext.Provider value={__DEV__ ? { signedIn, setSignedIn, profile, setProfile, privacy, setPrivacy, notify: setSettingsMessage } : null}>
                      <SourceReviewContext.Provider value={setSourceMessage}>{children}</SourceReviewContext.Provider>
                    </SettingsReviewContext.Provider>
                  </CollectionReviewContext.Provider>
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
