import { useMemo, useState } from "react";
import { ArrowUpDown, Search } from "lucide-react";
import type { WalletContext } from "@/lib/wallet-context";
import { usd, pct } from "@/lib/wallet-context";
import { GradientCard, SectionTitle } from "@/components/kit";
import { PoweredByZerion } from "@/components/brand/ZerionLogo";
import { Input } from "@/components/ui/input";
import { TokenIcon } from "@/components/dashboard/TokenIcon";

type SortKey = "value" | "balance" | "price" | "change24h";

export function AssetsTable({ ctx }: { ctx: WalletContext }) {
  const [q, setQ] = useState("");
  const [chain, setChain] = useState("All");
  const [sort, setSort] = useState<SortKey>("value");

  const chains = ["All", ...ctx.chains.map((c) => c.name)];

  const rows = useMemo(() => {
    return ctx.assets
      .filter(
        (a) =>
          (chain === "All" || a.chain === chain) &&
          (a.symbol.toLowerCase().includes(q.toLowerCase()) ||
            a.name.toLowerCase().includes(q.toLowerCase())),
      )
      .sort((a, b) => b[sort] - a[sort]);
  }, [ctx.assets, q, chain, sort]);

  return (
    <section>
      <SectionTitle
        title="Assets"
        desc={`${ctx.assets.length} assets across ${ctx.chains.length} chains.`}
        right={<PoweredByZerion variant="compact" />}
      />
      <GradientCard hover={false} className="p-0">
        <div className="flex flex-wrap items-center gap-3 border-b border-border/60 p-4">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search assets"
              aria-label="Search assets"
              className="h-9 pl-8 text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {chains.map((c) => (
              <button
                key={c}
                onClick={() => setChain(c)}
                className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-all hover:-translate-y-px ${
                  chain === c
                    ? "border-accent/50 bg-accent/10 text-foreground"
                    : "border-border/70 text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <button
            onClick={() =>
              setSort((s) =>
                s === "value" ? "change24h" : s === "change24h" ? "balance" : "value",
              )
            }
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowUpDown className="size-3" /> Sort: {sort}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] tracking-[0.1em] text-muted-foreground uppercase">
                <th className="px-4 py-3 text-left font-medium">Asset</th>
                <th className="px-4 py-3 text-right font-medium">Balance</th>
                <th className="px-4 py-3 text-right font-medium">Price</th>
                <th className="px-4 py-3 text-right font-medium">Value</th>
                <th className="px-4 py-3 text-right font-medium">24h</th>
                <th className="px-4 py-3 text-left font-medium">Chain</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr
                  key={a.id}
                  className="border-t border-border/50 transition-colors hover:bg-accent/5"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <TokenIcon symbol={a.symbol} iconUrl={a.iconUrl} />
                      <div>
                        <p className="font-medium">{a.symbol}</p>
                        <p className="text-xs text-muted-foreground">{a.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right tabular">{a.balance.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular">{usd(a.price, a.price < 1 ? 4 : 2)}</td>
                  <td className="px-4 py-3 text-right font-medium tabular">{usd(a.value)}</td>
                  <td
                    className={`px-4 py-3 text-right tabular ${
                      a.change24h >= 0 ? "text-positive" : "text-negative"
                    }`}
                  >
                    {pct(a.change24h)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{a.chain}</td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    No assets match this filter.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="border-t border-border/60 p-4">
          <PoweredByZerion />
        </div>
      </GradientCard>
    </section>
  );
}
