# Playwright session tools

Tools to generate and refresh the Playwright auth session files used by e2e tests.

```
passkey/    GitHub accounts — WebAuthn passkey login (no password or TOTP at runtime)
totp/       Bitbucket account — JumpCloud TOTP login
```

The e2e dispatch workflow restores the latest encrypted session cache and checks every account
before Playwright starts. If any session is invalid, it calls `e2e-sessions-refresh.yml` to
regenerate, encrypt, and re-cache all of them. The scheduled run of that workflow also regenerates
them unconditionally.

---

## passkey/ — GitHub accounts

### Overview

```
github-register.mts         One-time manual script — registers a passkey on the GitHub account
github-login.mts            CI script — logs in with the passkey and saves a Playwright session file
github-check-sessions.mts   CI script — checks the saved sessions before e2e tests
```

Both scripts use Chrome's CDP WebAuthn domain:

- **register** installs a virtual authenticator before `navigator.credentials.create()` so
  GitHub's ceremony is intercepted and the credential stored by CDP.
- **login** installs it before `navigator.credentials.get()` so GitHub's passkey challenge is
  answered automatically, no human interaction required.

### github-register.mts — one-time setup per GitHub account

Run once per GitHub test account. Re-run only if the passkey is revoked or rotated.

1. Run from the workspace root (always opens a real browser — manual login required):

   ```bash
   node tools/playwright-sessions/passkey/github-register.mts
   ```

2. A browser window opens on `github.com/sessions/trusted-device`. Log in manually
   (username / password / TOTP). Chrome's CDP virtual authenticator intercepts
   `navigator.credentials.create()` automatically.

3. The script prints:

   ```
   PASSKEY_ID=...
   PASSKEY_PRIVATE_KEY=...
   PASSKEY_USER_HANDLE=...
   ```

**Storing in 1Password** — save the three values on the GitHub test account's existing 1Password
item (e.g. **"GitHub - Webapp E2E - Orgs admin"**) under a section titled
**"Playwright Passkey Credential"**, one field per value (`PASSKEY_PRIVATE_KEY` concealed).

**Storing in Vault (required for CI)** — write the three values to
`development/team/sonarcloud/kv/data/github-<account>` using the lowercase-hyphen keys:

| Printed value         | Vault key             |
| --------------------- | --------------------- |
| `PASSKEY_ID`          | `passkey-id`          |
| `PASSKEY_PRIVATE_KEY` | `passkey-private-key` |
| `PASSKEY_USER_HANDLE` | `passkey-user-handle` |

Also add the corresponding `secrets:` lines to the `Get passkey secrets` step in
`.github/workflows/e2e-sessions-refresh.yml`. Follow the
[Vault guidelines](https://xtranet-sonarsource.atlassian.net/wiki/x/EQCqrQ).

### github-login.mts — CI session refresh

Called automatically by the CI session-refresh workflow. Only run manually for local debugging.

```bash
GITHUB_PASSKEY_ID=... \
GITHUB_PASSKEY_PRIVATE_KEY=... \
GITHUB_PASSKEY_USER_HANDLE=... \
  node tools/playwright-sessions/passkey/github-login.mts <output-path>
```

### github-check-sessions.mts — CI pre-flight check

Reads the space-separated `ACCOUNTS` env var, checks each `<account>.json` session file in
`private/sq-cloud-e2e-tests/playwright/.auth/`, and sets `needs_refresh=true` on `GITHUB_OUTPUT`
if any is missing or invalid.

---

## totp/ — Bitbucket account

### Overview

```
bitbucket-login.mts           CI script — logs in via JumpCloud TOTP and saves a Playwright session file
bitbucket-check-sessions.mts  CI script — checks the saved session before e2e tests
```

The Bitbucket test account authenticates through JumpCloud SSO: the script drives the full
email → password → TOTP flow headlessly. On a rejected code, it waits out the rest of the current
30-second TOTP period before generating a fresh one and retrying (up to 3 attempts total) —
retrying immediately would just resubmit the same already-rejected, single-use code.

No one-time registration step is needed — credentials are read from env vars.

### bitbucket-login.mts — CI session refresh

Called automatically by the CI session-refresh workflow. Only run manually for local debugging.

```bash
ACCEPTANCE_TESTS_BITBUCKET_USERNAME=... \
ACCEPTANCE_TESTS_BITBUCKET_PASSWORD=... \
ACCEPTANCE_TESTS_BITBUCKET_TOTP_SECRET=... \
  node tools/playwright-sessions/totp/bitbucket-login.mts <output-path>
```

**Vault path:** `development/team/sonarcloud/kv/data/bitbucket-e2e`, keys `username`, `password`,
`otp`.

### bitbucket-check-sessions.mts — CI pre-flight check

Reads the space-separated `BBC_ACCOUNTS` env var, checks each `<account>.json` session file in
`private/sq-cloud-e2e-tests/playwright/.auth/`, and sets `needs_refresh=true` on `GITHUB_OUTPUT`
if any is missing or invalid.
