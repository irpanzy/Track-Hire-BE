# 🗑️ Recycle Bin API Documentation

## 📋 Overview

The Recycle Bin feature allows administrators to manage soft-deleted users. Users are not immediately removed from the database when deleted, instead they are marked with a `deletedAt` timestamp. Admins can view, restore, or permanently delete these users.

---

## 🔐 Authentication

All recycle bin endpoints require:

- ✅ **Authentication** - Valid `accessToken` cookie
- ✅ **Admin Role** - User must have `ADMIN` role

---

## 📡 API Endpoints

### **1. List Deleted Users**

Get a paginated list of soft-deleted users.

```http
GET /api/users/deleted/list
```

**Query Parameters:**

| Parameter | Type    | Default     | Description                                           |
| --------- | ------- | ----------- | ----------------------------------------------------- |
| `page`    | integer | 1           | Page number (min: 1)                                  |
| `limit`   | integer | 10          | Items per page (min: 1, max: 100)                     |
| `search`  | string  | -           | Search by name, username, or email                    |
| `role`    | enum    | -           | Filter by role (`USER` or `ADMIN`)                    |
| `sortBy`  | enum    | `createdAt` | Sort field (`name`, `username`, `email`, `createdAt`) |
| `order`   | enum    | `desc`      | Sort order (`asc` or `desc`)                          |

**Request Example:**

```bash
curl -X GET "https://api.track-hire.app/api/users/deleted/list?page=1&limit=10" \
  -H "Cookie: accessToken=..." \
  -H "Content-Type: application/json"
```

**Response 200 OK:**

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

| Code | Description                            |
| ---- | -------------------------------------- |
| 400  | Bad request (invalid query parameters) |
| 401  | Unauthorized (not logged in)           |
| 403  | Forbidden (not admin)                  |

---

### **2. Restore User**

Restore a soft-deleted user back to active status.

```http
POST /api/users/:id/restore
```

**Path Parameters:**

| Parameter | Type   | Description        |
| --------- | ------ | ------------------ |
| `id`      | string | User ID to restore |

**Request Example:**

```bash
curl -X POST "https://api.track-hire.app/api/users/clxyz123/restore" \
  -H "Cookie: accessToken=..." \
  -H "Content-Type: application/json"
```

**Response 200 OK:**

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

| Code | Description                  |
| ---- | ---------------------------- |
| 400  | Invalid user ID              |
| 401  | Unauthorized (not logged in) |
| 403  | Forbidden (not admin)        |
| 404  | Deleted user not found       |
| 500  | Internal server error        |

---

### **3. Permanent Delete**

Permanently delete a user and all associated data. **This action cannot be undone!**

```http
DELETE /api/users/:id/permanent
```

**Path Parameters:**

| Parameter | Type   | Description                   |
| --------- | ------ | ----------------------------- |
| `id`      | string | User ID to permanently delete |

**⚠️ Warning:**

This will permanently delete:

- ❌ User account
- ❌ All applications
- ❌ All reminders
- ❌ Application history
- ❌ Verification tokens
- ❌ Avatar from ImageKit

**Request Example:**

```bash
curl -X DELETE "https://api.track-hire.app/api/users/clxyz123/permanent" \
  -H "Cookie: accessToken=..." \
  -H "Content-Type: application/json"
```

**Response 200 OK:**

```json
{
  "message": "User permanently deleted"
}
```

**Error Responses:**

| Code | Description                  |
| ---- | ---------------------------- |
| 400  | Invalid user ID              |
| 401  | Unauthorized (not logged in) |
| 403  | Forbidden (not admin)        |
| 404  | Deleted user not found       |
| 500  | Internal server error        |

---

## 🔄 Workflow

### **Soft Delete Workflow:**

