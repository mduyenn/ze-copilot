import { useState } from "react";
import { Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { WalletContext } from "@/lib/wallet-context";
import { answer, SUGGESTED_PROMPTS } from "@/lib/copilot";
import { GradientCard, SectionTitle } from "@/components/kit";
import { ZEAvatar } from "@/components/brand/ZELogo";
import { PoweredByZerion, ZerionLogo } from "@/components/brand/ZerionLogo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Msg = { role: "user" | "ze"; text: string };

export function Copilot({ ctx }: { ctx: WalletContext }) {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "ze",
      text: `Ask about this wallet. I only answer from the wallet context built from ${ctx.isDemo ? "clearly labelled demo data" : "Zerion API data"}. I never invent balances.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  const compactContext = () => ({
    address: ctx.address,
    isDemo: ctx.isDemo,
    totalPortfolioValue: ctx.totalPortfolioValue,
    change24hAbs: ctx.change24hAbs,
    change24hPct: ctx.change24hPct,
    chainCount: ctx.chains.length,
    chains: ctx.chains.slice(0, 12).map((c) => ({
      name: c.name,
      value: c.value,
      percentage: c.percentage,
    })),
    assetCount: ctx.assets.length,
    topAssets: ctx.assets.slice(0, 20).map((a) => ({
      symbol: a.symbol,
      name: a.name,
      chain: a.chain,
      balance: a.balance,
      price: a.price,
      value: a.value,
      change24h: a.change24h,
    })),
    defiPositions: ctx.defiPositions.slice(0, 15),
    recentTransactions: ctx.transactions.slice(0, 15).map((t) => ({
      kind: t.kind,
      summary: t.summary,
      chain: t.chain,
      ago: t.ago,
      value: t.value,
    })),
    portfolioDistribution: ctx.portfolioDistribution,
    transactionsAnalyzed: ctx.transactionsAnalyzed,
    lastUpdated: ctx.lastUpdated,
  });

  const ask = async (q: string) => {
    const question = q.trim();
    if (!question || thinking) return;
    const history = messages
      .slice(1)
      .map((m) => ({ role: m.role === "user" ? ("user" as const) : ("assistant" as const), content: m.text }));

    setMessages((m) => [...m, { role: "user", text: question }]);
    setInput("");
    setThinking(true);

    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, context: compactContext(), history }),
      });
      const data = (await res.json().catch(() => null)) as { text?: string } | null;
      if (res.ok && data?.text) {
        setMessages((m) => [...m, { role: "ze", text: data.text as string }]);
      } else {
        setMessages((m) => [...m, { role: "ze", text: answer(question, ctx) }]);
      }
    } catch {
      setMessages((m) => [...m, { role: "ze", text: answer(question, ctx) }]);
    } finally {
      setThinking(false);
    }
  };

  return (
    <section>
      <SectionTitle
        title="ZE Copilot AI"
        desc="Grounded intelligence over the normalized wallet context."
        right={<PoweredByZerion variant="compact" />}
      />

      <GradientCard hover={false} className="p-0">
        <div className="flex items-center gap-2.5 border-b border-border/60 p-4">
          <ZEAvatar size={30} />
          <div>
            <p className="text-sm font-semibold tracking-tight">ZE Copilot</p>
            <p className="text-xs text-muted-foreground">Ask about this wallet.</p>
          </div>
        </div>

        <div className="max-h-[420px] space-y-4 overflow-y-auto p-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : ""}`}
            >
              {m.role === "ze" ? <ZEAvatar size={26} /> : null}
              <div className={m.role === "user" ? "max-w-[80%]" : "max-w-[85%]"}>
                <div
                  className={`ze-chat-msg rounded-xl border px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "border-accent/30 bg-accent/10"
                      : "border-border/70 bg-surface/70"
                  }`}
                >
                  {m.role === "user" ? (
                    m.text
                  ) : (
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="m-0 [&:not(:first-child)]:mt-2">{children}</p>,
                        ul: ({ children }) => <ul className="my-1.5 list-disc space-y-1 pl-4">{children}</ul>,
                        ol: ({ children }) => <ol className="my-1.5 list-decimal space-y-1 pl-4">{children}</ol>,
                        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                        strong: ({ children }) => (
                          <strong className="font-semibold text-foreground">{children}</strong>
                        ),
                        code: ({ children }) => (
                          <code className="rounded bg-muted/60 px-1 py-0.5 text-[0.85em]">{children}</code>
                        ),
                      }}
                    >
                      {m.text}
                    </ReactMarkdown>
                  )}
                </div>
                {m.role === "ze" && i > 0 ? (
                  <span className="mt-1.5 inline-flex items-center gap-[7px] text-[11px] text-muted-foreground">
                    <ZerionLogo size={14} />
                    {ctx.isDemo ? "Based on demo wallet context" : "Based on Zerion API data"}
                  </span>
                ) : null}
              </div>
            </div>
          ))}
          {thinking ? (
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
              <ZEAvatar size={26} /> ZE Copilot is analyzing the wallet context…
            </div>
          ) : null}
        </div>

        <div className="border-t border-border/60 p-4">
          <div className="mb-3 flex flex-wrap gap-1.5">
            {SUGGESTED_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => ask(p)}
                className="rounded-lg border border-border/70 px-2.5 py-1 text-xs text-muted-foreground transition-all hover:-translate-y-px hover:border-accent/50 hover:text-foreground"
              >
                {p}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && ask(input)}
              placeholder="Ask ZE Copilot about this wallet"
              aria-label="Ask ZE Copilot"
              className="h-10 text-sm"
            />
            <Button className="h-10" onClick={() => ask(input)} aria-label="Send">
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      </GradientCard>
    </section>
  );
}
