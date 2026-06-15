# 📚 Swagger API Documentation

## 🌐 Access Swagger UI

### **Production**

```
https://api.track-hire.app/api-docs
```

### **Development**

```
http://localhost:3000/api-docs
```

---

## ⚙️ Configuration

Swagger is configured in `src/config/swagger.ts` with:

### **Multiple Servers**

Users can switch between servers in Swagger UI:

```typescript
servers: [
  {
    url: "https://api.track-hire.app",
    description: "Production server",
  },
  {
    url: "http://localhost:{port}",
    description: "Development server",
    variables: {
      port: {
        default: "3000",
        description: "Server port (default: 3000)",
      },
    },
  },
];
```

**Benefits:**

- ✅ Test against production API
- ✅ Test against local development server
- ✅ Switch between servers easily

### **API Information**

```typescript
info: {
  title: "Track Hire API",
  version: "1.0.0",
  description: "Complete job application tracking API",
  contact: {
    name: "Track Hire Team",
    url: "https://www.track-hire.app",
    email: "support@track-hire.app",
  },
  license: {
    name: "ISC",
    url: "https://opensource.org/licenses/ISC",
  },
}
```

---

## 🎯 How to Use Swagger UI

### **Step 1: Access Swagger**

**Production:**

```
https://api.track-hire.app/api-docs
```

**Development:**

```
http://localhost:3000/api-docs
```

### **Step 2: Select Server**

At the top of Swagger UI, you'll see a dropdown:

```
Servers
▼ Production server - https://api.track-hire.app
  Development server - http://localhost:3000
```

Select the server you want to test against.

### **Step 3: Test Endpoints**

#### **Public Endpoints (No Auth Required):**

1. **Register User**
   - POST `/api/auth/register`
   - Click "Try it out"
   - Fill in the request body
   - Click "Execute"

2. **Login**
   - POST `/api/auth/login`
   - Returns accessToken cookie automatically

#### **Protected Endpoints (Auth Required):**

After login, Swagger automatically includes your cookies in subsequent requests.

1. **Get Current User**
   - GET `/api/auth/me`
   - Click "Try it out"
   - Click "Execute"
   - Shows your profile

2. **Create Application**
   - POST `/api/applications`
   - Fill in application details
   - Execute

---

## 🔐 Authentication in Swagger

### **How It Works**

Track Hire API uses **httpOnly cookies** for authentication:

- **accessToken** - Short-lived (15 minutes)
- **refreshToken** - Long-lived (7 days)

Swagger UI **automatically handles cookies** after login:

```
1. POST /api/auth/login → Returns Set-Cookie headers
2. Browser stores cookies automatically
3. Subsequent requests include cookies automatically
4. No manual authorization needed!
```

### **Manual Testing (cURL)**

If using cURL instead of Swagger UI:

```bash
# 1. Login and save cookies
curl -X POST https://api.track-hire.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  -c cookies.txt

# 2. Use cookies in subsequent requests
curl -X GET https://api.track-hire.app/api/auth/me \
  -b cookies.txt
```

---

## 📖 API Endpoints Overview

### **Authentication (`/api/auth`)**

| Method | Endpoint           | Description               | Auth Required      |
| ------ | ------------------ | ------------------------- | ------------------ |
| POST   | `/register`        | Register new user         | No                 |
| POST   | `/verify-email`    | Verify email address      | No                 |
| POST   | `/login`           | Login with email/password | No                 |
| POST   | `/google`          | Login with Google OAuth   | No                 |
| POST   | `/forgot-password` | Request password reset    | No                 |
| POST   | `/reset-password`  | Reset password with token | No                 |
| POST   | `/refresh`         | Refresh access token      | Yes (refreshToken) |
| POST   | `/logout`          | Logout user               | No                 |
| GET    | `/me`              | Get current user profile  | Yes                |

### **Users (`/api/users`)**

