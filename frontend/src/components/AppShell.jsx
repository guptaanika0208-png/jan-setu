import { useNavigate } from "react-router-dom";
import BottomNav from "./BottomNav";
import VoiceFab from "./VoiceFab";

export default function AppShell({ children, showNav = true, showVoiceFab = true }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-setu-bg">
      <div className="mx-auto max-w-md min-h-screen relative pb-24">
        {children}
        {showVoiceFab && <VoiceFab onClick={() => navigate("/voice-assistant")} />}
      </div>
      {showNav && <BottomNav />}
    </div>
  );
}
