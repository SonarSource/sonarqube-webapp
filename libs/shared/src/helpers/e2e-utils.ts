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

import { type Page } from '@playwright/test';

// CDP returns and expects plain base64; credentials are stored as base64url.
function base64urlToBase64(b64url: string): string {
  const b64 = b64url.replaceAll('-', '+').replaceAll('_', '/');
  return b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), '=');
}

/**
 * Installs a CDP virtual WebAuthn authenticator on the given page and registers
 * a credential for it. Any subsequent `navigator.credentials.get()` or
 * `navigator.credentials.create()` call on that page will be auto-handled by
 * the virtual authenticator — no human interaction required.
 *
 * Must be called before the page navigates to a URL that triggers a WebAuthn
 * ceremony; CDP intercepts the challenge synchronously.
 */
export async function installPasskeyCredential(
  page: Page,
  credentials: { id: string; privateKey: string; userHandle: string },
  rpId = 'github.com',
): Promise<void> {
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

  await cdp.send('WebAuthn.addCredential', {
    authenticatorId,
    credential: {
      credentialId: base64urlToBase64(credentials.id),
      isResidentCredential: true,
      rpId,
      privateKey: base64urlToBase64(credentials.privateKey),
      userHandle: base64urlToBase64(credentials.userHandle),
      signCount: initialSignCount,
      backupEligibility: true,
      backupState: true,
    },
  });

  cdp.on(
    'WebAuthn.credentialAsserted',
    ({ credential }: { credential: { credentialId: string; signCount: number } }) => {
      // eslint-disable-next-line no-console
      console.log(
        `[CDP WebAuthn] credentialAsserted — signCount: ${credential?.signCount ?? '?'}, ` +
          `credentialId: ${(credential?.credentialId ?? '?').slice(0, 16)}…`,
      );
    },
  );
}
