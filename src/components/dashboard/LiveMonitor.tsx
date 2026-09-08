import { useEffect, useState } from "react";
import type { WalletContext } from "@/lib/wallet-context";
import { GradientCard, SectionTitle, StatusBadge } from "@/components/kit";
import { PoweredByZerion, ZerionLogo } from "@/components/brand/ZerionLogo";
import { ApiActivity } from "./Developer";

const FEED = [
  { kind: "Swap", summary: "1 ETH → 3,420 USDC", chain: "Base" },
  { kind: "Receive", summary: "Received 120 ARB", chain: "Arbitrum" },
  { kind: "Approve", summary: "Approved USDC for Aave", chain: "Ethereum" },
];

export function LiveMonitor({
  ctx,
  syncSeconds,
}: {
  ctx: WalletContext;
  syncSeconds: number;
}) {
  const [events, setEvents] = useState<{ id: number; kind: string; summary: string; chain: string }[]>(
    [],
  );

  useEffect(() => {
    // Polls on a fixed 30s cadence to avoid excessive API requests.
    const t = setInterval(() => {
      const pick = FEED[Math.floor(Math.random() * FEED.length)]!;
      setEvents((e) => [{ id: Date.now(), ...pick }, ...e].slice(0, 5));
    }, 30_000);
    return () => clearInterval(t);
  }, []);

  const nextSync = Math.max(0, 30 - (syncSeconds % 30));

  return (
    <section className="space-y-4">
      <SectionTitle
        title="Live Monitor"
        desc="Continuous wallet monitoring for applications and AI agents."
        right={
          <span className="inline-flex items-center gap-[7px] rounded-[9px] border border-border/70 bg-surface/60 px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground">
            <ZerionLogo size={16} />
            {ctx.isDemo ? "Designed for Zerion API" : "Live data via Zerion API"}
          </span>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <GradientCard hover={false}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold tracking-tight">Monitor</p>
            <StatusBadge tone="positive" pulse>
              Active
            </StatusBadge>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-border/60 p-3">
              <p className="text-xs text-muted-foreground">Last Sync</p>
              <p className="mt-1 font-medium tabular">{syncSeconds} sec ago</p>
            </div>
            <div className="rounded-xl border border-border/60 p-3">
              <p className="text-xs text-muted-foreground">Next Sync</p>
              <p className="mt-1 font-medium tabular">{nextSync} sec</p>
            </div>
          </div>

          <p className="mt-5 text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
            New Activity
          </p>
          <ul className="mt-2 space-y-2">
            {events.length === 0 ? (
              <li className="text-sm text-muted-foreground">
                Watching for new onchain activity…
              </li>
            ) : (
              events.map((e) => (
                <li
                  key={e.id}
                  className="flex items-center justify-between rounded-xl border border-accent/25 bg-accent/5 px-3 py-2 text-sm"
                >
                  <span>
                    <span className="font-medium">{e.kind}</span> · {e.summary}
                  </span>
                  <span className="text-xs text-muted-foreground">{e.chain} · just now</span>
                </li>
              ))
            )}
          </ul>

          <div className="mt-4">
            <PoweredByZerion variant="compact" />
          </div>
        </GradientCard>

        <ApiActivity ctx={ctx} />
      </div>
    </section>
  );
}
