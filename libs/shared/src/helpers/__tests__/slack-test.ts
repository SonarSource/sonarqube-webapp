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

import { getSlackRedirectUrl } from '../slack';

describe('getSlackRedirectUrl', () => {
  it('should keep a well-formed https://slack.com URL as-is', () => {
    expect(getSlackRedirectUrl('https://slack.com/phish')?.href).toBe('https://slack.com/phish');
  });

  it('should force the host to slack.com when a different https host is forged', () => {
    expect(getSlackRedirectUrl('https://attacker.example.com/phish')?.href).toBe(
      'https://slack.com/phish',
    );
  });

  it('should strip a forged port and credentials when forcing the host to slack.com', () => {
    expect(getSlackRedirectUrl('https://user:pass@attacker.example.com:8443/phish')?.href).toBe(
      'https://slack.com/phish',
    );
  });

  it.each([
    ['javascript:alert(document.domain)'],
    ['data:text/html,<script>alert(1)</script>'],
    ['http://attacker.example.com'],
    ['ftp://attacker.example.com'],
    ['not-a-url'],
  ])('should reject a redirectUri that is not a valid https URL (%s)', (redirectUri) => {
    expect(getSlackRedirectUrl(redirectUri)).toBeUndefined();
  });
});
