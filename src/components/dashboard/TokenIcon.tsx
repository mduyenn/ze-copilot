import { useState } from "react";

type Props = {
  symbol: string;
  iconUrl?: string | undefined;
  size?: number;
  className?: string;
};

/**
 * Token logo sourced from the Zerion data layer.
 * Falls back to a symbol monogram when no official logo exists.
 */
export function TokenIcon({ symbol, iconUrl, size = 32, className = "" }: Props) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(iconUrl) && !failed;

  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border/70 bg-surface text-[11px] font-semibold transition-transform hover:scale-105 ${className}`}
      style={{ width: size, height: size }}
    >
      {showImage ? (
        <img
          src={iconUrl}
          alt={`${symbol} logo`}
          width={size}
          height={size}
          loading="lazy"
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        symbol.slice(0, 3)
      )}
    </span>
  );
}
