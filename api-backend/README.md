# PayWhen — API Backend

Lightweight API backend for PayWhen protocol. Provides REST endpoints for payment tracking and on-chain data.

## Features

- Health check endpoint
- Payment status tracking
- On-chain event indexing
- Celo network RPC proxy

## Setup

```bash
cd api-backend
pip install -r requirements.txt
uvicorn main:app --reload
```

## Endpoints

- `GET /health` — Health check
- `GET /api/payments/{user_address}` — Get user payments
- `GET /api/payment/{id}` — Get payment details
- `POST /api/webhook/condition` — Webhook for condition monitoring

## License

MIT
