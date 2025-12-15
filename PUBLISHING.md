# Publishing to npm Registry

This guide walks through the process of publishing this package to the npm registry.

## Pre-Publish Checklist

### 1. Package Configuration ✅

**Verify package.json fields:**

- [x] `name`: `@amartincodes/qr-code-gen` (scoped package)
- [x] `version`: `1.0.0` (semantic versioning)
- [x] `description`: Clear, concise description
- [x] `license`: MIT
- [x] `author`: amartincodes
- [x] `keywords`: Relevant search terms
- [x] `repository`: GitHub URL
- [x] `main`: dist/index.js (entry point)
- [x] `types`: dist/index.d.ts (TypeScript definitions)
- [x] `bin`: dist/cli.js (CLI command)
- [x] `files`: ["dist"] (only ship built files)
- [x] `engines`: Node.js >=18.0.0

### 2. Documentation ✅

- [x] README.md with clear installation & usage instructions
- [x] LICENSE file (MIT)
- [x] Examples and API documentation
- [x] Performance benchmarks documented

### 3. Quality Checks

Run these commands to ensure everything works:

```bash
# Run all tests
npm test

# Run linting
npm run lint

# Build the project
npm run build

# Test the CLI locally
node dist/cli.js --help

# Test the package locally (simulate installation)
npm pack
npm install -g amartincodes-qr-code-gen-1.0.0.tgz
qr-code-gen --help
npm uninstall -g @amartincodes/qr-code-gen
```

### 4. Version Management

Follow semantic versioning (semver):

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes
- **MINOR** (1.0.0 → 1.1.0): New features (backward compatible)
- **PATCH** (1.0.0 → 1.0.1): Bug fixes (backward compatible)

Update version:

```bash
# Automatically update version and create git tag
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.0 → 1.1.0
npm version major  # 1.0.0 → 2.0.0
```

### 5. Git Repository

Ensure your code is committed and pushed:

```bash
git status
git add .
git commit -m "Release v1.0.0"
git push origin master
git push --tags
```

## Publishing Steps

### Step 1: Create npm Account

If you don't have an npm account:

1. Go to https://www.npmjs.com/signup
2. Create an account
3. Verify your email

### Step 2: Login to npm

```bash
npm login
```

Enter your:

- Username
- Password
- Email (public)
- One-time password (if 2FA is enabled)

Verify login:

```bash
npm whoami
```

### Step 3: Check Package Name Availability

```bash
npm view @amartincodes/qr-code-gen
```

If you get a 404 error, the name is available! ✅

### Step 4: Dry Run (Test Publish)

Test what will be published without actually publishing:

```bash
npm publish --dry-run
```

This shows:

- Files that will be included
- Package size
- Any warnings or errors

### Step 5: Publish to npm

**For scoped packages (like @amartincodes/qr-code-gen):**

```bash
#Public package (free)
npm publish --access public

# Private package (requires paid plan)
npm publish --access restricted
```

**For non-scoped packages:**

```bash
npm publish
```

### Step 6: Verify Publication

1. Check on npm: https://www.npmjs.com/package/@amartincodes/qr-code-gen
2. Test installation:
   ```bash
   npm install -g @amartincodes/qr-code-gen
   qr-code-gen --version
   ```

## Post-Publishing

### Update README Badges

The npm version badge should now work:

```markdown
[![npm version](https://badge.fury.io/js/@amartincodes%2Fqr-code-gen.svg)](https://www.npmjs.com/package/@amartincodes/qr-code-gen)
```

### Create GitHub Release

1. Go to GitHub repository → Releases → New Release
2. Tag version: `v1.0.0`
3. Title: `v1.0.0 - Initial Release`
4. Description: Changelog/features
5. Publish release

## Updating the Package

When you make changes and want to publish an update:

```bash
# 1. Make your changes and commit
git add .
git commit -m "feat: add new feature"

# 2. Run quality checks
npm test
npm run lint
npm run build

# 3. Update version (creates git tag)
npm version patch  # or minor/major

# 4. Push changes and tags
git push origin master
git push --tags

# 4.5 update the version in package.json

# 5. Publish
npm publish --access public
```

## Troubleshooting

### Error: Package name already exists

- Change the package name in package.json
- Or use a scoped package: `@yourusername/package-name`

### Error: You must verify your email

- Check your email inbox for verification link
- Resend: https://www.npmjs.com/email-edit

### Error: You do not have permission to publish

- Make sure you're logged in: `npm whoami`
- Check package scope matches your username

### Error: Package.json "main" file doesn't exist

- Run `npm run build` first
- Check that `dist/index.js` exists

## Important Notes

1. **You cannot unpublish after 24 hours** - Be careful!
2. **Published versions are immutable** - Once published, that version number is locked
3. **The `prepublishOnly` script** automatically runs build and tests before publishing
4. **Scoped packages** (@username/package) are free for public packages
5. **Use `.npmignore` or `files`** field to control what gets published

## Security

### Enable 2FA (Recommended)

```bash
npm profile enable-2fa auth-and-writes
```

This requires a one-time password for publishing.

### Check for Vulnerabilities

```bash
npm audit
npm audit fix
```

## Resources

- [npm Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Semantic Versioning](https://semver.org/)
- [package.json Documentation](https://docs.npmjs.com/cli/v8/configuring-npm/package-json)
