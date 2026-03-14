import { useState, useEffect } from "react";
import { theme, storage, today, getWeekDates } from "./theme";

const moods = ["😞", "😕", "😐", "🙂", "😄"];
const DAYS_SHORT = ["Lun", "Mar", "Mie", "Joi", "Vin", "Sâm", "Dum"];

function emptyEntry() {
  return { weight: "", calories: "", protein: "", water: "", steps: "", workout: false, mood: 2, notes: "", date: today() };
}

export default function Journal({ onBack }) {
  const [view, setView] = useState("today");
  const [entries, setEntries] = useState([]);
  const [entry, setEntry] = useState(emptyEntry());
  const [saved, setSaved] = useState(false);
  const profile = storage.get("user_profile") || {};
  const targets = {
    calories: profile.targetCalories || 2100,
    protein: profile.targetProtein || 160,
    steps: 10000,
    water: 2.5,
  };

  useEffect(() => {
    const e = storage.get("journal_entries") || [];
    setEntries(e);
    const todayE = e.find(x => x.date === today());
    if (todayE) setEntry(todayE);
  }, []);

  const setField = (k, v) => setEntry(e => ({ ...e, [k]: v }));

  const saveEntry = () => {
    const newEntry = { ...entry, date: today() };
    const rest = entries.filter(e => e.date !== today());
    const updated = [newEntry, ...rest].slice(0, 120);
    setEntries(updated);
    storage.set("journal_entries", updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const exportCSV = () => {
    const headers = "Data,Greutate(kg),Calorii,Proteine(g),Apa(L),Pasi,Antrenament,Dispozitie,Note\n";
    const rows = entries.map(e =>
      `${e.date},${e.weight||""},${e.calories||""},${e.protein||""},${e.water||""},${e.steps||""},${e.workout?"Da":"Nu"},${moods[e.mood]||""},"${(e.notes||"").replace(/"/g,'""')}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "jurnal_fitness.csv"; a.click();
  };

  // Weight chart data
  const weekDates = getWeekDates();
  const chartData = weekDates.map(d => {
    const e = entries.find(x => x.date === d);
    return { date: d, weight: e?.weight ? +e.weight : null, dayLabel: DAYS_SHORT[new Date(d + "T00:00:00").getDay() === 0 ? 6 : new Date(d + "T00:00:00").getDay() - 1] };
  });
  const weights = chartData.filter(d => d.weight).map(d => d.weight);
  const minW = weights.length ? Math.min(...weights) - 1 : 95;
  const maxW = weights.length ? Math.max(...weights) + 1 : 105;

  const streak = (() => {
    let s = 0;
    for (let i = 0; i < 60; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      if (entries.find(e => e.date === d.toISOString().slice(0, 10) && e.weight)) s++; else break;
    }
    return s;
  })();

  const weightTrend = weights.length >= 2 ? (weights[weights.length - 1] - weights[0]).toFixed(1) : null;

  return (
    <div style={{ minHeight: "100vh", background: theme.gradientBg, paddingBottom: 40 }}>
      <style>{`
        .tab-btn { flex: 1; padding: 10px 4px; border: none; background: transparent; cursor: pointer; font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 500; transition: all 0.2s; border-radius: 10px; }
        .tab-btn.active { background: rgba(99,210,143,0.12); color: #63d28f; font-weight: 700; }
        .tab-btn:not(.active) { color: #8892a4; }
        .prog-bar { height: 6px; background: rgba(255,255,255,0.07); border-radius: 3px; overflow: hidden; margin-top: 5px; }
        .prog-fill { height: 100%; border-radius: 3px; transition: width 0.8s cubic-bezier(.4,0,.2,1); }
        .water-btn { padding: 6px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03); color: #8892a4; cursor: pointer; font-size: 12px; font-family: 'Outfit', sans-serif; transition: all 0.2s; }
        .water-btn.active { background: rgba(102,126,234,0.2); border-color: rgba(102,126,234,0.5); color: #667eea; }
        .mood-btn { border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); border-radius: 10px; padding: 8px 10px; cursor: pointer; font-size: 20px; transition: all 0.2s; }
        .mood-btn.active { border-color: rgba(99,210,143,0.5); background: rgba(99,210,143,0.12); transform: scale(1.15); }
        .hist-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 16px; animation: fadeUp 0.4s ease forwards; opacity: 0; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* Header */}
      <div style={{ padding: "52px 24px 20px", background: "linear-gradient(180deg, rgba(99,210,143,0.07) 0%, transparent 100%)" }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#8892a4", padding: "8px 16px", cursor: "pointer", fontFamily: "'Outfit',sans-serif", fontSize: 13, marginBottom: 20 }}>← Înapoi</button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 36, marginBottom: 6 }}>📓</div>
            <div style={{ fontFamily: theme.fontDisplay, fontSize: 30, fontWeight: 900, color: theme.textPrimary }}>Jurnal Fitness</div>
            <div style={{ color: theme.textSecondary, fontSize: 14, marginTop: 4 }}>{new Date().toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long" })}</div>
          </div>
          {streak > 0 && (
            <div style={{ textAlign: "center", background: "rgba(246,211,101,0.1)", border: "1px solid rgba(246,211,101,0.2)", borderRadius: 14, padding: "10px 16px" }}>
              <div style={{ fontFamily: theme.fontMono, fontSize: 24, fontWeight: 700, color: theme.gold }}>{streak}</div>
              <div style={{ fontSize: 10, color: theme.textMuted }}>ZILE 🔥</div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: "0 20px 16px" }}>
        <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 4 }}>
          {[["today", "Azi"], ["progress", "Progres"], ["history", "Istoric"]].map(([v, l]) => (
            <button key={v} className={`tab-btn${view === v ? " active" : ""}`} onClick={() => setView(v)}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* TODAY */}
        {view === "today" && (
          <>
            {profile.targetCalories && (
              <div style={{ padding: "12px 16px", background: "rgba(99,210,143,0.07)", border: "1px solid rgba(99,210,143,0.2)", borderRadius: 14 }}>
                <div style={{ fontSize: 12, color: theme.green }}>✓ Ținte din calculator: <strong>{targets.calories} kcal · {targets.protein}g proteine</strong></div>
              </div>
            )}

            <div className="glass" style={{ padding: 22 }}>
              <div style={{ color: theme.gold, fontWeight: 700, fontSize: 14, marginBottom: 16 }}>📏 Măsurători</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[["weight", "Greutate (kg)", "99"], ["calories", "Calorii mâncate", targets.calories], ["protein", "Proteine (g)", targets.protein], ["steps", "Pași", "10000"]].map(([k, lbl, ph]) => (
                  <div key={k}>
                    <label>{lbl}</label>
                    <input className="inp" type="number" placeholder={String(ph)} value={entry[k]} onChange={e => setField(k, e.target.value)} />
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 14 }}>
                <label>Apă (litri)</label>
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                  {[1, 1.5, 2, 2.5, 3, 3.5].map(v => (
                    <button key={v} className={`water-btn${+entry.water === v ? " active" : ""}`} onClick={() => setField("water", v)}>{v}L</button>
                  ))}
                  <input className="inp" type="number" step="0.1" placeholder="alt" value={entry.water} onChange={e => setField("water", e.target.value)} style={{ flex: 1, minWidth: 60 }} />
                </div>
              </div>
            </div>

            <div className="glass" style={{ padding: 22 }}>
              <div style={{ color: theme.green, fontWeight: 700, fontSize: 14, marginBottom: 16 }}>💪 Antrenament & Dispoziție</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                <span style={{ color: theme.textSecondary, fontSize: 14 }}>Antrenament azi:</span>
                <button onClick={() => setField("workout", !entry.workout)} style={{ padding: "8px 18px", borderRadius: 10, border: `1px solid ${entry.workout ? "rgba(99,210,143,0.5)" : "rgba(255,255,255,0.1)"}`, background: entry.workout ? "rgba(99,210,143,0.15)" : "rgba(255,255,255,0.04)", color: entry.workout ? theme.green : theme.textMuted, cursor: "pointer", fontWeight: 700, fontFamily: "'Outfit',sans-serif", fontSize: 14 }}>
                  {entry.workout ? "✅ Da!" : "❌ Nu"}
                </button>
              </div>
              <label>Dispoziție</label>
              <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
                {moods.map((m, i) => (
                  <button key={i} className={`mood-btn${entry.mood === i ? " active" : ""}`} onClick={() => setField("mood", i)}>{m}</button>
                ))}
              </div>
              <label>Note</label>
              <textarea className="inp" rows={3} placeholder="Cum te-ai simțit? Ce ai mâncat? Observații..." value={entry.notes} onChange={e => setField("notes", e.target.value)} style={{ resize: "none", lineHeight: 1.6 }} />
            </div>

            {/* Progress vs targets */}
            {(entry.calories || entry.protein || entry.steps || entry.water) && (
              <div className="glass" style={{ padding: 22 }}>
                <div style={{ color: theme.blue, fontWeight: 700, fontSize: 14, marginBottom: 16 }}>🎯 Progres față de ținte</div>
                {[
                  { label: "Calorii", val: entry.calories, target: targets.calories, color: "#f6d365", unit: "kcal" },
                  { label: "Proteine", val: entry.protein, target: targets.protein, color: "#fda085", unit: "g" },
                  { label: "Pași", val: entry.steps, target: 10000, color: "#63d28f", unit: "" },
                  { label: "Apă", val: entry.water, target: 2.5, color: "#667eea", unit: "L" },
                ].filter(i => i.val).map(item => {
                  const pct = Math.min(100, Math.round((+item.val / item.target) * 100));
                  return (
                    <div key={item.label} style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                        <span style={{ color: theme.textSecondary }}>{item.label}</span>
                        <span style={{ color: item.color, fontWeight: 600 }}>{item.val}{item.unit} / {item.target}{item.unit} <span style={{ color: theme.textMuted }}>({pct}%)</span></span>
                      </div>
                      <div className="prog-bar"><div className="prog-fill" style={{ width: `${pct}%`, background: item.color }} /></div>
                    </div>
                  );
                })}
              </div>
            )}

            <button className="btn-primary" onClick={saveEntry} style={{ width: "100%", fontSize: 16, padding: 16 }}>
              {saved ? "✅ Salvat!" : "💾 Salvează ziua"}
            </button>
          </>
        )}

        {/* PROGRESS */}
        {view === "progress" && (
          <>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { icon: "🔥", val: streak, label: "Streak zile", color: theme.gold },
                { icon: "📅", val: entries.length, label: "Zile înregistrate", color: theme.blue },
                { icon: "💪", val: entries.filter(e => e.workout).length, label: "Antrenamente", color: theme.green },
                { icon: "⚖️", val: weightTrend !== null ? `${weightTrend > 0 ? "+" : ""}${weightTrend}kg` : "—", label: "Trend săpt.", color: +weightTrend < 0 ? theme.green : theme.red },
              ].map(s => (
                <div key={s.label} className="glass" style={{ padding: 18, textAlign: "center" }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</div>
                  <div style={{ fontFamily: theme.fontMono, fontSize: 24, fontWeight: 700, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Weight Chart */}
            {weights.length >= 2 && (
              <div className="glass" style={{ padding: 22 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: theme.gold, marginBottom: 20 }}>⚖️ Evoluție greutate — 7 zile</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 100, marginBottom: 8 }}>
                  {chartData.map((d, i) => {
                    const h = d.weight ? Math.round(((d.weight - minW) / (maxW - minW)) * 80) + 10 : 4;
                    const isToday = d.date === today();
                    return (
                      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        {d.weight && <div style={{ fontSize: 9, color: isToday ? theme.gold : theme.textMuted, fontFamily: theme.fontMono }}>{d.weight}</div>}
                        <div style={{ width: "100%", height: h, background: d.weight ? (isToday ? "linear-gradient(to top, #f6d365, #fda085)" : "linear-gradient(to top, rgba(99,210,143,0.6), rgba(99,210,143,0.2))") : "rgba(255,255,255,0.05)", borderRadius: "4px 4px 0 0", transition: "height 0.6s ease" }} />
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  {chartData.map((d, i) => (
                    <div key={i} style={{ flex: 1, textAlign: "center", fontSize: 10, color: d.date === today() ? theme.gold : theme.textMuted }}>{d.dayLabel}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Workout heatmap */}
            <div className="glass" style={{ padding: 22 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: theme.green, marginBottom: 14 }}>💪 Frecvență antrenamente (30 zile)</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {Array.from({ length: 30 }, (_, i) => {
                  const d = new Date(); d.setDate(d.getDate() - 29 + i);
                  const ds = d.toISOString().slice(0, 10);
                  const e = entries.find(x => x.date === ds);
                  return (
                    <div key={i} title={ds} style={{ width: 20, height: 20, borderRadius: 4, background: e?.workout ? theme.green : e ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)", transition: "all 0.2s" }} />
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 10, fontSize: 11, color: theme.textMuted }}>
                <span>⬜ Fără antrenament</span>
                <span style={{ color: theme.green }}>🟩 Antrenament</span>
              </div>
            </div>

            {/* Export */}
            <button onClick={exportCSV} className="btn-ghost" style={{ width: "100%", padding: 14, fontSize: 14 }}>
              📥 Export date CSV
            </button>
          </>
        )}

        {/* HISTORY */}
        {view === "history" && (
          entries.length === 0 ? (
            <div style={{ textAlign: "center", color: theme.textMuted, padding: "60px 20px" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <div>Nu ai înregistrări încă. Începe cu tab-ul "Azi"!</div>
            </div>
          ) : entries.map((e, idx) => (
            <div key={e.date} className="hist-card" style={{ animationDelay: `${idx * 0.05}s` }}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "8px 12px", textAlign: "center", minWidth: 50 }}>
                  <div style={{ fontFamily: theme.fontMono, fontSize: 20, fontWeight: 700, color: theme.blue }}>{new Date(e.date).getDate()}</div>
                  <div style={{ fontSize: 9, color: theme.textMuted }}>{DAYS_SHORT[new Date(e.date + "T00:00:00").getDay() === 0 ? 6 : new Date(e.date + "T00:00:00").getDay() - 1]}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
                    {e.weight && <span className="tag" style={{ background: "rgba(246,211,101,0.1)", color: theme.gold }}>⚖️ {e.weight}kg</span>}
                    {e.calories && <span className="tag" style={{ background: "rgba(99,210,143,0.1)", color: theme.green }}>🔥 {e.calories}kcal</span>}
                    {e.protein && <span className="tag" style={{ background: "rgba(253,160,133,0.1)", color: "#fda085" }}>🥩 {e.protein}g</span>}
                    {e.workout && <span className="tag" style={{ background: "rgba(99,210,143,0.1)", color: theme.green }}>💪 Antrenament</span>}
                    {e.mood !== undefined && <span style={{ fontSize: 18 }}>{moods[e.mood]}</span>}
                  </div>
                  {e.notes && <div style={{ fontSize: 12, color: theme.textMuted, fontStyle: "italic" }}>{e.notes}</div>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
