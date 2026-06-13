# Quick Start Guide 🚀

Get Track Hire backend up and running in under 5 minutes!

## Prerequisites ✅

- [Node.js 20+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- npm or yarn

## Option 1: Development Mode (Recommended) 🛠️

Perfect for local development with hot-reload.

```bash
# 1. Clone and install
git clone <repo-url>
cd track-hire-be
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your credentials (DATABASE_URL, SMTP, etc.)

# 3. Start Redis & RabbitMQ
docker compose -f docker-compose.dev.yml up -d

# 4. Setup database
npm run prisma:migrate
npm run prisma:seed

# 5. Start dev server
npm run dev
```

**✨ Done!** Server running on http://localhost:3000

**📚 API Docs:** http://localhost:3000/api-docs

**🐰 RabbitMQ UI:** http://localhost:15672 (guest/guest)

---

## Option 2: Production Mode (Full Docker) 🐳

Everything runs in Docker containers.

```bash
# 1. Clone and configure
git clone <repo-url>
cd track-hire-be
cp .env.docker.example .env.docker
# Edit .env.docker with your credentials

# 2. Build and start
docker compose up -d --build

# 3. View logs
docker compose logs -f app
```

**✨ Done!** Server running on http://localhost:3000

---

## Quick Commands 📝

### Development Mode

```bash
# Start services
docker compose -f docker-compose.dev.yml up -d

# Stop services
docker compose -f docker-compose.dev.yml down

# Start dev server
npm run dev
```

### Production Mode

```bash
# Start all
docker compose up -d

# Stop all
docker compose down

# View logs
docker compose logs -f

# Rebuild after code changes
docker compose up -d --build app
```

---

## Test Your Setup ✅

### 1. Health Check

```bash
curl http://localhost:3000/
```

Should return: "Track Hire API is running!"

### 2. Register a User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

### 3. Check Queue (RabbitMQ)

Visit http://localhost:15672 and check the `email_jobs` queue.

---

## Environment Variables 🔐

### For Development Mode

Use `.env` file with localhost URLs:

```env
# Development .env
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://localhost:5672
# ... other variables
```

### For Production Mode (Docker)

Use `.env.docker` file (values will be overridden by docker-compose.yml):

```env
# Production .env.docker
DATABASE_URL=postgresql://...
NODE_ENV=production
CLIENT_URL=https://your-domain.com
JWT_SECRET=your-strong-secret
# ... other variables

# These are overridden by docker-compose.yml
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://localhost:5672
```

**Important:** In production Docker mode, `REDIS_URL` and `RABBITMQ_URL` are automatically overridden to use Docker service names (`redis:6379`, `rabbitmq:5672`).

See `.env.example` and `.env.docker.example` for complete variable list.

---

## Troubleshooting 🔧

### Port Already in Use

```bash
# Change ports in docker-compose.yml or docker-compose.dev.yml
# Example: Change 3000:3000 to 3001:3000
```

### Docker Not Running

```bash
# Windows: Start Docker Desktop
# Mac: Open Docker Desktop
# Linux: sudo systemctl start docker
```

### Database Connection Error

```bash
# Verify DATABASE_URL in .env
# Check if database exists
# Run migrations: npm run prisma:migrate
```

### Redis/RabbitMQ Connection Error

```bash
# Check if containers are running
docker ps

# Restart containers
docker compose -f docker-compose.dev.yml restart
```

---

## Next Steps 📚

1. **Read Full Docs:**
   - [README.md](../README.md) - Complete project documentation
   - [docker-setup.md](./docker-setup.md) - Detailed Docker guide
   - [docker-implementation.md](./docker-implementation.md) - Implementation details

2. **Explore API:**
   - Visit http://localhost:3000/api-docs
   - Try endpoints with Swagger UI

3. **Connect Frontend:**
   - Update frontend API URL to http://localhost:3000
   - Configure CORS in `.env` if needed

4. **Deploy to Production:**
   - Follow production checklist in [docker-setup.md](./docker-setup.md)
   - Consider managed services for Redis & RabbitMQ

---

## Quick Reference 📖

### Default Ports

- **Backend:** 3000
- **Redis:** 6379
- **RabbitMQ AMQP:** 5672
- **RabbitMQ UI:** 15672

### Default Credentials

- **RabbitMQ:** guest / guest
- **Admin User:** (created by seed script)
  - Username: from ADMIN_USERNAME env
  - Email: from ADMIN_EMAIL env
  - Password: from ADMIN_PASSWORD env

### Key Files

- `.env` - Environment variables
- `docker-compose.yml` - Production setup
- `docker-compose.dev.yml` - Development setup
- `prisma/schema.prisma` - Database schema

---

## Need Help? 💬

1. Check [docker-setup.md](./docker-setup.md) troubleshooting section
2. View logs: `docker compose logs -f`
3. Check service health: `docker compose ps`
4. Open an issue on GitHub

---

**Happy coding! 🎉**
