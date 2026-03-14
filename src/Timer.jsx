import { useState, useEffect, useRef } from "react";
import { theme, storage, formatTime, today } from "./theme";

const WORKOUTS = {
  "Luni — Partea superioară": {
    icon: "💪", color: "#fda085",
    exercises: [
      { name: "Flotări", sets: 4, reps: "10–15", rest: 60 },
      { name: "Lat Pulldown", sets: 4, reps: "10–12", rest: 60 },
      { name: "Împins umeri", sets: 3, reps: "12", rest: 60 },
      { name: "Rowing gantere", sets: 3, reps: "12/parte", rest: 60 },
      { name: "Biceps Curl", sets: 3, reps: "12", rest: 45 },
      { name: "Triceps Dips", sets: 3, reps: "12", rest: 45 },
      { name: "Plank", sets: 3, reps: "40s", rest: 45, isHold: true, holdTime: 40 },
    ]
  },
  "Miercuri — Partea inferioară": {
    icon: "🦵", color: "#63d28f",
    exercises: [
      { name: "Genuflexiuni", sets: 4, reps: "15", rest: 60 },
      { name: "Fandări mers", sets: 3, reps: "12/picior", rest: 60 },
      { name: "Presă picioare", sets: 4, reps: "12", rest: 75 },
      { name: "Romanian Deadlift", sets: 3, reps: "12", rest: 75 },
      { name: "Ridicări vârfuri", sets: 4, reps: "20", rest: 45 },
      { name: "Hip Thrust", sets: 3, reps: "15", rest: 60 },
      { name: "Crunch bicicletă", sets: 3, reps: "20", rest: 45 },
    ]
  },
  "Vineri — Corp complet": {
    icon: "🏋️", color: "#667eea",
    exercises: [
      { name: "Deadlift gantere", sets: 4, reps: "10", rest: 90 },
      { name: "Împins piept înclinat", sets: 3, reps: "12", rest: 60 },
      { name: "Squats cu săritură", sets: 3, reps: "15", rest: 60 },
      { name: "Lat Pulldown", sets: 3, reps: "10", rest: 60 },
      { name: "Kettlebell Swing", sets: 4, reps: "20", rest: 45 },
      { name: "Mountain Climbers", sets: 3, reps: "30s", rest: 45, isHold: true, holdTime: 30 },
      { name: "Plank lateral", sets: 3, reps: "30s/parte", rest: 45, isHold: true, holdTime: 30 },
    ]
  },
};

