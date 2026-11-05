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

import { Button, ButtonVariety } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import { OnboardingDashboardAction } from '~shared/types/onboarding-dashboard-telemetry';
import { useOnboardingDashboardTracking } from '../telemetry/OnboardingDashboardTelemetry';
import { ORGANIZATIONS_SECTION_ID } from './enterpriseConstants';

/** Scrolls to the organizations table, smoothly unless reduced motion is preferred. */
export function ViewAllOrganizationsButton() {
  const { formatMessage } = useIntl();
  const { trackActionSelected } = useOnboardingDashboardTracking();

  const handleClick = () => {
    trackActionSelected(OnboardingDashboardAction.ViewAllOrganizations);

    const prefersReducedMotion = globalThis.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    document.getElementById(ORGANIZATIONS_SECTION_ID)?.scrollIntoView({
      behavior: prefersReducedMotion === true ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  return (
    <Button onClick={handleClick} variety={ButtonVariety.PrimaryGhost}>
      {formatMessage({ id: 'onboarding_dashboard.enterprise.organizations.view_all' })}
    </Button>
  );
}
