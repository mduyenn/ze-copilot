/**
 * Zerion API data layer (server-only).
 * The ZERION_API_KEY is read inside functions and never reaches the client.
 * When no key is configured the app runs in Demo Mode.
 */
import type {
  Asset,
  ChainSlice,
  DefiPosition,
  Transaction,
  TxKind,
  WalletContext,
} from "@/lib/wallet-context";
import { buildDemoContext } from "@/lib/demo-data";

const BASE_URL = "https://api.zerion.io/v1";
const TIMEOUT_MS = 12_000;
const CACHE_TTL_MS = 20_000;

type CacheEntry = { at: number; data: unknown };
const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<unknown>>();

export type ApiCall = {
  resource: string;
  status: number;
  statusText: string;
  responseTimeMs: number;
  records: number;
  at: string;
  source: "Zerion API" | "Demo Data";
};

export function hasApiKey() {
  return Boolean(process.env["ZERION_API_KEY"]);
}

async function zerionFetch<T>(path: string, resource: string) {
  const key = process.env["ZERION_API_KEY"];
  if (!key) throw new Error("missing_api_key");

  const cacheKey = path;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.data as T;

  // request deduplication
  const pending = inflight.get(cacheKey);
  if (pending) return (await pending) as T;

  const run = (async () => {
    let lastError: unknown;
    for (let attempt = 0; attempt < 5; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        const res = await fetch(`${BASE_URL}${path}`, {
          headers: {
            accept: "application/json",
            authorization: `Basic ${btoa(`${key}:`)}`,
          },
          signal: controller.signal,
        });
        clearTimeout(timer);
        if (res.status >= 500 || res.status === 429) {
          lastError = new Error(`Zerion API ${res.status}`);
          // Exponential backoff with jitter; respect Retry-After when present.
          const retryAfter = Number(res.headers.get("retry-after")) || 0;
          const backoff =
            Math.max(retryAfter * 1000, 600 * 2 ** attempt) +
            Math.floor(Math.random() * 250);
          await new Promise((r) => setTimeout(r, backoff));
          continue;
        }
        if (!res.ok) throw new Error(`Zerion API ${res.status} for ${resource}`);
        const json = (await res.json()) as T;
        cache.set(cacheKey, { at: Date.now(), data: json });
        return json;
      } catch (err) {
        clearTimeout(timer);
        lastError = err;
      }
    }
    throw lastError instanceof Error ? lastError : new Error("zerion_failed");
  })();

  inflight.set(cacheKey, run);
  try {
    return (await run) as T;
  } finally {
    inflight.delete(cacheKey);
  }
}

export const getWalletPortfolio = (address: string) =>
  zerionFetch<unknown>(`/wallets/${address}/portfolio`, "Wallet Portfolio");
export const getWalletAssets = (address: string) =>
  zerionFetch<unknown>(
    `/wallets/${address}/positions/?filter[position_types]=wallet&page[size]=100`,
    "Wallet Assets",
  );
export const getWalletPositions = (address: string) =>
  zerionFetch<unknown>(
    `/wallets/${address}/positions/?filter[position_types]=deposit,loan,staked,locked,reward&page[size]=100`,
    "DeFi Positions",
  );
export const getWalletTransactions = (address: string) =>
  zerionFetch<unknown>(
    `/wallets/${address}/transactions/?page[size]=50`,
    "Transactions",
  );
export const getWalletChains = () => zerionFetch<unknown>(`/chains/`, "Chains");

// ---------- live payload normalization ----------

type AnyObj = Record<string, unknown>;

const obj = (v: unknown): AnyObj | null =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as AnyObj) : null;
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const num = (v: unknown, fallback = 0): number =>
  typeof v === "number" && Number.isFinite(v) ? v : fallback;
const str = (v: unknown, fallback = ""): string =>
  typeof v === "string" ? v : fallback;
/** Bracket-safe property read (noPropertyAccessFromIndexSignature). */
const get = (o: AnyObj | null | undefined, k: string): unknown =>
  o ? o[k] : undefined;
const getObj = (o: AnyObj | null | undefined, k: string): AnyObj | null =>
  obj(get(o, k));

