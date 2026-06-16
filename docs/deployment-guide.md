# 🚀 Deployment Guide - Track Hire Backend

## 📋 Overview

This guide covers deploying the Track Hire backend API to production at `https://api.track-hire.app`.

---

## 🌐 Production URLs

| Service             | URL                                 | Purpose           |
| ------------------- | ----------------------------------- | ----------------- |
| **Frontend (www)**  | https://www.track-hire.app          | Main application  |
| **Frontend (apex)** | https://track-hire.app              | Redirect to www   |
| **API**             | https://api.track-hire.app          | Backend API       |
| **Swagger Docs**    | https://api.track-hire.app/api-docs | API documentation |

---

## ✅ Pre-Deployment Checklist

### **1. Environment Variables**

Create `.env` file on production server with production values.

**Copy from template:**

```bash
cp .env.example .env
nano .env  # Edit with production values
```

**Important production changes:**

```env
NODE_ENV=production
CLIENT_URL=https://www.track-hire.app
ALLOWED_ORIGINS=https://www.track-hire.app,https://track-hire.app
API_URL=https://api.track-hire.app

# Generate NEW JWT secrets!
JWT_SECRET=your-new-production-secret-min-32-chars
JWT_REFRESH_SECRET=your-new-production-refresh-secret

# Use production database
DATABASE_URL="postgresql://..."

# Use production Redis & RabbitMQ
REDIS_URL=redis://your-redis-host:6379
RABBITMQ_URL=amqp://your-rabbitmq-host:5672
```

### **2. Security Checklist**

- [ ] Generate NEW JWT secrets (min 32 characters)
- [ ] Use HTTPS only (NODE_ENV=production)
- [ ] Remove localhost from ALLOWED_ORIGINS
- [ ] Use production database (not development)
- [ ] Enable SSL for Redis and RabbitMQ
- [ ] Use strong passwords for admin account
- [ ] Keep .env file secure (never commit!)

### **3. Dependencies Checklist**

- [ ] Node.js 20+ installed
- [ ] npm or yarn installed
- [ ] PostgreSQL database ready
- [ ] Redis server running
- [ ] RabbitMQ server running

---

## 🚀 Deployment Options

### **Option 1: VPS/Cloud Server (DigitalOcean, AWS EC2, etc.)**

#### **Step 1: Setup Server**

```bash
# SSH into your server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2 (process manager)
npm install -g pm2

# Install Nginx (reverse proxy)
apt install -y nginx

# Install Docker (for Redis & RabbitMQ)
curl -fsSL https://get.docker.com | sh
```

#### **Step 2: Setup Redis & RabbitMQ**

```bash
# Create docker-compose.prod.yml
cat > docker-compose.prod.yml << EOF
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    restart: always
    ports:
      - "127.0.0.1:6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

  rabbitmq:
    image: rabbitmq:3-management-alpine
    restart: always
    ports:
      - "127.0.0.1:5672:5672"
      - "127.0.0.1:15672:15672"
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: your-secure-password

volumes:
  redis_data:
  rabbitmq_data:
EOF

# Start services
docker-compose -f docker-compose.prod.yml up -d
```

#### **Step 3: Clone Repository**

```bash
# Create app directory
mkdir -p /var/www/track-hire-api
cd /var/www/track-hire-api

# Clone repository
git clone your-repository-url .

# Install dependencies
npm install --production

# Copy and configure environment
cp .env.example .env
nano .env  # Edit with production values
```

#### **Step 4: Build Application**

```bash
# Build TypeScript
npm run build

# Run database migrations
npm run prisma:migrate

# Generate Prisma client
npm run prisma:generate

# (Optional) Seed database
npm run prisma:seed
```

#### **Step 5: Start with PM2**

```bash
# Start application
pm2 start dist/server.js --name track-hire-api

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Run the command PM2 outputs

# Check status
pm2 status
pm2 logs track-hire-api
```

#### **Step 6: Configure Nginx**

