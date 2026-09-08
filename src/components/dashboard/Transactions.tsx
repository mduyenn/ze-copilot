import { useState } from "react";
import type { TxKind, WalletContext } from "@/lib/wallet-context";
import { usd } from "@/lib/wallet-context";
import { GradientCard, Hover3D, SectionTitle, StatusBadge } from "@/components/kit";
import { PoweredByZerion, ZerionLogo } from "@/components/brand/ZerionLogo";
import { ZELogo } from "@/components/brand/ZELogo";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  BadgeCheck,
  Box,
  Lock,
  Repeat,
  Sparkles,
  Unlock,
} from "lucide-react";

const ICONS: Record<TxKind, React.ComponentType<{ className?: string }>> = {
  Swap: Repeat,
  Send: ArrowUpRight,
  Receive: ArrowDownLeft,
  Bridge: ArrowLeftRight,
  Approve: BadgeCheck,
  Mint: Sparkles,
  Stake: Lock,
  Unstake: Unlock,
  "Contract Interaction": Box,
};

const KINDS: ("All" | TxKind)[] = [
  "All",
  "Swap",
  "Send",
  "Receive",
  "Bridge",
  "Approve",
  "Mint",
  "Stake",
  "Unstake",
  "Contract Interaction",
];

export function Transactions({ ctx }: { ctx: WalletContext }) {
  const [kind, setKind] = useState<"All" | TxKind>("All");
  const rows = ctx.transactions.filter((t) => kind === "All" || t.kind === kind);

  return (
    <section>
      <SectionTitle
        title="Transaction Intelligence"
        desc="Raw onchain activity translated into readable actions."
        right={<PoweredByZerion variant="compact" />}
      />

      <GradientCard hover={false} className="mb-4">
        <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
          Wallet Activity Summary
        </p>
        <p className="mt-2 text-sm">{ctx.recentActivity}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-[7px]">
            <ZerionLogo size={16} /> Source data: Zerion API
          </span>
          <span className="inline-flex items-center gap-[7px]">
            <ZELogo size={16} /> AI interpretation by ZE Copilot
          </span>
        </div>
      </GradientCard>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {KINDS.map((k) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-all hover:-translate-y-px ${
              kind === k
                ? "border-accent/50 bg-accent/10 text-foreground"
                : "border-border/70 text-muted-foreground hover:text-foreground"
            }`}
          >
            {k}
          </button>
        ))}
      </div>

      <div className="space-y-2.5">
        {rows.map((t) => {
          const Icon = ICONS[t.kind];
          return (
            <Hover3D key={t.id} intensity={1}>
              <GradientCard className="flex flex-wrap items-center gap-4 p-4">
                <span className="flex size-9 items-center justify-center rounded-xl border border-border/70 bg-surface">
                  <Icon className="size-4 text-accent" />
                </span>
                <div className="min-w-[180px] flex-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge tone="neutral">{t.kind}</StatusBadge>
                    <span className="text-xs text-muted-foreground">{t.chain}</span>
                  </div>
                  <p className="mt-1.5 text-sm font-medium">{t.summary}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold tabular">
                    {t.value > 0 ? usd(t.value) : "Not available"}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.ago}</p>
                </div>
              </GradientCard>
            </Hover3D>
          );
        })}
      </div>

      <div className="mt-4">
        <PoweredByZerion />
      </div>
    </section>
  );
}
