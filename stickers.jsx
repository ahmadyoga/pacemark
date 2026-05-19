// ============================================================
// Overlay-style stickers — compact, transparent backgrounds.
// Each is sized to its own content (no full 9:16 canvas).
// drop-shadow on the wrapper so they read on any photo.
// ============================================================

const VISIBLE_LABELS = {
  distance: "Distance",
  pace: "Pace",
  duration: "Duration",
  heartRate: "Heart Rate",
  elevation: "Elevation",
  calories: "Calories",
  city: "City",
};

// Helpers ---------------------------------------------------------------
function isLight(hex) {
  const h = String(hex).replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, (c) => c + c) : h.padEnd(6, '0');
  const n = parseInt(x.slice(0, 6), 16);
  if (Number.isNaN(n)) return true;
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return r * 299 + g * 587 + b * 114 > 148000;
}
function statList(run, visible) {
  const arr = [];
  if (visible.distance) arr.push(["DIST", run.distance + " km"]);
  if (visible.pace) arr.push(["PACE", run.pace + "/km"]);
  if (visible.duration) arr.push(["TIME", run.duration]);
  if (visible.heartRate) arr.push(["HR", run.heartRate + " bpm"]);
  if (visible.elevation) arr.push(["ELEV", "+" + run.elevation + " m"]);
  if (visible.calories) arr.push(["KCAL", run.calories]);
  return arr;
}

function RouteLine({ seed = 1, stroke = "currentColor", strokeWidth = 2, opacity = 1, height = 36 }) {
  const points = [];
  const N = 22;
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const wob = Math.sin(t * 6 + seed) * 12 + Math.cos(t * 9 + seed * 1.3) * 5;
    const x = 6 + t * 88;
    const y = 50 + wob;
    points.push(x.toFixed(2) + "," + y.toFixed(2));
  }
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: "100%", height, display: "block", opacity }}>
      <polyline points={points.join(" ")} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={points[0].split(",")[0]} cy={points[0].split(",")[1]} r="2.5" fill={stroke}/>
      <circle cx={points[points.length - 1].split(",")[0]} cy={points[points.length - 1].split(",")[1]} r="2.5" fill={stroke}/>
    </svg>
  );
}

