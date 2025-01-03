/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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

import { fetchL10nBundle } from '../../api/l10n';
import { loadL10nBundle } from '../l10nBundle';
import { mockAppState } from '../testMocks';

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(window.navigator, 'languages', 'get').mockReturnValue(['de']);
});

jest.mock('../../api/l10n', () => ({
  fetchL10nBundle: jest.fn().mockResolvedValue({
    effectiveLocale: 'de',
    messages: { foo: 'Foo', 'foo.bar': 'Foo Bar' },
  }),
}));

afterAll(() => {
  jest.spyOn(window.navigator, 'languages', 'get').mockRestore();
});

const APP_STATE = mockAppState({});

describe('#loadL10nBundle', () => {
  it('should fetch bundle without any timestamp', async () => {
    const bundle = await loadL10nBundle(APP_STATE);

    expect(fetchL10nBundle).toHaveBeenCalledWith({ locale: 'de', ts: undefined });

    expect(bundle).toEqual(
      expect.objectContaining({
        locale: 'de',
        messages: expect.objectContaining({ foo: 'Foo', admin: 'Admin' }),
      }),
    );
  });

  it('should fetch bundle without local storage timestamp if locales are different', async () => {
    const cachedBundle = { timestamp: 'timestamp', locale: 'fr', messages: { cache: 'cache' } };
    (window as unknown as any).sonarQubeL10nBundle = cachedBundle;

    await loadL10nBundle(APP_STATE);

    expect(fetchL10nBundle).toHaveBeenCalledWith({ locale: 'de', ts: undefined });
  });

  it('should fetch bundle with cached bundle timestamp and browser locale', async () => {
    jest.spyOn(window.navigator, 'languages', 'get').mockReturnValue(['de']);
    const cachedBundle = { timestamp: 'timestamp', locale: 'de', messages: { cache: 'cache' } };
    (window as unknown as any).sonarQubeL10nBundle = cachedBundle;

    await loadL10nBundle(APP_STATE);

    expect(fetchL10nBundle).toHaveBeenCalledWith({ locale: 'de', ts: cachedBundle.timestamp });
  });

  it('should ignore core translations for default locale', async () => {
    jest.mocked(fetchL10nBundle).mockResolvedValueOnce({
      effectiveLocale: 'en',
      messages: { yes: 'No', newmessage: 'yes!' },
    });
    jest.spyOn(window.navigator, 'languages', 'get').mockReturnValue(['en']);

    const { messages } = await loadL10nBundle(APP_STATE);

    expect(messages.yes).toBe('Yes'); // overriden by defaults
    expect(messages.newmessage).toBe('yes!'); // added to defaults
  });
});
