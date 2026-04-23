# 📘 Product Requirements Document (PRD)

## Product Name: PayWhen (Working Title)

---

## 🧠 Overview

PayWhen is an intent-based payment protocol that allows users to define conditions under which funds are automatically executed on-chain.

Instead of sending money immediately, users define rules such as:

- “Send when delivery is confirmed”
- “Pay every Friday”
- “Release funds after milestone completion”

The system converts user intent into enforceable on-chain payment logic.

---

## 🎯 Problem Statement

Payments today are:

- Manual
- Trust-based
- Non-conditional

Users often rely on:

- Verbal agreements
- Manual follow-ups
- Third-party intermediaries

This creates friction, disputes, and inefficiency.

---

## 💡 Solution

Enable programmable payments based on conditions.

Users define:

- Recipient
- Amount
- Trigger condition

The protocol:

- Holds funds in escrow
- Monitors condition
- Executes payment automatically

---

## 🧩 Core Features

### 1. Conditional Payment Contracts

- Create payment with condition
- Funds locked in escrow
- Executes when condition is met

---

### 2. Supported Conditions (MVP)

#### Time-based

- Execute at timestamp
- Recurring payments (weekly/monthly)

#### Manual Trigger (trusted party)

- Recipient confirms delivery
- Multi-party approval

#### Oracle-based (Phase 2)

- GPS/location verification
- API-based triggers

---

### 3. Payment Types

- One-time conditional payments
- Recurring subscriptions
- Group contributions (threshold unlock)

---

### 4. Escrow System

- Funds locked in smart contract
- Refund logic if condition fails
- Optional dispute timeout

---

### 5. Miniapp Integration

- Lightweight UI for:
  - Creating payment
  - Viewing status
  - Triggering execution

---

## 🔁 User Flow

1. User selects “Create Payment”
2. Inputs:
   - Amount
   - Recipient
   - Condition
3. Funds are deposited into contract
4. Condition monitored
5. Payment executes automatically

---

## 🏗️ Architecture

### Smart Contracts

- `PaymentFactory`
  - Creates new payment contracts

- `ConditionalPayment`
  - Stores:
    - Sender
    - Recipient
    - Amount
    - Condition logic

- `ConditionRegistry` (optional)
  - Standardized condition handlers

---

### Frontend

- Next.js + TypeScript
- Wallet connection (wagmi/viem)
- Mobile-first UI

---

## 🔐 Security Considerations

- Reentrancy protection
- Escrow fund safety
- Condition validation
- Timeout fallback logic

---

## 📊 Success Metrics

- Number of payments created
- Total transaction volume
- Unique users
- Execution success rate

---

## 🚀 Roadmap

### Phase 1 (MVP)

- Time-based payments
- Manual trigger
- Simple UI

### Phase 2

- Oracle integrations
- Recurring payments
- Notifications

### Phase 3

- SDK for developers
- API integrations
- Cross-app triggers

---

## 🎯 Positioning

A mobile-first payment miniapp that transforms user intent into automated financial execution.

---

## 🧠 Key Differentiator

Not just sending money —  
but defining behavior that money follows.
