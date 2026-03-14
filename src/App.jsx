import { useState } from "react";
import { globalCSS } from "./theme";
import Home from "./Home";
import Calculator from "./Calculator";
import Journal from "./Journal";
import Timer from "./Timer";

export default function App() {
  const [screen, setScreen] = useState("home");

  return (
    <>
      <style>{globalCSS}</style>
      {screen === "home" && <Home onNavigate={setScreen} />}
      {screen === "calculator" && <Calculator onBack={() => setScreen("home")} />}
      {screen === "journal" && <Journal onBack={() => setScreen("home")} />}
      {screen === "timer" && <Timer onBack={() => setScreen("home")} />}
    </>
  );
}
