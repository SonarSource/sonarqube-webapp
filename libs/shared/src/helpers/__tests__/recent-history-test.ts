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

import { ComponentQualifier } from '../../types/component';
import {
  History,
  RecentEnterpriseHistory,
  RecentHistory,
  RecentOrganizationHistory,
} from '../recent-history';
import { get, remove, save } from '../storage';

jest.mock('~shared/helpers/storage', () => ({
  get: jest.fn(),
  remove: jest.fn(),
  save: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

// Test the generic history manager implementation using RecentHistory as the test subject
// All three histories (RecentHistory, RecentOrganizationHistory, RecentEnterpriseHistory)
// use the same underlying createHistoryManager implementation

describe('History Manager (generic implementation)', () => {
  it('should get existing history', () => {
    const history = [{ key: 'foo', name: 'Foo' }];

    jest.mocked(get).mockReturnValueOnce(JSON.stringify(history));
    expect(RecentHistory.get()).toEqual(history);
    expect(get).toHaveBeenCalledWith('sonar_recent_history');
  });

  it('should get empty history when storage is null', () => {
    jest.mocked(get).mockReturnValueOnce(null);
    expect(RecentHistory.get()).toEqual([]);
    expect(get).toHaveBeenCalledWith('sonar_recent_history');
  });

  it('should return [] and clear history when JSON parsing fails', () => {
    jest.mocked(get).mockReturnValueOnce('not a json');
    expect(RecentHistory.get()).toEqual([]);
    expect(get).toHaveBeenCalledWith('sonar_recent_history');
    expect(remove).toHaveBeenCalledWith('sonar_recent_history');
  });

  it('should save history', () => {
    const history = [
      { key: 'foo', name: 'Foo', organization: 'org', qualifier: ComponentQualifier.Project },
    ];

    RecentHistory.set(history);
    expect(save).toHaveBeenCalledWith('sonar_recent_history', JSON.stringify(history));
  });

  it('should clear history', () => {
    RecentHistory.clear();
    expect(remove).toHaveBeenCalledWith('sonar_recent_history');
  });

  it('should add item to history', () => {
    const history = [{ key: 'foo', name: 'Foo' }];

    jest.mocked(get).mockReturnValueOnce(JSON.stringify(history));
    RecentHistory.add({ key: 'bar', name: 'Bar', qualifier: ComponentQualifier.Portfolio });

    expect(save).toHaveBeenCalledWith(
      'sonar_recent_history',
      JSON.stringify([
        { key: 'bar', name: 'Bar', qualifier: ComponentQualifier.Portfolio },
        ...history,
      ]),
    );
  });

  it('should keep 10 items maximum', () => {
    const history: History[] = [];

    for (let i = 0; i < 10; i++) {
      history.push({
        key: `key-${i}`,
        name: `name-${i}`,
        organization: 'org',
        qualifier: ComponentQualifier.Project,
      });
    }

    jest.mocked(get).mockReturnValueOnce(JSON.stringify(history));

    RecentHistory.add({
      key: 'bar',
      name: 'Bar',
      organization: 'org',
      qualifier: ComponentQualifier.Portfolio,
    });

    expect(save).toHaveBeenCalledWith(
      'sonar_recent_history',
      JSON.stringify([
        { key: 'bar', name: 'Bar', organization: 'org', qualifier: ComponentQualifier.Portfolio },
        ...history.slice(0, 9),
      ]),
    );
  });

  it('should remove item from history', () => {
    const history: History[] = [];

    for (let i = 0; i < 10; i++) {
      history.push({
        key: `key-${i}`,
        name: `name-${i}`,
        organization: 'org',
        qualifier: ComponentQualifier.Project,
      });
    }

    jest.mocked(get).mockReturnValueOnce(JSON.stringify(history));
    RecentHistory.remove('key-5');

    expect(save).toHaveBeenCalledWith(
      'sonar_recent_history',
      JSON.stringify([...history.slice(0, 5), ...history.slice(6)]),
    );
  });

  it('should move existing item to the top when added again', () => {
    const history = [
      {
        key: 'key1',
        name: 'Name 1',
        organization: 'org',
        qualifier: ComponentQualifier.Project,
      },
      {
        key: 'key2',
        name: 'Name 2',
        organization: 'org',
        qualifier: ComponentQualifier.Project,
      },
      {
        key: 'key3',
        name: 'Name 3',
        organization: 'org',
        qualifier: ComponentQualifier.Project,
      },
    ];

    jest.mocked(get).mockReturnValueOnce(JSON.stringify(history));

    RecentHistory.add({
      key: 'key2',
      name: 'Name 2 Updated',
      organization: 'org',
      qualifier: ComponentQualifier.Project,
    });

    expect(save).toHaveBeenCalledWith(
      'sonar_recent_history',
      JSON.stringify([
        {
          key: 'key2',
          name: 'Name 2 Updated',
          organization: 'org',
          qualifier: ComponentQualifier.Project,
        },
        history[0],
        history[2],
      ]),
    );
  });
});

// Tests to verify each exported history uses the correct storage key

describe('RecentHistory', () => {
  it('should use correct storage key', () => {
    jest.mocked(get).mockReturnValueOnce(null);
    RecentHistory.get();
    expect(get).toHaveBeenCalledWith('sonar_recent_history');
  });
});

describe('RecentOrganizationHistory', () => {
  it('should use correct storage key', () => {
    jest.mocked(get).mockReturnValueOnce(null);
    RecentOrganizationHistory.get();
    expect(get).toHaveBeenCalledWith('sonar_recent_history_organizations');
  });

  it('should add and retrieve organization', () => {
    jest.mocked(get).mockReturnValueOnce('[]');
    RecentOrganizationHistory.add({ key: 'org1', name: 'Org 1' });

    expect(save).toHaveBeenCalledWith(
      'sonar_recent_history_organizations',
      JSON.stringify([{ key: 'org1', name: 'Org 1' }]),
    );
  });
});

describe('RecentEnterpriseHistory', () => {
  it('should use correct storage key', () => {
    jest.mocked(get).mockReturnValueOnce(null);
    RecentEnterpriseHistory.get();
    expect(get).toHaveBeenCalledWith('sonar_recent_history_enterprises');
  });

  it('should add and retrieve enterprise', () => {
    jest.mocked(get).mockReturnValueOnce('[]');
    RecentEnterpriseHistory.add({ key: 'ent1', name: 'Enterprise 1' });

    expect(save).toHaveBeenCalledWith(
      'sonar_recent_history_enterprises',
      JSON.stringify([{ key: 'ent1', name: 'Enterprise 1' }]),
    );
  });
});