```
1. Admin deletes user
   DELETE /api/users/:id
   → User.deletedAt = current timestamp
   → User still in database

2. User appears in recycle bin
   GET /api/users/deleted/list
   → Shows deleted users

3. Admin can restore user
   POST /api/users/:id/restore
   → User.deletedAt = null
   → User active again

4. OR Admin can permanently delete
   DELETE /api/users/:id/permanent
   → User removed from database
   → All related data deleted
   → Avatar deleted from ImageKit
```

### **State Diagram:**

```
┌─────────────┐
│   Active    │
│   User      │
└──────┬──────┘
       │
       │ DELETE /api/users/:id
       │ (Soft delete)
       ↓
┌─────────────┐
│   Deleted   │──────────┐
│   User      │          │
│ (In Recycle │          │
│   Bin)      │          │
└──────┬──────┘          │
       │                 │
       │                 │ DELETE /api/users/:id/permanent
       │                 │ (Hard delete)
       │                 ↓
       │          ┌─────────────┐
       │          │ Permanently │
       │          │   Deleted   │
       │          │   (Gone)    │
       │          └─────────────┘
       │
       │ POST /api/users/:id/restore
       ↓
┌─────────────┐
│   Active    │
│   User      │
│ (Restored)  │
└─────────────┘
```

---

## 🧪 Testing Examples

### **Test 1: Delete User (Soft Delete)**

```bash
# 1. Login as admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"trackhire@gmail.com","password":"Trackerhire123!"}' \
  -c cookies.txt

# 2. Delete a user
curl -X DELETE http://localhost:3000/api/users/clxyz123 \
  -b cookies.txt

# Expected: User soft-deleted (deletedAt set)
```

### **Test 2: View Recycle Bin**

```bash
# List deleted users
curl -X GET "http://localhost:3000/api/users/deleted/list?page=1&limit=10" \
  -b cookies.txt

# Expected: Shows deleted users with deletedAt timestamp
```

### **Test 3: Restore User**

```bash
# Restore user
curl -X POST http://localhost:3000/api/users/clxyz123/restore \
  -b cookies.txt

# Expected: User active again (deletedAt = null)

# Verify user is active
curl -X GET http://localhost:3000/api/users \
  -b cookies.txt

# Should see restored user in active list
```

### **Test 4: Permanent Delete**

```bash
# Soft delete user first
curl -X DELETE http://localhost:3000/api/users/clxyz123 \
  -b cookies.txt

# Permanently delete user
curl -X DELETE http://localhost:3000/api/users/clxyz123/permanent \
  -b cookies.txt

# Expected: User removed from database completely

# Verify user is gone
curl -X GET "http://localhost:3000/api/users/deleted/list" \
  -b cookies.txt

# User should not appear in recycle bin
```

---

## 📊 Data Impact

### **Soft Delete (`DELETE /api/users/:id`):**

```sql
-- What happens in database
UPDATE "User"
SET "deletedAt" = CURRENT_TIMESTAMP
WHERE "id" = 'clxyz123';
```

**Impact:**

- ✅ User data preserved
- ✅ Related data (applications, companies) preserved
- ✅ Can be restored
- ✅ Avatar kept in ImageKit

### **Permanent Delete (`DELETE /api/users/:id/permanent`):**

```sql
-- What happens in database (in transaction)
DELETE FROM "VerificationToken" WHERE "userId" = 'clxyz123';
DELETE FROM "Reminder" WHERE "userId" = 'clxyz123';
DELETE FROM "ApplicationHistory" WHERE "application"."userId" = 'clxyz123';
DELETE FROM "Application" WHERE "userId" = 'clxyz123';
DELETE FROM "User" WHERE "id" = 'clxyz123';

-- Also: Avatar deleted from ImageKit
-- Note: Companies are NOT deleted (shared resource)
```

**Impact:**

- ❌ User data deleted
- ❌ All applications deleted
- ❌ All reminders deleted
- ❌ Application history deleted
- ❌ Verification tokens deleted
- ❌ Avatar deleted from ImageKit
- ❌ **Cannot be restored**

**Note:** Companies are preserved as they may be used by other users.

---

## 🔒 Security & Permissions

### **Access Control:**

