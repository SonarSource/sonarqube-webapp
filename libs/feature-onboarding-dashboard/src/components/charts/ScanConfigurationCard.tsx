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
import { ScanConfigurationChart } from '~shared/types/onboarding';
import { DonutChartCard } from './DonutChartCard';

interface Props {
  data: ScanConfigurationChart;
}

export function ScanConfigurationCard({ data }: Readonly<Props>) {
  const { formatMessage } = useIntl();

  return (
    <DonutChartCard
      description={formatMessage({ id: 'onboarding_dashboard.charts.scan_config.description' })}
      segments={[
        {
          color: cssVar('color-background-success-default'),
          label: formatMessage({ id: 'onboarding_dashboard.charts.scan_config.full_ci' }),
          value: data.ci,
        },
        {
          color: cssVar('color-background-warning-default'),
          label: formatMessage({ id: 'onboarding_dashboard.charts.scan_config.autoscan' }),
          value: data.managed,
        },
        {
          color: cssVar('color-background-danger-default'),
          label: formatMessage({ id: 'onboarding_dashboard.charts.scan_config.local' }),
          value: data.local,
        },
        {
          color: cssVar('color-background-neutral-bolder-default'),
          label: formatMessage({ id: 'onboarding_dashboard.charts.scan_config.not_onboarded' }),
          value: data.notOnboarded ?? 0,
        },
      ]}
      title={formatMessage({ id: 'onboarding_dashboard.charts.scan_config.title' })}
    />
  );
}
