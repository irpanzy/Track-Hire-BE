# Track Hire API Contract - Authentication

This document details the API contracts for the authentication services in the Track Hire backend application.

# Base URL

`http://localhost:3000/api`

---

# Endpoint Summary

## Authentication

| Method | Endpoint                                       | Auth | Description                                       |
| ------ | ---------------------------------------------- | ---- | ------------------------------------------------- |
| POST   | [/auth/register](#auth-register)               | None | Register a new user account                       |
| POST   | [/auth/verify-email](#auth-verify-email)       | None | Verify user email address                         |
| POST   | [/auth/login](#auth-login)                     | None | Authenticate user using email/username & password |
| POST   | [/auth/google](#auth-google-auth)              | None | Authenticate using Google Sign-In                 |
| POST   | [/auth/forgot-password](#auth-forgot-password) | None | Request password reset link                       |
| POST   | [/auth/reset-password](#auth-reset-password)   | None | Reset password                                    |
| POST   | [/auth/logout](#auth-logout)                   | None | Logout user                                       |
| POST   | [/auth/refresh](#auth-refresh-token)           | None | Refresh access token                              |
| GET    | [/auth/me](#auth-get-current-user)             | JWT  | Get current authenticated user                    |

---

## User Management

| Method | Endpoint                                         | Auth  | Description         |
| ------ | ------------------------------------------------ | ----- | ------------------- |
| GET    | [/users](#users-list-users-admin-only)           | Admin | List all users      |
| GET    | [/users/:id](#users-get-user-by-id)              | JWT   | Get user profile    |
| PUT    | [/users/:id](#users-update-user-profile)         | JWT   | Update user profile |
| PUT    | [/users/:id/avatar](#users-upload-user-avatar)   | JWT   | Upload avatar       |
| DELETE | [/users/:id/avatar](#users-delete-user-avatar)   | JWT   | Delete avatar       |
| DELETE | [/users/:id](#users-soft-delete-user-admin-only) | Admin | Soft delete user    |

---

## Recycle Bin (Admin Only)

| Method | Endpoint                                               | Auth  | Description             |
| ------ | ------------------------------------------------------ | ----- | ----------------------- |
| GET    | [/users/deleted/list](#recycle-list-deleted-users)     | Admin | List deleted users      |
| POST   | [/users/:id/restore](#recycle-restore-user)            | Admin | Restore deleted user    |
| DELETE | [/users/:id/permanent](#recycle-permanent-delete-user) | Admin | Permanently delete user |

---

## Application Management

| Method | Endpoint                                                 | Auth | Description                  |
| ------ | -------------------------------------------------------- | ---- | ---------------------------- |
| POST   | [/applications](#applications-create-application)        | JWT  | Create application           |
| POST   | [/applications/extract-url](#applications-extract-url)   | JWT  | Extract job details from URL |
| GET    | [/applications](#applications-list-applications)         | JWT  | List applications            |
| GET    | [/applications/:id](#applications-get-application-by-id) | JWT  | Get application detail       |
| PUT    | [/applications/:id](#applications-update-application)    | JWT  | Update application           |
| DELETE | [/applications/:id](#applications-delete-application)    | JWT  | Delete application           |

---

## Company Management

| Method | Endpoint                                    | Auth | Description         |
| ------ | ------------------------------------------- | ---- | ------------------- |
| POST   | [/companies](#companies-create-company)     | JWT  | Create company      |
| GET    | [/companies](#companies-list-companies)     | JWT  | List companies      |
| GET    | [/companies/:id](#companies-get-company)    | JWT  | Get company by ID   |
| PUT    | [/companies/:id](#companies-update-company) | JWT  | Update company      |
| DELETE | [/companies/:id](#companies-delete-company) | JWT  | Soft-delete company |

---

## Reminder Management

| Method | Endpoint                                     | Auth | Description          |
| ------ | -------------------------------------------- | ---- | -------------------- |
| POST   | [/reminders](#reminders-create-reminder)     | JWT  | Create reminder      |
| GET    | [/reminders](#reminders-list-reminders)      | JWT  | List reminders       |
| GET    | [/reminders/:id](#reminders-get-reminder)    | JWT  | Get reminder by ID   |
| PUT    | [/reminders/:id](#reminders-update-reminder) | JWT  | Update reminder      |
| DELETE | [/reminders/:id](#reminders-delete-reminder) | JWT  | Soft-delete reminder |

---

## Dashboard Module

| Method | Endpoint                                 | Auth | Description                         |
| ------ | ---------------------------------------- | ---- | ----------------------------------- |
| GET    | [/dashboard/stats](#dashboard-get-stats) | JWT  | Get dashboard statistics and trends |

---

## Detailed Endpoint Specifications

<a id="auth-register"></a>

### 1. Register User

- **Endpoint:** `POST /auth/register`
- **Auth Required:** None
- **Request Body Schema (`application/json`):**
  - `name` (string, required): Full name, min 2 characters, max 100 characters.
  - `username` (string, required): Unique username, min 3 characters, max 30 characters, alphanumeric and underscore (`_`) only.
  - `email` (string, required): Valid and unique email address format.
  - `password` (string, required): Password, min 8 characters, must contain at least one uppercase letter, one lowercase letter, and one number.
  - `confirmPassword` (string, required): Must match `password` exactly.

#### Request Example:

```json
{
  "name": "John Doe",
  "username": "johndoe_99",
  "email": "johndoe@example.com",
  "password": "Password123",
  "confirmPassword": "Password123"
}
```

#### Success Response (`201 Created`):

```json
{
  "message": "Registration successful. Please check your email to verify your account.",
  "user": {
    "id": "cuid-string-value",
    "name": "John Doe",
    "username": "johndoe_99",
    "email": "johndoe@example.com",
    "role": "USER"
  }
}
```

#### Error Responses:

- **`400 Bad Request`**: Validation error (Zod validation failed or mismatch passwords).
  ```json
  {
    "message": "Passwords do not match"
  }
  ```
- **`409 Conflict`**: Email or username already taken.
  ```json
  {
    "message": "Email already registered"
  }
  ```
  or
  ```json
  {
    "message": "Username already taken"
  }
  ```

---

<a id="auth-verify-email"></a>

### 2. Verify Email

- **Endpoint:** `POST /auth/verify-email`
- **Auth Required:** None
- **Request Body Schema (`application/json`):**
  - `token` (string, required): Verification token sent to the user's email.

#### Request Example:

```json
{
  "token": "456c1257-2e11-460d-85fa-7f8e79b90c1f"
}
```

#### Success Response (`200 OK`):

```json
{
  "message": "Email verified successfully"
}
```

#### Error Responses:

- **`400 Bad Request`**: Token is missing, invalid, or expired.
  ```json
  {
    "message": "Invalid or expired verification token"
  }
  ```

---

<a id="auth-login"></a>

### 3. Login

- **Endpoint:** `POST /auth/login`
- **Auth Required:** None
- **Request Body Schema (`application/json`):**
  - `emailOrUsername` (string, required): The registered email address or username.
  - `password` (string, required): The user's account password.

#### Request Example:

```json
{
  "emailOrUsername": "johndoe_99",
  "password": "Password123"
}
```

#### Success Response (`200 OK`):

- **Cookies Set:**
  - `accessToken`: JWT Access Token (HttpOnly, Secure in Production, Strict SameSite).
  - `refreshToken`: JWT Refresh Token (HttpOnly, Secure in Production, Strict SameSite).
- **Response Body:**

```json
{
  "message": "Login successful",
  "user": {
    "id": "cuid-string-value",
    "name": "John Doe",
    "username": "johndoe_99",
    "email": "johndoe@example.com",
    "role": "USER"
  }
}
```

#### Error Responses:

- **`401 Unauthorized`**: Wrong credentials or wrong sign-in method.
  ```json
  {
    "message": "Invalid credentials"
  }
  ```
  or
  ```json
  {
    "message": "This account uses Google Sign-In. Please login with Google."
  }
  ```
- **`403 Forbidden`**: Email has not been verified yet.
  ```json
  {
    "message": "Please verify your email before logging in. Check your inbox for the verification link."
  }
  ```

---

<a id="auth-google-auth"></a>

### 4. Google Auth

- **Endpoint:** `POST /auth/google`
- **Auth Required:** None
- **Request Body Schema (`application/json`):**
  - `idToken` (string, required): Valid Google ID Token generated by the frontend.

#### Request Example:

```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
}
```

#### Success Response (`200 OK`):

- **Cookies Set:**
  - `accessToken`: JWT Access Token (HttpOnly, Secure in Production, Strict SameSite).
  - `refreshToken`: JWT Refresh Token (HttpOnly, Secure in Production, Strict SameSite).
- **Response Body:**

```json
{
  "message": "Google authentication successful",
  "user": {
    "id": "cuid-string-value",
    "name": "John Doe",
    "email": "johndoe@gmail.com",
    "role": "USER",
    "avatarUrl": "https://lh3.googleusercontent.com/a/ALm5wu0..."
  }
}
```

#### Error Responses:

- **`401 Unauthorized`**: Google identity token verification failed.
  ```json
  {
    "message": "Invalid Google token"
  }
  ```

---

<a id="auth-forgot-password"></a>

### 5. Forgot Password

- **Endpoint:** `POST /auth/forgot-password`
- **Auth Required:** None
- **⚠️ Restriction:** Only available for accounts registered **manually** (email + password). Accounts registered via **Google Sign-In** will silently receive no email.
- **Request Body Schema (`application/json`):**
  - `email` (string, required): The registered email address to request a reset link.

#### Request Example:

```json
{
  "email": "johndoe@example.com"
}
```

#### Success Response (`200 OK`):

_Note: Returns 200 OK regardless of email existence or account type to prevent user enumeration._

```json
{
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

---

<a id="auth-reset-password"></a>

### 6. Reset Password

- **Endpoint:** `POST /auth/reset-password`
- **Auth Required:** None
- **⚠️ Restriction:** Only available for accounts registered **manually** (email + password). Accounts registered via **Google Sign-In** cannot reset a password — they must sign in with Google.
- **Request Body Schema (`application/json`):**
  - `token` (string, required): The reset token received in the email.
  - `password` (string, required): New password, min 8 characters, must contain at least one uppercase letter, one lowercase letter, and one number.

#### Request Example:

```json
{
  "token": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "password": "NewSecurePassword123"
}
```

#### Success Response (`200 OK`):

```json
{
  "message": "Password reset successfully"
}
```

#### Error Responses:

- **`400 Bad Request`**: Token is missing, invalid, or expired.
  ```json
  {
    "message": "Invalid or expired reset token"
  }
  ```
- **`400 Bad Request`**: The account was registered via Google and does not support password reset.
  ```json
  {
    "message": "Password reset is not available for accounts registered via Google. Please sign in with Google."
  }
  ```

---

<a id="auth-logout"></a>

### 7. Logout

- **Endpoint:** `POST /auth/logout`
- **Auth Required:** None
- **Request Body:** None

#### Success Response (`200 OK`):

- **Cookies Cleared:**
  - `accessToken`
  - `refreshToken`
- **Response Body:**

```json
{
  "message": "Logout successful"
}
```

---

<a id="auth-refresh-token"></a>

### 8. Refresh Token

- **Endpoint:** `POST /auth/refresh`
- **Auth Required:** None (Reads from cookie)
- **Request Cookie Required:** `refreshToken`

#### Success Response (`200 OK`):

- **Cookies Set:**
  - `accessToken`: New JWT Access Token (HttpOnly, Secure in Production, Strict SameSite).
- **Response Body:**

```json
{
  "message": "Access token refreshed successfully"
}
```

#### Error Responses:

- **`401 Unauthorized`**: Cookie is missing, invalid, or expired.
  ```json
  {
    "message": "Invalid or expired refresh token"
  }
  ```

---

<a id="auth-get-current-user"></a>

### 9. Get Current User (Me)

- **Endpoint:** `GET /auth/me`
- **Auth Required:** JWT (`accessToken` from cookies or Authorization header depending on middleware implementation)
- **Request Cookie Required:** `accessToken`

#### Success Response (`200 OK`):

```json
{
  "message": "User fetched successfully",
  "user": {
    "id": "cuid-string-value",
    "name": "John Doe",
    "username": "johndoe_99",
    "email": "johndoe@example.com",
    "role": "USER",
    "avatarUrl": null,
    "isEmailVerified": true,
    "createdAt": "2026-06-12T05:35:00.000Z"
  }
}
```

#### Error Responses:

- **`401 Unauthorized`**: Cookie is missing, invalid, or user session is expired.
  ```json
  {
    "message": "Unauthorized"
  }
  ```
- **`404 Not Found`**: User record no longer exists in database.
  ```json
  {
    "message": "User not found"
  }
  ```

---

## User Management Endpoint Specifications

<a id="users-list-users-admin-only"></a>

### 10. List Users (Admin only)

- **Endpoint:** `GET /users`
- **Auth Required:** JWT (ADMIN role required)
- **Request Query Parameters:**
  - `page` (integer, optional): Page number, min 1. Default: `1`.
  - `limit` (integer, optional): Number of users per page, min 1, max 100. Default: `10`.
  - `search` (string, optional): Search keyword matching user `name`, `username`, or `email` (case-insensitive).
  - `role` (string, optional): Filter by user role, either `USER` or `ADMIN`.
  - `sortBy` (string, optional): Field to sort by: `name`, `username`, `email`, `createdAt`. Default: `createdAt`.
  - `order` (string, optional): Sort order: `asc` or `desc`. Default: `desc`.

#### Request Example:

`/api/users?page=1&limit=2&role=USER`

#### Success Response (`200 OK`):

```json
{
  "message": "Users fetched successfully",
  "users": [
    {
      "id": "cuid-string-1",
      "name": "Jane Doe",
      "username": "janedoe",
      "email": "jane@example.com",
      "role": "USER",
      "avatarUrl": "https://ik.imagekit.io/your_id/avatars/avatar.webp",
      "isEmailVerified": true,
      "createdAt": "2026-06-12T05:35:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 2,
    "total": 1,
    "totalPages": 1
  }
}
```

#### Error Responses:

- **`401 Unauthorized`**: Missing or invalid session tokens.
- **`403 Forbidden`**: User is not an admin.

---

<a id="users-get-user-by-id"></a>

### 11. Get User By ID

- **Endpoint:** `GET /users/:id`
- **Auth Required:** JWT (Self or ADMIN role required)
- **Path Parameters:**
  - `id` (string, required): The target user CUID.

#### Success Response (`200 OK`):

```json
{
  "message": "User fetched successfully",
  "user": {
    "id": "cuid-string-value",
    "name": "John Doe",
    "username": "johndoe_99",
    "email": "johndoe@example.com",
    "role": "USER",
    "avatarUrl": null,
    "isEmailVerified": true,
    "createdAt": "2026-06-12T05:35:00.000Z"
  }
}
```

#### Error Responses:

- **`401 Unauthorized`**: Missing or invalid session tokens.
- **`403 Forbidden`**: Requesting ID is not self and not an admin.
- **`404 Not Found`**: User not found or has been soft-deleted.

---

<a id="users-update-user-profile"></a>

### 12. Update User Profile

- **Endpoint:** `PUT /users/:id`
- **Auth Required:** JWT (Self or ADMIN role required)
- **Path Parameters:**
  - `id` (string, required): The target user CUID.
- **Request Body Schema (`application/json`):**
  - `name` (string, optional): Full name, min 2 characters, max 100 characters.
  - `username` (string, optional): Unique username, min 3 characters, max 30 characters, alphanumeric and underscore (`_`) only.

#### Request Example:

```json
{
  "name": "John Updated",
  "username": "john_updated"
}
```

#### Success Response (`200 OK`):

```json
{
  "message": "User updated successfully",
  "user": {
    "id": "cuid-string-value",
    "name": "John Updated",
    "username": "john_updated",
    "email": "johndoe@example.com",
    "role": "USER",
    "avatarUrl": null,
    "isEmailVerified": true,
    "createdAt": "2026-06-12T05:35:00.000Z"
  }
}
```

#### Error Responses:

- **`400 Bad Request`**: Validation failed.
- **`401 Unauthorized`**: Missing or invalid session tokens.
- **`403 Forbidden`**: User is not self and not an admin.
- **`409 Conflict`**: Username is already taken by another user.

---

<a id="users-upload-user-avatar"></a>

### 13. Upload User Avatar

- **Endpoint:** `PUT /users/:id/avatar`
- **Auth Required:** JWT (Self or ADMIN role required)
- **Path Parameters:**
  - `id` (string, required): The target user CUID.
- **Request Body Schema (`multipart/form-data`):**
  - `avatar` (file, required): Image file (JPEG, PNG, WebP, GIF), max size configured (defaults to 2MB).

#### Success Response (`200 OK`):

```json
{
  "message": "Avatar updated successfully",
  "user": {
    "id": "cuid-string-value",
    "name": "John Updated",
    "username": "john_updated",
    "email": "johndoe@example.com",
    "role": "USER",
    "avatarUrl": "https://ik.imagekit.io/your_id/avatars/avatar_cuid.webp",
    "isEmailVerified": true,
    "createdAt": "2026-06-12T05:35:00.000Z"
  }
}
```

#### Error Responses:

- **`400 Bad Request`**: File missing, size exceeds configured limit, or file type not allowed.
- **`401 Unauthorized`**: Missing or invalid session tokens.
- **`403 Forbidden`**: User is not self and not an admin.

---

<a id="users-delete-user-avatar"></a>

### 14. Delete User Avatar

- **Endpoint:** `DELETE /users/:id/avatar`
- **Auth Required:** JWT (Self or ADMIN role required)
- **Path Parameters:**
  - `id` (string, required): The target user CUID.

#### Success Response (`200 OK`):

```json
{
  "message": "Avatar deleted successfully",
  "user": {
    "id": "cuid-string-value",
    "name": "John Updated",
    "username": "john_updated",
    "email": "johndoe@example.com",
    "role": "USER",
    "avatarUrl": null,
    "isEmailVerified": true,
    "createdAt": "2026-06-12T05:35:00.000Z"
  }
}
```

#### Error Responses:

- **`401 Unauthorized`**: Missing or invalid session tokens.
- **`403 Forbidden`**: User is not self and not an admin.

---

<a id="users-soft-delete-user-admin-only"></a>

### 15. Soft Delete User (Admin only)

- **Endpoint:** `DELETE /users/:id`
- **Auth Required:** JWT (ADMIN role required)
- **Path Parameters:**
  - `id` (string, required): The target user CUID.

#### Success Response (`200 OK`):

```json
{
  "message": "User deleted successfully"
}
```

#### Error Responses:

- **`401 Unauthorized`**: Missing or invalid session tokens.
- **`403 Forbidden`**: User is not an admin.
- **`404 Not Found`**: User not found.

---

## Application Management Endpoint Specifications

<a id="applications-create-application"></a>

### 16. Create Application

- **Endpoint:** `POST /applications`
- **Auth Required:** JWT
- **Request Body Schema (`application/json`):**
  - `companyName` (string, required): Company name, min 1 character, max 200 characters. Auto find-or-create.
  - `companyWebsite` (string, optional): Valid URL format.
  - `companyLocation` (string, optional): Max 200 characters.
  - `position` (string, required): Job position, min 2 characters, max 200 characters.
  - `jobType` (string, required): One of `FULL_TIME`, `PART_TIME`, `CONTRACT`, `INTERNSHIP`, `FREELANCE`, `REMOTE`.
  - `location` (string, optional): Job location, max 200 characters.
  - `source` (string, required): One of `LINKEDIN`, `GLINTS`, `JOBSTREET`, `UPWORK`, `INDEED`, `WEBSITE`, `INSTAGRAM`, `X`, `OTHER`.
  - `sourceUrl` (string, optional): Valid URL format.
  - `description` (string, optional): Job description.
  - `requirements` (string, optional): Job requirements.
  - `salaryRange` (string, optional): Max 100 characters.
  - `status` (string, optional): Application status. Default: `APPLIED`.
  - `appliedDate` (datetime, optional): Date applied. Default: now.
  - `deadlineDate` (datetime, optional): Application deadline.
  - `notes` (string, optional): Personal notes.

#### Request Example:

```json
{
  "companyName": "PT Teknologi Indonesia",
  "companyWebsite": "https://teknologi.co.id",
  "companyLocation": "Jakarta, Indonesia",
  "position": "Backend Developer",
  "jobType": "FULL_TIME",
  "location": "Jakarta",
  "source": "LINKEDIN",
  "sourceUrl": "https://linkedin.com/jobs/12345",
  "description": "Building REST APIs with Node.js",
  "requirements": "3+ years experience with Node.js",
  "salaryRange": "15.000.000 - 25.000.000",
  "notes": "Applied via referral from John"
}
```

#### Success Response (`201 Created`):

```json
{
  "message": "Application created successfully",
  "application": {
    "id": "cuid-string-value",
    "position": "Backend Developer",
    "jobType": "FULL_TIME",
    "location": "Jakarta",
    "source": "LINKEDIN",
    "sourceUrl": "https://linkedin.com/jobs/12345",
    "description": "Building REST APIs with Node.js",
    "requirements": "3+ years experience with Node.js",
    "salaryRange": "15.000.000 - 25.000.000",
    "status": "APPLIED",
    "appliedDate": "2026-06-12T05:35:00.000Z",
    "deadlineDate": null,
    "notes": "Applied via referral from John",
    "createdAt": "2026-06-12T05:35:00.000Z",
    "company": {
      "id": "cuid-company-value",
      "name": "PT Teknologi Indonesia",
      "website": "https://teknologi.co.id",
      "location": "Jakarta, Indonesia"
    }
  }
}
```

#### Error Responses:

- **`400 Bad Request`**: Validation error (Zod validation failed).
- **`401 Unauthorized`**: Missing or invalid session tokens.

---

<a id="applications-extract-url"></a>

### 17. Extract Job Details From URL

- **Endpoint:** `POST /applications/extract-url`
- **Auth Required:** JWT
- **Request Body Schema (`application/json`):**
  - `url` (string, required): The job posting page URL to extract details from. Must be a valid URL format.

#### Request Example:

```json
{
  "url": "https://www.linkedin.com/jobs/view/1234567890/"
}
```

#### Success Response (`200 OK`):

```json
{
  "message": "Job details extracted successfully",
  "data": {
    "companyName": "Google",
    "companyWebsite": "https://about.google",
    "companyLocation": "Mountain View, CA",
    "position": "Software Engineer",
    "jobType": "FULL_TIME",
    "location": "Jakarta, Indonesia",
    "source": "LINKEDIN",
    "sourceUrl": "https://www.linkedin.com/jobs/view/1234567890/",
    "description": "We are looking for a Software Engineer...",
    "requirements": "Strong programming skills in Node.js or TypeScript...",
    "salaryRange": "15.000.000 - 25.000.000",
    "deadlineDate": "2026-07-31"
  }
}
```

#### Error Responses:

- **`400 Bad Request`**: Validation error (invalid URL, missing fields) or extraction failed (scraper blocked, Gemini API key missing/invalid, or parsing error).
- **`401 Unauthorized`**: Missing or invalid session tokens.

---

<a id="applications-list-applications"></a>

### 18. List Applications

- **Endpoint:** `GET /applications`
- **Auth Required:** JWT
- **Request Query Parameters:**
  - `page` (integer, optional): Page number, min 1. Default: `1`.
  - `limit` (integer, optional): Items per page, min 1, max 100. Default: `10`.
  - `search` (string, optional): Search by position or company name (case-insensitive).
  - `status` (string, optional): Filter by application status.
  - `source` (string, optional): Filter by application source.
  - `jobType` (string, optional): Filter by job type.
  - `sortBy` (string, optional): Sort field: `appliedDate`, `createdAt`, `position`, `status`. Default: `appliedDate`.
  - `order` (string, optional): Sort order: `asc` or `desc`. Default: `desc`.

_Note: Regular users only see their own applications. Admins can see all applications._

#### Request Example:

`/api/applications?page=1&limit=10&status=INTERVIEW&sortBy=appliedDate&order=desc`

#### Success Response (`200 OK`):

```json
{
  "message": "Applications fetched successfully",
  "applications": [
    {
      "id": "cuid-string-value",
      "position": "Backend Developer",
      "jobType": "FULL_TIME",
      "location": "Jakarta",
      "source": "LINKEDIN",
      "sourceUrl": "https://linkedin.com/jobs/12345",
      "description": "Building REST APIs with Node.js",
      "requirements": "3+ years experience with Node.js",
      "salaryRange": "15.000.000 - 25.000.000",
      "status": "INTERVIEW",
      "appliedDate": "2026-06-12T05:35:00.000Z",
      "deadlineDate": null,
      "notes": null,
      "createdAt": "2026-06-12T05:35:00.000Z",
      "company": {
        "id": "cuid-company-value",
        "name": "PT Teknologi Indonesia",
        "website": "https://teknologi.co.id",
        "location": "Jakarta, Indonesia"
      }
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

#### Error Responses:

- **`400 Bad Request`**: Invalid query parameters.
- **`401 Unauthorized`**: Missing or invalid session tokens.

---

<a id="applications-get-application-by-id"></a>

### 19. Get Application By ID

- **Endpoint:** `GET /applications/:id`
- **Auth Required:** JWT (Owner or ADMIN)
- **Path Parameters:**
  - `id` (string, required): The application CUID.

#### Success Response (`200 OK`):

```json
{
  "message": "Application fetched successfully",
  "application": {
    "id": "cuid-string-value",
    "position": "Backend Developer",
    "jobType": "FULL_TIME",
    "location": "Jakarta",
    "source": "LINKEDIN",
    "sourceUrl": "https://linkedin.com/jobs/12345",
    "description": "Building REST APIs with Node.js",
    "requirements": "3+ years experience with Node.js",
    "salaryRange": "15.000.000 - 25.000.000",
    "status": "INTERVIEW",
    "appliedDate": "2026-06-12T05:35:00.000Z",
    "deadlineDate": null,
    "notes": "Applied via referral from John",
    "createdAt": "2026-06-12T05:35:00.000Z",
    "company": {
      "id": "cuid-company-value",
      "name": "PT Teknologi Indonesia",
      "website": "https://teknologi.co.id",
      "location": "Jakarta, Indonesia"
    },
    "histories": [
      {
        "id": "cuid-history-2",
        "oldStatus": "APPLIED",
        "newStatus": "INTERVIEW",
        "notes": null,
        "createdAt": "2026-06-13T10:00:00.000Z"
      },
      {
        "id": "cuid-history-1",
        "oldStatus": null,
        "newStatus": "APPLIED",
        "notes": "Application created",
        "createdAt": "2026-06-12T05:35:00.000Z"
      }
    ]
  }
}
```

#### Error Responses:

- **`400 Bad Request`**: Invalid application ID.
- **`401 Unauthorized`**: Missing or invalid session tokens.
- **`403 Forbidden`**: User is not the owner and not an admin.
- **`404 Not Found`**: Application not found or soft-deleted.

---

<a id="applications-update-application"></a>

### 20. Update Application

- **Endpoint:** `PUT /applications/:id`
- **Auth Required:** JWT (Owner or ADMIN)
- **Path Parameters:**
  - `id` (string, required): The application CUID.
- **Request Body Schema (`application/json`):** All fields from Create Application are optional.

_Note: If `status` changes, a new record is automatically logged to `ApplicationHistory`._

#### Request Example:

```json
{
  "status": "INTERVIEW",
  "notes": "Interview scheduled for next Monday"
}
```

#### Success Response (`200 OK`):

```json
{
  "message": "Application updated successfully",
  "application": {
    "id": "cuid-string-value",
    "position": "Backend Developer",
    "jobType": "FULL_TIME",
    "location": "Jakarta",
    "source": "LINKEDIN",
    "sourceUrl": "https://linkedin.com/jobs/12345",
    "description": "Building REST APIs with Node.js",
    "requirements": "3+ years experience with Node.js",
    "salaryRange": "15.000.000 - 25.000.000",
    "status": "INTERVIEW",
    "appliedDate": "2026-06-12T05:35:00.000Z",
    "deadlineDate": null,
    "notes": "Interview scheduled for next Monday",
    "createdAt": "2026-06-12T05:35:00.000Z",
    "company": {
      "id": "cuid-company-value",
      "name": "PT Teknologi Indonesia",
      "website": "https://teknologi.co.id",
      "location": "Jakarta, Indonesia"
    }
  }
}
```

#### Error Responses:

- **`400 Bad Request`**: Validation error or no fields provided.
- **`401 Unauthorized`**: Missing or invalid session tokens.
- **`403 Forbidden`**: User is not the owner and not an admin.
- **`404 Not Found`**: Application not found or soft-deleted.

---

<a id="applications-delete-application"></a>

### 21. Delete Application

- **Endpoint:** `DELETE /applications/:id`
- **Auth Required:** JWT (Owner or ADMIN)
- **Path Parameters:**
  - `id` (string, required): The application CUID.

#### Success Response (`200 OK`):

```json
{
  "message": "Application deleted successfully"
}
```

#### Error Responses:

- **`401 Unauthorized`**: Missing or invalid session tokens.
- **`403 Forbidden`**: User is not the owner and not an admin.
- **`404 Not Found`**: Application not found.

---

## Company Management Endpoint Specifications

<a id="companies-create-company"></a>

### 22. Create Company

- **Endpoint:** `POST /companies`
- **Auth Required:** JWT
- **Request Body Schema (`application/json`):**
  - `name` (string, required): Company name, min 1 character, max 200 characters. Unique (case-insensitive).
  - `website` (string, optional): Valid URL format.
  - `location` (string, optional): Company headquarters or location, max 200 characters.

#### Request Example:

```json
{
  "name": "Google",
  "website": "https://google.com",
  "location": "Mountain View, CA"
}
```

#### Success Response (`201 Created`):

```json
{
  "message": "Company created successfully",
  "company": {
    "id": "cuid-company-value",
    "name": "Google",
    "website": "https://google.com",
    "location": "Mountain View, CA",
    "createdAt": "2026-06-13T10:00:00.000Z",
    "updatedAt": "2026-06-13T10:00:00.000Z"
  }
}
```

#### Error Responses:

- **`400 Bad Request`**: Validation error (Zod validation failed).
- **`401 Unauthorized`**: Missing or invalid session tokens.
- **`409 Conflict`**: Company name already exists.

---

<a id="companies-list-companies"></a>

### 23. List Companies

- **Endpoint:** `GET /companies`
- **Auth Required:** JWT
- **Request Query Parameters:**
  - `page` (integer, optional): Page number, min 1. Default: `1`.
  - `limit` (integer, optional): Items per page, min 1, max 100. Default: `10`.
  - `search` (string, optional): Search by company name (case-insensitive).
  - `userOnly` (boolean, optional): If `true`, only returns companies where the current user has active job applications. Default: `false`.
  - `sortBy` (string, optional): Sort field: `name`, `createdAt`. Default: `name`.
  - `order` (string, optional): Sort order: `asc` or `desc`. Default: `asc`.

#### Request Example:

`/api/companies?page=1&limit=10&search=Google&userOnly=true`

#### Success Response (`200 OK`):

```json
{
  "message": "Companies fetched successfully",
  "companies": [
    {
      "id": "cuid-company-value",
      "name": "Google",
      "website": "https://google.com",
      "location": "Mountain View, CA",
      "createdAt": "2026-06-13T10:00:00.000Z",
      "updatedAt": "2026-06-13T10:00:00.000Z"
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

#### Error Responses:

- **`400 Bad Request`**: Invalid query parameters.
- **`401 Unauthorized`**: Missing or invalid session tokens.

---

<a id="companies-get-company"></a>

### 24. Get Company By ID

- **Endpoint:** `GET /companies/:id`
- **Auth Required:** JWT
- **Path Parameters:**
  - `id` (string, required): The company CUID.

#### Success Response (`200 OK`):

_Note: Returns the company details along with the user's active (non-deleted) applications at this company._

```json
{
  "message": "Company fetched successfully",
  "company": {
    "id": "cuid-company-value",
    "name": "Google",
    "website": "https://google.com",
    "location": "Mountain View, CA",
    "createdAt": "2026-06-13T10:00:00.000Z",
    "updatedAt": "2026-06-13T10:00:00.000Z",
    "applications": [
      {
        "id": "cuid-application-value",
        "position": "Software Engineer",
        "jobType": "FULL_TIME",
        "status": "INTERVIEW",
        "appliedDate": "2026-06-12T05:35:00.000Z",
        "createdAt": "2026-06-12T05:35:00.000Z"
      }
    ]
  }
}
```

#### Error Responses:

- **`400 Bad Request`**: Invalid company ID.
- **`401 Unauthorized`**: Missing or invalid session tokens.
- **`404 Not Found`**: Company not found or soft-deleted.

---

<a id="companies-update-company"></a>

### 25. Update Company

- **Endpoint:** `PUT /companies/:id`
- **Auth Required:** JWT
- **Path Parameters:**
  - `id` (string, required): The company CUID.
- **Request Body Schema (`application/json`):** All fields from Create Company are optional.

#### Request Example:

```json
{
  "name": "Google Inc.",
  "location": "Mountain View, California"
}
```

#### Success Response (`200 OK`):

```json
{
  "message": "Company updated successfully",
  "company": {
    "id": "cuid-company-value",
    "name": "Google Inc.",
    "website": "https://google.com",
    "location": "Mountain View, California",
    "createdAt": "2026-06-13T10:00:00.000Z",
    "updatedAt": "2026-06-13T10:35:00.000Z"
  }
}
```

#### Error Responses:

- **`400 Bad Request`**: Validation error or invalid ID.
- **`401 Unauthorized`**: Missing or invalid session tokens.
- **`404 Not Found`**: Company not found or soft-deleted.
- **`409 Conflict`**: Company name already taken.

---

<a id="companies-delete-company"></a>

### 26. Delete Company

- **Endpoint:** `DELETE /companies/:id`
- **Auth Required:** JWT
- **Path Parameters:**
  - `id` (string, required): The company CUID.

#### Success Response (`200 OK`):

```json
{
  "message": "Company deleted successfully"
}
```

#### Error Responses:

- **`401 Unauthorized`**: Missing or invalid session tokens.
- **`404 Not Found`**: Company not found.

---

## Reminder Management Endpoint Specifications

<a id="reminders-create-reminder"></a>

### 27. Create Reminder

- **Endpoint:** `POST /reminders`
- **Auth Required:** JWT
- **Request Body Schema (`application/json`):**
  - `title` (string, required): Title of the reminder, min 1 character, max 100 characters.
  - `description` (string, optional): Detailed description, max 1000 characters.
  - `reminderDate` (string/datetime, required): Date and time for the reminder (ISO format).
  - `applicationId` (string, optional): The CUID of the associated job application. Must belong to the user.

#### Request Example:

```json
{
  "title": "HR Interview Follow-up",
  "description": "Send a thank-you email and ask for updates",
  "reminderDate": "2026-06-15T09:00:00.000Z",
  "applicationId": "clxyz_app_1"
}
```

#### Success Response (`201 Created`):

```json
{
  "message": "Reminder created successfully",
  "reminder": {
    "id": "cuid-reminder-value",
    "userId": "cuid-user-value",
    "applicationId": "clxyz_app_1",
    "title": "HR Interview Follow-up",
    "description": "Send a thank-you email and ask for updates",
    "reminderDate": "2026-06-15T09:00:00.000Z",
    "isDone": false,
    "createdAt": "2026-06-13T10:00:00.000Z",
    "updatedAt": "2026-06-13T10:00:00.000Z",
    "application": {
      "id": "clxyz_app_1",
      "position": "Backend Developer",
      "company": {
        "name": "PT Teknologi Indonesia"
      }
    }
  }
}
```

#### Error Responses:

- **`400 Bad Request`**: Validation error (Zod validation failed).
- **`401 Unauthorized`**: Missing or invalid session tokens.
- **`404 Not Found`**: Job application not found (or does not belong to the user).

---

<a id="reminders-list-reminders"></a>

### 28. List Reminders

- **Endpoint:** `GET /reminders`
- **Auth Required:** JWT
- **Request Query Parameters:**
  - `page` (integer, optional): Page number, min 1. Default: `1`.
  - `limit` (integer, optional): Items per page, min 1, max 100. Default: `10`.
  - `isDone` (boolean, optional): Filter by completion status.
  - `applicationId` (string, optional): Filter by linked job application ID.
  - `upcoming` (boolean, optional): If `true`, only returns future pending reminders (`reminderDate` >= now, `isDone` = false). Default: `false`.
  - `sortBy` (string, optional): Sort field: `reminderDate`, `createdAt`. Default: `reminderDate`.
  - `order` (string, optional): Sort order: `asc` or `desc`. Default: `asc`.

#### Request Example:

`/api/reminders?page=1&limit=10&upcoming=true`

#### Success Response (`200 OK`):

```json
{
  "message": "Reminders fetched successfully",
  "reminders": [
    {
      "id": "cuid-reminder-value",
      "userId": "cuid-user-value",
      "applicationId": "clxyz_app_1",
      "title": "HR Interview Follow-up",
      "description": "Send a thank-you email and ask for updates",
      "reminderDate": "2026-06-15T09:00:00.000Z",
      "isDone": false,
      "createdAt": "2026-06-13T10:00:00.000Z",
      "updatedAt": "2026-06-13T10:00:00.000Z",
      "application": {
        "id": "clxyz_app_1",
        "position": "Backend Developer",
        "company": {
          "name": "PT Teknologi Indonesia"
        }
      }
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

#### Error Responses:

- **`400 Bad Request`**: Invalid query parameters.
- **`401 Unauthorized`**: Missing or invalid session tokens.

---

<a id="reminders-get-reminder"></a>

### 29. Get Reminder By ID

- **Endpoint:** `GET /reminders/:id`
- **Auth Required:** JWT (Owner only)
- **Path Parameters:**
  - `id` (string, required): The reminder CUID.

#### Success Response (`200 OK`):

```json
{
  "message": "Reminder fetched successfully",
  "reminder": {
    "id": "cuid-reminder-value",
    "userId": "cuid-user-value",
    "applicationId": "clxyz_app_1",
    "title": "HR Interview Follow-up",
    "description": "Send a thank-you email and check status.",
    "reminderDate": "2026-06-15T09:00:00.000Z",
    "isDone": false,
    "createdAt": "2026-06-13T10:00:00.000Z",
    "updatedAt": "2026-06-13T10:00:00.000Z",
    "application": {
      "id": "clxyz_app_1",
      "position": "Backend Developer",
      "company": {
        "name": "PT Teknologi Indonesia"
      }
    }
  }
}
```

#### Error Responses:

- **`400 Bad Request`**: Invalid reminder ID.
- **`401 Unauthorized`**: Missing or invalid session tokens.
- **`404 Not Found`**: Reminder not found or not owned by user.

---

<a id="reminders-update-reminder"></a>

### 30. Update Reminder

- **Endpoint:** `PUT /reminders/:id`
- **Auth Required:** JWT (Owner only)
- **Path Parameters:**
  - `id` (string, required): The reminder CUID.
- **Request Body Schema (`application/json`):** All fields from Create Reminder are optional. Can also update:
  - `isDone` (boolean, optional): Toggle status.

#### Request Example:

```json
{
  "isDone": true
}
```

#### Success Response (`200 OK`):

```json
{
  "message": "Reminder updated successfully",
  "reminder": {
    "id": "cuid-reminder-value",
    "userId": "cuid-user-value",
    "applicationId": "clxyz_app_1",
    "title": "HR Interview Follow-up",
    "description": "Send a thank-you email and check status.",
    "reminderDate": "2026-06-15T09:00:00.000Z",
    "isDone": true,
    "createdAt": "2026-06-13T10:00:00.000Z",
    "updatedAt": "2026-06-13T10:15:00.000Z",
    "application": {
      "id": "clxyz_app_1",
      "position": "Backend Developer",
      "company": {
        "name": "PT Teknologi Indonesia"
      }
    }
  }
}
```

#### Error Responses:

- **`400 Bad Request`**: Validation error or invalid ID.
- **`401 Unauthorized`**: Missing or invalid session tokens.
- **`404 Not Found`**: Reminder or Job application not found.

---

<a id="reminders-delete-reminder"></a>

### 31. Delete Reminder

- **Endpoint:** `DELETE /reminders/:id`
- **Auth Required:** JWT (Owner only)
- **Path Parameters:**
  - `id` (string, required): The reminder CUID.

#### Success Response (`200 OK`):

```json
{
  "message": "Reminder deleted successfully"
}
```

#### Error Responses:

- **`401 Unauthorized`**: Missing or invalid session tokens.
- **`404 Not Found`**: Reminder not found.

---

<a id="dashboard-get-stats"></a>

### 32. Get Dashboard Stats

- **Endpoint:** `GET /dashboard/stats`
- **Auth Required:** JWT
- **Query Parameters:** None

#### Success Response (`200 OK`):

```json
{
  "message": "Dashboard stats fetched successfully",
  "data": {
    "totalApplications": 12,
    "statusDistribution": {
      "APPLIED": 5,
      "INTERVIEW": 3,
      "REJECTED": 4
    },
    "sourceDistribution": {
      "LINKEDIN": 8,
      "GLINTS": 4
    },
    "recentApplications": [
      {
        "id": "clxyz_app_1",
        "position": "Backend Developer",
        "status": "APPLIED",
        "appliedDate": "2026-06-13T10:00:00.000Z",
        "company": {
          "name": "Google"
        }
      }
    ],
    "monthlyTrend": [
      {
        "month": "Jun 2026",
        "count": 4
      }
    ]
  }
}
```

#### Error Responses:

- **`401 Unauthorized`**: Missing or invalid session tokens.
- **`500 Internal Server Error`**: Unexpected error.

---

## Recycle Bin Endpoints (Admin Only)

<a id="recycle-list-deleted-users"></a>

### 1. List Deleted Users

- **Endpoint:** `GET /users/deleted/list`
- **Auth Required:** Admin
- **Query Parameters:**
  - `page` (integer, optional): Page number, default: 1, min: 1
  - `limit` (integer, optional): Items per page, default: 10, min: 1, max: 100
  - `search` (string, optional): Search by name, username, or email
  - `role` (enum, optional): Filter by role (`USER` or `ADMIN`)
  - `sortBy` (enum, optional): Sort field (`name`, `username`, `email`, `createdAt`), default: `createdAt`
  - `order` (enum, optional): Sort order (`asc` or `desc`), default: `desc`

**Request Example:**

```http
GET /api/users/deleted/list?page=1&limit=10&search=john
Authorization: Bearer <accessToken>
```

**Success Response (200 OK):**

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
      "avatarUrl": "https://...",
      "isEmailVerified": true,
      "createdAt": "2026-06-01T10:00:00.000Z",
      "deletedAt": "2026-06-14T15:30:00.000Z"
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

**Error Responses:**

- **400 Bad Request:** Invalid query parameters
- **401 Unauthorized:** Not logged in
- **403 Forbidden:** Not admin

---

<a id="recycle-restore-user"></a>

### 2. Restore Deleted User

- **Endpoint:** `POST /users/:id/restore`
- **Auth Required:** Admin
- **Path Parameters:**
  - `id` (string, required): User ID to restore

**Request Example:**

```http
POST /api/users/clxyz123/restore
Authorization: Bearer <accessToken>
```

**Success Response (200 OK):**

```json
{
  "message": "User restored successfully",
  "user": {
    "id": "clxyz123",
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "USER",
    "avatarUrl": "https://...",
    "isEmailVerified": true,
    "createdAt": "2026-06-01T10:00:00.000Z"
  }
}
```

**Error Responses:**

- **400 Bad Request:** Invalid user ID
- **401 Unauthorized:** Not logged in
- **403 Forbidden:** Not admin
- **404 Not Found:** Deleted user not found
- **500 Internal Server Error:** Server error

---

<a id="recycle-permanent-delete-user"></a>

### 3. Permanently Delete User

- **Endpoint:** `DELETE /users/:id/permanent`
- **Auth Required:** Admin
- **Path Parameters:**
  - `id` (string, required): User ID to permanently delete

**⚠️ Warning:** This action cannot be undone! It will permanently delete:

- User account
- All applications
- All reminders
- Application history
- Verification tokens
- Avatar from ImageKit

**Note:** Companies are NOT deleted as they may be used by other users.

**Request Example:**

```http
DELETE /api/users/clxyz123/permanent
Authorization: Bearer <accessToken>
```

**Success Response (200 OK):**

```json
{
  "message": "User permanently deleted"
}
```

**Error Responses:**

- **400 Bad Request:** Invalid user ID
- **401 Unauthorized:** Not logged in
- **403 Forbidden:** Not admin
- **404 Not Found:** Deleted user not found
- **500 Internal Server Error:** Failed to delete (transaction error)

---

## Recycle Bin Workflow

```
Active User
    │
    │ DELETE /users/:id (soft delete)
    ↓
Deleted User (In Recycle Bin)
    │
    ├─→ POST /users/:id/restore → Back to Active User
    │
    └─→ DELETE /users/:id/permanent → Permanently Deleted (Cannot restore)
```

**Best Practices:**

1. **Soft delete first** - Always soft delete users initially
2. **Keep for 30 days** - Allow restoration within 30-day period
3. **Confirm before permanent delete** - Show warning dialog
4. **Audit trail** - Log all recycle bin operations
5. **Notify users** - Send email when account is deleted/restored

---
