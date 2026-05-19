const { useState, useEffect, useRef, useMemo } = React;

// ----------------------------------------------------------------------------
// Sample data
// ----------------------------------------------------------------------------
const ME = {
  name: "Rangga Wisesa",
  handle: "@rangga.runs",
  avatar: "RW",
  city: "Jakarta",
  joined: "Apr 2023",
};

const RUNS = [
  { id: 7, title: "Morning Run", date: "May 17", dateDay: "17", dateMon: "MAY", distance: "10.2", pace: "5:32", duration: "54:12", heartRate: "142", elevation: "88", calories: "612", city: "Jakarta", routeSeed: 3.1, fresh: true },
  { id: 6, title: "Easy Recovery", date: "May 15", dateDay: "15", dateMon: "MAY", distance: "6.4", pace: "6:14", duration: "39:54", heartRate: "128", elevation: "32", calories: "388", city: "Jakarta", routeSeed: 4.4 },
  { id: 5, title: "Senayan Loops", date: "May 13", dateDay: "13", dateMon: "MAY", distance: "12.0", pace: "5:18", duration: "1:03:37", heartRate: "151", elevation: "104", calories: "742", city: "Jakarta", routeSeed: 2.0 },
  { id: 4, title: "Sunset Tempo", date: "May 11", dateDay: "11", dateMon: "MAY", distance: "8.1", pace: "4:48", duration: "38:54", heartRate: "163", elevation: "47", calories: "498", city: "Jakarta", routeSeed: 5.7 },
  { id: 3, title: "Long Slow Distance", date: "May 09", dateDay: "09", dateMon: "MAY", distance: "21.1", pace: "5:51", duration: "2:03:32", heartRate: "146", elevation: "212", calories: "1284", city: "Bandung", routeSeed: 1.3 },
  { id: 2, title: "Track Intervals", date: "May 07", dateDay: "07", dateMon: "MAY", distance: "7.5", pace: "4:32", duration: "34:00", heartRate: "171", elevation: "8", calories: "452", city: "Jakarta", routeSeed: 7.8 },
  { id: 1, title: "Lazy Sunday Jog", date: "May 05", dateDay: "05", dateMon: "MAY", distance: "5.0", pace: "6:42", duration: "33:30", heartRate: "121", elevation: "21", calories: "298", city: "Jakarta", routeSeed: 6.2 },
];

const ACCENT_SWATCHES = [
  "#FF5A1F", "#22D3A0", "#9B5CFF", "#FFC83D", "#3B82F6", "#F472B6", "#FFFFFF",
];

function isLight(hex) {
  const h = String(hex).replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, (c) => c + c) : h.padEnd(6, '0');
  const n = parseInt(x.slice(0, 6), 16);
  if (Number.isNaN(n)) return true;
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return r * 299 + g * 587 + b * 114 > 148000;
}

// ----------------------------------------------------------------------------
// Tiny SVG glyphs
// ----------------------------------------------------------------------------
const Icon = {
  Bolt: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} fill="currentColor" aria-hidden="true">
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
    </svg>
  ),
  Check: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 16} height={p.size || 16} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12.5 9.5 18 20 6.5" />
    </svg>
  ),
  ArrowLeft: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 4 7 12l8 8" />
    </svg>
  ),
  Download: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4v12m-5-5 5 5 5-5M5 20h14" />
    </svg>
  ),
  Copy: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 14} height={p.size || 14} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M4 16V6a2 2 0 0 1 2-2h10" />
    </svg>
  ),
  Pin: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 14} height={p.size || 14} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s7-7.2 7-12a7 7 0 1 0-14 0c0 4.8 7 12 7 12z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  ),
};