| Method | Endpoint       | Description         | Auth Required |
| ------ | -------------- | ------------------- | ------------- |
| GET    | `/`            | List all users      | Yes (Admin)   |
| GET    | `/{id}`        | Get user by ID      | Yes           |
| PUT    | `/{id}`        | Update user profile | Yes           |
| DELETE | `/{id}`        | Delete user         | Yes (Admin)   |
| PUT    | `/{id}/avatar` | Upload avatar       | Yes           |
| DELETE | `/{id}/avatar` | Delete avatar       | Yes           |

### **Applications (`/api/applications`)**

| Method | Endpoint       | Description             | Auth Required |
| ------ | -------------- | ----------------------- | ------------- |
| GET    | `/`            | List applications       | Yes           |
| GET    | `/{id}`        | Get application details | Yes           |
| POST   | `/`            | Create application      | Yes           |
| PUT    | `/{id}`        | Update application      | Yes           |
| DELETE | `/{id}`        | Delete application      | Yes           |
| POST   | `/extract-url` | AI extract from URL     | Yes           |

### **Companies (`/api/companies`)**

| Method | Endpoint | Description         | Auth Required |
| ------ | -------- | ------------------- | ------------- |
| GET    | `/`      | List companies      | Yes           |
| GET    | `/{id}`  | Get company details | Yes           |
| POST   | `/`      | Create company      | Yes           |
| PUT    | `/{id}`  | Update company      | Yes           |
| DELETE | `/{id}`  | Delete company      | Yes           |

### **Reminders (`/api/reminders`)**

| Method | Endpoint | Description          | Auth Required |
| ------ | -------- | -------------------- | ------------- |
| GET    | `/`      | List reminders       | Yes           |
| GET    | `/{id}`  | Get reminder details | Yes           |
| POST   | `/`      | Create reminder      | Yes           |
| PUT    | `/{id}`  | Update reminder      | Yes           |
| DELETE | `/{id}`  | Delete reminder      | Yes           |

### **Dashboard (`/api/dashboard`)**

| Method | Endpoint | Description              | Auth Required |
| ------ | -------- | ------------------------ | ------------- |
| GET    | `/stats` | Get dashboard statistics | Yes           |

---

## 🧪 Testing Workflow

### **1. Register & Verify Email**

```
1. POST /api/auth/register
   → Creates user, sends verification email

2. Check email inbox for verification link

3. POST /api/auth/verify-email
   → Body: { "token": "token-from-email" }
   → Verifies email
```

### **2. Login**

```
POST /api/auth/login
Body: {
  "email": "user@example.com",
  "password": "password123"
}

Response:
- Sets accessToken cookie (15min)
- Sets refreshToken cookie (7 days)
- Returns user profile
```

### **3. Test Protected Endpoints**

```
GET /api/auth/me
→ Cookies automatically included
→ Returns current user profile

POST /api/applications
Body: {
  "title": "Software Engineer",
  "company": "Tech Corp",
  "status": "APPLIED"
}
→ Creates application
```

### **4. Test Refresh Token**

```
# Wait 16 minutes (accessToken expires)

GET /api/auth/me
→ Returns 401 Unauthorized

POST /api/auth/refresh
→ Uses refreshToken cookie
→ Issues new accessToken
→ Now /api/auth/me works again
```

### **5. Test Admin Endpoints**

```
# Login as admin user

GET /api/users
→ Lists all users (admin only)

DELETE /api/users/{id}
→ Soft-deletes user (admin only)
```

---

## 🔍 Response Codes

### **Success Codes**

| Code | Meaning    | Example                       |
| ---- | ---------- | ----------------------------- |
| 200  | OK         | GET /api/auth/me              |
| 201  | Created    | POST /api/auth/register       |
| 204  | No Content | DELETE /api/applications/{id} |

### **Error Codes**

| Code | Meaning               | Common Causes                   |
| ---- | --------------------- | ------------------------------- |
| 400  | Bad Request           | Invalid input, validation error |
| 401  | Unauthorized          | Missing/invalid token           |
| 403  | Forbidden             | Insufficient permissions        |
| 404  | Not Found             | Resource doesn't exist          |
| 409  | Conflict              | Email/username already exists   |
| 429  | Too Many Requests     | Rate limit exceeded             |
| 500  | Internal Server Error | Server error                    |

