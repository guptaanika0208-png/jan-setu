export function ProgressBar({ value, max = 100, className = "" }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className={`h-2.5 w-full bg-setu-blue-light rounded-pill overflow-hidden ${className}`}>
      <div
        className="h-full bg-setu-blue rounded-pill transition-all duration-500"
        style={{ width: `${pct}%` }}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}

export function StepIndicator({ current, total }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-pill ${i <= current ? "bg-setu-blue" : "bg-setu-blue-light"}`}
        />
      ))}
    </div>
  );
}
