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
// CDP returns and expects plain base64; env vars and 1Password fields use base64url.

import process from 'node:process';

export function base64ToBase64url(b64: string): string {
  let result = b64.replaceAll('+', '-').replaceAll('/', '_');
  while (result.endsWith('=')) {
    result = result.slice(0, -1);
  }
  return result;
}

export function base64urlToBase64(b64url: string): string {
  const b64 = b64url.replaceAll('-', '+').replaceAll('_', '/');
  return b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), '=');
}

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}
