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
import { OnboardingDevopsPlatformsCard } from './devops/OnboardingDevopsPlatformsCard';
import { OnboardingJourney } from './journey/OnboardingJourney';
import { OnboardingDashboardSkeleton } from './OnboardingDashboardSkeleton';

export default function OnboardingDashboardApp() {
  const { formatMessage } = useIntl();
  const organizationKey = useOnboardingOrganizationKey();
  const { data, isPending, isError } = useOnboardingOverviewQuery({ organizationKey });

  const title = formatMessage({ id: 'layout.onboarding_dashboard' });
  const { devopsPlatforms } = data ?? {};

  return (
    <Layout.PageGrid>
      <Helmet defer={false} title={title} />
      <Layout.PageContent>
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
              {data !== undefined && <OnboardingJourney overview={data} />}
              {devopsPlatforms !== undefined && (
                <OnboardingDevopsPlatformsCard data={devopsPlatforms} />
              )}
            </div>
          )}
        </LoadingContainer>
      </Layout.PageContent>
      <GlobalFooter />
    </Layout.PageGrid>
  );
}
