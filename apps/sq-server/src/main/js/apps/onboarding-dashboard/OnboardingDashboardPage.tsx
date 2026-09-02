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

import { Layout, LoadingSkeleton } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import { useOnboardingOrganizationKey } from '~adapters/queries/onboarding';
import { LazyOnboardingDashboardApp } from '~feature-onboarding-dashboard/components/LazyOnboardingDashboardApp';
import { OnboardingCongratsCallout } from '~shared/components/onboarding/OnboardingCongratsCallout';
import { OnboardingProgressDonut } from '~shared/components/onboarding/OnboardingProgressDonut';
import { useOnboardingJourneyState } from '~shared/queries/onboarding';
import { JourneyLevel } from '~shared/types/onboarding';
import { AdminPageTemplate } from '~sq-server-commons/components/ui/AdminPageTemplate';

function OnboardingDashboardPage() {
  const { formatMessage } = useIntl();
  const organizationKey = useOnboardingOrganizationKey();
  const { data: journeyState, isPending } = useOnboardingJourneyState({ organizationKey });

  const title = formatMessage({ id: 'layout.onboarding_dashboard' });

  return (
    <AdminPageTemplate
      actions={
        journeyState?.level === JourneyLevel.BoundNoImport ? (
          <div className="sw-w-[500px] sw-whitespace-normal">
            <OnboardingCongratsCallout discovered={journeyState.discovered} />
          </div>
        ) : undefined
      }
      description={
        <Layout.PageHeader.Description>
          {formatMessage({ id: 'onboarding_dashboard.header.subtitle' })}
        </Layout.PageHeader.Description>
      }
      hasDivider
      isLoading={isPending}
      title={title}
      titlePrefix={
        isPending ? (
          <LoadingSkeleton className="sw-h-[40px] sw-w-[40px] sw-shrink-0" variety="disk" />
        ) : (
          journeyState?.isBound === true && (
            <OnboardingProgressDonut size={40} thickness={5} value={journeyState.overallPct} />
          )
        )
      }
    >
      <LazyOnboardingDashboardApp organizationKey={organizationKey} />
    </AdminPageTemplate>
  );
}

export { OnboardingDashboardPage };
