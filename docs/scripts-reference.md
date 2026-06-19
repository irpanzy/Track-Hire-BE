# 📜 NPM Scripts Reference

Complete reference for all npm scripts in Track Hire backend.

---

## 🚀 Development Scripts

### `npm run dev`

Start development server with hot-reload using nodemon and tsx.

```bash
npm run dev
```

**What it does:**

- Starts server on http://localhost:3000
- Auto-restarts on file changes
- TypeScript execution without compilation
- Ideal for local development

---

## 🏗️ Build & Production Scripts

### `npm run build`

Compile TypeScript to JavaScript for production.

```bash
npm run build
```

**What it does:**

- Compiles all `.ts` files to `.js` in `dist/` folder
- Cleans `dist/` folder before build (prebuild hook)
- Generates type declarations
- Prepares code for production deployment

### `npm start`

Start production server (requires build first).

```bash
npm run build  # Build first
npm start      # Then start
```

**What it does:**

- Runs compiled JavaScript from `dist/server.js`
- No hot-reload (production mode)
- Use in production environment

---

## 🎨 Code Quality Scripts

### `npm run format`

Format all code with Prettier.

```bash
npm run format
```

**What it does:**

- Formats all files according to `.prettierrc`
- Modifies files in place
- Includes `.ts`, `.js`, `.json`, `.md` files

### `npm run format:check`

Check if code is formatted (CI/CD).

```bash
npm run format:check
```

**What it does:**

- Checks formatting without modifying files
- Returns exit code 1 if not formatted
- Useful in CI/CD pipelines

### `npm run type-check`

Check TypeScript types without compilation.

```bash
npm run type-check
```

**What it does:**

- Validates TypeScript types
- No output files generated
- Fast type checking
- Useful before committing code

---

## 🗄️ Database (Prisma) Scripts

### `npm run prisma:generate`

Generate Prisma Client from schema.

```bash
npm run prisma:generate
```

**What it does:**

- Reads `prisma/schema.prisma`
- Generates TypeScript types in `generated/prisma/`
- Updates Prisma Client with schema changes
- **Run after changing schema**

### `npm run prisma:migrate`

Create and apply database migration.

```bash
npm run prisma:migrate
```

**What it does:**

- Creates migration SQL file in `prisma/migrations/`
- Applies migration to database
- Updates database schema
- Prompts for migration name
- **Use in development**

**Example:**

```bash
npm run prisma:migrate
# Enter migration name: add_recycle_bin
```

### `npm run prisma:migrate:deploy`

Apply migrations in production (no prompts).

```bash
npm run prisma:migrate:deploy
```

**What it does:**

- Applies pending migrations
- No interactive prompts
- Safe for production/CI
- **Use in production deployment**

### `npm run prisma:migrate:reset`

⚠️ Reset database (deletes all data!).

```bash
npm run prisma:migrate:reset
```

**What it does:**

- Drops database
- Recreates database
- Applies all migrations
- Runs seed script
- **⚠️ Deletes all data! Development only!**

### `npm run prisma:seed`

Seed database with initial data.

```bash
npm run prisma:seed
```

**What it does:**

- Runs `prisma/seed.ts`
- Creates admin user
- Can be customized for test data
- Safe to run multiple times (checks for existing data)

### `npm run prisma:studio`

Open Prisma Studio (Database GUI).

```bash
npm run prisma:studio
```

**What it does:**

- Opens GUI at http://localhost:5555
- View and edit database records
- Visual database browser
- **Very useful for debugging**

### `npm run prisma:push`

Push schema changes without migration (prototyping).

```bash
npm run prisma:push
```

**What it does:**

- Syncs schema directly to database
- No migration files created
- Fast prototyping
- **Not recommended for production**

---

## 🔄 Combined Database Scripts

### `npm run db:reset`

Complete database reset + seed.

```bash
npm run db:reset
```

**What it does:**

- Runs `prisma:migrate:reset`
- Then runs `prisma:seed`
- Fresh database with seed data
- **⚠️ Development only!**

### `npm run db:seed`

Alias for `prisma:seed`.

```bash
npm run db:seed
```

---

## 🐳 Docker Scripts

### Development Mode (Redis + RabbitMQ only)

#### `npm run docker:dev:up`

Start Redis and RabbitMQ containers.

```bash
npm run docker:dev:up
```

**What it does:**

- Starts Redis on port 6379
- Starts RabbitMQ on port 5672 (management: 15672)
- Runs in background (`-d` flag)
- Uses `docker-compose.dev.yml`

#### `npm run docker:dev:down`

Stop Redis and RabbitMQ containers.

```bash
npm run docker:dev:down
```

**What it does:**

- Stops all containers from `docker-compose.dev.yml`
- Removes containers
- Keeps volumes (data persists)

#### `npm run docker:dev:logs`

View Redis and RabbitMQ logs.

```bash
npm run docker:dev:logs
```

**What it does:**

- Shows real-time logs
- Follows logs (`-f` flag)
- Press Ctrl+C to exit

---

### Production Mode (Full Stack)

