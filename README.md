# Spicy Content Premium — Secure Paywalled Content Platform

A production-ready Next.js application that gates sensitive photos behind Razorpay payments and delivers them exclusively via short-lived AWS S3/CloudFront signed URLs.

## Architecture

```
User → Landing Page (blurred preview)
     → Register/Login (JWT cookie)
     → Razorpay Checkout
     → /api/payments/verify (signature check)
     → Razorpay Webhook (payment.captured — authoritative)
     → /api/content/photos (auth + hasAccess check)
     → CloudFront/S3 Signed URL (5 min expiry)
```

## Security Model

- **No public S3 URLs** — bucket is private; images are never linked directly
- **Signed URLs expire in 5 minutes** — shared links stop working quickly
- **Webhook is authoritative** — access is granted even if the user closes the browser mid-checkout
- **JWT httpOnly cookies** — tokens are not accessible to client-side JavaScript
- **Payment signature verification** — HMAC-SHA256 validation on every callback

## Tech Stack

- Next.js 14 (App Router)
- Tailwind CSS + Lucide React
- MongoDB + Mongoose
- Razorpay (Orders, Verify, Webhooks)
- AWS S3 + CloudFront Signed URLs

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in your MongoDB, Razorpay, and AWS credentials.

### 3. AWS S3 Setup

1. Create a **private** S3 bucket (block all public access)
2. Upload photos under the `photos/` prefix (e.g. `photos/premium-01.jpg`)
3. Optionally configure CloudFront with a trusted key group for signed URLs

### 4. Razorpay Webhook Setup

In the Razorpay Dashboard, add a webhook pointing to:

```
https://your-domain.com/api/payments/webhook
```

Subscribe to: `payment.captured`, `payment.failed`

Set the webhook secret in `RAZORPAY_WEBHOOK_SECRET`.

### 4b. Razorpay test vs live mode

**Before Razorpay approves your website**, keep everything in test mode on both localhost and Render:

```env
RAZORPAY_ENV=test
NEXT_PUBLIC_RAZORPAY_ENV=test
NEXT_PUBLIC_DEV_SKIP_PAYMENT=false
RAZORPAY_TEST_KEY_ID=rzp_test_...
RAZORPAY_TEST_KEY_SECRET=...
```

Use the same test keys in your local `.env` and in the Render dashboard environment variables. The checkout UI shows a test-mode banner and accepts Razorpay sandbox cards (e.g. `4111 1111 1111 1111`).

After approval, switch to live mode:

```env
RAZORPAY_ENV=live
NEXT_PUBLIC_RAZORPAY_ENV=live
RAZORPAY_LIVE_KEY_ID=rzp_live_...
RAZORPAY_LIVE_KEY_SECRET=...
```

If you prefer separate variables, the app also supports:

- `RAZORPAY_TEST_KEY_ID` and `RAZORPAY_TEST_KEY_SECRET`
- `RAZORPAY_LIVE_KEY_ID` and `RAZORPAY_LIVE_KEY_SECRET`
- `RAZORPAY_TEST_WEBHOOK_SECRET` and `RAZORPAY_LIVE_WEBHOOK_SECRET`

If the order API returns an auth error such as invalid token, it usually means the selected key ID and secret do not belong to the same Razorpay environment. Check that the selected `RAZORPAY_ENV` matches the key pair.

### 4c. Render deployment (test mode)

Add these environment variables in Render → your service → **Environment** (mirror your local `.env`):

| Variable | Value |
|---|---|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Long random string |
| `RAZORPAY_ENV` | `test` |
| `NEXT_PUBLIC_RAZORPAY_ENV` | `test` |
| `NEXT_PUBLIC_DEV_SKIP_PAYMENT` | `false` |
| `RAZORPAY_TEST_KEY_ID` | `rzp_test_...` from Razorpay dashboard |
| `RAZORPAY_TEST_KEY_SECRET` | Matching test secret |
| AWS vars | Same as local |

After deploy, verify: `https://your-app.onrender.com/api/health` should return `"razorpayEnv": "test"` and `"razorpayCredentials": "ok"`.

Optional: in Razorpay Dashboard → Webhooks, add `https://your-app.onrender.com/api/payments/webhook` for `payment.captured`. Client-side verification already grants access if the user completes checkout, so webhooks are a backup.

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For webhook testing locally, use [ngrok](https://ngrok.com/) to expose your dev server.

## API Routes

| Route | Method | Auth | Description |
|---|---|---|---|
| `/api/auth/register` | POST | — | Create account |
| `/api/auth/login` | POST | — | Sign in |
| `/api/auth/logout` | POST | — | Clear session |
| `/api/auth/me` | GET | Cookie | Current user |
| `/api/payments/order` | POST | JWT | Create Razorpay order |
| `/api/payments/verify` | POST | JWT | Verify payment signature |
| `/api/payments/webhook` | POST | HMAC | Razorpay webhook handler |
| `/api/content/photos` | GET | JWT + paid | Return signed photo URLs |

## Database Schemas

**User**: `email`, `password` (bcrypt), `hasAccess`, `createdAt`

**Order**: `userId`, `razorpayOrderId`, `razorpayPaymentId`, `amount`, `status`, `updatedAt`

## Production Checklist

- [ ] Set strong `JWT_SECRET`
- [ ] Use Razorpay live keys
- [ ] Configure HTTPS (required for secure cookies)
- [ ] Set S3 bucket policy to deny public access
- [ ] Enable CloudFront signed URLs with key rotation
- [ ] Register webhook URL in Razorpay dashboard
- [ ] Set `CONTENT_PRICE_PAISE` to your desired price
