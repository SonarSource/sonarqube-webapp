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
  IconDependency,
  IconFileCode,
  IconGitBranch,
  IconInfo,
  Layout,
} from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { getBranchLikeQuery } from '~shared/helpers/branch-like';
import { isApplication, isPortfolioLike, isProject } from '~shared/helpers/component';
import { addons } from '~sq-server-addons/index';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import { getCodeUrl } from '~sq-server-commons/helpers/urls';
import { BranchLike } from '~sq-server-commons/types/branch-like';
import { Feature } from '~sq-server-commons/types/features';
import { Component } from '~sq-server-commons/types/types';

interface Props {
  branchLike?: BranchLike;
  component: Component;
  isAnalyzed: boolean;
}

export function ComponentNavProjectMenu(props: Readonly<Props>) {
  const { branchLike, component, isAnalyzed } = props;
  const { hasFeature } = useAvailableFeatures();
  const { qualifier } = component;

  const branchParameters = getBranchLikeQuery(branchLike);
  const query = { id: component.key, ...branchParameters };
  const search = new URLSearchParams(query).toString();
  const isPortfolio = isPortfolioLike(qualifier);
  const isApp = isApplication(qualifier);
  const isProj = isProject(qualifier);
  const showBranches =
    isProj &&
    component.configuration?.showSettings &&
    hasFeature(Feature.BranchSupport) &&
    addons.branches;

  return (
    <Layout.SidebarNavigation.Group
      label={<FormattedMessage id="navigation.project.group.project" />}
    >
      {showBranches && (
        <Layout.SidebarNavigation.Item
          Icon={IconGitBranch}
          to={{ pathname: '/project/branches', search }}
        >
          <FormattedMessage id="project_branch_pull_request.page" />
        </Layout.SidebarNavigation.Item>
      )}
      {!isPortfolio && isAnalyzed && (
        <Layout.SidebarNavigation.Item
          Icon={IconFileCode}
          to={getCodeUrl(component.key, branchLike)}
        >
          <FormattedMessage id={isApp ? 'view_projects.page' : 'code.page'} />
        </Layout.SidebarNavigation.Item>
      )}
      {isAnalyzed && hasFeature(Feature.Sca) && addons.sca && (
        <Layout.SidebarNavigation.Item
          Icon={IconDependency}
          to={addons.sca.getReleasesUrl({ newParams: query })}
        >
          <FormattedMessage id="dependencies.bill_of_materials" />
        </Layout.SidebarNavigation.Item>
      )}
      {(isProj || isApp) && (
        <Layout.SidebarNavigation.Item
          Icon={IconInfo}
          to={{
            pathname: '/project/information',
            search: new URLSearchParams({ id: component.key }).toString(),
          }}
        >
          <FormattedMessage id={isProj ? 'project.info.title' : 'application.info.title'} />
        </Layout.SidebarNavigation.Item>
      )}
    </Layout.SidebarNavigation.Group>
  );
}
