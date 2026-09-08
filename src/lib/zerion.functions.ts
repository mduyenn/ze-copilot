import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { WalletContext } from "./wallet-context";

const addressSchema = z.object({
  address: z
    .string()
    .trim()
    .min(3)
    .max(80)
    .regex(/^(0x[a-fA-F0-9]{40}|[a-zA-Z0-9-]+\.eth)$/, {
      message: "Enter a valid EVM address or ENS name",
    }),
  mode: z.enum(["live", "demo"]).default("live"),
});

export type AnalyzeResult = {
  context: WalletContext;
  apiCall: {
    resource: string;
    status: number;
    statusText: string;
    responseTimeMs: number;
    records: number;
    at: string;
    source: "Zerion API" | "Demo Data";
  };
  demoMode: boolean;
};

export const analyzeWallet = createServerFn({ method: "POST" })
  .inputValidator((data: { address: string; mode?: "live" | "demo" }) =>
    addressSchema.parse(data),
  )
  .handler(async ({ data }): Promise<AnalyzeResult> => {
    const started = Date.now();
    const { buildWalletContext, hasApiKey } = await import(
      "@/services/zerion.server"
    );
    const context = await buildWalletContext(data.address, data.mode);
    const live = data.mode === "live" && hasApiKey() && !context.isDemo;
    return {
      context,
      demoMode: !live,
      apiCall: {
        resource: "Wallet Portfolio",
        status: 200,
        statusText: "200 OK",
        responseTimeMs: Date.now() - started,
        records: context.assets.length,
        at: new Date().toISOString(),
        source: live ? "Zerion API" : "Demo Data",
      },
    };
  });
