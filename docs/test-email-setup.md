# 🧪 Test Email Setup - Quick Guide

## ✅ Prerequisites

Pastikan sudah setup:

- ✅ Gmail SMTP credentials in `.env`
- ✅ Cloudflare Email Routing for `support@track-hire.app`
- ✅ Domain `track-hire.app` nameservers pointing to Cloudflare

---

## 🚀 Quick Test (5 Minutes)

### **1. Start Development Server**

```bash
# Start dependencies (Redis + RabbitMQ)
docker-compose -f docker-compose.dev.yml up -d

# Start backend server
npm run dev
```

✅ **Expected output:**

```
✅ Email server is ready to send emails
🚀 Server running on http://localhost:3000
```

### **2. Test Email Sending**

#### **Option A: Register New Account (Frontend)**

1. Open frontend: `http://localhost:5173`
2. Click **Sign Up**
3. Fill form:
   ```
   Username: testuser123
   Name: Test User
   Email: your-test-email@gmail.com
   Password: TestPass123!
   ```
4. Click **Register**
5. **Check inbox** (your-test-email@gmail.com)

✅ **Expected result:**

```
From: Track Hire <irfanmuria04@gmail.com>
Subject: ✅ Verify Your Email - Track Hire

[Beautiful HTML email with purple gradient]
```

#### **Option B: API Test (Postman/cURL)**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser123",
    "name": "Test User",
    "email": "your-test-email@gmail.com",
    "password": "TestPass123!"
  }'
```

✅ **Expected response:**

```json
{
  "message": "Registration successful. Please check your email to verify your account."
}
```

---

## 📧 Email Appearance Test

### **What to Check:**

#### **1. Sender Information**

```
✅ From: Track Hire <irfanmuria04@gmail.com>
✅ Reply-To: support@track-hire.app
✅ Subject: ✅ Verify Your Email - Track Hire
```

#### **2. Email Design**

```
✅ Purple gradient header
✅ "Track Hire" logo centered
✅ "Your Job Application Tracker" tagline
✅ Clear email title: "Verify Your Email Address"
✅ Personalized greeting: "Hi [Name]"
✅ Welcome message with emoji 🎉
✅ Large purple gradient button: "Verify My Email"
✅ Blue info box: "Why verify?"
✅ Yellow alert box: "⏰ This link expires in 24 hours"
✅ Link fallback section
✅ Professional footer with copyright
```

#### **3. Mobile Responsive**

```
✅ Open email on phone
✅ Text is readable (not too small)
✅ Button is tappable
✅ Layout adjusts to screen size
✅ No horizontal scrolling
```

#### **4. Link Functionality**

```
✅ Click "Verify My Email" button
✅ Redirects to: http://localhost:5173/verify-email?token=...
✅ Frontend shows verification page
```

---

## 🔄 Test Reply Functionality

### **1. Reply to Verification Email**

1. Open verification email in Gmail
2. Click **Reply** button
3. ✅ **Check recipient:** Should show `support@track-hire.app`
4. Type test message: "Testing reply functionality"
5. Click **Send**

### **2. Check Cloudflare Forwarding**

1. Wait 10-30 seconds
2. Check inbox: `irfanmuria04@gmail.com`
3. ✅ **Expected:** Forwarded email from Cloudflare

   ```
   From: your-test-email@gmail.com
   To: support@track-hire.app
   Subject: Re: Verify Your Email - Track Hire

   [Your test message]
   ```

---

## 📊 Test Spam Score

### **Using Mail-Tester**

1. Go to: https://www.mail-tester.com/
2. Copy the temporary email address shown (e.g., test-abc123@mail-tester.com)
3. Create test account with that email:
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "username": "spamtest",
       "name": "Spam Test",
       "email": "test-abc123@mail-tester.com",
       "password": "TestPass123!"
     }'
   ```
4. Go back to mail-tester.com
5. Click **"Then check your score"**
6. ✅ **Expected score:** 8-10/10

### **What Affects Score:**

✅ **Good factors:**

- Gmail SMTP (high reputation)
- Proper SPF record
- Professional HTML
- Valid email headers
- No spam trigger words

❌ **Bad factors (if any):**

- Missing DMARC record
- No DKIM signature
- Broken links
- Spam trigger words

---

## 🧪 Test All Email Types

### **1. Email Verification**

```bash
# Already tested above ✅
POST /api/auth/register
```

### **2. Password Reset**

```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-test-email@gmail.com"
  }'
```

✅ **Check inbox for:**

```
From: Track Hire <irfanmuria04@gmail.com>
Subject: 🔒 Reset Your Password - Track Hire

[Beautiful HTML email]
Button: "Reset My Password"
Alert: "⏰ This link expires in 1 hour"
```

---

## 🔍 Troubleshooting

### **Problem: Email not received**

**Check:**

1. ✅ Server logs for errors

   ```bash
   # Look for:
   ❌ Email transporter verification failed
   # OR
   ✅ Email server is ready to send emails
   ```

2. ✅ Gmail SMTP credentials in `.env`

   ```env
   SMTP_USER=irfanmuria04@gmail.com
   SMTP_PASS=rqrwpbysujrzhjto
   ```

