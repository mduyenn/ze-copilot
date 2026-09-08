import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function GradientCard({
  className,
  children,
  hover = true,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { hover?: boolean }) {
  return (
    <div
      className={cn("ze-panel p-5", hover && "ze-panel-hover", className)}
      {...rest}
    >
      {children}
    </div>
  );
}

export function Hover3D({
  children,
  className,
  intensity = 2,
}: {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  const isCoarse =
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches;

  return (
    <div
      ref={ref}
      className={cn("transition-transform duration-200 will-change-transform", className)}
      style={style}
      onMouseMove={(e) => {
        if (isCoarse || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        setStyle({
          transform: `perspective(900px) rotateY(${px * intensity}deg) rotateX(${-py * intensity}deg) translateY(-2px) scale(1.01)`,
        });
      }}
      onMouseLeave={() => setStyle({})}
    >
      {children}
    </div>
  );
}

export function StatusBadge({
  tone = "neutral",
  children,
  pulse = false,
}: {
  tone?: "neutral" | "positive" | "negative" | "accent";
  children: React.ReactNode;
  pulse?: boolean;
}) {
  const tones = {
    neutral: "text-muted-foreground border-border/70 bg-surface/60",
    positive: "text-positive border-positive/30 bg-positive/10",
    negative: "text-negative border-negative/30 bg-negative/10",
    accent: "text-accent border-accent/30 bg-accent/10",
  } as const;
  const dot = {
    neutral: "bg-muted-foreground",
    positive: "bg-positive",
    negative: "bg-negative",
    accent: "bg-accent",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-wide uppercase",
        tones[tone],
      )}
    >
      <span className={cn("size-1.5 rounded-full", dot[tone], pulse && "animate-pulse")} />
      {children}
    </span>
  );
}

export function AnimatedNumber({
  value,
  format = (v: number) => v.toFixed(2),
  className,
}: {
  value: number;
  format?: (v: number) => string;
  className?: string;
}) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setDisplay(value);
      prev.current = value;
      return;
    }
    const from = prev.current;
    const start = performance.now();
    const dur = 700;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min((t - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (value - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else prev.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <span className={cn("tabular", className)}>{format(display)}</span>;
}

export function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Hover3D>
      <GradientCard className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
            {label}
          </p>
          {Icon ? <Icon className="size-4 text-accent" /> : null}
        </div>
        <p className="mt-2 text-2xl font-semibold tracking-tight tabular">{value}</p>
        {sub ? <p className="mt-1 text-xs text-muted-foreground">{sub}</p> : null}
      </GradientCard>
    </Hover3D>
  );
}

export function DataFreshness({
  seconds,
  onRefresh,
  refreshing,
}: {
  seconds: number;
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <span>Updated {seconds} sec ago</span>
      {onRefresh ? (
        <button
          type="button"
          onClick={onRefresh}
          className="rounded-md border border-border/70 px-2 py-1 font-medium transition-colors hover:border-accent/50 hover:text-foreground"
        >
          {refreshing ? "Refreshing…" : "Refresh Data"}
        </button>
      ) : null}
    </div>
  );
}

export function SectionTitle({
  title,
  desc,
  right,
}: {
  title: string;
  desc?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold tracking-tight sm:text-xl">{title}</h2>
        {desc ? <p className="mt-0.5 text-sm text-muted-foreground">{desc}</p> : null}
      </div>
      {right}
    </div>
  );
}
