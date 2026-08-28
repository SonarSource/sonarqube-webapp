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

import { IconIssues, Layout } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { DeprecatedBadge } from '~shared/components/badges/DeprecatedBadge';
import { getBranchLikeQuery } from '~shared/helpers/branch-like';
import { isApplication } from '~shared/helpers/component';
import { getRisksUrl } from '~shared/helpers/sca-urls';
import { getComponentIssuesUrl } from '~shared/helpers/urls';
import { DEFAULT_ISSUES_QUERY } from '~sq-server-commons/components/shared/utils';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import { getProjectQueryUrl } from '~sq-server-commons/helpers/urls';
import { getComponentSecurityHotspotsUrl } from '~sq-server-commons/sonar-aligned/helpers/urls';
import { BranchLike } from '~sq-server-commons/types/branch-like';
import { Feature } from '~sq-server-commons/types/features';
import { Component } from '~sq-server-commons/types/types';

interface Props {
  branchLike?: BranchLike;
  component: Component;
}

export function ComponentNavAnalysisMenu(props: Readonly<Props>) {
  const { hasFeature } = useAvailableFeatures();
  const { branchLike, component } = props;

  const branchParameters = getBranchLikeQuery(branchLike);

  const isApplicationChildInaccessible =
    isApplication(component.qualifier) && !component.canBrowseAllChildProjects;

  const dashboardUrl = getProjectQueryUrl(component.key, branchParameters);

  const issuesUrl = getComponentIssuesUrl(component.key, {
    ...branchParameters,
    ...DEFAULT_ISSUES_QUERY,
  });

  if (isApplicationChildInaccessible) {
    return (
      <Layout.SidebarNavigation.AccordionItem
        Icon={IconIssues}
        label={<FormattedMessage id="navigation.project.group.analysis" />}
      >
        <Layout.SidebarNavigation.AccordionItem.Item to={dashboardUrl}>
          <FormattedMessage id="summary.page" />
        </Layout.SidebarNavigation.AccordionItem.Item>
      </Layout.SidebarNavigation.AccordionItem>
    );
  }

  return (
    <Layout.SidebarNavigation.AccordionItem
      Icon={IconIssues}
      label={<FormattedMessage id="navigation.project.group.analysis" />}
    >
      <Layout.SidebarNavigation.AccordionItem.Item to={dashboardUrl}>
        <FormattedMessage id="summary.page" />
      </Layout.SidebarNavigation.AccordionItem.Item>

      <Layout.SidebarNavigation.AccordionItem.Item to={issuesUrl}>
        <FormattedMessage id="issues.page" />
      </Layout.SidebarNavigation.AccordionItem.Item>

      <Layout.SidebarNavigation.AccordionItem.Item
        suffix={<DeprecatedBadge />}
        to={getComponentSecurityHotspotsUrl(component.key, branchLike)}
      >
        <FormattedMessage id="layout.security_hotspots" />
      </Layout.SidebarNavigation.AccordionItem.Item>

      {hasFeature(Feature.Sca) && (
        <Layout.SidebarNavigation.AccordionItem.Item
          to={getRisksUrl({ newParams: { id: component.key, ...branchParameters } })}
        >
          <FormattedMessage id="dependencies.risks" />
        </Layout.SidebarNavigation.AccordionItem.Item>
      )}
    </Layout.SidebarNavigation.AccordionItem>
  );
}
