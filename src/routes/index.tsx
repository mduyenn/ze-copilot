import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Boxes, Brain, Cpu, Layers, LineChart, Sparkles, Terminal } from "lucide-react";
import { ZELogo } from "@/components/brand/ZELogo";
import { PoweredByZerion, ZerionLogo } from "@/components/brand/ZerionLogo";
import { ThemeToggle } from "@/components/theme";
import { GradientCard, Hover3D, StatusBadge } from "@/components/kit";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DEMO_ADDRESS } from "@/lib/demo-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ZE Copilot | Turn Onchain Data Into Intelligence" },
      {
        name: "description",
        content:
          "ZE Copilot turns multichain wallet, DeFi and transaction data into clear onchain intelligence. Powered by Zerion API.",
      },
      { property: "og:title", content: "ZE Copilot | Turn Onchain Data Into Intelligence" },
      {
        property: "og:description",
        content: "AI-powered onchain portfolio intelligence, built on Zerion API.",
      },
    ],
  }),
  component: Landing,
});

const LOADING_STEPS = [
  "Connecting to Zerion API...",
  "Fetching onchain data...",
  "Scanning chains...",
  "Fetching assets...",
  "Discovering DeFi positions...",
  "Analyzing transactions...",
  "Building wallet context...",
  "Preparing ZE Copilot...",
];

