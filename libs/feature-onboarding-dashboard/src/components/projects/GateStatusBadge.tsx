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

import { cssVar, Text, TextSize } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import { OnboardingProjectGateStatus } from '~shared/types/onboarding';

const GATE_STATUS_CONFIG: Record<OnboardingProjectGateStatus, { color: string; labelKey: string }> =
  {
    [OnboardingProjectGateStatus.Passed]: {
      color: cssVar('color-background-success-default'),
      labelKey: 'metric.level.OK',
    },
    [OnboardingProjectGateStatus.Failed]: {
      color: cssVar('color-background-danger-default'),
      labelKey: 'metric.level.ERROR',
    },
    [OnboardingProjectGateStatus.NotComputed]: {
      color: cssVar('color-background-neutral-bolder-default'),
      labelKey: 'onboarding_dashboard.projects.gate.not_computed',
    },
  };

interface Props {
  status: OnboardingProjectGateStatus | null;
}

export function GateStatusBadge({ status }: Readonly<Props>) {
  const { formatMessage } = useIntl();
  // Fall back to NOT_COMPUTED for missing/unknown gate statuses coming from the backend.
  const config =
    (status && GATE_STATUS_CONFIG[status]) ??
    GATE_STATUS_CONFIG[OnboardingProjectGateStatus.NotComputed];

  return (
    <div className="sw-flex sw-items-center sw-gap-2 sw-whitespace-nowrap">
      <span
        className="sw-inline-block sw-h-2 sw-w-2 sw-shrink-0 sw-rounded-full"
        style={{ backgroundColor: config.color }}
      />
      <Text size={TextSize.Small}>{formatMessage({ id: config.labelKey })}</Text>
    </div>
  );
}
