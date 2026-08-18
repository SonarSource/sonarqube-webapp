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

import * as v from 'valibot';

const languageDistributionSchema = v.record(v.string(), v.union([v.number(), v.string()]));

function parseLanguageLineCount(value: unknown): number | undefined {
  if (typeof value !== 'number' && typeof value !== 'string') {
    return undefined;
  }

  const parsedNum = Number.parseFloat(String(value));
  return Number.isFinite(parsedNum) ? parsedNum : undefined;
}

function normalizeLanguageDistributionEntries(
  distribution: Record<string, number | string>,
): Record<string, number> {
  return Object.entries(distribution).reduce(
    (acc, [key, lines]) => {
      const parsed = parseLanguageLineCount(lines);
      if (parsed !== undefined && parsed > 0) {
        acc[key] = Math.round(parsed);
      }
      return acc;
    },
    {} as Record<string, number>,
  );
}

function parseLegacyLanguageDistributionCounts(distribution: string): Record<string, number> {
  return distribution.split(';').reduce(
    (acc, keyLinesPair) => {
      const [key, lines] = keyLinesPair.split('=');
      const parsed = parseLanguageLineCount(lines);
      if (key && parsed !== undefined && parsed > 0) {
        acc[key] = Math.round(parsed);
      }
      return acc;
    },
    {} as Record<string, number>,
  );
}

export function parseLanguageDistributionCounts(distribution: unknown): Record<string, number> {
  if (distribution === undefined || distribution === null) {
    return {};
  }

  if (typeof distribution === 'string') {
    const trimmed = distribution.trim();
    if (!trimmed) {
      return {};
    }

    if (trimmed.startsWith('{')) {
      try {
        return parseLanguageDistributionCounts(JSON.parse(trimmed));
      } catch {
        return {};
      }
    }

    return parseLegacyLanguageDistributionCounts(trimmed);
  }

  const result = v.safeParse(languageDistributionSchema, distribution);
  if (result.success) {
    return normalizeLanguageDistributionEntries(result.output);
  }

  return {};
}

export function stringifyLanguageDistribution(distribution: Record<string, number>): string {
  return Object.entries(distribution)
    .map(([key, value]) => `${key}=${value}`)
    .join(';');
}
