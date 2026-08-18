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

import { useCallback } from 'react';
import { SoftwareQuality } from '~shared/types/clean-code-taxonomy';
import { IssueStatus, MeasureFilters } from '../../types/dashboard-widget';
import {
  applyIssueStatusMeasureFilters,
  applySeverityMeasureFilters,
  applySoftwareQualityMeasureFilters,
  applySoftwareQualityMeasureFiltersPreservingSeverity,
} from '../components/applyFilterAccordionHelpers';

export function useRichMeasureFilterHandlers(
  measureFilters: MeasureFilters | undefined,
  updateMeasureFilters: (newMeasureFilters: MeasureFilters) => void,
  preserveSeverityWhenSoftwareQualityIsCleared = false,
) {
  const setIssueStatusFilter = useCallback(
    (status: IssueStatus | '') => {
      updateMeasureFilters(applyIssueStatusMeasureFilters(measureFilters, status));
    },
    [measureFilters, updateMeasureFilters],
  );

  const setSoftwareQualityFilter = useCallback(
    (quality: SoftwareQuality | '') => {
      const applyFilters = preserveSeverityWhenSoftwareQualityIsCleared
        ? applySoftwareQualityMeasureFiltersPreservingSeverity
        : applySoftwareQualityMeasureFilters;
      updateMeasureFilters(applyFilters(measureFilters, quality));
    },
    [measureFilters, preserveSeverityWhenSoftwareQualityIsCleared, updateMeasureFilters],
  );

  const setSeverityFilter = useCallback(
    (option: string) => {
      updateMeasureFilters(applySeverityMeasureFilters(measureFilters, option));
    },
    [measureFilters, updateMeasureFilters],
  );

  return {
    setIssueStatusFilter,
    setSeverityFilter,
    setSoftwareQualityFilter,
  };
}
