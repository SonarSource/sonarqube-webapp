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
import { getSeverityColorForPercent } from '../../helpers/onboarding/dashboardSeverity';
import { DonutChart } from '../charts/DonutChart';

interface Props {
  /**
   * When `true`, hide the ring from assistive technology, for callers that already announce the
   * percentage themselves (a step card folds it into the card's accessible name).
   */
  isDecorative?: boolean;
  /** When `true`, render the percentage centered inside the ring. */
  showLabel?: boolean;
  /** Ring diameter in pixels. */
  size?: number;
  /** Ring thickness in pixels. */
  thickness?: number;
  /** Completion, 0–100. The ring color follows the shared severity scale. */
  value: number;
}

export function OnboardingProgressDonut({
  isDecorative = false,
  showLabel = false,
  size = 72,
  thickness = 10,
  value,
}: Readonly<Props>) {
  const { formatMessage } = useIntl();

  const label = formatMessage({ id: 'onboarding_dashboard.percent' }, { percent: value });

  return (
    // The ring only encodes the percentage, so it is exposed as a single labelled image: assistive
    // technology gets the value from the label instead of the (ignored) chart subtree.
    <div
      aria-hidden={isDecorative || undefined}
      aria-label={isDecorative ? undefined : label}
      className="sw-relative sw-shrink-0"
      role={isDecorative ? undefined : 'img'}
      style={{ height: size, width: size }}
    >
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
          <Text isHighlighted>{label}</Text>
        </div>
      )}
    </div>
  );
}
