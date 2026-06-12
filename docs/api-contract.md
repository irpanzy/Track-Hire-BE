# Track Hire API Contract - Authentication

This document details the API contracts for the authentication services in the Track Hire backend application.

## Base URL

`http://localhost:3000/api`

---

## Endpoint Summary

| Method   | Endpoint                                          | Auth | Description                                       |
| :------- | :------------------------------------------------ | :--- | :------------------------------------------------ |
| **POST** | [`/auth/register`](#/auth/register)               | None | Register a new user account                       |
| **POST** | [`/auth/verify-email`](#/auth/verify-email)       | None | Verify user email address                         |
| **POST** | [`/auth/login`](#/auth/login)                     | None | Authenticate user using email/username & password |
| **POST** | [`/auth/google`](#/auth/google)                   | None | Authenticate or register using Google Sign-In     |
| **POST** | [`/auth/forgot-password`](#/auth/forgot-password) | None | Request password reset verification link          |
| **POST** | [`/auth/reset-password`](#/auth/reset-password)   | None | Reset password using token                        |
| **POST** | [`/auth/logout`](#/auth/logout)                   | None | Logout user and clear auth cookies                |
| **POST** | [`/auth/refresh`](#/auth/refresh)                 | None | Refresh access token using cookie refresh token   |
| **GET**  | [`/auth/me`](#/auth/me)                           | JWT  | Fetch current authenticated user profile          |

---

## Detailed Endpoint Specifications

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

### 5. Forgot Password

- **Endpoint:** `POST /auth/forgot-password`
- **Auth Required:** None
- **Request Body Schema (`application/json`):**
  - `email` (string, required): The registered email address to request a reset link.

#### Request Example:

```json
{
  "email": "johndoe@example.com"
}
```

#### Success Response (`200 OK`):

_Note: Returns 200 OK regardless of email existence to prevent user enumeration._

```json
{
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

---

### 6. Reset Password

- **Endpoint:** `POST /auth/reset-password`
- **Auth Required:** None
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

---

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
