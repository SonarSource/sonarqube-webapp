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

import { X509Certificate } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

// Shared location, outside the repository, so every worktree/checkout reuses the same certificate.
export const DEV_CERTS_DIR = join(homedir(), '.sonarqube-webapp', 'certs');
export const DEV_CERT_PATH = join(DEV_CERTS_DIR, 'localhost.pem');
export const DEV_KEY_PATH = join(DEV_CERTS_DIR, 'localhost-key.pem');

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Tells whether the certificate created by `yarn setup-https` (and renewed by `nx start`) exists, is readable
 * and is not about to expire within `minDaysLeft` days.
 */
export function hasValidDevCert(minDaysLeft = 0) {
  if (!existsSync(DEV_KEY_PATH) || !existsSync(DEV_CERT_PATH)) {
    return false;
  }

  try {
    const { validTo } = new X509Certificate(readFileSync(DEV_CERT_PATH));
    return new Date(validTo).getTime() > Date.now() + minDaysLeft * MS_PER_DAY;
  } catch {
    return false;
  }
}

function readTlsFiles(keyPath: string, certPath: string) {
  try {
    return { key: readFileSync(keyPath), cert: readFileSync(certPath) };
  } catch (error) {
    // HTTPS is optional: a missing or unreadable certificate must never prevent the dev server from starting.
    // eslint-disable-next-line no-console
    console.warn(
      `[dev-https] Could not read the TLS certificate (${keyPath}, ${certPath}), serving over HTTP instead. ` +
        `Re-run \`yarn setup-https\` or set HTTPS=false to silence this. (${error instanceof Error ? error.message : String(error)})`,
    );
    return undefined;
  }
}

/**
 * Resolves the TLS options for the local dev server, or `undefined` to keep serving plain HTTP.
 * HTTPS is strictly opt-in and always falls back to HTTP, so existing setups are unaffected.
 *
 * - `HTTPS=false` disables HTTPS regardless.
 * - `HTTPS_KEY` + `HTTPS_CERT` always win, so any certificate can be used.
 * - Otherwise the certificate created by `yarn setup-https` (and renewed by `nx start`) is used, but only when proxying to an
 *   HTTPS environment, so local-backend setups (e.g. http://localhost:9000) are never affected.
 */
export function resolveDevHttps(env: NodeJS.ProcessEnv, proxyTarget: string) {
  if (env.HTTPS === 'false') {
    return undefined;
  }

  if (env.HTTPS_KEY && env.HTTPS_CERT) {
    return readTlsFiles(env.HTTPS_KEY, env.HTTPS_CERT);
  }

  if (proxyTarget.startsWith('https://')) {
    if (hasValidDevCert()) {
      return readTlsFiles(DEV_KEY_PATH, DEV_CERT_PATH);
    }

    // eslint-disable-next-line no-console
    console.warn(
      '[dev-https] No local HTTPS certificate found, serving over HTTP. To serve over HTTPS, install mkcert ' +
        '(https://github.com/FiloSottile/mkcert#installation), then run `yarn setup-https` once. ' +
        'Set HTTPS=false to silence this warning.',
    );
  }

  return undefined;
}
