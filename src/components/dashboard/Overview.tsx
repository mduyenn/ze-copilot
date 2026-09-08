import { useId, useState } from "react";
import { Activity, Coins, Layers, Boxes } from "lucide-react";
import {
  Cell,
  Pie,
  PieChart,
  Tooltip as RTooltip,
} from "recharts";
import type { WalletContext } from "@/lib/wallet-context";
import { usd, pct } from "@/lib/wallet-context";
import { AnimatedNumber, GradientCard, Hover3D, MetricCard, SectionTitle, StatusBadge } from "@/components/kit";
import { PoweredByZerion } from "@/components/brand/ZerionLogo";
import { ZerionDataEngine } from "./ZerionDataEngine";

function Donut({
  data,
  total,
}: {
  data: { label: string; value: number; color: string }[];
  total: number;
}) {
  const [active, setActive] = useState<number | null>(null);
  const gradId = useId();
  const activeItem = active !== null ? data[active] : null;

  return (
    <div className="grid items-center gap-5 sm:grid-cols-[190px_1fr]">
      <div className="relative mx-auto h-[190px] w-[190px]">
        <PieChart width={190} height={190}>
          <defs>
            {data.map((d, i) => (
              <linearGradient key={d.label} id={`${gradId}-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={d.color} stopOpacity={1} />
                <stop offset="100%" stopColor={d.color} stopOpacity={0.72} />
              </linearGradient>
            ))}
            <filter id={`${gradId}-shadow`} x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor={activeItem?.color ?? "#000"} floodOpacity={activeItem ? 0.45 : 0.18} />
            </filter>
          </defs>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius={56}
              outerRadius={82}
              paddingAngle={3}
              cornerRadius={6}
              stroke="var(--card)"
              strokeWidth={2}
              isAnimationActive
              animationDuration={900}
              filter={`url(#${gradId}-shadow)`}
              onMouseEnter={(_, i) => setActive(i)}
              onMouseLeave={() => setActive(null)}
            >
              {data.map((d, i) => (
                <Cell
                  key={d.label}
                  fill={`url(#${gradId}-${i})`}
                  opacity={active === null || active === i ? 1 : 0.35}
                  style={{ cursor: "pointer", transition: "opacity 200ms" }}
                />
              ))}
            </Pie>
            <RTooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 600,
                color: "var(--popover-foreground)",
                boxShadow: "0 10px 30px -10px rgba(0,0,0,0.35)",
              }}
              formatter={(v: number, n: string) => [usd(v), n]}
            />
        </PieChart>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          {activeItem ? (
            <>
              <span className="max-w-[90px] truncate text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                {activeItem.label}
              </span>
              <span className="text-lg font-bold tabular">{usd(activeItem.value)}</span>
              <span className="text-xs font-bold tabular" style={{ color: activeItem.color }}>
                {((activeItem.value / total) * 100).toFixed(1)}%
              </span>
            </>
          ) : (
            <>
              <span className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">Total</span>
              <span className="text-lg font-bold tabular">{usd(total)}</span>
            </>
          )}
        </div>
      </div>
      <ul className="space-y-1.5">
        {data.map((d, i) => (
          <li
            key={d.label}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors ${
              active === i ? "bg-muted/70" : ""
            } ${active !== null && active !== i ? "opacity-45" : ""}`}
          >
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ background: d.color, boxShadow: `0 0 8px ${d.color}80` }}
            />
            <span className="flex-1 truncate font-semibold">{d.label}</span>
            <span className="font-bold tabular">{usd(d.value)}</span>
            <span className="w-14 text-right text-xs font-bold tabular" style={{ color: d.color }}>
              {((d.value / total) * 100).toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Overview({ ctx, syncSeconds }: { ctx: WalletContext; syncSeconds: number }) {
  const positive = ctx.change24hPct >= 0;
  return (
    <div className="space-y-8">
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Hover3D>
          <GradientCard className="h-full">
            <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
              Total Portfolio
            </p>
            <p className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
              <AnimatedNumber value={ctx.totalPortfolioValue} format={(v) => usd(v)} />
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span
                className={`text-sm font-medium tabular ${positive ? "text-positive" : "text-negative"}`}
              >
                {positive ? "+" : ""}
                {usd(ctx.change24hAbs)} · {pct(ctx.change24hPct)}
              </span>
              <StatusBadge tone={ctx.isDemo ? "accent" : "positive"} pulse>
                {ctx.isDemo ? "Demo Data" : "Live Data"}
              </StatusBadge>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <PoweredByZerion />
              <span className="text-xs text-muted-foreground">
                Last sync {syncSeconds} sec ago
              </span>
            </div>
          </GradientCard>
        </Hover3D>
        <ZerionDataEngine ctx={ctx} syncSeconds={syncSeconds} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Chains" value={ctx.chains.length} icon={Layers} />
        <MetricCard label="Assets" value={ctx.assets.length} icon={Coins} />
        <MetricCard label="DeFi Positions" value={ctx.defiPositions.length} icon={Boxes} />
        <MetricCard
          label="Transactions Analyzed"
          value={ctx.transactionsAnalyzed}
          icon={Activity}
        />
      </div>

      <section>
        <SectionTitle
          title="Portfolio Intelligence"
          desc="Allocation by chain and by asset, normalized from the onchain data layer."
          right={<PoweredByZerion variant="compact" label="Data powered by Zerion API" />}
        />
        <div className="grid gap-4 lg:grid-cols-2">
          <GradientCard>
            <h3 className="mb-3 text-sm font-semibold tracking-tight">Portfolio by Chain</h3>
            <Donut
              data={ctx.chains.map((c) => ({
                label: c.name,
                value: c.value,
                color: c.color,
              }))}
              total={ctx.totalPortfolioValue}
            />
          </GradientCard>
          <GradientCard>
            <h3 className="mb-3 text-sm font-semibold tracking-tight">Portfolio by Asset</h3>
            <Donut data={ctx.portfolioDistribution} total={ctx.totalPortfolioValue} />
          </GradientCard>
        </div>
      </section>
    </div>
  );
}
