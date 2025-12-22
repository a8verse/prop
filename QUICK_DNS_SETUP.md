# 🚀 Quick DNS Setup - Point Domain to Vercel

## Step 1: Get DNS Records from Vercel

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Log in and select your project

2. **Go to Domain Settings**
   - Click **Settings** tab
   - Click **Domains** in left sidebar
   - Find your domain in the list

3. **View DNS Configuration**
   - Click on your domain
   - Vercel will show you the DNS records you need
   - You'll see something like:

   **For Root Domain (yourdomain.com):**
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: A
   Name: @
   Value: 76.223.126.88
   ```

   **OR**

   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```

   **For www Subdomain (www.yourdomain.com):**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

---

## Step 2: Add DNS Records at Your Domain Provider

### GoDaddy

1. **Log in to GoDaddy**
   - Go to [godaddy.com](https://godaddy.com)
   - Click **Sign In**

2. **Access DNS Management**
   - Go to **My Products**
   - Find your domain
   - Click **DNS** button (or **Manage DNS**)

3. **Add A Records (for root domain)**
   - Scroll to **Records** section
   - Click **Add** button
   - Select **A** from Type dropdown
   - **Name/Host**: Enter `@` (or leave blank)
   - **Value**: Enter first IP from Vercel (e.g., `76.76.21.21`)
   - **TTL**: Leave as default (usually 600 or 1 hour)
   - Click **Save**

4. **Add Second A Record**
   - Click **Add** again
   - Select **A**
   - **Name/Host**: `@` (or leave blank)
   - **Value**: Second IP from Vercel (e.g., `76.223.126.88`)
   - **TTL**: Default
   - Click **Save**

5. **Add CNAME for www (optional)**
   - Click **Add**
   - Select **CNAME**
   - **Name/Host**: `www`
   - **Value**: `cname.vercel-dns.com`
   - **TTL**: Default
   - Click **Save**

### Namecheap

1. **Log in to Namecheap**
   - Go to [namecheap.com](https://namecheap.com)
   - Click **Sign In**

2. **Access DNS Settings**
   - Go to **Domain List**
   - Click **Manage** next to your domain
   - Go to **Advanced DNS** tab

3. **Add A Records**
   - Click **Add New Record**
   - Select **A Record**
   - **Host**: `@`
   - **Value**: First IP (e.g., `76.76.21.21`)
   - **TTL**: Automatic
   - Click **Save**

   - Repeat for second IP

4. **Add CNAME for www**
   - Click **Add New Record**
   - Select **CNAME Record**
   - **Host**: `www`
   - **Value**: `cname.vercel-dns.com`
   - **TTL**: Automatic
   - Click **Save**

### Cloudflare

1. **Log in to Cloudflare**
   - Go to [cloudflare.com](https://cloudflare.com)
   - Select your domain

2. **Go to DNS**
   - Click **DNS** in left sidebar
   - Click **Add record**

3. **Add A Records**
   - **Type**: A
   - **Name**: `@` (or your root domain)
   - **IPv4 address**: First IP from Vercel
   - **Proxy status**: DNS only (gray cloud)
   - Click **Save**

   - Repeat for second IP

4. **Add CNAME for www**
   - **Type**: CNAME
   - **Name**: `www`
   - **Target**: `cname.vercel-dns.com`
   - **Proxy status**: DNS only
   - Click **Save**

### Hostinger

1. **Log in to Hostinger**
   - Go to [hpanel.hostinger.com](https://hpanel.hostinger.com)

2. **Access DNS Zone Editor**
   - Go to **Domains** → **Manage**
   - Click **DNS / Name Servers**
   - Click **DNS Zone Editor**

3. **Add A Records**
   - Click **Add Record**
   - **Type**: A
   - **Name**: `@` (or leave blank for root)
   - **Points to**: First IP from Vercel
   - **TTL**: 3600
   - Click **Add Record**

   - Repeat for second IP

4. **Add CNAME for www**
   - **Type**: CNAME
   - **Name**: `www`
   - **Points to**: `cname.vercel-dns.com`
   - **TTL**: 3600
   - Click **Add Record**

### Other Providers

**General Steps:**
1. Find DNS Management / DNS Settings
2. Look for "Add Record" or "Create Record"
3. Add A records with IPs from Vercel
4. Add CNAME for www subdomain

---

## Step 3: Remove Conflicting Records

**Important:** Remove any existing A or CNAME records that conflict:

- ❌ Remove old A records pointing to other IPs
- ❌ Remove old CNAME records
- ❌ Remove any @ CNAME records (some providers don't allow CNAME on root)

**Keep:**
- ✅ NS (Name Server) records
- ✅ MX (Mail) records (if you use email)
- ✅ TXT records (for verification, etc.)

---

## Step 4: Verify DNS Records

### Check DNS Propagation

1. **Use DNS Checker**
   - Visit [dnschecker.org](https://dnschecker.org)
   - Enter your domain
   - Select **A Record**
   - Click **Search**
   - Should show Vercel IPs: `76.76.21.21` and `76.223.126.88`

2. **Check in Terminal**
   ```bash
   dig yourdomain.com A
   # or
   nslookup yourdomain.com
   ```

### Check Vercel Dashboard

1. **Go to Vercel → Settings → Domains**
2. **Check Status**
   - Should show **Valid Configuration** ✅
   - If shows **Invalid Configuration**, wait 5-10 minutes

---

## Step 5: Wait for Propagation

- **Time**: Usually 5-60 minutes
- **Maximum**: Can take up to 48 hours (rare)
- **Check**: Use dnschecker.org to monitor

---

## Step 6: Test Your Domain

1. **Visit Your Domain**
   - Go to `http://yourdomain.com`
   - Should redirect to `https://yourdomain.com`
   - Should show your Vercel deployment

2. **Check SSL**
   - Browser should show padlock icon 🔒
   - URL should be `https://`

3. **Test www Subdomain**
   - Visit `https://www.yourdomain.com`
   - Should also work

---

## Common Issues & Solutions

### Issue 1: "Invalid Configuration" in Vercel

**Solution:**
- Wait 10-15 minutes after adding DNS records
- Double-check DNS records match exactly
- Use dnschecker.org to verify propagation
- Remove any conflicting records

### Issue 2: Domain Not Resolving

**Solution:**
- Verify DNS records are correct
- Check TTL settings (use default or 3600)
- Wait for DNS propagation
- Clear browser cache

### Issue 3: SSL Certificate Pending

**Solution:**
- Wait 5-10 minutes after domain is verified
- Vercel automatically provisions SSL
- Check **Settings → Domains → SSL** status

### Issue 4: www Not Working

**Solution:**
- Ensure CNAME record for `www` is added
- Value should be `cname.vercel-dns.com`
- Wait for DNS propagation

---

## Quick Checklist

- [ ] Got DNS records from Vercel dashboard
- [ ] Added A records at domain provider (2 IPs)
- [ ] Added CNAME for www subdomain
- [ ] Removed conflicting DNS records
- [ ] Verified DNS propagation (dnschecker.org)
- [ ] Domain shows "Valid Configuration" in Vercel
- [ ] Website accessible at https://yourdomain.com
- [ ] SSL certificate active (padlock icon)
- [ ] www subdomain working

---

## After Domain is Working

1. **Update NEXTAUTH_URL**
   - Vercel → Settings → Environment Variables
   - Update `NEXTAUTH_URL` to `https://yourdomain.com`
   - Redeploy

2. **Update OAuth Callbacks**
   - Google OAuth: Add `https://yourdomain.com/api/auth/callback/google`
   - Facebook OAuth: Add `https://yourdomain.com/api/auth/callback/facebook`

3. **Test Everything**
   - Homepage loads
   - Admin login works
   - OAuth login works
   - All features functional

---

**Need Help?**
- Vercel Docs: [vercel.com/docs/concepts/projects/domains](https://vercel.com/docs/concepts/projects/domains)
- DNS Checker: [dnschecker.org](https://dnschecker.org)


