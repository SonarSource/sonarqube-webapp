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

import { get, remove, save } from './storage';

const HISTORY_LIMIT = 10;

// Generic history manager

function createHistoryManager<T extends { key: string }>(storageKey: string) {
  function getHistory(): T[] {
    const history = get(storageKey);

    if (history == null) {
      return [];
    }

    try {
      return JSON.parse(history);
    } catch {
      remove(storageKey);

      return [];
    }
  }

  function setHistory(newHistory: T[]) {
    save(storageKey, JSON.stringify(newHistory));
  }

  function clearHistory() {
    remove(storageKey);
  }

  function addToHistory(newEntry: T) {
    const currentHistory = getHistory();
    let newHistory = currentHistory.filter((entry) => entry.key !== newEntry.key);
    newHistory.unshift(newEntry);
    newHistory = newHistory.slice(0, HISTORY_LIMIT);

    setHistory(newHistory);
  }

  function removeFromHistory(entryKey: string) {
    const history = getHistory();
    const newHistory = history.filter((entry) => entry.key !== entryKey);

    setHistory(newHistory);
  }

  return {
    add: addToHistory,
    clear: clearHistory,
    get: getHistory,
    remove: removeFromHistory,
    set: setHistory,
  };
}

// Project recent history

export interface History {
  key: string;
  name: string;
  organization?: string;
  qualifier: string;
}

export const RecentHistory = createHistoryManager<History>('sonar_recent_history');

// Organization recent history

export interface OrganizationHistory {
  key: string;
  name: string;
}

export const RecentOrganizationHistory = createHistoryManager<OrganizationHistory>(
  'sonar_recent_history_organizations',
);

// Enterprise recent history

export interface EnterpriseHistory {
  key: string;
  name: string;
}

export const RecentEnterpriseHistory = createHistoryManager<EnterpriseHistory>(
  'sonar_recent_history_enterprises',
);
