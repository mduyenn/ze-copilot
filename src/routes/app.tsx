import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Activity,
  Boxes,
  Coins,
  LayoutDashboard,
  Menu,
  MessageSquare,
  RefreshCw,
  Radio,
  Search,
  Terminal,
  Wallet,
} from "lucide-react";
import { z } from "zod";
import { analyzeWallet, type AnalyzeResult } from "@/lib/zerion.functions";
import { buildDemoContext, DEMO_ADDRESS } from "@/lib/demo-data";
import { shortAddress } from "@/lib/wallet-context";
import { ZELogo } from "@/components/brand/ZELogo";
import { PoweredByZerion, ZerionStatus } from "@/components/brand/ZerionLogo";
import { ThemeToggle } from "@/components/theme";
import { DataFreshness, StatusBadge } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Overview } from "@/components/dashboard/Overview";
import { AssetsTable } from "@/components/dashboard/AssetsTable";
import { Defi } from "@/components/dashboard/Defi";
import { Transactions } from "@/components/dashboard/Transactions";
import { Copilot } from "@/components/dashboard/Copilot";
import { DeveloperMode, ApiActivity } from "@/components/dashboard/Developer";
import { LiveMonitor } from "@/components/dashboard/LiveMonitor";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/app")({
  validateSearch: z.object({
    address: z.string().optional(),
    demo: z.boolean().optional(),
  }),
  head: () => ({
    meta: [
      { title: "Dashboard | ZE Copilot Onchain Intelligence" },
      {
        name: "description",
        content:
          "Multichain portfolio, DeFi and transaction intelligence for any EVM wallet, powered by Zerion API.",
      },
      { property: "og:title", content: "ZE Copilot Dashboard" },
      {
        property: "og:description",
        content: "Multichain portfolio, DeFi and transaction intelligence for any EVM wallet.",
      },
    ],
  }),
  component: Dashboard,
});

type SectionId =
  | "overview"
  | "assets"
  | "defi"
  | "transactions"
  | "copilot"
  | "monitor"
  | "activity"
  | "developer";

const NAV: { id: SectionId; label: string; icon: typeof Coins; group: 1 | 2 }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, group: 1 },
  { id: "assets", label: "Assets", icon: Coins, group: 1 },
  { id: "defi", label: "DeFi", icon: Boxes, group: 1 },
  { id: "transactions", label: "Transactions", icon: Activity, group: 1 },
  { id: "copilot", label: "AI Copilot", icon: MessageSquare, group: 1 },
  { id: "monitor", label: "Live Monitor", icon: Radio, group: 2 },
  { id: "activity", label: "API Activity", icon: Terminal, group: 2 },
  { id: "developer", label: "Developer Mode", icon: Terminal, group: 2 },
];

