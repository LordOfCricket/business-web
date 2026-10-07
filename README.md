# business-web

The portal for venue owners, sellers, academies, organisers and professionals: onboarding, the dashboard, venues and facilities, bookings, the shop (products, inventory, orders), staff, payments, reviews, disputes, settings, tournaments, the organiser pages for football, tennis, badminton and karate, cricket scoring, umpiring and refereeing, and professional profiles.

Next.js 16 (App Router) + Tailwind CSS 4, one of the three NewSports web apps (`customer-web`, `business-web`,
`admin-web`) next to the services in `NewSports/`. It talks to one backend only, the NewSports **gateway**, and only from
its own server: the browser calls this app (pages, server actions, the `/api/bff/*` proxy), and the app calls the gateway
with the user's token taken from an httpOnly cookie.

## Sign-in and roles
Identity issues the tokens (`/api/v1/auth/*` through the gateway); this app keeps them in httpOnly cookies and
`src/proxy.ts` refreshes them before they expire. Any account for onboarding and a professional profile; the business modules need the `OWNER` role (identity grants it once the account belongs to a business) or `ADMIN`. Others are sent to `/onboarding/business`. These checks only steer the pages: the gateway and the
services enforce every permission.

## Local
Start the NewSports stack (`local-dev/newsports.ps1 up`, gateway on `http://localhost:8080`), then:
```bash
cp .env.example .env.local
npm install
npm run dev        # http://localhost:3001
```

## Configuration
Read on the server at run time (`src/lib/env.ts`), so one image serves every environment. No secrets reach the browser.

| Variable | |
|---|---|
| `GATEWAY_URL` | The API gateway. Locally the NewSports gateway, `http://localhost:8080`. |
| `GATEWAY_IAM_AUDIENCE` | Cloud Run only: the gateway's URL. The gateway is a private Cloud Run service, so the app sends a Google ID token for it (`X-Serverless-Authorization`), as the services do among themselves. Unset locally. |
| `NEXT_PUBLIC_SITE_URL` | This site's own address (canonical URLs, and the same-origin check on writes through the BFF). |
| `FRONTEND_PROXY_KEY` | Must equal the gateway's `FRONTEND_PROXY_KEY`; lets the gateway rate-limit per visitor, not per web server. |
| `CUSTOMER_SITE_URL` | customer-web, for "view in the shop" links. |
| `LAUNCHED_SPORTS` | Sports live on the platform, comma separated. |

## Checks
```bash
npm run lint && npm run typecheck && npm test && npm run build
```

## Deploy
`.github/workflows/deploy.yml`: every push and pull request runs the checks; a push to `main` also builds the Docker
image (multi-stage, standalone Next.js server, non-root, port 3000), pushes it to Artifact Registry
(`asia-south2-docker.pkg.dev/test-sports-509906/newsports/business-web`) and deploys the Cloud Run service `business-web`, public,
running as the services' runtime service account so it may call the private gateway. The workflow finds the gateway's
URL itself and gives each site the others' Cloud Run addresses. It needs the repository secret `GCP_SA_KEY` (the same
deployer key as the services), and optionally the Secret Manager secret `frontend-proxy-key`.

## Shared foundation
The three web apps are separate repositories, like the services. A small foundation is kept identical in all three
(the services keep `platform-commons` the same way): change it in one app, copy it to the other two.

```
src/components/ui/*            Badge, Button, Card, EmptyState, ErrorState, Input, Modal, Pagination, Select,
                               Skeleton, Table, Tabs (+ index)
src/components/layout/HeaderChrome.tsx   src/components/shared/Icons.tsx   src/components/sports/SportArt.tsx
src/features/auth/components/SessionControls.tsx
src/lib/api/gateway.ts         server-side calls to the gateway
src/lib/api/gateway-auth.ts    the Cloud Run ID token for the private gateway
src/lib/api/client-context.ts  browser IP / user agent forwarded to the gateway
src/lib/auth/cookies.ts  src/lib/auth/jwt.ts   session cookies, token decoding
src/lib/security/csp.ts  src/lib/utils/cn.ts  src/types/api.ts  src/app/globals.css
src/app/api/bff/[...path]/route.ts  src/app/api/health/route.ts
```
Everything else (pages, features, `proxy.ts`, `lib/env.ts`, `lib/auth/session.ts`, `lib/api/bff.ts`) belongs to this app.
