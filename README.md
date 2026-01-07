<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🛍️ Nelo Marketplace

A modern marketplace application for Congo-Brazzaville built with React, TypeScript, PHP, and MySQL.

## 🚀 Quick Start

### Option 1: Docker (Recommended)

**Prerequisites:** Docker Desktop

1. **Start the application:**
   ```bash
   docker-start.bat
   ```
   Or manually:
   ```bash
   docker-compose up -d
   ```

2. **Access the application:**
   - Marketplace: http://localhost:3000
   - phpMyAdmin: http://localhost:8080 (root/admin123)

3. **Stop the application:**
   ```bash
   docker-stop.bat
   ```

📖 See [DOCKER.md](DOCKER.md) for detailed Docker documentation.

### Option 2: Local Development

**Prerequisites:** Node.js, PHP 8.2+, MySQL 8.0+

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup database:**
   - Create database `nelo_marketplace`
   - Import `database/schema.sql`
   - Update credentials in `api/config/database.php`

3. **Run the app:**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
nelo-marketplace/
├── api/                 # PHP backend APIs
│   ├── auth/           # Authentication endpoints
│   ├── products/       # Product endpoints
│   └── config/         # Database configuration
├── components/         # React components
├── pages/             # Application pages
├── database/          # SQL schemas
└── docker-compose.yml # Docker configuration
```

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Framer Motion
- **Backend:** PHP 8.2, Apache
- **Database:** MySQL 8.0
- **Containerization:** Docker, Docker Compose

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🔐 Security & Payments

### Payment Integration (Phase 3 & 4)
This project uses **Flutterwave** for payments.
- **Frontend**: `PaymentModal.tsx` handles card and mobile money inputs.
- **Backend Verification**: `api/payment/webhook.php` verifies the transaction signature serverside.

### Envrionment Variables
Add these to your `.env` file (or `docker-compose.yml` for local dev):
```yaml
# Payment
FLW_PUBLIC_KEY=FLWPUBK_TEST-xxxxxxxx
FLW_SECRET_HASH=your_secret_hash_here # Must match Flutterwave Dashboard

# Email (SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=password
SMTP_FROM_EMAIL=no-reply@nelo.cg
```

### Legal Pages (Phase 5)
Standard policy pages are located in `src/pages/legal/`. ensuring compliance with local regulations.

## 📝 Development Workflow

### Docker Scripts

- `docker-start.bat` - Start all services
- `docker-stop.bat` - Stop all services
- `docker-rebuild.bat` - Rebuild and restart

## 📝 License

Private project for Nelo Marketplace.
