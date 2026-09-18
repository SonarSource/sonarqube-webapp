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
 * One-time passkey registration script using Chrome's CDP WebAuthn domain.
 *
 * Run this manually once per GitHub test account:
 *
 *   node tools/passkey/github-register.mts
 *
 * It will:
 *   1. Open github.com/sessions/trusted-device in a browser window.
 *   2. Install a CDP virtual authenticator BEFORE any WebAuthn interaction.
 *   3. Wait for you to log in manually (username / password / TOTP).
 *      Chrome intercepts navigator.credentials.create() automatically.
 *   4. Print the credential fields to stdout in base64url format.
 *
 * See README.md for what to do with the printed values.
 */

import { chromium } from '@playwright/test';
import process from 'node:process';
import { base64ToBase64url } from './utils.mts';

const GITHUB_TRUSTED_DEVICE_URL = 'https://github.com/sessions/trusted-device';
const GITHUB_SECURITY_SETTINGS_URL = 'https://github.com/settings/security';

async function main() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);

  await cdp.send('WebAuthn.enable', { enableUI: false });

  const { authenticatorId } = (await cdp.send('WebAuthn.addVirtualAuthenticator', {
    options: {
      protocol: 'ctap2',
      transport: 'internal',
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
    },
  })) as { authenticatorId: string };

  console.log(`\n[CDP] Virtual authenticator ready: ${authenticatorId}`);

  await page.goto(`${GITHUB_TRUSTED_DEVICE_URL}?return_to=%2Fsettings%2Fsecurity`);

  console.log(
    '\nPlease log in to GitHub in the browser window, then create a passkey manually and wait...\n',
  );

  // Wait for GitHub to redirect back to security settings after the WebAuthn ceremony.
  await page.waitForURL(GITHUB_SECURITY_SETTINGS_URL, { timeout: 240_000 });

  await page.getByText(/passkeys? configured/i).waitFor({ timeout: 10_000 });

  const { credentials } = (await cdp.send('WebAuthn.getCredentials', {
    authenticatorId,
  })) as {
    credentials: Array<{
      credentialId: string;
      privateKey: string;
      userHandle: string;
      signCount: number;
      rpId: string;
      backupEligibility: boolean;
      backupState: boolean;
    }>;
  };

  const cred = credentials.at(-1);

  if (!cred) {
    throw new Error(
      'No credential found after registration. The navigator.credentials.create() call may not ' +
        'have been intercepted — ensure the CDP authenticator was installed before the page loaded.',
    );
  }

  console.log('\n=== GitHub Passkey Credential via CDP (copy to 1Password, see README.md) ===');
  console.log(`PASSKEY_ID=${base64ToBase64url(cred.credentialId)}`);
  console.log(`PASSKEY_PRIVATE_KEY=${base64ToBase64url(cred.privateKey)}`);
  console.log(`PASSKEY_USER_HANDLE=${base64ToBase64url(cred.userHandle)}`);
  console.log(
    `(rpId: ${cred.rpId}, backupEligibility: ${cred.backupEligibility}, backupState: ${cred.backupState})`,
  );
  console.log('===============================================================================\n');

  await context.close();
  await browser.close();
}

try {
  await main();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
