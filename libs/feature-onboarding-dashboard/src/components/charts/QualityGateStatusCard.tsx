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

import { cssVar } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import { QualityGateStatusChart } from '~shared/types/onboarding';
import { DonutChartCard } from './DonutChartCard';

interface Props {
  data: QualityGateStatusChart;
}

export function QualityGateStatusCard({ data }: Readonly<Props>) {
  const { formatMessage } = useIntl();

  return (
    <DonutChartCard
      description={formatMessage({ id: 'onboarding_dashboard.charts.quality_gate.description' })}
      segments={[
        {
          color: cssVar('color-background-success-default'),
          label: formatMessage({ id: 'onboarding_dashboard.charts.quality_gate.passing' }),
          value: data.passing,
        },
        {
          color: cssVar('color-background-danger-default'),
          label: formatMessage({ id: 'onboarding_dashboard.charts.quality_gate.failing' }),
          value: data.failing,
        },
        {
          color: cssVar('color-background-warning-default'),
          label: formatMessage({ id: 'onboarding_dashboard.charts.quality_gate.not_computed' }),
          value: data.notComputed,
        },
        {
          color: cssVar('color-background-neutral-subtle-default'),
          label: formatMessage({ id: 'onboarding_dashboard.charts.quality_gate.not_onboarded' }),
          value: data.notOnboarded ?? 0,
        },
      ]}
      title={formatMessage({ id: 'onboarding_dashboard.charts.quality_gate.title' })}
    />
  );
}