```bash
# Create Nginx config
cat > /etc/nginx/sites-available/api.track-hire.app << EOF
server {
    listen 80;
    server_name api.track-hire.app;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/api.track-hire.app /etc/nginx/sites-enabled/

# Test Nginx config
nginx -t

# Restart Nginx
systemctl restart nginx
```

#### **Step 7: Setup SSL with Certbot**

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d api.track-hire.app

# Auto-renewal is configured automatically
# Test renewal
certbot renew --dry-run
```

---

### **Option 2: Platform as a Service (Heroku, Railway, Render)**

#### **Railway.app (Recommended)**

1. **Create account:** https://railway.app/
2. **New Project** → **Deploy from GitHub**
3. **Connect repository**
4. **Add services:**
   - PostgreSQL (built-in)
   - Redis (built-in)
   - RabbitMQ (from template)
5. **Add environment variables** (from checklist above)
6. **Configure custom domain:** `api.track-hire.app`
7. **Deploy!**

**Railway will automatically:**

- Build your app (`npm run build`)
- Run migrations
- Start the server
- Handle SSL certificates

#### **Render.com**

1. **Create account:** https://render.com/
2. **New** → **Web Service**
3. **Connect repository**
4. **Configure:**
   ```
   Name: track-hire-api
   Environment: Node
   Build Command: npm install && npm run build && npm run prisma:generate
   Start Command: npm start
   ```
5. **Add environment variables**
6. **Add Redis** (from dashboard)
7. **Add RabbitMQ** (external service)
8. **Configure custom domain:** `api.track-hire.app`
9. **Deploy!**

---

### **Option 3: Serverless (Vercel, Netlify Functions)**

**⚠️ Not Recommended** - Backend needs:

- Long-running connections (Redis, RabbitMQ)
- Background workers (email queue)
- WebSocket support (future features)

Use VPS or PaaS instead.

---

## 🔧 Post-Deployment

### **1. Verify Deployment**

```bash
# Check API health
curl https://api.track-hire.app/

# Check API docs
open https://api.track-hire.app/api-docs

# Test authentication
curl -X POST https://api.track-hire.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","name":"Test","email":"test@example.com","password":"Test123!"}'
```

### **2. Update Frontend**

Update frontend environment variables:

```env
# Frontend .env.production
VITE_API_URL=https://api.track-hire.app
```

Rebuild and redeploy frontend.

### **3. Test CORS**

From frontend:

```javascript
// Should work now
fetch("https://api.track-hire.app/api/auth/me", {
  credentials: "include",
});
```

### **4. Monitor Application**

```bash
# PM2 monitoring
pm2 monit

# Check logs
pm2 logs track-hire-api

# Check status
pm2 status

# Restart if needed
pm2 restart track-hire-api
```

---

## 🔄 Updates & Maintenance

### **Deploy Updates**

```bash
# SSH to server
ssh root@your-server-ip

# Navigate to app directory
cd /var/www/track-hire-api

# Pull latest changes
git pull origin main

# Install new dependencies
npm install --production

# Rebuild
npm run build

# Run new migrations
npm run prisma:migrate

# Regenerate Prisma client
npm run prisma:generate

# Restart app
pm2 restart track-hire-api

