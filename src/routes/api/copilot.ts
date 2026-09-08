import { createFileRoute } from "@tanstack/react-router";

type Body = {
  question?: string;
  context?: unknown;
  history?: { role: "user" | "assistant"; content: string }[];
};

const SYSTEM = `You are ZE Copilot, an onchain portfolio intelligence assistant inside the ZE Copilot DApp.

OUTPUT FORMAT (very important):
- Reply in clean Markdown. Break content into short lines and short paragraphs for readability.
- Use line breaks between distinct facts. Prefer a short bullet list when listing multiple items.
- ALWAYS bold the key figures, chains and tokens so they stand out. Wrap numbers, USD amounts, percentages, chain names and token symbols/tickers in **double asterisks**. Examples: total **$4.84** across **3 chains**, holding **32.5 ETH** on **Ethereum**, top protocol **Aave V3** at **24.1%**.

NUMBER ACCURACY (critical):
- Report USD values EXACTLY as they appear in the context JSON. NEVER abbreviate, round up, or append "M"/"K"/"B" suffixes (e.g. never turn $4.84 into $4.84M). If the raw value is 4.84, write **$4.84**; if it is 1150000, write **$1,150,000**. When in doubt, copy the number verbatim.
- Keep sections tight: a one-line summary first, then optional bullets. Max ~6 short lines total unless the user explicitly asks for detail.

GROUNDING:
- Answer ONLY from the wallet context JSON provided by the user message. Never invent balances, tokens, protocols, chains or transactions.
- If the data needed is not in the context, say so plainly and suggest what the user can ask instead.
- Be analytical and specific. Use the exact USD amounts, percentages, chain names and token symbols found in the context.

STYLE:
- Professional, concise, no filler. The data layer is the Zerion API; mention it only if relevant.
- Reply in the same language the user asks in (Vietnamese or English).`;

export const Route = createFileRoute("/api/copilot")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env["OPENAI_API_KEY"];
        if (!key) {
          return Response.json({ error: "missing_key" }, { status: 501 });
        }

        const body = (await request.json()) as Body;
        const question = (body.question ?? "").trim();
        if (!question) {
          return Response.json({ error: "missing_question" }, { status: 400 });
        }

        const history = Array.isArray(body.history) ? body.history.slice(-8) : [];

        const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            temperature: 0.2,
            messages: [
              { role: "system", content: SYSTEM },
              ...history,
              {
                role: "user",
                content: `WALLET CONTEXT (JSON):\n${JSON.stringify(body.context ?? {})}\n\nQUESTION: ${question}`,
              },
            ],
          }),
        });

        if (!upstream.ok) {
          const detail = await upstream.text().catch(() => "");
          return Response.json(
            { error: "upstream_error", status: upstream.status, detail: detail.slice(0, 500) },
            { status: upstream.status },
          );
        }

        const json = (await upstream.json()) as {
          choices?: { message?: { content?: string } }[];
        };
        const text = json.choices?.[0]?.message?.content?.trim();
        if (!text) return Response.json({ error: "empty_response" }, { status: 502 });

        return Response.json({ text });
      },
    },
  },
});
