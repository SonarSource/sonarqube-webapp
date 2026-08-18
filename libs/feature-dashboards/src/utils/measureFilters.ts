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

import { MeasureFilters } from '../types/dashboard-widget';

/**
 * Builds the base issue search parameters from measure filters.
 * Shared logic for converting MeasureFilters to API/URL query parameters.
 */
export function buildMeasureFilterParams(measureFilters: MeasureFilters | undefined): {
  impactSeverities?: string;
  impactSoftwareQualities?: string;
  issueStatuses: string;
} {
  const issueStatuses =
    measureFilters?.issueStatus === undefined ? 'OPEN,CONFIRMED' : measureFilters.issueStatus;

  return {
    issueStatuses,
    ...(measureFilters?.impactSoftwareQuality
      ? { impactSoftwareQualities: measureFilters.impactSoftwareQuality }
      : {}),
    ...(measureFilters?.impactSeverities?.length
      ? { impactSeverities: measureFilters.impactSeverities.join(',') }
      : {}),
  };
}
