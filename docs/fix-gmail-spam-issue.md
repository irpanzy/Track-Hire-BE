# 🔧 Fix Gmail Spam Issue

## ❌ Problem

Email dari Track Hire masuk ke spam folder dengan pesan:

> "This message is similar to messages that were identified as spam in the past."

## 🎯 Root Cause

Gmail's spam filter **learned** bahwa email Anda adalah spam karena:

1. ✅ **Configuration is correct** - Reply-To sudah `support@track-hire.app`
2. ❌ **Gmail learned from past tests** - Email sebelumnya ditandai sebagai spam
3. ❌ **Similar content pattern** - Gmail deteksi similarity dengan spam
4. ❌ **New sender reputation** - Belum ada track record pengiriman

## ✅ Solution: Train Gmail that This is NOT Spam

### **Step 1: Report as "Not Spam"** (MOST IMPORTANT)

1. Buka email di Spam folder
2. **Click "Report not spam"** button
3. Email akan pindah ke Inbox
4. Ulangi untuk SEMUA email Track Hire di spam

### **Step 2: Add to Contacts**

1. Open any email from Track Hire
2. Click sender name: "Track Hire <irfanmuria04@gmail.com>"
3. Click **"Add to contacts"**
4. Save

### **Step 3: Create Gmail Filter** (Permanent Fix)

1. Open Gmail Settings (⚙️ → See all settings)
2. Go to **"Filters and Blocked Addresses"**
3. Click **"Create a new filter"**

**Filter criteria:**

```
From: irfanmuria04@gmail.com
Has the words: Track Hire
```

4. Click **"Create filter"**
5. Check these options:
   - ☑️ **Never send it to Spam**
   - ☑️ **Always mark it as important**
   - ☑️ **Categorize as: Primary**
6. ☑️ **Also apply filter to matching conversations**
7. Click **"Create filter"**

### **Step 4: Test Again**

1. Register new test account
2. Check inbox (should NOT be in spam now)
3. If still in spam, repeat Steps 1-3

---

## 🔄 Alternative: Use Different Test Email

Jika Gmail sudah terlalu "trained" untuk menandai sebagai spam, gunakan email testing yang berbeda:

### **Option 1: Gmail Alias (Recommended)**

```
irfanmuria04+test1@gmail.com
irfanmuria04+test2@gmail.com
irfanmuria04+test3@gmail.com
```

Semua akan masuk ke inbox `irfanmuria04@gmail.com` tapi Gmail treat sebagai recipient berbeda.

### **Option 2: Temporary Email Services**

