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

import { getJSON } from '~adapters/helpers/request';
import { getRuleDetails } from '../rules';

jest.mock('~adapters/helpers/request', () => ({
  getJSON: jest.fn(),
}));

beforeEach(() => {
  jest.mocked(getJSON).mockResolvedValue({});
});

describe('getRuleDetails', () => {
  it('does not request a contextKey for a regular rule', async () => {
    await getRuleDetails({ key: 'squid:S1337' });

    expect(getJSON).toHaveBeenCalledWith('/api/rules/show', {
      key: 'squid:S1337',
      contextKey: undefined,
    });
  });

  it.each(['hunter-agent:rule-test', 'external_hunter-agent:rule-test'])(
    "defaults the contextKey to the string 'null' for the Hunter Agent rule key %s",
    async (key) => {
      await getRuleDetails({ key });

      expect(getJSON).toHaveBeenCalledWith('/api/rules/show', {
        key,
        contextKey: 'null',
      });
    },
  );

  it('lets an explicit contextKey take precedence over the Hunter Agent default', async () => {
    await getRuleDetails({ contextKey: 'da-1cfd497e', key: 'hunter-agent:rule-test' });

    expect(getJSON).toHaveBeenCalledWith('/api/rules/show', {
      key: 'hunter-agent:rule-test',
      contextKey: 'da-1cfd497e',
    });
  });
});
