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

import { installPasskeyCredential } from '../e2e-utils';

function makeMockPage(onEvent?: jest.Mock) {
  const cdp = {
    send: jest.fn(),
    on: onEvent ?? jest.fn(),
  };

  cdp.send.mockImplementation((method: string) => {
    if (method === 'WebAuthn.addVirtualAuthenticator') {
      return Promise.resolve({ authenticatorId: 'mock-authenticator-id' });
    }
    return Promise.resolve({});
  });

  const context = {
    newCDPSession: jest.fn().mockResolvedValue(cdp),
  };

  const page = {
    context: jest.fn().mockReturnValue(context),
  };

  return { page, cdp, context };
}

const credentials = {
  id: 'test-id_A',
  privateKey: 'private-key_B',
  userHandle: 'user-handle_C',
};

describe('installPasskeyCredential', () => {
  it('should create a CDP session on the page', async () => {
    const { page, context } = makeMockPage();

    await installPasskeyCredential(page as never, credentials);

    expect(page.context).toHaveBeenCalled();
    expect(context.newCDPSession).toHaveBeenCalledWith(page);
  });

  it('should enable WebAuthn with enableUI: false', async () => {
    const { page, cdp } = makeMockPage();

    await installPasskeyCredential(page as never, credentials);

    expect(cdp.send).toHaveBeenCalledWith('WebAuthn.enable', { enableUI: false });
  });

  it('should add a virtual authenticator with the correct options', async () => {
    const { page, cdp } = makeMockPage();

    await installPasskeyCredential(page as never, credentials);

    expect(cdp.send).toHaveBeenCalledWith('WebAuthn.addVirtualAuthenticator', {
      options: {
        protocol: 'ctap2',
        transport: 'internal',
        hasResidentKey: true,
        hasUserVerification: true,
        isUserVerified: true,
      },
    });
  });

  it('should add a credential with base64url values converted to base64 and default rpId', async () => {
    const { page, cdp } = makeMockPage();

    await installPasskeyCredential(page as never, credentials);

    const addCredentialCall = cdp.send.mock.calls.find(
      ([method]: [string]) => method === 'WebAuthn.addCredential',
    );
    expect(addCredentialCall).toBeDefined();
    const [, { authenticatorId, credential }] = addCredentialCall as [
      string,
      { authenticatorId: string; credential: Record<string, unknown> },
    ];

    expect(authenticatorId).toBe('mock-authenticator-id');
    // 'test-id_A' (9 chars) → 'test+id/A' → padded to multiple of 4: 'test+id/A==='
    expect(credential.credentialId).toBe('test+id/A===');
    // 'private-key_B' (13 chars) → 'private+key/B' → padded: 'private+key/B==='
    expect(credential.privateKey).toBe('private+key/B===');
    // 'user-handle_C' (13 chars) → 'user+handle/C' → padded: 'user+handle/C==='
    expect(credential.userHandle).toBe('user+handle/C===');
    expect(credential.rpId).toBe('github.com');
  });

  it('should use a custom rpId when provided', async () => {
    const { page, cdp } = makeMockPage();

    await installPasskeyCredential(page as never, credentials, 'sonarcloud.io');

    const addCredentialCall = cdp.send.mock.calls.find(
      ([method]: [string]) => method === 'WebAuthn.addCredential',
    );
    const [, { credential }] = addCredentialCall as [
      string,
      { credential: Record<string, unknown> },
    ];

    expect(credential.rpId).toBe('sonarcloud.io');
  });

  it('should add a credential with isResidentCredential and backup flags set', async () => {
    const { page, cdp } = makeMockPage();

    await installPasskeyCredential(page as never, credentials);

    const addCredentialCall = cdp.send.mock.calls.find(
      ([method]: [string]) => method === 'WebAuthn.addCredential',
    );
    const [, { credential }] = addCredentialCall as [
      string,
      { credential: Record<string, unknown> },
    ];

    expect(credential.isResidentCredential).toBe(true);
    expect(credential.backupEligibility).toBe(true);
    expect(credential.backupState).toBe(true);
  });

  it('should register a credentialAsserted event listener', async () => {
    const onEvent = jest.fn();
    const { page } = makeMockPage(onEvent);

    await installPasskeyCredential(page as never, credentials);

    expect(onEvent).toHaveBeenCalledWith('WebAuthn.credentialAsserted', expect.any(Function));
  });

  it('should set signCount to approximately the current Unix timestamp', async () => {
    const { page, cdp } = makeMockPage();
    const before = Math.floor(Date.now() / 1000);

    await installPasskeyCredential(page as never, credentials);

    const after = Math.floor(Date.now() / 1000);

    const addCredentialCall = cdp.send.mock.calls.find(
      ([method]: [string]) => method === 'WebAuthn.addCredential',
    );
    const [, { credential }] = addCredentialCall as [
      string,
      { credential: Record<string, unknown> },
    ];

    expect(credential.signCount).toBeGreaterThanOrEqual(before);
    expect(credential.signCount).toBeLessThanOrEqual(after);
  });

  describe('credentialAsserted event handler', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    function getAssertedHandler(onEvent: jest.Mock) {
      const assertedCall = onEvent.mock.calls.find(
        ([event]: [string]) => event === 'WebAuthn.credentialAsserted',
      );
      return assertedCall[1] as (arg: {
        credential: { credentialId?: string; signCount?: number };
      }) => void;
    }

    it('should log signCount and the first 16 chars of credentialId', async () => {
      const onEvent = jest.fn();
      const { page } = makeMockPage(onEvent);

      await installPasskeyCredential(page as never, credentials);

      getAssertedHandler(onEvent)({
        credential: { signCount: 42, credentialId: 'abcdefghijklmnopqrstuvwx' },
      });

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('signCount: 42'));
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('credentialId: abcdefghijklmnop…'),
      );
    });

    it('should fall back to ? when signCount is undefined', async () => {
      const onEvent = jest.fn();
      const { page } = makeMockPage(onEvent);

      await installPasskeyCredential(page as never, credentials);

      getAssertedHandler(onEvent)({
        credential: { credentialId: 'abcdefghijklmnopqrstuvwx' },
      });

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('signCount: ?'));
    });

    it('should fall back to ? when credentialId is undefined', async () => {
      const onEvent = jest.fn();
      const { page } = makeMockPage(onEvent);

      await installPasskeyCredential(page as never, credentials);

      getAssertedHandler(onEvent)({ credential: { signCount: 10 } });

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('credentialId: ?…'));
    });
  });

  it('should pad base64url values to a multiple of 4 chars', async () => {
    const { page, cdp } = makeMockPage();

    // 'ab' in base64url has length 2, needs 2 padding chars
    await installPasskeyCredential(page as never, {
      id: 'ab',
      privateKey: 'abc',
      userHandle: 'abcd',
    });

    const addCredentialCall = cdp.send.mock.calls.find(
      ([method]: [string]) => method === 'WebAuthn.addCredential',
    );
    const [, { credential }] = addCredentialCall as [
      string,
      { credential: Record<string, unknown> },
    ];

    expect(credential.credentialId).toBe('ab==');
    expect(credential.privateKey).toBe('abc=');
    expect(credential.userHandle).toBe('abcd');
  });
});
