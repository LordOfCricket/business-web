# business-web Deployment Guide

This document describes the architecture, GCP Cloud Run deployment configuration, backend microservices integration, and deployment procedures for `business-web`.

---

## 1. Architecture Overview

`business-web` is the sports business portal for venue owners, academy managers, tournament organisers, and referees.

- **Framework**: Next.js 16 (App Router) + React 19 + Tailwind CSS 4.
- **Hosting**: Google Cloud Run (`asia-south2`).
- **Container**: Node.js 24 Alpine multi-stage Docker build producing a minimal standalone Next.js image.
- **Backend Communication**:
  - The browser interacts exclusively with `business-web`.
  - Next.js server components and Route Handlers (`/api/bff/*`) communicate securely with the **API Gateway** (`https://gateway-981116867868.asia-south2.run.app`).
  - Outgoing gateway requests attach Google IAM ID tokens (`X-Serverless-Authorization`) generated automatically via Google metadata server.
  - The API Gateway transparently routes to all backend microservices:
    - `identity-service` (auth, tokens, business profiles)
    - `business-service` (venues, facilities, products, orders, inventory)
    - `sports-service` (tournaments, scoring, match officiating)
    - `commerce-service` (orders, invoices)
    - `payment-service` (settlements, payouts)
    - `discovery-service` (sports catalogue)
    - `notification-service` (alerts, notifications)

---

## 2. CI/CD Deployment via GitHub Actions

Every push to the `main` branch executes `.github/workflows/deploy.yml`:

1. **Validation Job**: Runs `npm run lint`, `npm run typecheck`, unit tests (`npm test`), and Next.js standalone build.
2. **Authentication**: Authenticates to GCP using the GitHub repository secret `GCP_SA_KEY`.
3. **Artifact Registry**: Builds multi-stage Docker image and pushes to `asia-south2-docker.pkg.dev/test-sports-509906/newsports/business-web`.
4. **Cloud Run Deployment**:
   - Deploys `business-web` service with CPU boost and autoscaling (0–3 instances).
   - Injects environment variables: `GATEWAY_URL`, `GATEWAY_IAM_AUDIENCE`, `NEXT_PUBLIC_SITE_URL`, `CUSTOMER_SITE_URL`, `ADMIN_SITE_URL`, `LAUNCHED_SPORTS`.
5. **Health Check Probe**: Automatically pings `/api/health` to confirm the deployment is healthy and responding.

---

## 3. GitHub Secrets & Variables Configuration

In your GitHub repository (**Settings → Secrets and variables → Actions**):

### Repository Secrets (`Secrets` tab)

| Secret Name | Description | Value |
|---|---|---|
| `GCP_SA_KEY` | **(Required)** Service Account JSON key for deployment | JSON key for `testsports@test-sports-509906.iam.gserviceaccount.com` |
| `FRONTEND_PROXY_KEY` | *(Optional)* Shared proxy key (if not using Secret Manager) | `local-frontend-proxy-key` (or your secret key) |

### Repository Variables (`Variables` tab - Optional Overrides)

| Variable Name | Default Value | Description |
|---|---|---|
| `GCP_PROJECT_ID` | `test-sports-509906` | GCP Project ID |
| `GCP_PROJECT_NUMBER` | `981116867868` | GCP Project Number |
| `GCP_REGION` | `asia-south2` | Deployment Region |
| `GAR_REPO` | `newsports` | Artifact Registry repository |
| `SERVICE_ACCOUNT` | `981116867868-compute@developer.gserviceaccount.com` | Cloud Run runtime service account |
| `LAUNCHED_SPORTS` | `cricket,karate` | Comma-separated active sports |

---

## 4. Direct Deployment (PowerShell)

To deploy directly from your local workstation:

```powershell
cd D:\Projects\NewSports\business-web
.\deploy.ps1
```

Or skip lint/test checks for rapid hotfixing:

```powershell
.\deploy.ps1 -SkipChecks
```

---

## 5. Connecting Cloud Run Directly with GitHub (Console Option)

If configuring Cloud Run continuous deployment through Google Cloud Console:

1. Open **[GCP Cloud Run Console](https://console.cloud.google.com/run?project=test-sports-509906)**.
2. Click **Create Service** or select `business-web`.
3. Choose **Continuously deploy from a repository**.
4. Select **GitHub** and connect repository `business-web`.
5. Select Build Type: **Dockerfile** (path: `/Dockerfile`).
6. Under **Container, Variables & Secrets**:
   - Port: `3000`
   - Memory: `512 MiB`, CPU: `1`
   - Min instances: `0`, Max instances: `3`
   - Service account: `981116867868-compute@developer.gserviceaccount.com`
   - Add Environment Variables:
     - `GATEWAY_URL` = `https://gateway-981116867868.asia-south2.run.app`
     - `GATEWAY_IAM_AUDIENCE` = `https://gateway-981116867868.asia-south2.run.app`
     - `NEXT_PUBLIC_SITE_URL` = `https://business-web-981116867868.asia-south2.run.app`
     - `CUSTOMER_SITE_URL` = `https://customer-web-981116867868.asia-south2.run.app`
     - `ADMIN_SITE_URL` = `https://admin-web-981116867868.asia-south2.run.app`
     - `LAUNCHED_SPORTS` = `cricket,karate`
     - `FRONTEND_PROXY_KEY` = `local-frontend-proxy-key`
7. Click **Deploy**.

---

## 6. Verification and Troubleshooting

Check service health:
```bash
curl -I https://business-web-981116867868.asia-south2.run.app/api/health
```

Inspect Cloud Run logs:
```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=business-web" --project=test-sports-509906 --limit=50
```
