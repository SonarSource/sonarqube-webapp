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

import { Heading, MessageCallout, Text } from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { OnboardingProgressDonut } from './progress/OnboardingProgressDonut';

interface Props {
  discovered: number;
  overallPct: number;
  showCongrats: boolean;
  showProgress: boolean;
}

/**
 * Dashboard page header: the overall onboarding progress ring next to the page title and tagline.
 * The ring is omitted while the checklist data is still loading.
 */
export function OnboardingDashboardHeader({
  discovered,
  overallPct,
  showCongrats,
  showProgress,
}: Readonly<Props>) {
  const { formatMessage } = useIntl();

  return (
    <div className="sw-mb-12 sw-flex sw-items-start sw-justify-between sw-gap-4">
      <div className="sw-flex sw-items-center sw-gap-4">
        {showProgress && (
          <OnboardingProgressDonut showLabel size={56} thickness={7} value={overallPct} />
        )}
        <div className="sw-flex sw-flex-col">
          <Heading as="h1">{formatMessage({ id: 'layout.onboarding_dashboard' })}</Heading>
          <Text isSubtle>{formatMessage({ id: 'onboarding_dashboard.header.subtitle' })}</Text>
        </div>
      </div>

      {showCongrats && (
        <MessageCallout
          className="sw-max-w-[420px]"
          title={formatMessage({ id: 'onboarding_dashboard.journey.congrats.title' })}
          variety="success"
        >
          <FormattedMessage
            id="onboarding_dashboard.journey.congrats.message"
            values={{ b: (chunks) => <Text isHighlighted>{chunks}</Text>, count: discovered }}
          />
        </MessageCallout>
      )}
    </div>
  );
}
