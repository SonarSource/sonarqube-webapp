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
const GITHUB_SETTINGS_URL = 'https://github.com/settings/profile';

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
    const response = await context.get(GITHUB_SETTINGS_URL, { maxRedirects: 0 });
    return response.status() === 200;
  } catch (error) {
    // Playwright's full call log can include the session cookie header.
    console.warn(`Session check failed for ${account}: ${errorSummary(error)}`);
    return false;
  } finally {
    await context.dispose();
  }
}

async function main() {
  const accounts = process.env.ACCOUNTS?.split(/\s+/).filter(Boolean) ?? [];
  if (accounts.length === 0) {
    throw new Error('ACCOUNTS is required');
  }

  const validSessions = await Promise.all(accounts.map(hasValidSession));
  if (validSessions.every(Boolean)) {
    console.log('All GitHub sessions are valid');
    return;
  }

  console.log('At least one GitHub session is invalid; both accounts need refreshing');
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
