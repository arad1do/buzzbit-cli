# Publishing checklist — @buzzbitx/cli

When you're ready to push `v0.2.0` (or later) to the public npm registry:

## 1. Log in (one-time)

```bash
npm login --scope=@buzzbitx --auth-type=web
```

Opens a browser, authenticates, stores the token in `~/.npmrc`. Confirm
with `npm whoami` — should print your npm username.

## 2. Verify the package

```bash
cd ~/Desktop/buzzbit-cli
npm run clean
npm run build
npm publish --dry-run --access=public
```

`--dry-run` prints the tarball contents without uploading. Confirm:
- name: `@buzzbitx/cli`
- version: matches `package.json`
- file list includes `dist/`, `README.md`, `LICENSE`
- no `node_modules`, `src/`, `.env`, or other accidental inclusions

## 3. Publish

```bash
npm publish --access=public
```

`--access=public` is mandatory for first-time publish of a scoped
package on a free npm account.

## 4. Smoke

```bash
npm install -g @buzzbitx/cli
bbx --version    # should match the published version
bbx auth status  # should print configPath + authenticated=false
```

## 5. Tag the release on GitHub

Already done at the GitHub side — `v0.2.0` tag exists.
The npm and GitHub versions should always stay in sync.

## 6. Update install snippets

After first publish, update:
- `buzzbit-cli/README.md` — replace `npm install -g github:arad1do/buzzbit-cli` with `npm install -g @buzzbitx/cli`
- `buzzbitx1/client/src/components/Settings/claude/SetupTab.tsx` (CLI snippet) — same swap
- `buzzbitx1/client/src/pages/docs/ClaudeDocs.tsx` (CLI section) — same swap

## Bumping versions later

```bash
npm version patch    # 0.2.0 → 0.2.1
npm version minor    # 0.2.0 → 0.3.0
npm version major    # 0.2.0 → 1.0.0
```

The `npm version` script auto-commits + tags. Then:

```bash
git push --follow-tags
npm publish --access=public
gh release create v<version> --generate-notes
```

## If 2FA is enabled

`npm publish` will prompt for an OTP from your authenticator app. The
`--auth-type=web` login path also handles 2FA automatically.
