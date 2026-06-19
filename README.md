# Track Hire Backend

[![CI/CD Pipeline](https://github.com/USERNAME/track-hire-be/actions/workflows/deploy.yml/badge.svg)](https://github.com/USERNAME/track-hire-be/actions/workflows/deploy.yml)
[![PR Checks](https://github.com/USERNAME/track-hire-be/actions/workflows/pr-checks.yml/badge.svg)](https://github.com/USERNAME/track-hire-be/actions/workflows/pr-checks.yml)
[![Staging Deploy](https://github.com/USERNAME/track-hire-be/actions/workflows/staging-deploy.yml/badge.svg)](https://github.com/USERNAME/track-hire-be/actions/workflows/staging-deploy.yml)

RESTful API backend for Track Hire - a job application tracking system built with Node.js, Express, TypeScript, Prisma, Redis, and RabbitMQ.

## 🌐 Live Deployment

**Production URLs:**

- **Frontend:** https://www.track-hire.app
- **API:** https://api.track-hire.app
- **API Docs:** https://api.track-hire.app/api-docs

**Development URLs:**

- **Frontend:** http://localhost:5173
- **API:** http://localhost:3000
- **API Docs:** http://localhost:3000/api-docs

---

## 🚀 Features

- **User Authentication**
  - Email/Password registration with verification
  - Google OAuth integration
  - JWT-based authentication with refresh tokens
  - Password reset functionality

- **User Management**
  - User CRUD operations
  - Avatar upload & management
  - Soft delete with recycle bin
  - Restore deleted users
  - Permanent delete capability

- **Application Management**
  - Create, read, update, delete job applications
  - AI-powered job detail extraction from URLs
  - Application status tracking with history
  - Advanced filtering and pagination
  - Soft delete with recycle bin
  - Restore deleted applications
  - Permanent delete capability

- **Company Management**
  - Auto-create companies from applications
  - Company deduplication
  - Company search and listing
  - Soft delete with recycle bin
  - Restore deleted companies
  - Permanent delete capability

- **Dashboard & Analytics**
  - Application statistics by status
  - Source distribution analytics
  - Monthly trend analysis
  - Recent applications tracking

- **Reminders**
  - Set reminders for follow-ups and deadlines
  - Automatic reminder notifications
  - Soft delete with recycle bin
  - Restore deleted reminders
  - Permanent delete capability

- **Redis Caching**
  - Dashboard stats caching (5 min TTL)
  - AI extraction caching (7 days TTL)
  - Rate limiting for AI extractions

- **Asynchronous Email Processing**
  - RabbitMQ message queue
  - Email worker for background processing
  - Production-grade transaction rollback

- **File Upload**
  - Avatar image upload via ImageKit
  - Image optimization and resizing

## 🛠️ Tech Stack

- **Runtime:** Node.js 20+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma
- **Caching:** Redis
- **Message Queue:** RabbitMQ
- **Authentication:** JWT + Google OAuth
- **Email:** Nodemailer (SMTP)
- **AI:** Google Gemini API
- **Web Scraping:** Cheerio
- **File Storage:** ImageKit
- **Documentation:** Swagger/OpenAPI
- **Containerization:** Docker

## 📋 Prerequisites

- Node.js 20 or higher
- npm or yarn
- Docker Desktop (for Redis, RabbitMQ, and containerization)
- PostgreSQL database (or use Neon)

## 🚀 Quick Start

### Option 1: Development Mode (Recommended)

1. **Clone the repository**

```bash
git clone <repository-url>
cd track-hire-be
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env
# Edit .env with your credentials
```

4. **Start Redis and RabbitMQ**

```bash
docker compose -f docker-compose.dev.yml up -d
```

5. **Run database migrations**

```bash
npm run prisma:migrate
```

6. **Seed the database**

```bash
npm run prisma:seed
```

7. **Start development server**

```bash
npm run dev
```

Server will start on http://localhost:3000

### Option 2: Full Docker (Production-like)

1. **Set up environment variables**

```bash
cp .env.docker.example .env.docker
# Edit .env.docker with your credentials
```

2. **Build and start all services**

```bash
docker compose up -d --build
```

Server will start on http://localhost:3000

## 📚 API Documentation

Once the server is running, access the interactive API documentation at:

**Swagger UI:** http://localhost:3000/api-docs

## 🔧 Available Scripts

For complete script documentation, see [docs/scripts-reference.md](./docs/scripts-reference.md)

```bash
# Development
npm run dev              # Start development server with hot-reload

# Building
npm run build            # Compile TypeScript to JavaScript
npm start                # Start production server (requires build)

# Code Quality
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run type-check       # Type-check without emitting files

# Database
npm run prisma:migrate   # Run database migrations
npm run prisma:generate  # Generate Prisma Client
npm run prisma:seed      # Seed database with initial data
npm run prisma:studio    # Open Prisma Studio GUI

# Docker
npm run docker:dev:up    # Start dev services (Redis, RabbitMQ)
npm run docker:prod:up   # Start all services in production mode
```

## 🚀 CI/CD Pipeline

Project menggunakan GitHub Actions untuk automated testing dan deployment.

### Workflows:

1. **CI/CD Pipeline** - Main deployment workflow
   - Code quality checks (Prettier, TypeScript)
   - Build verification
   - Automated deployment ke production (EC2)
   - Deployment notifications

2. **Pull Request Checks** - Automated PR validation
   - PR title validation (semantic versioning)
   - Code quality checks
   - Build verification
   - Security audit
   - Auto-comment results di PR

3. **Staging Deploy** - Development branch deployment
   - Build untuk staging environment
   - Optional deploy ke staging server

4. **Database Check** - Schema validation
   - Prisma schema validation
   - Migration testing dengan PostgreSQL
   - Auto-comment migration info

5. **Dependency Check** - Weekly maintenance
   - Check outdated packages
   - Security vulnerability scan
   - Auto-create GitHub issues

### Required GitHub Secrets:

```
EC2_HOST           # Production server IP/hostname
EC2_USER           # SSH username
EC2_SSH_KEY        # Private SSH key
```

### Branching Strategy:

```
main (production) → Auto-deploy ke EC2
├── develop (staging) → Auto-build staging
    ├── feature/* → Create PR to develop
    ├── fix/* → Create PR to develop
    └── chore/* → Create PR to develop
```

Untuk dokumentasi lengkap CI/CD, lihat [docs/cicd-guide.md](./docs/cicd-guide.md)

## 🐳 Docker Commands

### Development Mode (Only Redis & RabbitMQ)

```bash
# Start services
docker compose -f docker-compose.dev.yml up -d

# Stop services
docker compose -f docker-compose.dev.yml down

# View logs
docker compose -f docker-compose.dev.yml logs -f
```

### Production Mode (Full Stack)

```bash
# Start all services
docker compose up -d

# Build and start
docker compose up -d --build

# Stop all services
docker compose down

# View logs
docker compose logs -f

# Restart specific service
docker compose restart app
```

For detailed Docker setup instructions, see [docker-setup.md](./docs/docker-setup.md)

## 📁 Project Structure

```
track-hire-be/
├── src/
│   ├── config/          # Configuration files (env, swagger, imagekit)
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware (auth, upload, admin)
│   ├── models/          # TypeScript interfaces
│   ├── routes/          # API routes
│   ├── schemas/         # Zod validation schemas
│   ├── utils/           # Utility functions (jwt, email, redis, rabbitmq)
│   └── workers/         # Background workers (email)
├── prisma/
│   ├── schema.prisma    # Database schema
│   ├── seed.ts          # Database seeding script
│   └── migrations/      # Database migrations
├── lib/                 # Prisma client instance
├── generated/           # Generated Prisma types
├── dist/                # Compiled JavaScript (production)
├── docs/                # API documentation
├── server.ts            # Application entry point
├── Dockerfile           # Docker image definition
├── docker-compose.yml   # Production Docker setup
├── docker-compose.dev.yml # Development Docker setup
└── .env                 # Environment variables (not in git)
```

## 🔐 Environment Variables

The project uses different environment files for different deployment modes:

### Development Mode (`.env`)

Used when running the app locally with `npm run dev`:

```env
# Uses localhost because services are in Docker, app is on host
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://localhost:5672
```

### Production Mode (`.env.docker`)

Used when running with `docker compose up` (full containerization):

```env
# These values are overridden by docker-compose.yml to use Docker networking
REDIS_URL=redis://localhost:6379  # Becomes redis://redis:6379
RABBITMQ_URL=amqp://localhost:5672  # Becomes amqp://rabbitmq:5672
```

### Template Files

- **`.env.example`** - Template for development mode
- **`.env.docker.example`** - Template for production Docker mode

Required environment variables (see template files for full list):

```env
# Database
DATABASE_URL=postgresql://...

# Server
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# JWT Secrets
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# ImageKit
IMAGEKIT_PRIVATE_KEY=your-imagekit-key

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Redis & RabbitMQ
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://localhost:5672
```

## 📊 Database Schema

The application uses PostgreSQL with Prisma ORM. Main entities:

- **User:** User accounts with authentication
- **Company:** Companies where users apply
- **Application:** Job applications with tracking
- **ApplicationHistory:** Status change history
- **Reminder:** User reminders
- **VerificationToken:** Email verification and password reset tokens

To view the complete schema: `prisma/schema.prisma`

## 🔄 Redis Caching Strategy

### Dashboard Stats

- **Key:** `dashboard:stats:<userId>`
- **TTL:** 5 minutes
- **Invalidation:** On application create/update/delete

### AI Import Results

- **Key:** `ai-import:<url-hash>`
- **TTL:** 7 days
- **Policy:** Cache only successful extractions

### Rate Limiting

- **Key:** `ai-import:rate:<userId>`
- **Limit:** 10 extractions per hour per user
- **Algorithm:** Sliding window with Redis sorted sets

## 📧 Email Queue (RabbitMQ)

### Email Types

- Email verification on registration
- Password reset emails

### Queue Configuration

- **Queue Name:** `email_jobs`
- **Durability:** Enabled (survives restarts)
- **Persistence:** Enabled for messages
- **Acknowledgment:** Manual

### Production Behavior

- Queue publish failure → Transaction rollback → 503 error
- Prevents orphaned data (user without verification email)

### Development Behavior

- Queue unavailable → Falls back to direct SMTP sending

## 🎯 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/verify-email` - Verify email address
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Applications

- `GET /api/applications` - List applications (with filters)
- `GET /api/applications/:id` - Get application details
- `POST /api/applications` - Create application
- `PUT /api/applications/:id` - Update application
- `DELETE /api/applications/:id` - Soft-delete application
- `POST /api/applications/extract-url` - Extract job details from URL (AI)
- `GET /api/applications/deleted/list` - List deleted applications
- `POST /api/applications/:id/restore` - Restore deleted application
- `DELETE /api/applications/:id/permanent` - Permanently delete application

### Companies

- `GET /api/companies` - List companies
- `GET /api/companies/:id` - Get company details
- `POST /api/companies` - Create company
- `PUT /api/companies/:id` - Update company
- `DELETE /api/companies/:id` - Soft-delete company
- `GET /api/companies/deleted/list` - List deleted companies
- `POST /api/companies/:id/restore` - Restore deleted company
- `DELETE /api/companies/:id/permanent` - Permanently delete company

### Dashboard

- `GET /api/dashboard/stats` - Get dashboard statistics

### Reminders

- `GET /api/reminders` - List reminders
- `GET /api/reminders/:id` - Get reminder details
- `POST /api/reminders` - Create reminder
- `PUT /api/reminders/:id` - Update reminder
- `DELETE /api/reminders/:id` - Soft-delete reminder
- `GET /api/reminders/deleted/list` - List deleted reminders
- `POST /api/reminders/:id/restore` - Restore deleted reminder
- `DELETE /api/reminders/:id/permanent` - Permanently delete reminder

### Users

- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update profile
- `PUT /api/users/:id/avatar` - Upload profile picture
- `DELETE /api/users/:id/avatar` - Delete profile picture

### Users (Admin Only)

- `GET /api/users` - List all users
- `DELETE /api/users/:id` - Soft delete user

### Users Recycle Bin (Admin Only)

- `GET /api/users/deleted/list` - List deleted users
- `POST /api/users/:id/restore` - Restore deleted user
- `DELETE /api/users/:id/permanent` - Permanently delete user

For detailed API documentation, visit http://localhost:3000/api-docs

## 🧪 Testing

### Manual Testing

1. Start the server
2. Access Swagger UI at http://localhost:3000/api-docs
3. Test endpoints interactively

### Testing Rate Limiting

```bash
# Extract same URL 11 times within an hour
for i in {1..11}; do
  curl -X POST http://localhost:3000/api/applications/extract-url \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"url": "https://example.com/job"}';
done
# 11th request should return 429 Too Many Requests
```

### Testing Cache

```bash
# First request - slow (DB query)
curl http://localhost:3000/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN"

# Second request within 5 minutes - fast (cached)
curl http://localhost:3000/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Testing Queue Durability

1. Register a user (email queued)
2. Stop RabbitMQ: `docker compose stop rabbitmq`
3. Restart RabbitMQ: `docker compose start rabbitmq`
4. Email should still be sent (queue is durable)

## 🔒 Security Features

- **Authentication:** JWT with HTTP-only cookies
- **Password Hashing:** bcrypt with salt rounds
- **SQL Injection Protection:** Prisma parameterized queries
- **CORS:** Configured for specific origins
- **Input Validation:** Zod schemas
- **Rate Limiting:** Redis-based rate limiting
- **File Upload:** File type and size validation
- **Non-root User:** Docker container runs as non-root
- **Environment Variables:** Sensitive data in .env (not committed)

## 📈 Performance Optimizations

- **Caching:** Redis caching reduces DB load by ~95%
- **Async Processing:** Email sending doesn't block HTTP responses
- **Indexed Database:** Prisma indexes on frequently queried fields
- **Connection Pooling:** PostgreSQL connection pooling
- **Health Checks:** Docker health checks for reliability
- **Multi-stage Build:** Smaller Docker images

## 🐛 Troubleshooting

### Common Issues

**Server fails to start:**

- Check if ports 3000, 6379, 5672 are available
- Verify .env file is configured correctly
- Ensure Docker services are running: `docker compose ps`

**Database connection error:**

- Verify DATABASE_URL is correct
- Check if database is accessible
- Run migrations: `npm run prisma:migrate`

**Redis connection error:**

- Start Redis: `docker compose -f docker-compose.dev.yml up -d redis`
- In development, app will continue without Redis

**RabbitMQ connection error:**

- Start RabbitMQ: `docker compose -f docker-compose.dev.yml up -d rabbitmq`
- In development, app will fall back to direct email sending

**Email not sending:**

- Verify SMTP credentials in .env
- Check email worker logs: `docker compose logs -f app`
- Verify RabbitMQ queue: http://localhost:15672

For more troubleshooting, see [docker-setup.md](./docs/docker-setup.md)

## 📝 Documentation

- **[docs/api-contract.md](./docs/api-contract.md)** - 📘 Complete API documentation (44 endpoints)
- **[docs/final-summary.md](./docs/final-summary.md)** - Project overview and summary
- **[docs/scripts-reference.md](./docs/scripts-reference.md)** - 📜 NPM scripts documentation
- **[docs/cicd-guide.md](./docs/cicd-guide.md)** - 🚀 CI/CD workflows documentation

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

- Irfan Muria

## 🙏 Acknowledgments

- Express.js team for the excellent web framework
- Prisma team for the amazing ORM
- Google for Gemini AI API
- All open-source contributors

---

**Built with ❤️ using Node.js, TypeScript, and Docker**

For questions or support, please open an issue on GitHub.
