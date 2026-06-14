# Email Best Practices - Menghindari Spam Folder

## 🎯 Implementasi Anti-Spam

### 1. **SPF, DKIM, dan DMARC Records**

Untuk menghindari spam folder, pastikan domain email Anda memiliki DNS records yang benar:

#### SPF (Sender Policy Framework)

Menentukan server mana yang boleh mengirim email atas nama domain Anda.

**Untuk Gmail:**

```
TXT Record: v=spf1 include:_spf.google.com ~all
```

#### DKIM (DomainKeys Identified Mail)

Menambahkan signature digital pada email.

**Setup di Gmail:**

1. Buka Google Admin Console
2. Apps → Google Workspace → Gmail → Authenticate email
3. Generate DKIM key
4. Add DKIM TXT record to your DNS

#### DMARC (Domain-based Message Authentication)

Policy untuk menangani email yang gagal SPF/DKIM.

```
TXT Record: v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com
```

### 2. **Email Headers (Sudah Diimplementasi)**

✅ Headers yang sudah ditambahkan:

- `X-Priority` - Email priority level
- `X-MSMail-Priority` - Microsoft mail priority
- `Importance` - Email importance
- `X-Mailer` - Sender application
- `List-Unsubscribe` - Unsubscribe link (best practice)

### 3. **Email Template Best Practices (Sudah Diimplementasi)**

✅ **HTML Email Standards:**

- Responsive design dengan media queries
- Fallback untuk email clients tanpa CSS support
- Table-based layout untuk compatibility
- Inline styles untuk Outlook/Gmail
- Preview text yang informatif
- Plain text alternative

✅ **Visual Design:**

- Professional gradient header
- Clear CTA buttons dengan hover effects
- Info boxes dan alert boxes
- Proper spacing dan typography
- Mobile-responsive layout

✅ **Content Best Practices:**

- Clear subject lines dengan emoji (✅, 🔒)
- Personalized greeting dengan nama user
- Clear call-to-action
- Security tips dan warnings
- Link fallback jika button tidak work
- Expiration time yang jelas
- Footer dengan company info

### 4. **SMTP Configuration**

✅ **Sudah dikonfigurasi:**

```typescript
{
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: true, // Secure TLS
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
}
```

### 5. **Gmail App Password Setup**

Jika menggunakan Gmail SMTP:

1. **Enable 2-Step Verification**
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select app: Mail
   - Select device: Other (Track Hire)
   - Copy the 16-character password

3. **Update .env**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-char-app-password
   ```

### 6. **Email Sending Best Practices**

#### ❌ Hindari:

- Mengirim email terlalu banyak sekaligus (rate limiting)
- Menggunakan kata-kata spam: "FREE", "CLICK HERE", "LIMITED TIME"
- All caps subject lines
- Terlalu banyak link dalam satu email
- Gambar tanpa alt text
- Email tanpa plain text alternative

#### ✅ Lakukan:

- Gunakan sender name yang jelas: "Track Hire"
- Subject line yang descriptive
- Personal greeting dengan nama
- Unsubscribe link (List-Unsubscribe header)
- Consistent sending schedule
- Monitor bounce rates dan complaints
- Clean recipient list (remove bounced emails)

### 7. **Testing Tools**

#### Mail Tester

https://www.mail-tester.com/

- Send test email ke address mereka
- Get spam score out of 10
- Get recommendations untuk improvement

#### GlockApps

https://glockapps.com/

- Test deliverability across different email providers
- Check spam scores

#### Mailtrap (Development)

https://mailtrap.io/

- Test emails in development tanpa send ke real email
- Preview email rendering

### 8. **Monitoring Email Deliverability**

Track metrics:

- **Delivery Rate**: % emails yang delivered successfully
- **Open Rate**: % emails yang di-open
- **Click Rate**: % users yang click links
- **Bounce Rate**: % emails yang bounce (hard/soft)
- **Complaint Rate**: % users yang mark as spam

**Target Metrics:**

- Delivery Rate: >95%
- Bounce Rate: <5%
- Complaint Rate: <0.1%

### 9. **Email Warm-up**

Jika menggunakan domain/IP baru:

1. **Week 1**: Send 50-100 emails/day
2. **Week 2**: Send 200-500 emails/day
3. **Week 3**: Send 1000-2000 emails/day
4. **Week 4+**: Normal volume

Ini membangun reputation dengan email providers.

### 10. **Troubleshooting Spam Issues**

#### Email masuk spam di Gmail:

1. Check SPF/DKIM/DMARC records
2. Verify sender domain reputation
3. Ask users untuk "Not spam" dan add to contacts
4. Reduce sending rate
5. Check content untuk spam triggers

#### Email tidak diterima sama sekali:

1. Check SMTP credentials
2. Verify sender email is valid
3. Check firewall/port blocking
4. Review email logs for errors
5. Check if IP/domain di-blacklist

### 11. **Blacklist Checking**

Check jika domain/IP Anda di-blacklist:

- **MXToolbox**: https://mxtoolbox.com/blacklists.aspx
- **MultiRBL**: http://multirbl.valli.org/
- **Spamhaus**: https://check.spamhaus.org/

Jika di-blacklist, request removal dari masing-masing service.

### 12. **Email Authentication Check**

Verify DNS records:

```bash
# Check SPF
nslookup -type=txt yourdomain.com

# Check DKIM
nslookup -type=txt default._domainkey.yourdomain.com

# Check DMARC
nslookup -type=txt _dmarc.yourdomain.com
```

## 📊 Implementation Checklist

- [x] Professional HTML email template
- [x] Mobile responsive design
- [x] Plain text alternative
- [x] Preview text for inbox
- [x] Clear CTA buttons
- [x] Proper email headers
- [x] List-Unsubscribe header
- [x] TLS encryption
- [x] Email verification on startup
- [ ] SPF record setup (DNS)
- [ ] DKIM record setup (DNS)
- [ ] DMARC record setup (DNS)
- [ ] Domain verification with email provider
- [ ] Email warm-up strategy
- [ ] Monitoring & analytics setup

## 🎨 Template Preview

Email template sekarang memiliki:

- ✅ Modern gradient header
- ✅ Clear typography hierarchy
- ✅ Call-to-action buttons dengan hover effects
- ✅ Info boxes dan alert boxes
- ✅ Link fallback
- ✅ Professional footer
- ✅ Mobile responsive
- ✅ Dark mode friendly colors

## 🚀 Next Steps

1. **Setup DNS Records** (SPF, DKIM, DMARC)
2. **Test dengan Mail Tester** (target score >8/10)
3. **Monitor deliverability** metrics
4. **Request users** add email to contacts
5. **Build sender reputation** gradually

## 📚 Resources

- [Gmail Bulk Sender Guidelines](https://support.google.com/mail/answer/81126)
- [Email Design Best Practices](https://www.campaignmonitor.com/resources/guides/email-design/)
- [SMTP.com Anti-Spam Guide](https://www.smtp.com/resources/email-deliverability/)
- [Litmus Email Testing](https://www.litmus.com/)
