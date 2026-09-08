export type ChainSlice = {
  id: string;
  name: string;
  value: number;
  percentage: number;
  color: string;
};

export type Asset = {
  id: string;
  symbol: string;
  name: string;
  balance: number;
  price: number;
  value: number;
  change24h: number;
  chain: string;
  /** Official token logo URL from the Zerion data layer (absent when unknown). */
  iconUrl?: string | undefined;
};

export type DefiPosition = {
  id: string;
  protocol: string;
  type:
    | "Lending"
    | "Borrowing"
    | "Liquidity"
    | "Staking"
    | "Yield"
    | "Locked Assets";
  chain: string;
  assets: string;
  value: number;
  apy?: number;
  metadata: string;
};

export type TxKind =
  | "Swap"
  | "Send"
  | "Receive"
  | "Bridge"
  | "Approve"
  | "Mint"
  | "Stake"
  | "Unstake"
  | "Contract Interaction";

export type Transaction = {
  id: string;
  kind: TxKind;
  summary: string;
  chain: string;
  ago: string;
  minutesAgo: number;
  value: number;
};

export type WalletContext = {
  address: string;
  isDemo: boolean;
  totalPortfolioValue: number;
  change24hAbs: number;
  change24hPct: number;
  chains: ChainSlice[];
  assets: Asset[];
  defiPositions: DefiPosition[];
  transactions: Transaction[];
  portfolioDistribution: { label: string; value: number; color: string }[];
  recentActivity: string;
  transactionsAnalyzed: number;
  lastUpdated: string;
};

export const shortAddress = (a: string) =>
  a.length > 12 ? `${a.slice(0, 6)}...${a.slice(-3)}` : a;

export const usd = (n: number, digits = 2) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

export const pct = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(2)}%`;
