# Docker Setup Guide

This guide explains how to run the complete Track Hire backend (including Redis, RabbitMQ, and the Node.js app) using Docker Compose.

## Prerequisites

- Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Ensure Docker is running on your machine

## Two Deployment Modes

### 1. Development Mode (Recommended for Local Development)

Run only Redis and RabbitMQ in Docker, run the app locally with hot-reload.

**Uses:** `.env` file

### 2. Production Mode (Full Containerization)

Run everything (Redis, RabbitMQ, and the app) in Docker containers.

**Uses:** `.env.docker` file

---

## Environment Files Explained

| File                  | Purpose                  | Used By            | Git |
| --------------------- | ------------------------ | ------------------ | --- |
| `.env`                | Local development        | Development mode   | ❌  |
| `.env.example`        | Template (all variables) | Documentation      | ✅  |
| `.env.docker`         | Production Docker        | docker-compose.yml | ❌  |
| `.env.docker.example` | Template for Docker      | Documentation      | ✅  |

**Key Difference:**

- `.env`: Uses `localhost:6379` (services in Docker, app on host)
- `.env.docker`: Overridden to use `redis:6379` (all in Docker network)

---

## Development Mode Setup

### Quick Start

1. **Copy environment file:**

```bash
cp .env.example .env
# Edit .env with your actual credentials
```

2. **Start only Redis and RabbitMQ:**

```bash
docker compose -f docker-compose.dev.yml up -d
```

3. **Install dependencies:**

```bash
npm install
```

4. **Run Prisma migrations:**

```bash
npm run prisma:migrate
```

5. **Seed the database:**

```bash
npm run prisma:seed
```

6. **Start the backend in development mode:**

```bash
npm run dev
```

Your app will run on http://localhost:3000 with hot-reload enabled.

### Stop Development Services

```bash
docker compose -f docker-compose.dev.yml down
```

---

## Production Mode Setup (Full Docker)

### Quick Start

1. **Setup Docker environment file:**

```bash
cp .env.docker.example .env.docker
# Edit .env.docker with your production credentials
```

2. **Build and start all services:**

```bash
docker compose up -d --build
```

This will:

- Build the Node.js application image
- Start Redis container
- Start RabbitMQ container
- Start the application container
- Run Prisma migrations automatically
- Seed the database (if needed)

3. **Verify all containers are running:**

```bash
docker compose ps
```

You should see:

- `track-hire-redis`
- `track-hire-rabbitmq`
- `track-hire-backend`

4. **View logs:**

```bash
docker compose logs -f app
```

Your app will be available at http://localhost:3000

### Stop Production Services

```bash
docker compose down
```

### Rebuild After Code Changes

```bash
docker compose up -d --build app
```

---

## Services

### Redis

- **Port:** 6379
- **Purpose:** Caching and rate limiting
- **Container Name:**
  - Dev: `track-hire-redis-dev`
  - Prod: `track-hire-redis`
- **Usage:**
  - Dashboard stats caching (5 minutes TTL)
  - AI import job extraction caching (7 days TTL)
  - Rate limiting for AI imports (10 requests per hour per user)

### RabbitMQ

- **AMQP Port:** 5672 (message queue)
- **Management UI:** 15672
- **Container Name:**
  - Dev: `track-hire-rabbitmq-dev`
  - Prod: `track-hire-rabbitmq`
- **Purpose:** Asynchronous email processing
- **Default Credentials:**
  - Username: `guest`
  - Password: `guest`

