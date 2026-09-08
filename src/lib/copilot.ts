import type { WalletContext } from "./wallet-context";
import { usd, pct } from "./wallet-context";

export const SUGGESTED_PROMPTS = [
  "Summarize this wallet",
  "Where is most of the portfolio?",
  "Show my DeFi positions",
  "What changed in the last 24 hours?",
  "What are my largest assets?",
  "Which chain is used most?",
  "Summarize recent activity",
  "Find my largest recent transaction",
  "How diversified is this portfolio?",
];

/**
 * Deterministic, grounded answers. Every statement is derived from the
 * normalized WalletContext. The Copilot never invents wallet data.
 */
export function answer(q: string, ctx: WalletContext): string {
  const query = q.toLowerCase();
  const topChain = [...ctx.chains].sort((a, b) => b.value - a.value)[0]!;
  const topAssets = [...ctx.assets].sort((a, b) => b.value - a.value);
  const defiTotal = ctx.defiPositions.reduce((s, p) => s + Math.max(p.value, 0), 0);

  if (query.includes("diversif")) {
    const top3 = topAssets.slice(0, 3).reduce((s, a) => s + a.value, 0);
    const share = (top3 / ctx.totalPortfolioValue) * 100;
    return `The top 3 assets (${topAssets
      .slice(0, 3)
      .map((a) => a.symbol)
      .join(", ")}) represent ${share.toFixed(1)}% of ${usd(
      ctx.totalPortfolioValue,
    )}. Value is spread across ${ctx.chains.length} chains and ${ctx.assets.length} assets, with ${
      ctx.defiPositions.length
    } DeFi positions. ${share > 70 ? "Concentration is high" : "Diversification is moderate"}.`;
  }
  if (query.includes("chain")) {
    return `${topChain.name} holds the largest share at ${usd(topChain.value)} (${topChain.percentage.toFixed(
      1,
    )}% of the portfolio). Activity is spread across ${ctx.chains
      .map((c) => c.name)
      .join(", ")}.`;
  }
  if (query.includes("defi") || query.includes("position")) {
    return `${ctx.defiPositions.length} DeFi positions worth ${usd(defiTotal)} were discovered: ${ctx.defiPositions
      .map((p) => `${p.protocol} (${p.type}, ${p.chain}, ${usd(p.value)})`)
      .join("; ")}.`;
  }
  if (query.includes("24") || query.includes("chang")) {
    const recent = ctx.transactions.filter((t) => t.minutesAgo <= 1440);
    return `Portfolio value moved ${pct(ctx.change24hPct)} (${usd(ctx.change24hAbs)}) in the last 24 hours. ${
      recent.length
    } transactions were recorded, including ${recent
      .slice(0, 2)
      .map((t) => `${t.kind.toLowerCase()} ${t.summary}`)
      .join(" and ")}.`;
  }
  if (query.includes("largest") && query.includes("transaction")) {
    const t = [...ctx.transactions].sort((a, b) => b.value - a.value)[0]!;
    return `The largest recent transaction is a ${t.kind.toLowerCase()}: ${t.summary} on ${t.chain}, valued at ${usd(
      t.value,
    )} (${t.ago}).`;
  }
  if (query.includes("asset") || query.includes("largest") || query.includes("holding")) {
    return `Largest holdings: ${topAssets
      .slice(0, 4)
      .map(
        (a) =>
          `${a.symbol} ${usd(a.value)} (${((a.value / ctx.totalPortfolioValue) * 100).toFixed(1)}%, ${a.chain})`,
      )
      .join(", ")}.`;
  }
  if (query.includes("activity") || query.includes("recent")) {
    return `${ctx.recentActivity} ${ctx.transactionsAnalyzed} transactions were analyzed in total. The most recent is a ${ctx.transactions[0]!.kind.toLowerCase()}: ${ctx.transactions[0]!.summary} (${ctx.transactions[0]!.ago}).`;
  }
  if (query.includes("most of the portfolio") || query.includes("where")) {
    return `Approximately ${topChain.percentage.toFixed(0)}% of this wallet's portfolio is currently held on ${
      topChain.name
    } (${usd(topChain.value)}), followed by ${ctx.chains[1]!.name} at ${ctx.chains[1]!.percentage.toFixed(0)}%.`;
  }
  return `This wallet holds ${usd(ctx.totalPortfolioValue)} across ${ctx.chains.length} chains and ${
    ctx.assets.length
  } assets, with ${ctx.defiPositions.length} DeFi positions worth ${usd(defiTotal)}. 24h change: ${pct(
    ctx.change24hPct,
  )}. ${ctx.recentActivity}`;
}
