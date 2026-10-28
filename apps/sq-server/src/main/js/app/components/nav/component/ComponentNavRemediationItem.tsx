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

import { useCurrentUser } from '~adapters/helpers/users';
import { RemediationNavItem } from '~shared/components/nav/component-nav/RemediationNavItem';
import { isProject } from '~shared/helpers/component';
import { isDefined } from '~shared/helpers/types';
import { EntitlementCheckFeatureKey } from '~shared/types/billing';
import { addons } from '~sq-server-addons/index';
import { useRemediationAgentBindingSupport } from '~sq-server-commons/queries/dop-translation';
import { Component } from '~sq-server-commons/types/types';

interface Props {
  component: Component;
}

export function ComponentNavRemediationItem({ component }: Readonly<Props>) {
  const { isLoggedIn } = useCurrentUser();
  const isProj = isProject(component.qualifier);
  const remediationAgentAddon = addons.remediationAgent;
  const { data: remediationAgent } = addons.entitlements.usePurchasableFeature(
    EntitlementCheckFeatureKey.RemediationAgent,
    {
      enabled: isProj && isLoggedIn && isDefined(remediationAgentAddon),
    },
  );
  const hasRemediationAgentLicense = isDefined(remediationAgent);
  // An empty permission-checks response means the project has no binding or uses an
  // unsupported platform. Non-project qualifiers must never request this check.
  const { isSupported: isRemediationAgentBindingSupported } = useRemediationAgentBindingSupport({
    projectKey: component.key,
    enabled: isProj && hasRemediationAgentLicense,
  });

  if (
    !isProj ||
    !isLoggedIn ||
    !hasRemediationAgentLicense ||
    !isRemediationAgentBindingSupported ||
    !remediationAgentAddon
  ) {
    return null;
  }

  return (
    <RemediationNavItem
      expirationDate={remediationAgentAddon.PROJECT_AGENT_ACTIVITY_NEW_BADGE_EXPIRATION_DATE}
      to={{
        pathname: '/project/remediation_agent',
        search: new URLSearchParams({ id: component.key }).toString(),
      }}
    />
  );
}
