# Portfolio deployment

## Architecture

The public site and JavaScript API functions run on Vercel. Blog storage stays in the existing HIGH-Q MySQL host behind an HTTPS bridge:

`Browser → Vercel /api → signed HTTPS request → HIGH-Q PHP bridge → MySQL`

The bridge uses a separate portfolio secret and whitelisted actions. Vercel never receives the MySQL password.

## HIGH-Q host

1. Run `server_deploy/portfolio-api/schema.sql` in the HIGH-Q MySQL database.
2. Upload the contents of `server_deploy/portfolio-api/` to `public_html/portfolio-api/`.
3. Add `PORTFOLIO_BRIDGE_SECRET` to the HIGH-Q `.env`. Generate a unique 32-byte value; do not reuse the Attendance bridge secret.
4. Confirm that `https://highqsolidacademy.com/portfolio-api/` rejects unsigned requests with HTTP 401.

## Vercel secrets

Set these as Vercel **Secret** variables for Production. Use separate values for Preview if previews need backend access:

- `PORTFOLIO_BRIDGE_URL=https://highqsolidacademy.com/portfolio-api/`
- `PORTFOLIO_BRIDGE_SECRET`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_ENCRYPTION`
- `SMTP_FROM_ADDRESS`
- `SMTP_FROM_NAME`
- `CONTACT_RECIPIENT`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD_HASH`
- `ADMIN_SESSION_SECRET`

Map the HIGH-Q mail settings privately: `MAIL_HOST` → `SMTP_HOST`, `MAIL_PORT` → `SMTP_PORT`, `MAIL_USERNAME` → `SMTP_USER`, `MAIL_PASSWORD` → `SMTP_PASS`, `MAIL_ENCRYPTION` → `SMTP_ENCRYPTION`, and `MAIL_FROM_ADDRESS` → `SMTP_FROM_ADDRESS`.

Generate `ADMIN_PASSWORD_HASH` locally with:

`node scripts/generate-admin-hash.js "a-new-unique-password"`

Never reuse the HIGH-Q admin password, database credentials, API keys or Attendance bridge secret.

## Email anti-spoofing

The domain currently has SPF but no DMARC record. Enable DKIM with the actual outbound SMTP provider before enforcing DMARC. Begin with monitoring, review the reports, then move to quarantine and reject.

Initial Cloudflare TXT record at `_dmarc`:

`v=DMARC1; p=none; rua=mailto:YOUR-DMARC-REPORT-INBOX; adkim=s; aspf=s; pct=100`

After verifying every legitimate sender, change `p=none` to `p=quarantine`, then `p=reject`. Change the current SPF `~all` to `-all` only after all legitimate senders are included. Use the DKIM selector and public key supplied by the SMTP provider—never guess it.