# Check logs
pm2 logs track-hire-api
```

### **Database Backup**

```bash
# Backup PostgreSQL
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Upload to cloud storage
# Or use your hosting provider's backup feature
```

### **Monitor Logs**

```bash
# PM2 logs
pm2 logs track-hire-api --lines 100

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Application errors
grep "ERROR" ~/.pm2/logs/track-hire-api-error.log
```

---

## 🐛 Troubleshooting

### **Problem: 502 Bad Gateway**

**Check:**

1. Is app running? `pm2 status`
2. Check logs: `pm2 logs`
3. Check port: `lsof -i :3000`
4. Restart: `pm2 restart track-hire-api`

### **Problem: CORS Error**

**Check:**

1. ALLOWED_ORIGINS includes frontend URL
2. Frontend URL matches exactly (www vs apex)
3. Server restarted after env changes
4. Check logs for CORS warnings

### **Problem: Database Connection Error**

**Check:**

1. DATABASE_URL correct in .env
2. Database server running
3. SSL mode correct (`sslmode=require`)
4. IP whitelisted (if using hosted DB)

### **Problem: Redis/RabbitMQ Connection Error**

**Check:**

1. Services running: `docker-compose ps`
2. URLs correct in .env
3. Firewall allowing connections
4. Check logs: `docker-compose logs`

### **Problem: SSL Certificate Issues**

**Check:**

1. DNS pointing to correct server
2. Certbot renewal working: `certbot renew --dry-run`
3. Nginx config correct: `nginx -t`
4. Certificate not expired: `certbot certificates`

---

## 📊 Performance Optimization

### **1. Enable Compression**

```nginx
# In Nginx config
gzip on;
gzip_types application/json;
gzip_min_length 1000;
```

### **2. Rate Limiting**

```nginx
# In Nginx config
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req zone=api burst=20;
```

### **3. Caching**

Already implemented in app:

- ✅ Redis caching for dashboard stats
- ✅ AI extraction results cached
- ✅ Rate limiting with Redis

### **4. Database Connection Pooling**

Already configured in Prisma:

```typescript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### **5. PM2 Cluster Mode**

```bash
# Use multiple CPU cores
pm2 start dist/server.js -i max --name track-hire-api
```

---

## 🔐 Security Hardening

### **1. Firewall**

```bash
# UFW firewall
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable
```

### **2. Fail2Ban**

```bash
# Install Fail2Ban
apt install -y fail2ban

# Configure for Nginx
systemctl enable fail2ban
systemctl start fail2ban
```

### **3. Keep System Updated**

```bash
# Auto-updates
apt install -y unattended-upgrades
dpkg-reconfigure --priority=low unattended-upgrades
```

### **4. Environment Variables Security**

```bash
# Secure .env file
chmod 600 .env
chown www-data:www-data .env
```

---

## 📈 Monitoring & Alerts

### **Option 1: PM2 Plus** (Paid)

```bash
pm2 plus
```

Features:

- Real-time monitoring
- Error tracking
- Email alerts
- Performance metrics

### **Option 2: Self-hosted Monitoring**

Install monitoring tools:

- **Prometheus** - Metrics collection
- **Grafana** - Dashboards
- **Loki** - Log aggregation

---

## ✅ Production Checklist

**Before going live:**

- [ ] Environment variables configured
- [ ] SSL certificate installed
- [ ] CORS configured correctly
- [ ] Database migrations run
- [ ] Redis & RabbitMQ running
- [ ] PM2 auto-start enabled
- [ ] Nginx configured and tested
- [ ] Firewall rules set
- [ ] Backups configured
- [ ] Monitoring setup
- [ ] Error tracking enabled
- [ ] Documentation updated
- [ ] Frontend updated with API URL
- [ ] Test all endpoints
- [ ] Load testing done
- [ ] Security audit passed

---

## 🆘 Support & Resources

**Documentation:**

- [API Documentation](https://api.track-hire.app/api-docs)
- [CORS Configuration](./cors-configuration.md)
- [Email Setup](./gmail-custom-domain-setup.md)

**Hosting Providers:**

- [Railway.app](https://railway.app/) - Recommended PaaS
- [Render.com](https://render.com/) - Alternative PaaS
- [DigitalOcean](https://www.digitalocean.com/) - VPS
- [AWS EC2](https://aws.amazon.com/ec2/) - Cloud compute

**External Services:**

- [Neon](https://neon.tech/) - PostgreSQL database
- [Upstash](https://upstash.com/) - Redis hosting
- [CloudAMQP](https://www.cloudamqp.com/) - RabbitMQ hosting

---

**Your API is ready for production!** 🚀

For questions or issues, check the troubleshooting section above or open an issue on GitHub.
