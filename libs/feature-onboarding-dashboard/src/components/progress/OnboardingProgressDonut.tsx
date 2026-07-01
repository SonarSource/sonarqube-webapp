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

import { cssVar, Text } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import { DonutChart } from '~shared/components/charts/DonutChart';
import { getSeverityColorForPercent } from '../dashboardSeverity';

interface Props {
  /** When `true`, render the percentage centered inside the ring. */
  showLabel?: boolean;
  /** Ring diameter in pixels. */
  size?: number;
  /** Ring thickness in pixels. */
  thickness?: number;
  /** Completion, 0–100. The ring color follows the shared severity scale. */
  value: number;
}

/**
 * Donut ring conveying an onboarding completion percentage. The ring color follows the shared
 * 5-cohort severity scale (see {@link getSeverityColorForPercent}). Used both as the large progress
 * indicator in the page header and as a compact inline ring on the stat cards.
 */
export function OnboardingProgressDonut({
  showLabel = false,
  size = 72,
  thickness = 10,
  value,
}: Readonly<Props>) {
  const { formatMessage } = useIntl();

  return (
    <div aria-hidden className="sw-relative sw-shrink-0" style={{ height: size, width: size }}>
      <DonutChart
        data={[
          { fill: getSeverityColorForPercent(value), value },
          { fill: cssVar('color-background-neutral-subtle-default'), value: 100 - value },
        ]}
        height={size}
        thickness={thickness}
        width={size}
      />
      {showLabel && (
        <div className="sw-absolute sw-inset-0 sw-flex sw-items-center sw-justify-center">
          <Text isHighlighted>
            {formatMessage({ id: 'onboarding_dashboard.checklist.percent' }, { percent: value })}
          </Text>
        </div>
      )}
    </div>
  );
}
