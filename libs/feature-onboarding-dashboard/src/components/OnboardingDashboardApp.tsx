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

import { Divider, LoadingContainer, MessageCallout } from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  useOnboardingIsBoundQuery,
  useOnboardingJourneyStateQuery,
} from '~adapters/queries/onboarding';
import { useOnboardingStatisticsQuery } from '~shared/queries/onboarding';
import { OnboardingJourney } from './journey/OnboardingJourney';
import { AllProjectsCard } from './journey/projects/AllProjectsCard';
import { StaleProjectsCard } from './journey/projects/StaleProjectsCard';
import { JourneyStatistics } from './journey/stats/JourneyStatistics';
import { JourneySkeleton } from './OnboardingDashboardSkeleton';

interface Props {
  /** Organization key supplied by the product-page wrapper via `useOnboardingOrganizationKey`. */
  organizationKey?: string;
}

/**
 * The onboarding dashboard body: the journey, its statistics and the project tables.
 * Receives the organization key as a prop — the product-page wrapper calls
 * `useOnboardingOrganizationKey` and owns the outer page chrome (grid, header, footer).
 * React Query deduplicates the overview request shared with the product page.
 *
 * Each section shows as soon as its own data is there, so a slow request only holds back the
 * sections that need it: the journey waits on the overview, the statistics on the binding and the
 * statistics endpoint, and the project tables fetch their own paged data.
 */
export default function OnboardingDashboardApp({ organizationKey }: Readonly<Props>) {
  const { formatMessage } = useIntl();
  const {
    data: journeyState,
    isError: isJourneyError,
    isPending: isJourneyPending,
  } = useOnboardingJourneyStateQuery({ organizationKey });
  const { data: statistics, isError: isStatisticsError } = useOnboardingStatisticsQuery({
    organizationKey,
  });
  const { data: isBound, isError: isBindingError } = useOnboardingIsBoundQuery({
    organizationKey,
  });

  return (
    <div>
      <LoadingContainer
        className="sw:flex sw:flex-col sw:gap-6"
        isLoading={isJourneyPending}
        loadingMessage={formatMessage({ id: 'onboarding_dashboard.loading' })}
      >
        {isJourneyError && (
          <MessageCallout variety="danger">
            <FormattedMessage id="default_error_message" />
          </MessageCallout>
        )}

        {isJourneyPending && <JourneySkeleton />}

        {journeyState !== undefined && <OnboardingJourney state={journeyState} />}
      </LoadingContainer>

      <Divider className="sw:my-10" role="separator" />

      <div className="sw:mb-6 sw:flex sw:flex-col sw:gap-6">
        <JourneyStatistics
          // An unknown binding shows the timeline rather than hiding the statistics altogether.
          isBound={isBindingError || isBound}
          isTimelineError={isStatisticsError}
          timeline={statistics?.timeline}
        />

        <StaleProjectsCard />

        <AllProjectsCard />
      </div>
    </div>
  );
}
