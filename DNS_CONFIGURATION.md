# DNS Configuration Guide for GitHub Pages

## 📋 Overview

This guide provides step-by-step instructions for configuring DNS records to point `www.liyupoetry.com` to GitHub Pages instead of Cloudflare Pages.

## 🎯 Current Situation

- **Current DNS**: `www.liyupoetry.com` → Cloudflare Pages (showing outdated content)
- **Target DNS**: `www.liyupoetry.com` → GitHub Pages (showing correct Chinese poetry content)
- **GitHub Pages URL**: `https://lukethecat.github.io`
- **Custom Domain**: `www.liyupoetry.com`

## 🔧 DNS Configuration Options

### Option 1: CNAME Record (Recommended)

Create a CNAME record pointing `www.liyupoetry.com` to `lukethecat.github.io`:

| Type  | Name | Value                  | TTL   |
|-------|------|------------------------|-------|
| CNAME | www  | lukethecat.github.io   | 3600  |

### Option 2: A Records (Alternative)

Create A records pointing to GitHub Pages IP addresses:

| Type | Name | Value           | TTL   |
|------|------|-----------------|-------|
| A    | www  | 185.199.108.153 | 3600  |
| A    | www  | 185.199.109.153 | 3600  |
| A    | www  | 185.199.110.153 | 3600  |
| A    | www  | 185.199.111.153 | 3600  |

### Option 3: Apex Domain (liyupoetry.com)

If you want the apex domain (without www) to work:

| Type | Name           | Value           | TTL   |
|------|----------------|-----------------|-------|
| A    | liyupoetry.com | 185.199.108.153 | 3600  |
| A    | liyupoetry.com | 185.199.109.153 | 3600  |
| A    | liyupoetry.com | 185.199.110.153 | 3600  |
| A    | liyupoetry.com | 185.199.111.153 | 3600  |

**Note**: GitHub Pages also supports ALIAS/ANAME records for apex domains if your DNS provider supports them.

## 📝 Step-by-Step Configuration

### Step 1: Remove Cloudflare DNS Records

If your domain is currently managed by Cloudflare:

1. Log in to Cloudflare Dashboard: https://dash.cloudflare.com
2. Select your domain: `liyupoetry.com`
3. Go to **DNS** → **Records**
4. Remove or disable any existing records for `www.liyupoetry.com`
5. Wait for changes to propagate (up to 5 minutes)

### Step 2: Add GitHub Pages DNS Records

#### For Cloudflare Users:
1. In Cloudflare DNS settings, click **Add record**
2. Configure as follows:
   - **Type**: CNAME
   - **Name**: `www`
   - **Target**: `lukethecat.github.io`
   - **Proxy status**: ⚠️ **Turn OFF (DNS only)** - Important!
   - **TTL**: Auto
3. Click **Save**

#### For Other DNS Providers:
1. Log in to your DNS provider's control panel
2. Find the DNS management section
3. Add a new CNAME record:
   - Host/Name: `www`
   - Points to/Value: `lukethecat.github.io`
   - TTL: 3600 seconds (1 hour)
4. Save changes

### Step 3: Configure GitHub Pages

1. Go to GitHub repository settings:
   ```
   https://github.com/lukethecat/lukethecat.github.io/settings/pages
   ```
2. In the **Custom domain** section, enter: `www.liyupoetry.com`
3. Click **Save**
4. GitHub will automatically create a CNAME file in your repository

### Step 4: Verify Configuration

Wait 5-10 minutes for DNS propagation, then verify:

```bash
# Check DNS resolution
dig www.liyupoetry.com +short

# Check HTTP response
curl -I https://www.liyupoetry.com/

# Verify GitHub Pages is serving the site
curl -s https://www.liyupoetry.com/ | grep -o "<title>[^<]*</title>"
```

Expected output should show:
- DNS resolves to GitHub Pages IPs
- HTTP 200 response
- Title: "李瑜诗歌" (not "西域诗魂｜李瑜和他的作品")

