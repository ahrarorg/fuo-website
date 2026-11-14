export function AoMark({
  size = 40,
  className = "",
  draw = false,
}: {
  size?: number;
  className?: string;
  draw?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle
        cx="32"
        cy="32"
        r="22"
        stroke="#e8b84b"
        strokeWidth="2.5"
        pathLength={1}
        className={draw ? "loader-ring" : undefined}
      />
      <path
        d="M22 44 L32 18 L42 44"
        stroke="#e8b84b"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        className={draw ? "loader-a" : undefined}
      />
      <path
        d="M26 36 Q32 32.5 38 36"
        stroke="#ffd98a"
        strokeWidth="2.5"
        strokeLinecap="round"
        pathLength={1}
        className={draw ? "loader-bar" : undefined}
      />
      <circle cx="32" cy="18" r="2.4" fill="#ffd98a" className={draw ? "loader-dot" : undefined} />
    </svg>
  );
}