# 🚀 CI/CD Workflows Documentation

Dokumentasi lengkap untuk GitHub Actions workflows pada project Track Hire Backend.

---

## 📋 Daftar Workflows

### 1. **CI/CD Pipeline** (`deploy.yml`)

Workflow utama untuk deployment ke production.

**Trigger:**

- Push ke branch `main` atau `develop`
- Pull request ke branch `main` atau `develop`

**Jobs:**

1. **Code Quality & Linting** - Memeriksa format kode dan type checking
2. **Build Application** - Compile TypeScript ke JavaScript
3. **Deploy to Production** - Deploy ke EC2 server (hanya untuk branch `main`)
4. **Deployment Notification** - Notifikasi status deployment

**Environment Variables:**

- `NODE_VERSION`: 20.x

**Required Secrets:**

- `EC2_HOST` - IP address atau hostname EC2
- `EC2_USER` - Username SSH untuk EC2
- `EC2_SSH_KEY` - Private SSH key untuk akses EC2

---

### 2. **Pull Request Checks** (`pr-checks.yml`)

Automated checks untuk setiap Pull Request.

**Trigger:**

- Pull request opened, synchronized, atau reopened

**Jobs:**

1. **Validate PR** - Validasi format PR title (semantic versioning)
2. **Code Quality** - Prettier & TypeScript checks
3. **Build** - Build verification
4. **Security** - npm audit untuk security vulnerabilities
5. **Comment Results** - Otomatis comment hasil checks di PR

**PR Title Format:**

```
<type>: <description>

Types: feat, fix, docs, style, refactor, perf, test, chore
```

**Examples:**

- `feat: add recycle bin endpoints`
- `fix: resolve avatar upload issue`
- `docs: update API documentation`

---

### 3. **Staging Deploy** (`staging-deploy.yml`)

Build dan deploy untuk staging environment.

**Trigger:**

- Push ke branch `develop`

**Jobs:**

1. **Code Quality** - Format & type checks
2. **Build** - Build application
3. **Deploy Staging** (optional) - Deploy ke staging server
4. **Notification** - Build status notification

**Note:**

- Job `deploy-staging` di-comment karena optional
- Uncomment jika sudah ada staging server
- Gunakan secrets terpisah untuk staging:
  - `STAGING_EC2_HOST`
  - `STAGING_EC2_USER`
  - `STAGING_EC2_SSH_KEY`

---

### 4. **Database Migration Check** (`database-check.yml`)

Validasi Prisma schema dan migrations.

**Trigger:**

- Pull request yang mengubah:
  - `prisma/schema.prisma`
  - `prisma/migrations/**`

**Jobs:**

1. **Validate Schema** - Prisma schema validation
2. **Test Migrations** - Test migrations di PostgreSQL test database
3. **Comment PR** - Info tentang perubahan database

**Services:**

- PostgreSQL 16 (test database)

---

### 5. **Dependency Check** (`dependency-check.yml`)

Weekly check untuk package updates dan security vulnerabilities.

**Trigger:**

- Scheduled: Setiap Senin jam 9 pagi UTC
- Manual: Via workflow dispatch

**Jobs:**

1. **Check Outdated** - Check untuk package updates
2. **Security Audit** - npm audit untuk vulnerabilities
3. **Create Issue** - Buat atau update GitHub issue otomatis

**Labels:**

- `dependencies`
- `maintenance`

---

## 🔐 Required GitHub Secrets

Setup secrets di GitHub repository settings:

```
Settings → Secrets and variables → Actions → New repository secret
```

### Production Secrets:

| Secret Name   | Description            | Example                              |
| ------------- | ---------------------- | ------------------------------------ |
| `EC2_HOST`    | EC2 server hostname/IP | `54.123.45.67`                       |
| `EC2_USER`    | SSH username           | `ubuntu`                             |
| `EC2_SSH_KEY` | Private SSH key        | `-----BEGIN RSA PRIVATE KEY-----...` |

### Staging Secrets (optional):

| Secret Name           | Description          |
| --------------------- | -------------------- |
| `STAGING_EC2_HOST`    | Staging server IP    |
| `STAGING_EC2_USER`    | Staging SSH username |
| `STAGING_EC2_SSH_KEY` | Staging SSH key      |

---

## 📝 Workflow Status Badges

Tambahkan ke `README.md`:

```markdown
![CI/CD Pipeline](https://github.com/USERNAME/track-hire-be/actions/workflows/deploy.yml/badge.svg)
![PR Checks](https://github.com/USERNAME/track-hire-be/actions/workflows/pr-checks.yml/badge.svg)
![Staging Deploy](https://github.com/USERNAME/track-hire-be/actions/workflows/staging-deploy.yml/badge.svg)
```

---

## 🚦 Branching Strategy

```
main (production)
├── develop (staging)
│   ├── feature/feature-name
│   ├── fix/bug-name
│   └── chore/task-name
```

### Workflow untuk branch:

- `feature/*`, `fix/*`, `chore/*` → Create PR ke `develop`
- `develop` → Otomatis build & deploy staging
- `develop` → Create PR ke `main` (setelah testing)
- `main` → Otomatis deploy production

---

## 🔄 Deployment Process

### Develop → Staging:

1. Push ke branch `develop`
2. `staging-deploy.yml` triggered
3. Code quality checks
4. Build application
5. Deploy ke staging server (jika diaktifkan)

### Main → Production:

1. Create PR dari `develop` ke `main`
2. `pr-checks.yml` triggered
3. Review & approve PR
4. Merge ke `main`
5. `deploy.yml` triggered
6. Full CI/CD pipeline runs
7. Deploy ke production EC2

---

## 🛠️ Manual Deployment

Jika perlu deploy manual:

```bash
# SSH ke server
ssh -i your-key.pem ubuntu@your-server-ip

# Navigate to project
cd ~/Track-Hire-BE

# Pull latest changes
git pull origin main

# Install dependencies
npm ci

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Build
npm run build

# Restart PM2
pm2 restart track-hire-api
```

---

## 🧪 Testing Workflows Locally

Install [act](https://github.com/nektos/act):

```bash
# Windows (chocolatey)
choco install act-cli

# macOS
brew install act

# Run workflow locally
act -W .github/workflows/pr-checks.yml
```

---

## 📊 Monitoring & Logs

### GitHub Actions:

- Actions tab → Select workflow → View logs

### PM2 Logs (on EC2):

```bash
# View logs
pm2 logs track-hire-api

# View specific lines
pm2 logs track-hire-api --lines 100

# Monitor in real-time
pm2 monit
```

---

## 🐛 Troubleshooting

### Build Fails:

1. Check TypeScript errors: `npm run type-check`
2. Check formatting: `npm run format:check`
3. Fix issues: `npm run format`

### Deployment Fails:

1. Check SSH connection
2. Verify secrets are set correctly
3. Check EC2 server disk space: `df -h`
4. Check PM2 status: `pm2 status`

### Migration Issues:

1. Validate schema: `npx prisma validate`
2. Check migration status: `npx prisma migrate status`
3. Reset if needed: `npx prisma migrate reset`

---

## 🔒 Security Best Practices

1. **Never commit secrets** to repository
2. **Rotate SSH keys** periodically
3. **Use least privilege** for SSH users
4. **Enable branch protection** for `main` and `develop`
5. **Require PR reviews** before merging
6. **Monitor dependency vulnerabilities** weekly

---

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Prisma Migration Guide](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [PM2 Process Management](https://pm2.keymetrics.io/docs/usage/process-management/)
- [SSH Key Management](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)

---

**Last Updated:** June 19, 2026
