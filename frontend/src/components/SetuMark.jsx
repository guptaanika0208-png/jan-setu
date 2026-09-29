/**
 * SetuMark - the signature visual motif of Jan Setu: an arched bridge
 * connecting a citizen to a government building, rendered as a single
 * clean line-art mark. Used on the splash screen, auth screens, and
 * empty states so the "bridge to benefits" idea recurs as a visual
 * thread through the whole app rather than a one-off logo.
 */
export default function SetuMark({ className = "h-16 w-16", strokeColor = "#0B4F9E" }) {
  return (
    <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Bridge arch */}
      <path
        d="M10 62 C 10 30, 110 30, 110 62"
        stroke={strokeColor}
        strokeWidth="5"
        strokeLinecap="round"
      />
      {/* Bridge deck */}
      <line x1="4" y1="62" x2="116" y2="62" stroke={strokeColor} strokeWidth="5" strokeLinecap="round" />
      {/* Support pylons */}
      <line x1="35" y1="62" x2="35" y2="46" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" />
      <line x1="60" y1="62" x2="60" y2="38" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" />
      <line x1="85" y1="62" x2="85" y2="46" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" />
      {/* Citizen figure, left */}
      <circle cx="16" cy="66" r="4" fill="#F0A202" />
      {/* Government building, right (simple pillars + pediment) */}
      <path d="M100 70 L104 63 L108 70 Z" fill="#F0A202" />
      <line x1="100" y1="70" x2="100" y2="76" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
      <line x1="104" y1="70" x2="104" y2="76" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
      <line x1="108" y1="70" x2="108" y2="76" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