function Landing() {
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loadingFor, setLoadingFor] = useState<string | null>(null);
  const [loadingMode, setLoadingMode] = useState<"live" | "demo">("live");
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!loadingFor) return;
    if (step >= LOADING_STEPS.length) {
      navigate({
        to: "/app",
        search: { address: loadingFor, demo: loadingMode === "demo" },
      });
      return;
    }
    const t = setTimeout(() => setStep((s) => s + 1), 330);
    return () => clearTimeout(t);
  }, [loadingFor, loadingMode, step, navigate]);

  const valid = (v: string) =>
    /^0x[a-fA-F0-9]{40}$/.test(v.trim()) || /^[a-zA-Z0-9-]+\.eth$/.test(v.trim());

  const analyze = (value: string, mode: "live" | "demo" = "live") => {
    if (!valid(value)) {
      setError("Enter a valid EVM address (0x…) or ENS name.");
      return;
    }
    setError(null);
    setStep(0);
    setLoadingMode(mode);
    setLoadingFor(value.trim());
  };

  if (loadingFor) {
    return (
      <main className="ze-backdrop flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <ZELogo size={72} sweep className="mx-auto" />
          <p className="mt-6 text-sm font-medium">
            {LOADING_STEPS[Math.min(step, LOADING_STEPS.length - 1)]}
          </p>
          <div className="mt-6 space-y-1.5 text-left">
            {LOADING_STEPS.map((s, i) => (
              <div
                key={s}
                className={`flex items-center gap-2 text-xs transition-opacity duration-300 ${
                  i <= step ? "opacity-100" : "opacity-30"
                }`}
              >
                <span
                  className={`size-1.5 rounded-full ${i < step ? "bg-positive" : "bg-accent"}`}
                />
                <span className="text-muted-foreground">{s}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <PoweredByZerion variant="compact" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="ze-backdrop min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <ZELogo size={36} />
        <div className="flex items-center gap-3">
          <PoweredByZerion variant="minimal" />
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-24">
        <section className="pt-10 text-center sm:pt-16">
          <div className="flex justify-center">
            <Hover3D intensity={6}>
              <ZELogo size={104} className="shadow-[0_20px_60px_-30px_var(--glow-violet)]" />
            </Hover3D>
          </div>
          <h1 className="mt-8 text-4xl font-semibold tracking-tight sm:text-6xl">
            ZE Copilot
          </h1>
          <p className="mt-3 text-xl font-medium sm:text-2xl">
            <span className="ze-text-gradient">Turn Onchain Data Into Intelligence.</span>
          </p>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
            Transform multichain wallet, DeFi and transaction data into clear onchain
            intelligence.
          </p>

          <div className="mx-auto mt-8 flex w-full max-w-xl flex-col gap-3 sm:flex-row">
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && analyze(address)}
              placeholder="Enter wallet address or ENS"
              aria-label="Wallet address or ENS"
              className="h-12 bg-surface/70 text-sm backdrop-blur-sm"
            />
            <Button size="lg" className="h-12 shrink-0" onClick={() => analyze(address)}>
              Analyze Wallet <ArrowRight className="size-4" />
            </Button>
          </div>
          {error ? (
            <p className="mt-2 text-xs text-negative">{error}</p>
          ) : null}
          <div className="mt-2.5 flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={() => analyze(DEMO_ADDRESS, "demo")}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              <Sparkles className="size-3" /> Or try Demo Mode (sample data)
            </button>
            <span className="text-[11px] text-muted-foreground/70">
              Demo Mode is fully separate from real wallet analysis.
            </span>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <PoweredByZerion />
            <StatusBadge tone="accent">Demo Data available</StatusBadge>
          </div>
        </section>

        <section className="mt-20">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: Layers,
                title: "Multichain Portfolio",
                body: "Chains, assets and allocation normalized into one readable view.",
              },
              {
                icon: Boxes,
                title: "DeFi Intelligence",
                body: "Lending, liquidity, staking and locked positions discovered automatically.",
              },
              {
                icon: LineChart,
                title: "Transaction Intelligence",
                body: "Raw activity translated into swaps, bridges and transfers you understand.",
              },
              {
                icon: Brain,
                title: "ZE Copilot AI",
                body: "Ask questions about the wallet. Answers grounded in the wallet context.",
              },
              {
                icon: Terminal,
                title: "Developer Mode",
                body: "Inspect the API layer: resources, status, latency and sanitized payloads.",
              },
              {
                icon: Cpu,
                title: "Continuous Data",
                body: "Live monitoring designed for applications and AI agents that never sleep.",
              },
            ].map((f) => (
              <Hover3D key={f.title}>
                <GradientCard className="h-full">
                  <f.icon className="size-5 text-accent" />
                  <h3 className="mt-3 text-base font-semibold tracking-tight">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
                </GradientCard>
              </Hover3D>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <GradientCard hover={false} className="p-8">
            <div className="grid items-center gap-6 text-center sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
              <div className="flex flex-col items-center gap-2">
                <ZerionLogo size={40} className="rounded-xl" />
                <p className="text-sm font-semibold">Zerion API</p>
                <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
                  Onchain Data Layer
                </p>
              </div>
              <ArrowRight className="mx-auto size-4 rotate-90 text-muted-foreground sm:rotate-0" />
              <div className="flex flex-col items-center gap-2">
                <ZELogo size={40} />
                <p className="text-sm font-semibold">ZE Copilot</p>
                <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
                  Intelligence Layer
                </p>
              </div>
              <ArrowRight className="mx-auto size-4 rotate-90 text-muted-foreground sm:rotate-0" />
              <div className="flex flex-col items-center gap-2">
                <div className="flex size-10 items-center justify-center rounded-xl border border-border/70 bg-surface/60">
                  <Sparkles className="size-4 text-accent-secondary" />
                </div>
                <p className="text-sm font-semibold">User / AI Agent</p>
                <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
                  Understanding
                </p>
              </div>
            </div>
          </GradientCard>
        </section>

        <footer className="mt-16 flex flex-col items-center gap-3 text-center">
          <ZELogo size={30} />
          <p className="text-sm font-medium">ZE Copilot</p>
          <p className="text-xs text-muted-foreground">
            AI-powered onchain portfolio intelligence, built on Zerion API.
          </p>
          <PoweredByZerion variant="compact" />
        </footer>
      </main>
    </div>
  );
}
