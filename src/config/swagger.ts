import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Track Hire API",
    version: "1.0.0",
    description:
      "Track Hire is a job application tracking API. It helps users manage their job applications, track application statuses, set reminders, and organize company information.",
    contact: {
      name: "Track Hire Team",
    },
    license: {
      name: "ISC",
    },
  },
  servers: [
    {
      url: "http://localhost:{port}",
      description: "Development server",
      variables: {
        port: {
          default: "3000",
        },
      },
    },
  ],
  paths: {
    "/api/auth/register": {
      post: {
        summary: "Register a new user",
        description:
          "Creates a new user account with the provided credentials. A verification email will be sent to the user's email address. The user must verify their email before they can log in.",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
            },
          },
        },
        responses: {
          "201": {
            description:
              "User registered successfully. Verification email sent.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example:
                        "Registration successful. Please check your email to verify your account.",
                    },
                    user: { $ref: "#/components/schemas/UserResponse" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Validation error (invalid input)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "409": {
            description: "Email or username already taken",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                examples: {
                  emailTaken: {
                    summary: "Email already registered",
                    value: { message: "Email already registered" },
                  },
                  usernameTaken: {
                    summary: "Username already taken",
                    value: { message: "Username already taken" },
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/auth/verify-email": {
      post: {
        summary: "Verify email address",
        description:
          "Verifies a user's email address using the token sent via email during registration. The token is single-use and expires after 24 hours.",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/VerifyEmailRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Email verified successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Email verified successfully",
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid or expired verification token",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: {
                  message: "Invalid or expired verification token",
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/auth/login": {
      post: {
        summary: "Login user",
        description:
          "Authenticates a user with email/username and password. On success, sets accessToken and refreshToken as httpOnly cookies and returns the user profile. Email must be verified before login is allowed.",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful",
            headers: {
              "Set-Cookie": {
                description:
                  "Sets accessToken and refreshToken httpOnly cookies",
                schema: { type: "string" },
              },
            },
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Login successful",
                    },
                    user: { $ref: "#/components/schemas/UserResponse" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Validation error (invalid input)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "401": {
            description: "Invalid credentials or Google-only account",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                examples: {
                  invalidCredentials: {
                    summary: "Invalid credentials",
                    value: { message: "Invalid credentials" },
                  },
                  googleOnly: {
                    summary: "Google-only account",
                    value: {
                      message:
                        "This account uses Google Sign-In. Please login with Google.",
                    },
                  },
                },
              },
            },
          },
          "403": {
            description: "Email not verified",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: {
                  message:
                    "Please verify your email before logging in. Check your inbox for the verification link.",
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/auth/google": {
      post: {
        summary: "Google OAuth login",
        description:
          "Authenticates a user using a Google ID token from the frontend. If the user doesn't exist, a new account is created automatically (email auto-verified). If an existing account has the same email, the Google account is linked to it.",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/GoogleAuthRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Google authentication successful",
            headers: {
              "Set-Cookie": {
                description:
                  "Sets accessToken and refreshToken httpOnly cookies",
                schema: { type: "string" },
              },
            },
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Google authentication successful",
                    },
                    user: {
                      type: "object",
                      properties: {
                        id: { type: "string", example: "clxyz1234567890" },
                        name: { type: "string", example: "John Doe" },
                        username: { type: "string", example: "johndoe" },
                        email: {
                          type: "string",
                          format: "email",
                          example: "john@gmail.com",
                        },
                        role: { $ref: "#/components/schemas/UserRole" },
                        avatarUrl: {
                          type: "string",
                          nullable: true,
                          example: "https://lh3.googleusercontent.com/...",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Invalid Google token",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: { message: "Invalid Google token" },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/auth/forgot-password": {
      post: {
        summary: "Request password reset",
        description:
          "Sends a password reset email to the user. For security, always returns a success message regardless of whether the email exists (prevents email enumeration). The reset link expires after 1 hour.",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ForgotPasswordRequest" },
            },
          },
        },
        responses: {
          "200": {
            description:
              "Password reset email sent (or email doesn't exist — same response for security)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example:
                        "If an account with that email exists, a password reset link has been sent.",
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Validation error (invalid email format)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/auth/reset-password": {
      post: {
        summary: "Reset password",
        description:
          "Resets the user's password using a valid reset token from the forgot-password email. The token is single-use and expires after 1 hour.",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ResetPasswordRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Password reset successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Password reset successfully",
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid or expired reset token, or validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                examples: {
                  invalidToken: {
                    summary: "Invalid or expired token",
                    value: { message: "Invalid or expired reset token" },
                  },
                  validationError: {
                    summary: "Password validation failed",
                    value: {
                      message: "Password must be at least 8 characters",
                    },
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        summary: "Logout user",
        description:
          "Logs out the current user by clearing the accessToken and refreshToken cookies.",
        tags: ["Auth"],
        responses: {
          "200": {
            description: "Logout successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Logout successful",
                    },
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/auth/refresh": {
      post: {
        summary: "Refresh access token",
        description:
          "Uses the refreshToken cookie to generate a new accessToken. The new access token is set as an httpOnly cookie. Requires a valid refreshToken cookie to be present.",
        tags: ["Auth"],
        security: [{ cookieRefreshToken: [] }],
        responses: {
          "200": {
            description: "Access token refreshed successfully",
            headers: {
              "Set-Cookie": {
                description: "Sets a new accessToken httpOnly cookie",
                schema: { type: "string" },
              },
            },
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Access token refreshed successfully",
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Refresh token not found, invalid, or expired",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                examples: {
                  tokenNotFound: {
                    summary: "Token missing",
                    value: { message: "Refresh token not found" },
                  },
                  tokenInvalid: {
                    summary: "Token invalid or expired",
                    value: {
                      message: "Invalid or expired refresh token",
                    },
                  },
                  userNotFound: {
                    summary: "User no longer exists",
                    value: { message: "User not found" },
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/auth/me": {
      get: {
        summary: "Get current user profile",
        description:
          "Returns the profile of the currently authenticated user. Requires a valid accessToken cookie (protected route).",
        tags: ["Auth"],
        security: [{ cookieAccessToken: [] }],
        responses: {
          "200": {
            description: "User profile fetched successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "User fetched successfully",
                    },
                    user: {
                      type: "object",
                      properties: {
                        id: {
                          type: "string",
                          example: "clxyz1234567890",
                        },
                        name: {
                          type: "string",
                          example: "John Doe",
                        },
                        username: {
                          type: "string",
                          example: "johndoe",
                        },
                        email: {
                          type: "string",
                          format: "email",
                          example: "john@example.com",
                        },
                        role: {
                          $ref: "#/components/schemas/UserRole",
                        },
                        avatarUrl: {
                          type: "string",
                          nullable: true,
                          example: "https://lh3.googleusercontent.com/...",
                        },
                        isEmailVerified: {
                          type: "boolean",
                          example: true,
                        },
                        createdAt: {
                          type: "string",
                          format: "date-time",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized — access token missing or invalid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: { message: "Access token not found" },
              },
            },
          },
          "404": {
            description: "User not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: { message: "User not found" },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/users": {
      get: {
        tags: ["Users"],
        summary: "List all users (Admin only)",
        description:
          "Retrieve a paginated list of users with optional search, role filter, and sorting. Requires admin role.",
        security: [{ cookieAccessToken: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1, minimum: 1 },
            description: "Page number",
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10, minimum: 1, maximum: 100 },
            description: "Number of items per page",
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
            description: "Search by name, username, or email",
          },
          {
            name: "role",
            in: "query",
            schema: { type: "string", enum: ["USER", "ADMIN"] },
            description: "Filter by user role",
          },
          {
            name: "sortBy",
            in: "query",
            schema: {
              type: "string",
              enum: ["name", "username", "email", "createdAt"],
              default: "createdAt",
            },
            description: "Sort field",
          },
          {
            name: "order",
            in: "query",
            schema: { type: "string", enum: ["asc", "desc"], default: "desc" },
            description: "Sort order",
          },
        ],
        responses: {
          "200": {
            description: "Users fetched successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    users: {
                      type: "array",
                      items: { $ref: "#/components/schemas/UserResponse" },
                    },
                    pagination: {
                      $ref: "#/components/schemas/Pagination",
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "403": {
            description: "Forbidden — admin access required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: { message: "Forbidden. Admin access required." },
              },
            },
          },
        },
      },
    },
    "/api/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Get user by ID",
        description:
          "Retrieve a user's profile. Users can view their own profile, admins can view any user.",
        security: [{ cookieAccessToken: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "User ID",
          },
        ],
        responses: {
          "200": {
            description: "User fetched successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    user: { $ref: "#/components/schemas/UserResponse" },
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "403": {
            description: "Forbidden — can only view own profile",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: { message: "Forbidden" },
              },
            },
          },
          "404": {
            description: "User not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: { message: "User not found" },
              },
            },
          },
        },
      },
      put: {
        tags: ["Users"],
        summary: "Update user profile",
        description:
          "Update a user's name and/or username. Users can update their own profile, admins can update any user.",
        security: [{ cookieAccessToken: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "User ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateUserRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "User updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    user: { $ref: "#/components/schemas/UserResponse" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "403": {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "User not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "409": {
            description: "Username already taken",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: { message: "Username already taken" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Users"],
        summary: "Delete user (Admin only)",
        description: "Soft-delete a user. Requires admin role.",
        security: [{ cookieAccessToken: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "User ID",
          },
        ],
        responses: {
          "200": {
            description: "User deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                  },
                },
                example: { message: "User deleted successfully" },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "403": {
            description: "Forbidden — admin access required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "User not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/users/{id}/avatar": {
      put: {
        tags: ["Users"],
        summary: "Upload or update avatar",
        description:
          "Upload a new avatar image. The image is resized to 200x200px WebP format and stored on ImageKit. Maximum file size: 2MB. Accepted formats: JPEG, PNG, WebP, GIF.",
        security: [{ cookieAccessToken: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "User ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  avatar: {
                    type: "string",
                    format: "binary",
                    description:
                      "Avatar image file (JPEG, PNG, WebP, or GIF, max 2MB)",
                  },
                },
                required: ["avatar"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Avatar updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    user: { $ref: "#/components/schemas/UserResponse" },
                  },
                },
              },
            },
          },
          "400": {
            description: "No file uploaded or invalid file type",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "403": {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "User not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Users"],
        summary: "Delete avatar",
        description:
          "Remove the user's avatar from ImageKit and set avatarUrl to null.",
        security: [{ cookieAccessToken: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "User ID",
          },
        ],
        responses: {
          "200": {
            description: "Avatar deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    user: { $ref: "#/components/schemas/UserResponse" },
                  },
                },
              },
            },
          },
          "400": {
            description: "User does not have an avatar",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: { message: "User does not have an avatar" },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "403": {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "User not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/applications": {
      post: {
        tags: ["Applications"],
        summary: "Create a new job application",
        description:
          "Creates a new job application. The company is automatically found or created by name (case-insensitive). An initial history record is logged with status APPLIED.",
        security: [{ cookieAccessToken: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateApplicationRequest",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Application created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    application: {
                      $ref: "#/components/schemas/ApplicationResponse",
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      get: {
        tags: ["Applications"],
        summary: "List job applications",
        description:
          "Retrieve a paginated list of job applications with optional filters. Regular users only see their own applications. Admins can see all.",
        security: [{ cookieAccessToken: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1, minimum: 1 },
            description: "Page number",
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10, minimum: 1, maximum: 100 },
            description: "Items per page",
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
            description: "Search by position or company name",
          },
          {
            name: "status",
            in: "query",
            schema: { $ref: "#/components/schemas/ApplicationStatus" },
            description: "Filter by application status",
          },
          {
            name: "source",
            in: "query",
            schema: { $ref: "#/components/schemas/ApplicationSource" },
            description: "Filter by application source",
          },
          {
            name: "jobType",
            in: "query",
            schema: { $ref: "#/components/schemas/JobType" },
            description: "Filter by job type",
          },
          {
            name: "sortBy",
            in: "query",
            schema: {
              type: "string",
              enum: ["appliedDate", "createdAt", "position", "status"],
              default: "appliedDate",
            },
            description: "Sort field",
          },
          {
            name: "order",
            in: "query",
            schema: { type: "string", enum: ["asc", "desc"], default: "desc" },
            description: "Sort order",
          },
        ],
        responses: {
          "200": {
            description: "Applications fetched successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    applications: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/ApplicationResponse",
                      },
                    },
                    pagination: {
                      $ref: "#/components/schemas/Pagination",
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid query parameters",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/applications/extract-url": {
      post: {
        tags: ["Applications"],
        summary: "Extract job application details from URL using AI",
        description:
          "Scrapes the job posting page from the provided URL using Cheerio, then processes the text using Gemini AI to extract structured job application fields. Returns the extracted fields for review without saving them to the database.",
        security: [{ cookieAccessToken: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["url"],
                properties: {
                  url: {
                    type: "string",
                    format: "uri",
                    example: "https://www.linkedin.com/jobs/view/1234567890/",
                    description: "The job posting URL to extract details from",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Job details extracted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    data: {
                      type: "object",
                      properties: {
                        companyName: { type: "string", example: "Google" },
                        companyWebsite: {
                          type: "string",
                          format: "uri",
                          nullable: true,
                          example: "https://about.google",
                        },
                        companyLocation: {
                          type: "string",
                          nullable: true,
                          example: "Mountain View, CA",
                        },
                        position: {
                          type: "string",
                          example: "Software Engineer",
                        },
                        jobType: { $ref: "#/components/schemas/JobType" },
                        location: {
                          type: "string",
                          nullable: true,
                          example: "Jakarta, Indonesia",
                        },
                        source: {
                          $ref: "#/components/schemas/ApplicationSource",
                        },
                        sourceUrl: {
                          type: "string",
                          format: "uri",
                          example:
                            "https://www.linkedin.com/jobs/view/1234567890/",
                        },
                        description: { type: "string", nullable: true },
                        requirements: { type: "string", nullable: true },
                        salaryRange: {
                          type: "string",
                          nullable: true,
                          example: "15.000.000 - 25.000.000",
                        },
                        deadlineDate: {
                          type: "string",
                          nullable: true,
                          example: "2026-07-31",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "400": {
            description:
              "Validation error or extraction failed (e.g. invalid URL, scraper blocked, or Gemini key not set)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/applications/{id}": {
      get: {
        tags: ["Applications"],
        summary: "Get application by ID",
        description:
          "Retrieve a single application with full details including company info and status change history. Owner or admin access required.",
        security: [{ cookieAccessToken: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Application ID",
          },
        ],
        responses: {
          "200": {
            description: "Application fetched successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    application: {
                      $ref: "#/components/schemas/ApplicationDetailResponse",
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid application ID",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "403": {
            description: "Forbidden — not the owner",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "Application not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      put: {
        tags: ["Applications"],
        summary: "Update application",
        description:
          "Update application fields. If status changes, a new record is automatically logged to ApplicationHistory. Owner or admin access required.",
        security: [{ cookieAccessToken: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Application ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateApplicationRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Application updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    application: {
                      $ref: "#/components/schemas/ApplicationResponse",
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Validation error or no fields provided",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "403": {
            description: "Forbidden — not the owner",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "Application not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Applications"],
        summary: "Delete application",
        description:
          "Soft-delete a job application (sets deletedAt timestamp). Owner or admin access required.",
        security: [{ cookieAccessToken: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Application ID",
          },
        ],
        responses: {
          "200": {
            description: "Application deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                  },
                },
                example: { message: "Application deleted successfully" },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "403": {
            description: "Forbidden — not the owner",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "Application not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/companies": {
      post: {
        tags: ["Companies"],
        summary: "Create a new company",
        description:
          "Creates a new company record. Requires authentication. Returns 409 if a company with the same name already exists.",
        security: [{ cookieAccessToken: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateCompanyRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Company created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    company: { $ref: "#/components/schemas/Company" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Validation error",
          },
          "401": {
            description: "Unauthorized",
          },
          "409": {
            description: "Company already exists",
          },
        },
      },
      get: {
        tags: ["Companies"],
        summary: "List companies",
        description:
          "Retrieve a paginated list of companies. Supports search, sorting, and userOnly filtering.",
        security: [{ cookieAccessToken: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10 },
          },
          { name: "search", in: "query", schema: { type: "string" } },
          {
            name: "userOnly",
            in: "query",
            schema: { type: "boolean", default: false },
            description:
              "Only return companies with active applications for the user",
          },
          {
            name: "sortBy",
            in: "query",
            schema: {
              type: "string",
              enum: ["name", "createdAt"],
              default: "name",
            },
          },
          {
            name: "order",
            in: "query",
            schema: { type: "string", enum: ["asc", "desc"], default: "asc" },
          },
        ],
        responses: {
          "200": {
            description: "Companies fetched successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    companies: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Company" },
                    },
                    pagination: { $ref: "#/components/schemas/Pagination" },
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
          },
        },
      },
    },
    "/api/companies/{id}": {
      get: {
        tags: ["Companies"],
        summary: "Get company by ID",
        description:
          "Retrieve a company's details, including the user's active applications at this company.",
        security: [{ cookieAccessToken: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Company fetched successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    company: {
                      $ref: "#/components/schemas/CompanyDetailResponse",
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
          },
          "404": {
            description: "Company not found",
          },
        },
      },
      put: {
        tags: ["Companies"],
        summary: "Update company",
        description:
          "Update company details. Returns 409 if name conflicts with another company.",
        security: [{ cookieAccessToken: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateCompanyRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Company updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    company: { $ref: "#/components/schemas/Company" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Validation error",
          },
          "401": {
            description: "Unauthorized",
          },
          "404": {
            description: "Company not found",
          },
          "409": {
            description: "Company name already taken",
          },
        },
      },
      delete: {
        tags: ["Companies"],
        summary: "Delete company",
        description: "Soft-delete a company record.",
        security: [{ cookieAccessToken: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Company deleted successfully",
          },
          "401": {
            description: "Unauthorized",
          },
          "404": {
            description: "Company not found",
          },
        },
      },
    },
    "/api/reminders": {
      post: {
        tags: ["Reminders"],
        summary: "Create a new reminder",
        description:
          "Creates a new reminder. Requires authentication. Can optionally link to a job application owned by the user.",
        security: [{ cookieAccessToken: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateReminderRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Reminder created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    reminder: { $ref: "#/components/schemas/Reminder" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Validation error",
          },
          "401": {
            description: "Unauthorized",
          },
          "404": {
            description:
              "Job application not found (if applicationId provided does not exist or belong to the user)",
          },
        },
      },
      get: {
        tags: ["Reminders"],
        summary: "List reminders",
        description:
          "Retrieve a paginated list of reminders for the current user. Filters by completion status (isDone), specific application, or upcoming status are supported.",
        security: [{ cookieAccessToken: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10 },
          },
          { name: "isDone", in: "query", schema: { type: "boolean" } },
          { name: "applicationId", in: "query", schema: { type: "string" } },
          {
            name: "upcoming",
            in: "query",
            schema: { type: "boolean", default: false },
            description: "If true, only returns future pending reminders",
          },
          {
            name: "sortBy",
            in: "query",
            schema: {
              type: "string",
              enum: ["reminderDate", "createdAt"],
              default: "reminderDate",
            },
          },
          {
            name: "order",
            in: "query",
            schema: { type: "string", enum: ["asc", "desc"], default: "asc" },
          },
        ],
        responses: {
          "200": {
            description: "Reminders fetched successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    reminders: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Reminder" },
                    },
                    pagination: { $ref: "#/components/schemas/Pagination" },
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
          },
        },
      },
    },
    "/api/reminders/{id}": {
      get: {
        tags: ["Reminders"],
        summary: "Get reminder by ID",
        description:
          "Retrieve a single reminder detail. Only accessible by the owner.",
        security: [{ cookieAccessToken: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Reminder fetched successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    reminder: { $ref: "#/components/schemas/Reminder" },
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
          },
          "404": {
            description: "Reminder not found",
          },
        },
      },
      put: {
        tags: ["Reminders"],
        summary: "Update reminder",
        description:
          "Update reminder details. Can toggle status, edit date, title, or linked job application.",
        security: [{ cookieAccessToken: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateReminderRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Reminder updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    reminder: { $ref: "#/components/schemas/Reminder" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Validation error",
          },
          "401": {
            description: "Unauthorized",
          },
          "404": {
            description: "Reminder or Job application not found",
          },
        },
      },
      delete: {
        tags: ["Reminders"],
        summary: "Delete reminder",
        description: "Soft-delete a reminder record.",
        security: [{ cookieAccessToken: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Reminder deleted successfully",
          },
          "401": {
            description: "Unauthorized",
          },
          "404": {
            description: "Reminder not found",
          },
        },
      },
    },
    "/api/dashboard/stats": {
      get: {
        tags: ["Dashboard"],
        summary: "Get dashboard stats",
        description:
          "Retrieve compiled job application statistics and trends for the current authenticated user.",
        security: [{ cookieAccessToken: [] }],
        responses: {
          "200": {
            description: "Dashboard stats fetched successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/DashboardStatsResponse",
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
          },
          "500": {
            description: "Internal server error",
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      cookieAccessToken: {
        type: "apiKey",
        in: "cookie",
        name: "accessToken",
        description: "JWT access token stored in httpOnly cookie",
      },
      cookieRefreshToken: {
        type: "apiKey",
        in: "cookie",
        name: "refreshToken",
        description: "JWT refresh token stored in httpOnly cookie",
      },
    },
    schemas: {
      UserRole: {
        type: "string",
        enum: ["USER", "ADMIN"],
        description: "Role of the user in the system",
      },
      ApplicationSource: {
        type: "string",
        enum: [
          "LINKEDIN",
          "GLINTS",
          "JOBSTREET",
          "UPWORK",
          "INDEED",
          "WEBSITE",
          "INSTAGRAM",
          "X",
          "OTHER",
        ],
        description: "Source platform where the job was found",
      },
      ApplicationStatus: {
        type: "string",
        enum: [
          "APPLIED",
          "SCREENING",
          "INTERVIEW",
          "TECHNICAL_TEST",
          "HR_INTERVIEW",
          "OFFERING",
          "ACCEPTED",
          "REJECTED",
          "WITHDRAWN",
        ],
        description: "Current status of the job application",
      },
      JobType: {
        type: "string",
        enum: [
          "FULL_TIME",
          "PART_TIME",
          "CONTRACT",
          "INTERNSHIP",
          "FREELANCE",
          "REMOTE",
        ],
        description: "Type of job/employment",
      },
      User: {
        type: "object",
        properties: {
          id: { type: "string", description: "Unique user identifier (cuid)" },
          name: { type: "string", description: "Full name of the user" },
          username: {
            type: "string",
            description: "Unique username",
          },
          email: {
            type: "string",
            format: "email",
            description: "Email address (unique)",
          },
          role: { $ref: "#/components/schemas/UserRole" },
          isEmailVerified: {
            type: "boolean",
            description: "Whether the user's email has been verified",
          },
          googleId: {
            type: "string",
            nullable: true,
            description: "Google account ID (if linked)",
          },
          avatarUrl: {
            type: "string",
            nullable: true,
            description: "Profile picture URL",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Account creation timestamp",
          },
        },
      },
      Company: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "Unique company identifier (cuid)",
          },
          name: { type: "string", description: "Company name" },
          website: {
            type: "string",
            nullable: true,
            description: "Company website URL",
          },
          location: {
            type: "string",
            nullable: true,
            description: "Company location",
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Application: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "Unique application identifier (cuid)",
          },
          userId: { type: "string", description: "ID of the applicant" },
          companyId: { type: "string", description: "ID of the company" },
          position: {
            type: "string",
            description: "Job position/title applied for",
          },
          jobType: { $ref: "#/components/schemas/JobType" },
          location: {
            type: "string",
            nullable: true,
            description: "Job location",
          },
          source: { $ref: "#/components/schemas/ApplicationSource" },
          sourceUrl: {
            type: "string",
            nullable: true,
            description: "URL to the original job posting",
          },
          description: {
            type: "string",
            nullable: true,
            description: "Job description",
          },
          requirements: {
            type: "string",
            nullable: true,
            description: "Job requirements",
          },
          salaryRange: {
            type: "string",
            nullable: true,
            description: "Expected salary range",
          },
          status: { $ref: "#/components/schemas/ApplicationStatus" },
          appliedDate: {
            type: "string",
            format: "date-time",
            description: "Date when the application was submitted",
          },
          deadlineDate: {
            type: "string",
            format: "date-time",
            nullable: true,
            description: "Application deadline",
          },
          notes: {
            type: "string",
            nullable: true,
            description: "Additional notes",
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      ApplicationHistory: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "Unique history entry identifier",
          },
          applicationId: {
            type: "string",
            description: "ID of the related application",
          },
          oldStatus: {
            type: "string",
            description: "Previous application status",
          },
          newStatus: {
            type: "string",
            description: "New application status",
          },
          notes: {
            type: "string",
            nullable: true,
            description: "Notes about the status change",
          },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Reminder: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "Unique reminder identifier (cuid)",
          },
          userId: { type: "string", description: "ID of the user" },
          applicationId: {
            type: "string",
            nullable: true,
            description: "Optional linked application ID",
          },
          title: { type: "string", description: "Reminder title" },
          description: {
            type: "string",
            nullable: true,
            description: "Reminder description",
          },
          reminderDate: {
            type: "string",
            format: "date-time",
            description: "Date/time for the reminder",
          },
          isDone: {
            type: "boolean",
            description: "Whether the reminder is completed",
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      RegisterRequest: {
        type: "object",
        required: ["name", "username", "email", "password", "confirmPassword"],
        properties: {
          name: {
            type: "string",
            minLength: 2,
            maxLength: 100,
            example: "John Doe",
            description: "Full name (2-100 characters)",
          },
          username: {
            type: "string",
            minLength: 3,
            maxLength: 30,
            pattern: "^[a-zA-Z0-9_]+$",
            example: "johndoe",
            description:
              "Unique username (3-30 characters, letters, numbers, underscores only)",
          },
          email: {
            type: "string",
            format: "email",
            example: "john@example.com",
            description: "Valid email address",
          },
          password: {
            type: "string",
            minLength: 8,
            example: "SecurePass123",
            description:
              "Minimum 8 chars, must contain uppercase, lowercase, and number",
          },
          confirmPassword: {
            type: "string",
            example: "SecurePass123",
            description: "Must match the password field",
          },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["emailOrUsername", "password"],
        properties: {
          emailOrUsername: {
            type: "string",
            example: "johndoe",
            description:
              "Email address or username. If it contains '@', it is treated as an email.",
          },
          password: {
            type: "string",
            example: "SecurePass123",
          },
        },
      },
      VerifyEmailRequest: {
        type: "object",
        required: ["token"],
        properties: {
          token: {
            type: "string",
            format: "uuid",
            example: "550e8400-e29b-41d4-a716-446655440000",
            description:
              "Verification token received via email. Single-use, expires in 24 hours.",
          },
        },
      },
      GoogleAuthRequest: {
        type: "object",
        required: ["idToken"],
        properties: {
          idToken: {
            type: "string",
            example: "eyJhbGciOiJSUzI1NiIs...",
            description:
              "Google ID token obtained from Google Sign-In on the frontend",
          },
        },
      },
      ForgotPasswordRequest: {
        type: "object",
        required: ["email"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "john@example.com",
            description: "Email address of the account to reset",
          },
        },
      },
      ResetPasswordRequest: {
        type: "object",
        required: ["token", "password"],
        properties: {
          token: {
            type: "string",
            format: "uuid",
            example: "550e8400-e29b-41d4-a716-446655440000",
            description:
              "Password reset token received via email. Single-use, expires in 1 hour.",
          },
          password: {
            type: "string",
            minLength: 8,
            example: "NewSecurePass456",
            description:
              "New password. Minimum 8 chars, must contain uppercase, lowercase, and number.",
          },
        },
      },
      UserResponse: {
        type: "object",
        properties: {
          id: { type: "string", example: "clxyz1234567890" },
          name: { type: "string", example: "John Doe" },
          username: { type: "string", example: "johndoe" },
          email: {
            type: "string",
            format: "email",
            example: "john@example.com",
          },
          role: { $ref: "#/components/schemas/UserRole" },
          avatarUrl: {
            type: "string",
            nullable: true,
            example: "https://ik.imagekit.io/your_id/avatars/avatar.webp",
          },
          isEmailVerified: { type: "boolean", example: true },
          createdAt: {
            type: "string",
            format: "date-time",
            example: "2026-06-12T18:32:00.000Z",
          },
        },
      },
      MessageResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
        },
      },
      UpdateUserRequest: {
        type: "object",
        properties: {
          name: {
            type: "string",
            minLength: 2,
            maxLength: 100,
            description: "Full name (optional)",
          },
          username: {
            type: "string",
            minLength: 3,
            maxLength: 30,
            pattern: "^[a-zA-Z0-9_]+$",
            description:
              "Username — alphanumeric and underscores only (optional)",
          },
        },
      },
      Pagination: {
        type: "object",
        properties: {
          page: { type: "integer" },
          limit: { type: "integer" },
          total: { type: "integer" },
          totalPages: { type: "integer" },
        },
      },
      CreateApplicationRequest: {
        type: "object",
        required: ["companyName", "position", "jobType", "source"],
        properties: {
          companyName: {
            type: "string",
            example: "PT Teknologi Indonesia",
            description: "Company name (auto find-or-create)",
          },
          companyWebsite: {
            type: "string",
            format: "uri",
            example: "https://teknologi.co.id",
          },
          companyLocation: {
            type: "string",
            example: "Jakarta, Indonesia",
          },
          position: {
            type: "string",
            example: "Backend Developer",
            description: "Job position (2-200 characters)",
          },
          jobType: { $ref: "#/components/schemas/JobType" },
          location: { type: "string", example: "Jakarta" },
          source: { $ref: "#/components/schemas/ApplicationSource" },
          sourceUrl: {
            type: "string",
            format: "uri",
            example: "https://linkedin.com/jobs/12345",
          },
          description: { type: "string" },
          requirements: { type: "string" },
          salaryRange: {
            type: "string",
            example: "15.000.000 - 25.000.000",
          },
          status: { $ref: "#/components/schemas/ApplicationStatus" },
          appliedDate: {
            type: "string",
            format: "date-time",
            description: "Defaults to now if not provided",
          },
          deadlineDate: { type: "string", format: "date-time" },
          notes: { type: "string" },
        },
      },
      UpdateApplicationRequest: {
        type: "object",
        properties: {
          companyName: { type: "string" },
          companyWebsite: { type: "string", format: "uri" },
          companyLocation: { type: "string" },
          position: { type: "string" },
          jobType: { $ref: "#/components/schemas/JobType" },
          location: { type: "string" },
          source: { $ref: "#/components/schemas/ApplicationSource" },
          sourceUrl: { type: "string", format: "uri" },
          description: { type: "string" },
          requirements: { type: "string" },
          salaryRange: { type: "string" },
          status: { $ref: "#/components/schemas/ApplicationStatus" },
          appliedDate: { type: "string", format: "date-time" },
          deadlineDate: { type: "string", format: "date-time" },
          notes: { type: "string" },
        },
      },
      CreateCompanyRequest: {
        type: "object",
        required: ["name"],
        properties: {
          name: {
            type: "string",
            minLength: 1,
            maxLength: 200,
            example: "Google",
          },
          website: {
            type: "string",
            format: "uri",
            nullable: true,
            example: "https://google.com",
          },
          location: {
            type: "string",
            maxLength: 200,
            nullable: true,
            example: "Mountain View, CA",
          },
        },
      },
      UpdateCompanyRequest: {
        type: "object",
        properties: {
          name: {
            type: "string",
            minLength: 1,
            maxLength: 200,
            example: "Google Inc.",
          },
          website: {
            type: "string",
            format: "uri",
            nullable: true,
            example: "https://google.com",
          },
          location: {
            type: "string",
            maxLength: 200,
            nullable: true,
            example: "Mountain View, California",
          },
        },
      },
      CompanyDetailResponse: {
        allOf: [
          { $ref: "#/components/schemas/Company" },
          {
            type: "object",
            properties: {
              applications: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    position: { type: "string" },
                    jobType: { $ref: "#/components/schemas/JobType" },
                    status: { $ref: "#/components/schemas/ApplicationStatus" },
                    appliedDate: { type: "string", format: "date-time" },
                    createdAt: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
        ],
      },
      CompanyResponse: {
        type: "object",
        properties: {
          id: { type: "string", example: "clxyz_company_1" },
          name: { type: "string", example: "PT Teknologi Indonesia" },
          website: {
            type: "string",
            nullable: true,
            example: "https://teknologi.co.id",
          },
          location: {
            type: "string",
            nullable: true,
            example: "Jakarta, Indonesia",
          },
        },
      },
      ApplicationHistoryResponse: {
        type: "object",
        properties: {
          id: { type: "string" },
          oldStatus: {
            type: "string",
            nullable: true,
            description: "Previous status (null for initial creation)",
          },
          newStatus: { type: "string" },
          notes: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      ApplicationResponse: {
        type: "object",
        properties: {
          id: { type: "string", example: "clxyz_app_1" },
          position: { type: "string", example: "Backend Developer" },
          jobType: { $ref: "#/components/schemas/JobType" },
          location: { type: "string", nullable: true },
          source: { $ref: "#/components/schemas/ApplicationSource" },
          sourceUrl: { type: "string", nullable: true },
          description: { type: "string", nullable: true },
          requirements: { type: "string", nullable: true },
          salaryRange: { type: "string", nullable: true },
          status: { $ref: "#/components/schemas/ApplicationStatus" },
          appliedDate: { type: "string", format: "date-time" },
          deadlineDate: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
          notes: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          company: { $ref: "#/components/schemas/CompanyResponse" },
        },
      },
      ApplicationDetailResponse: {
        allOf: [
          { $ref: "#/components/schemas/ApplicationResponse" },
          {
            type: "object",
            properties: {
              histories: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/ApplicationHistoryResponse",
                },
              },
            },
          },
        ],
      },
      ErrorResponse: {
        type: "object",
        properties: {
          message: {
            type: "string",
            description: "Error description",
          },
        },
      },

      CreateReminderRequest: {
        type: "object",
        required: ["title", "reminderDate"],
        properties: {
          title: {
            type: "string",
            minLength: 1,
            maxLength: 100,
            example: "HR Interview Follow-up",
          },
          description: {
            type: "string",
            maxLength: 1000,
            nullable: true,
            example: "Send thank-you email and check status.",
          },
          reminderDate: {
            type: "string",
            format: "date-time",
            example: "2026-06-15T09:00:00.000Z",
          },
          applicationId: {
            type: "string",
            nullable: true,
            example: "clxyz_app_1",
          },
        },
      },
      UpdateReminderRequest: {
        type: "object",
        properties: {
          title: {
            type: "string",
            minLength: 1,
            maxLength: 100,
            example: "HR Interview Follow-up",
          },
          description: {
            type: "string",
            maxLength: 1000,
            nullable: true,
            example: "Send thank-you email and check status.",
          },
          reminderDate: {
            type: "string",
            format: "date-time",
            example: "2026-06-15T09:00:00.000Z",
          },
          isDone: {
            type: "boolean",
            example: true,
          },
          applicationId: {
            type: "string",
            nullable: true,
            example: "clxyz_app_1",
          },
        },
      },
      DashboardStatsResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
          data: {
            type: "object",
            properties: {
              totalApplications: { type: "integer", example: 12 },
              statusDistribution: {
                type: "object",
                additionalProperties: { type: "integer" },
                example: { APPLIED: 5, INTERVIEW: 3, REJECTED: 4 },
              },
              sourceDistribution: {
                type: "object",
                additionalProperties: { type: "integer" },
                example: { LINKEDIN: 8, GLINTS: 4 },
              },
              recentApplications: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string", example: "clxyz_app_1" },
                    position: { type: "string", example: "Backend Developer" },
                    status: { $ref: "#/components/schemas/ApplicationStatus" },
                    appliedDate: { type: "string", format: "date-time" },
                    company: {
                      type: "object",
                      properties: {
                        name: { type: "string", example: "Google" },
                      },
                    },
                  },
                },
              },
              monthlyTrend: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    month: { type: "string", example: "Jun 2026" },
                    count: { type: "integer", example: 4 },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  tags: [
    {
      name: "Auth",
      description:
        "Authentication & authorization — register, email verification, login, Google OAuth, password reset, logout, token refresh, and user profile",
    },
    {
      name: "Users",
      description:
        "User management — list, view, update profile, avatar upload/delete, and soft-delete",
    },
    {
      name: "Applications",
      description:
        "Job application CRUD — create, list, view, update, and soft-delete applications with auto company management and status history tracking",
    },
    {
      name: "Companies",
      description:
        "Company management — list, view, create, update, and soft-delete companies",
    },
    {
      name: "Reminders",
      description:
        "Reminder management — list, view, create, update, and soft-delete reminders",
    },
    {
      name: "Dashboard",
      description: "Dashboard and statistics API",
    },
  ],
};

const swaggerSpec = swaggerJSDoc({ swaggerDefinition, apis: [] });

export default swaggerSpec;
