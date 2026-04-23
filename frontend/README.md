# PayWhen — Miniapp Frontend

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-000000?style=flat-square&logo=nextdotjs)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Wagmi](https://img.shields.io/badge/Wagmi-v3-8FA828?style=flat-square)](https://wagmi.sh)
[![Network](https://img.shields.io/badge/Celo-Testnet-16D14E?style=flat-square&logo=celo)](https://celo.org)

Next.js 16.1.1 frontend for the PayWhen intent-based payment protocol on Celo. 8 pages, real-time on-chain data, and a full olive green design system.

**[Live Miniapp](https://paywhen.vercel.app/) · [Main Repo](https://github.com/BitBand-Labs/paywhen)**

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
| Reown AppKit | latest | Wallet modal |

---

## 📁 Project Structure

```
frontend/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Landing page — payment creation
│   ├── payments/                 # View all payments
│   ├── create/                   # Step-by-step payment setup
│   ├── history/                  # Past payments & execution log
│   └── layout.tsx                # Root layout with ThemeProvider
├── components/                   # React components
│   ├── CreatePayment.tsx         # Payment creation form
│   ├── PaymentCard.tsx           # Single payment display
│   ├── PaymentList.tsx           # List of user payments
│   ├── Navbar.tsx                # Navigation with wallet connect
│   ├── ThemeToggle.tsx           # Dark/light mode switch
│   └── Toast.tsx                 # Notification toasts
├── hooks/                        # Custom React hooks
│   ├── usePaymentFactory.ts      # Factory contract interactions
│   └── useConditionalPayment.ts  # Payment contract interactions
├── lib/                          # Utilities & configs
│   ├── wagmi.ts                  # Wagmi configuration
│   ├── constants.ts              # Contract addresses, chains
│   └── abis.ts                   # Contract ABIs
└── public/                       # Static assets
```

---

## 🎨 Features

### Core Functionality
- **Create Payments**: Time-based, manual approval, recurring
- **View Payments**: Filter by status (active/pending/completed)
- **Execute Payments**: Manual trigger when conditions met
- **Refund Payments**: Get funds back after timeout
- **Real-time Status**: Live updates via contract events

### UI/UX
- **Mobile-First**: Optimized for small screens
- **Dark/Light Mode**: Toggle with system preference
- **Wallet Connect**: Reown AppKit integration
- **Smooth Animations**: Framer Motion transitions
- **Toast Notifications**: Action feedback

---

## 🚦 Available Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with payment creation |
| `/payments` | List of all your payments |
| `/create` | Step-by-step payment setup wizard |
| `/create/time` | Create time-based payment |
| `/create/manual` | Create manual approval payment |
| `/create/recurring` | Create recurring payment |
| `/history` | Past payments & execution log |

---

## 🧩 Components

| Component | File | Description |
|-----------|------|-------------|
| `CreatePayment` | `components/CreatePayment.tsx` | Payment creation form (step wizard) |
| `PaymentCard` | `components/PaymentCard.tsx` | Single payment display with status |
| `PaymentList` | `components/PaymentList.tsx` | Grid/list of user payments |
| `Navbar` | `components/Navbar.tsx` | Top navigation with wallet connect |
| `ThemeToggle` | `components/ThemeToggle.tsx` | Dark/light mode switch |
| `Toast` | `components/Toast.tsx` | Notification system (success/error) |

---

## 🪝 Custom Hooks

### `usePaymentFactory()`
Reads from and writes to `PaymentFactory.sol`:

| Hook | Description |
|------|-------------|
| `useTotalPayments()` | Returns total number of payments created |
| `useUserPayments(address)` | Returns payment IDs for a user |
| `useCreateTimePayment()` | Creates a timestamp-based payment |
| `useCreateManualPayment()` | Creates a manual approval payment |
| `useCreateRecurringPayment()` | Creates a recurring payment |

### `useConditionalPayment()`
Reads from and writes to `ConditionalPayment.sol` instances:

| Hook | Description |
|------|-------------|
| `usePaymentData(address)` | Multi-read: status, amount, condition state |
| `useExecutePayment(address)` | Calls `execute()` to trigger payment |
| `useRefundPayment(address)` | Calls `refund()` to get funds back |
| `useApproveManual(address)` | Approves a manual payment |
| `useCheckCondition(address)` | Checks if condition is met |

---

## ⚙️ Configuration

### Contract Addresses

Update `frontend/lib/constants.ts` with deployed addresses:

```typescript
export const CONTRACTS = {
  PaymentFactory: {
    celoAlfajores: '0x...',
    celoMainnet: '0x...'
  }
} as const;
```

### Networks

Supported networks in `wagmi.ts`:
- **Celo Alfajores** (testnet)
- **Celo Mainnet** (production)

---

## 🧪 Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key
NEXT_PUBLIC_INFURA_KEY=your_infura_key
```

---

## 🔗 Links

- [Live Miniapp](https://paywhen.vercel.app/)
- [GitHub Repository](https://github.com/BitBand-Labs/paywhen)
- [Smart Contracts](https://github.com/BitBand-Labs/paywhen/tree/main/smartcontract)
- [Celo Alfajores Faucet](https://faucet.celo.org/alfajores)

---

## 📄 License

MIT © PayWhen Protocol
