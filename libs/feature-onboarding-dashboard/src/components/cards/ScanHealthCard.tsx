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
import { ScanHealthCard as ScanHealth } from '~shared/types/onboarding';
import { NO_DATA } from '../dashboardConstants';
import { StatCard } from '../StatCard';

interface Props {
  data: ScanHealth;
}

export function ScanHealthCard({ data }: Readonly<Props>) {
  const { formatMessage } = useIntl();

  const total = data.healthy + data.failed;
  const passingPercent = total === 0 ? null : Math.round((data.healthy / total) * 100);

  return (
    <StatCard
      description={formatMessage(
        { id: 'onboarding_dashboard.cards.scan_health.subtitle' },
        { failed: data.failed, total },
      )}
      donutPercent={passingPercent ?? undefined}
      primaryValue={
        passingPercent === null
          ? NO_DATA
          : formatMessage(
              { id: 'onboarding_dashboard.checklist.percent' },
              { percent: passingPercent },
            )
      }
      title={formatMessage({ id: 'onboarding_dashboard.cards.scan_health.title' })}
    />
  );
}