const listData = (payload: unknown): AnyObj[] =>
  arr(get(obj(payload), "data"))
    .map(obj)
    .filter((o): o is AnyObj => o !== null);
const attrsOf = (item: AnyObj): AnyObj => getObj(item, "attributes") ?? {};
const relId = (item: AnyObj, rel: string): string =>
  str(get(getObj(getObj(item, "relationships"), rel) && getObj(getObj(getObj(item, "relationships"), rel), "data"), "id"));

const CHAIN_COLORS: Record<string, string> = {
  ethereum: "#627EEA",
  base: "#0052FF",
  arbitrum: "#28A0F0",
  "arbitrum-one": "#28A0F0",
  optimism: "#FF0420",
  polygon: "#8247E5",
  "binance-smart-chain": "#F0B90B",
  avalanche: "#E84142",
  zora: "#5F5FFF",
  blast: "#FCFC03",
  linea: "#61DFFF",
  scroll: "#FFEEDA",
  mode: "#DFFE00",
  solana: "#14F195",
};
const FALLBACK_COLORS = ["#06b6d4", "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899"];

const chainColor = (id: string, index: number) =>
  CHAIN_COLORS[id.toLowerCase()] ??
  FALLBACK_COLORS[index % FALLBACK_COLORS.length] ??
  "#06b6d4";

const prettyChain = (id: string) =>
  id
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const POSITION_TYPE_MAP: Record<string, DefiPosition["type"]> = {
  deposit: "Lending",
  loan: "Borrowing",
  staked: "Staking",
  locked: "Locked Assets",
  reward: "Yield",
  liquidity: "Liquidity",
};

const TX_KIND_MAP: Record<string, TxKind> = {
  trade: "Swap",
  send: "Send",
  receive: "Receive",
  bridge: "Bridge",
  approve: "Approve",
  mint: "Mint",
  stake: "Stake",
  unstake: "Unstake",
  deposit: "Stake",
  borrow: "Contract Interaction",
  repay: "Contract Interaction",
  claim: "Receive",
  withdraw: "Send",
  execute: "Contract Interaction",
};

function agoFrom(iso: string): { ago: string; minutesAgo: number } {
  const t = Date.parse(iso);
  if (!Number.isFinite(t))
    return { ago: "unknown", minutesAgo: Number.MAX_SAFE_INTEGER };
  const mins = Math.max(0, Math.round((Date.now() - t) / 60000));
  if (mins < 1) return { ago: "just now", minutesAgo: 0 };
  if (mins < 60) return { ago: `${mins}m ago`, minutesAgo: mins };
  const h = Math.floor(mins / 60);
  if (h < 24) return { ago: `${h}h ago`, minutesAgo: mins };
  const d = Math.floor(h / 24);
  return { ago: `${d}d ago`, minutesAgo: mins };
}

function normalizeAssets(payload: unknown): Asset[] {
  return listData(payload)
    .map((item, i): Asset | null => {
      const a = attrsOf(item);
      const fungible = getObj(a, "fungible_info");
      const value = num(get(a, "value"), NaN);
      const quantity = num(get(getObj(a, "quantity"), "float"), 0);
      if (!fungible || !Number.isFinite(value)) return null;
      const chainId = relId(item, "chain") || "ethereum";
      return {
        id: str(get(item, "id"), `asset-${i}`),
        symbol: str(get(fungible, "symbol"), "?").toUpperCase(),
        name: str(get(fungible, "name"), str(get(fungible, "symbol"), "Unknown asset")),
        balance: quantity,
        price: num(get(a, "price"), quantity > 0 ? value / quantity : 0),
        value,
        change24h: num(get(getObj(a, "changes"), "percent_1d"), 0),
        chain: chainId,
        iconUrl: str(get(getObj(fungible, "icon"), "url")) || undefined,
      };
    })
    .filter((a): a is Asset => a !== null && a.value > 0)
    .sort((a, b) => b.value - a.value);
}

