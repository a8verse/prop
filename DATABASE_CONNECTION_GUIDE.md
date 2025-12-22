# 🗄️ Database Connection Guide - Vercel to Hostinger MySQL

## Overview

Connect your Vercel deployment to your Hostinger MySQL database for real-time data.

---

## Step 1: Get Hostinger MySQL Credentials

1. **Log in to Hostinger**
   - Go to [hpanel.hostinger.com](https://hpanel.hostinger.com)
   - Log in with your credentials

2. **Go to Databases**
   - Click **Databases** → **MySQL Databases**

3. **Find Your Database**
   - Note down:
     - **Database Name**: e.g., `u123456789_property`
     - **Database Username**: e.g., `u123456789_admin`
     - **Database Password**: (your MySQL password)
     - **Database Host**: Usually `localhost` or an IP address

4. **Check External Access**
   - Some Hostinger plans allow external connections
   - Check if your plan supports it
   - If not, you may need to upgrade or use a different database provider

---

## Step 2: Test Database Connection

### Option A: Test from Local Machine

```bash
mysql -h YOUR_HOST -u YOUR_USERNAME -p YOUR_DATABASE
```

**Example:**
```bash
mysql -h mysql.hostinger.com -u u123456789_admin -p u123456789_property
```

If connection works, proceed to Step 3.

### Option B: Check Hostinger Documentation

- Some shared hosting plans **don't allow external connections**
- Check Hostinger support docs
- Contact Hostinger support if needed

---

## Step 3: Update Vercel Environment Variables

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Select your project
   - Go to **Settings** → **Environment Variables**

2. **Add/Update DATABASE_URL**

   **Format:**
   ```
   mysql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME
   ```

   **Example:**
   ```
   mysql://u123456789_admin:MyPassword123@mysql.hostinger.com:3306/u123456789_property
   ```

   **Important:**
   - Replace `USERNAME`, `PASSWORD`, `HOST`, `PORT`, `DATABASE_NAME`
   - If password has special characters, URL-encode them:
     - `@` → `%40`
     - `#` → `%23`
     - `%` → `%25`
     - `&` → `%26`
     - `+` → `%2B`
     - `=` → `%3D`
     - `?` → `%3F`
     - ` ` (space) → `%20`

3. **Select Environments**
   - Check **Production**
   - Check **Preview**
   - Check **Development** (optional)

4. **Click Save**

---

## Step 4: Update Other Environment Variables

Update these in Vercel:

### NEXTAUTH_URL
```
https://yourdomain.com
```
(Use your custom domain, or Vercel domain if not set up yet)

### NEXTAUTH_SECRET
```
swp6i8CDUYwe6tTgLGRcDT8F/v5LZ0J+SaV2l1ZF2Kk=
```
(Or generate new: `openssl rand -base64 32`)

### SMTP Settings (Optional)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
```

### OAuth Credentials (Optional)
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
```

---

## Step 5: Redeploy Application

1. **Go to Deployments**
   - Click **Deployments** tab
   - Find latest deployment
   - Click **⋯** (three dots)
   - Click **Redeploy**

2. **Wait for Deployment**
   - Build will start automatically
   - Wait 2-5 minutes
   - Check build logs for errors

---

## Step 6: Verify Database Connection

1. **Check Vercel Logs**
   - Go to **Deployments** → Latest deployment
   - Click **View Function Logs**
   - Look for database connection errors

2. **Test Website**
   - Visit your domain
   - Check if data loads:
     - Categories in menu
     - Properties
     - Slider images

3. **Test Admin Login**
   - Go to `/login/admin`
   - Try logging in
   - Check if dashboard loads

---

## Troubleshooting

### Issue 1: "Can't connect to MySQL server"

**Possible Causes:**
- Hostinger blocks external connections
- Wrong host address
- Firewall blocking port 3306

**Solutions:**
1. **Contact Hostinger Support**
   - Ask to enable external MySQL connections
   - Some shared plans don't support this

2. **Use Alternative Database Provider**
   - **PlanetScale** (MySQL-compatible, free tier)
   - **Railway** (PostgreSQL/MySQL)
   - **Supabase** (PostgreSQL)
   - **Neon** (PostgreSQL)

3. **Check Host Address**
   - Try `localhost` (if connecting from same server)
   - Try IP address from Hostinger
   - Try `mysql.hostinger.com`

### Issue 2: "Access denied for user"

**Solutions:**
- Double-check username and password
- Verify user has access to database
- Try creating new database user in Hostinger

### Issue 3: "Unknown database"

**Solutions:**
- Verify database name is correct
- Check database exists in Hostinger
- Ensure user has permissions on database

### Issue 4: "Connection timeout"

**Solutions:**
- Check if Hostinger allows external connections
- Verify firewall settings
- Try different host address

---

## Alternative: Use PlanetScale (Recommended if Hostinger Doesn't Work)

PlanetScale offers free MySQL databases with external access:

1. **Sign up**: [planetscale.com](https://planetscale.com)
2. **Create Database**: Free tier available
3. **Get Connection String**: Copy from dashboard
4. **Update DATABASE_URL** in Vercel
5. **Import Data**: Use your existing SQL export

**Benefits:**
- ✅ Free tier available
- ✅ External connections allowed
- ✅ MySQL-compatible
- ✅ Easy to use

---

## Migration Steps (If Switching Databases)

1. **Export Current Database**
   ```bash
   mysqldump -u root -p property_portal > export.sql
   ```

2. **Import to New Database**
   - Use phpMyAdmin or MySQL client
   - Import the SQL file

3. **Update DATABASE_URL** in Vercel

4. **Redeploy**

---

## Quick Checklist

- [ ] Hostinger MySQL credentials obtained
- [ ] Database connection tested (if possible)
- [ ] DATABASE_URL added to Vercel environment variables
- [ ] NEXTAUTH_URL updated to custom domain
- [ ] All environment variables configured
- [ ] Application redeployed
- [ ] Database connection verified
- [ ] Website tested with real data

---

## Next Steps After Database Connection

1. ✅ **Import Real Data**
   - Use phpMyAdmin to import your SQL export
   - Or use Prisma migrations

2. ✅ **Test All Features**
   - Admin login
   - Property listings
   - User registration
   - Email sending

3. ✅ **Monitor Performance**
   - Check Vercel logs
   - Monitor database connections
   - Optimize queries if needed

---

**Need Help?**
- Hostinger Support: Check your Hostinger dashboard
- Vercel Support: [vercel.com/support](https://vercel.com/support)
- Database Issues: Contact Hostinger about external connections


