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

import { isDefined, isStringDefined } from '~shared/helpers/types';
import {
  SoftwareImpactMeasureData,
  SoftwareImpactSeverity,
} from '~shared/types/clean-code-taxonomy';

export function getDataValueTotal(value?: string): number {
  if (isStringDefined(value)) {
    const distribution = JSON.parse(value) as SoftwareImpactMeasureData;
    return distribution.total;
  }
  return 0;
}

/**
 * Extracts the count for specific severities from a SoftwareImpactMeasureData JSON string.
 * If multiple severities are provided, returns the sum.
 * If no severities are provided, returns the total.
 */
export function getDataValueBySeverities(
  value?: string,
  severities?: SoftwareImpactSeverity[],
): number {
  if (!isStringDefined(value)) {
    return 0;
  }

  const distribution = JSON.parse(value) as SoftwareImpactMeasureData;

  // If no severities specified, return total
  if (!severities || severities.length === 0) {
    return distribution.total;
  }

  // Sum up the counts for specified severities
  return severities.reduce((sum, severity) => {
    return sum + (distribution[severity] || 0);
  }, 0);
}

/**
 * Parses a measure value that may be either a simple number or a JSON string with severity breakdown.
 * If severities are specified in the filters, sums only those severities.
 * If no severities are specified, returns the total for JSON strings or the raw value for numbers.
 */
export function parseMeasureValue(
  rawValue: string | undefined,
  measureFilters?: { impactSeverities?: SoftwareImpactSeverity[] },
): string | number | undefined {
  if (!isDefined(rawValue)) {
    return undefined;
  }

  // If the value is a JSON string with severity breakdown
  if (Number.isNaN(Number(rawValue))) {
    if (measureFilters?.impactSeverities && measureFilters.impactSeverities.length > 0) {
      // Filter by specified severities
      return getDataValueBySeverities(rawValue, measureFilters.impactSeverities);
    }
    // Get total
    return getDataValueTotal(rawValue);
  }

  // Value is a simple number
  return rawValue;
}