function Dashboard() {
  const navigate = useNavigate();
  const { address, demo } = Route.useSearch();
  const isDemoMode = demo === true || !address;
  const walletAddress = address ?? DEMO_ADDRESS;

  const demoResult = (a: string): AnalyzeResult => ({
    context: buildDemoContext(a),
    demoMode: true,
    apiCall: {
      resource: "Wallet Portfolio",
      status: 200,
      statusText: "200 OK",
      responseTimeMs: 184,
      records: 8,
      at: new Date().toISOString(),
      source: "Demo Data",
    },
  });

  // Demo starts from sample data; real mode never shows demo numbers.
  const [result, setResult] = useState<AnalyzeResult | null>(() =>
    isDemoMode ? demoResult(walletAddress) : null,
  );
  const [section, setSection] = useState<SectionId>("overview");
  const [devMode, setDevMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [bannerAddress, setBannerAddress] = useState("");
  const [syncSeconds, setSyncSeconds] = useState(8);
  const [liveError, setLiveError] = useState<string | null>(null);

  const analyze = useServerFn(analyzeWallet);
  const mutation = useMutation({
    mutationFn: (a: string) =>
      analyze({ data: { address: a, mode: isDemoMode ? "demo" : "live" } }),
    onSuccess: (data) => {
      setResult(data);
      setLiveError(null);
      setSyncSeconds(0);
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof Error ? err.message : "Could not analyze that wallet.";
      setLiveError(msg);
      toast.error(
        isDemoMode ? "Demo data unavailable." : `Live analysis failed: ${msg}`,
      );
    },
  });

  useEffect(() => {
    setResult(isDemoMode ? demoResult(walletAddress) : null);
    setLiveError(null);
    mutation.mutate(walletAddress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress, isDemoMode]);

  useEffect(() => {
    const t = setInterval(() => setSyncSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const ctx = result?.context ?? buildDemoContext(walletAddress);
  const hasData = result !== null;
  const visibleNav = useMemo(
    () => NAV.filter((n) => (n.id === "developer" ? devMode : true)),
    [devMode],
  );

  const goSearch = () => {
    if (!search.trim()) return;
    navigate({ to: "/app", search: { address: search.trim(), demo: false } });
    setSearch("");
  };

  return (
    <div className="ze-backdrop min-h-screen">
      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border/60 bg-sidebar/70 backdrop-blur-xl transition-[width] duration-300 md:flex",
            sidebarOpen ? "w-60" : "w-16",
          )}
        >
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3 py-4 transition-opacity hover:opacity-80"
            aria-label="ZE Copilot home"
          >
            <ZELogo size={32} />
            {sidebarOpen ? (
              <span className="text-sm font-semibold tracking-tight">
                <span className="ze-text-gradient">ZE</span> Copilot
              </span>
            ) : null}
          </Link>

          <nav className="flex-1 space-y-1 px-2">
            {[1, 2].map((group) => (
              <div key={group} className={group === 2 ? "mt-4 border-t border-border/50 pt-4" : ""}>
                {visibleNav
                  .filter((n) => n.group === group)
                  .map((n) => (
                    <button
                      key={n.id}
                      onClick={() => setSection(n.id)}
                      aria-current={section === n.id}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all hover:-translate-y-px",
                        section === n.id
                          ? "border border-accent/30 bg-accent/10 text-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <n.icon className="size-4 shrink-0" />
                      {sidebarOpen ? n.label : null}
                    </button>
                  ))}
              </div>
            ))}

            <div className="mt-4 space-y-3 border-t border-border/50 px-1 pt-4">
              {sidebarOpen ? (
                <label className="flex items-center justify-between text-xs text-muted-foreground">
                  Developer Mode
                  <Switch checked={devMode} onCheckedChange={setDevMode} />
                </label>
              ) : (
                <Switch checked={devMode} onCheckedChange={setDevMode} aria-label="Developer Mode" />
              )}
              {sidebarOpen ? (
                <div className="space-y-1.5">
                  <p className="text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
                    Appearance
                  </p>
                  <ThemeToggle />
                </div>
              ) : null}
            </div>
          </nav>

          <div className="border-t border-border/50 p-3">
            {sidebarOpen ? (
              <PoweredByZerion className="w-full justify-center" />
            ) : (
              <PoweredByZerion variant="minimal" />
            )}
          </div>
        </aside>

        {/* Main */}
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-border/60 bg-background/70 backdrop-blur-xl">
            <div className="flex flex-wrap items-center gap-3 px-4 py-3">
              <button
                onClick={() => setSidebarOpen((s) => !s)}
                className="hidden rounded-lg border border-border/70 p-2 text-muted-foreground transition-colors hover:text-foreground md:block"
                aria-label="Toggle sidebar"
              >
                <Menu className="size-4" />
              </button>
              <Link to="/" className="flex items-center gap-2 md:hidden" aria-label="ZE Copilot home">
                <ZELogo size={28} />
                <span className="text-sm font-semibold">ZE Copilot</span>
              </Link>

              <span className="hidden items-center gap-2 rounded-lg border border-border/70 bg-surface/60 px-2.5 py-1.5 text-xs sm:inline-flex">
                <Wallet className="size-3.5 text-accent" />
                <span className="font-medium tabular">{shortAddress(ctx.address)}</span>
              </span>

              <div className="relative min-w-[160px] flex-1">
                <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && goSearch()}
                  placeholder="Search wallet address or ENS"
                  aria-label="Search wallet"
                  className="h-9 pl-8 text-sm"
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => mutation.mutate(ctx.address)}
                disabled={mutation.isPending}
              >
                <RefreshCw className={cn("size-3.5", mutation.isPending && "animate-spin")} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <span className="hidden lg:inline">
                <ZerionStatus
                  connected={!liveError}
                  label={
                    isDemoMode
                      ? "Demo Mode"
                      : liveError
                        ? "API Error"
                        : "Live · API Connected"
                  }
                />
              </span>
              <span className="hidden md:inline">
                <ThemeToggle />
              </span>
              <Button size="sm" variant="secondary" onClick={() => toast("Wallet connection is optional in ZE Copilot. Any public address can be analyzed.")}>
                Connect Wallet
              </Button>
            </div>
          </header>

          <main className="mx-auto max-w-6xl px-4 py-6 pb-28 md:pb-10">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  {NAV.find((n) => n.id === section)?.label}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Wallet {shortAddress(ctx.address)} · AI-powered onchain portfolio intelligence.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {isDemoMode ? (
                  <StatusBadge tone="accent">Demo Mode: sample data</StatusBadge>
                ) : (
                  <StatusBadge tone={liveError ? "negative" : "positive"}>
                    {liveError ? "Live sync failed" : "Real wallet · live sync"}
                  </StatusBadge>
                )}
                <DataFreshness
                  seconds={syncSeconds}
                  onRefresh={() => mutation.mutate(ctx.address)}
                  refreshing={mutation.isPending}
                />
              </div>
            </div>

            {!hasData && !liveError ? (
              <div className="grid gap-4 sm:grid-cols-3">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-28 animate-pulse rounded-xl border border-border/50 bg-surface/50"
                  />
                ))}
              </div>
            ) : null}

            {isDemoMode ? (
              <div className="mb-5 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-muted-foreground">
                    You are in <strong className="text-foreground">Demo Mode</strong>. Sample data
                    only, no live Zerion calls.
                  </span>
                  <form
                    className="flex min-w-0 flex-1 items-center gap-2 sm:flex-none"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const v = bannerAddress.trim();
                      if (!v) return;
                      navigate({ to: "/app", search: { address: v, demo: false } });
                      setBannerAddress("");
                    }}
                  >
                    <input
                      value={bannerAddress}
                      onChange={(e) => setBannerAddress(e.target.value)}
                      placeholder="Your wallet address or ENS (e.g. vitalik.eth)"
                      className="h-8 w-full min-w-0 rounded-md border border-border bg-surface px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent sm:w-72"
                    />
                    <Button size="sm" type="submit" disabled={!bannerAddress.trim()}>
                      Switch to real analysis
                    </Button>
                  </form>
                </div>
                <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>Track top wallets:</span>
                  {[
                    { label: "vitalik.eth", value: "vitalik.eth" },
                    {
                      label: "Vitalik (0xd8dA…6045)",
                      value: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
                    },
                    {
                      label: "Binance Hot Wallet",
                      value: "0x28C6c06298d514Db089934071355E5743bf21d60",
                    },
                    {
                      label: "Arbitrum Bridge",
                      value: "0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a",
                    },
                  ].map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() =>
                        navigate({ to: "/app", search: { address: s.value, demo: false } })
                      }
                      className="rounded-full border border-accent/40 bg-accent/15 px-2.5 py-1 font-medium text-foreground transition-colors hover:bg-accent/30"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : liveError ? (
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-negative/40 bg-negative/10 px-4 py-3 text-sm">
                <span className="text-muted-foreground">
                  Live Zerion analysis failed: {liveError}
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => mutation.mutate(ctx.address)}>
                    Retry
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      navigate({ to: "/app", search: { address: DEMO_ADDRESS, demo: true } })
                    }
                  >
                    Open Demo Mode
                  </Button>
                </div>
              </div>
            ) : null}

            {hasData && section === "overview" ? <Overview ctx={ctx} syncSeconds={syncSeconds} /> : null}
            {hasData && section === "assets" ? <AssetsTable ctx={ctx} /> : null}
            {hasData && section === "defi" ? <Defi ctx={ctx} /> : null}
            {hasData && section === "transactions" ? <Transactions ctx={ctx} /> : null}
            {hasData && section === "copilot" ? <Copilot ctx={ctx} /> : null}
            {hasData && section === "monitor" ? <LiveMonitor ctx={ctx} syncSeconds={syncSeconds} /> : null}
            {hasData && section === "activity" ? <ApiActivity ctx={ctx} /> : null}
            {hasData && section === "developer" ? (
              <DeveloperMode ctx={ctx} apiCall={result!.apiCall} />
            ) : null}

            <footer className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-6">
              <span className="text-xs text-muted-foreground">
                ZE Copilot | Turn Onchain Data Into Intelligence.
              </span>
              <PoweredByZerion variant="compact" />
            </footer>
          </main>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/85 backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-around px-2 py-2">
          {NAV.slice(0, 5).map((n) => (
            <button
              key={n.id}
              onClick={() => setSection(n.id)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium transition-colors",
                section === n.id ? "text-accent" : "text-muted-foreground",
              )}
            >
              <n.icon className="size-4" />
              {n.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