3. ✅ Check spam folder

4. ✅ Gmail app password still valid
   - Go to: https://myaccount.google.com/apppasswords
   - Verify password: `rqrwpbysujrzhjto`

### **Problem: Email goes to spam**

**Solutions:**

1. ✅ Add sender to contacts: `irfanmuria04@gmail.com`
2. ✅ Check SPF record:

   ```bash
   nslookup -type=txt track-hire.app
   ```

   Should show: `v=spf1 include:_spf.google.com ~all`

3. ✅ Wait 24-48 hours for sender reputation to build
4. ✅ Test with mail-tester.com (see above)

### **Problem: Reply-To not working**

**Check:**

1. ✅ Cloudflare Email Routing enabled
2. ✅ Routing rule created: `support@track-hire.app → irfanmuria04@gmail.com`
3. ✅ Destination email verified in Cloudflare
4. ✅ MX record points to: `route.mx.cloudflare.net`

**Test:**

```bash
# Send direct email to custom domain
# From any email service, send to: support@track-hire.app
# Check if received at: irfanmuria04@gmail.com
```

### **Problem: Button not working**

**Check:**

1. ✅ Email client: Some block buttons (use link fallback)
2. ✅ Click link in "Link fallback" section instead
3. ✅ Copy-paste URL directly to browser

### **Problem: Email looks broken**

**Check:**

1. ✅ Email client: Some clients have limited CSS support
2. ✅ Test in different clients:
   - Gmail web ✅
   - Gmail mobile app ✅
   - Outlook web ✅
   - Apple Mail ✅

---

## ✅ Success Checklist

After testing, you should have:

### **Sending Email**

- ✅ Emails sent successfully
- ✅ Sender shows: "Track Hire"
- ✅ Professional HTML design
- ✅ Purple gradient header
- ✅ Buttons working
- ✅ Links working
- ✅ Mobile responsive

### **Receiving Replies**

- ✅ Reply-To shows: support@track-hire.app
- ✅ Replies forwarded to Gmail
- ✅ Received within 30 seconds
- ✅ Original subject preserved

### **Deliverability**

- ✅ Not in spam folder
- ✅ Mail-tester score 8+/10
- ✅ All links working
- ✅ Images loading

### **Professional Appearance**

- ✅ Company name visible
- ✅ Custom domain for replies
- ✅ Consistent branding
- ✅ Modern design

---

## 📝 Test Results Template

**Date:** **\*\***\_\_\_**\*\***
**Tester:** **\*\***\_\_\_**\*\***

### **Test 1: Verification Email**

- [ ] Email received
- [ ] Sender correct: Track Hire <irfanmuria04@gmail.com>
- [ ] Subject correct: ✅ Verify Your Email - Track Hire
- [ ] HTML design looks good
- [ ] Button works
- [ ] Not in spam

### **Test 2: Password Reset Email**

- [ ] Email received
- [ ] Sender correct
- [ ] Subject correct: 🔒 Reset Your Password - Track Hire
- [ ] HTML design looks good
- [ ] Button works
- [ ] Not in spam

### **Test 3: Reply Functionality**

- [ ] Reply-To shows: support@track-hire.app
- [ ] Reply received at: irfanmuria04@gmail.com
- [ ] Forwarding works correctly

### **Test 4: Spam Score**

- [ ] Mail-tester score: \_\_\_/10
- [ ] SPF record found
- [ ] No critical issues

### **Test 5: Mobile Responsive**

- [ ] Tested on phone
- [ ] Layout adjusts correctly
- [ ] Text readable
- [ ] Button tappable

### **Overall Result:**

- [ ] ✅ All tests passed - Ready for production!
- [ ] ⚠️ Some issues - See notes below
- [ ] ❌ Major issues - Need fixes

**Notes:**

---

---

---

---

## 🎯 Expected Results Summary

| Test                        | Expected Result                 | Time      |
| --------------------------- | ------------------------------- | --------- |
| **Send verification email** | Received in inbox, not spam     | 1-2 min   |
| **Email appearance**        | Beautiful HTML, purple gradient | Immediate |
| **Button click**            | Redirects to verify page        | Immediate |
| **Reply functionality**     | Reply to support@track-hire.app | Immediate |
| **Cloudflare forwarding**   | Received in Gmail               | 10-30 sec |
| **Spam score**              | 8-10/10 on mail-tester          | 1-2 min   |
| **Mobile view**             | Responsive, readable            | Immediate |

---

## 🚀 Ready for Production?

If all tests pass:

- ✅ Email sending works
- ✅ Design looks professional
- ✅ Reply routing works
- ✅ Spam score good
- ✅ Mobile responsive

**Then you're ready to deploy!** 🎉

---

## 📚 Related Documentation

- `GMAIL-CUSTOM-DOMAIN-SETUP.md` - Setup strategy
- `docs/final-email-setup-summary.md` - Complete summary
- `docs/email-best-practices.md` - Best practices
- `docs/for-users-email-whitelist.md` - User instructions

---

**Happy testing!** 🧪✨