export default function Timer({ onBack }) {
  const [phase, setPhase] = useState("select");
  const [selected, setSelected] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [exIdx, setExIdx] = useState(0);
  const [setIdx, setSetIdx] = useState(0);
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const [completedSets, setCompletedSets] = useState({});
  const [totalTime, setTotalTime] = useState(0);
  const [history, setHistory] = useState([]);
  const timerRef = useRef(null);
  const totalRef = useRef(null);

  useEffect(() => {
    setHistory(storage.get("workout_history") || []);
  }, []);

  useEffect(() => {
    if (running) timerRef.current = setInterval(() => setTimer(t => t > 0 ? t - 1 : 0), 1000);
    else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [running]);

  useEffect(() => {
    if (timer === 0 && running && (phase === "rest" || phase === "warmup" || phase === "hold")) {
      setRunning(false);
      setPhase("workout");
    }
  }, [timer, running, phase]);

  useEffect(() => {
    if (phase !== "select" && phase !== "done") {
      totalRef.current = setInterval(() => setTotalTime(t => t + 1), 1000);
    } else clearInterval(totalRef.current);
    return () => clearInterval(totalRef.current);
  }, [phase]);

  const startWorkout = (name) => {
    setSelected(name);
    setExercises(WORKOUTS[name].exercises);
    setExIdx(0); setSetIdx(0);
    setCompletedSets({});
    setTotalTime(0);
    setPhase("warmup");
    setTimer(300);
    setRunning(true);
  };

  const ex = exercises[exIdx];
  const isLastSet = ex && setIdx >= ex.sets - 1;
  const isLastEx = exIdx >= exercises.length - 1;

  const completeSet = () => {
    setCompletedSets(c => ({ ...c, [`${exIdx}-${setIdx}`]: true }));
    if (ex.isHold) { setPhase("hold"); setTimer(ex.holdTime); setRunning(true); }
    else if (isLastSet && isLastEx) finishWorkout();
    else if (isLastSet) { setExIdx(i => i + 1); setSetIdx(0); setPhase("rest"); setTimer(ex.rest); setRunning(true); }
    else { setSetIdx(s => s + 1); setPhase("rest"); setTimer(ex.rest); setRunning(true); }
  };

  const finishWorkout = () => {
    setPhase("done");
    setRunning(false);
    // Save to history and mark today's journal entry as workout done
    const session = { date: today(), name: selected, duration: totalTime, sets: exercises.reduce((a, e) => a + e.sets, 0) };
    const newHistory = [session, ...history].slice(0, 50);
    setHistory(newHistory);
    storage.set("workout_history", newHistory);
    // Auto-update journal entry
    const entries = storage.get("journal_entries") || [];
    const todayEntry = entries.find(e => e.date === today()) || { date: today() };
    const updated = [{ ...todayEntry, workout: true }, ...entries.filter(e => e.date !== today())];
    storage.set("journal_entries", updated);
  };

  const progress = exercises.length ? (exIdx / exercises.length) * 100 : 0;
  const workoutColor = selected ? WORKOUTS[selected].color : theme.green;

  return (
    <div style={{ minHeight: "100vh", background: theme.gradientBg, paddingBottom: 40 }}>
      <style>{`
        .ex-pill { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s; }
        .ex-pill.done { background: rgba(99,210,143,0.08); border-color: rgba(99,210,143,0.2); }
        .big-timer { font-family: 'JetBrains Mono', monospace; font-size: 80px; font-weight: 700; line-height: 1; }
        .action-btn { border: none; border-radius: 16px; font-weight: 700; font-size: 16px; padding: 15px 28px; cursor: pointer; font-family: 'Outfit', sans-serif; transition: all 0.2s; }
        .action-btn:hover { filter: brightness(1.1); transform: translateY(-2px); }
        @keyframes countPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.06); } }
        .count-pulse { animation: countPulse 1s ease infinite; }
      `}</style>

      {/* Header */}
      <div style={{ padding: "52px 24px 24px", background: `linear-gradient(180deg, ${workoutColor}14 0%, transparent 100%)` }}>
        <button onClick={() => { setPhase("select"); clearInterval(timerRef.current); clearInterval(totalRef.current); onBack(); }}
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#8892a4", padding: "8px 16px", cursor: "pointer", fontFamily: "'Outfit',sans-serif", fontSize: 13, marginBottom: 20 }}>← Înapoi</button>

        {phase === "select" && (
          <>
            <div style={{ fontSize: 36, marginBottom: 6 }}>⏱️</div>
            <div style={{ fontFamily: theme.fontDisplay, fontSize: 30, fontWeight: 900, color: theme.textPrimary }}>Timer Antrenament</div>
            <div style={{ color: theme.textSecondary, fontSize: 14, marginTop: 4 }}>Alege antrenamentul de azi</div>
          </>
        )}

        {phase !== "select" && (
          <div>
            <div style={{ fontSize: 13, color: workoutColor, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 4, fontWeight: 600 }}>{selected}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: theme.fontMono, fontSize: 14, color: theme.textSecondary }}>⏱ {formatTime(totalTime)}</div>
              {phase === "workout" && <div style={{ fontSize: 13, color: theme.textSecondary }}>{exIdx + 1}/{exercises.length} exerciții</div>}
            </div>
            {phase === "workout" && (
              <div style={{ marginTop: 12, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", background: workoutColor, width: `${progress}%`, transition: "width 0.5s ease", borderRadius: 2 }} />
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* SELECT */}
        {phase === "select" && (
          <>
            {Object.entries(WORKOUTS).map(([name, w]) => (
              <button key={name} onClick={() => startWorkout(name)} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "20px 22px", cursor: "pointer", textAlign: "left", transition: "all 0.25s", display: "flex", alignItems: "center", gap: 16 }}
                onMouseEnter={e => e.currentTarget.style.borderColor = w.color + "88"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg, ${w.color}33, ${w.color}11)`, border: `1px solid ${w.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{w.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: theme.fontDisplay, fontSize: 17, fontWeight: 700, color: theme.textPrimary }}>{name}</div>
                  <div style={{ fontSize: 12, color: theme.textSecondary, marginTop: 3 }}>{w.exercises.length} exerciții · ~{Math.round(w.exercises.reduce((a, e) => a + e.sets * (e.rest + 45), 0) / 60)} minute</div>
                </div>
                <div style={{ color: w.color, fontSize: 20 }}>›</div>
              </button>
            ))}

            {history.length > 0 && (
              <div className="glass" style={{ padding: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: theme.textSecondary, marginBottom: 12 }}>📜 Ultimele sesiuni</div>
                {history.slice(0, 3).map((h, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                    <div>
                      <div style={{ fontSize: 13, color: theme.textPrimary }}>{h.name?.split("—")[0]}</div>
                      <div style={{ fontSize: 11, color: theme.textMuted }}>{h.date}</div>
                    </div>
                    <div style={{ fontFamily: theme.fontMono, fontSize: 13, color: theme.green }}>{formatTime(h.duration)}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* WARMUP */}
        {phase === "warmup" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 13, color: theme.gold, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 12, fontWeight: 600 }}>Încălzire</div>
            <div style={{ color: theme.textSecondary, fontSize: 16, marginBottom: 30 }}>5 minute mers rapid + mobilitate</div>
            <div className="count-pulse big-timer" style={{ color: theme.gold, marginBottom: 36 }}>{formatTime(timer)}</div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button className="action-btn" onClick={() => setRunning(r => !r)} style={{ background: running ? "rgba(255,255,255,0.08)" : theme.gradientGold, color: running ? theme.textSecondary : "#07080f" }}>
                {running ? "⏸ Pauză" : "▶ Start"}
              </button>
              <button className="action-btn" onClick={() => { setRunning(false); setPhase("workout"); }} style={{ background: "rgba(255,255,255,0.06)", color: theme.textSecondary }}>Sari →</button>
            </div>
          </div>
        )}

        {/* WORKOUT */}
        {phase === "workout" && ex && (
          <>
            <div className="glass" style={{ padding: 26, textAlign: "center" }}>
              <div style={{ fontFamily: theme.fontDisplay, fontSize: 28, fontWeight: 900, color: theme.textPrimary, marginBottom: 24 }}>{ex.name}</div>
              <div style={{ display: "flex", gap: 4, marginBottom: 28, justifyContent: "center" }}>
                {Array.from({ length: ex.sets }).map((_, i) => (
                  <div key={i} style={{ width: 32, height: 6, borderRadius: 3, background: completedSets[`${exIdx}-${i}`] ? theme.green : i === setIdx ? workoutColor : "rgba(255,255,255,0.08)", transition: "all 0.3s" }} />
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 28 }}>
                {[
                  { label: "Set", val: `${setIdx + 1}/${ex.sets}`, color: workoutColor },
                  { label: "Repetări", val: ex.reps, color: theme.blue },
                  { label: "Pauză", val: `${ex.rest}s`, color: theme.textMuted },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: theme.fontMono, fontSize: 28, fontWeight: 700, color: s.color }}>{s.val}</div>
                    <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <button className="btn-primary" onClick={completeSet} style={{ width: "100%", fontSize: 18, padding: 18 }}>
              ✅ Set completat!
            </button>

            {/* Exercise list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {exercises.map((e, i) => (
                <div key={i} className={`ex-pill${i < exIdx ? " done" : ""}`} style={i === exIdx ? { borderColor: workoutColor + "88", background: workoutColor + "10" } : {}}>
                  <div style={{ fontSize: 13, color: i < exIdx ? theme.green : i === exIdx ? theme.textPrimary : theme.textMuted, fontWeight: i === exIdx ? 600 : 400 }}>
                    {i < exIdx ? "✓ " : i === exIdx ? "▶ " : `${i + 1}. `}{e.name}
                  </div>
                  <div style={{ fontSize: 12, color: theme.textMuted }}>{e.sets}×{e.reps}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* REST */}
        {phase === "rest" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 13, color: theme.blue, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 12, fontWeight: 600 }}>Pauză</div>
            <div style={{ color: theme.textSecondary, fontSize: 15, marginBottom: 28 }}>Recuperare • Respiră adânc</div>
            <div className="count-pulse big-timer" style={{ color: theme.blue, marginBottom: 32 }}>{formatTime(timer)}</div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button className="action-btn" onClick={() => setRunning(r => !r)} style={{ background: running ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg, #667eea, #764ba2)", color: "#fff" }}>
                {running ? "⏸ Pauză" : "▶ Start"}
              </button>
              <button className="action-btn" onClick={() => { setRunning(false); setPhase("workout"); }} style={{ background: "rgba(255,255,255,0.06)", color: theme.textSecondary }}>Sari →</button>
            </div>
          </div>
        )}

        {/* HOLD */}
        {phase === "hold" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 13, color: theme.gold, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 12, fontWeight: 600 }}>Menține poziția!</div>
            <div className="count-pulse big-timer" style={{ color: theme.gold, marginBottom: 16 }}>{formatTime(timer)}</div>
            <div style={{ color: theme.textSecondary }}>Concentrează-te și ține! 💪</div>
          </div>
        )}

        {/* DONE */}
        {phase === "done" && (
          <div style={{ textAlign: "center", padding: "20px 0", animation: "scaleIn 0.5s ease" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🏆</div>
            <div style={{ fontFamily: theme.fontDisplay, fontSize: 36, fontWeight: 900, color: theme.gold, marginBottom: 8 }}>Felicitări!</div>
            <div style={{ color: theme.textSecondary, fontSize: 16, marginBottom: 32 }}>Antrenament completat cu succes!<br/>A fost salvat automat în jurnal. ✓</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 32 }}>
              {[
                { icon: "⏱", val: formatTime(totalTime), label: "Durată" },
                { icon: "💪", val: exercises.reduce((a, e) => a + e.sets, 0), label: "Seturi" },
                { icon: "🔥", val: exercises.length, label: "Exerciții" },
              ].map(s => (
                <div key={s.label} className="glass" style={{ padding: 16, textAlign: "center" }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ fontFamily: theme.fontMono, fontSize: 20, fontWeight: 700, color: theme.gold }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: theme.textMuted, marginTop: 3, textTransform: "uppercase" }}>{s.label}</div>
                </div>
              ))}
            </div>

            <button className="btn-primary" onClick={() => { setPhase("select"); setTotalTime(0); }} style={{ width: "100%", fontSize: 16, padding: 16 }}>
              🔄 Antrenament nou
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
