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

import { useIntl } from 'react-intl';
import type { Period } from '../api/cost-savings-api';

interface Props {
  current: number;
  period: Period;
  previous: number;
}

const PERIOD_LABELS: Record<Period, string> = {
  all: 'period',
  month: 'month',
  quarter: 'quarter',
  year: 'year',
};

function DeltaIndicator({ current, previous, period }: Props) {
  const { formatMessage } = useIntl();

  if (previous === 0) {
    return null;
  }

  const pct = ((current - previous) / Math.abs(previous)) * 100;
  const isPositive = pct >= 0;
  const colorClass = isPositive ? 'sw-text-green-600' : 'sw-text-red-600';
  const arrow = isPositive ? '\u25B2' : '\u25BC';
  const sign = isPositive ? '+' : '';

  return (
    <div className="sw-text-sm sw-mt-1">
      <span className={colorClass}>
        {arrow} {sign}
        {pct.toFixed(0)}%
      </span>{' '}
      {formatMessage({ id: 'cost_savings.delta.vs_previous' }, { period: PERIOD_LABELS[period] })}
    </div>
  );
}

export { DeltaIndicator };
