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
  IconLicenseProfiles,
  IconQualityGate,
  IconQualityProfile,
  IconRule,
  Layout,
} from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { addons } from '~sq-server-addons/index';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import { getQualityGatesUrl } from '~sq-server-commons/helpers/urls';
import { Feature } from '~sq-server-commons/types/features';

export function PoliciesSidebar() {
  const { formatMessage } = useIntl();
  const scaEnabled = useAvailableFeatures().hasFeature(Feature.Sca);

  return (
    <Layout.SidebarNavigation ariaLabel={formatMessage({ id: 'layout.policies' })}>
      <Layout.SidebarNavigation.Header name={<FormattedMessage id="layout.policies" />} />
      <Layout.SidebarNavigation.Body>
        <Layout.SidebarNavigation.Item Icon={IconRule} to="/coding_rules">
          <FormattedMessage id="coding_rules.page" />
        </Layout.SidebarNavigation.Item>
        <Layout.SidebarNavigation.Item Icon={IconQualityProfile} to="/profiles">
          <FormattedMessage id="quality_profiles.page" />
        </Layout.SidebarNavigation.Item>
        {scaEnabled && addons.sca?.LICENSE_ROUTE_NAME && (
          <Layout.SidebarNavigation.Item
            Icon={IconLicenseProfiles}
            to={`/${addons.sca.LICENSE_ROUTE_NAME}`}
          >
            <FormattedMessage id="sca.licenses.page" />
          </Layout.SidebarNavigation.Item>
        )}
        <Layout.SidebarNavigation.Item Icon={IconQualityGate} to={getQualityGatesUrl()}>
          <FormattedMessage id="quality_gates.page" />
        </Layout.SidebarNavigation.Item>
      </Layout.SidebarNavigation.Body>
    </Layout.SidebarNavigation>
  );
}
