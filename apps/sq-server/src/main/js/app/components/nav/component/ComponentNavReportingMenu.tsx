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

import { IconActivity, IconMeasures, IconReports, Layout } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { useIsEnterpriseTier } from '~adapters/helpers/plan';
import { getBranchLikeQuery, isPullRequest } from '~shared/helpers/branch-like';
import { isDefined } from '~shared/helpers/types';
import { addons } from '~sq-server-addons/index';
import { getActivityUrl } from '~sq-server-commons/helpers/urls';
import { BranchLike } from '~sq-server-commons/types/branch-like';
import { Component } from '~sq-server-commons/types/types';

interface Props {
  branchLike?: BranchLike;
  component: Component;
}

export function ComponentNavReportingMenu(props: Readonly<Props>) {
  const { branchLike, component } = props;

  const branchParameters = getBranchLikeQuery(branchLike);
  const search = new URLSearchParams({ id: component.key, ...branchParameters }).toString();

  const isEnterprise = useIsEnterpriseTier();

  const isSecurityReportsEnabled = !isPullRequest(branchLike) && isEnterprise;

  return (
    <Layout.SidebarNavigation.Group
      label={<FormattedMessage id="navigation.project.group.reporting" />}
    >
      {isSecurityReportsEnabled && isDefined(addons.securityReports) && (
        <Layout.SidebarNavigation.Item
          Icon={IconReports}
          to={{
            pathname: '/project/security-reports',
            search,
          }}
        >
          <FormattedMessage id="layout.security_reports" />
        </Layout.SidebarNavigation.Item>
      )}
      <Layout.SidebarNavigation.Item
        Icon={IconMeasures}
        to={{
          pathname: '/component_measures',
          search,
        }}
      >
        <FormattedMessage id="layout.measures" />
      </Layout.SidebarNavigation.Item>
      <Layout.SidebarNavigation.Item
        Icon={IconActivity}
        to={getActivityUrl(component.key, branchLike)}
      >
        <FormattedMessage id="project_activity.page" />
      </Layout.SidebarNavigation.Item>
    </Layout.SidebarNavigation.Group>
  );
}
