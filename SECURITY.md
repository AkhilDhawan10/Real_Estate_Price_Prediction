# 🔒 Security Documentation

## Security Improvements Implemented

### ✅ 1. Environment Variables Protection
**Status:** Secured

- `.env` files added to `.gitignore` (never commit these!)
- Created `.env.example` template
- Strong JWT secrets required for production
- MongoDB URI validation in production mode

**Action Required Before Deployment:**
```bash
# Generate strong JWT secrets:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Copy output to JWT_SECRET

node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Copy output to JWT_REFRESH_SECRET
```

### ✅ 2. CORS Configuration
**Status:** Secured

- Whitelist-based CORS instead of `*` (all origins)
- Configurable via `ALLOWED_ORIGINS` environment variable
- Credentials enabled
- Specific HTTP methods allowed

**Production Setup:**
```env
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### ✅ 3. Security Headers (Helmet)
**Status:** Implemented

- Content Security Policy (CSP)
- HSTS (HTTP Strict Transport Security)
- X-Frame-Options
- X-Content-Type-Options
- And more...

### ✅ 4. Rate Limiting
**Status:** Implemented

Two levels of protection:
- **General API:** 100 requests per 15 minutes per IP
- **Auth Endpoints:** 5 login/register attempts per 15 minutes per IP

### ✅ 5. Authentication & Authorization
**Status:** Secure

- JWT token-based authentication
- Refresh token mechanism
- Role-based access control (admin/broker)
- bcrypt password hashing (10 rounds)
- Admin routes protected with `requireAdmin` middleware
- Subscription routes protected with `requireActiveSubscription` middleware

### ✅ 6. Input Validation & Sanitization
**Status:** Implemented

- Express-validator on auth routes
- NoSQL injection prevention in search queries
- File upload validation (type, size)
- Query parameter sanitization

### ✅ 7. Logging Security
**Status:** Secured

- Sensitive data removed from logs (tokens, passwords, secrets)
- Development-only detailed logging
- Production logs minimized

### ✅ 8. Database Security
**Status:** Secure

- Passwords excluded from queries (`select: false`)
- Indexes on sensitive fields
- Active user checking
- Input sanitization prevents NoSQL injection

---

## Pre-Deployment Checklist

### 🔴 Critical (Must Do Before Production)

- [ ] **Generate Strong JWT Secrets**
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
  Update `JWT_SECRET` and `JWT_REFRESH_SECRET` in production `.env`

- [ ] **Change Admin Password**
  Set a strong `ADMIN_PASSWORD` in production `.env` (min 12 characters, mixed case, numbers, symbols)

- [ ] **Update CORS Origins**
  Set `ALLOWED_ORIGINS` to your production domain(s) only

- [ ] **Set NODE_ENV=production**
  Ensures production optimizations and security features

- [ ] **Use MongoDB Atlas or Secure MongoDB**
  Don't use default MongoDB without authentication in production

- [ ] **Configure Razorpay Live Keys**
  Switch from test mode to live mode keys

- [ ] **Remove .env from Git History** (if already committed)
  ```bash
  git filter-branch --force --index-filter \
    "git rm --cached --ignore-unmatch server/.env" \
    --prune-empty --tag-name-filter cat -- --all
  ```

### 🟡 Important (Recommended)

- [ ] **Setup SSL/TLS (HTTPS)**
  Use services like Let's Encrypt, Cloudflare, or your hosting provider

- [ ] **Enable MongoDB Authentication**
  Don't allow connections without credentials

- [ ] **Implement Logging Service**
  Use services like Sentry, LogRocket, or CloudWatch for production monitoring

- [ ] **Setup Backup Strategy**
  Automated MongoDB backups

- [ ] **Add Health Check Endpoint Monitoring**
  Use UptimeRobot, Pingdom, or similar

- [ ] **Review and Remove Debug Code**
  Search for `console.log`, `console.error` in production build

- [ ] **Implement API Versioning**
  Future-proof your API (e.g., `/api/v1/...`)

### 🟢 Nice to Have

- [ ] **Add API Documentation** (Swagger/OpenAPI)
- [ ] **Implement Request ID Tracing**
- [ ] **Add Performance Monitoring** (New Relic, Datadog)
- [ ] **Setup CI/CD Pipeline** with automated security checks
- [ ] **Add Dependency Vulnerability Scanning** (`npm audit`, Snyk)
- [ ] **Implement Session Management** with Redis
- [ ] **Add Two-Factor Authentication (2FA)** for admin accounts
- [ ] **Setup WAF (Web Application Firewall)** via Cloudflare

---

## Environment Variables Reference

### Required in Production

| Variable | Purpose | Example |
|----------|---------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | Database connection | `mongodb+srv://...` |
| `JWT_SECRET` | JWT signing secret | 64-char random string |
| `JWT_REFRESH_SECRET` | Refresh token secret | 64-char random string |
| `ALLOWED_ORIGINS` | CORS whitelist | `https://yourdomain.com` |
| `RAZORPAY_KEY_ID` | Payment gateway key | `rzp_live_...` |
| `RAZORPAY_KEY_SECRET` | Payment gateway secret | `...` |
| `ADMIN_EMAIL` | Admin account email | `admin@yourdomain.com` |
| `ADMIN_PASSWORD` | Admin account password | Strong password |

### Optional

