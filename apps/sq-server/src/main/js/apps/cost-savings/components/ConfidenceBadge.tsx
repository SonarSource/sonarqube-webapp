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

interface Props {
  level: 'high' | 'estimated' | 'contextual';
}

const BADGE_STYLES: Record<Props['level'], string> = {
  high: 'sw-bg-green-100 sw-text-green-800',
  estimated: 'sw-bg-amber-100 sw-text-amber-800',
  contextual: 'sw-bg-blue-100 sw-text-blue-800',
};

const BADGE_KEYS: Record<Props['level'], string> = {
  high: 'cost_savings.confidence.high',
  estimated: 'cost_savings.confidence.estimated',
  contextual: 'cost_savings.confidence.contextual',
};

function ConfidenceBadge({ level }: Props) {
  const { formatMessage } = useIntl();

  return (
    <span
      className={`sw-inline-flex sw-items-center sw-rounded-full sw-px-2 sw-py-0.5 sw-text-xs sw-font-medium ${BADGE_STYLES[level]}`}
    >
      {formatMessage({ id: BADGE_KEYS[level] })}
    </span>
  );
}

export { ConfidenceBadge };
