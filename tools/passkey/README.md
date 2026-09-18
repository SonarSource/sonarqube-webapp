# GitHub Passkey

Tools to register and use a WebAuthn passkey on a GitHub test account, so the CI session-refresh
workflow can log in without a password or TOTP.

## Overview

```
github-register.mts   One-time manual script — registers a passkey on the GitHub account
github-login.mts      CI script — logs in with the passkey and saves a Playwright session file
```

The two scripts share the same CDP virtual authenticator approach:

- **register** installs it before `navigator.credentials.create()` so GitHub's WebAuthn ceremony
  is intercepted and the credential stored by CDP.
- **login** installs it before `navigator.credentials.get()` so GitHub's passkey challenge is
  answered automatically, no human interaction required.

---

## github-register.mts — one-time setup per GitHub account

### When to run

Once per GitHub test account. Re-run only if the passkey is revoked or the stored credential is
rotated.

### Steps

1. Run from the workspace root (always opens a real browser — manual login required):

   ```bash
   node tools/passkey/github-register.mts
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

### Storing the credential in 1Password

Save the three printed values on the GitHub test account's existing 1Password item (the same one
holding its username/password, following the same naming convention e.g.
**"GitHub - Webapp E2E - Orgs admin"**):

- Add a section titled **"Playwright Passkey Credential"**.
- Add one field per printed value using the same labels (`PASSKEY_ID`, `PASSKEY_PRIVATE_KEY`
  concealed, `PASSKEY_USER_HANDLE`).

Do not create a separate item — the passkey belongs with the rest of that account's credentials.

### Storing the credential in Vault (required for CI)

The session-refresh workflow reads secrets from Vault. For an account named `<account>` listed in
`ACCOUNTS` in `.github/workflows/e2e-sessions-refresh.yml`, write the three values to:

```
development/team/sonarcloud/kv/data/github-<account>
```

using these key names (note the lowercase-hyphen convention Vault uses):

| Printed value         | Vault key             |
| --------------------- | --------------------- |
| `PASSKEY_ID`          | `passkey-id`          |
| `PASSKEY_PRIVATE_KEY` | `passkey-private-key` |
| `PASSKEY_USER_HANDLE` | `passkey-user-handle` |

Also add the three corresponding `secrets:` lines to the `Get passkey secrets` step in the
workflow (follow the pattern already there for the existing accounts).

- Ensure the 1Password entry is created and fully populated with all the required fields (copy
  what's done in the **"GitHub - Webapp E2E - Orgs admin"** entry) before requesting the Vault
  write.
- Follow the [Vault guidelines](https://xtranet-sonarsource.atlassian.net/wiki/x/EQCqrQ) to add
  the new values.

---

## github-login.mts — CI session refresh

### When to run

Called automatically by the CI session-refresh workflow. Only run manually for local debugging.

### Usage

```bash
GITHUB_PASSKEY_ID=... \
GITHUB_PASSKEY_PRIVATE_KEY=... \
GITHUB_PASSKEY_USER_HANDLE=... \
  node tools/passkey/github-login.mts <output-path>
```

Example:

```bash
node tools/passkey/github-login.mts \
  private/sq-cloud-e2e-tests/playwright/.auth/gh-user.json
```

### Required env vars

| Env var                      | 1Password field       |
| ---------------------------- | --------------------- |
| `GITHUB_PASSKEY_ID`          | `PASSKEY_ID`          |
| `GITHUB_PASSKEY_PRIVATE_KEY` | `PASSKEY_PRIVATE_KEY` |
| `GITHUB_PASSKEY_USER_HANDLE` | `PASSKEY_USER_HANDLE` |

### Output

A Playwright `storageState` JSON at the given path. Pass it to `storageState` in the playwright
config or fixture to reuse the session without re-authenticating.
