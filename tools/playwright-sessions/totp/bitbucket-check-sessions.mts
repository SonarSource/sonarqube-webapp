/*
 * Copyright (C) 2009-2025 SonarSource Sàrl
 * All rights reserved
 * mailto:info AT sonarsource DOT com
 */

import { request, type APIRequestContext } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const AUTH_DIR = path.resolve('private/sq-cloud-e2e-tests/playwright/.auth');
const BITBUCKET_ACCOUNT_URL = 'https://bitbucket.org/account/settings/';

function errorSummary(error: unknown): string {
  return error instanceof Error
    ? (error.message.split(/\r?\n/, 1)[0] ?? error.name)
    : 'unknown error';
}

async function hasValidSession(account: string): Promise<boolean> {
  const sessionFile = path.join(AUTH_DIR, `${account}.json`);
  if (!fs.existsSync(sessionFile)) {
    return false;
  }

  let context: APIRequestContext;
  try {
    context = await request.newContext({ storageState: sessionFile });
  } catch {
    return false;
  }

  try {
    const response = await context.get(BITBUCKET_ACCOUNT_URL, {
      maxRedirects: 5,
      failOnStatusCode: false,
    });
    return response.ok() && response.url().startsWith('https://bitbucket.org');
  } catch (error) {
    // Playwright's full call log can include the session cookie header.
    console.warn(`Session check failed for ${account}: ${errorSummary(error)}`);
    return false;
  } finally {
    await context.dispose();
  }
}

async function main() {
  const accounts = process.env.BBC_ACCOUNTS?.split(/\s+/).filter(Boolean) ?? [];
  if (accounts.length === 0) {
    throw new Error('BBC_ACCOUNTS is required');
  }

  const validSessions = await Promise.all(accounts.map(hasValidSession));
  if (validSessions.every(Boolean)) {
    console.log('All Bitbucket sessions are valid');
    return;
  }

  console.log('At least one Bitbucket session is invalid; it needs refreshing');
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, 'needs_refresh=true\n');
  }
}

try {
  await main();
} catch (error) {
  console.error(`Session check failed: ${errorSummary(error)}`);
  process.exitCode = 1;
}
