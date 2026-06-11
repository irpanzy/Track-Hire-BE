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
          "Creates a new user account with the provided credentials. On success, sets accessToken and refreshToken as httpOnly cookies and returns the created user profile.",
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
            description: "User registered successfully",
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
                      example: "User registered successfully",
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
            description: "Email already registered",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: { message: "Email already registered" },
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
          "Authenticates a user with email and password. On success, sets accessToken and refreshToken as httpOnly cookies and returns the user profile.",
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
            description: "Invalid email or password",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: { message: "Invalid email or password" },
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
                        email: {
                          type: "string",
                          format: "email",
                          example: "john@example.com",
                        },
                        role: {
                          $ref: "#/components/schemas/UserRole",
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
          email: {
            type: "string",
            format: "email",
            description: "Email address (unique)",
          },
          role: { $ref: "#/components/schemas/UserRole" },
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
        required: ["name", "email", "password"],
        properties: {
          name: {
            type: "string",
            minLength: 2,
            maxLength: 100,
            example: "John Doe",
            description: "Full name (2-100 characters)",
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
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "john@example.com",
          },
          password: {
            type: "string",
            example: "SecurePass123",
          },
        },
      },
      UserResponse: {
        type: "object",
        properties: {
          id: { type: "string", example: "clxyz1234567890" },
          name: { type: "string", example: "John Doe" },
          email: {
            type: "string",
            format: "email",
            example: "john@example.com",
          },
          role: { $ref: "#/components/schemas/UserRole" },
        },
      },
      MessageResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
        },
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
    },
  },
  tags: [
    {
      name: "Auth",
      description:
        "Authentication & authorization — register, login, logout, token refresh, and user profile",
    },
    {
      name: "Applications",
      description: "Job application CRUD operations (coming soon)",
    },
    {
      name: "Companies",
      description: "Company management (coming soon)",
    },
    {
      name: "Reminders",
      description: "Reminder management (coming soon)",
    },
  ],
};

const swaggerSpec = swaggerJSDoc({ swaggerDefinition, apis: [] });

export default swaggerSpec;
