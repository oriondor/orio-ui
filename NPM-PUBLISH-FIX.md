# Fix npm Publish 403 Error

## The Problem
npm requires 2FA for publishing packages, but you're getting a 403 error.

## Solution: Use Granular Access Token

### Step 1: Generate a Granular Access Token

1. Go to https://www.npmjs.com/settings/YOUR_USERNAME/tokens

2. Click **"Generate New Token"** → **"Granular Access Token"**

3. Configure the token:
   - **Token name**: `orio-ui-publish` (or any name you want)
   - **Expiration**: Choose expiration (recommend 90 days or 1 year)
   - **Packages and scopes**:
     - Select: **"Read and write"**
     - **Specific packages**: `orio-ui`
     - Check: **"This token can bypass 2FA requirements for publishing"**

4. **Organizations**: Leave as default (no organization)

5. **IP ranges**: Leave empty (allow all IPs)

6. Click **"Generate Token"**

7. **Copy the token immediately** (starts with `npm_...`)

### Step 2: Configure npm to Use the Token

**Option A: Login with the token** (Recommended)
```bash
npm logout
npm login
# Username: YOUR_USERNAME
# Password: PASTE_THE_TOKEN (not your npm password!)
# Email: YOUR_EMAIL
```

**Option B: Set token directly**
```bash
npm set //registry.npmjs.org/:_authToken=YOUR_TOKEN_HERE
```

### Step 3: Publish Again

```bash
npm publish --access public
```

---

## Alternative: Enable 2FA and Use OTP

If you prefer to use 2FA instead of bypass:

### Step 1: Enable 2FA on npm

1. Go to https://www.npmjs.com/settings/YOUR_USERNAME/tfa
2. Enable **"Auth-and-writes"** (required for publishing)
3. Scan QR code with authenticator app (Google Authenticator, Authy, etc.)
4. Save backup codes!

### Step 2: Publish with OTP

```bash
npm publish --access public --otp=123456
# Replace 123456 with your current 2FA code from authenticator app
```

---

## For GitHub Actions Automation

After you get the granular access token:

1. Go to: https://github.com/oriondor/orio-ui/settings/secrets/actions

2. Click **"New repository secret"**

3. Name: `NPM_TOKEN`

4. Value: Your granular access token

5. Click **"Add secret"**

Now automated publishing will work!

---

## Verify Token Works

```bash
# Check who you're logged in as
npm whoami

# Test publish (dry run)
npm publish --dry-run --access public
```

---

## Recommended: Use Granular Token

✅ **Pros:**
- No need to type 2FA codes every time
- Works great with CI/CD
- Can be scoped to specific packages
- Can be revoked anytime

❌ **Cons:**
- Need to regenerate when it expires

---

## Quick Summary

1. Generate granular access token at npmjs.com
2. Enable "bypass 2FA" for the token
3. Login with token as password: `npm login`
4. Publish: `npm publish --access public`
5. Add token to GitHub Secrets for automation
