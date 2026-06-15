# 🌐 CORS Configuration Guide

## 📋 Overview

The Track Hire API supports **Cross-Origin Resource Sharing (CORS)** for multiple client origins, allowing both development (localhost) and production (track-hire.app) frontends to access the API.

---

## ✅ Current Configuration

### **Allowed Origins:**

```
✅ http://localhost:5173          - Development frontend
✅ https://www.track-hire.app     - Production frontend (www)
✅ https://track-hire.app         - Production frontend (apex domain)
```

### **CORS Settings:**

- **Credentials:** Enabled (allows cookies)
- **Methods:** GET, POST, PUT, DELETE, PATCH, OPTIONS
- **Headers:** Content-Type, Authorization

---

## 🔧 Configuration Files

### **1. Environment Variables (`.env`)**

```env
# Primary client URL (for emails, redirects)
CLIENT_URL=http://localhost:5173

# CORS: Multiple allowed origins (comma-separated)
ALLOWED_ORIGINS=http://localhost:5173,https://www.track-hire.app,https://track-hire.app
```

### **2. Environment Config (`src/config/env.ts`)**

```typescript
export const env = {
  // Primary client URL
  CLIENT_URL: requireEnv("CLIENT_URL"),

  // CORS: Support multiple origins
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((url) => url.trim())
    : [requireEnv("CLIENT_URL")],

  // ... other configs
};
```

### **3. Server CORS Middleware (`server.ts`)**

```typescript
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman)
      if (!origin) return callback(null, true);

      // Check if origin is in allowed list
      if (env.ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`⚠️  Blocked CORS request from origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
```

---

## 🚀 How It Works

### **Request Flow:**

```
┌─────────────────────────────────────────────────────────────┐
│ Step 1: Browser makes request from frontend                 │
│ Origin: https://www.track-hire.app                          │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 2: Server receives request                             │
│ CORS middleware checks: Is origin in ALLOWED_ORIGINS?       │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 3a: If YES → Allow request                             │
│ Response headers:                                            │
│   Access-Control-Allow-Origin: https://www.track-hire.app   │
│   Access-Control-Allow-Credentials: true                    │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 3b: If NO → Block request                              │
│ Error: "Not allowed by CORS"                                │
│ Console: ⚠️  Blocked CORS request from origin: ...          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 Testing CORS

### **Test 1: From Localhost (Development)**

```bash
# Should work ✅
curl -X GET http://localhost:3000/api/auth/me \
  -H "Origin: http://localhost:5173" \
  -H "Cookie: accessToken=..." \
  -v
```

**Expected response headers:**

```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Credentials: true
```

### **Test 2: From Production**

```bash
# Should work ✅
curl -X GET https://your-api.com/api/auth/me \
  -H "Origin: https://www.track-hire.app" \
  -H "Cookie: accessToken=..." \
  -v
```

**Expected response headers:**

```
Access-Control-Allow-Origin: https://www.track-hire.app
Access-Control-Allow-Credentials: true
```

### **Test 3: From Unauthorized Origin**

```bash
# Should fail ❌
curl -X GET http://localhost:3000/api/auth/me \
  -H "Origin: https://malicious-site.com" \
  -v
```

**Expected:**

```
❌ Error: "Not allowed by CORS"
Console: ⚠️  Blocked CORS request from origin: https://malicious-site.com
```

### **Test 4: Preflight Request (OPTIONS)**

```bash
# Browser sends this automatically before POST/PUT/DELETE
curl -X OPTIONS http://localhost:3000/api/auth/login \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

**Expected response headers:**

```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,PATCH,OPTIONS
Access-Control-Allow-Headers: Content-Type,Authorization
Access-Control-Allow-Credentials: true
```

---

## 🔐 Security Features

### **1. Origin Validation**

Only explicitly allowed origins can access the API:

```typescript
✅ http://localhost:5173
✅ https://www.track-hire.app
✅ https://track-hire.app
❌ https://malicious-site.com
❌ http://localhost:3001 (not in list)
```

### **2. Credentials Support**

```typescript
credentials: true;
```

This allows:

- ✅ Cookies (accessToken, refreshToken)
- ✅ Authorization headers
- ✅ HTTP authentication

**Important:** When `credentials: true`, origin CANNOT be `*` (wildcard). Must be specific origins.

### **3. Request Without Origin**

Some requests don't have an origin:

- Mobile apps
- Postman/Insomnia
- Server-to-server requests
- Browser extensions

These are **allowed by default**:

```typescript
if (!origin) return callback(null, true);
```

### **4. Logging**

Blocked requests are logged:

```typescript
console.warn(`⚠️  Blocked CORS request from origin: ${origin}`);
```

Monitor logs to detect:

- Unauthorized access attempts
- Misconfigured frontends
- Missing origins in ALLOWED_ORIGINS

---

## 🔄 Adding New Origins

### **Development: Add Staging Environment**

**Update `.env`:**

```env
ALLOWED_ORIGINS=http://localhost:5173,https://staging.track-hire.app,https://www.track-hire.app,https://track-hire.app
```

### **Production: Add Mobile App**

If you build a mobile app later:

**Update `.env`:**

```env
ALLOWED_ORIGINS=http://localhost:5173,https://www.track-hire.app,https://track-hire.app,capacitor://localhost,ionic://localhost
```

### **Multiple Localhost Ports**

For team development:

**Update `.env`:**

```env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:3001,https://www.track-hire.app
```

---

## 🐛 Troubleshooting

### **Problem: CORS error in browser**

```
Access to fetch at 'http://localhost:3000/api/auth/login' from origin
'http://localhost:5174' has been blocked by CORS policy
```

**Solution:**

1. Check frontend origin: `http://localhost:5174`
2. Add to `.env`:
   ```env
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,https://www.track-hire.app
   ```
