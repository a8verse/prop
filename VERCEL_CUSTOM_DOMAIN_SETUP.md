# 🌐 Vercel Custom Domain Setup Guide

## Step-by-Step: Map Your Custom Domain to Vercel

### Prerequisites
- ✅ Vercel account with deployed project
- ✅ Custom domain purchased (e.g., from GoDaddy, Namecheap, etc.)
- ✅ Access to your domain's DNS settings

---

## Step 1: Add Domain in Vercel Dashboard

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Log in to your account

2. **Select Your Project**
   - Click on your project (`prop` or `property-portal`)

3. **Go to Settings**
   - Click **Settings** tab
   - Click **Domains** in the left sidebar

4. **Add Domain**
   - Click **Add** or **Add Domain** button
   - Enter your domain (e.g., `yourdomain.com`)
   - Click **Add**

5. **Add Subdomain (Optional)**
   - For `www` subdomain: Add `www.yourdomain.com`
   - Vercel will automatically configure redirects

---

## Step 2: Configure DNS Records

Vercel will show you the DNS records you need to add. You have two options:

### Option A: Apex Domain (Root Domain - Recommended)

**For `yourdomain.com`:**

Add these DNS records in your domain provider:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | `76.76.21.21` | Auto |
| A | @ | `76.223.126.88` | Auto |

**Or use CNAME (if your provider supports it):**
| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | @ | `cname.vercel-dns.com` | Auto |

### Option B: Subdomain (Easier)

**For `www.yourdomain.com`:**

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | www | `cname.vercel-dns.com` | Auto |

---

## Step 3: Update DNS at Your Domain Provider

### GoDaddy

1. Log in to GoDaddy
2. Go to **My Products** → **DNS** → **Manage DNS**
3. Find **Records** section
4. Click **Add** to add new records
5. Enter the values from Vercel
6. Click **Save**

### Namecheap

1. Log in to Namecheap
2. Go to **Domain List** → Click **Manage** next to your domain
3. Go to **Advanced DNS** tab
4. Click **Add New Record**
5. Enter the values from Vercel
6. Click **Save**

### Other Providers

- **Cloudflare**: DNS → Add record
- **Google Domains**: DNS → Custom records
- **Hostinger**: DNS Zone Editor → Add Record

---

## Step 4: Wait for DNS Propagation

- **Time**: Usually 5-60 minutes, can take up to 48 hours
- **Check Status**: Vercel dashboard will show "Valid Configuration" when ready
- **Test**: Visit your domain to see if it works

---

## Step 5: SSL Certificate (Automatic)

✅ **Vercel automatically provisions SSL certificates** via Let's Encrypt
- No action needed
- HTTPS will be enabled automatically
- Certificate renews automatically

---

## Step 6: Verify Domain

1. **Check Vercel Dashboard**
   - Go to **Settings** → **Domains**
   - Status should show **Valid Configuration** ✅

2. **Test Your Domain**
   - Visit `https://yourdomain.com`
   - Should show your Vercel deployment

3. **Check SSL**
   - Visit `https://yourdomain.com`
   - Browser should show padlock icon 🔒

---

## Step 7: Configure Redirects (Optional)

### Redirect www to non-www (or vice versa)

Create `vercel.json` in project root:

```json
{
  "redirects": [
    {
      "source": "/(.*)",
      "destination": "https://yourdomain.com/$1",
      "permanent": true
    }
  ]
}
```

Or configure in Vercel Dashboard:
- **Settings** → **Domains** → **Configure**
- Set primary domain
- Enable redirects

---

## Common Issues & Solutions

### Issue 1: "Invalid Configuration"

**Solution:**
- Double-check DNS records match exactly
- Wait for DNS propagation (can take up to 48 hours)
- Use DNS checker: [dnschecker.org](https://dnschecker.org)

### Issue 2: "Domain Not Resolving"

**Solution:**
- Verify DNS records are correct
- Check TTL settings (use Auto or 3600)
- Clear DNS cache: `sudo dscacheutil -flushcache` (Mac)

### Issue 3: "SSL Certificate Pending"

**Solution:**
- Wait 5-10 minutes after domain is verified
- Vercel automatically provisions SSL
- Check **Settings** → **Domains** → SSL status

### Issue 4: "Domain Already in Use"

**Solution:**
- Remove domain from other Vercel projects
- Check if domain is used elsewhere
- Contact Vercel support if needed

---

## Quick Checklist

- [ ] Domain added in Vercel Dashboard
- [ ] DNS records added at domain provider
- [ ] DNS propagation completed (checked with dnschecker.org)
- [ ] Domain shows "Valid Configuration" in Vercel
- [ ] Website accessible at `https://yourdomain.com`
- [ ] SSL certificate active (padlock icon)
- [ ] www subdomain configured (if needed)

---

## After Domain is Connected

1. **Update Environment Variables**
   - Go to Vercel → **Settings** → **Environment Variables**
   - Update `NEXTAUTH_URL` to `https://yourdomain.com`

2. **Redeploy**
   - Go to **Deployments**
   - Click **⋯** on latest deployment
   - Click **Redeploy**

3. **Test Everything**
   - Visit your domain
   - Test login, admin panel, etc.
   - Verify all features work

---

## Next Steps

After domain is connected:
1. ✅ **Database Connection** - Connect to Hostinger MySQL
2. ✅ **Environment Variables** - Update all production settings
3. ✅ **Test Production** - Verify everything works on live domain

---

**Need Help?**
- Vercel Docs: [vercel.com/docs/concepts/projects/domains](https://vercel.com/docs/concepts/projects/domains)
- Vercel Support: [vercel.com/support](https://vercel.com/support)


