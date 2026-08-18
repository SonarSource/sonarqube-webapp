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

import { Text } from '@sonarsource/echoes-react';
import { useCallback, useMemo, type ReactNode } from 'react';
import { useIntl } from 'react-intl';
import { getMttrCalendarMessage } from '../utils/datetime';

interface MttrFormatters {
  /** Full calendar duration, e.g. "3 days". Compact drops the unit to "3d" so axis labels fit. */
  formatMttr: (value: number, options?: { compact?: boolean }) => string;
  formatMttrDotValue: (value: number) => ReactNode;
  formatMttrTick: (tick: number) => string;
}

/**
 * Localized MTTR duration formatters for widgets whose values are minutes-to-resolution rather
 * than measures, so they cannot go through the numeric line chart/measure formatters.
 */
export function useMttrFormatters(): MttrFormatters {
  const { formatMessage } = useIntl();

  const formatMttr = useCallback(
    (value: number, options?: { compact?: boolean }) => {
      const { id, values } = getMttrCalendarMessage(value, { compact: options?.compact });
      return formatMessage({ id }, values);
    },
    [formatMessage],
  );

  const formatMttrTick = useCallback(
    (tick: number) => formatMttr(tick, { compact: true }),
    [formatMttr],
  );

  const formatMttrDotValue = useCallback(
    (value: number) => <Text isHighlighted>{formatMttr(value)}</Text>,
    [formatMttr],
  );

  return useMemo(
    () => ({ formatMttr, formatMttrDotValue, formatMttrTick }),
    [formatMttr, formatMttrDotValue, formatMttrTick],
  );
}
