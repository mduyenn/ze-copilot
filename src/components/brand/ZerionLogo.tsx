import zerionLogo from "@/assets/zerion-logo.png.asset.json";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ZerionLogo({
  size = 18,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <img
      src={zerionLogo.url}
      alt="Zerion"
      width={size}
      height={size}
      className={cn("shrink-0 rounded-[26%] object-cover", className)}
      style={{ width: size, height: size }}
    />
  );
}

type Variant = "default" | "compact" | "minimal";

export function PoweredByZerion({
  variant = "default",
  label,
  className,
}: {
  variant?: Variant;
  label?: string;
  className?: string;
}) {
  const size = variant === "default" ? 20 : 16;
  const base = cn(
    "group inline-flex items-center gap-[7px] rounded-[9px] border border-border/70 bg-surface/60 px-2.5 py-1.5 backdrop-blur-sm transition-all duration-200",
    "hover:-translate-y-px hover:border-accent/50",
    "shadow-[0_1px_2px_oklch(0_0_0/0.05)]",
    className,
  );

  const logo = (
    <ZerionLogo
      size={size}
      className="transition-[filter] duration-200 group-hover:[filter:drop-shadow(0_0_6px_var(--glow-cyan))]"
    />
  );

  if (variant === "minimal") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn(base, "px-1.5")} aria-label="Data powered by Zerion API">
            {logo}
          </span>
        </TooltipTrigger>
        <TooltipContent>Data powered by Zerion API</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <span className={base}>
      {logo}
      <span className="text-[12px] font-medium text-muted-foreground">
        {label ?? (variant === "compact" ? "Zerion API" : "Powered by Zerion API")}
      </span>
    </span>
  );
}

export function ZerionStatus({
  connected = true,
  label,
}: {
  connected?: boolean;
  label?: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-[9px] border border-border/70 bg-surface/60 px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground backdrop-blur-sm">
      <ZerionLogo size={16} />
      <span
        className={cn(
          "size-1.5 rounded-full",
          connected ? "bg-positive" : "bg-muted-foreground",
        )}
      />
      {label ?? (connected ? "API Connected" : "API Offline")}
    </span>
  );
}
