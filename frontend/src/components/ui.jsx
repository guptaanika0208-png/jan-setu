export function Card({ children, className = "", onClick }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={`bg-white rounded-card shadow-card p-4 text-left w-full ${
        onClick ? "active:scale-[0.98] transition-transform" : ""
      } ${className}`}
    >
      {children}
    </Tag>
  );
}

export function PrimaryButton({ children, className = "", ...props }) {
  return (
    <button
      className={`w-full bg-setu-blue text-white font-display font-semibold py-3.5 rounded-pill shadow-card active:scale-[0.98] transition-transform disabled:opacity-50 disabled:active:scale-100 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, className = "", ...props }) {
  return (
    <button
      className={`w-full bg-setu-blue-light text-setu-blue font-display font-semibold py-3.5 rounded-pill active:scale-[0.98] transition-transform disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Badge({ children, tone = "blue" }) {
  const tones = {
    blue: "bg-setu-blue-light text-setu-blue",
    success: "bg-green-50 text-setu-success",
    warning: "bg-amber-50 text-setu-warning",
    error: "bg-red-50 text-setu-error",
    marigold: "bg-orange-50 text-setu-marigold",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-pill text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function TextField({ label, error, className = "", ...props }) {
  return (
    <label className="block mb-4">
      {label && <span className="block text-sm font-medium text-setu-ink mb-1.5">{label}</span>}
      <input
        className={`w-full rounded-2xl border border-setu-blue-light bg-white px-4 py-3.5 text-setu-ink placeholder:text-setu-slate focus:border-setu-blue outline-none ${className}`}
        {...props}
      />
      {error && <span className="block text-xs text-setu-error mt-1">{error}</span>}
    </label>
  );
}

export function SelectField({ label, error, children, className = "", ...props }) {
  return (
    <label className="block mb-4">
      {label && <span className="block text-sm font-medium text-setu-ink mb-1.5">{label}</span>}
      <select
        className={`w-full rounded-2xl border border-setu-blue-light bg-white px-4 py-3.5 text-setu-ink focus:border-setu-blue outline-none ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <span className="block text-xs text-setu-error mt-1">{error}</span>}
    </label>
  );
}
