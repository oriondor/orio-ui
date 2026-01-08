# Publishing Guide

This guide explains how to publish `orio-ui` to npm and how the automated versioning system works.

## Table of Contents
- [Initial Setup (One-Time)](#initial-setup-one-time)
- [How Automated Publishing Works](#how-automated-publishing-works)
- [Making Changes & Releases](#making-changes--releases)
- [Manual Publishing (Emergency)](#manual-publishing-emergency)
- [Nuances & Best Practices](#nuances--best-practices)

---

## Initial Setup (One-Time)

### 1. Create npm Account
If you don't have an npm account:
```bash
# Go to https://www.npmjs.com/signup
# Create your account
```

### 2. Check Package Name Availability
```bash
npm search orio-ui
```
If the name is taken, you'll need to:
- Change the package name in `package.json`
- Or use a scoped package: `@yourusername/orio-ui`

### 3. Generate npm Access Token
1. Go to https://www.npmjs.com/settings/YOUR_USERNAME/tokens
2. Click "Generate New Token" → "Classic Token"
3. Select **"Automation"** type (for CI/CD)
4. Copy the token (starts with `npm_...`)

### 4. Add Token to GitHub Secrets
1. Go to your repository: https://github.com/oriondor/orio-ui
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `NPM_TOKEN`
5. Value: Paste your npm token
6. Click **Add secret**

### 5. First Manual Publish (Recommended)
Before automation kicks in, do a test publish:

```bash
# Make sure you're on main branch
git checkout main
git pull

# Login to npm (one-time)
npm login

# Build the package
npm run build

# Check what will be published
npm pack --dry-run

# Publish to npm
npm publish --access public
```

**✓ Your package is now live at:** `https://www.npmjs.com/package/orio-ui`

---

## How Automated Publishing Works

This project uses **Release Please** by Google for automated versioning and publishing.

### Workflow Overview

```
┌─────────────────────────────────────────────────────────────┐
│  1. You push commits to main with conventional commit msgs  │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Release Please creates/updates a "Release PR"           │
│     - Automatically bumps version (patch/minor/major)       │
│     - Updates CHANGELOG.md                                  │
│     - Updates package.json & package-lock.json              │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  3. You review and merge the Release PR                     │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Automation triggers on merge:                           │
│     - Creates a GitHub Release                              │
│     - Runs tests                                            │
│     - Builds the package                                    │
│     - Publishes to npm                                      │
└─────────────────────────────────────────────────────────────┘
```

### Conventional Commits (Required!)

Release Please uses conventional commits to determine version bumps:

| Commit Type | Version Bump | Example |
|-------------|--------------|---------|
| `fix:` | Patch (0.1.0 → 0.1.1) | `fix: resolve modal animation bug` |
| `feat:` | Minor (0.1.0 → 0.2.0) | `feat: add Tooltip component` |
| `feat!:` or `BREAKING CHANGE:` | Major (0.1.0 → 1.0.0) | `feat!: remove deprecated useOldApi` |
| `docs:`, `chore:`, `style:`, `refactor:` | No version bump | `docs: update README` |

**Examples:**
```bash
# Patch release (bug fix)
git commit -m "fix: correct checkbox alignment in Safari"

# Minor release (new feature)
git commit -m "feat: add Dropdown component with accessibility support"

# Major release (breaking change)
git commit -m "feat!: redesign theme system

BREAKING CHANGE: Theme colors now use CSS custom properties instead of Tailwind classes"

# No release (documentation)
git commit -m "docs: add examples for Button component"
```

---

## Making Changes & Releases

### Standard Workflow

1. **Make changes on a feature branch:**
```bash
git checkout -b feat/new-component
# ... make your changes ...
git add .
git commit -m "feat: add Tooltip component with customizable positioning"
git push origin feat/new-component
```

2. **Create PR and merge to main:**
```bash
# After code review, merge PR to main
# (via GitHub UI)
```

3. **Release Please creates a Release PR:**
   - A bot will automatically create a PR titled: `chore(main): release 0.2.0`
   - This PR contains:
     - Updated version in `package.json`
     - Updated `CHANGELOG.md` with your changes
     - Updated `package-lock.json`

4. **Review the Release PR:**
   - Check the version bump is correct
   - Review the changelog
   - Merge when ready

5. **Publishing happens automatically:**
   - GitHub Release is created
   - Package is built and published to npm
   - Users can now `npm install orio-ui@0.2.0`

### Example Timeline

**Day 1:**
```bash
git commit -m "feat: add Tooltip component"
git push origin main
# → Release Please creates PR: "chore(main): release 0.2.0"
```

**Day 2:**
```bash
git commit -m "fix: tooltip arrow positioning"
git push origin main
# → Release Please updates the same PR: "chore(main): release 0.2.0"
#   (includes both feat and fix in changelog)
```

**Day 3:**
```bash
# You merge the Release PR
# → Automation publishes v0.2.0 to npm
```

---

## Manual Publishing (Emergency)

If GitHub Actions fails or you need to publish manually:

```bash
# 1. Make sure you're on main and up to date
git checkout main
git pull

# 2. Bump version manually
npm version patch  # or minor, or major

# 3. Build
npm run build

# 4. Publish
npm publish --access public

# 5. Push version bump
git push --follow-tags
```

---

## Nuances & Best Practices

### Package Publishing

#### 1. **What Gets Published**
The `files` field in `package.json` controls what's published:
```json
"files": [
  "dist",           // Built files
  "nuxt.config.ts", // Nuxt layer config
  "src"             // Source code for source maps
]
```

Use `.npmignore` to exclude unwanted files from `src/`.

#### 2. **Pre-publish Build**
The `prepack` script automatically builds before publishing:
```json
"prepack": "npm run build"
```

#### 3. **Package Exports**
Your package has multiple entry points:
```javascript
// Default import
import { Button } from 'orio-ui'

// Composables
import { useTheme } from 'orio-ui/composables'

// Styles
import 'orio-ui/styles'
import 'orio-ui/theme'
```

#### 4. **Provenance Statements**
The `--provenance` flag adds supply chain security:
```bash
npm publish --provenance
```
This creates a verifiable link between your package and the source code.

### Version Bumping Strategy

#### Semantic Versioning (SemVer)
`MAJOR.MINOR.PATCH` (e.g., `1.2.3`)

- **PATCH** (`0.1.0` → `0.1.1`): Bug fixes, no new features
- **MINOR** (`0.1.0` → `0.2.0`): New features, backward compatible
- **MAJOR** (`0.9.0` → `1.0.0`): Breaking changes

#### Pre-1.0.0 Exceptions
While version is `0.x.x`:
- Breaking changes can be MINOR bumps
- Move to `1.0.0` when API is stable

### Testing Before Publishing

Always test your package locally:

```bash
# Build
npm run build

# Pack (creates a .tgz file)
npm pack

# In another project, test the package
cd /path/to/test-project
npm install /path/to/orio-ui/orio-ui-0.1.0.tgz
```

### Common Issues

#### Issue: "Package name already exists"
**Solution:** Use a scoped package:
```json
{
  "name": "@yourusername/orio-ui"
}
```

#### Issue: "403 Forbidden"
**Solution:** Check:
1. You're logged in: `npm whoami`
2. You have publish rights
3. For scoped packages: `npm publish --access public`

#### Issue: "Version already published"
**Solution:** You can't republish the same version. Bump version:
```bash
npm version patch
npm publish
```

#### Issue: Build files not included
**Solution:** Make sure `dist/` is in the `files` array and NOT in `.npmignore`

#### Issue: Large package size
**Solution:** Check what's being published:
```bash
npm pack --dry-run
```
Add unwanted files to `.npmignore`

### Nuxt Layer Considerations

#### Auto-imports
Your components/composables auto-import in Nuxt because of `nuxt.config.ts`:
```typescript
export default defineNuxtConfig({
  components: [
    { path: './src/runtime/components', prefix: 'Orio' }
  ]
})
```

#### Extending the Layer
Users consume your library like this:
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['orio-ui']
})
```

### Security Best Practices

1. **Never commit npm tokens** to Git
2. **Use automation tokens** for CI/CD (not publish tokens)
3. **Enable 2FA** on your npm account
4. **Use `--provenance`** for supply chain verification
5. **Review dependencies** regularly with `npm audit`

### Monitoring

After publishing:

1. **Check npm:** https://www.npmjs.com/package/orio-ui
2. **Check unpkg CDN:** https://unpkg.com/orio-ui/
3. **Check bundlephobia:** https://bundlephobia.com/package/orio-ui
4. **Monitor downloads:** https://npm-stat.com/charts.html?package=orio-ui

---

## Quick Reference

### First-time setup checklist:
- [ ] npm account created
- [ ] Package name available/unique
- [ ] npm token generated (Automation type)
- [ ] Token added to GitHub Secrets as `NPM_TOKEN`
- [ ] Initial manual publish successful

### Regular workflow:
1. Make changes with conventional commits
2. Push to main
3. Wait for Release Please PR
4. Review and merge Release PR
5. Package auto-publishes to npm

### Emergency manual publish:
```bash
npm version patch && npm run build && npm publish --access public && git push --follow-tags
```

---

## Support

- **npm Issues:** https://github.com/oriondor/orio-ui/issues
- **npm Status:** https://status.npmjs.org/
- **Release Please Docs:** https://github.com/googleapis/release-please

---

**Happy Publishing! 🚀**
