# 🎯 Setup Email dengan Domain track-hire.app

## Option 1: Cloudflare Email Routing (FREE - Recommended untuk Start)

### Langkah 1: Add Domain ke Cloudflare

1. **Login ke Cloudflare**: https://dash.cloudflare.com/
2. **Add Site**:
   - Klik "Add a Site"
   - Enter: `track-hire.app`
   - Select FREE plan
   - Click "Continue"

3. **Update Nameservers**:
   - Cloudflare akan kasih 2 nameservers
   - Contoh:
     ```
     aron.ns.cloudflare.com
     luna.ns.cloudflare.com
     ```
   - Copy nameservers tersebut

4. **Update di Domain Registrar**:
   - Login ke tempat Anda beli domain (Namecheap/Google Domains/dll)
   - Find "DNS Settings" atau "Nameservers"
   - Replace dengan Cloudflare nameservers
   - Save changes
   - **Wait 24-48 hours** (biasanya 1-2 jam saja)

### Langkah 2: Setup Email Routing

1. **Di Cloudflare Dashboard**:
   - Select domain `track-hire.app`
   - Go to **Email** → **Email Routing**
   - Click **Get started**

2. **Enable Email Routing**:
   - Click **Enable Email Routing**
   - Cloudflare akan auto-add DNS records

3. **Add Destination Address**:
   - Click **Destination addresses**
   - Click **Add destination address**
   - Enter: `irfanmuria04@gmail.com`
   - Click **Send verification email**
   - Check Gmail dan verify

4. **Create Routing Rule**:
   - Go to **Routing rules**
   - Click **Create address**
   - **Custom address**: `noreply`
   - **Action**: Forward to `irfanmuria04@gmail.com`
   - Click **Save**

✅ **Done!** Email ke `noreply@track-hire.app` akan forward ke Gmail Anda.

### Langkah 3: Setup SMTP untuk Sending

Karena Cloudflare Email Routing hanya untuk **receiving**, kita tetap pakai Gmail SMTP untuk **sending**, tapi dengan sender address custom.

**Update `.env`:**

```env
# Email (SMTP) - Using Gmail with custom sender
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=irfanmuria04@gmail.com
SMTP_PASS=rqrwpbysujrzhjto

# Custom sender address (for display)
SMTP_FROM_NAME=Track Hire
SMTP_FROM_EMAIL=noreply@track-hire.app
```

### Langkah 4: Update Code

Buat env variable baru di `src/config/env.ts`:

```typescript
export const env = {
  // ... existing config

  SMTP_HOST: requireEnv("SMTP_HOST"),
  SMTP_PORT: Number(requireEnv("SMTP_PORT")),
  SMTP_USER: requireEnv("SMTP_USER"),
  SMTP_PASS: requireEnv("SMTP_PASS"),

  // NEW: Custom sender
  SMTP_FROM_NAME: process.env.SMTP_FROM_NAME || "Track Hire",
  SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,

  // ... rest of config
};
```

Update `src/utils/email.ts`:

```typescript
// In sendVerificationEmail function
await transporter.sendMail({
  from: {
    name: env.SMTP_FROM_NAME,
    address: env.SMTP_FROM_EMAIL, // noreply@track-hire.app
  },
  replyTo: env.SMTP_USER, // irfanmuria04@gmail.com (for replies)
  to,
  subject: "✅ Verify Your Email - Track Hire",
  html,
  // ... rest
});
```

### Langkah 5: Add DNS Records untuk Deliverability

Di Cloudflare DNS, add these records:

#### **1. SPF Record**

```
Type: TXT
Name: @
Content: v=spf1 include:_spf.google.com include:_spf.mx.cloudflare.net ~all
TTL: Auto
```

#### **2. DMARC Record**

```
Type: TXT
Name: _dmarc
Content: v=DMARC1; p=quarantine; rua=mailto:irfanmuria04@gmail.com
TTL: Auto
```

#### **3. DKIM Record** (Optional tapi recommended)

**Untuk Gmail DKIM**, perlu Google Workspace. Atau skip untuk sekarang, SPF + DMARC sudah cukup bagus.

### Langkah 6: Test Email

1. Restart backend server
2. Register new account
3. Check email
4. ✅ Sender sekarang: `Track Hire <noreply@track-hire.app>`
5. ✅ Reply akan ke: `irfanmuria04@gmail.com`

### Verify DNS Records

Check if DNS sudah propagate:

```bash
# Check SPF
nslookup -type=txt track-hire.app

# Check DMARC
nslookup -type=txt _dmarc.track-hire.app

# Check Email Routing
nslookup -type=mx track-hire.app
```

