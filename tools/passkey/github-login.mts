/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource Sàrl
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

/**
 * Automated GitHub passkey login script using Chrome's CDP WebAuthn domain.
 *
 * Called by the CI workflow that refreshes e2e test GitHub sessions. Produces a
 * Playwright storageState JSON file that tests can reuse via `storageState` in
 * their playwright config or fixture.
 *
 * Usage:
 *
 *   node tools/passkey/github-login.mts <output-path>
 *
 * Example:
 *
 *   node tools/passkey/github-login.mts \
 *     private/sq-cloud-e2e-tests/playwright/.auth/gh-user.json
 *
 * Required env vars (registered via tools/passkey/github-register.mts):
 *   GITHUB_PASSKEY_ID
 *   GITHUB_PASSKEY_PRIVATE_KEY
 *   GITHUB_PASSKEY_USER_HANDLE
 *
 * See README.md for full details.
 */

import { chromium, type Page } from '@playwright/test';
import path from 'node:path';
import process from 'node:process';
import { base64urlToBase64, requireEnv } from './utils.mts';

const GITHUB_RP_ID = 'github.com';
const GITHUB_DOMAIN = 'https://github.com/';
const GITHUB_LOGIN_URL = `${GITHUB_DOMAIN}login`;
const MAX_PASSKEY_ATTEMPTS = 10;

async function installVirtualAuthenticator(page: Page) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('WebAuthn.enable', { enableUI: false });

  const { authenticatorId } = await cdp.send('WebAuthn.addVirtualAuthenticator', {
    options: {
      protocol: 'ctap2',
      transport: 'internal',
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
    },
  });

  // Use the current Unix timestamp as the initial signCount.
  // GitHub rejects assertions with a signCount not strictly greater than what it last saw.
  // Starting from the current timestamp guarantees each run starts higher than any previous run.
  const initialSignCount = Math.floor(Date.now() / 1000);
  console.log(`[CDP WebAuthn] installing credential with signCount=${initialSignCount}`);

  await cdp.send('WebAuthn.addCredential', {
    authenticatorId,
    credential: {
      credentialId: base64urlToBase64(requireEnv('GITHUB_PASSKEY_ID')),
      isResidentCredential: true,
      rpId: GITHUB_RP_ID,
      privateKey: base64urlToBase64(requireEnv('GITHUB_PASSKEY_PRIVATE_KEY')),
      userHandle: base64urlToBase64(requireEnv('GITHUB_PASSKEY_USER_HANDLE')),
      signCount: initialSignCount,
      backupEligibility: true,
      backupState: true,
    },
  });

  cdp.on(
    'WebAuthn.credentialAsserted',
    ({ credential }: { credential: { credentialId: string; signCount: number } }) => {
      console.log(
        `[CDP WebAuthn] credentialAsserted — signCount: ${credential?.signCount ?? '?'}, ` +
          `credentialId: ${(credential?.credentialId ?? '?').slice(0, 16)}…`,
      );
    },
  );
}

async function authenticateWithPasskey(page: Page) {
  await page.goto(GITHUB_LOGIN_URL);

  const signInWithPasskeyButton = page.getByRole('button', { name: 'Sign in with a passkey' });
  const errorMessage = page.getByText(/Unable to sign in with your passkey/);
  const authorizeButton = page.getByRole('button', { name: 'Authorize' });

  // Wait for the page to reach a known state: passkey button visible, or already redirected.
  const initialOutcome = await Promise.race([
    signInWithPasskeyButton
      .waitFor({ state: 'visible', timeout: 30_000 })
      .then(() => 'button' as const),
    page.waitForURL(GITHUB_DOMAIN, { timeout: 30_000 }).then(() => 'success' as const),
  ]).catch(() => 'timeout' as const);

  if (initialOutcome === 'success') {
    console.log('[passkey] sign-in succeeded without explicit button interaction');
    return;
  }

  for (let attempt = 1; attempt <= MAX_PASSKEY_ATTEMPTS; attempt++) {
    const attemptStart = Date.now();
    console.log(`[passkey] attempt ${attempt}/${MAX_PASSKEY_ATTEMPTS} — url: ${page.url()}`);

    if (await signInWithPasskeyButton.isVisible()) {
      await signInWithPasskeyButton.click();
    }

    const outcome = await Promise.race([
      page.waitForURL(GITHUB_DOMAIN, { timeout: 15_000 }).then(() => 'success' as const),
      errorMessage.waitFor({ state: 'visible', timeout: 15_000 }).then(() => 'error' as const),
      authorizeButton
        .waitFor({ state: 'visible', timeout: 15_000 })
        .then(() => 'authorize' as const),
    ]).catch(() => 'timeout' as const);

    const elapsed = Date.now() - attemptStart;

    if (outcome === 'success') {
      console.log(`[passkey] attempt ${attempt} succeeded in ${elapsed}ms`);
      return;
    }

    if (outcome === 'authorize') {
      console.log(
        `[passkey] attempt ${attempt} requires authorization (${elapsed}ms), clicking Authorize…`,
      );
      await authorizeButton.click();
      continue;
    }

    const errorText = await errorMessage.textContent().catch(() => '(could not read error)');
    console.log(
      `[passkey] attempt ${attempt} failed (${outcome}, ${elapsed}ms): "${errorText}" — url: ${page.url()}`,
    );

    // Wait for the passkey button to reappear before the next attempt.
    await signInWithPasskeyButton.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {});
  }

  throw new Error(`Passkey authentication failed after ${MAX_PASSKEY_ATTEMPTS} attempts`);
}

async function main() {
  const outputPath = process.argv[2];
  if (!outputPath) {
    throw new Error(
      'Missing required argument: output path\n' +
        'Usage: node tools/passkey/github-login.mts <output-path>',
    );
  }

  const resolvedOutputPath = path.resolve(outputPath);
  console.log(`[passkey-login] session will be saved to: ${resolvedOutputPath}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ baseURL: 'https://github.com' });
  const page = await context.newPage();

  try {
    // The virtual authenticator must be installed before any navigation that could trigger
    // a WebAuthn challenge; CDP intercepts navigator.credentials.get() automatically.
    await installVirtualAuthenticator(page);
    await authenticateWithPasskey(page);

    await context.storageState({ path: resolvedOutputPath });
    console.log(`[passkey-login] session saved to ${resolvedOutputPath}`);
  } finally {
    await context.close();
    await browser.close();
  }
}

try {
  await main();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
