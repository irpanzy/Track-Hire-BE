# 🚀 Quick Setup: Custom Domain Email (track-hire.app)

## ✅ Anda sudah punya: `track-hire.app`

Sekarang setup email `noreply@track-hire.app` untuk menghindari spam!

---

## 📋 Pilih Method Setup:

### **Method 1: Cloudflare Email Routing (FREE)** ⭐ Recommended untuk Start

**Time:** 2 hours (mostly waiting DNS)  
**Cost:** FREE  
**Benefit:** Email ke `noreply@track-hire.app` forward ke Gmail Anda

#### Steps:

1. **Add Domain ke Cloudflare**
   - Login: https://dash.cloudflare.com/
   - Add Site → `track-hire.app`
   - Select FREE plan
   - Copy nameservers yang diberikan

2. **Update Nameservers di Domain Registrar**
   - Login ke tempat beli domain
   - DNS Settings → Custom Nameservers
   - Paste Cloudflare nameservers
   - Save & wait 1-24 hours

3. **Setup Email Routing (after DNS active)**
   - Cloudflare → Email → Email Routing
   - Enable Email Routing
   - Add destination: `irfanmuria04@gmail.com`
   - Verify email
   - Create rule: `noreply` → forward to Gmail

4. **Add DNS Records**

   ```
   Type: TXT | Name: @ | Content: v=spf1 include:_spf.google.com include:_spf.mx.cloudflare.net ~all

   Type: TXT | Name: _dmarc | Content: v=DMARC1; p=quarantine; rua=mailto:irfanmuria04@gmail.com
   ```

5. **Update `.env`**

   ```env
   # Uncomment these lines:
   SMTP_FROM_NAME=Track Hire
   SMTP_FROM_EMAIL=noreply@track-hire.app
   ```

6. **Restart Server**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

✅ **Done!** Email sekarang dikirim dari `noreply@track-hire.app`

---

### **Method 2: Google Workspace** ($6/month)

**Time:** 1 hour  
**Cost:** $6/month/user  
**Benefit:** Dedicated inbox + DKIM support

#### Steps:

1. **Sign up Google Workspace**
   - https://workspace.google.com/
   - Business Starter plan
   - Enter domain: `track-hire.app`

2. **Verify Domain**
   - Add TXT record ke DNS
   - Wait for verification

3. **Create Email**
   - Create: `noreply@track-hire.app`
   - Generate App Password

4. **Setup DKIM** (in Google Admin)
   - Apps → Gmail → Authenticate email
   - Generate DKIM
   - Add TXT record to DNS

5. **Update `.env`**
   ```env
   SMTP_USER=noreply@track-hire.app
   SMTP_PASS=<app-password-from-google>
   SMTP_FROM_NAME=Track Hire
   SMTP_FROM_EMAIL=noreply@track-hire.app
   ```

✅ **Done!** Professional email dengan DKIM!

---

### **Method 3: SendGrid** (FREE tier)

**Time:** 1 hour  
**Cost:** FREE (100 emails/day)  
**Benefit:** 98%+ deliverability + Analytics

#### Steps:

1. **Sign up**: https://sendgrid.com/

2. **Domain Authentication**
   - Settings → Sender Authentication
   - Authenticate Your Domain
   - Enter: `track-hire.app`
   - Add 3 CNAME records ke DNS

3. **Get API Key**
   - Settings → API Keys
   - Create API Key
   - Copy key

4. **Install SDK**

   ```bash
   npm install @sendgrid/mail
   ```

5. **Update Code** (see `docs/setup-custom-domain-email.md`)

✅ **Done!** Professional email sending!

---

## 🎯 Recommendation

**Sekarang (untuk development):**
→ Use **Method 1 (Cloudflare)** - FREE dan mudah

**Nanti (untuk production):**
→ Use **Method 3 (SendGrid)** - Professional analytics

---

## 📝 Current Status Check

Before setup, email dikirim dari:

```
From: Track Hire <irfanmuria04@gmail.com>
❌ Personal Gmail
❌ Might go to spam
```

After setup, email akan dikirim dari:

```
From: Track Hire <noreply@track-hire.app>
✅ Professional domain
✅ Better deliverability
✅ Less spam
Reply-To: irfanmuria04@gmail.com
✅ Replies still go to your Gmail
```

---

## ⚡ Quick Start (Cloudflare Method)

**Hari Ini:**

1. ✅ Login Cloudflare
2. ✅ Add domain track-hire.app
3. ✅ Copy nameservers
4. ✅ Update di domain registrar
5. ⏳ Wait for DNS (1-24 hours)

**Besok (setelah DNS active):**

1. ✅ Setup Email Routing
2. ✅ Add DNS records (SPF, DMARC)
3. ✅ Update `.env`
4. ✅ Test!

---

## 🧪 Testing

After setup, test dengan:

```bash
# 1. Register new account
# 2. Check email
# 3. Verify sender: noreply@track-hire.app
# 4. Check inbox (not spam!)
```

Test deliverability:

- **Mail Tester**: https://www.mail-tester.com/
- Target score: 8-10/10

---

## 📚 Full Documentation

Lihat: `docs/setup-custom-domain-email.md` untuk detail lengkap

---

## ❓ FAQ

**Q: Berapa lama DNS propagation?**
A: 1-24 jam (biasanya 1-2 jam)

**Q: Apakah email lama (irfanmuria04@gmail.com) masih bisa dipakai?**
A: Ya! Bisa pakai 2-2nya:

- Development: Gmail langsung
- Production: track-hire.app

**Q: Apa bedanya dengan Gmail biasa?**
A:

- Professional sender address
- Better spam score
- Domain reputation
- Custom branding

**Q: Kalau pakai Cloudflare, bisa terima email?**
A: Ya! Auto-forward ke Gmail

**Q: Perlu hosting email?**
A: Tidak! Cloudflare Email Routing gratis

---

Ready to setup? Start dengan Method 1 (Cloudflare)! 🚀