3. Restart server

### **Problem: Cookies not sent**

**Check:**

1. ✅ `credentials: true` in CORS config
2. ✅ Frontend uses `credentials: 'include'`:
   ```javascript
   fetch("http://localhost:3000/api/auth/login", {
     method: "POST",
     credentials: "include", // Important!
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify({ email, password }),
   });
   ```
3. ✅ Cookies have `SameSite=None; Secure` (for cross-origin)

### **Problem: Preflight request fails**

OPTIONS request returns 404 or 500.

**Solution:**

Express handles OPTIONS automatically with CORS middleware. If failing:

1. Check CORS is configured BEFORE routes
2. Verify `methods` includes "OPTIONS"
3. Check no middleware blocks OPTIONS

### **Problem: Production works, localhost doesn't**

**Check:**

1. `.env` has `http://localhost:5173` (not `https`)
2. Server is running (not using old build)
3. Port matches (5173 vs 5174, etc.)

---

## 📊 CORS Configuration Comparison

| Feature         | Development             | Production                   |
| --------------- | ----------------------- | ---------------------------- |
| **Origin**      | `http://localhost:5173` | `https://www.track-hire.app` |
| **Protocol**    | HTTP                    | HTTPS                        |
| **Port**        | 5173                    | 443 (default HTTPS)          |
| **Credentials** | ✅ Enabled              | ✅ Enabled                   |
| **Cookies**     | ✅ Works                | ✅ Works (needs Secure flag) |

---

## 🔒 Production Checklist

Before deploying:

- [ ] Update `ALLOWED_ORIGINS` in production `.env`
- [ ] Remove unnecessary localhost origins from production
- [ ] Verify production domain is correct (www vs apex)
- [ ] Test CORS from production frontend
- [ ] Check cookies work with `Secure; SameSite=None`
- [ ] Monitor blocked CORS requests in logs

---

## 📝 Environment-Specific Configuration

### **Development (`.env`)**

```env
NODE_ENV=development
CLIENT_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

### **Staging (`.env.staging`)**

```env
NODE_ENV=production
CLIENT_URL=https://staging.track-hire.app
ALLOWED_ORIGINS=https://staging.track-hire.app,http://localhost:5173
```

### **Production (`.env.production`)**

```env
NODE_ENV=production
CLIENT_URL=https://www.track-hire.app
ALLOWED_ORIGINS=https://www.track-hire.app,https://track-hire.app
```

---

## 🎯 Best Practices

### **1. Be Specific**

❌ **Don't:**

```typescript
origin: "*"; // Allows ALL origins (security risk)
```

✅ **Do:**

```typescript
origin: env.ALLOWED_ORIGINS; // Only specific origins
```

### **2. Use Environment Variables**

❌ **Don't:**

```typescript
origin: ["http://localhost:5173", "https://www.track-hire.app"]; // Hardcoded
```

✅ **Do:**

```typescript
origin: env.ALLOWED_ORIGINS; // From .env
```

### **3. Log Blocked Requests**

```typescript
console.warn(`⚠️  Blocked CORS request from origin: ${origin}`);
```

Monitor logs for:

- Security threats
- Misconfigured frontends
- Missing origins

### **4. Handle No Origin**

```typescript
if (!origin) return callback(null, true); // Allow Postman, mobile apps
```

### **5. Separate Concerns**

- `CLIENT_URL` → For emails, redirects (single URL)
- `ALLOWED_ORIGINS` → For CORS (multiple URLs)

---

## 🔗 Related Documentation

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Express CORS package](https://github.com/expressjs/cors)
- [OWASP: CORS Security](https://owasp.org/www-community/attacks/CORS_OriginHeaderScrutiny)

---

## 📚 Summary

**Current Setup:**

- ✅ Multiple origins supported (localhost + production)
- ✅ Credentials enabled (cookies work)
- ✅ Security: Only specific origins allowed
- ✅ Logging: Blocked requests logged
- ✅ Flexible: Easy to add new origins

**To add new origin:**

1. Add to `ALLOWED_ORIGINS` in `.env`
2. Restart server
3. Test from new origin

**Your CORS is production-ready!** 🎉
