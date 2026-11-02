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
 * Automated Bitbucket Cloud login script using the account's TOTP secret.
 *
 * Called by the CI workflow that refreshes e2e test sessions. Produces a Playwright
 * storageState JSON file that tests can reuse via `storageState` in their playwright
 * config or fixture.
 *
 * Usage:
 *
 *   node tools/playwright-sessions/totp/bitbucket-login.mts <output-path>
 *
 * Example:
 *
 *   node tools/playwright-sessions/totp/bitbucket-login.mts \
 *     private/sq-cloud-e2e-tests/playwright/.auth/bitbucket-e2e.json
 *
 * Required env vars:
 *   ACCEPTANCE_TESTS_BITBUCKET_USERNAME
 *   ACCEPTANCE_TESTS_BITBUCKET_PASSWORD
 *   ACCEPTANCE_TESTS_BITBUCKET_TOTP_SECRET
 *
 * See ../README.md for full details.
 */

import { chromium, type Locator, type Page } from '@playwright/test';
import path from 'node:path';
import process from 'node:process';
import * as OTPAuth from 'otpauth';
import { requireEnv } from '../passkey/utils.mts';

const BITBUCKET_SIGNIN_URL = 'https://bitbucket.org/account/signin/';
const JUMPCLOUD_LOGIN_PATTERN = 'https://console.jumpcloud.com/login*';
const INVALID_TOTP_MESSAGE = 'Verification code was invalid or already used.';
const TOTP_RESULT_TIMEOUT_MS = 10_000;
const MAX_TOTP_ATTEMPTS = 3;

async function submitTotpCode(page: Page, code: string) {
  const invalidTotpBanner = page.getByText(INVALID_TOTP_MESSAGE);
  const invalidBannerWasVisible = await invalidTotpBanner.isVisible();
  const verifyIdentityHeading = page.getByRole('heading', { name: 'Verify Your Identity' });

  // These boxes auto-advance focus on input; filling them concurrently races that
  // behavior and can scramble which digit lands in which box, so fill sequentially.
  for (const [index, digit] of [...code].entries()) {
    await page
      .locator(`input:nth-child(${index + 1})`)
      .first()
      .fill(digit);
  }

  // Some JumpCloud flows auto-submit after the sixth digit, some keep an explicit Submit button
  await page
    .getByRole('button', { name: 'Submit' })
    .click({ timeout: 1_000 })
    .catch(() => undefined);

  return Promise.any([
    waitForTotpRejection(invalidTotpBanner, invalidBannerWasVisible),
    verifyIdentityHeading
      .waitFor({ state: 'hidden', timeout: TOTP_RESULT_TIMEOUT_MS })
      .then(() => true),
  ]).catch(async () => !(await verifyIdentityHeading.isVisible()));
}

async function waitForTotpRejection(invalidTotpBanner: Locator, invalidBannerWasVisible: boolean) {
  const startedAt = Date.now();

  if (invalidBannerWasVisible) {
    // A retry can inherit the previous rejection banner briefly, so wait for it to clear first
    await invalidTotpBanner.waitFor({ state: 'hidden', timeout: TOTP_RESULT_TIMEOUT_MS });
  }

  const remainingTimeoutMs = Math.max(TOTP_RESULT_TIMEOUT_MS - (Date.now() - startedAt), 1);
  await invalidTotpBanner.waitFor({ state: 'visible', timeout: remainingTimeoutMs });

  return false;
}

async function authenticateWithTotp(page: Page) {
  const username = requireEnv('ACCEPTANCE_TESTS_BITBUCKET_USERNAME');
  const password = requireEnv('ACCEPTANCE_TESTS_BITBUCKET_PASSWORD');
  const totpSecret = requireEnv('ACCEPTANCE_TESTS_BITBUCKET_TOTP_SECRET');

  const totp = new OTPAuth.TOTP({
    issuer: 'Bitbucket',
    label: username,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: totpSecret,
  });

  await page.goto(BITBUCKET_SIGNIN_URL);
  await page.getByPlaceholder('Enter your email').fill(username);
  await page.getByRole('button', { name: 'Continue', exact: true }).click();

  await page.waitForURL(JUMPCLOUD_LOGIN_PATTERN, { timeout: 30_000 });
  await page.getByPlaceholder('User Email Address').fill(username);
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByPlaceholder('User Password').fill(password);
  await page.getByRole('button', { name: 'SSO Login', exact: true }).click();

  await attemptTotpLogin(page, totp, 1);
}

// Attempts are inherently sequential: each one depends on the page state left by the
// previous attempt, and a rejection must wait out the current TOTP period before retrying.
async function attemptTotpLogin(page: Page, totp: OTPAuth.TOTP, attempt: number): Promise<void> {
  console.log(`[bitbucket-login] TOTP attempt ${attempt}/${MAX_TOTP_ATTEMPTS}`);

  if (await submitTotpCode(page, totp.generate())) {
    console.log(`[bitbucket-login] TOTP attempt ${attempt} accepted`);
    await page.waitForURL((u) => u.hostname.endsWith('bitbucket.org'), { timeout: 30_000 });
    return;
  }

  console.log(`[bitbucket-login] TOTP attempt ${attempt} was rejected`);

  if (attempt >= MAX_TOTP_ATTEMPTS) {
    throw new Error(`Bitbucket TOTP verification was rejected ${MAX_TOTP_ATTEMPTS} times.`);
  }

  // A code is only valid for the rest of its current period; retrying immediately would
  // resubmit the same already-rejected code. totp.remaining() already returns milliseconds
  // until the next period, so wait for that plus a small buffer.
  const waitMs = totp.remaining() + 1_000;
  console.log(`[bitbucket-login] waiting ${waitMs}ms for the next TOTP window`);
  await new Promise<void>((resolve) => {
    setTimeout(resolve, waitMs);
  });

  await attemptTotpLogin(page, totp, attempt + 1);
}

async function main() {
  const outputPath = process.argv[2];
  if (!outputPath) {
    throw new Error(
      'Missing required argument: output path\n' +
        'Usage: node tools/playwright-sessions/totp/bitbucket-login.mts <output-path>',
    );
  }

  const resolvedOutputPath = path.resolve(outputPath);
  console.log(`[bitbucket-login] session will be saved to: ${resolvedOutputPath}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await authenticateWithTotp(page);

    await context.storageState({ path: resolvedOutputPath });
    console.log(`[bitbucket-login] session saved to ${resolvedOutputPath}`);
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
