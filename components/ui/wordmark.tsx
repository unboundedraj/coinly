import { cn } from "@/lib/utils";

const sizes = {
  sm: { coin: "h-7 w-7", text: "text-2xl" },
  md: { coin: "h-9 w-9", text: "text-3xl" },
  lg: { coin: "h-14 w-14 sm:h-16 sm:w-16", text: "text-5xl sm:text-6xl" },
};

/** Coin disc + cursive "Coinly" lockup carried over from the original Coinly identity. */
export function Wordmark({ size = "md", className = "", coinOnly = false }: { size?: keyof typeof sizes; className?: string; coinOnly?: boolean }) {
  const scale = sizes[size];
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg viewBox="0 0 40 40" aria-hidden="true" className={cn("shrink-0 drop-shadow-[0_0_10px_rgba(251,191,36,0.35)]", scale.coin)}>
        <defs>
          <linearGradient id="coinly-coin" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="55%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>
        <circle cx="20" cy="20" r="19" fill="url(#coinly-coin)" />
        <circle cx="20" cy="20" r="15" fill="none" stroke="rgba(120,53,15,0.35)" strokeWidth="1.5" />
        <path d="M25 14.5a7.5 7.5 0 1 0 0 11" fill="none" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
      </svg>
      {!coinOnly && (
        <span className={cn("font-display bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text leading-none font-bold tracking-tight text-transparent", scale.text)}>
          Coinly
        </span>
      )}
    </span>
  );
}
