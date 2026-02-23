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

import { webcrypto } from 'node:crypto';
import { hashSHA256, uuidv4 } from '../crypto';

// jsdom does not expose crypto.subtle — polyfill it with Node's Web Crypto implementation
beforeAll(() => {
  Object.defineProperty(globalThis.crypto, 'subtle', {
    value: webcrypto.subtle,
    writable: true,
    configurable: true,
  });
});

describe('hashSHA256', () => {
  it('should return a 64-character lowercase hex string', async () => {
    const hash = await hashSHA256('hello');
    expect(hash).toHaveLength(64);
    expect(/^[0-9a-f]{64}$/.test(hash)).toBe(true);
  });

  it('should be deterministic for the same input', async () => {
    const hash1 = await hashSHA256('sonarsource.com');
    const hash2 = await hashSHA256('sonarsource.com');
    expect(hash1).toEqual(hash2);
  });

  it('should produce different hashes for different inputs', async () => {
    const hash1 = await hashSHA256('domain-a.com');
    const hash2 = await hashSHA256('domain-b.com');
    expect(hash1).not.toEqual(hash2);
  });

  it('should match a known SHA-256 value', async () => {
    // SHA-256("hello") is a well-known test vector
    const hash = await hashSHA256('hello');
    expect(hash).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
  });
});

describe('uuidv4', () => {
  it('should return a random uuidv4', () => {
    const uuid1 = uuidv4();
    const uuid2 = uuidv4();
    expect(uuid1).not.toEqual(uuid2);
    expect(/\w{8}(-\w{4}){3}-\w{12}/.test(uuid1)).toBe(true);
    expect(/\w{8}(-\w{4}){3}-\w{12}/.test(uuid2)).toBe(true);
  });
});
