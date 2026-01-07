# ☁️ Vercel Deployment Guide

## 1. Prerequisites
Since Vercel is "Serverless", it cannot talk to your Local Database (Docker MySQL).
You **MUST** use a cloud database for the Backend to work on Vercel.

**Recommended Cloud Databases (MySQL compatible):**
*   [Aiven MySQL](https://aiven.io/mysql) (Free Tier available)
*   [PlanetScale](https://planetscale.com/) (Requires schema changes usually, but compatible)
*   [Clever Cloud](https://www.clever-cloud.com/)

## 2. Environment Variables
On your Vercel Project Dashboard, go to **Settings > Environment Variables** and add:

```bash
# Database (Must be CLOUD accessible)
DB_HOST=mysql-service.CLOUD-PROVIDER.com
DB_USER=your_user
DB_PASS=your_password
DB_NAME=nelo_marketplace

# Flutterwave
FLW_PUBLIC_KEY=...
FLW_SECRET_HASH=...

# Email
SMTP_HOST=...
SMTP_USER=...
SMTP_PASS=...
```

## 3. Deployment
1.  Install Vercel CLI: `npm i -g vercel`
2.  Run deploy:
    ```bash
    vercel
    ```
3.  Set settings to default (Vite).
