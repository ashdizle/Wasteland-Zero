# 🎲 Wasteland Zero - Analytics & Monitoring Setup Guide

## ✅ What's Been Set Up

Your game now has complete analytics and monitoring infrastructure:

### 1. 📊 Google Analytics 4 (GA4)
- **Status:** ACTIVE
- **Measurement ID:** `G-RNSJ9FG8T3`
- **Features:**
  - Page view tracking (automatic)
  - Cookie consent banner (GDPR compliant)
  - Privacy-first approach (only loads if user consents)
- **Access:** https://analytics.google.com/

**What you'll see:**
- Real-time players
- Session duration
- Traffic sources (where players come from)
- Device breakdown (mobile vs desktop)
- Geographic data

---

### 2. 🎛️ Admin Dashboard
- **URL:** `/admin.html`
- **Password:** `wasteland2025` (change in `/app/backend/.env` → `ADMIN_PASSWORD`)

**Features:**
- 📧 Newsletter subscriber count
- 🏆 Total leaderboard entries
- 💚 System health check (API + Database)
- 🎯 Top 10 players (live stats: XP, Level, Caps, Rifts, Bosses)
- 🔗 Quick links to Stripe Dashboard and game

**Auto-refresh:** Every 30 seconds

---

### 3. 💚 Health Check Endpoint
- **URL:** `/api/health`
- **Public:** Yes (no auth required)

**Response Example:**
```json
{
  "status": "healthy",
  "services": {
    "api": "up",
    "database": "up"
  }
}
```

**Use this for:**
- UptimeRobot monitoring (get alerts when your game goes down)
- Status page integrations
- Health dashboards

**Recommended Uptime Monitoring Services:**
1. **UptimeRobot** (FREE, easiest)
   - Go to: https://uptimerobot.com
   - Create monitor: `https://YOUR-DOMAIN.com/api/health`
   - Set check interval: 5 minutes
   - Add email/SMS alerts

2. **Better Uptime** (more features)
3. **Pingdom** (enterprise)

---

### 4. 💰 Revenue Tracking
- **Current Setup:** Use Stripe Dashboard only
- **URL:** https://dashboard.stripe.com

**What you can see in Stripe:**
- Daily/weekly/monthly revenue
- Top products sold
- Customer lifetime value
- Failed payments
- Refunds & disputes

**Your Live Stripe Keys (already configured):**
- Secret Key: `sk_live_51TKimH...` (in backend/.env)
- Publishable Key: `pk_live_51TKimH...` (in backend/.env)

---

## 🔧 How to Change Admin Password

Edit `/app/backend/.env`:
```bash
ADMIN_PASSWORD="your_new_password_here"
```

Then restart backend:
```bash
sudo supervisorctl restart backend
```

---

## 📈 Recommended Monitoring Setup

### Step 1: Set Up UptimeRobot (5 minutes)
1. Sign up at https://uptimerobot.com (FREE)
2. Create new monitor:
   - Type: HTTP(s)
   - URL: `https://YOUR-DOMAIN/api/health`
   - Monitoring Interval: 5 minutes
3. Add alert contacts (email/SMS)
4. Done! You'll get alerts if your game goes down.

### Step 2: Check GA4 Daily (2 minutes/day)
1. Go to https://analytics.google.com
2. Check:
   - How many players today?
   - What's the average session time?
   - Where are players coming from?

### Step 3: Check Admin Dashboard Weekly (5 minutes/week)
1. Go to `/admin.html`
2. Login with password: `wasteland2025`
3. Review:
   - Newsletter growth
   - Leaderboard activity
   - Top players

### Step 4: Check Stripe Dashboard Weekly (5 minutes/week)
1. Go to https://dashboard.stripe.com
2. Review:
   - Revenue trends
   - Top-selling products
   - Any failed payments

---

## 🚨 What's NOT Set Up (Optional)

### Error Tracking (Sentry)
**Why?** Get notified when players encounter JavaScript errors or backend crashes.

**Setup (10 minutes):**
1. Sign up at https://sentry.io (FREE tier: 5,000 errors/month)
2. Create project: "Wasteland Zero"
3. Get your DSN (looks like: `https://abc123@sentry.io/123456`)
4. Add to frontend `/app/frontend/public/game.html`:
```html
<script src="https://browser.sentry-cdn.com/7.x/bundle.min.js"></script>
<script>
  Sentry.init({ dsn: 'YOUR_DSN_HERE' });
</script>
```
5. Add to backend `/app/backend/server.py`:
```python
import sentry_sdk
sentry_sdk.init(dsn="YOUR_DSN_HERE")
```

---

## 📊 What Metrics to Track

### Week 1-2: Launch Metrics
- **DAU (Daily Active Users):** How many unique players per day? (GA4)
- **Conversion Rate:** What % of visitors start playing? (GA4 Funnel)
- **Revenue:** How much are you making? (Stripe)

### Month 1: Engagement Metrics
- **Retention:** Do players come back tomorrow? Next week? (GA4)
- **Session Duration:** How long do players play? (GA4)
- **Leaderboard Activity:** Are players submitting scores? (Admin Dashboard)

### Month 2-3: Growth Metrics
- **Newsletter Signups:** Are you building an audience? (Admin Dashboard)
- **Top Players:** Who are your whales? (Admin Dashboard)
- **ARPPU:** Average revenue per paying user (Stripe)

---

## 🎯 Success Benchmarks (Indie Game Standards)

| Metric | Good | Great | Excellent |
|--------|------|-------|-----------|
| DAU (Week 1) | 50+ | 200+ | 500+ |
| Conversion Rate | 10% | 25% | 40% |
| Newsletter Signups | 5% | 15% | 30% |
| Revenue (Week 1) | $50+ | $200+ | $500+ |
| Session Time | 10 min | 20 min | 30+ min |

---

## 🔗 Quick Links

- **Game:** `/game.html`
- **Admin Dashboard:** `/admin.html`
- **Health Check:** `/api/health`
- **Stripe Dashboard:** https://dashboard.stripe.com
- **Google Analytics:** https://analytics.google.com

---

## 🆘 Troubleshooting

**Admin dashboard shows "Unauthorized":**
- Check password is correct: `wasteland2025`
- Password is case-sensitive

**Health check returns unhealthy:**
- Check MongoDB is running: `sudo supervisorctl status backend`
- Check backend logs: `tail -n 50 /var/log/supervisor/backend.*.log`

**GA4 not tracking:**
- Clear browser cache and reload
- Check cookie consent banner (must click "Accept")
- Check GA4 Real-time view (takes 1-2 minutes to show data)

**Admin dashboard not loading data:**
- Check browser console for errors (F12 → Console)
- Verify backend is running: `curl https://YOUR-DOMAIN/api/health`

---

## 📝 Change Log

**v1.0 (Current)**
- ✅ Google Analytics 4 with cookie consent
- ✅ Admin dashboard with stats
- ✅ Health check endpoint
- ✅ Stripe revenue tracking (dashboard only)
- ⏭️ Sentry error tracking (optional, not set up)

---

## 🚀 Next Steps

1. ✅ Set up UptimeRobot monitoring
2. ✅ Check GA4 daily for first week
3. ✅ Review admin dashboard weekly
4. ✅ Monitor Stripe for revenue trends
5. 🔜 (Optional) Add Sentry for error tracking

**Your game is now fully monitored! 🎉**
