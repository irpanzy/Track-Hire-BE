# Track Hire Backend

RESTful API backend for Track Hire - a job application tracking system built with Node.js, Express, TypeScript, Prisma, Redis, and RabbitMQ.

## 🚀 Features

- **User Authentication**
  - Email/Password registration with verification
  - Google OAuth integration
  - JWT-based authentication with refresh tokens
  - Password reset functionality

- **Application Management**
  - Create, read, update, delete job applications
  - AI-powered job detail extraction from URLs
  - Application status tracking with history
  - Advanced filtering and pagination

- **Company Management**
  - Auto-create companies from applications
  - Company deduplication
  - Company search and listing

- **Dashboard & Analytics**
  - Application statistics by status
  - Source distribution analytics
  - Monthly trend analysis
  - Recent applications tracking

- **Reminders**
  - Set reminders for follow-ups and deadlines
  - Automatic reminder notifications

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

### Development Mode

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

4. **Start Redis and RabbitMQ (Docker)**

```bash
docker-compose -f docker-compose.dev.yml up -d
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

Or use the automated script:

```bash
start-dev.cmd
```

Server will start on http://localhost:3000

## 📚 API Documentation

Once the server is running, access the interactive API documentation at:

**Swagger UI:** http://localhost:3000/api-docs

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server with hot-reload

# Building
npm run build            # Compile TypeScript to JavaScript
npm start                # Start production server (requires build)

# Code Quality
npm run format           # Format code with Prettier
npm run noemit           # Type-check without emitting files

# Database
npm run prisma:migrate   # Run database migrations
npm run prisma:generate  # Generate Prisma Client
npm run prisma:seed      # Seed database with initial data
```

## 🐳 Docker Commands

### Development Mode (Redis & RabbitMQ Only)

```bash
# Start services
docker-compose -f docker-compose.dev.yml up -d

# Stop services
docker-compose -f docker-compose.dev.yml down

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Restart specific service
docker-compose -f docker-compose.dev.yml restart redis
```

For detailed setup instructions, see [docs/development-setup.md](./docs/development-setup.md)

## 📁 Project Structure

```
track-hire-be/
├── src/
│   ├── config/                  # Configuration files
│   │   ├── env.ts              # Environment variables
│   │   ├── swagger.ts          # API documentation config
│   │   └── imagekit.ts         # ImageKit config
│   │
│   ├── controllers/            # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── application.controller.ts
│   │   ├── company.controller.ts
│   │   ├── dashboard.controller.ts
│   │   └── reminder.controller.ts
│   │
│   ├── middleware/             # Express middleware
│   │   ├── auth.middleware.ts  # JWT authentication
│   │   ├── admin.middleware.ts # Admin authorization
│   │   └── upload.middleware.ts # File upload handling
│   │
│   ├── models/                 # TypeScript interfaces
│   │   ├── auth.model.ts
│   │   ├── user.model.ts
│   │   └── application.model.ts
│   │
│   ├── routes/                 # API routes
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── application.routes.ts
│   │   ├── company.routes.ts
│   │   ├── dashboard.routes.ts
│   │   └── reminder.routes.ts
│   │
│   ├── schemas/                # Zod validation schemas
│   │   ├── auth.schema.ts
│   │   ├── user.schema.ts
│   │   ├── application.schema.ts
│   │   ├── company.schema.ts
│   │   └── reminder.schema.ts
│   │
│   ├── utils/                  # Utility functions
│   │   ├── jwt.ts             # JWT token handling
│   │   ├── email.ts           # Email sending & templates
│   │   ├── redis.ts           # Redis caching
│   │   ├── rabbitmq.ts        # RabbitMQ queue
│   │   ├── token.ts           # Token generation
│   │   ├── gemini.ts          # AI integration
│   │   ├── imagekit.ts        # Image upload
│   │   └── scraper.ts         # Web scraping
│   │
│   └── workers/                # Background workers
│       └── email.worker.ts    # Email queue processor
│
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Database seeding script
│   └── migrations/            # Database migrations
│       ├── migration_lock.toml
│       └── [timestamp]_[name]/ # Migration files
│
├── lib/
│   └── prisma.ts              # Prisma client instance
│
├── generated/                  # Generated Prisma types
│   └── prisma/
│       ├── client.ts
│       ├── models/
│       └── ...
│
├── dist/                       # Compiled JavaScript (production)
│   └── [build output]
│
├── docs/                       # Documentation (15 files)
│   ├── README.md              # Documentation index
│   ├── quickstart.md
│   ├── development-setup.md
│   ├── email-quick-reference.md
│   └── ... (see docs/README.md for full list)
│
├── node_modules/              # Dependencies (gitignored)
│
├── server.ts                  # Application entry point
├── prisma.config.ts           # Prisma generator config
├── tsconfig.json              # TypeScript configuration
├── package.json               # Dependencies & scripts
├── package-lock.json          # Dependency lock file
│
├── docker-compose.dev.yml     # Development services (Redis, RabbitMQ)
├── start-dev.cmd              # Development startup script
├── stop-dev.cmd               # Development shutdown script
│
├── .env                       # Environment variables (gitignored)
├── .gitignore                 # Git ignore rules
├── .prettierrc                # Prettier config
├── .prettierignore            # Prettier ignore rules
│
└── README.md                  # This file
```

