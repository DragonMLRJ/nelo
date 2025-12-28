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

### Docker Scripts

- `docker-start.bat` - Start all services
- `docker-stop.bat` - Stop all services
- `docker-rebuild.bat` - Rebuild and restart

## 📝 License

Private project for Nelo Marketplace.
