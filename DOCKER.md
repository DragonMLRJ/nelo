# 🐳 Docker Setup for Nelo Marketplace

This guide will help you run the Nelo Marketplace using Docker containers.

## 📋 Prerequisites

- Docker Desktop installed and running
- At least 4GB of free RAM
- Ports 3000, 3306, and 8080 available

## 🚀 Quick Start

### 1. Build and Start All Services

```bash
docker-compose up -d
```

This will start:
- **MySQL Database** (port 3306)
- **PHP Backend** (internal)
- **React Frontend** (port 3000)
- **phpMyAdmin** (port 8080)

### 2. Access the Application

- **Marketplace**: http://localhost:3000
- **phpMyAdmin**: http://localhost:8080
  - Username: `root`
  - Password: `admin123`

### 3. Stop All Services

```bash
docker-compose down
```

To also remove volumes (database data):
```bash
docker-compose down -v
```

## 🔧 Useful Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f php-backend
docker-compose logs -f mysql
```

### Rebuild After Code Changes

```bash
# Rebuild and restart
docker-compose up -d --build

# Rebuild specific service
docker-compose up -d --build frontend
```

### Execute Commands in Containers

```bash
# Access MySQL CLI
docker-compose exec mysql mysql -uroot -padmin123 nelo_marketplace

# Access PHP container shell
docker-compose exec php-backend bash

# Access frontend container shell
docker-compose exec frontend sh
```

### Check Service Status

```bash
docker-compose ps
```

## 🗄️ Database Management

### Import SQL File

```bash
docker-compose exec -T mysql mysql -uroot -padmin123 nelo_marketplace < database/schema.sql
```

### Backup Database

```bash
docker-compose exec mysql mysqldump -uroot -padmin123 nelo_marketplace > backup.sql
```

### Reset Database

```bash
docker-compose down -v
docker-compose up -d
```

## 🔍 Troubleshooting

### Port Already in Use

If you get a port conflict error:

```bash
# Check what's using the port
netstat -ano | findstr :3000

# Change the port in docker-compose.yml
# Under frontend service, change "3000:80" to "3001:80"
```

### Database Connection Issues

```bash
# Check if MySQL is healthy
docker-compose ps

# View MySQL logs
docker-compose logs mysql

# Restart MySQL
docker-compose restart mysql
```

### Frontend Not Loading

```bash
# Rebuild frontend
docker-compose up -d --build frontend

# Check logs
docker-compose logs frontend
```

### Clear Everything and Start Fresh

```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v

# Remove images
docker rmi nelo-marketplace-frontend nelo-marketplace-php-backend

# Rebuild everything
docker-compose up -d --build
```

## 🏗️ Architecture

```
┌─────────────────┐
│   Browser       │
│  localhost:3000 │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Nginx          │
│  (Frontend)     │
│  Port 80        │
└────────┬────────┘
         │
         │ /api/* requests
         ▼
┌─────────────────┐
│  Apache + PHP   │
│  (Backend)      │
│  Port 80        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  MySQL 8.0      │
│  (Database)     │
│  Port 3306      │
└─────────────────┘
```

## 🌐 Environment Variables

The PHP backend automatically detects if it's running in Docker and uses the appropriate database configuration:

- **Docker**: Uses environment variables from `docker-compose.yml`
- **Local**: Falls back to hardcoded values (localhost, root, admin123)

## 📦 What's Included

- **Multi-stage Docker build** for optimized frontend image
- **Nginx** for serving React app with API proxy
- **PHP 8.2 + Apache** for backend APIs
- **MySQL 8.0** with automatic schema initialization
- **phpMyAdmin** for easy database management
- **Health checks** to ensure services start in correct order
- **Persistent volumes** for database data
- **Hot reload** for development (API files are mounted as volumes)

## 🔐 Security Notes

For production deployment:
1. Change all default passwords
2. Use environment variables from `.env` file
3. Enable HTTPS with SSL certificates
4. Restrict phpMyAdmin access or remove it
5. Use non-root MySQL user
6. Enable firewall rules

## 📝 Development Workflow

1. **Frontend changes**: Edit files → Docker will serve the built version (rebuild needed)
2. **Backend changes**: Edit `api/` files → Changes are immediate (volume mounted)
3. **Database changes**: Use phpMyAdmin or MySQL CLI

For active frontend development, consider running Vite locally:
```bash
npm run dev
```

Then update the API calls to point to `http://localhost/api/` instead of `/api/`.
