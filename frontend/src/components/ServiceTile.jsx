import { useNavigate } from "react-router-dom";

export default function ServiceTile({ icon: Icon, label, to, color = "#0B4F9E" }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className="flex flex-col items-center gap-2 bg-white rounded-card shadow-card p-4 active:scale-[0.97] transition-transform"
    >
      <div
        className="h-12 w-12 rounded-2xl flex items-center justify-center text-xl"
        style={{ backgroundColor: `${color}1A`, color }}
      >
        <Icon />
      </div>
      <span className="text-xs font-medium text-setu-ink text-center leading-tight">{label}</span>
    </button>
  );
}