**For testing only** (don't use for actual users):

- https://temp-mail.org/
- https://www.guerrillamail.com/
- https://10minutemail.com/

---

## 📧 Why Gmail Marked as Spam

Looking at your screenshot:

```
From: Track Hire   irfanmuria04@gmail.com
Reply To: irfanmuria04@gmail.com    ← SHOULD BE support@track-hire.app
To: rrqirpan13@gmail.com
```

**Wait!** Reply-To shows `irfanmuria04@gmail.com` instead of `support@track-hire.app`!

This means:

- ❌ **Code not deployed** - Server still running old code
- ❌ **Server not restarted** - Changes not applied

---

## 🚨 Action Required: Restart Server

Your email.ts has correct config but server needs restart!

### **1. Stop Current Server**

```bash
# In terminal where server is running
Ctrl+C
```

### **2. Restart Server**

```bash
npm run dev
```

### **3. Verify Server Logs**

Look for:

```
✅ Email server is ready to send emails
🚀 Server running on http://localhost:3000
```

### **4. Test Again**

```bash
# Register new test account
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser999",
    "name": "Test User",
    "email": "irfanmuria04+test999@gmail.com",
    "password": "TestPass123!"
  }'
```

### **5. Check Email Headers**

Open email → Click "Show original" → Verify:

```
From: Track Hire <irfanmuria04@gmail.com>
Reply-To: support@track-hire.app    ← MUST BE THIS!
To: irfanmuria04+test999@gmail.com
```

---

## 🔍 Debug: Check Current Configuration

### **Verify .env has correct values:**

```bash
# Check SUPPORT_EMAIL
type .env | findstr SUPPORT_EMAIL
```

Expected output:

```
SUPPORT_EMAIL=support@track-hire.app
```

### **Verify env.ts loads it:**

Check `src/config/env.ts`:

```typescript
SUPPORT_EMAIL: process.env.SUPPORT_EMAIL || process.env.SMTP_USER || "",
```

### **Verify email.ts uses it:**

Check `src/utils/email.ts`:

```typescript
await transporter.sendMail({
  from: {
    name: env.SMTP_FROM_NAME,
    address: env.SMTP_USER,
  },
  replyTo: env.SUPPORT_EMAIL, // ← Must be support@track-hire.app
  // ...
});
```

---

## ✅ Expected Result After Fix

**Email Headers:**

```
From: Track Hire <irfanmuria04@gmail.com>
Reply-To: support@track-hire.app
Subject: ✅ Verify Your Email - Track Hire
```

**Gmail Inbox:**

```
✅ NOT in Spam folder
✅ In Primary inbox
✅ Reply button goes to support@track-hire.app
```

---

## 📊 Spam Score Improvement Timeline

After implementing fixes:

| Day         | Expected Result                                  |
| ----------- | ------------------------------------------------ |
| **Day 1**   | Still might go to spam (Gmail learning)          |
| **Day 2-3** | Start landing in inbox (after "Report not spam") |
| **Day 7**   | Consistent inbox placement                       |
| **Day 14+** | High sender reputation established               |

---

## 💡 Long-term Solutions

### **Option 1: Build Sender Reputation** (Current Setup)

**Pros:**

- FREE
- Gmail SMTP reliability
- Professional branding

**Cons:**

- Takes 1-2 weeks to build reputation
- Need manual "Report not spam" initially

**How to speed up:**

1. Ask 5-10 friends to register
2. They click "Report not spam"
3. Gmail learns faster

### **Option 2: Use SendGrid** (Recommended for Production)

**Pros:**

- Instant high deliverability (95%+)
- Pre-warmed IP addresses
- Email analytics
- 100 emails/day FREE

**Cons:**

- Need domain authentication (CNAME records)
- Slightly more setup

**Setup:** See [docs/setup-custom-domain-email.md](./setup-custom-domain-email.md) - Option 3

### **Option 3: Google Workspace** ($6/month)

**Pros:**

- Official `@track-hire.app` email
- Highest deliverability
- DKIM signing
- Professional inbox

**Cons:**

- Cost $6/month
- Overkill for MVP

---

## 🎯 Immediate Action Plan

**NOW (5 minutes):**

1. ✅ **Restart server** - Apply new Reply-To config
2. ✅ **Create Gmail filter** - Never send to spam
3. ✅ **Report not spam** - Train Gmail
4. ✅ **Test with alias** - Use `irfanmuria04+test@gmail.com`

**Today:**

1. ✅ **Send 5-10 test emails** - Build pattern recognition
2. ✅ **Mark all as "Not Spam"** - Train Gmail algorithm
3. ✅ **Add to contacts** - Whitelist sender

**This Week:**

1. ✅ **Monitor inbox placement** - Check spam rate
2. ✅ **Ask friends to test** - More "Not Spam" signals
3. ✅ **Consider SendGrid** - If spam persists

---

## 📝 Troubleshooting Checklist

- [ ] Server restarted after code changes
- [ ] `.env` has `SUPPORT_EMAIL=support@track-hire.app`
- [ ] Email headers show `Reply-To: support@track-hire.app`
- [ ] Created Gmail filter "Never send to spam"
- [ ] Marked previous emails as "Not Spam"
- [ ] Added sender to contacts
- [ ] Testing with new email addresses (not same one)
- [ ] Waited 24-48 hours for Gmail to learn

---

## 🔥 Quick Fix Summary

```bash
# 1. Restart server
Ctrl+C (stop)
npm run dev (start)

# 2. Test with alias
Register: irfanmuria04+newtest@gmail.com

# 3. Check email
→ Should be in inbox (or spam initially)

# 4. If in spam
→ Click "Report not spam"
→ Create Gmail filter
→ Test again with new alias

# 5. After 2-3 tests
→ Should start landing in inbox consistently
```

---

**Your configuration is CORRECT!**
Just need to:

1. **Restart server** ← Most important!
2. **Train Gmail** with "Report not spam"
3. **Create filter** for permanent fix

Give it 24-48 hours and emails will land in inbox! 🎉
