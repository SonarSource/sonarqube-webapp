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

import { Heading, Text } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import { OnboardingChecklist } from '~shared/types/onboarding';
import { clampPercent } from './dashboardSeverity';
import { OnboardingProgressDonut } from './progress/OnboardingProgressDonut';

interface Props {
  checklist?: OnboardingChecklist;
  title: string;
}

/**
 * Dashboard page header: the overall onboarding progress ring next to the page title and tagline.
 * The ring is omitted while the checklist data is still loading.
 */
export function OnboardingDashboardHeader({ checklist, title }: Readonly<Props>) {
  const { formatMessage } = useIntl();

  return (
    <div className="sw-mb-4 sw-flex sw-items-center sw-gap-4">
      {checklist !== undefined && (
        <OnboardingProgressDonut
          showLabel
          value={clampPercent(Math.round(checklist.overallMaturityPct))}
        />
      )}

      <div className="sw-flex sw-min-w-0 sw-flex-col sw-gap-1">
        <Heading as="h1">{title}</Heading>
        <Text isSubtle>{formatMessage({ id: 'onboarding_dashboard.header.subtitle' })}</Text>
      </div>
    </div>
  );
}
