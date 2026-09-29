import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaBell } from "react-icons/fa";

export default function TopBar({ title, showBack = false, onBellClick, rightSlot, dark = false }) {
  const navigate = useNavigate();

  return (
    <header
      className={`sticky top-0 z-30 backdrop-blur px-5 pt-5 pb-3 flex items-center justify-between ${
        dark ? "bg-transparent" : "bg-setu-bg/95"
      }`}
    >
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className={`h-9 w-9 rounded-full flex items-center justify-center ${
              dark ? "bg-white/15 text-white" : "bg-white shadow-card text-setu-blue"
            }`}
          >
            <FaArrowLeft />
          </button>
        )}
        <h1 className={`font-display font-semibold text-xl ${dark ? "text-white" : "text-setu-ink"}`}>{title}</h1>
      </div>
      {rightSlot ??
        (onBellClick && (
          <button
            onClick={onBellClick}
            aria-label="Notifications"
            className="h-10 w-10 rounded-full bg-white shadow-card flex items-center justify-center text-setu-blue relative"
          >
            <FaBell />
          </button>
        ))}
    </header>
  );
}
