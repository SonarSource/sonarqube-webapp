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

/*
 * Prepares the locally trusted HTTPS certificate used by the local dev server.
 * Uses mkcert (https://github.com/FiloSottile/mkcert).
 *
 * - `--auto` (run by the `yarn start-*` scripts through the nx `https-check` target): best effort and never
 *   fails. HTTPS is optional, so any problem results in a warning and the dev server starts over plain HTTP.
 *   It only does something when proxying to an https:// environment (PROXY), and not when HTTPS=false or
 *   when HTTPS_KEY/HTTPS_CERT provide your own certificate. It only creates the first certificate when
 *   run in a real terminal, because mkcert may need to ask for your password.
 * - no flag (`yarn setup-https`): the full setup, to run in your own terminal. It trusts mkcert's
 *   local CA and creates the certificate, and fails loudly if it cannot complete.
 */

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { DEV_CERT_PATH, DEV_CERTS_DIR, DEV_KEY_PATH, hasValidDevCert } from './vite/dev-https.ts';

const RENEW_WHEN_DAYS_LEFT = 30;
const isAuto = process.argv.includes('--auto');
// With a real terminal (e.g. \`yarn start-sqc\` in your shell), mkcert can ask for your password.
const canPrompt = Boolean(process.stdin.isTTY && process.stdout.isTTY);
// Written when trusting the CA failed (e.g. your machine does not allow it), so that every start does not ask for a password again.
const SETUP_FAILED_MARKER = join(DEV_CERTS_DIR, '.setup-failed');

const INSTALL_HINTS = [
  '  macOS:   brew install mkcert',
  '  Linux:   https://github.com/FiloSottile/mkcert#linux',
  '  Windows: choco install mkcert  (or scoop install mkcert)',
];

function isMkcertInstalled() {
  return !spawnSync('mkcert', ['-help'], { stdio: 'ignore' }).error;
}

function createCertificate({ trustCa }) {
  if (trustCa) {
    // Adds mkcert's local CA to the system/browser trust stores. mkcert asks for your password through a
    // prompt it labels "Sudo password:" (hardcoded in mkcert, it cannot be changed from here).
    console.log(
      '[https] mkcert may ask for your user password (the prompt is labelled "Sudo password:").',
    );
    execFileSync('mkcert', ['-install'], { stdio: 'inherit' });
  }

  mkdirSync(DEV_CERTS_DIR, { recursive: true });
  execFileSync(
    'mkcert',
    ['-key-file', DEV_KEY_PATH, '-cert-file', DEV_CERT_PATH, 'localhost', '127.0.0.1', '::1'],
    { stdio: 'inherit' },
  );
}

// The first setup trusts mkcert's local CA, which may need your password.
function createFirstCertificate() {
  if (!canPrompt) {
    console.warn(
      '[https] No local certificate yet. Run `yarn setup-https` once to create it. Starting over HTTP.',
    );
    return;
  }

  if (existsSync(SETUP_FAILED_MARKER)) {
    console.warn(
      '[https] Skipping HTTPS: the last setup failed. Run `yarn setup-https` to retry. Starting over HTTP.',
    );
    return;
  }

  console.log(
    '[https] No local certificate yet, creating one with mkcert (it may ask for your password)...',
  );
  try {
    createCertificate({ trustCa: true });
    console.log(`[https] Certificate created in ${DEV_CERTS_DIR}`);
  } catch (error) {
    mkdirSync(DEV_CERTS_DIR, { recursive: true });
    writeFileSync(SETUP_FAILED_MARKER, new Date().toISOString());
    console.warn(
      `[https] Could not create the local certificate, starting the dev server over HTTP. (${error instanceof Error ? error.message : String(error)})\n` +
        '  Run `yarn setup-https` to retry, or set HTTPS=false to skip this.',
    );
  }
}

function runAuto() {
  const { HTTPS, HTTPS_KEY, HTTPS_CERT, PROXY = '' } = process.env;

  // Nothing to do: HTTPS was disabled, a custom certificate is provided, or the dev server targets a local backend.
  if (HTTPS === 'false' || (HTTPS_KEY && HTTPS_CERT) || !PROXY.startsWith('https://')) {
    return;
  }

  if (!isMkcertInstalled()) {
    // The dev server prints the warning shown to developers, as nx hides the output of successful tasks.
    console.warn(
      `[https] mkcert was not found, starting the dev server over HTTP. Install it to enable HTTPS:\n${INSTALL_HINTS.join('\n')}`,
    );
    return;
  }

  if (hasValidDevCert(RENEW_WHEN_DAYS_LEFT)) {
    console.log(`[https] Using the local certificate from ${DEV_CERTS_DIR}`);
    return;
  }

  if (!existsSync(DEV_CERT_PATH)) {
    createFirstCertificate();
    return;
  }

  // The certificate exists, so the CA is already trusted: renewing it needs no password.
  console.log('[https] The local certificate is about to expire, renewing it with mkcert...');
  try {
    createCertificate({ trustCa: false });
    console.log(`[https] Certificate renewed in ${DEV_CERTS_DIR}`);
  } catch (error) {
    console.warn(
      `[https] Could not renew the local certificate, starting the dev server over HTTP. (${error instanceof Error ? error.message : String(error)})`,
    );
  }
}

function runManual() {
  if (!isMkcertInstalled()) {
    console.error(
      'mkcert is required but was not found. Install it, then re-run `yarn setup-https`:',
    );
    console.error(INSTALL_HINTS.join('\n'));
    process.exit(1);
  }

  try {
    createCertificate({ trustCa: true });
  } catch (error) {
    console.error(
      `\nCould not create the local certificate: ${error instanceof Error ? error.message : String(error)}\n` +
        'If mkcert could not trust its CA because your machine does not allow it, the dev server keeps working over HTTP.\n' +
        'On Linux you can trust the browser store only, which needs no admin rights: TRUST_STORES=nss yarn setup-https',
    );
    process.exit(1);
  }

  rmSync(SETUP_FAILED_MARKER, { force: true });

  console.log(`
HTTPS is ready. Certificate stored in ${DEV_CERTS_DIR}

\`nx start\` now serves https://localhost:<port> automatically whenever PROXY is an https:// URL:
  PROXY=https://sonarcloud.io yarn start-sqc

Set HTTPS=false to go back to plain HTTP for a run.`);
}

if (isAuto) {
  runAuto();
} else {
  runManual();
}