**Access Management UI:** [http://localhost:15672](http://localhost:15672)

### Backend App (Production Mode Only)

- **Port:** 3000
- **Container Name:** `track-hire-backend`
- **Image:** Built from Dockerfile
- **Health Check:** HTTP GET to `/`
- **Auto-restart:** Yes

---

## Docker Commands

### Development Mode

#### Start services

```bash
docker compose -f docker-compose.dev.yml up -d
```

#### Stop services

```bash
docker compose -f docker-compose.dev.yml down
```

#### View logs

```bash
docker compose -f docker-compose.dev.yml logs -f
```

#### Restart services

```bash
docker compose -f docker-compose.dev.yml restart
```

### Production Mode

#### Start all services

```bash
docker compose up -d
```

#### Build and start

```bash
docker compose up -d --build
```

#### Stop all services

```bash
docker compose down
```

#### Stop and remove volumes

```bash
docker compose down -v
```

#### View all logs

```bash
docker compose logs -f
```

#### View specific service logs

```bash
docker compose logs -f app
docker compose logs -f redis
docker compose logs -f rabbitmq
```

#### Restart specific service

```bash
docker compose restart app
```

#### Rebuild specific service

```bash
docker compose up -d --build app
```

#### Execute command in container

```bash
docker compose exec app sh
```

#### View container resource usage

```bash
docker stats
```

---

## RabbitMQ Management UI

Access the RabbitMQ management interface at: [http://localhost:15672](http://localhost:15672)

Features:

- Monitor queue status
- View message rates
- Check consumer connections
- Manage queues and exchanges

### Queues Used

- **email_jobs**: Verification emails and password reset emails

---

## Environment Variables

### For Development Mode (.env)

```env
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://localhost:5672
```

### For Production Mode (Docker Compose handles this)

The app container uses internal Docker network names:

- Redis: `redis://redis:6379`
- RabbitMQ: `amqp://rabbitmq:5672`

**Note:** Other environment variables are passed from your `.env` file to the container.

---

## Development vs Production Behavior

### Development Mode (`NODE_ENV=development`)

- Redis unavailable: Caching skipped, operations continue normally
- RabbitMQ unavailable: Email sent directly via SMTP (fallback)
- Hot-reload enabled with nodemon
- Detailed error messages

### Production Mode (`NODE_ENV=production`)

- Redis unavailable: Server fails to start
- RabbitMQ unavailable: Server fails to start
- Email queue publish failure: Transaction rolled back, returns 503 error
- Optimized build with TypeScript compiled to JavaScript
- Non-root user for security
- Health checks enabled

---

## Caching Strategy

### Dashboard Stats Cache

- **Key Pattern:** `dashboard:stats:<userId>`
- **TTL:** 5 minutes (300 seconds)
- **Invalidation:** On application create, update, or delete

### AI Import Cache

- **Key Pattern:** `ai-import:<sha256-hash-of-url>`
- **TTL:** 7 days (604800 seconds)
- **Policy:** Cache ONLY successful extractions, NOT errors

### Rate Limiting

- **Key Pattern:** `ai-import:rate:<userId>`
- **Implementation:** Redis sorted sets with sliding window
- **Limit:** 10 AI extractions per hour per user

---

## Email Queue Flow

### Registration Email

1. User registers → User created in DB
2. Verification token generated
3. Email job published to `email_jobs` queue
4. If publish fails in production:
   - Token deleted
   - User deleted (rollback)
   - Returns 503 error
5. Worker processes email asynchronously

### Password Reset Email

1. User requests reset → Token created
2. Email job published to `email_jobs` queue
3. If publish fails in production:
   - Token deleted (rollback)
   - Returns 503 error
4. Worker processes email asynchronously

---

## Troubleshooting

### Containers not starting

```bash
# Check Docker is running
docker info

# Check logs for errors
docker compose logs

# Check specific service
docker compose logs app
```

### Port conflicts

If ports 3000, 6379, 5672, or 15672 are already in use, modify `docker-compose.yml`:

```yaml
services:
  app:
    ports:
      - "3001:3000" # Changed external port
  redis:
    ports:
      - "6380:6379" # Changed external port
  rabbitmq:
    ports:
      - "5673:5672" # Changed external port
      - "15673:15672" # Changed external port
```

### Build failures

```bash
# Clean build (remove old images)
docker compose down --rmi all
docker compose build --no-cache
docker compose up -d
```

### Database connection issues

1. Verify DATABASE_URL in .env is correct
2. Ensure database is accessible from Docker container
3. For Neon DB, ensure IP/domain is whitelisted

### RabbitMQ connection refused

```bash
# Check if RabbitMQ is ready
docker compose logs rabbitmq

# Wait for health check to pass
docker compose ps

# Restart if needed
docker compose restart rabbitmq
```

### Redis connection refused

```bash
# Check if Redis is ready
docker compose logs redis

# Restart if needed
docker compose restart redis
```

### App container keeps restarting

```bash
# Check app logs for errors
docker compose logs app

# Common causes:
# - Missing environment variables
# - Database connection failed
# - Redis/RabbitMQ not ready (wait for health checks)
```

### Prisma migration issues

```bash
# Run migrations manually
docker compose exec app npx prisma migrate deploy

# Or rebuild container
docker compose up -d --build app
```

---

## Testing Queue Durability

1. **Send verification email:**

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

2. **Stop RabbitMQ:**

```bash
docker compose stop rabbitmq
```

3. **Restart RabbitMQ:**

```bash
docker compose start rabbitmq
```

4. **Check worker logs:**

```bash
docker compose logs -f app
```

The email should still be processed after restart because:

- Queue is durable (`{ durable: true }`)
- Message is persistent (`{ persistent: true }`)

---

## Performance Monitoring

### View container stats

```bash
docker stats
```

### Check disk usage

```bash
docker system df
```

### Prune unused resources

```bash
# Remove unused containers, networks, images
docker system prune

# Remove volumes too (WARNING: deletes data)
docker system prune -a --volumes
```

---

## Production Deployment Checklist

### Before Deployment

- [ ] Update .env with production values
- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT secrets
- [ ] Configure production database URL
- [ ] Set secure SMTP credentials
- [ ] Update CLIENT_URL to production domain
- [ ] Test all endpoints
- [ ] Verify email sending works
- [ ] Test rate limiting
- [ ] Test cache invalidation

### Security Hardening

1. **Change RabbitMQ default credentials:**

```yaml
rabbitmq:
  environment:
    - RABBITMQ_DEFAULT_USER=admin
    - RABBITMQ_DEFAULT_PASS=YourSecurePassword
```

Then update RABBITMQ_URL:

```env
RABBITMQ_URL=amqp://admin:YourSecurePassword@rabbitmq:5672
```

2. **Enable Redis AUTH:**

```yaml
redis:
  command: redis-server --requirepass YourRedisPassword
```

Then update REDIS_URL:

```env
REDIS_URL=redis://:YourRedisPassword@redis:6379
```

3. **Use Docker secrets for sensitive data** (Docker Swarm/Kubernetes)

4. **Enable HTTPS** with reverse proxy (Nginx, Caddy, Traefik)

5. **Restrict RabbitMQ Management UI:**

```yaml
rabbitmq:
  ports:
    - "5672:5672"
    # Remove public access to management UI in production
    # - "15672:15672"
```

### Cloud Deployment

For production on cloud platforms, consider using managed services:

1. **Database:** AWS RDS, GCP Cloud SQL, Azure Database (already using Neon)
2. **Redis:** AWS ElastiCache, GCP Memorystore, Azure Cache for Redis
3. **RabbitMQ:** AWS Amazon MQ, CloudAMQP
4. **Container Orchestration:** AWS ECS/EKS, GCP GKE, Azure AKS

Update environment variables to point to managed services:

```env
REDIS_URL=redis://your-elasticache-endpoint:6379
RABBITMQ_URL=amqp://user:pass@your-amazonmq-endpoint:5672
```

---

## Useful Docker Commands Reference

```bash
# View running containers
docker ps

# View all containers (including stopped)
docker ps -a

# View images
docker images

# Remove container
docker rm container_name

# Remove image
docker rmi image_name

# View logs with timestamps
docker compose logs -f -t app

# Follow logs from specific time
docker compose logs --since 30m app

# Execute shell in running container
docker compose exec app sh

# Run one-off command
docker compose run --rm app npm run prisma:migrate

# Inspect container
docker inspect track-hire-backend

# View container processes
docker top track-hire-backend

# Copy files from container
docker cp track-hire-backend:/app/logs ./local-logs
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│                  Client (Frontend)               │
│              http://localhost:5173               │
└───────────────────┬─────────────────────────────┘
                    │ HTTP/REST
                    ▼
┌─────────────────────────────────────────────────┐
│           Backend App (Node.js/Express)         │
│              http://localhost:3000               │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │ Controllers → Routes → Middleware         │  │
│  │ ↓                                         │  │
│  │ Redis Client ← Cache & Rate Limit        │  │
│  │ ↓                                         │  │
│  │ RabbitMQ Client ← Email Queue Publisher  │  │
│  │ ↓                                         │  │
│  │ Email Worker ← Queue Consumer            │  │
│  └──────────────────────────────────────────┘  │
└───┬──────────────┬──────────────┬──────────────┘
    │              │              │
    ▼              ▼              ▼
┌─────────┐  ┌──────────┐  ┌────────────┐
│  Redis  │  │ RabbitMQ │  │  Database  │
│  :6379  │  │  :5672   │  │  (Neon)    │
└─────────┘  └──────────┘  └────────────┘
```

---

## FAQ

**Q: Do I need to run migrations manually?**  
A: In production mode (full Docker), migrations run automatically via `start.sh`. In development mode, run `npm run prisma:migrate` manually.

**Q: Can I use a local PostgreSQL database instead of Neon?**  
A: Yes! Uncomment the `postgres` service in `docker-compose.yml` and update DATABASE_URL.

**Q: How do I debug the app running in Docker?**  
A: Use `docker compose logs -f app` to view logs, or `docker compose exec app sh` to access the container shell.

**Q: Can I scale the workers?**  
A: Yes! Add more worker containers:

```bash
docker compose up -d --scale app=3
```

**Q: How do I backup the data?**  
A: Use Docker volume backup:

```bash
docker run --rm -v track-hire-be_redis-data:/data -v $(pwd):/backup alpine tar czf /backup/redis-backup.tar.gz /data
```

**Q: What if I want to use a different port?**  
A: Change the port mapping in docker-compose.yml:

```yaml
app:
  ports:
    - "8080:3000" # Access via http://localhost:8080
```

---

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
- [RabbitMQ Docker Guide](https://www.rabbitmq.com/docker.html)
- [Redis Docker Guide](https://redis.io/docs/install/install-stack/docker/)

---

**For questions or issues, check the logs first:**

```bash
docker compose logs -f
```