// ============================================================
// 1) BIG NUMBER — hero distance, mono labels
// ============================================================
function StickerBigNumber({ run, visible, accent }) {
  const stats = statList(run, visible).filter(s => s[0] !== "DIST");
  return (
    <div className="ovl ovl-bignum" style={{ "--accent": accent, "--accent-fg": isLight(accent) ? "#000" : "#fff" }}>
      <div className="ovl-bignum-lbl">DISTANCE</div>
      <div className="ovl-bignum-val">{run.distance}</div>
      <div className="ovl-bignum-unit">KILOMETERS</div>
      {stats.length > 0 && (
        <div className="ovl-bignum-foot">
          {stats.slice(0, 3).map((s, i) => (
            <span key={s[0]}>
              {i > 0 && <span className="ovl-bignum-sep">·</span>}
              <span className="ovl-bignum-foot-v">{s[1]}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// 2) BOLD CAPS — three-column oversized row
// ============================================================
function StickerBoldCaps({ run, visible, accent }) {
  // Compact 3-stat row: TIME / DIST / PACE (or whatever is on)
  const order = [];
  if (visible.duration) order.push(["TIME", run.duration.replace(":", "."), "MIN"]);
  if (visible.distance) order.push(["KM", run.distance, "KM"]);
  if (visible.pace) order.push(["PACE", run.pace, "/KM"]);
  if (order.length === 0) order.push(["KM", run.distance, "KM"]);

  return (
    <div className="ovl ovl-boldcaps" style={{ "--accent": accent, "--accent-fg": isLight(accent) ? "#000" : "#fff" }}>
      {order.slice(0, 3).map((col, i) => (
        <div className="ovl-bc-col" key={col[0] + i}>
          <div className="ovl-bc-v">{col[1]}</div>
          <div className="ovl-bc-u">{col[2]}</div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// 3) MONO BLOCK — minimal stacked stats card, thin lines
// ============================================================
function StickerMonoBlock({ run, visible, accent }) {
  const stats = statList(run, visible);
  return (
    <div className="ovl ovl-mono" style={{ "--accent": accent, "--accent-fg": isLight(accent) ? "#000" : "#fff" }}>
      <div className="ovl-mono-head">
        <span className="ovl-mono-dot" />
        <span>{run.date} · {visible.city ? run.city.toUpperCase() : "RUN"}</span>
      </div>
      <div className="ovl-mono-rows">
        {stats.slice(0, 5).map(([k, v]) => (
          <div className="ovl-mono-row" key={k}>
            <span className="ovl-mono-k">{k}</span>
            <span className="ovl-mono-dots"></span>
            <span className="ovl-mono-v">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 4) SERIF CAPTION — italic serif line + small data
// ============================================================
function StickerSerif({ run, visible, accent }) {
  return (
    <div className="ovl ovl-serif" style={{ "--accent": accent, "--accent-fg": isLight(accent) ? "#000" : "#fff" }}>
      <div className="ovl-serif-cap">a quiet<br/>morning run.</div>
      <div className="ovl-serif-stats">
        {visible.distance && <span><b>{run.distance}</b> km</span>}
        {visible.pace && <span><b>{run.pace}</b>/km</span>}
        {visible.duration && <span><b>{run.duration}</b></span>}
      </div>
      <div className="ovl-serif-rule"></div>
      {visible.city && <div className="ovl-serif-foot">— {run.city}, ID</div>}
    </div>
  );
}

// ============================================================
// 5) CAPSULE — pill-shaped location tag, accent-filled
// ============================================================
function StickerCapsule({ run, visible, accent }) {
  return (
    <div className="ovl ovl-capsule" style={{ "--accent": accent, "--accent-fg": isLight(accent) ? "#000" : "#fff" }}>
      <div className="ovl-cap-pill">
        <span className="ovl-cap-pin">●</span>
        <span className="ovl-cap-txt">{visible.city ? run.city.toUpperCase() : "RUN"}</span>
        <span className="ovl-cap-div"></span>
        <span className="ovl-cap-num">{run.distance}<span>KM</span></span>
      </div>
      <div className="ovl-cap-sub">{run.date} · {run.title}</div>
    </div>
  );
}

// ============================================================
// 6) CHAT BUBBLE — speech-bubble style, dark text on accent
// ============================================================
function StickerChat({ run, visible, accent }) {
  const headline = visible.distance
    ? `just ran ${run.distance} km`
    : `ran a ${run.title.toLowerCase()}`;
  const sub = [
    visible.duration && `${run.duration} total`,
    visible.pace && `${run.pace}/km`,
  ].filter(Boolean).join(" · ");

  return (
    <div className="ovl ovl-chat" style={{ "--accent": accent, "--accent-fg": isLight(accent) ? "#000" : "#fff" }}>
      <div className="ovl-chat-bubble">
        <div className="ovl-chat-msg">{headline}</div>
        {sub && <div className="ovl-chat-sub">{sub}</div>}
        <div className="ovl-chat-tail"></div>
      </div>
      <div className="ovl-chat-meta">
        <span className="ovl-chat-avatar">RW</span>
        <span>rangga.runs · 2m</span>
      </div>
    </div>
  );
}

// ============================================================
// META
// ============================================================
const STICKER_DEFS = [
  { id: "bignumber", name: "Big Number", desc: "Hero", comp: StickerBigNumber },
  { id: "boldcaps",  name: "Bold Caps",  desc: "Three stats", comp: StickerBoldCaps },
  { id: "mono",      name: "Mono Block", desc: "Receipt", comp: StickerMonoBlock },
  { id: "serif",     name: "Serif Note", desc: "Editorial", comp: StickerSerif },
  { id: "capsule",   name: "Capsule",    desc: "Location pill", comp: StickerCapsule },
  { id: "chat",      name: "Chat",       desc: "Bubble", comp: StickerChat },
];

function StickerById({ id, run, visible, accent }) {
  const def = STICKER_DEFS.find(s => s.id === id) || STICKER_DEFS[0];
  const Comp = def.comp;
  return <Comp run={run} visible={visible} accent={accent} />;
}

Object.assign(window, {
  STICKER_DEFS,
  StickerById,
  VISIBLE_LABELS,
});
