# PayWhen — Miniapp Frontend

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-000000?style=flat-square&logo=nextdotjs)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Wagmi](https://img.shields.io/badge/Wagmi-v3-8FA828?style=flat-square)](https://wagmi.sh)
[![Network](https://img.shields.io/badge/Celo-Mainnet-16D14E?style=flat-square&logo=celo)](https://celo.org)

Next.js 16.1.1 frontend for the PayWhen intent-based conditional payment protocol on Celo. Features full smart contract integration with PaymentFactory, support for time-based/manual/recurring payments, and wallet connectivity via Reown AppKit.

**[Live Miniapp](https://paywhen.vercel.app/) · [Main Repo](https://github.com/thebabalola/paywhen)**

</div>

---

## 🚀 Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| Next.js | 16.1.1 | App Router, SSR, file-based routing |
| React | 19.2.0 | UI rendering |
| TypeScript | 5.x | Full type safety |
| Tailwind CSS | v4 | Utility styling (JIT, CSS variables) |
| Wagmi | v3 | React hooks for Ethereum |
| Viem | v2 | Low-level on-chain reads and writes |
| Reown AppKit | 1.8.19 | Wallet modal & connection |

---

## 📁 Project Structure

```
frontend/
├── app/
│   ├── page.tsx                  # Main payment creation & status page
│   ├── layout.tsx                # Root layout with Web3Provider
│   └── globals.css               # Global styles + Tailwind
├── components/
│   ├── ClientLayout.tsx          # Layout wrapper with navbar
│   ├── Navbar.tsx                # Top navigation
│   ├── HeroIllustration.tsx      # Hero section graphic
│   ├── LaunchButton.tsx          # CTA button
│   ├── SecurityNotice.tsx        # Auditing disclaimer
│   └── ThemeToggle.tsx           # Dark/light mode switch
├── context/
│   └── Web3Provider.tsx          # Wagmi + AppKit provider
├── lib/
│   ├── contracts.ts              # Contract ABIs & types
│   ├── constants.ts              # Network configs, addresses
│   ├── hooks.ts                  # Contract interaction hooks
│   └── wagmi.ts                  # Wagmi configuration (deprecated — use Web3Provider)
└── public/                       # Static assets
```

---

## 🎯 Core Features

### Payment Types
- **Time-based** — Funds released at specific timestamp
- **Manual Approval** — Requires approver signatures
- **Recurring** — Scheduled automated payments

### User Workflow
- Connect wallet (Reown AppKit)
- Select payment type
- Enter recipient & amount
- Set condition parameters
- Submit transaction (payment contract deployed)
- View payment status & history

---

## 🔧 Contract Integration

### Deployed Contracts (Celo Mainnet)

| Contract | Address |
|----------|---------|
| PaymentFactory | `0x8D6259A4138032Df3FB6594012ff38Db1d1aB96c` |
| ConditionalPayment | *(deployed per-payment via factory)* |

**Verification:** [PaymentFactory on Celoscan](https://celoscan.io/address/0x8D6259A4138032Df3FB6594012ff38Db1d1aB96c#code)

### Hooks (`lib/hooks.ts`)

| Hook | Purpose |
|------|---------|
| `useCreateTimestampPayment()` | Create time-based payment |
| `useCreateManualPayment()` | Create manual approval payment |
| `useCreateRecurringPayment()` | Create recurring payment |
| `useUserPayments(address)` | Fetch payment IDs for a user |
| `useConditionalPayment(address)` | Read payment state (sender, recipient, amount, status) |
| `useExecutePayment()` | Execute payment (trigger release) |
| `useRefundPayment()` | Refund payment (retrieve funds) |
| `useApprovePayment()` | Approve manual payment |

---

## ⚙️ Configuration

### Networks

`lib/constants.ts` defines Celo networks:

```typescript
export const CELO_MAINNET = { chainId: 42220, /* ... */ }
export const CELO_ALFAJORES = { chainId: 44787, /* ... */ }
```

### Contract Addresses

Update `lib/constants.ts`:

```typescript
export const PAYMENT_FACTORY_ADDRESS = "0x8D6259A4138032Df3FB6594012ff38Db1d1aB96c"
```

---

## 🧪 Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
# → http://localhost:3000

# Build for production
npm run build

# Run linting
npm run lint
```

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
NEXT_PUBLIC_REOWN_PROJECT_ID=your_project_id_here
```

Get a Project ID from [Reown Cloud](https://cloud.reown.com).

---

## 📡 Network Setup

The app is configured for **Celo** using Reown AppKit networks. Ensure `Web3Provider.tsx` references:

```typescript
import { celo, celoAlfajores } from '@reown/appkit/networks'
networks: [celo, celoAlfajores],
```

RPC URLs are configured in `hardhat.config.ts` for the smart contracts and consumed via public endpoints in the frontend.

---

## 🔗 Links

- [Live Miniapp](https://paywhen.vercel.app/)
- [GitHub Repository](https://github.com/thebabalola/paywhen)
- [Smart Contracts](https://github.com/thebabalola/paywhen/tree/main/smartcontract)
- [PaymentFactory on Celoscan](https://celoscan.io/address/0x8D6259A4138032Df3FB6594012ff38Db1d1aB96c)
- [Celo Alfajores Faucet](https://faucet.celo.org/alfajores)

---

## 📄 License

MIT © PayWhen Protocol

