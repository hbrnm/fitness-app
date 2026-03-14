import { theme, globalCSS, storage, today } from "./theme";

export default function Home({ onNavigate }) {
  const entries = storage.get("journal_entries") || [];
  const todayEntry = entries.find(e => e.date === today()) || {};
  const profile = storage.get("user_profile") || {};
  const streak = (() => {
    let s = 0;
    for (let i = 0; i < 60; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().slice(0, 10);
      if (entries.find(e => e.date === ds && e.weight)) s++; else break;
    }
    return s;
  })();

  const lastWeight = entries.find(e => e.weight)?.weight || profile.weight || "—";
  const target = profile.targetCalories || "—";

  const cards = [
    {
      id: "calculator",
      icon: "🔥",
      title: "Calculator Caloric",
      subtitle: "BMR · TDEE · Macronutrienți",
      gradient: theme.gradientGold,
      stat: target !== "—" ? `${target} kcal/zi` : "Calculează acum",
      statLabel: "Ținta ta calorică",
    },
    {
      id: "journal",
      icon: "📓",
      title: "Jurnal Fitness",
      subtitle: "Greutate · Calorii · Progres",
      gradient: theme.gradientGreen,
      stat: lastWeight !== "—" ? `${lastWeight} kg` : "Adaugă prima zi",
      statLabel: "Ultima greutate",
    },
    {
      id: "timer",
      icon: "⏱️",
      title: "Timer Antrenament",
      subtitle: "Exerciții · Seturi · Pauze",
      gradient: theme.gradientBlue,
      stat: `${entries.filter(e => e.workout).length} sesiuni`,
      statLabel: "Antrenamente totale",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: theme.gradientBg, padding: "0 0 32px" }}>
      <style>{globalCSS}{`
        .home-card {
          position: relative; overflow: hidden;
          border-radius: 24px; padding: 28px;
          cursor: pointer; transition: all 0.3s;
          border: 1px solid rgba(255,255,255,0.08);
          animation: fadeUp 0.5s ease forwards;
          opacity: 0;
        }
        .home-card:hover { transform: translateY(-4px) scale(1.01); }
        .home-card:active { transform: scale(0.98); }
        .card-bg { position: absolute; inset: 0; opacity: 0.12; border-radius: 24px; }
        .streak-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(246,211,101,0.12); border: 1px solid rgba(246,211,101,0.25); border-radius: 20px; padding: 6px 14px; }
      `}</style>

      {/* Header */}
      <div style={{ padding: "52px 24px 32px", background: "linear-gradient(180deg, rgba(99,210,143,0.06) 0%, transparent 100%)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontFamily: theme.fontDisplay, fontSize: 13, color: theme.green, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 8 }}>
              Plan Fitness Personal
            </div>
            <div style={{ fontFamily: theme.fontDisplay, fontSize: 34, fontWeight: 900, lineHeight: 1.15, color: theme.textPrimary }}>
              Bună ziua! 👋
            </div>
            <div style={{ color: theme.textSecondary, fontSize: 15, marginTop: 6 }}>
              {new Date().toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long" })}
            </div>
          </div>
          {streak > 0 && (
            <div className="streak-badge">
              <span style={{ fontSize: 18 }}>🔥</span>
              <span style={{ fontFamily: theme.fontMono, fontSize: 18, fontWeight: 700, color: theme.gold }}>{streak}</span>
              <span style={{ fontSize: 11, color: theme.textSecondary }}>zile</span>
            </div>
          )}
        </div>

        {/* Today's quick stats */}
        {(todayEntry.calories || todayEntry.weight || todayEntry.steps) && (
          <div style={{ marginTop: 20, display: "flex", gap: 10 }} className="anim-fadeup">
            {[
              todayEntry.weight && { label: "Greutate", val: `${todayEntry.weight}kg`, color: theme.gold },
              todayEntry.calories && { label: "Calorii", val: `${todayEntry.calories}kcal`, color: theme.green },
              todayEntry.steps && { label: "Pași", val: todayEntry.steps.toLocaleString(), color: theme.blue },
            ].filter(Boolean).map(s => (
              <div key={s.label} style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "10px 12px", textAlign: "center" }}>
                <div style={{ fontFamily: theme.fontMono, fontSize: 15, fontWeight: 700, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 10, color: theme.textMuted, marginTop: 2, textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cards */}
      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        {cards.map((card, i) => (
          <div key={card.id} className="home-card" onClick={() => onNavigate(card.id)}
            style={{ animationDelay: `${i * 0.1}s`, background: "rgba(255,255,255,0.03)" }}>
            <div className="card-bg" style={{ background: card.gradient }} />

            <div style={{ position: "relative", display: "flex", alignItems: "flex-start", gap: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: card.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0, boxShadow: `0 8px 24px rgba(0,0,0,0.3)` }}>
                {card.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: theme.fontDisplay, fontSize: 20, fontWeight: 700, color: theme.textPrimary }}>{card.title}</div>
                <div style={{ fontSize: 13, color: theme.textSecondary, marginTop: 2 }}>{card.subtitle}</div>
              </div>
              <div style={{ color: theme.textMuted, fontSize: 18, marginTop: 4 }}>›</div>
            </div>

            <div style={{ position: "relative", marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontFamily: theme.fontMono, fontSize: 18, fontWeight: 700, color: theme.textPrimary }}>{card.stat}</div>
                <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 2, textTransform: "uppercase", letterSpacing: "0.5px" }}>{card.statLabel}</div>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                →
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer tip */}
      <div style={{ margin: "24px 20px 0", padding: "16px 20px", background: "rgba(99,210,143,0.06)", border: "1px solid rgba(99,210,143,0.15)", borderRadius: 16 }}>
        <div style={{ fontSize: 13, color: theme.textSecondary, lineHeight: 1.6 }}>
          💡 <strong style={{ color: theme.green }}>Sfat zilnic:</strong> Consistența bate perfecțiunea. O zi bună urmată de una mediocră e mai bine decât nicio zi.
        </div>
      </div>
    </div>
  );
}
