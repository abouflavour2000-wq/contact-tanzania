# TANZANIA CONTACTS – Status Views Registration System

Next.js + Tailwind CSS + Supabase PostgreSQL/Auth. Designed for a maximum of **1,000 contacts**. Only the authenticated admin can view or export phone numbers.

## 1. What is included

- Public registration page (name, Tanzania phone number, consent checkbox).
- Public registration status and participant count (no personal data exposed).
- Atomic PostgreSQL registration function with a transaction-level advisory lock and unique phone constraint.
- Admin login using Supabase Auth.
- Admin dashboard: participant count, remaining places, open/close registration, WhatsApp invite link, searchable participant list, VCF export.
- Server-side admin verification on every admin API request.
- RLS enabled; no public policies for private tables.

## 2. Requirements

- Node.js 20.9+ (Node 22 LTS recommended)
- A Supabase project
- A Vercel account for deployment

## 3. Supabase setup

1. Create a project at https://supabase.com/.
2. Open **SQL Editor** in the Supabase dashboard.
3. Copy and run the complete contents of `supabase/schema.sql`.
4. Open **Project Settings → API** and copy:
   - Project URL
   - anon / publishable key
   - service_role key (keep this secret)
5. Open **Authentication → Users** and create the admin user with email/password.
6. Ensure that admin email exactly matches `ADMIN_EMAIL` in your deployment environment.

> Important: `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS. It is used only by server-side route handlers. Never prefix it with `NEXT_PUBLIC_`, expose it in client code, or commit it to Git.

## 4. Local setup

```bash
# Extract the ZIP, then open terminal in the project folder
npm install
cp .env.example .env.local
```

Edit `.env.local` and set real values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_OR_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
ADMIN_EMAIL=admin@example.com
APP_RATE_LIMIT_SALT=use-a-long-random-value
```

Then run:

```bash
npm run dev
```

Open http://localhost:3000.

## 5. Admin

Open `/admin`, sign in with the Supabase Auth user created above. The backend checks the bearer token with Supabase Auth and compares the verified email to `ADMIN_EMAIL`. Hiding `/admin` is not treated as security.

From the dashboard, the admin can:
- View total registered and remaining slots.
- Search the latest 500 registrations.
- Download all up to 1,000 contacts as `Tanzania-Contacts.vcf`.
- Update the WhatsApp group invite link.
- Open or close registration.

## 6. Deploy to Vercel

1. Push this project to a private GitHub repository.
2. In https://vercel.com/, import that repository.
3. Add the same four environment variables from `.env.local` under **Project → Settings → Environment Variables**. Do not add `.env.local` to Git.
4. Deploy. Open the deployed URL and test registration and admin login.

## 7. Important privacy and operational notes

- Phone numbers are not returned by any public endpoint. Only the admin APIs return them.
- A registrant sees the WhatsApp invite link after successful registration; this does not expose the contact list.
- Get clear, informed consent before collecting and using phone numbers. Explain who can access them, the Status Views purpose, retention, and how a person can request correction/deletion.
- Keep the Supabase service role key private and restrict access to the Vercel project.
- Before a public launch, add production-grade rate limiting and CAPTCHA (for example, a server-side Turnstile verification). This starter does not claim to include robust distributed rate limiting.
- Back up the Supabase database and test recovery.
- The VCF export is sensitive personal data. Store downloaded files securely and do not share them without the participants' permission.

## 8. Capacity and behavior

The database function serializes registrations with `pg_advisory_xact_lock`, checks the count inside the transaction, and inserts only while fewer than 1,000 contacts exist. A unique constraint prevents duplicate phone numbers. The database is the source of truth; the public progress bar is informational.

## 9. Troubleshooting

- `Missing Supabase server environment variables`: check `.env.local`, then restart `npm run dev`.
- Admin gets 403: confirm `ADMIN_EMAIL` matches the verified Supabase Auth email.
- Registration RPC error: run `supabase/schema.sql` completely and verify the `register_contact` function exists.
- Group link not shown: admin must save a valid `https://chat.whatsapp.com/...` invite URL.
