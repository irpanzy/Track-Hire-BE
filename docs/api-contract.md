# 📘 Track Hire API Contract - Complete Specification

Complete and detailed API documentation for Track Hire backend application.

---

## 🌐 Base URLs

**Production:** `https://api.track-hire.app`  
**Development:** `http://localhost:3000`

---

## 🔐 Authentication

### Cookie-based Authentication

- `accessToken` (HttpOnly, 15 minutes) - For API requests
- `refreshToken` (HttpOnly, 7 days) - For refreshing access token

### Alternative: Bearer Token

```
Authorization: Bearer {accessToken}
```

---

## 📋 Endpoint Summary

### **Authentication (9 endpoints)**

| #   | Method | Endpoint                                          | Auth   | Description               |
| --- | ------ | ------------------------------------------------- | ------ | ------------------------- |
| 1   | POST   | [`/api/auth/register`](#1-register-user)          | None   | Register new user         |
| 2   | POST   | [`/api/auth/verify-email`](#2-verify-email)       | None   | Verify email address      |
| 3   | POST   | [`/api/auth/login`](#3-login)                     | None   | Login with email/password |
| 4   | POST   | [`/api/auth/google`](#4-google-oauth-login)       | None   | Login with Google OAuth   |
| 5   | POST   | [`/api/auth/forgot-password`](#5-forgot-password) | None   | Request password reset    |
| 6   | POST   | [`/api/auth/reset-password`](#6-reset-password)   | None   | Reset password            |
| 7   | POST   | [`/api/auth/refresh`](#7-refresh-access-token)    | Cookie | Refresh access token      |
| 8   | POST   | [`/api/auth/logout`](#8-logout)                   | None   | Logout user               |
| 9   | GET    | [`/api/auth/me`](#9-get-current-user)             | JWT    | Get current user profile  |

### **User Management (9 endpoints)**

| #   | Method | Endpoint                                                             | Auth  | Description             |
| --- | ------ | -------------------------------------------------------------------- | ----- | ----------------------- |
| 10  | GET    | [`/api/users`](#10-list-all-users-admin-only)                        | Admin | List all users          |
| 11  | GET    | [`/api/users/:id`](#11-get-user-by-id)                               | JWT   | Get user by ID          |
| 12  | PUT    | [`/api/users/:id`](#12-update-user-profile)                          | JWT   | Update user profile     |
| 13  | PUT    | [`/api/users/:id/avatar`](#13-upload-avatar)                         | JWT   | Upload avatar           |
| 14  | DELETE | [`/api/users/:id/avatar`](#14-delete-avatar)                         | JWT   | Delete avatar           |
| 15  | DELETE | [`/api/users/:id`](#15-soft-delete-user-admin-only)                  | Admin | Soft-delete user        |
| 16  | GET    | [`/api/users/deleted/list`](#16-list-deleted-users-admin-only)       | Admin | List deleted users      |
| 17  | POST   | [`/api/users/:id/restore`](#17-restore-deleted-user-admin-only)      | Admin | Restore deleted user    |
| 18  | DELETE | [`/api/users/:id/permanent`](#18-permanently-delete-user-admin-only) | Admin | Permanently delete user |

### **Application Management (9 endpoints)**

| #   | Method | Endpoint                                                                | Auth | Description                    |
| --- | ------ | ----------------------------------------------------------------------- | ---- | ------------------------------ |
| 19  | POST   | [`/api/applications`](#19-create-application)                           | JWT  | Create application             |
| 20  | POST   | [`/api/applications/extract-url`](#20-ai-extract-job-details-from-url)  | JWT  | AI extract from URL            |
| 21  | GET    | [`/api/applications`](#21-list-applications)                            | JWT  | List applications              |
| 22  | GET    | [`/api/applications/:id`](#22-get-application-by-id)                    | JWT  | Get application by ID          |
| 23  | PUT    | [`/api/applications/:id`](#23-update-application)                       | JWT  | Update application             |
| 24  | DELETE | [`/api/applications/:id`](#24-soft-delete-application)                  | JWT  | Soft-delete application        |
| 25  | GET    | [`/api/applications/deleted/list`](#25-list-deleted-applications)       | JWT  | List deleted applications      |
| 26  | POST   | [`/api/applications/:id/restore`](#26-restore-application)              | JWT  | Restore deleted application    |
| 27  | DELETE | [`/api/applications/:id/permanent`](#27-permanently-delete-application) | JWT  | Permanently delete application |

### **Company Management (8 endpoints)**

| #   | Method | Endpoint                                                         | Auth | Description                |
| --- | ------ | ---------------------------------------------------------------- | ---- | -------------------------- |
| 28  | POST   | [`/api/companies`](#28-create-company)                           | JWT  | Create company             |
| 29  | GET    | [`/api/companies`](#29-list-companies)                           | JWT  | List companies             |
| 30  | GET    | [`/api/companies/:id`](#30-get-company-by-id)                    | JWT  | Get company by ID          |
| 31  | PUT    | [`/api/companies/:id`](#31-update-company)                       | JWT  | Update company             |
| 32  | DELETE | [`/api/companies/:id`](#32-soft-delete-company)                  | JWT  | Soft-delete company        |
| 33  | GET    | [`/api/companies/deleted/list`](#33-list-deleted-companies)      | JWT  | List deleted companies     |
| 34  | POST   | [`/api/companies/:id/restore`](#34-restore-company)              | JWT  | Restore deleted company    |
| 35  | DELETE | [`/api/companies/:id/permanent`](#35-permanently-delete-company) | JWT  | Permanently delete company |

### **Reminder Management (8 endpoints)**

| #   | Method | Endpoint                                                          | Auth | Description                 |
| --- | ------ | ----------------------------------------------------------------- | ---- | --------------------------- |
| 36  | POST   | [`/api/reminders`](#36-create-reminder)                           | JWT  | Create reminder             |
| 37  | GET    | [`/api/reminders`](#37-list-reminders)                            | JWT  | List reminders              |
| 38  | GET    | [`/api/reminders/:id`](#38-get-reminder-by-id)                    | JWT  | Get reminder by ID          |
| 39  | PUT    | [`/api/reminders/:id`](#39-update-reminder)                       | JWT  | Update reminder             |
| 40  | DELETE | [`/api/reminders/:id`](#40-soft-delete-reminder)                  | JWT  | Soft-delete reminder        |
| 41  | GET    | [`/api/reminders/deleted/list`](#41-list-deleted-reminders)       | JWT  | List deleted reminders      |
| 42  | POST   | [`/api/reminders/:id/restore`](#42-restore-reminder)              | JWT  | Restore deleted reminder    |
| 43  | DELETE | [`/api/reminders/:id/permanent`](#43-permanently-delete-reminder) | JWT  | Permanently delete reminder |

### **Dashboard (1 endpoint)**

| #   | Method | Endpoint                                               | Auth | Description              |
| --- | ------ | ------------------------------------------------------ | ---- | ------------------------ |
| 44  | GET    | [`/api/dashboard/stats`](#44-get-dashboard-statistics) | JWT  | Get dashboard statistics |

**Total: 44 endpoints**

---

## 📖 Detailed Endpoint Specifications

---

## 🔑 AUTHENTICATION ENDPOINTS

---

### 1. Register User

**Endpoint:** `POST /api/auth/register`  
**Auth:** None  
**Description:** Register a new user account. Sends verification email.

**Request Body:**

```json
{
  "name": "string (required, min: 2, max: 100)",
  "username": "string (required, min: 3, max: 30, alphanumeric + underscore)",
  "email": "string (required, valid email)",
  "password": "string (required, min: 8, must contain uppercase, lowercase, number)",
  "confirmPassword": "string (required, must match password)"
}
```

**Example Request:**

```json
{
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "Password123",
  "confirmPassword": "Password123"
}
```

**Success Response (201 Created):**

```json
{
  "message": "Registration successful. Please check your email to verify your account.",
  "user": {
    "id": "clxyz123",
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "USER"
  }
}
```

**Error Responses:**

- `400 Bad Request` - Validation error or passwords don't match
- `409 Conflict` - Email or username already exists

---

### 2. Verify Email

**Endpoint:** `POST /api/auth/verify-email`  
**Auth:** None

**Request Body:**

```json
{
  "token": "string (required, verification token from email)"
}
```

**Success Response (200):**

```json
{
  "message": "Email verified successfully"
}
```

**Error:** `400` - Invalid or expired token

---

### 3. Login

**Endpoint:** `POST /api/auth/login`  
**Auth:** None  
**Sets Cookies:** `accessToken`, `refreshToken`

**Request Body:**

```json
{
  "emailOrUsername": "string (email or username)",
  "password": "string"
}
```

**Success Response (200):**

```json
{
  "message": "Login successful",
  "user": {
    "id": "clxyz123",
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "USER",
    "avatarUrl": null,
    "isEmailVerified": true,
    "createdAt": "2026-06-17T00:00:00.000Z"
  }
}
```

**Error Responses:**

- `401` - Invalid credentials or Google-only account
- `403` - Email not verified

---

### 4. Google OAuth Login

**Endpoint:** `POST /api/auth/google`  
**Auth:** None  
**Sets Cookies:** `accessToken`, `refreshToken`

**Request Body:**

```json
{
  "idToken": "string (Google ID token from frontend)"
}
```

**Success Response (200):** Same as regular login

**Error:** `401` - Invalid Google token

---

### 5. Forgot Password

**Endpoint:** `POST /api/auth/forgot-password`  
**Auth:** None  
**Note:** Only for email/password accounts, not Google OAuth

**Request Body:**

```json
{
  "email": "string"
}
```

**Success Response (200):**

```json
{
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

---

### 6. Reset Password

**Endpoint:** `POST /api/auth/reset-password`  
**Auth:** None

**Request Body:**

```json
{
  "token": "string (reset token from email)",
  "password": "string (min: 8, must contain uppercase, lowercase, number)"
}
```

**Success Response (200):**

```json
{
  "message": "Password reset successfully"
}
```

**Error:** `400` - Invalid token, expired, or Google account

---

### 7. Refresh Access Token

**Endpoint:** `POST /api/auth/refresh`  
**Auth:** `refreshToken` cookie  
**Sets Cookie:** New `accessToken`

**Success Response (200):**

```json
{
  "message": "Access token refreshed successfully"
}
```

**Error:** `401` - Invalid or expired refresh token

---

### 8. Logout

**Endpoint:** `POST /api/auth/logout`  
**Auth:** None  
**Clears Cookies:** `accessToken`, `refreshToken`

**Success Response (200):**

```json
{
  "message": "Logout successful"
}
```

---

### 9. Get Current User

**Endpoint:** `GET /api/auth/me`  
**Auth:** JWT (accessToken cookie)

**Success Response (200):**

```json
{
  "message": "User fetched successfully",
  "user": {
    "id": "clxyz123",
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "USER",
    "avatarUrl": "https://ik.imagekit.io/.../avatar.webp",
    "isEmailVerified": true,
    "createdAt": "2026-06-17T00:00:00.000Z"
  }
}
```

**Error:** `401` - Unauthorized, `404` - User not found

---

## 👥 USER MANAGEMENT ENDPOINTS

---

### 10. List All Users (Admin Only)

**Endpoint:** `GET /api/users`  
**Auth:** JWT (Admin role required)

**Query Parameters:**

- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 10, max: 100) - Items per page
- `search` (string) - Search by name, username, or email
- `role` (enum: USER, ADMIN) - Filter by role
- `sortBy` (enum: name, username, email, createdAt, default: createdAt)
- `order` (enum: asc, desc, default: desc)

**Example:** `/api/users?page=1&limit=10&role=USER&search=john`

**Success Response (200):**

```json
{
  "message": "Users fetched successfully",
  "users": [
    {
      "id": "clxyz123",
      "name": "John Doe",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "USER",
      "avatarUrl": null,
      "isEmailVerified": true,
      "createdAt": "2026-06-17T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

**Error:** `403` - Forbidden (not admin)

---

### 11. Get User By ID

**Endpoint:** `GET /api/users/:id`  
**Auth:** JWT (Self or Admin)

**Success Response (200):** Same as Get Current User

**Error:** `403` - Forbidden (not self or admin), `404` - User not found

---

### 12. Update User Profile

**Endpoint:** `PUT /api/users/:id`  
**Auth:** JWT (Self or Admin)

**Request Body:**

```json
{
  "name": "string (optional, min: 2, max: 100)",
  "username": "string (optional, min: 3, max: 30)"
}
```

**Success Response (200):** Returns updated user object

**Error:** `409` - Username already taken

---

### 13. Upload Avatar

**Endpoint:** `PUT /api/users/:id/avatar`  
**Auth:** JWT (Self or Admin)  
**Content-Type:** `multipart/form-data`

**Request Body:**

```
avatar: File (JPEG, PNG, WebP, GIF, max: 2MB)
```

**Success Response (200):**

```json
{
  "message": "Avatar updated successfully",
  "user": {
    "id": "clxyz123",
    "avatarUrl": "https://ik.imagekit.io/.../avatar.webp",
    ...
  }
}
```

**Error:** `400` - Invalid file type or size

---

### 14. Delete Avatar

**Endpoint:** `DELETE /api/users/:id/avatar`  
**Auth:** JWT (Self or Admin)

**Success Response (200):**

```json
{
  "message": "Avatar deleted successfully",
  "user": {
    "id": "clxyz123",
    "avatarUrl": null,
    ...
  }
}
```

---

### 15. Soft Delete User (Admin Only)

**Endpoint:** `DELETE /api/users/:id`  
**Auth:** JWT (Admin role required)  
**Note:** Sets `deletedAt` timestamp, user can be restored

**Success Response (200):**

```json
{
  "message": "User deleted successfully"
}
```

**Error:** `403` - Forbidden (not admin), `404` - User not found

---

### 16. List Deleted Users (Admin Only)

**Endpoint:** `GET /api/users/deleted/list`  
**Auth:** JWT (Admin role required)

**Query Parameters:**

- `page`, `limit`, `search`, `role` (same as List All Users)

**Success Response (200):**

```json
{
  "message": "Deleted users fetched successfully",
  "users": [
    {
      "id": "clxyz123",
      "name": "John Doe",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "USER",
      "deletedAt": "2026-06-17T10:30:00.000Z",
      "createdAt": "2026-06-01T00:00:00.000Z"
    }
  ],
  "pagination": { ... }
}
```

---

### 17. Restore Deleted User (Admin Only)

**Endpoint:** `POST /api/users/:id/restore`  
**Auth:** JWT (Admin role required)  
**Note:** Sets `deletedAt` to null

**Success Response (200):**

```json
{
  "message": "User restored successfully",
  "user": { ... }
}
```

**Error:** `400` - User is not deleted, `404` - User not found

---

### 18. Permanently Delete User (Admin Only)

**Endpoint:** `DELETE /api/users/:id/permanent`  
**Auth:** JWT (Admin role required)  
**⚠️ WARNING:** Cannot be undone! Deletes user and all related data.

**What gets deleted:**

- User account
- All applications (and history)
- All reminders
- Verification tokens
- Avatar from ImageKit

**Success Response (200):**

```json
{
  "message": "User permanently deleted"
}
```

**Error:** `404` - User not found

---

## 📝 APPLICATION MANAGEMENT ENDPOINTS

---

### 19. Create Application

**Endpoint:** `POST /api/applications`  
**Auth:** JWT

**Request Body:**

```json
{
  "companyName": "string (required, min: 1, max: 200)",
  "companyWebsite": "string (optional, valid URL)",
  "companyLocation": "string (optional, max: 200)",
  "position": "string (required, min: 2, max: 200)",
  "jobType": "enum (FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, FREELANCE, REMOTE)",
  "location": "string (optional, max: 200)",
  "source": "enum (LINKEDIN, GLINTS, JOBSTREET, UPWORK, INDEED, WEBSITE, INSTAGRAM, X, OTHER)",
  "sourceUrl": "string (optional, valid URL)",
  "description": "string (optional)",
  "requirements": "string (optional)",
  "salaryRange": "string (optional, max: 100)",
  "status": "enum (APPLIED, SCREENING, INTERVIEW, TECHNICAL_TEST, HR_INTERVIEW, OFFERING, ACCEPTED, REJECTED, WITHDRAWN), default: APPLIED",
  "appliedDate": "datetime (optional, default: now)",
  "deadlineDate": "datetime (optional)",
  "notes": "string (optional)"
}
```

**Example Request:**

```json
{
  "companyName": "Tech Corp",
  "companyWebsite": "https://techcorp.com",
  "companyLocation": "Jakarta",
  "position": "Backend Developer",
  "jobType": "FULL_TIME",
  "location": "Jakarta",
  "source": "LINKEDIN",
  "sourceUrl": "https://linkedin.com/jobs/12345",
  "description": "Building REST APIs",
  "requirements": "3+ years Node.js",
  "salaryRange": "15.000.000 - 25.000.000",
  "status": "APPLIED"
}
```

**Success Response (201):**

```json
{
  "message": "Application created successfully",
  "application": {
    "id": "app123",
    "position": "Backend Developer",
    "jobType": "FULL_TIME",
    "location": "Jakarta",
    "source": "LINKEDIN",
    "sourceUrl": "https://linkedin.com/jobs/12345",
    "description": "Building REST APIs",
    "requirements": "3+ years Node.js",
    "salaryRange": "15.000.000 - 25.000.000",
    "status": "APPLIED",
    "appliedDate": "2026-06-17T00:00:00.000Z",
    "deadlineDate": null,
    "notes": null,
    "createdAt": "2026-06-17T00:00:00.000Z",
    "company": {
      "id": "comp123",
      "name": "Tech Corp",
      "website": "https://techcorp.com",
      "location": "Jakarta"
    }
  }
}
```

**Error:** `400` - Validation error

---

### 20. AI Extract Job Details From URL

**Endpoint:** `POST /api/applications/extract-url`  
**Auth:** JWT  
**Rate Limit:** 10 requests per hour per user

**Request Body:**

```json
{
  "url": "string (required, valid URL)"
}
```

**Success Response (200):**

```json
{
  "message": "Job details extracted successfully",
  "data": {
    "companyName": "Google",
    "companyWebsite": "https://about.google",
    "companyLocation": "Mountain View, CA",
    "position": "Software Engineer",
    "jobType": "FULL_TIME",
    "location": "Remote",
    "source": "LINKEDIN",
    "sourceUrl": "https://...",
    "description": "We are looking for...",
    "requirements": "Strong programming skills...",
    "salaryRange": "150.000.000 - 250.000.000",
    "deadlineDate": "2026-07-31"
  }
}
```

**Error:** `429` - Rate limit exceeded

---

### 21. List Applications

**Endpoint:** `GET /api/applications`  
**Auth:** JWT  
**Note:** Users see only their own, admins see all

**Query Parameters:**

- `page` (integer, default: 1)
- `limit` (integer, default: 10, max: 100)
- `search` (string) - Search by position or company name
- `status` (enum) - Filter by status
- `source` (enum) - Filter by source
- `jobType` (enum) - Filter by job type
- `sortBy` (enum: appliedDate, createdAt, position, status, default: appliedDate)
- `order` (enum: asc, desc, default: desc)

**Example:** `/api/applications?page=1&limit=10&status=INTERVIEW&sortBy=appliedDate`

**Success Response (200):**

```json
{
  "message": "Applications fetched successfully",
  "applications": [
    {
      "id": "app123",
      "position": "Backend Developer",
      "jobType": "FULL_TIME",
      "status": "INTERVIEW",
      "appliedDate": "2026-06-17T00:00:00.000Z",
      "company": {
        "id": "comp123",
        "name": "Tech Corp",
        "website": "https://techcorp.com",
        "location": "Jakarta"
      },
      ...
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

---

### 22. Get Application By ID

**Endpoint:** `GET /api/applications/:id`  
**Auth:** JWT (Owner or Admin)

**Success Response (200):**

```json
{
  "message": "Application fetched successfully",
  "application": {
    "id": "app123",
    "position": "Backend Developer",
    ...,
    "company": { ... },
    "histories": [
      {
        "id": "hist2",
        "oldStatus": "APPLIED",
        "newStatus": "INTERVIEW",
        "notes": "Interview scheduled",
        "createdAt": "2026-06-18T00:00:00.000Z"
      },
      {
        "id": "hist1",
        "oldStatus": null,
        "newStatus": "APPLIED",
        "notes": "Application created",
        "createdAt": "2026-06-17T00:00:00.000Z"
      }
    ]
  }
}
```

**Error:** `403` - Forbidden (not owner), `404` - Not found

---

### 23. Update Application

**Endpoint:** `PUT /api/applications/:id`  
**Auth:** JWT (Owner or Admin)

**Request Body:** All fields from Create Application are optional

**Example:**

```json
{
  "status": "INTERVIEW",
  "notes": "Interview scheduled for Monday"
}
```

**Success Response (200):** Returns updated application

**Note:** Status change creates history record automatically

---

### 24. Soft Delete Application

**Endpoint:** `DELETE /api/applications/:id`  
**Auth:** JWT (Owner or Admin)

**Success Response (200):**

```json
{
  "message": "Application deleted successfully"
}
```

---

### 25. List Deleted Applications

**Endpoint:** `GET /api/applications/deleted/list`  
**Auth:** JWT

**Query Parameters:** Same as List Applications

**Success Response (200):**

```json
{
  "message": "Deleted applications fetched successfully",
  "applications": [
    {
      "id": "app123",
      "position": "Backend Developer",
      "deletedAt": "2026-06-17T10:30:00.000Z",
      ...
    }
  ],
  "pagination": { ... }
}
```

---

### 26. Restore Application

**Endpoint:** `POST /api/applications/:id/restore`  
**Auth:** JWT (Owner or Admin)

**Success Response (200):**

```json
{
  "message": "Application restored successfully",
  "application": { ... }
}
```

**Error:** `400` - Application is not deleted

---

### 27. Permanently Delete Application

**Endpoint:** `DELETE /api/applications/:id/permanent`  
**Auth:** JWT (Owner or Admin)  
**⚠️ WARNING:** Cannot be undone!

**What gets deleted:**

- Application record
- Application history
- Reminders linked to application (unlinked, not deleted)

**Success Response (200):**

```json
{
  "message": "Application permanently deleted"
}
```

---

## 🏢 COMPANY MANAGEMENT ENDPOINTS

---

### 28. Create Company

**Endpoint:** `POST /api/companies`  
**Auth:** JWT

**Request Body:**

```json
{
  "name": "string (required, min: 1, max: 200, unique case-insensitive)",
  "website": "string (optional, valid URL)",
  "location": "string (optional, max: 200)"
}
```

**Success Response (201):**

```json
{
  "message": "Company created successfully",
  "company": {
    "id": "comp123",
    "name": "Tech Corp",
    "website": "https://techcorp.com",
    "location": "Jakarta",
    "createdAt": "2026-06-17T00:00:00.000Z",
    "updatedAt": "2026-06-17T00:00:00.000Z"
  }
}
```

**Error:** `409` - Company name already exists

---

### 29. List Companies

**Endpoint:** `GET /api/companies`  
**Auth:** JWT

**Query Parameters:**

- `page` (integer, default: 1)
- `limit` (integer, default: 10, max: 100)
- `search` (string) - Search by company name
- `userOnly` (boolean) - Show only companies user has applications for
- `sortBy` (enum: name, createdAt, default: createdAt)
- `order` (enum: asc, desc, default: desc)

**Success Response (200):**

```json
{
  "message": "Companies fetched successfully",
  "companies": [
    {
      "id": "comp123",
      "name": "Tech Corp",
      "website": "https://techcorp.com",
      "location": "Jakarta",
      "createdAt": "2026-06-17T00:00:00.000Z",
      "updatedAt": "2026-06-17T00:00:00.000Z"
    }
  ],
  "pagination": { ... }
}
```

---

### 30. Get Company By ID

**Endpoint:** `GET /api/companies/:id`  
**Auth:** JWT

**Success Response (200):**

```json
{
  "message": "Company fetched successfully",
  "company": {
    "id": "comp123",
    "name": "Tech Corp",
    "website": "https://techcorp.com",
    "location": "Jakarta",
    "createdAt": "2026-06-17T00:00:00.000Z",
    "updatedAt": "2026-06-17T00:00:00.000Z",
    "applications": [
      {
        "id": "app123",
        "position": "Backend Developer",
        "jobType": "FULL_TIME",
        "status": "APPLIED",
        "appliedDate": "2026-06-17T00:00:00.000Z",
        "createdAt": "2026-06-17T00:00:00.000Z"
      }
    ]
  }
}
```

**Note:** Applications list shows only current user's applications

---

### 31. Update Company

**Endpoint:** `PUT /api/companies/:id`  
**Auth:** JWT

**Request Body:**

```json
{
  "name": "string (optional)",
  "website": "string (optional)",
  "location": "string (optional)"
}
```

**Success Response (200):** Returns updated company

**Error:** `409` - Company name already taken

---

### 32. Soft Delete Company

**Endpoint:** `DELETE /api/companies/:id`  
**Auth:** JWT

**Success Response (200):**

```json
{
  "message": "Company deleted successfully"
}
```

---

### 33. List Deleted Companies

**Endpoint:** `GET /api/companies/deleted/list`  
**Auth:** JWT

**Query Parameters:** `page`, `limit`, `search`, `sortBy`, `order`

**Success Response (200):**

```json
{
  "message": "Deleted companies fetched successfully",
  "companies": [
    {
      "id": "comp123",
      "name": "Tech Corp",
      "deletedAt": "2026-06-17T10:30:00.000Z",
      ...
    }
  ],
  "pagination": { ... }
}
```

---

### 34. Restore Company

**Endpoint:** `POST /api/companies/:id/restore`  
**Auth:** JWT

**Success Response (200):**

```json
{
  "message": "Company restored successfully",
  "company": { ... }
}
```

---

### 35. Permanently Delete Company

**Endpoint:** `DELETE /api/companies/:id/permanent`  
**Auth:** JWT  
**⚠️ WARNING:** Cannot be undone!

**Restriction:** Cannot delete if company has existing applications

**Success Response (200):**

```json
{
  "message": "Company permanently deleted"
}
```

**Error Response (400):**

```json
{
  "message": "Cannot permanently delete company with existing applications. Delete or reassign applications first."
}
```

---

## ⏰ REMINDER MANAGEMENT ENDPOINTS

---

### 36. Create Reminder

**Endpoint:** `POST /api/reminders`  
**Auth:** JWT

**Request Body:**

```json
{
  "title": "string (required, min: 1, max: 200)",
  "description": "string (optional)",
  "reminderDate": "datetime (required)",
  "applicationId": "string (optional, must be owned by user)"
}
```

**Example:**

```json
{
  "title": "Follow up interview",
  "description": "Call HR for interview feedback",
  "reminderDate": "2026-06-25T10:00:00.000Z",
  "applicationId": "app123"
}
```

**Success Response (201):**

```json
{
  "message": "Reminder created successfully",
  "reminder": {
    "id": "rem123",
    "title": "Follow up interview",
    "description": "Call HR for interview feedback",
    "reminderDate": "2026-06-25T10:00:00.000Z",
    "isDone": false,
    "createdAt": "2026-06-17T00:00:00.000Z",
    "updatedAt": "2026-06-17T00:00:00.000Z",
    "application": {
      "id": "app123",
      "position": "Backend Developer",
      "company": {
        "name": "Tech Corp"
      }
    }
  }
}
```

**Error:** `404` - Application not found

---

### 37. List Reminders

**Endpoint:** `GET /api/reminders`  
**Auth:** JWT

**Query Parameters:**

- `page` (integer, default: 1)
- `limit` (integer, default: 10, max: 100)
- `isDone` (boolean) - Filter by completion status
- `applicationId` (string) - Filter by application
- `upcoming` (boolean) - Show only upcoming incomplete reminders
- `sortBy` (enum: reminderDate, createdAt, default: reminderDate)
- `order` (enum: asc, desc, default: asc)

**Example:** `/api/reminders?upcoming=true&isDone=false`

**Success Response (200):**

```json
{
  "message": "Reminders fetched successfully",
  "reminders": [
    {
      "id": "rem123",
      "title": "Follow up interview",
      "description": "Call HR",
      "reminderDate": "2026-06-25T10:00:00.000Z",
      "isDone": false,
      "createdAt": "2026-06-17T00:00:00.000Z",
      "updatedAt": "2026-06-17T00:00:00.000Z",
      "application": {
        "id": "app123",
        "position": "Backend Developer",
        "company": {
          "name": "Tech Corp"
        }
      }
    }
  ],
  "pagination": { ... }
}
```

---

### 38. Get Reminder By ID

**Endpoint:** `GET /api/reminders/:id`  
**Auth:** JWT (Owner only)

**Success Response (200):**

```json
{
  "message": "Reminder fetched successfully",
  "reminder": {
    "id": "rem123",
    "title": "Follow up interview",
    "description": "Call HR",
    "reminderDate": "2026-06-25T10:00:00.000Z",
    "isDone": false,
    "createdAt": "2026-06-17T00:00:00.000Z",
    "updatedAt": "2026-06-17T00:00:00.000Z",
    "application": { ... }
  }
}
```

**Error:** `404` - Reminder not found or not owned by user

---

### 39. Update Reminder

**Endpoint:** `PUT /api/reminders/:id`  
**Auth:** JWT (Owner only)

**Request Body:** All fields optional

```json
{
  "title": "string (optional)",
  "description": "string (optional)",
  "reminderDate": "datetime (optional)",
  "isDone": "boolean (optional)",
  "applicationId": "string (optional)"
}
```

**Success Response (200):** Returns updated reminder

---

### 40. Soft Delete Reminder

**Endpoint:** `DELETE /api/reminders/:id`  
**Auth:** JWT (Owner only)

**Success Response (200):**

```json
{
  "message": "Reminder deleted successfully"
}
```

---

### 41. List Deleted Reminders

**Endpoint:** `GET /api/reminders/deleted/list`  
**Auth:** JWT

**Query Parameters:** `page`, `limit`, `applicationId`

**Success Response (200):**

```json
{
  "message": "Deleted reminders fetched successfully",
  "reminders": [
    {
      "id": "rem123",
      "title": "Follow up interview",
      "deletedAt": "2026-06-17T10:30:00.000Z",
      ...
    }
  ],
  "pagination": { ... }
}
```

---

### 42. Restore Reminder

**Endpoint:** `POST /api/reminders/:id/restore`  
**Auth:** JWT (Owner only)

**Success Response (200):**

```json
{
  "message": "Reminder restored successfully",
  "reminder": { ... }
}
```

---

### 43. Permanently Delete Reminder

**Endpoint:** `DELETE /api/reminders/:id/permanent`  
**Auth:** JWT (Owner only)  
**⚠️ WARNING:** Cannot be undone!

**Success Response (200):**

```json
{
  "message": "Reminder permanently deleted"
}
```

---

## 📊 DASHBOARD ENDPOINT

---

### 44. Get Dashboard Statistics

**Endpoint:** `GET /api/dashboard/stats`  
**Auth:** JWT

**Description:** Get comprehensive dashboard statistics including application counts by status, source distribution, monthly trends, and recent applications.

**Success Response (200):**

```json
{
  "message": "Dashboard stats fetched successfully",
  "stats": {
    "totalApplications": 25,
    "statusCounts": {
      "APPLIED": 10,
      "SCREENING": 5,
      "INTERVIEW": 3,
      "TECHNICAL_TEST": 2,
      "HR_INTERVIEW": 1,
      "OFFERING": 1,
      "ACCEPTED": 2,
      "REJECTED": 1,
      "WITHDRAWN": 0
    },
    "sourceDistribution": {
      "LINKEDIN": 12,
      "GLINTS": 5,
      "JOBSTREET": 3,
      "INDEED": 2,
      "WEBSITE": 2,
      "OTHER": 1
    },
    "monthlyTrends": [
      {
        "month": "2026-06",
        "count": 10
      },
      {
        "month": "2026-05",
        "count": 8
      },
      {
        "month": "2026-04",
        "count": 7
      }
    ],
    "recentApplications": [
      {
        "id": "app123",
        "position": "Backend Developer",
        "company": {
          "name": "Tech Corp",
          "location": "Jakarta"
        },
        "status": "APPLIED",
        "appliedDate": "2026-06-17T00:00:00.000Z"
      }
    ]
  }
}
```

**Note:**

- Cached for 5 minutes (Redis)
- Cache invalidated on application create/update/delete

---

## 📋 RESPONSE CODES

### Success Codes

| Code | Meaning    | Usage                                        |
| ---- | ---------- | -------------------------------------------- |
| 200  | OK         | Successful GET, PUT, DELETE, POST operations |
| 201  | Created    | Resource created successfully (POST)         |
| 204  | No Content | Successful DELETE with no response body      |

### Error Codes

| Code | Meaning               | Common Causes                                          |
| ---- | --------------------- | ------------------------------------------------------ |
| 400  | Bad Request           | Validation error, invalid input, passwords don't match |
| 401  | Unauthorized          | Missing token, invalid token, token expired            |
| 403  | Forbidden             | Insufficient permissions, not admin, not owner         |
| 404  | Not Found             | Resource doesn't exist or is deleted                   |
| 409  | Conflict              | Email/username already exists, duplicate resource      |
| 429  | Too Many Requests     | Rate limit exceeded (AI extraction)                    |
| 500  | Internal Server Error | Database error, server error                           |

---

## 🔒 PERMISSION MATRIX

### User Management

| Endpoint              | Regular User   | Admin         |
| --------------------- | -------------- | ------------- |
| List all users        | ❌             | ✅            |
| Get user by ID        | ✅ (Self only) | ✅ (Any user) |
| Update user           | ✅ (Self only) | ✅ (Any user) |
| Upload/Delete avatar  | ✅ (Self only) | ✅ (Any user) |
| Soft delete user      | ❌             | ✅            |
| List deleted users    | ❌             | ✅            |
| Restore user          | ❌             | ✅            |
| Permanent delete user | ❌             | ✅            |

### Application Management

| Endpoint               | Regular User  | Admin    |
| ---------------------- | ------------- | -------- |
| Create application     | ✅            | ✅       |
| List applications      | ✅ (Own only) | ✅ (All) |
| Get/Update/Delete      | ✅ (Own only) | ✅ (All) |
| Recycle bin operations | ✅ (Own only) | ✅ (All) |

### Company & Reminder Management

| Endpoint                | Regular User  | Admin    |
| ----------------------- | ------------- | -------- |
| All company operations  | ✅            | ✅       |
| All reminder operations | ✅ (Own only) | ✅ (All) |

---

## 🗑️ SOFT DELETE & RECYCLE BIN

### How It Works

```
┌──────────────────────────────────────────────┐
│ 1. NORMAL DELETE (DELETE /:id)              │
│    ↓ Sets deletedAt = current timestamp     │
│    ↓ Item hidden from normal queries        │
└──────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────┐
│ 2. RECYCLE BIN (GET /deleted/list)          │
│    ↓ View all soft-deleted items            │
│    ↓ Supports pagination, search, filters   │
└──────────────────────────────────────────────┘
                    ↓
       ┌────────────┴────────────┐
       ↓                         ↓
┌─────────────┐       ┌─────────────────────┐
│ 3a. RESTORE │       │ 3b. PERMANENT DELETE│
│ POST /restore│       │ DELETE /permanent   │
│ deletedAt=null│       │ ⚠️ IRREVERSIBLE!    │
└─────────────┘       └─────────────────────┘
```

### Soft Delete Behavior

- **Normal queries** automatically filter `WHERE deletedAt IS NULL`
- **Deleted items** remain in database until permanently deleted
- **Relationships** preserved during soft delete
- **Can be restored** at any time

### Permanent Delete Cascades

**Users:**

- Deletes all applications (and their history)
- Deletes all reminders
- Deletes verification tokens
- Deletes avatar from ImageKit
- **Preserves companies** (shared resource)

**Applications:**

- Deletes application history
- Unlinks reminders (sets applicationId to null)

**Companies:**

- **Restriction:** Cannot delete if has existing applications
- Must delete/reassign applications first

**Reminders:**

- Simple delete, no cascades

---

## 🧪 TESTING GUIDE

### 1. Authentication Flow

```bash
# Register
POST /api/auth/register
Body: {
  "name": "Test User",
  "username": "testuser",
  "email": "test@example.com",
  "password": "Test123456",
  "confirmPassword": "Test123456"
}

# Verify email (check inbox for token)
POST /api/auth/verify-email
Body: { "token": "..." }

# Login (sets cookies)
POST /api/auth/login
Body: {
  "emailOrUsername": "testuser",
  "password": "Test123456"
}

# Get current user (requires cookie)
GET /api/auth/me
```

### 2. Application CRUD + Recycle Bin

```bash
# Create application
POST /api/applications
Body: {
  "companyName": "Test Corp",
  "position": "Developer",
  "jobType": "FULL_TIME",
  "source": "LINKEDIN",
  "status": "APPLIED"
}

# List applications
GET /api/applications?page=1&limit=10

# Update application
PUT /api/applications/:id
Body: { "status": "INTERVIEW" }

# Soft delete
DELETE /api/applications/:id

# View in recycle bin
GET /api/applications/deleted/list

# Restore
POST /api/applications/:id/restore

# Permanent delete (⚠️ cannot undo)
DELETE /api/applications/:id/permanent
```

### 3. Rate Limiting Test

```bash
# Try extracting same URL 11 times
for i in {1..11}; do
  curl -X POST http://localhost:3000/api/applications/extract-url \
    -H "Cookie: accessToken=..." \
    -H "Content-Type: application/json" \
    -d '{"url": "https://example.com/job"}'
done
# 11th request should return 429
```

---

## 🔗 RELATED DOCUMENTATION

- **[Swagger UI (Production)](https://api.track-hire.app/api-docs)** - Interactive API testing
- **[Swagger UI (Development)](http://localhost:3000/api-docs)** - Local testing
- **[Recycle Bin Complete Guide](./recycle-bin-complete.md)** - Detailed recycle bin documentation
- **[Swagger Documentation](./swagger-api-documentation.md)** - Swagger UI usage guide
- **[CORS Configuration](./cors-configuration.md)** - CORS setup and troubleshooting
- **[Email Configuration](./email-quick-reference.md)** - Email system reference
- **[Deployment Guide](./deployment-guide.md)** - Production deployment
- **[Quick Start](./quickstart.md)** - Get started in 5 minutes

---

## 💡 API USAGE TIPS

### 1. Always Handle Errors

```javascript
try {
  const response = await fetch("/api/applications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // Include cookies
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("API Error:", error.message);
    // Handle specific error codes
    if (response.status === 401) {
      // Redirect to login
    } else if (response.status === 429) {
      // Show rate limit message
    }
  }

  const result = await response.json();
  return result;
} catch (error) {
  console.error("Network Error:", error);
}
```

### 2. Use Pagination for Large Lists

```javascript
// Always specify page and limit
const params = new URLSearchParams({
  page: "1",
  limit: "20",
  search: searchQuery,
  status: "INTERVIEW",
});

fetch(`/api/applications?${params}`);
```

### 3. Cache Dashboard Stats on Frontend

```javascript
// Backend caches for 5 minutes, frontend should too
const cachedStats = localStorage.getItem("dashboard-stats");
const cacheTime = localStorage.getItem("dashboard-stats-time");

if (cachedStats && Date.now() - cacheTime < 5 * 60 * 1000) {
  return JSON.parse(cachedStats);
}

// Fetch fresh data
const stats = await fetchDashboardStats();
localStorage.setItem("dashboard-stats", JSON.stringify(stats));
localStorage.setItem("dashboard-stats-time", Date.now());
```

### 4. Implement Token Refresh Logic

```javascript
async function fetchWithAuth(url, options = {}) {
  let response = await fetch(url, {
    ...options,
    credentials: "include",
  });

  // If 401, try refreshing token
  if (response.status === 401) {
    const refreshed = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (refreshed.ok) {
      // Retry original request
      response = await fetch(url, {
        ...options,
        credentials: "include",
      });
    }
  }

  return response;
}
```

---

## 📊 SUMMARY

- **Total Endpoints:** 44
- **Authentication:** Cookie-based JWT (accessToken + refreshToken)
- **Soft Delete:** All entities support soft delete with recycle bin
- **Rate Limiting:** 10 AI extractions per hour per user
- **Caching:** Dashboard stats cached for 5 minutes
- **File Upload:** Max 2MB, images only (JPEG, PNG, WebP, GIF)
- **Pagination:** Default 10 items, max 100 per page

---

**For interactive testing, visit Swagger UI:**

- **Production:** https://api.track-hire.app/api-docs
- **Development:** http://localhost:3000/api-docs

**Need help?** Check the [docs folder](./README.md) for more guides.