## 🔐 Environment Variables

The project uses `.env` file for environment configuration:

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

# Email (SMTP) - Gmail with Custom Domain
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_NAME=Track Hire
SUPPORT_EMAIL=support@track-hire.app

# ImageKit
IMAGEKIT_PRIVATE_KEY=your-imagekit-key

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Redis & RabbitMQ (Docker services)
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://localhost:5672
```

See `.env.example` for complete configuration template.

### 📧 Email Configuration

The application uses **Gmail SMTP + Cloudflare Email Routing** for professional email delivery:

**Sending emails:**

- Uses Gmail SMTP for reliable delivery
- Professional sender name: "Track Hire"
- Custom domain for replies: `support@track-hire.app`

**Receiving replies:**

- Cloudflare Email Routing forwards to your Gmail
- Single inbox management

**Features:**

- ✅ Beautiful HTML email templates with responsive design
- ✅ Professional purple gradient branding
- ✅ Mobile-friendly layouts
- ✅ High deliverability (8-10/10 spam score)
- ✅ Zero additional cost

For complete email setup guide, see [docs/email-quick-reference.md](./docs/email-quick-reference.md)

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
- `DELETE /api/applications/:id` - Delete application
- `POST /api/applications/extract-url` - Extract job details from URL (AI)

### Companies

- `GET /api/companies` - List companies
- `GET /api/companies/:id` - Get company details
- `POST /api/companies` - Create company
- `PUT /api/companies/:id` - Update company
- `DELETE /api/companies/:id` - Delete company

### Dashboard

- `GET /api/dashboard/stats` - Get dashboard statistics

### Reminders

- `GET /api/reminders` - List reminders
- `GET /api/reminders/:id` - Get reminder details
- `POST /api/reminders` - Create reminder
- `PUT /api/reminders/:id` - Update reminder
- `DELETE /api/reminders/:id` - Delete reminder

### Users

- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update profile
- `PUT /api/users/:id/avatar` - Upload profile picture
- `DELETE /api/users/:id/avatar` - Delete profile picture

### Users (Admin Only)

- `GET /api/users` - List all users
- `DELETE /api/users/:id` - Soft delete user

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

For more troubleshooting, see [docs/development-setup.md](./docs/development-setup.md)

## 📝 Additional Documentation

### Setup & Development

- [docs/development-setup.md](./docs/development-setup.md) - Complete development setup guide
- [docs/quickstart.md](./docs/quickstart.md) - Quick start guide
- [docs/implementation-summary.md](./docs/implementation-summary.md) - Redis & RabbitMQ implementation
- [docs/final-summary.md](./docs/final-summary.md) - Project summary

### Email Configuration

- [docs/email-quick-reference.md](./docs/email-quick-reference.md) - ⚡ Quick reference card
- [docs/gmail-custom-domain-setup.md](./docs/gmail-custom-domain-setup.md) - Gmail SMTP + Cloudflare setup
- [docs/test-email-setup.md](./docs/test-email-setup.md) - Email testing guide
- [docs/final-email-setup-summary.md](./docs/final-email-setup-summary.md) - Complete email summary
- [docs/email-visual-comparison.md](./docs/email-visual-comparison.md) - Email design comparison
- [docs/email-best-practices.md](./docs/email-best-practices.md) - Email best practices
- [docs/anti-spam-guide.md](./docs/anti-spam-guide.md) - Anti-spam strategies
- [docs/for-users-email-whitelist.md](./docs/for-users-email-whitelist.md) - User email whitelist guide

### API Documentation

- [docs/api-contract.md](./docs/api-contract.md) - API contract specifications
- [docs/setup-custom-domain-email.md](./docs/setup-custom-domain-email.md) - Custom domain email options
- [docs/quick-custom-domain-setup.md](./docs/quick-custom-domain-setup.md) - Quick domain setup

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Express.js team for the excellent web framework
- Prisma team for the amazing ORM
- Google for Gemini AI API
- All open-source contributors

---

**Built with ❤️ using Node.js, TypeScript, and Docker**

For questions or support, please open an issue on GitHub.
