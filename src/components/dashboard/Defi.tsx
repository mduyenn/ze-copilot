import { useState } from "react";
import type { DefiPosition, WalletContext } from "@/lib/wallet-context";
import { usd } from "@/lib/wallet-context";
import { GradientCard, Hover3D, SectionTitle, StatusBadge } from "@/components/kit";
import { PoweredByZerion, ZerionLogo } from "@/components/brand/ZerionLogo";

const CATEGORIES = [
  "All",
  "Liquidity",
  "Lending",
  "Borrowing",
  "Staking",
  "Yield",
  "Locked Assets",
] as const;

export function Defi({ ctx }: { ctx: WalletContext }) {
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("All");
  const [open, setOpen] = useState<DefiPosition | null>(null);
  const rows = ctx.defiPositions.filter((p) => cat === "All" || p.type === cat);
  const total = ctx.defiPositions.reduce((s, p) => s + Math.max(p.value, 0), 0);

  return (
    <section>
      <SectionTitle
        title="DeFi Intelligence"
        desc={`${ctx.defiPositions.length} positions · ${usd(total)} deployed across protocols.`}
        right={
          <span className="inline-flex items-center gap-[7px] rounded-[9px] border border-border/70 bg-surface/60 px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground">
            <ZerionLogo size={16} /> Discovered via Zerion API
          </span>
        }
      />

      <div className="mb-4 flex flex-wrap gap-1.5">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-all hover:-translate-y-px ${
              cat === c
                ? "border-accent/50 bg-accent/10 text-foreground"
                : "border-border/70 text-muted-foreground hover:text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((p) => (
          <Hover3D key={p.id}>
            <GradientCard
              className="h-full cursor-pointer"
              onClick={() => setOpen(open?.id === p.id ? null : p)}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-base font-semibold tracking-tight">{p.protocol}</p>
                  <p className="text-xs text-muted-foreground">{p.chain}</p>
                </div>
                <StatusBadge tone={p.value < 0 ? "negative" : "accent"}>{p.type}</StatusBadge>
              </div>
              <p className="mt-4 text-xl font-semibold tabular">{usd(p.value)}</p>
              <p className="mt-1 text-sm text-muted-foreground">{p.assets}</p>
              {p.apy ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Rate <span className="tabular text-foreground">{p.apy}%</span>
                </p>
              ) : null}
              {open?.id === p.id ? (
                <dl className="mt-4 space-y-1.5 border-t border-border/60 pt-3 text-xs">
                  {[
                    ["Protocol", p.protocol],
                    ["Position Type", p.type],
                    ["Chain", p.chain],
                    ["Underlying Assets", p.assets],
                    ["Current Value", usd(p.value)],
                    ["Metadata", p.metadata],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="text-right font-medium">{v}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </GradientCard>
          </Hover3D>
        ))}
      </div>

      <div className="mt-4">
        <PoweredByZerion />
      </div>
    </section>
  );
}