function normalizeDefi(payload: unknown): DefiPosition[] {
  return listData(payload)
    .map((item, i): DefiPosition | null => {
      const a = attrsOf(item);
      const value = num(get(a, "value"), 0);
      if (value <= 0) return null;
      const fungible = getObj(a, "fungible_info");
      const typeKey = str(get(a, "position_type"), "");
      const protocol =
        str(get(a, "protocol")) ||
        relId(item, "dapp") ||
        str(get(getObj(a, "application_metadata"), "name")) ||
        "Onchain";
      const name =
        str(get(a, "name")) ||
        str(get(fungible, "name")) ||
        str(get(fungible, "symbol")) ||
        "Position";
      const chainId = relId(item, "chain") || "ethereum";
      return {
        id: str(get(item, "id"), `pos-${i}`),
        protocol: protocol.charAt(0).toUpperCase() + protocol.slice(1),
        type: POSITION_TYPE_MAP[typeKey] ?? "Yield",
        chain: chainId,
        assets: name,
        value,
        metadata: `${typeKey || "position"} · ${name}`,
      };
    })
    .filter((p): p is DefiPosition => p !== null)
    .sort((a, b) => b.value - a.value);
}

function normalizeTransactions(payload: unknown, wallet: string): Transaction[] {
  const lower = wallet.toLowerCase();
  return listData(payload).map((item, i): Transaction => {
    const a = attrsOf(item);
    const opType = str(get(a, "operation_type"), "execute");
    const kind = TX_KIND_MAP[opType] ?? "Contract Interaction";
    const transfers = arr(get(a, "transfers"))
      .map(obj)
      .filter((t): t is AnyObj => t !== null);
    const totalValue = transfers.reduce((s, t) => s + num(get(t, "value"), 0), 0);
    const primary =
      transfers.find((t) => num(get(t, "value"), 0) > 0) ?? transfers[0];
    const symbol = str(get(getObj(primary ?? null, "fungible_info"), "symbol"), "");
    const qty = num(get(getObj(primary ?? null, "quantity"), "float"), 0);
    const direction = str(get(primary ?? null, "direction"));
    let effectiveKind = kind;
    if (opType === "send" && direction === "in") effectiveKind = "Receive";
    if (opType === "send" && lower && str(get(a, "sent_from")).toLowerCase() !== lower)
      effectiveKind = "Receive";
    const minedAt = str(get(a, "mined_at"), "");
    const { ago, minutesAgo } = agoFrom(minedAt);
    const chainId = relId(item, "chain") || "ethereum";
    const summary =
      qty > 0 && symbol
        ? `${effectiveKind} ${qty >= 100 ? qty.toFixed(1) : qty.toPrecision(3)} ${symbol.toUpperCase()}`
        : `${effectiveKind} on ${prettyChain(chainId)}`;
    return {
      id: str(get(a, "hash"), str(get(item, "id"), `tx-${i}`)),
      kind: effectiveKind,
      summary,
      chain: chainId,
      ago,
      minutesAgo,
      value: totalValue,
    };
  });
}

function normalizeChains(
  portfolio: unknown,
  assets: Asset[],
  defi: DefiPosition[],
): ChainSlice[] {
  const data = getObj(obj(portfolio), "data");
  const a = data ? attrsOf(data) : {};
  const byChain = getObj(a, "positions_distribution_by_chain");
  let slices: { id: string; value: number }[] = [];
  if (byChain) {
    slices = Object.entries(byChain)
      .map(([id, v]) => ({ id, value: num(v) }))
      .filter((s) => s.value > 0);
  }
  if (slices.length === 0) {
    const acc = new Map<string, number>();
    for (const x of [...assets, ...defi])
      acc.set(x.chain, (acc.get(x.chain) ?? 0) + x.value);
    slices = [...acc.entries()]
      .map(([id, value]) => ({ id, value }))
      .filter((s) => s.value > 0);
  }
  slices.sort((x, y) => y.value - x.value);
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  return slices.map((s, i) => ({
    id: s.id,
    name: prettyChain(s.id),
    value: s.value,
    percentage: (s.value / total) * 100,
    color: chainColor(s.id, i),
  }));
}

