import type { WalletContext } from "./wallet-context";

const chainColors: Record<string, string> = {
  Ethereum: "var(--chart-1)",
  Base: "var(--chart-2)",
  Arbitrum: "var(--chart-3)",
  Optimism: "var(--chart-4)",
  Polygon: "var(--chart-5)",
};

export const DEMO_ADDRESS = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";

export function buildDemoContext(address = DEMO_ADDRESS): WalletContext {
  const total = 24820.42;
  const chains = [
    { name: "Ethereum", value: 10424.58 },
    { name: "Base", value: 5462.49 },
    { name: "Arbitrum", value: 4219.47 },
    { name: "Optimism", value: 2730.25 },
    { name: "Polygon", value: 1983.63 },
  ].map((c) => ({
    id: c.name.toLowerCase(),
    name: c.name,
    value: c.value,
    percentage: (c.value / total) * 100,
    color: chainColors[c.name] ?? "var(--chart-5)",
  }));

  const assets = [
    {
      symbol: "ETH",
      name: "Ethereum",
      balance: 2.42,
      price: 3420,
      change24h: 2.1,
      chain: "Ethereum",
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      balance: 5240.11,
      price: 1,
      change24h: 0.01,
      chain: "Base",
    },
    {
      symbol: "WBTC",
      name: "Wrapped Bitcoin",
      balance: 0.062,
      price: 68420,
      change24h: -0.84,
      chain: "Ethereum",
    },
    {
      symbol: "ARB",
      name: "Arbitrum",
      balance: 2140,
      price: 0.94,
      change24h: 3.42,
      chain: "Arbitrum",
    },
    {
      symbol: "OP",
      name: "Optimism",
      balance: 980,
      price: 1.62,
      change24h: -1.2,
      chain: "Optimism",
    },
    {
      symbol: "MATIC",
      name: "Polygon",
      balance: 3120,
      price: 0.51,
      change24h: 0.62,
      chain: "Polygon",
    },
    {
      symbol: "LINK",
      name: "Chainlink",
      balance: 84.2,
      price: 14.9,
      change24h: 1.05,
      chain: "Ethereum",
    },
    {
      symbol: "AERO",
      name: "Aerodrome",
      balance: 1420,
      price: 0.78,
      change24h: 5.4,
      chain: "Base",
    },
  ].map((a, i) => ({
    id: `${a.symbol}-${i}`,
    ...a,
    value: a.balance * a.price,
  }));

  const defiPositions = [
    {
      id: "aave-eth",
      protocol: "Aave",
      type: "Lending" as const,
      chain: "Ethereum",
      assets: "3.2 ETH",
      value: 10944,
      apy: 2.4,
      metadata: "Supplied collateral · Health factor 2.4",
    },
    {
      id: "aave-borrow",
      protocol: "Aave",
      type: "Borrowing" as const,
      chain: "Ethereum",
      assets: "2,400 USDC",
      value: -2400,
      apy: 5.1,
      metadata: "Variable rate debt position",
    },
    {
      id: "uni-v3",
      protocol: "Uniswap v3",
      type: "Liquidity" as const,
      chain: "Base",
      assets: "ETH / USDC",
      value: 4218.5,
      apy: 18.7,
      metadata: "Concentrated range 2,900 to 3,900",
    },
    {
      id: "lido",
      protocol: "Lido",
      type: "Staking" as const,
      chain: "Ethereum",
      assets: "1.05 stETH",
      value: 3591,
      apy: 3.2,
      metadata: "Liquid staking derivative",
    },
    {
      id: "aerodrome",
      protocol: "Aerodrome",
      type: "Yield" as const,
      chain: "Base",
      assets: "AERO / USDC gauge",
      value: 1842.3,
      apy: 24.5,
      metadata: "Gauge rewards accruing",
    },
    {
      id: "gmx",
      protocol: "GMX",
      type: "Locked Assets" as const,
      chain: "Arbitrum",
      assets: "620 esGMX",
      value: 1284.9,
      metadata: "Vesting until Q4",
    },
  ];

  const transactions = [
    {
      id: "t1",
      kind: "Swap" as const,
      summary: "1.2 ETH → 4,120 USDC",
      chain: "Base",
      ago: "2 hours ago",
      minutesAgo: 120,
      value: 4105,
    },
    {
      id: "t2",
      kind: "Bridge" as const,
      summary: "2,000 USDC Ethereum → Base",
      chain: "Base",
      ago: "6 hours ago",
      minutesAgo: 360,
      value: 2000,
    },
    {
      id: "t3",
      kind: "Stake" as const,
      summary: "Staked 1.05 ETH with Lido",
      chain: "Ethereum",
      ago: "11 hours ago",
      minutesAgo: 660,
      value: 3591,
    },
    {
      id: "t4",
      kind: "Receive" as const,
      summary: "Received 840 ARB",
      chain: "Arbitrum",
      ago: "1 day ago",
      minutesAgo: 1440,
      value: 789.6,
    },
    {
      id: "t5",
      kind: "Approve" as const,
      summary: "Approved USDC for Aerodrome",
      chain: "Base",
      ago: "1 day ago",
      minutesAgo: 1560,
      value: 0,
    },
    {
      id: "t6",
      kind: "Send" as const,
      summary: "Sent 0.4 ETH",
      chain: "Ethereum",
      ago: "2 days ago",
      minutesAgo: 2880,
      value: 1368,
    },
    {
      id: "t7",
      kind: "Contract Interaction" as const,
      summary: "Claimed Aerodrome gauge rewards",
      chain: "Base",
      ago: "3 days ago",
      minutesAgo: 4320,
      value: 214.8,
    },
    {
      id: "t8",
      kind: "Mint" as const,
      summary: "Minted Uniswap v3 position",
      chain: "Base",
      ago: "4 days ago",
      minutesAgo: 5760,
      value: 4218.5,
    },
    {
      id: "t9",
      kind: "Unstake" as const,
      summary: "Unstaked 300 OP",
      chain: "Optimism",
      ago: "5 days ago",
      minutesAgo: 7200,
      value: 486,
    },
  ];

  const byAsset = [...assets]
    .sort((a, b) => b.value - a.value)
    .slice(0, 4)
    .map((a, i) => ({
      label: a.symbol,
      value: a.value,
      color: `var(--chart-${i + 1})`,
    }));
  const otherValue =
    total - byAsset.reduce((s, a) => s + a.value, 0) > 0
      ? total - byAsset.reduce((s, a) => s + a.value, 0)
      : 0;

  return {
    address,
    isDemo: true,
    totalPortfolioValue: total,
    change24hAbs: 482.3,
    change24hPct: 1.98,
    chains,
    assets,
    defiPositions,
    transactions,
    portfolioDistribution: [
      ...byAsset,
      { label: "Other", value: otherValue, color: "var(--chart-5)" },
    ],
    recentActivity:
      "Most activity occurred on Base during the last 7 days, driven by a 1.2 ETH swap and a new Uniswap v3 liquidity position.",
    transactionsAnalyzed: 132,
    lastUpdated: new Date().toISOString(),
  };
}
