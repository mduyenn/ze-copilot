# ZE Copilot | Turn Onchain Data Into Intelligence

ZE Copilot is an AI-powered onchain portfolio intelligence DApp. Search any wallet or ENS name and get a normalized view of portfolio value, assets, DeFi positions, chain distribution and transaction history. The AI copilot is grounded strictly in the wallet's real data.

## Features

- **Wallet & ENS search** with live onchain sync
- **Portfolio intelligence**: total value, 24h change, chain distribution, asset breakdown
- **DeFi positions** and transaction history
- **ZE Copilot AI**: answers grounded only in the loaded wallet context
- **Demo mode**: explore the product with sample data, fully separated from real analysis
- **Developer mode**: API inspector, activity log and freshness indicators
- Light / dark / system themes

## Tech stack

- TanStack Start (React 19 + Vite 7)
- TypeScript
- Tailwind CSS v4 + shadcn-style components
- Zerion API (data layer)
- OpenAI API (copilot reasoning)

## Getting started

```bash
bun install
bun run dev
```

## Environment variables

| Variable | Purpose |
| --- | --- |
| `ZERION_API_KEY` | Onchain data. Without it the app runs in demo mode. |
| `OPENAI_API_KEY` | Powers the ZE Copilot chat responses. |

Both keys are read server-side only and are never exposed to the browser.

## Attribution

Onchain data is powered by the Zerion API.
