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

import {
  Button,
  ButtonVariety,
  Divider,
  EmptyState,
  IconCases,
  LoadingContainer,
  MessageCallout,
} from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Path } from 'react-router';
import {
  useOnboardingIsBoundQuery,
  useOnboardingJourneyStateQuery,
} from '~adapters/queries/onboarding';
import { useOnboardingStatisticsQuery } from '~shared/queries/onboarding';
import { JourneyLevel } from '~shared/types/onboarding';
import { OnboardingDashboardSurface } from '~shared/types/onboarding-dashboard-telemetry';
import { OnboardingJourney } from '../journey/OnboardingJourney';
import { JourneyStatistics, LockedStatisticsContent } from '../journey/stats/JourneyStatistics';
import { JourneySkeleton } from '../OnboardingDashboardSkeleton';
import {
  OnboardingDashboardSurfaceProvider,
  OnboardingDashboardTelemetryProvider,
  useTrackOnboardingDashboardViewed,
} from '../telemetry/OnboardingDashboardTelemetry';
import { CreateOrganizationUrlContext } from './CreateOrganizationUrlContext';
import { OrganizationsCoverageBanner } from './OrganizationsCoverageBanner';
import { OrganizationsCoverageCard } from './OrganizationsCoverageCard';

/**
 * Locked-statistics copy for an enterprise: no CTA, since there is no single organization to bind
 * or import into.
 */
const ENTERPRISE_LOCKED_STATISTICS_CONTENT: LockedStatisticsContent = {
  [JourneyLevel.Unbound]: {
    message: 'onboarding_dashboard.enterprise.locked.stats.message',
    title: 'onboarding_dashboard.enterprise.locked.stats.title',
  },
  [JourneyLevel.BoundNoImport]: {
    message: 'onboarding_dashboard.enterprise.locked.more.message',
    title: 'onboarding_dashboard.enterprise.locked.more.title',
  },
};

interface Props {
  addOrganizationUrl: Partial<Path>;
  /** Omitted when the user may not create organizations. */
  createOrganizationUrl?: Partial<Path>;
  /** Identifier (UUID) of the enterprise, as the onboarding endpoints take it. */
  enterpriseId: string;
  /** Where the binding setup of an organization lives. */
  getBindingUrl: (organizationKey: string) => Partial<Path>;
  /** Where the dashboard of an organization lives. */
  getDashboardUrl: (organizationKey: string) => Partial<Path>;
}

/**
 * The enterprise onboarding dashboard body: the organization journey summed over the enterprise's
 * organizations, plus the per-organization table. The page chrome belongs to the product page.
 */
export default function EnterpriseOnboardingDashboardApp(props: Readonly<Props>) {
  return (
    <OnboardingDashboardTelemetryProvider enterpriseId={props.enterpriseId}>
      <CreateOrganizationUrlContext.Provider value={props.createOrganizationUrl}>
        <EnterpriseOnboardingDashboard {...props} />
      </CreateOrganizationUrlContext.Provider>
    </OnboardingDashboardTelemetryProvider>
  );
}

function EnterpriseOnboardingDashboard({
  addOrganizationUrl,
  enterpriseId,
  getBindingUrl,
  getDashboardUrl,
}: Readonly<Props>) {
  const { formatMessage } = useIntl();
  const scope = { enterpriseId };
  const {
    data: journeyState,
    isError: isJourneyError,
    isPending: isJourneyPending,
  } = useOnboardingJourneyStateQuery(scope);
  const { data: statistics, isError: isStatisticsError } = useOnboardingStatisticsQuery(scope);
  const { data: isBound, isError: isBindingError } = useOnboardingIsBoundQuery(scope);

  useTrackOnboardingDashboardViewed(journeyState, isJourneyPending);

  // TODO GROW-622: decide whether a single-organization enterprise should redirect to that
  // organization's dashboard.
  if (journeyState?.enterprise?.coverage?.organizationsTotal === 0) {
    return (
      <EmptyState
        action={
          <Button to={addOrganizationUrl} variety={ButtonVariety.Primary}>
            {formatMessage({ id: 'onboarding_dashboard.enterprise.empty.cta' })}
          </Button>
        }
        graphic={<IconCases />}
        text={formatMessage({ id: 'onboarding_dashboard.enterprise.empty.description' })}
        title={formatMessage({ id: 'onboarding_dashboard.enterprise.empty.title' })}
        titleAs="h2"
        titleSize="large"
      />
    );
  }

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

        <OrganizationsCoverageBanner coverage={journeyState?.enterprise?.coverage} />

        {isJourneyPending && <JourneySkeleton />}

        {journeyState !== undefined && <OnboardingJourney state={journeyState} />}
      </LoadingContainer>

      <Divider className="sw:my-10" role="separator" />

      <div className="sw:mb-6 sw:flex sw:flex-col sw:gap-6">
        <OnboardingDashboardSurfaceProvider
          surface={OnboardingDashboardSurface.StatisticsPlaceholder}
        >
          <JourneyStatistics
            // An unknown binding shows the timeline rather than hiding the statistics altogether.
            isBound={isBindingError || isBound}
            isTimelineError={isStatisticsError}
            lockedContent={ENTERPRISE_LOCKED_STATISTICS_CONTENT}
            timeline={statistics?.timeline}
          />
        </OnboardingDashboardSurfaceProvider>

        <OnboardingDashboardSurfaceProvider surface={OnboardingDashboardSurface.OrganizationsTable}>
          <OrganizationsCoverageCard
            enterpriseId={enterpriseId}
            getBindingUrl={getBindingUrl}
            getDashboardUrl={getDashboardUrl}
          />
        </OnboardingDashboardSurfaceProvider>
      </div>
    </div>
  );
}
