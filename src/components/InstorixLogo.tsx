/**
 * InstorixLogo — custom Instorix brand mark.
 * Design: Bold "Ix" monogram with a download arrow — clearly NOT the Instagram camera.
 * Works at all sizes including 16px favicon.
 */
export default function InstorixLogo({
  variant = "icon",
  size = 32,
  className = "",
}: {
  variant?: "icon" | "full";
  size?: number;
  className?: string;
}) {
  const radius = Math.round(size * 0.22); // ~22% of size for rounded corners

  const icon = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={variant === "icon" ? className : "shrink-0"}
      aria-label="Instorix logo"
    >
      <defs>
        <linearGradient id="instorix-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F77737" />
          <stop offset="50%" stopColor="#E1306C" />
          <stop offset="100%" stopColor="#833AB4" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="100" height="100" rx={radius * (100 / size)} fill="url(#instorix-grad)" />

      {/* Bold "I" — top serif bar */}
      <rect x="30" y="20" width="40" height="10" rx="5" fill="white" />
      {/* "I" stem */}
      <rect x="43" y="20" width="14" height="42" rx="4" fill="white" />

      {/* Download arrow: shaft */}
      <rect x="43" y="58" width="14" height="12" rx="3" fill="white" opacity="0.9" />
      {/* Download arrow: chevron head */}
      <path
        d="M25 68 L50 88 L75 68"
        stroke="white"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );

  if (variant === "icon") return icon;

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {icon}
      <span
        style={{ fontSize: Math.round(size * 0.65), lineHeight: 1 }}
        className="font-extrabold tracking-tight text-gray-900"
      >
        Instorix
      </span>
    </span>
  );
}