#### `npm run docker:prod:build`

Build production Docker image.

```bash
npm run docker:prod:build
```

**What it does:**

- Builds Docker image from `Dockerfile`
- Includes all dependencies
- Compiles TypeScript
- Optimized for production

#### `npm run docker:prod:up`

Start full production stack.

```bash
npm run docker:prod:up
```

**What it does:**

- Starts all services (app, Redis, RabbitMQ)
- Runs in background
- Uses `docker-compose.yml`

#### `npm run docker:prod:down`

Stop full production stack.

```bash
npm run docker:prod:down
```

**What it does:**

- Stops all containers
- Removes containers
- Keeps volumes

#### `npm run docker:prod:logs`

View production logs.

```bash
npm run docker:prod:logs
```

**What it does:**

- Shows logs from all services
- Real-time following
- Press Ctrl+C to exit

---

## 🧹 Cleanup Scripts

### `npm run clean`

⚠️ Remove dist and node_modules.

```bash
npm run clean
```

**What it does:**

- Deletes `dist/` folder
- Deletes `node_modules/` folder
- Fresh start for troubleshooting
- **Run `npm install` after this**

### `npm run clean:dist`

Remove dist folder only.

```bash
npm run clean:dist
```

**What it does:**

- Deletes `dist/` folder only
- Keeps `node_modules/`
- Runs automatically before build (prebuild hook)

---

## 🔧 Lifecycle Hooks

### `postinstall`

Runs automatically after `npm install`.

```bash
# Runs automatically
npm install
```

**What it does:**

- Automatically runs `prisma generate`
- Ensures Prisma Client is always up-to-date
- No manual action needed

### `prebuild`

Runs automatically before `npm run build`.

```bash
# Runs automatically
npm run build
```

**What it does:**

- Runs `clean:dist` before build
- Ensures clean build output
- No manual action needed

---

## 📋 Common Workflows

### First Time Setup

```bash
# 1. Install dependencies
npm install

# 2. Start Docker services
npm run docker:dev:up

# 3. Run migrations
npm run prisma:migrate

# 4. Seed database
npm run prisma:seed

# 5. Start dev server
npm run dev
```

### Daily Development

```bash
# Start Docker (if not running)
npm run docker:dev:up

# Start dev server
npm run dev

# Open Prisma Studio (optional)
npm run prisma:studio
```

### After Schema Changes

```bash
# 1. Generate Prisma Client
npm run prisma:generate

# 2. Create migration
npm run prisma:migrate

# 3. Restart dev server (auto-restarts)
```

### Before Committing Code

```bash
# Check types
npm run type-check

# Format code
npm run format

# Check formatting (optional)
npm run format:check
```

### Production Build

```bash
# 1. Build application
npm run build

# 2. Test production build locally
npm start

# 3. Or use Docker
npm run docker:prod:build
npm run docker:prod:up
```

### Database Reset (Development)

```bash
# Complete reset with seed data
npm run db:reset

# Or manual steps:
npm run prisma:migrate:reset
npm run prisma:seed
```

### Troubleshooting

```bash
# 1. Clean everything
npm run clean

# 2. Reinstall
npm install

# 3. Reset database
npm run db:reset

# 4. Start fresh
npm run docker:dev:up
npm run dev
```

---

## 🚦 CI/CD Scripts

For GitHub Actions / GitLab CI:

```yaml
# Example CI workflow
- run: npm install
- run: npm run format:check # Check formatting
- run: npm run type-check # Check types
- run: npm run build # Test build
```

---

## 💡 Pro Tips

### 1. Watch Multiple Scripts

Use terminal multiplexer or separate terminals:

```bash
# Terminal 1: Dev server
npm run dev

# Terminal 2: Prisma Studio
npm run prisma:studio

# Terminal 3: Docker logs
npm run docker:dev:logs
```

### 2. Quick Database Refresh

```bash
npm run db:reset && npm run dev
```

### 3. Check Everything Before Push

```bash
npm run type-check && npm run format:check && npm run build
```

### 4. View All Available Scripts

```bash
npm run
```

---

## 🔗 Related Documentation

- **[README.md](../README.md)** - Main documentation
- **[API Contract](./api-contract.md)** - API specifications
- **[Final Summary](./final-summary.md)** - Project overview

---

## 📊 Script Categories Summary

| Category         | Scripts   | Description                |
| ---------------- | --------- | -------------------------- |
| **Development**  | 1 script  | Hot-reload dev server      |
| **Build**        | 2 scripts | TypeScript compilation     |
| **Code Quality** | 3 scripts | Formatting & type checking |
| **Database**     | 8 scripts | Prisma operations          |
| **Docker Dev**   | 3 scripts | Redis + RabbitMQ           |
| **Docker Prod**  | 4 scripts | Full stack deployment      |
| **Cleanup**      | 2 scripts | Clean dist & modules       |
| **Lifecycle**    | 2 scripts | Auto-run hooks             |

**Total: 25 scripts**

---

**Need help?** Run `npm run` to see all available scripts!