const DISTRIBUTION_COLORS = ["#06b6d4", "#3b82f6", "#8b5cf6"];

function normalizeDistribution(
  portfolio: unknown,
  assets: Asset[],
  defi: DefiPosition[],
): { label: string; value: number; color: string }[] {
  const data = getObj(obj(portfolio), "data");
  const a = data ? attrsOf(data) : {};
  const byType = getObj(a, "positions_distribution_by_type");
  let walletVal = byType ? num(get(byType, "wallet"), NaN) : NaN;
  let defiVal = byType
    ? num(get(byType, "deposited")) +
      num(get(byType, "staked")) +
      num(get(byType, "locked"))
    : NaN;
  if (!Number.isFinite(walletVal))
    walletVal = assets.reduce((s, x) => s + x.value, 0);
  if (!Number.isFinite(defiVal) || defiVal <= 0)
    defiVal = defi.reduce((s, x) => s + x.value, 0);
  const nftVal = byType ? num(get(byType, "nfts"), 0) : 0;
  const out = [
    { label: "Wallet", value: walletVal, color: DISTRIBUTION_COLORS[0] ?? "#06b6d4" },
    { label: "DeFi", value: defiVal, color: DISTRIBUTION_COLORS[1] ?? "#3b82f6" },
  ];
  if (nftVal > 0)
    out.push({ label: "NFTs", value: nftVal, color: DISTRIBUTION_COLORS[2] ?? "#8b5cf6" });
  return out.filter((d) => d.value > 0);
}

/** Normalizes provider responses into the WalletContext consumed by ZE Copilot. */
export async function buildWalletContext(
  address: string,
  mode: "live" | "demo" = "live",
): Promise<WalletContext> {
  // Demo mode is fully isolated: it never touches the provider.
  if (mode === "demo") return { ...buildDemoContext(address), isDemo: true };
  if (!hasApiKey())
    throw new Error(
      "Zerion API key is not configured. Real wallet analysis is unavailable.",
    );
  try {

    // Staggered parallel fetching to respect provider rate limits.
    const stagger = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const [portfolioRaw, assetsRaw, positionsRaw, txRaw] = await Promise.all([
      getWalletPortfolio(address),
      stagger(150).then(() => getWalletAssets(address)),
      stagger(300).then(() => getWalletPositions(address)),
      stagger(450).then(() => getWalletTransactions(address)),
    ]);

    const assets = normalizeAssets(assetsRaw);
    const defiPositions = normalizeDefi(positionsRaw);
    const transactions = normalizeTransactions(txRaw, address);
    const chains = normalizeChains(portfolioRaw, assets, defiPositions);
    const portfolioDistribution = normalizeDistribution(
      portfolioRaw,
      assets,
      defiPositions,
    );

    const portfolioData = getObj(obj(portfolioRaw), "data");
    const portfolioAttrs = portfolioData ? attrsOf(portfolioData) : {};
    const changes = getObj(portfolioAttrs, "changes");
    const totalFromApi = num(get(getObj(portfolioAttrs, "total"), "positions"), NaN);
    const totalPortfolioValue = Number.isFinite(totalFromApi)
      ? totalFromApi
      : assets.reduce((s, x) => s + x.value, 0) +
        defiPositions.reduce((s, x) => s + x.value, 0);

    const recent = transactions[0];

    return {
      address,
      isDemo: false,
      totalPortfolioValue,
      change24hAbs: num(get(changes, "absolute_1d"), 0),
      change24hPct: num(get(changes, "percent_1d"), 0),
      chains,
      assets,
      defiPositions,
      transactions,
      portfolioDistribution,
      recentActivity: recent
        ? `${recent.kind} · ${recent.summary} · ${recent.ago}`
        : "No recent transactions found",
      transactionsAnalyzed: transactions.length,
      lastUpdated: new Date().toISOString(),
    };
  } catch (err) {
    console.error(
      "[zerion] live fetch failed:",
      err instanceof Error ? err.message : err,
    );
    // Real mode never falls back to demo data. The two modes stay separate.
    throw new Error(
      err instanceof Error ? err.message : "Zerion API request failed",
    );
  }
}

