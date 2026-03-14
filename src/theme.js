// ─── DESIGN TOKENS ───────────────────────────────────────────────
export const theme = {
  bg: "#07080f",
  bgCard: "rgba(255,255,255,0.04)",
  bgCardHover: "rgba(255,255,255,0.07)",
  border: "rgba(255,255,255,0.08)",
  borderAccent: "rgba(99,210,143,0.4)",
  gradientGold: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
  gradientGreen: "linear-gradient(135deg, #63d28f 0%, #38b2ac 100%)",
  gradientBlue: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  gradientRed: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  gradientBg: "linear-gradient(145deg, #07080f 0%, #0d1220 50%, #07080f 100%)",
  textPrimary: "#f0f2f8",
  textSecondary: "#8892a4",
  textMuted: "#4a5568",
  gold: "#f6d365",
  green: "#63d28f",
  blue: "#667eea",
  red: "#f5576c",
  fontDisplay: "'Fraunces', serif",
  fontBody: "'Outfit', sans-serif",
  fontMono: "'JetBrains Mono', monospace",
};

// ─── STORAGE (localStorage for Vercel, fallback gracefully) ───────
const PREFIX = "fitness_v2_";

export const storage = {
  get(key) {
    try { const v = localStorage.getItem(PREFIX + key); return v ? JSON.parse(v) : null; }
    catch { return null; }
  },
  set(key, value) {
    try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); return true; }
    catch { return false; }
  },
  remove(key) {
    try { localStorage.removeItem(PREFIX + key); } catch {}
  }
};

// ─── SHARED STYLES ────────────────────────────────────────────────
export const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@700;900&family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #07080f; color: #f0f2f8; font-family: 'Outfit', sans-serif; -webkit-tap-highlight-color: transparent; }
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
  input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }

  .glass { background: rgba(255,255,255,0.04); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; }
  .glass-bright { background: rgba(255,255,255,0.07); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.12); border-radius: 20px; }

  .inp {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    color: #f0f2f8;
    padding: 12px 16px;
    font-size: 15px;
    font-family: 'Outfit', sans-serif;
    outline: none;
    width: 100%;
    transition: border 0.2s, background 0.2s;
  }
  .inp:focus { border-color: rgba(99,210,143,0.6); background: rgba(99,210,143,0.05); }
  .inp option { background: #0d1220; }

  .btn-primary {
    background: linear-gradient(135deg, #63d28f 0%, #38b2ac 100%);
    border: none; border-radius: 14px;
    color: #07080f; font-weight: 700; font-size: 15px;
    padding: 15px 32px; cursor: pointer;
    font-family: 'Outfit', sans-serif;
    transition: all 0.2s;
    box-shadow: 0 8px 32px rgba(99,210,143,0.25);
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(99,210,143,0.4); }
  .btn-primary:active { transform: translateY(0); }

  .btn-ghost {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px; color: #8892a4;
    font-size: 14px; padding: 10px 20px;
    cursor: pointer; font-family: 'Outfit', sans-serif;
    transition: all 0.2s;
  }
  .btn-ghost:hover { background: rgba(255,255,255,0.1); color: #f0f2f8; }

  label { color: #8892a4; font-size: 11px; letter-spacing: 1.2px; text-transform: uppercase; display: block; margin-bottom: 7px; font-weight: 600; }

  .tag { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }

  @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes scaleIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.6; } }
  @keyframes shimmer { from { background-position: -200% center; } to { background-position: 200% center; } }

  .anim-fadeup { animation: fadeUp 0.5s ease forwards; }
  .anim-scalein { animation: scaleIn 0.4s ease forwards; }
  .anim-pulse { animation: pulse 2s ease infinite; }
`;

// ─── HELPERS ─────────────────────────────────────────────────────
export function formatTime(s) {
  return `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function getWeekDates() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - 6 + i);
    return d.toISOString().slice(0, 10);
  });
}
