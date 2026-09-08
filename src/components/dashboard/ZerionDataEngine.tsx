import type { WalletContext } from "@/lib/wallet-context";
import { GradientCard, StatusBadge } from "@/components/kit";
import { PoweredByZerion, ZerionLogo } from "@/components/brand/ZerionLogo";

export function ZerionDataEngine({
  ctx,
  syncSeconds,
}: {
  ctx: WalletContext;
  syncSeconds: number;
}) {
  const rows = [
    ["Last Sync", `${syncSeconds} sec ago`],
    ["Chains Scanned", String(ctx.chains.length)],
    ["Assets Returned", String(ctx.assets.length)],
    ["DeFi Positions", String(ctx.defiPositions.length)],
    ["Transactions", String(ctx.transactionsAnalyzed)],
  ] as const;

  return (
    <GradientCard className="h-full">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <ZerionLogo size={22} className="rounded-lg" />
          <div>
            <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
              Zerion Data Engine
            </p>
            <p className="text-sm font-semibold tracking-tight">Onchain Data Layer</p>
          </div>
        </div>
        <StatusBadge tone={ctx.isDemo ? "accent" : "positive"} pulse>
          {ctx.isDemo ? "Demo" : "Connected"}
        </StatusBadge>
      </div>

      <dl className="mt-4 divide-y divide-border/60">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between py-2 text-sm">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="font-medium tabular">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4">
        <PoweredByZerion variant="compact" />
      </div>
    </GradientCard>
  );
}
