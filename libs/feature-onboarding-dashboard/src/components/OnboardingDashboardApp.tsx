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

import { LoadingContainer, MessageCallout } from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  useOnboardingJourneyState,
  useOnboardingStatisticsQuery,
} from '~shared/queries/onboarding';
import { OnboardingJourney } from './journey/OnboardingJourney';
import { OnboardingDashboardSkeleton } from './OnboardingDashboardSkeleton';

interface Props {
  /** Organization key supplied by the product-page wrapper via `useOnboardingOrganizationKey`. */
  organizationKey?: string;
}

/**
 * The onboarding dashboard body: loading state and the journey section.
 * Receives the organization key as a prop — the product-page wrapper calls
 * `useOnboardingOrganizationKey` and owns the outer page chrome (grid, header, footer).
 * React Query deduplicates the overview request shared with the product page.
 */
export default function OnboardingDashboardApp({ organizationKey }: Readonly<Props>) {
  const { formatMessage } = useIntl();
  const { data: journeyState, isPending, isError } = useOnboardingJourneyState({ organizationKey });
  const { data: statistics, isError: isStatisticsError } = useOnboardingStatisticsQuery({
    organizationKey,
  });

  return (
    <>
      {isError && (
        <MessageCallout variety="danger">
          <FormattedMessage id="default_error_message" />
        </MessageCallout>
      )}

      <LoadingContainer
        isLoading={isPending}
        loadingMessage={formatMessage({ id: 'onboarding_dashboard.loading' })}
      >
        {isPending ? (
          <OnboardingDashboardSkeleton />
        ) : (
          <div>
            {journeyState !== undefined && (
              <OnboardingJourney state={journeyState} timeline={statistics?.timeline ?? []} />
            )}
            {isStatisticsError && (
              <MessageCallout variety="danger">
                <FormattedMessage id="default_error_message" />
              </MessageCallout>
            )}
          </div>
        )}
      </LoadingContainer>
    </>
  );
}