## ✅ Verification Checklist

- [ ] DNS records updated (CNAME or A records)
- [ ] GitHub Pages custom domain configured
- [ ] DNS propagation complete (wait 5-60 minutes)
- [ ] `www.liyupoetry.com` returns HTTP 200
- [ ] All poetry pages accessible (no 404 errors)
- [ ] Content shows Chinese poetry (not Western content)
- [ ] Footer shows Chinese greetings (not "Servus", "Aloha", etc.)

## 🔍 Troubleshooting

### Issue: DNS Not Propagating
- Wait longer (up to 24 hours for global propagation)
- Clear local DNS cache: `sudo dscacheutil -flushcache` (macOS)
- Use different DNS servers: `1.1.1.1` (Cloudflare) or `8.8.8.8` (Google)

### Issue: SSL/TLS Certificate Error
- GitHub Pages automatically provisions SSL certificates via Let's Encrypt
- Wait up to 24 hours for certificate issuance
- Check certificate status: `openssl s_client -connect www.liyupoetry.com:443 -servername www.liyupoetry.com`

### Issue: Mixed Content Warnings
- Ensure all resources use HTTPS URLs
- Check `config.toml` has correct `base_url`
- Verify templates use relative or HTTPS URLs

### Issue: Still Showing Old Content
- Clear browser cache (Ctrl+Shift+Delete)
- Check Cloudflare cache is disabled (Proxy status: DNS only)
- Verify GitHub Pages deployment is complete

## 🚀 Quick Fix Script

Run this script to verify and troubleshoot:

```bash
#!/bin/bash
echo "🔍 Verifying DNS configuration..."
echo "================================="

# Check DNS
echo "DNS Resolution:"
dig www.liyupoetry.com +short

echo ""
echo "HTTP Status:"
curl -s -o /dev/null -w "www.liyupoetry.com: %{http_code}\n" https://www.liyupoetry.com/

echo ""
echo "Content Check:"
curl -s https://www.liyupoetry.com/ | grep -o "<title>[^<]*</title>"

echo ""
echo "Key Pages:"
for page in "" "1995hanxuema/" "1980/" "archive/"; do
    status=$(curl -s -o /dev/null -w "%{http_code}" "https://www.liyupoetry.com/$page")
    echo "https://www.liyupoetry.com/$page: $status"
done
```

## 📞 Support Resources

### GitHub Pages Documentation
- [Custom domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [Troubleshooting](https://docs.github.com/en/pages/getting-started-with-github-pages/troubleshooting-jekyll-build-errors-for-github-pages-sites)

### DNS Propagation Checkers
- [DNS Checker](https://dnschecker.org/)
- [WhatsMyDNS](https://www.whatsmydns.net/)

### SSL Certificate Check
- [SSL Labs](https://www.ssllabs.com/ssltest/)
- [SSL Checker](https://www.sslshopper.com/ssl-checker.html)

## ⏱️ Timeline

| Time After Change | Expected Status |
|-------------------|-----------------|
| 0-5 minutes       | Local DNS cache may show old IP |
| 5-30 minutes      | Most users see new DNS |
| 30-60 minutes     | Global propagation mostly complete |
| 24 hours          | Full global propagation |

## 🔄 Fallback Plan

If DNS changes don't work as expected:

1. **Revert to Cloudflare DNS** and configure Cloudflare Pages properly
2. **Use GitHub Pages only** at `lukethecat.github.io` temporarily
3. **Contact support** from your DNS provider

## 📊 Success Metrics

After successful configuration:

1. ✅ `www.liyupoetry.com` resolves to GitHub Pages IPs
2. ✅ HTTPS works with valid certificate
3. ✅ All poetry pages return HTTP 200
4. ✅ Content shows Chinese poetry (correct version)
5. ✅ No Western content or greetings in footer
6. ✅ DNS propagation complete globally

---

**Important**: Always test changes in a staging environment if possible. For production domains, consider making changes during low-traffic periods.

Last Updated: 2026-02-04