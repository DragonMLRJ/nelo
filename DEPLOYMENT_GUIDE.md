# Nelo Marketplace - Deployment Guide

## ⚠️ Critical Issues to Resolve

### 1. Supabase Database Password

**Status**: ❌ Password authentication failed

The migration script failed with:
```
password authentication failed for user "postgres"
```

**Action Required**: Get the correct database password from Supabase:

1. Go to [Supabase Dashboard](https://app.supabase.com/project/nzyuwfxghaujzzfjewze)
2. Navigate to **Settings** → **Database**
3. Look for **Connection String** section
4. Find your database password (or reset it if needed)
5. Update the password in these files:
   - [.env](file:///C:/Users/drago/Downloads/nelo-marketplace/.env) - Line 33: `DATABASE_PASSWORD=YOUR_ACTUAL_PASSWORD`
   - [docker-compose.yml](file:///C:/Users/drago/Downloads/nelo-marketplace/docker-compose.yml) - Line 63 (if hardcoded)

**Quick Fix:**
```bash
# Open .env file and update this line:
DATABASE_PASSWORD=YOUR_ACTUAL_PASSWORD_FROM_SUPABASE
```

---

### 2. Docker Desktop

**Status**: ⏳ Not Running

**Action Required**:
1. Press **Windows Key**
2. Type "Docker Desktop"
3. Click to open
4. Wait for Docker to fully start (green icon in system tray)

Then run:
```bash
docker-start-local.bat
```

Or manually:
```bash
docker-compose build
docker-compose up -d
```

---

## 🚀 Step-by-Step Deployment Guide

### Phase 1: Fix Database Password

```bash
# 1. Get password from Supabase Dashboard
# 2. Update .env file
code .env  # or notepad .env

# 3. Verify by running:
$env:DATABASE_PASSWORD="YOUR_PASSWORD"
node scripts/test_db_connection.js
```

---

### Phase 2: Run Database Migrations

Once password is correct:

```bash
# Run all migrations
node scripts/run_all_migrations.js
```

Expected output:
```
✅ Connected successfully!
🔄 Running: 001_chat_schema.sql...
✅ Success: 001_chat_schema.sql
...
🎉 All migrations completed successfully!
```

---

### Phase 3: Test Locally with Docker

```bash
# 1. Ensure Docker Desktop is running
docker ps

# 2. Build and start containers
docker-compose build
docker-compose up -d

# 3. Check status
docker-compose ps

# 4. View logs
docker-compose logs -f
```

**Test URLs:**
- Frontend: http://localhost:3000
- PHP Backend: http://localhost:8000

**Verify:**
- ✅ Frontend loads correctly
- ✅ Can register/login
- ✅ Products display
- ✅ No console errors

---

### Phase 4: Deploy to Render.com

#### A. Push to GitHub

```bash
git add .
git commit -m "Configure Supabase PostgreSQL and fix deployment settings"
git push origin main
```

#### B. Deploy via Render Dashboard

1. **Login to Render**: https://dashboard.render.com
2. **Create New Blueprint**:
   - Click "New" → "Blueprint"
   - Select your GitHub repository
   - Choose `render.yaml`
   - Click "Apply"

3. **Set Environment Variables** (marked `sync: false` in render.yaml):

| Service | Variable | Value | Where to Get |
|---------|----------|-------|--------------|
| **Frontend** | `VITE_SUPABASE_ANON_KEY` | `eyJhbGc...` | [.env](file:///C:/Users/drago/Downloads/nelo-marketplace/.env) line 27 |
| **PHP Backend** | `DB_PASS` | Your Supabase password | Supabase Dashboard |
| **PHP Backend** | `FLW_PUBLIC_KEY` | `FLWPUBK_TEST-xxx` | [.env](file:///C:/Users/drago/Downloads/nelo-marketplace/.env) line 12 |
| **PHP Backend** | `FLW_SECRET_HASH` | Your hash | [.env](file:///C:/Users/drago/Downloads/nelo-marketplace/.env) line 13 |
| **PHP Backend** | `SMTP_HOST` | `smtp.gmail.com` | [.env](file:///C:/Users/drago/Downloads/nelo-marketplace/.env) line 16 |
| **PHP Backend** | `SMTP_USER` | Your email | [.env](file:///C:/Users/drago/Downloads/nelo-marketplace/.env) line 18 |
| **PHP Backend** | `SMTP_PASS` | App password | [.env](file:///C:/Users/drago/Downloads/nelo-marketplace/.env) line 19 |
| **Node Backend** | `DATABASE_URL` | PostgreSQL URL | [.env](file:///C:/Users/drago/Downloads/nelo-marketplace/.env) line 32 |
| **Node Backend** | `VITE_SUPABASE_ANON_KEY` | `eyJhbGc...` | [.env](file:///C:/Users/drago/Downloads/nelo-marketplace/.env) line 27 |

4. **Deploy**:
   - Click "Create Services"
   - Wait for builds to complete (5-10 minutes)
   - Check logs for errors

---

## 📋 Quick Reference Commands

### Database
```bash
# Test connection
node scripts/test_db_connection.js

# Run migrations
node scripts/run_all_migrations.js
```

### Docker
```bash
# Start (automated)
docker-start-local.bat

# Start (manual)
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f php-backend
docker-compose logs -f frontend

# Rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Git
```bash
# Commit and push
git add .
git commit -m "Your message"
git push origin main
```

---

## ✅ Verification Checklist

### Local Testing
- [ ] Supabase password updated in `.env`
- [ ] Database migrations ran successfully
- [ ] Docker Desktop is running
- [ ] Containers built successfully (`docker-compose build`)
- [ ] Services started (`docker-compose up -d`)
- [ ] Frontend loads at http://localhost:3000
- [ ] PHP backend responds at http://localhost:8000
- [ ] Can register new user
- [ ] Can view products
- [ ] No errors in browser console
- [ ] No errors in Docker logs

### Render.com Deployment
- [ ] Code pushed to GitHub
- [ ] Blueprint created from render.yaml
- [ ] All environment variables set
- [ ] All 3 services deployed successfully
- [ ] Frontend is accessible via Render URL
- [ ] API endpoints work (test /auth, /products)
- [ ] Database connection works
- [ ] Payment integration configured
- [ ] SMTP email working

---

## 🐛 Troubleshooting

### Database Connection Failed

**Error**: `password authentication failed`

**Fix**:
1. Get correct password from Supabase Dashboard
2. Update `.env`: `DATABASE_PASSWORD=correct_password`
3. Test: `node scripts/test_db_connection.js`

---

### Docker Build Failed

**Error**: `error during connect`

**Fix**:
1. Ensure Docker Desktop is running
2. Check system tray for Docker icon (should be green)
3. Restart Docker Desktop if needed

---

### Migration Failed

**Error**: `column already exists` or `table already exists`

**Fix**:
This is normal if migrations were partially run. The script skips already-applied migrations automatically.

To force re-run:
```sql
-- Connect to Supabase SQL Editor
DELETE FROM schema_migrations WHERE migration_name = '015_cart_tables';
```

---

### Port Already in Use

**Error**: `port 3000 is already allocated`

**Fix**:
```bash
# Stop all containers
docker-compose down

# Check what's using the port
netstat -ano | findstr :3000

# Kill the process or change port in docker-compose.yml
```

---

## 📞 Need Help?

1. **Check logs**: `docker-compose logs -f`
2. **View container status**: `docker-compose ps`
3. **Test database**: `node scripts/test_db_connection.js`
4. **Rebuild clean**: `docker-compose down && docker-compose build --no-cache`

---

## 🎯 Current Status

| Component | Status | Next Action |
|-----------|--------|-------------|
| Database Migrations | ⚠️ Blocked | Update password in `.env` |
| Docker Local | ⏳ Pending | Start Docker Desktop |
| Render Deployment | ✅ Ready | Push to GitHub & deploy |

**Immediate Next Steps:**
1. Get Supabase password → Update `.env`
2. Run: `node scripts/run_all_migrations.js`
3. Start Docker Desktop
4. Run: `docker-compose build && docker-compose up -d`
5. Test at http://localhost:3000
6. Deploy to Render.com