| Variable | Default | Purpose |
|----------|---------|---------|
| `JWT_EXPIRES_IN` | `7d` | Access token lifetime |
| `JWT_REFRESH_EXPIRES_IN` | `30d` | Refresh token lifetime |
| `ADMIN_PHONE` | `+911234567890` | Admin phone number |

---

## Security Best Practices

### For Developers

1. **Never commit `.env` files** to version control
2. **Use environment-specific configuration** (dev, staging, prod)
3. **Rotate secrets regularly** (every 90 days)
4. **Review dependencies** for vulnerabilities: `npm audit`
5. **Keep dependencies updated** but test thoroughly
6. **Use HTTPS everywhere** in production
7. **Validate and sanitize all user input**
8. **Follow principle of least privilege** for database access
9. **Log security events** (failed logins, unauthorized access attempts)
10. **Test security** with tools like OWASP ZAP

### For Deployment

1. **Use separate databases** for dev/staging/production
2. **Enable MongoDB authentication** and use strong passwords
3. **Configure firewall rules** to restrict database access
4. **Use environment variables** for all sensitive configuration
5. **Enable audit logging** on database
6. **Setup automated backups** with point-in-time recovery
7. **Monitor server resources** and set up alerts
8. **Implement rate limiting** at infrastructure level (CDN/Load Balancer)
9. **Use container scanning** if using Docker
10. **Regular security audits** and penetration testing

### For Users

1. **Strong password policy**: Minimum 8 characters, mixed case, numbers
2. **Regular password rotation** for admin accounts
3. **Monitor access logs** for suspicious activity
4. **Keep admin access restricted** to trusted IPs if possible
5. **Review user permissions** regularly

---

## Security Vulnerabilities Fixed

### 1. Exposed Credentials ⚠️ → ✅
**Before:** JWT secrets, admin password, API keys in git history  
**After:** Removed from git, using strong random secrets, .env in .gitignore

### 2. Open CORS Policy ⚠️ → ✅
**Before:** `app.use(cors())` allowed all origins  
**After:** Whitelist-based CORS with specific origins

### 3. Missing Security Headers ⚠️ → ✅
**Before:** No security headers  
**After:** Helmet with CSP, HSTS, and other protections

### 4. No Rate Limiting ⚠️ → ✅
**Before:** Unlimited login attempts (brute-force vulnerability)  
**After:** 5 attempts per 15 minutes on auth endpoints

### 5. Verbose Logging ⚠️ → ✅
**Before:** Tokens, secrets, and user data logged in production  
**After:** Development-only detailed logging

### 6. NoSQL Injection Risk ⚠️ → ✅
**Before:** Direct use of query parameters in MongoDB queries  
**After:** Input sanitization and validation

### 7. Missing Input Validation ⚠️ → ✅
**Before:** Limited validation on endpoints  
**After:** express-validator on auth, sanitization on search

### 8. Weak Default Secrets ⚠️ → ✅
**Before:** Fallback to 'secret' if env var missing  
**After:** Production check requires strong secrets

---

## Testing Security

### Manual Testing

1. **Test Rate Limiting**
   ```bash
   # Should block after 5 attempts
   for i in {1..10}; do
     curl -X POST http://localhost:5000/api/auth/login \
       -H "Content-Type: application/json" \
       -d '{"email":"test@test.com","password":"wrong"}'
   done
   ```

2. **Test CORS**
   ```bash
   # Should fail with origin not allowed
   curl -X GET http://localhost:5000/api/properties/search \
     -H "Origin: https://malicious-site.com"
   ```

3. **Test Authentication**
   ```bash
   # Should return 401
   curl -X GET http://localhost:5000/api/properties/search
   ```

4. **Test Admin Access**
   ```bash
   # Broker token should fail on admin endpoints
   curl -X GET http://localhost:5000/api/admin/users \
     -H "Authorization: Bearer <broker_token>"
   ```

### Automated Security Scanning

```bash
# Check for dependency vulnerabilities
cd server && npm audit

# Check for outdated packages
npm outdated

# Fix vulnerabilities
npm audit fix
```

---

## Incident Response Plan

If a security breach occurs:

1. **Immediate Actions**
   - [ ] Rotate all JWT secrets immediately
   - [ ] Force logout all users (tokens invalidated)
   - [ ] Change admin password
   - [ ] Review access logs for suspicious activity
   - [ ] Disable affected accounts

2. **Investigation**
   - [ ] Check MongoDB audit logs
   - [ ] Review application logs
   - [ ] Identify attack vector
   - [ ] Assess data exposure

3. **Recovery**
   - [ ] Patch vulnerability
   - [ ] Restore from backup if necessary
   - [ ] Update security measures
   - [ ] Notify affected users (if personal data exposed)

4. **Post-Incident**
   - [ ] Document incident and response
   - [ ] Update security procedures
   - [ ] Train team on lessons learned
   - [ ] Consider security audit

---

## Contact & Support

For security concerns or to report vulnerabilities:
- **Email:** security@propertybroker.com (create this)
- **Response Time:** Within 24 hours
- **Bug Bounty:** Consider implementing

---

## Compliance Notes

Depending on your jurisdiction and user base, you may need to comply with:

- **GDPR** (EU users): Data protection, right to deletion, consent
- **DPDPA** (India): Data protection and privacy
- **PCI DSS** (if handling cards): Payment card security standards
- **SOC 2** (Enterprise customers): Security and availability standards

Consult with legal counsel for specific requirements.

---

*Last Updated: January 2026*
*Next Review: Every 3 months or after major releases*
