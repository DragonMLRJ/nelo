# 🐳 Nelo Marketplace - Docker Quick Reference

## 🚀 Quick Commands

| Action | Command |
|--------|---------|
| **Start** | `docker-start.bat` or `docker-compose up -d` |
| **Stop** | `docker-stop.bat` or `docker-compose down` |
| **Rebuild** | `docker-rebuild.bat` or `docker-compose up -d --build` |
| **View Logs** | `docker-compose logs -f` |
| **Status** | `docker-compose ps` |

## 🌐 Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| **Marketplace** | http://localhost:3000 | - |
| **phpMyAdmin** | http://localhost:8080 | root / admin123 |
| **MySQL** | localhost:3306 | root / admin123 |

## 📦 Containers

| Container | Purpose | Port |
|-----------|---------|------|
| `nelo-frontend` | React + Nginx | 3000 → 80 |
| `nelo-php-backend` | PHP + Apache | Internal |
| `nelo-mysql` | MySQL 8.0 | 3306 |
| `nelo-phpmyadmin` | DB Admin | 8080 |

## 🔧 Useful Commands

### Database Access
```bash
# MySQL CLI
docker-compose exec mysql mysql -uroot -padmin123 nelo_marketplace

# Import SQL
docker-compose exec -T mysql mysql -uroot -padmin123 nelo_marketplace < database/schema.sql

# Backup
docker-compose exec mysql mysqldump -uroot -padmin123 nelo_marketplace > backup.sql
```

### Container Management
```bash
# Restart specific service
docker-compose restart frontend

# View specific logs
docker-compose logs -f php-backend

# Access container shell
docker-compose exec php-backend bash
```

### Cleanup
```bash
# Stop and remove containers
docker-compose down

# Also remove volumes (database data)
docker-compose down -v

# Remove images
docker rmi nelo-marketplace-frontend nelo-marketplace-php-backend
```

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Port already in use | Change port in `docker-compose.yml` |
| Database won't start | Check logs: `docker-compose logs mysql` |
| Frontend not loading | Rebuild: `docker-compose up -d --build frontend` |
| Can't connect to DB | Wait 10s for health check, then restart |

## 📁 Key Files

- `docker-compose.yml` - Service configuration
- `Dockerfile` - Frontend build
- `Dockerfile.php` - Backend build
- `nginx.conf` - Web server config
- `DOCKER.md` - Full documentation

## 🔄 Development Workflow

1. **Start containers**: `docker-start.bat`
2. **Make changes**:
   - Frontend: Edit files → Rebuild container
   - Backend: Edit `api/` files → Changes are immediate
3. **View logs**: `docker-compose logs -f`
4. **Test**: http://localhost:3000
5. **Stop**: `docker-stop.bat`

## 🎯 First Time Setup

```bash
# 1. Start everything
docker-compose up -d

# 2. Wait for services (30 seconds)
timeout /t 30

# 3. Check status
docker-compose ps

# 4. Open browser
start http://localhost:3000
```

## 📊 Resource Usage

Typical resource consumption:
- **CPU**: ~5-10% idle, ~30-50% under load
- **RAM**: ~1.5-2GB total
- **Disk**: ~2GB for images + database data

## 🔒 Security Notes

**Default passwords are for development only!**

For production:
1. Change all passwords in `docker-compose.yml`
2. Use `.env` file for secrets
3. Remove or restrict phpMyAdmin
4. Enable HTTPS
5. Use non-root MySQL user

## 📖 More Help

- Full documentation: [DOCKER.md](DOCKER.md)
- Project README: [README.md](README.md)
- Database schema: [database/schema.sql](database/schema.sql)
