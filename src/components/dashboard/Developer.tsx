import { ArrowRight, Infinity as InfinityIcon } from "lucide-react";
import type { WalletContext } from "@/lib/wallet-context";
import type { AnalyzeResult } from "@/lib/zerion.functions";
import { GradientCard, SectionTitle, StatusBadge } from "@/components/kit";
import { PoweredByZerion, ZerionLogo } from "@/components/brand/ZerionLogo";
import { ZELogo } from "@/components/brand/ZELogo";

function FlowNode({
  logo,
  title,
  sub,
}: {
  logo: React.ReactNode;
  title: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      {logo}
      <p className="text-sm font-semibold tracking-tight">{title}</p>
      {sub ? (
        <p className="text-[11px] tracking-[0.12em] text-muted-foreground uppercase">{sub}</p>
      ) : null}
    </div>
  );
}

export function ApiInspector({
  ctx,
  apiCall,
}: {
  ctx: WalletContext;
  apiCall: AnalyzeResult["apiCall"];
}) {
  const sanitized = {
    resource: apiCall.resource,
    address: ctx.address,
    meta: {
      chains: ctx.chains.length,
      assets: ctx.assets.length,
      defi_positions: ctx.defiPositions.length,
      transactions_analyzed: ctx.transactionsAnalyzed,
    },
    sample_position: {
      symbol: ctx.assets[0]?.symbol,
      chain: ctx.assets[0]?.chain,
      quantity: ctx.assets[0]?.balance,
      value: ctx.assets[0]?.value,
    },
    source: apiCall.source,
  };

  return (
    <GradientCard hover={false}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <ZerionLogo size={22} className="rounded-lg" />
          <p className="text-sm font-semibold tracking-tight">Zerion API Inspector</p>
        </div>
        <StatusBadge tone={ctx.isDemo ? "accent" : "positive"}>
          {ctx.isDemo ? "Demo Data" : "Live"}
        </StatusBadge>
      </div>

      <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        {[
          ["Resource", apiCall.resource],
          ["Status", apiCall.statusText],
          ["Response Time", `${apiCall.responseTimeMs} ms`],
          ["Records", String(apiCall.records)],
          ["Last Request", new Date(apiCall.at).toLocaleTimeString()],
          ["Source", apiCall.source],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 border-b border-border/50 py-1.5">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="font-medium tabular">{v}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 mb-2 text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
        Sanitized response preview
      </p>
      <pre className="max-h-64 overflow-auto rounded-xl border border-border/60 bg-background/60 p-3 font-mono text-[11.5px] leading-relaxed">
        {JSON.stringify(sanitized, null, 2)}
      </pre>
      <p className="mt-2 text-[11px] text-muted-foreground">
        API keys, authorization headers and environment secrets are never sent to the browser.
      </p>
      <div className="mt-4">
        <PoweredByZerion />
      </div>
    </GradientCard>
  );
}

export function ApiActivity({ ctx }: { ctx: WalletContext }) {
  const now = new Date();
  const t = (offset: number) =>
    new Date(now.getTime() - offset * 1000).toLocaleTimeString("en-GB", { hour12: false });
  const lines = [
    [t(0), "Portfolio updated"],
    [t(1), `${ctx.assets.length} assets received`],
    [t(2), `${ctx.defiPositions.length} positions discovered`],
    [t(3), `${ctx.transactionsAnalyzed} transactions analyzed`],
    [t(4), `${ctx.chains.length} chains scanned`],
    [t(5), "Wallet context normalized"],
  ];
  return (
    <GradientCard hover={false}>
      <div className="flex items-center gap-2.5">
        <ZerionLogo size={20} className="rounded-lg" />
        <p className="text-sm font-semibold tracking-tight">API Activity</p>
      </div>
      <ul className="mt-3 space-y-1 font-mono text-[12px]">
        {lines.map(([time, msg]) => (
          <li key={msg} className="flex gap-3 border-b border-border/40 py-1.5">
            <span className="text-muted-foreground">{time}</span>
            <span>{msg}</span>
          </li>
        ))}
      </ul>
    </GradientCard>
  );
}

export function Overages() {
  return (
    <GradientCard hover={false}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <InfinityIcon className="size-5 text-accent-secondary" />
          <p className="text-sm font-semibold tracking-tight">
            Continuous Data: Zerion API Overages
          </p>
        </div>
        <StatusBadge tone="accent">Informational</StatusBadge>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        When included API usage reaches its limit, Overages can allow additional API requests
        to continue according to configured billing and spending limits.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        {["API Quota", "Limit Reached", "Overages", "Requests Continue", "ZE Copilot stays online"].map(
          (s, i, arr) => (
            <span key={s} className="flex items-center gap-2">
              <span className="rounded-lg border border-border/70 bg-surface/60 px-2.5 py-1.5 font-medium">
                {s}
              </span>
              {i < arr.length - 1 ? (
                <ArrowRight className="size-3 text-muted-foreground" />
              ) : null}
            </span>
          ),
        )}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Designed for applications and AI Agents that require continuous access to onchain data.
        Live billing and quota figures are not displayed unless provided by the account.
      </p>
      <div className="mt-4">
        <PoweredByZerion variant="compact" />
      </div>
    </GradientCard>
  );
}

export function DeveloperMode({
  ctx,
  apiCall,
}: {
  ctx: WalletContext;
  apiCall: AnalyzeResult["apiCall"];
}) {
  return (
    <section className="space-y-4">
      <SectionTitle
        title="Developer Mode"
        desc="See exactly how the onchain data layer powers the intelligence layer."
        right={<PoweredByZerion variant="compact" />}
      />

      <GradientCard hover={false} className="p-8">
        <div className="grid items-center gap-6 text-center sm:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]">
          <FlowNode
            logo={<ZerionLogo size={38} className="rounded-xl" />}
            title="Zerion API"
            sub="Data Layer"
          />
          <ArrowRight className="mx-auto size-4 rotate-90 text-muted-foreground sm:rotate-0" />
          <FlowNode logo={<div className="text-2xl">⛓</div>} title="Onchain Data" sub="Normalized" />
          <ArrowRight className="mx-auto size-4 rotate-90 text-muted-foreground sm:rotate-0" />
          <FlowNode logo={<ZELogo size={38} />} title="ZE Copilot" sub="Intelligence Layer" />
          <ArrowRight className="mx-auto size-4 rotate-90 text-muted-foreground sm:rotate-0" />
          <FlowNode logo={<div className="text-2xl">✦</div>} title="AI Intelligence" sub="User / Agent" />
        </div>
      </GradientCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <ApiInspector ctx={ctx} apiCall={apiCall} />
        <div className="space-y-4">
          <ApiActivity ctx={ctx} />
          <Overages />
        </div>
      </div>
    </section>
  );
}