---

## Option 2: Google Workspace ($6/month)

Jika mau email inbox sendiri + DKIM support:

### Setup:

1. **Sign up Google Workspace**:
   - https://workspace.google.com/
   - Select Business Starter ($6/user/month)

2. **Add Domain**:
   - Enter `track-hire.app`
   - Verify ownership (add TXT record)

3. **Create Email**:
   - Create: `noreply@track-hire.app`
   - Set password

4. **Setup DNS**:
   - Google akan auto-generate MX records
   - Copy ke Cloudflare DNS

5. **Setup DKIM**:
   - Google Admin → Apps → Gmail → Authenticate email
   - Generate DKIM key
   - Add TXT record ke DNS

6. **Update `.env`**:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@track-hire.app
SMTP_PASS=<app-password>
SMTP_FROM_NAME=Track Hire
SMTP_FROM_EMAIL=noreply@track-hire.app
```

**Benefit:**

- ✅ Dedicated inbox
- ✅ DKIM support
- ✅ Higher deliverability
- ✅ Professional

---

## Option 3: SendGrid (FREE tier)

Jika mau 100% professional email sending:

### Setup:

1. **Sign up**: https://sendgrid.com/
2. **Verify Email**: Verify irfanmuria04@gmail.com
3. **Add Domain**:
   - Settings → Sender Authentication
   - Click "Authenticate Your Domain"
   - Select "DNS Host: Cloudflare"
   - Enter: `track-hire.app`
   - Click "Next"

4. **Add DNS Records**:
   SendGrid akan kasih 3 CNAME records, add ke Cloudflare:

   ```
   Type: CNAME
   Name: s1._domainkey
   Content: s1.domainkey.u1234567.wl123.sendgrid.net

   Type: CNAME
   Name: s2._domainkey
   Content: s2.domainkey.u1234567.wl123.sendgrid.net

   Type: CNAME
   Name: em1234
   Content: u1234567.wl123.sendgrid.net
   ```

5. **Install SDK**:

```bash
npm install @sendgrid/mail
```

6. **Update Code**:

```typescript
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendVerificationEmail = async ({
  to,
  name,
  token,
}: SendEmailParams): Promise<void> => {
  const verifyUrl = `${env.CLIENT_URL}/verify-email?token=${token}`;
  const html = createEmailTemplate(/* ... */);

  await sgMail.send({
    to,
    from: {
      name: "Track Hire",
      email: "noreply@track-hire.app",
    },
    subject: "✅ Verify Your Email - Track Hire",
    html,
  });
};
```

**Benefit:**

- ✅ 98%+ inbox rate
- ✅ Email analytics
- ✅ Bounce handling
- ✅ Free 100 emails/day

---

## Recommendation

**For Development (Now):**
→ Use **Option 1 (Cloudflare Email Routing)**

- FREE
- Easy setup
- Good enough untuk testing

**For Production (Later):**
→ Use **Option 3 (SendGrid)**

- Professional
- Analytics
- Best deliverability

**For Enterprise:**
→ Use **Option 2 (Google Workspace) + SendGrid**

- Dedicated inbox
- DKIM support
- Professional sender

---

## Timeline

**Setup Cloudflare Email (Option 1):**

- Domain nameservers: 1-24 hours
- Email routing: 5 minutes
- DNS records: 10 minutes
- Code update: 5 minutes
- **Total: ~2 hours** (mostly waiting for DNS)

**Setup SendGrid (Option 3):**

- Account setup: 5 minutes
- Domain authentication: 10 minutes
- DNS propagation: 1-24 hours
- Code integration: 15 minutes
- **Total: ~2 hours**

---

## Testing

After setup, test dengan:

1. **Mail Tester**: https://www.mail-tester.com/
   - Should score 8-10/10

2. **MXToolbox**: https://mxtoolbox.com/
   - Check DNS records

3. **Send Test Email**:
   - Register new account
   - Check inbox (not spam!)

---

## Troubleshooting

**Email still goes to spam:**

- Wait 24-48 hours for DNS propagation
- Check SPF/DMARC records
- Build sending reputation (send gradually)

**DNS not updating:**

- Check nameservers pointing to Cloudflare
- Wait up to 48 hours
- Clear DNS cache: `ipconfig /flushdns`

**SendGrid domain not verified:**

- Check all 3 CNAME records added
- Wait for DNS propagation
- Click "Verify" in SendGrid dashboard

---

Pilih option mana yang mau Anda pakai? 😊