// ----------------------------------------------------------------------------
// Mini map placeholder
// ----------------------------------------------------------------------------
function MiniMap({ seed = 1, accent = "#FF5A1F" }) {
  return (
    <div className="minimap">
      <div className="minimap-grid"></div>
      <div className="minimap-route">
        <RouteLine seed={seed} stroke={accent} strokeWidth={2.2} />
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Screen 1 — Landing
// ----------------------------------------------------------------------------
function ScreenLanding({ onConnect }) {
  const [connecting, setConnecting] = useState(false);
  const handleClick = () => {
    setConnecting(true);
    setTimeout(() => onConnect(), 900);
  };
  return (
    <div className="screen screen-landing" data-screen-label="01 Landing">
      <div className="landing-bg">
        <div className="landing-bg-grain"></div>
      </div>

      <div className="landing-content">
        <div className="landing-logo">
          <div className="landing-mark">
            <svg viewBox="0 0 32 32" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 22c4-2 6-10 10-10s4 8 8 8 6-2 6-2" />
              <circle cx="4" cy="22" r="1.4" fill="currentColor" />
              <circle cx="28" cy="18" r="1.4" fill="currentColor" />
            </svg>
          </div>
          <div className="landing-wordmark">pacemark</div>
        </div>

        <div className="landing-hero">
          <h1 className="landing-title">Turn your runs into stories.</h1>
          <p className="landing-sub">Pull your activities, pick a template, post a sticker that actually looks like you ran on purpose.</p>
        </div>

        <div className="landing-cta-wrap">
          <button
            className={"landing-cta " + (connecting ? "is-connecting" : "")}
            onClick={handleClick}
            disabled={connecting}
          >
            <span className="landing-cta-icon"><Icon.Bolt size={20} /></span>
            <span className="landing-cta-label">
              {connecting ? "Connecting…" : "Connect with Strava"}
            </span>
            <span className="landing-cta-spinner"></span>
          </button>
          <div className="landing-disclaimer">
            We only read your activity data.<br />
            We never post on your behalf.
          </div>
        </div>

        <div className="landing-foot">
          <span>v0.4 · </span>
          <span className="landing-foot-dot">●</span>
          <span>privacy</span>
          <span className="landing-foot-dot">●</span>
          <span>terms</span>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Screen 2 — Activity Picker
// ----------------------------------------------------------------------------
function ScreenPicker({ onPick, onDisconnect, selectedId, setSelectedId }) {
  return (
    <div className="screen screen-picker" data-screen-label="02 Activity Picker">
      <header className="picker-header">
        <div className="picker-user">
          <div className="picker-avatar">{ME.avatar}</div>
          <div className="picker-user-meta">
            <div className="picker-user-name">{ME.name}</div>
            <div className="picker-user-sub">Connected · {ME.joined}</div>
          </div>
        </div>
        <button className="picker-disconnect" onClick={onDisconnect}>Disconnect</button>
      </header>

      <div className="picker-title-row">
        <div className="picker-title-wrap">
          <div className="picker-eyebrow">RECENT ACTIVITIES</div>
          <h2 className="picker-title">Pick a run</h2>
        </div>
        <div className="picker-count">{RUNS.length} runs · last 30 days</div>
      </div>

      <div className="picker-list">
        {RUNS.map(run => {
          const active = selectedId === run.id;
          return (
            <button
              key={run.id}
              className={"runcard " + (active ? "is-active" : "")}
              onClick={() => setSelectedId(run.id)}
            >
              <MiniMap seed={run.routeSeed} accent={active ? "#FF5A1F" : "#71717a"} />

              <div className="runcard-body">
                <div className="runcard-top">
                  <div className="runcard-title">
                    {run.title}
                    {run.fresh && <span className="runcard-fresh">NEW</span>}
                  </div>
                  <div className="runcard-date">{run.date}</div>
                </div>

                <div className="runcard-stats">
                  <div className="runcard-stat">
                    <div className="runcard-stat-v">{run.distance}<span>km</span></div>
                    <div className="runcard-stat-k">distance</div>
                  </div>
                  <div className="runcard-stat">
                    <div className="runcard-stat-v">{run.pace}<span>/km</span></div>
                    <div className="runcard-stat-k">pace</div>
                  </div>
                  <div className="runcard-stat">
                    <div className="runcard-stat-v">{run.duration}</div>
                    <div className="runcard-stat-k">duration</div>
                  </div>
                </div>

                <div className="runcard-foot">
                  <span className="runcard-pin"><Icon.Pin size={11} /> {run.city}</span>
                  <span className="runcard-hr">♥ {run.heartRate} bpm</span>
                  <span className="runcard-elev">↑ {run.elevation} m</span>
                </div>
              </div>

              <div className={"runcard-check " + (active ? "is-active" : "")}>
                {active && <Icon.Check size={14} />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="picker-cta-bar">
        <div className="picker-cta-meta">
          {selectedId
            ? <>Selected: <b>{RUNS.find(r => r.id === selectedId).title}</b> · {RUNS.find(r => r.id === selectedId).distance} km</>
            : <>Tap a run above to continue</>
          }
        </div>
        <button
          className="picker-cta"
          disabled={!selectedId}
          onClick={onPick}
        >
          Make Stickers →
        </button>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Screen 3 — Sticker gallery (overlay stickers, copy/save per tile)
// ----------------------------------------------------------------------------
function ScreenStudio({ onBack, run, tweaks, setTweak }) {
  const [visible, setVisible] = useState({
    distance: true, pace: true, duration: true,
    heartRate: false, elevation: true, calories: false, city: true,
  });
  const [accent, setAccent] = useState(tweaks.accent || ACCENT_SWATCHES[0]);
  const [bg, setBg] = useState(tweaks.bg || "dark");

  useEffect(() => { if (tweaks.accent) setAccent(tweaks.accent); }, [tweaks.accent]);
  useEffect(() => { if (tweaks.bg) setBg(tweaks.bg); }, [tweaks.bg]);

  const toggleMetric = (k) => setVisible(v => ({ ...v, [k]: !v[k] }));

  return (
    <div className="screen screen-studio" data-screen-label="03 Sticker Generator">
      {/* HEADER */}
      <header className="studio-head">
        <button className="studio-back" onClick={onBack}>
          <Icon.ArrowLeft size={16} /> Activities
        </button>
        <div className="studio-runref">
          <div className="studio-runref-date">{run.date.toUpperCase()}</div>
          <div className="studio-runref-title">{run.title}</div>
          <div className="studio-runref-stats">
            <span><b>{run.distance}</b> km</span>
            <span className="studio-runref-dot">·</span>
            <span><b>{run.pace}</b>/km</span>
            <span className="studio-runref-dot">·</span>
            <span><b>{run.duration}</b></span>
          </div>
        </div>
      </header>

      {/* TOOLBAR */}
      <div className="studio-toolbar">
        <div className="toolbar-sec">
          <div className="toolbar-eyebrow">METRICS TO SHOW</div>
          <div className="chip-row">
            {Object.keys(VISIBLE_LABELS).map(k => (
              <button
                key={k}
                className={"chip " + (visible[k] ? "is-on" : "")}
                onClick={() => toggleMetric(k)}
              >
                <span className="chip-dot"></span>
                {VISIBLE_LABELS[k]}
              </button>
            ))}
          </div>
        </div>

        <div className="toolbar-sec toolbar-sec-row">
          <div className="toolbar-sub">
            <div className="toolbar-eyebrow">ACCENT</div>
            <div className="swatch-row">
              {ACCENT_SWATCHES.map(c => (
                <button
                  key={c}
                  className={"swatch " + (accent === c ? "is-active" : "")}
                  style={{ background: c, color: isLight(c) ? "rgba(0,0,0,0.8)" : "#fff" }}
                  onClick={() => { setAccent(c); setTweak && setTweak({ accent: c }); }}
                  aria-label={c}
                >
                  {accent === c && <Icon.Check size={11} />}
                </button>
              ))}
            </div>
          </div>
          <div className="toolbar-sub">
            <div className="toolbar-eyebrow">PREVIEW ON</div>
            <div className="bg-row">
              {[
                { id: "dark", label: "Dark photo" },
                { id: "light", label: "Light photo" },
                { id: "checker", label: "Transparent" },
              ].map(opt => (
                <button
                  key={opt.id}
                  className={"bg-btn " + (bg === opt.id ? "is-active" : "")}
                  onClick={() => { setBg(opt.id); setTweak && setTweak({ bg: opt.id }); }}
                >
                  <span className={"bg-swatch bg-swatch-" + opt.id}></span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className="studio-grid">
        {STICKER_DEFS.map(def => (
          <StickerTile
            key={def.id}
            def={def}
            run={run}
            visible={visible}
            accent={accent}
            bg={bg}
          />
        ))}
      </div>

      <footer className="studio-foot">
        Drop the PNG into Instagram Story · or long-press to paste from clipboard
      </footer>
    </div>
  );
}

// Individual sticker tile -----------------------------------------------
function StickerTile({ def, run, visible, accent, bg }) {
  const [copied, setCopied] = useState(false);
  const [savingState, setSavingState] = useState("idle"); // idle | working | done

  const doCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  const doSave = () => {
    setSavingState("working");
    setTimeout(() => {
      setSavingState("done");
      setTimeout(() => setSavingState("idle"), 1500);
    }, 700);
  };

  const Comp = def.comp;
  return (
    <div className="tile">
      <div className="tile-head">
        <div className="tile-name">{def.name}</div>
        <div className="tile-desc">{def.desc}</div>
      </div>
      <div className={"tile-stage tile-stage-" + bg}>
        <div className="tile-stage-inner">
          <Comp run={run} visible={visible} accent={accent} />
        </div>
      </div>
      <div className="tile-actions">
        <button
          className={"tile-btn tile-btn-copy " + (copied ? "is-done" : "")}
          onClick={doCopy}
        >
          {copied
            ? <><Icon.Check size={14} /> Copied</>
            : <><Icon.Copy size={14} /> Copy</>}
        </button>
        <button
          className={"tile-btn tile-btn-save " + (savingState !== "idle" ? "is-active" : "")}
          onClick={doSave}
        >
          {savingState === "working"
            ? <><span className="tile-spinner"></span> Saving…</>
            : savingState === "done"
              ? <><Icon.Check size={14} /> Saved</>
              : <><Icon.Download size={14} /> PNG</>}
        </button>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Root
// ----------------------------------------------------------------------------
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "startScreen": "landing",
  "accent": "#FF5A1F",
  "bg": "dark"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [screen, setScreenRaw] = useState(t.startScreen || "landing");
  const [selectedId, setSelectedId] = useState(7);

  useEffect(() => {
    if (t.startScreen && t.startScreen !== screen) setScreenRaw(t.startScreen);
  }, [t.startScreen]);

  const setScreen = (s) => {
    setScreenRaw(s);
    setTweak({ startScreen: s });
  };

  const selectedRun = RUNS.find(r => r.id === selectedId) || RUNS[0];

  return (
    <div className="app">
      {screen === "landing" && <ScreenLanding onConnect={() => setScreen("picker")} />}
      {screen === "picker" && (
        <ScreenPicker
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          onPick={() => setScreen("studio")}
          onDisconnect={() => setScreen("landing")}
        />
      )}
      {screen === "studio" && (
        <ScreenStudio
          run={selectedRun}
          tweaks={t}
          setTweak={setTweak}
          onBack={() => setScreen("picker")}
        />
      )}

      <TweaksPanel title="Tweaks">
        <TweakSection label="Screen">
          <TweakSelect
            label="Active screen"
            value={t.startScreen}
            onChange={(v) => { setTweak({ startScreen: v }); setScreenRaw(v); }}
            options={[
              { value: "landing", label: "1 · Landing" },
              { value: "picker", label: "2 · Picker" },
              { value: "studio", label: "3 · Studio" },
            ]}
          />
        </TweakSection>
        <TweakSection label="Sticker studio">
          <TweakSelect
            label="Preview bg"
            value={t.bg}
            onChange={(v) => setTweak({ bg: v })}
            options={[
              { value: "dark", label: "Dark photo" },
              { value: "light", label: "Light photo" },
              { value: "checker", label: "Transparent" },
            ]}
          />
          <TweakColor
            label="Accent"
            value={t.accent}
            onChange={(v) => setTweak({ accent: v })}
            options={ACCENT_SWATCHES}
          />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
