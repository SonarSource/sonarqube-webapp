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

import { IconQualityGate, Layout } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { isPortfolioLike } from '~shared/helpers/component';
import { addons } from '~sq-server-addons/index';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import { getProjectQualityProfileSettingsUrl } from '~sq-server-commons/helpers/urls';
import { Feature } from '~sq-server-commons/types/features';
import { Component } from '~sq-server-commons/types/types';

interface Props {
  component: Component;
}

export function ComponentNavPoliciesMenu({ component }: Readonly<Props>) {
  const { configuration } = component;
  const { hasFeature } = useAvailableFeatures();

  const showLicenseProfile =
    configuration?.showQualityProfiles &&
    !isPortfolioLike(component.qualifier) &&
    hasFeature(Feature.Sca);

  const search = new URLSearchParams({ id: component.key }).toString();

  if (!configuration?.showQualityProfiles && !configuration?.showQualityGates) {
    return undefined;
  }

  return (
    <Layout.SidebarNavigation.AccordionItem
      Icon={IconQualityGate}
      label={<FormattedMessage id="navigation.project.group.policies" />}
    >
      {configuration?.showQualityProfiles && (
        <Layout.SidebarNavigation.AccordionItem.Item
          to={getProjectQualityProfileSettingsUrl(component.key)}
        >
          <FormattedMessage id="project_quality_profiles.page" />
        </Layout.SidebarNavigation.AccordionItem.Item>
      )}
      {configuration?.showQualityGates && (
        <Layout.SidebarNavigation.AccordionItem.Item
          to={{
            pathname: '/project/quality_gate',
            search,
          }}
        >
          <FormattedMessage id="project_quality_gate.page" />
        </Layout.SidebarNavigation.AccordionItem.Item>
      )}

      {showLicenseProfile && addons.sca && (
        <Layout.SidebarNavigation.AccordionItem.Item
          to={{
            pathname: addons.sca.PROJECT_LICENSE_ROUTE_NAME,
            search,
          }}
        >
          <FormattedMessage id="sca.licenses.page" />
        </Layout.SidebarNavigation.AccordionItem.Item>
      )}
    </Layout.SidebarNavigation.AccordionItem>
  );
}