---

## 📊 Swagger UI Features

### **Try It Out**

Click "Try it out" on any endpoint to:

- Edit request parameters
- Modify request body
- Execute the request
- See real response

### **Example Requests**

Swagger shows example requests and responses:

```json
// Example request body
{
  "email": "user@example.com",
  "password": "password123"
}

// Example response
{
  "message": "Login successful",
  "user": {
    "id": "clxyz123",
    "name": "John Doe",
    "email": "user@example.com"
  }
}
```

### **Schema Models**

Click on model names to see full schema:

```
User {
  id: string
  name: string
  email: string (format: email)
  role: enum(USER, ADMIN)
  createdAt: string (date-time)
}
```

### **cURL Export**

After executing a request, copy the cURL command:

```bash
curl -X GET "https://api.track-hire.app/api/auth/me" \
  -H "accept: application/json"
```

---

## 🎨 Customization

### **Custom CSS**

Swagger UI has custom styling in `server.ts`:

```typescript
swaggerUi.setup(swaggerSpec, {
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "Track Hire API Documentation",
});
```

### **Features Hidden:**

- Top bar (Swagger branding)

### **Features Visible:**

- API title and description
- Server selector
- All endpoints with schemas
- Try it out functionality
- Response examples

---

## 🔗 External Links

### **Swagger Resources**

- **OpenAPI Specification**: https://swagger.io/specification/
- **Swagger UI**: https://swagger.io/tools/swagger-ui/
- **Swagger Editor**: https://editor.swagger.io/

### **Track Hire Links**

- **Production API**: https://api.track-hire.app
- **Production Docs**: https://api.track-hire.app/api-docs
- **Frontend**: https://www.track-hire.app
- **Support Email**: support@track-hire.app

---

## 💡 Tips

### **1. Use Server Selector**

Switch between production and development:

```
▼ Production server - https://api.track-hire.app
  Development server - http://localhost:3000
```

### **2. Login First**

Most endpoints require authentication. Start with:

```
POST /api/auth/login
```

### **3. Check Response Schemas**

Click on response codes to see full response structure:

```
200 ▼ User fetched successfully
  application/json
    Schema ▼
    Example Value ▼
```

### **4. Test Error Cases**

Try invalid inputs to see error responses:

```
POST /api/auth/login
Body: { "email": "invalid", "password": "" }

Response: 400 Bad Request
{
  "message": "Validation error"
}
```

### **5. Export cURL Commands**

Copy cURL commands for use in scripts or Postman:

```
Click "Execute" → Copy cURL command
```

---

## 🐛 Troubleshooting

### **Problem: Cookies not working**

**Solution:**

- Swagger UI on same domain works automatically
- Cross-domain requires CORS config (already set)
- Check browser console for CORS errors

### **Problem: 401 Unauthorized**

**Causes:**

1. Not logged in → Login first
2. Token expired → Use /api/auth/refresh
3. Testing from different server → Switch server in dropdown

### **Problem: Can't switch servers**

**Solution:**

- Dropdown is at top of page
- Refresh page if not visible
- Clear browser cache

### **Problem: Request fails with CORS error**

**Solution:**

- Check ALLOWED_ORIGINS in backend .env
- Ensure frontend domain is whitelisted
- See [cors-configuration.md](./cors-configuration.md)

---

## ✅ Production Checklist

Before using Swagger in production:

- [ ] Swagger accessible at https://api.track-hire.app/api-docs
- [ ] Production server selected by default
- [ ] Test all public endpoints
- [ ] Test authentication flow
- [ ] Test protected endpoints
- [ ] Verify error responses
- [ ] Check CORS configuration
- [ ] Test from production frontend

---

**Swagger documentation is ready!** 🎉

Access it at:

- **Production**: https://api.track-hire.app/api-docs
- **Development**: http://localhost:3000/api-docs
