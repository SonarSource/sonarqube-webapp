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

import { Layout, LoadingContainer, MessageCallout } from '@sonarsource/echoes-react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage, useIntl } from 'react-intl';
import { GlobalFooter } from '~adapters/components/layout/GlobalFooter';
import { useOnboardingOrganizationKey } from '~adapters/queries/onboarding';
import { useOnboardingOverviewQuery } from '~shared/queries/onboarding';
import { PrIntegrationCard } from './cards/PrIntegrationCard';
import { ProjectsOnboardedCard } from './cards/ProjectsOnboardedCard';
import { RepositoriesDiscoveredCard } from './cards/RepositoriesDiscoveredCard';
import { ScanHealthCard } from './cards/ScanHealthCard';
import { QualityGateStatusCard } from './charts/QualityGateStatusCard';
import { ScanConfigurationCard } from './charts/ScanConfigurationCard';
import { OnboardingChecklistCard } from './checklist/OnboardingChecklistCard';
import { OnboardingDevopsPlatformsCard } from './devops/OnboardingDevopsPlatformsCard';
import { OnboardingMomentumCard } from './momentum/OnboardingMomentumCard';
import { OnboardingDashboardHeader } from './OnboardingDashboardHeader';
import { OnboardingDashboardSkeleton } from './OnboardingDashboardSkeleton';
import { OnboardingRepositoriesCard } from './projects/OnboardingRepositoriesCard';
import { OnboardingStaleProjectsCard } from './projects/OnboardingStaleProjectsCard';

export default function OnboardingDashboardApp() {
  const { formatMessage } = useIntl();
  const organizationKey = useOnboardingOrganizationKey();
  const { data, isPending, isError } = useOnboardingOverviewQuery({ organizationKey });

  const title = formatMessage({ id: 'layout.onboarding_dashboard' });
  const { cards, checklist, momentum, charts, devopsPlatforms } = data ?? {};

  return (
    <Layout.PageGrid>
      <Helmet defer={false} title={title} />
      <Layout.PageContent>
        <OnboardingDashboardHeader checklist={checklist} title={title} />

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
            <div className="sw-flex sw-flex-col sw-gap-4">
              {cards !== undefined && (
                <div className="sw-grid sw-grid-cols-4 sw-gap-4">
                  <RepositoriesDiscoveredCard data={cards.repositoriesDiscovered} />
                  <ProjectsOnboardedCard data={cards.projectsOnboarded} />
                  <ScanHealthCard data={cards.scanHealth} />
                  <PrIntegrationCard data={cards.prIntegration} />
                </div>
              )}

              {checklist !== undefined && <OnboardingChecklistCard checklist={checklist} />}

              {(momentum !== undefined || charts !== undefined) && (
                <div className="sw-grid sw-grid-cols-3 sw-items-start sw-gap-4">
                  {momentum !== undefined && (
                    <div className="sw-col-span-2 sw-h-full">
                      <OnboardingMomentumCard momentum={momentum} />
                    </div>
                  )}
                  {charts !== undefined && (
                    <div className="sw-flex sw-flex-col sw-gap-4">
                      <ScanConfigurationCard data={charts.scanConfiguration} />
                      <QualityGateStatusCard data={charts.qualityGateStatus} />
                    </div>
                  )}
                </div>
              )}

              <div className="sw-grid sw-grid-cols-12 sw-items-start sw-gap-4">
                <div className="sw-col-span-7 sw-h-full">
                  <OnboardingStaleProjectsCard />
                </div>
                <div className="sw-col-span-5 sw-h-full">
                  {devopsPlatforms !== undefined && (
                    <OnboardingDevopsPlatformsCard data={devopsPlatforms} />
                  )}
                </div>
              </div>

              <OnboardingRepositoriesCard />
            </div>
          )}
        </LoadingContainer>
      </Layout.PageContent>
      <GlobalFooter />
    </Layout.PageGrid>
  );
}
