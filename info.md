# Environment Info Template (Safe)

Use this file as a local checklist only.
Do not store real secrets in this file.

## Supabase

- Project ID: `<project_id>`
- DATABASE_URL: `postgresql://<user>:<password>@<host>:<port>/<db>?pgbouncer=true`
- DIRECT_URL: `postgresql://<user>:<password>@<host>:<port>/<db>`

## Paystack

- Secret key: `<PAYSTACK_SECRET_KEY>`
- Public key: `<PAYSTACK_PUBLIC_KEY>`
- Webhook URL: `https://<your-domain>/api/paystack/webhook`

## App URL

- NEXT_PUBLIC_APP_URL: `https://<your-domain>`

## Security checklist

- Keep real values only in `.env` and deployment environment settings
- Never commit plaintext keys
- Rotate keys immediately if exposed