```typescript
// Only admins can access recycle bin
router.get("/deleted/list", authMiddleware, adminMiddleware, listDeletedUsers);
router.post("/:id/restore", authMiddleware, adminMiddleware, restoreUser);
router.delete(
  "/:id/permanent",
  authMiddleware,
  adminMiddleware,
  permanentDeleteUser
);
```

### **Validation:**

- ✅ User ID must be valid
- ✅ User must exist in deleted state
- ✅ Admin role required for all operations
- ✅ Transaction ensures data integrity on permanent delete

---

## 💡 Best Practices

### **When to Use Soft Delete:**

- ✅ User requested account deletion
- ✅ Inactive user cleanup
- ✅ Suspicious activity (preserve evidence)
- ✅ Policy violation (may need to review later)

### **When to Use Permanent Delete:**

- ✅ Data retention period expired (e.g., 30 days after soft delete)
- ✅ User confirmed permanent deletion
- ✅ GDPR/privacy request for complete removal
- ✅ Test/spam accounts

### **Recommended Workflow:**

```
1. Soft delete user (immediate action)
2. Keep in recycle bin for 30 days
3. Notify user via email (can restore within 30 days)
4. After 30 days, permanent delete automatically
5. Or admin can restore anytime within 30 days
```

---

## 🗓️ Retention Policy Example

### **Automatic Cleanup (Future Enhancement):**

```typescript
// Cron job to automatically permanent delete users
// deleted more than 30 days ago

async function cleanupOldDeletedUsers() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const oldDeletedUsers = await prisma.user.findMany({
    where: {
      deletedAt: {
        not: null,
        lt: thirtyDaysAgo,
      },
    },
    select: { id: true },
  });

  for (const user of oldDeletedUsers) {
    // Permanent delete via API or direct database operation
    await permanentDeleteUser(user.id);
  }
}

// Run daily at midnight
schedule.scheduleJob("0 0 * * *", cleanupOldDeletedUsers);
```

---

## 🐛 Troubleshooting

### **Problem: Can't see deleted users**

**Check:**

1. ✅ Logged in as admin?
2. ✅ Using correct endpoint (`/deleted/list` not `/`)?
3. ✅ Users actually deleted (deletedAt set)?

**Solution:**

```bash
# Verify user is deleted
curl -X GET http://localhost:3000/api/users/deleted/list -b cookies.txt
```

### **Problem: Restore fails**

**Check:**

1. ✅ User ID correct?
2. ✅ User in deleted state (deletedAt not null)?
3. ✅ Admin permissions?

**Solution:**

```bash
# Check user state
curl -X GET "http://localhost:3000/api/users/deleted/list?search=john" -b cookies.txt
```

### **Problem: Permanent delete fails**

**Check:**

1. ✅ User soft-deleted first?
2. ✅ Database transaction succeeded?
3. ✅ Foreign key constraints satisfied?

**Solution:**

```bash
# Check server logs for detailed error
# Database will rollback transaction if any step fails
```

---

## 📚 Related Documentation

- [User API Endpoints](./api-contract.md#users)
- [Authentication](./api-contract.md#authentication)
- [Admin Middleware](../src/middleware/admin.middleware.ts)
- [Database Schema](../prisma/schema.prisma)

---

## ✅ Summary

**Recycle Bin Endpoints:**

| Endpoint                   | Method | Description             | Admin Only |
| -------------------------- | ------ | ----------------------- | ---------- |
| `/api/users/deleted/list`  | GET    | List deleted users      | ✅         |
| `/api/users/:id/restore`   | POST   | Restore deleted user    | ✅         |
| `/api/users/:id/permanent` | DELETE | Permanently delete user | ✅         |

**Key Features:**

- ✅ Soft delete preserves data
- ✅ Restore capability
- ✅ Permanent delete removes everything
- ✅ Admin-only access
- ✅ Transaction-safe operations
- ✅ Avatar cleanup

**Your recycle bin API is ready!** 🎉
