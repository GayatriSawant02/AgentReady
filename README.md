# AgentReady

AgentReady makes a merchant store ready for AI buyers: AI-readable, AI-negotiable, and AI-transactable within merchant-defined boundaries.

> Prototype Agent-Readable Commerce Layer inspired by emerging agentic commerce protocols.

This is a Razorpay AI Hackathon Track 1 prototype. The AI recommends; the backend recalculates prices and policy decisions; only an approved order can enter payment.

## Architecture

```text
Merchant Catalog
  -> Agent-Readable Catalog
  -> AI Buyer Recommendation
  -> Deterministic Policy Engine
  -> Approved / Blocked
  -> Razorpay TEST Mode or Demo Payment Mode
  -> Audit Trail
```

The LLM is never trusted with money or financial calculations. Product identity, inventory, price, discount, minimum price, totals, and merchant limits are checked server-side.

## Features

- Merchant catalog and AI commerce rule management
- Structured catalog at `GET /api/catalog/agent-readable`
- Provider-agnostic AI recommendation adapter
- Deterministic policy checks and human approval threshold
- Approved and blocked order workflow
- Razorpay TEST checkout with server-side verification
- Clearly labeled local `DEMO PAYMENT MODE` without credentials
- Chronological order audit trail
- Successful and blocked one-click demo scenarios

## Setup

Prerequisites: Node.js 18+ and npm.

1. Install frontend dependencies:

   ```powershell
   npm install
   ```

2. Install backend dependencies:

   ```powershell
   Push-Location server
   npm install
   Pop-Location
   ```

3. Copy `.env.example` to `server/.env` and fill in the services you use. Never commit `.env`.

## Supabase Setup

1. Create a Supabase project.
2. Open the Supabase SQL Editor.
3. Run [`supabase_schema.sql`](supabase_schema.sql) to create and seed the tables.
4. Set `SUPABASE_URL` and the server-side `SUPABASE_KEY` in `server/.env`.

Without Supabase credentials, the backend uses the seeded in-memory store for local demos.

## AI API Setup

The AI adapter is optional. Set `AI_API_URL`, `AI_API_KEY`, and `AI_MODEL` for an OpenAI-compatible chat-completions provider. The key stays on the backend. Without these values, AgentReady uses its deterministic local intent parser for the demo requests.

The provider is allowed to return intent hints only. Backend catalog data remains authoritative.

## Razorpay Setup

Use Razorpay TEST credentials only:

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

The secret is read only by the backend. Payment creation reloads the order, recalculates the amount, reruns policy checks, and creates a Razorpay test order only for `APPROVED` orders. Payment verification checks the signature, Razorpay order, payment amount, order relationship, and payment status server-side.

When credentials are absent, the UI shows `DEMO PAYMENT MODE`. This local path is deliberately labeled and is not a Razorpay success.

## Environment Variables

See [`.env.example`](.env.example):

- `PORT`
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `AI_API_URL`
- `AI_API_KEY`
- `AI_MODEL`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

## Local Development

Start the backend in one terminal:

```powershell
Push-Location server
npm start
```

Start the frontend in another:

```powershell
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` requests to `http://localhost:5000`.

## Demo Instructions

1. Open **AI Buyer**.
2. Select **Try Successful Demo**.
3. Confirm MacBook Air M4 x 6, 5% discount, and ₹5,70,000.
4. Confirm policy approval.
5. Start checkout. With no Razorpay credentials, complete the clearly labeled demo payment; with TEST credentials, use Razorpay Standard Checkout.
6. Select **Try Blocked Demo**.
7. Confirm the 20-unit request is blocked by the ₹10,00,000 merchant limit and no payment order is created.
8. Review both order traces in **Orders** and **Audit**.

## Deployment

### Frontend

Deploy the repository root to Vercel with:

- Build command: `npm run build`
- Output directory: `dist`

Configure the deployed frontend's API proxy or set the backend origin according to the hosting setup. The included Vite proxy is for local development.

### Backend

Deploy `server/` to Render, Railway, or another Node.js host:

- Build/install command: `npm install`
- Start command: `npm start`
- Configure all required environment variables in the host dashboard.
- Use a server-side Supabase key and Razorpay TEST credentials during the hackathon.
- Configure CORS for the deployed frontend origin before public production use.

## Limitations

- No authentication, multi-merchant accounts, RBAC, shipping, or production payment mode
- Local fallback storage is in-memory and resets when the backend restarts
- AI provider integration expects an OpenAI-compatible JSON response and remains optional
- Demo payment mode is only a local demonstration path
- This prototype does not claim official ACP or AP2 compliance
