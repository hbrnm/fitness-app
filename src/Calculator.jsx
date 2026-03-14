import { useState, useEffect } from "react";
import { theme, storage } from "./theme";

const activityLevels = [
  { label: "Sedentar (fără sport)", multiplier: 1.2 },
  { label: "Ușor activ (1–3 zile/săpt)", multiplier: 1.375 },
  { label: "Moderat activ (3–5 zile/săpt)", multiplier: 1.55 },
  { label: "Foarte activ (6–7 zile/săpt)", multiplier: 1.725 },
  { label: "Extrem de activ (2x/zi)", multiplier: 1.9 },
];

const goals = [
  { label: "Slăbit rapid (−1kg/săpt)", deficit: -1000, color: "#f5576c" },
  { label: "Slăbit moderat (−0.5kg/săpt)", deficit: -500, color: "#fda085" },
  { label: "Slăbit ușor (−0.25kg/săpt)", deficit: -250, color: "#f6d365" },
  { label: "Menținere", deficit: 0, color: "#63d28f" },
  { label: "Creștere musculară (+0.25kg/săpt)", deficit: 250, color: "#667eea" },
];

export default function Calculator({ onBack }) {
  const saved = storage.get("user_profile") || {};
  const [form, setForm] = useState({
    age: saved.age || 40,
    weight: saved.weight || 99,
    height: saved.height || 180,
    gender: saved.gender || "male",
    activity: saved.activity ?? 1,
    goal: saved.goal ?? 1,
  });
  const [result, setResult] = useState(storage.get("calc_result") || null);
  const [saved2, setSaved2] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const calculate = () => {
    const { age, weight, height, gender, activity, goal } = form;
    const bmr = gender === "male"
      ? 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age
      : 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
    const tdee = bmr * activityLevels[activity].multiplier;
    const target = Math.round(tdee + goals[goal].deficit);
    const protein = Math.round(weight * 1.8);
    const fat = Math.round((target * 0.28) / 9);
    const carbs = Math.round((target - protein * 4 - fat * 9) / 4);
    const r = { bmr: Math.round(bmr), tdee: Math.round(tdee), target, protein, fat, carbs };
    setResult(r);
    // Save to shared storage so journal can use it
    storage.set("calc_result", r);
    storage.set("user_profile", { ...form, targetCalories: target, targetProtein: protein, targetFat: fat, targetCarbs: carbs });
    setSaved2(true);
    setTimeout(() => setSaved2(false), 2500);
  };

  const macroPercents = result ? {
    p: Math.round((result.protein * 4 / result.target) * 100),
    f: Math.round((result.fat * 9 / result.target) * 100),
    c: Math.round((result.carbs * 4 / result.target) * 100),
  } : null;

  return (
    <div style={{ minHeight: "100vh", background: theme.gradientBg, paddingBottom: 40 }}>
      <style>{`
        .macro-row { display: flex; flex-direction: column; gap: 4px; margin-bottom: 16px; }
        .macro-bar-bg { height: 8px; background: rgba(255,255,255,0.08); border-radius: 4px; overflow: hidden; }
        .macro-bar-fill { height: 100%; border-radius: 4px; transition: width 1s cubic-bezier(.4,0,.2,1); }
        .seg-btn { flex: 1; padding: 10px 6px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03); color: #8892a4; cursor: pointer; font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 500; transition: all 0.2s; text-align: center; }
        .seg-btn.active { background: rgba(99,210,143,0.15); border-color: rgba(99,210,143,0.5); color: #63d28f; font-weight: 700; }
        .stat-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 16px; text-align: center; }
        .anim-up { animation: fadeUp 0.5s ease forwards; opacity: 0; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* Header */}
      <div style={{ padding: "52px 24px 24px", background: "linear-gradient(180deg, rgba(246,211,101,0.07) 0%, transparent 100%)" }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#8892a4", padding: "8px 16px", cursor: "pointer", fontFamily: "'Outfit',sans-serif", fontSize: 13, marginBottom: 20 }}>← Înapoi</button>
        <div style={{ fontSize: 36, marginBottom: 6 }}>🔥</div>
        <div style={{ fontFamily: theme.fontDisplay, fontSize: 30, fontWeight: 900, color: theme.textPrimary }}>Calculator Caloric</div>
        <div style={{ color: theme.textSecondary, fontSize: 14, marginTop: 4 }}>Calculează-ți necesarul zilnic personalizat</div>
      </div>

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Form card */}
        <div className="glass" style={{ padding: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Gender */}
            <div>
              <label>Sex</label>
              <div style={{ display: "flex", gap: 8 }}>
                <button className={`seg-btn${form.gender === "male" ? " active" : ""}`} onClick={() => set("gender", "male")}>♂ Masculin</button>
                <button className={`seg-btn${form.gender === "female" ? " active" : ""}`} onClick={() => set("gender", "female")}>♀ Feminin</button>
              </div>
            </div>

            {/* Age / Weight / Height */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              {[["age", "Vârstă", "ani"], ["weight", "Greutate", "kg"], ["height", "Înălțime", "cm"]].map(([k, lbl, unit]) => (
                <div key={k}>
                  <label>{lbl}</label>
                  <div style={{ position: "relative" }}>
                    <input className="inp" type="number" value={form[k]} onChange={e => set(k, +e.target.value)} style={{ paddingRight: 28 }} />
                    <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: theme.textMuted }}>{unit}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Activity */}
            <div>
              <label>Nivel de activitate</label>
              <select className="inp" value={form.activity} onChange={e => set("activity", +e.target.value)}>
                {activityLevels.map((a, i) => <option key={i} value={i}>{a.label}</option>)}
              </select>
            </div>

            {/* Goal */}
            <div>
              <label>Obiectiv</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {goals.map((g, i) => (
                  <button key={i} onClick={() => set("goal", i)} style={{ padding: "12px 16px", borderRadius: 12, border: `1px solid ${form.goal === i ? g.color + "66" : "rgba(255,255,255,0.08)"}`, background: form.goal === i ? g.color + "18" : "rgba(255,255,255,0.03)", color: form.goal === i ? g.color : theme.textSecondary, cursor: "pointer", fontFamily: "'Outfit',sans-serif", fontSize: 14, fontWeight: form.goal === i ? 600 : 400, textAlign: "left", transition: "all 0.2s" }}>
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <button className="btn-primary" onClick={calculate} style={{ width: "100%", fontSize: 16, padding: "16px" }}>
              Calculează →
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="anim-up glass" style={{ padding: 24 }}>
            <div style={{ fontFamily: theme.fontDisplay, fontSize: 18, fontWeight: 700, color: theme.gold, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
              📊 Rezultatele tale
              {saved2 && <span style={{ fontSize: 12, color: theme.green, fontFamily: "'Outfit',sans-serif", fontWeight: 400 }}>✓ Salvat în jurnal</span>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
              {[
                { label: "BMR", val: result.bmr, unit: "kcal", color: theme.textSecondary },
                { label: "TDEE", val: result.tdee, unit: "kcal", color: theme.textSecondary },
                { label: "Țintă", val: result.target, unit: "kcal", color: theme.gold, highlight: true },
              ].map(s => (
                <div key={s.label} className="stat-card" style={s.highlight ? { border: `1px solid rgba(246,211,101,0.3)`, background: "rgba(246,211,101,0.07)" } : {}}>
                  <div style={{ fontFamily: theme.fontMono, fontSize: 22, fontWeight: 700, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: theme.textMuted, marginTop: 3, textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.unit}</div>
                  <div style={{ fontSize: 11, color: theme.textSecondary, marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Macros */}
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: 18 }}>
              <div style={{ fontSize: 11, color: theme.textMuted, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 16, fontWeight: 600 }}>Macronutrienți zilnici</div>
              {[
                { label: "🥩 Proteine", val: result.protein, pct: macroPercents.p, color: "#fda085", kcal: result.protein * 4 },
                { label: "🥑 Grăsimi", val: result.fat, pct: macroPercents.f, color: "#f6d365", kcal: result.fat * 9 },
                { label: "🍚 Carbohidrați", val: result.carbs, pct: macroPercents.c, color: "#63d28f", kcal: result.carbs * 4 },
              ].map(m => (
                <div key={m.label} className="macro-row">
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                    <span style={{ color: theme.textSecondary }}>{m.label}</span>
                    <span style={{ color: m.color, fontWeight: 600 }}>{m.val}g <span style={{ color: theme.textMuted, fontSize: 12 }}>· {m.pct}% · {m.kcal}kcal</span></span>
                  </div>
                  <div className="macro-bar-bg">
                    <div className="macro-bar-fill" style={{ width: `${m.pct}%`, background: m.color }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16, padding: "14px 18px", background: "rgba(99,210,143,0.07)", border: "1px solid rgba(99,210,143,0.2)", borderRadius: 14 }}>
              <div style={{ fontSize: 13, color: theme.textSecondary, lineHeight: 1.7 }}>
                💡 Vei pierde aproximativ <strong style={{ color: theme.green }}>{(Math.abs(goals[form.goal].deficit) * 30 / 7700).toFixed(1)} kg/lună</strong> cu acest plan. Țintele au fost salvate automat în Jurnal.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
