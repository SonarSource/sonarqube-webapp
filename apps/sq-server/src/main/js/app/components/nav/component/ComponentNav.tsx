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

import { IconRocket, Layout } from '@sonarsource/echoes-react';
import { useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useCurrentBranchQuery, useProjectBranchesQuery } from '~adapters/queries/branch';
import { ComponentNavHeader } from '~shared/components/nav/component-nav/ComponentNavHeader';
import { isApplication, isPortfolioLike } from '~shared/helpers/component';
import { History, RecentHistory } from '~shared/helpers/recent-history';
import { isDefined } from '~shared/helpers/types';
import { getProjectOverviewUrl } from '~shared/helpers/urls';
import { ComponentQualifier } from '~shared/types/component';
import {
  getPortfolioUrl,
  getProjectsUrl,
  getProjectTutorialLocation,
} from '~sq-server-commons/helpers/urls';
import { Component } from '~sq-server-commons/types/types';
import { ComponentNavAnalysisMenu } from './ComponentNavAnalysisMenu';
import { ComponentNavExtensionsMenu } from './ComponentNavExtensionsMenu';
import { ComponentNavPoliciesMenu } from './ComponentNavPoliciesMenu';
import { ComponentNavProjectMenu } from './ComponentNavProjectMenu';
import { ComponentNavReportingMenu } from './ComponentNavReportingMenu';
import ComponentNavSettingsMenu from './ComponentNavSettingsMenu';

interface Props {
  component: Component;
  isInProgress?: boolean;
  isPending?: boolean;
}

export function ComponentNav(props: Readonly<Props>) {
  const intl = useIntl();
  const { component, isInProgress, isPending } = props;
  const { data: branchLikes = [] } = useProjectBranchesQuery(component);
  const { data: branchLike } = useCurrentBranchQuery(component);
  const { breadcrumbs, key, name } = component;
  const { qualifier } = breadcrumbs.at(-1) ?? {};
  const hasBranches = branchLikes.length > 1;
  const isAnalyzed = hasBranches || isInProgress || isPending || isDefined(component.analysisDate);

  const isApplicationChildInaccessible =
    isApplication(component.qualifier) && !component.canBrowseAllChildProjects;

  useEffect(() => {
    if (
      qualifier &&
      [
        ComponentQualifier.Project,
        ComponentQualifier.Portfolio,
        ComponentQualifier.Application,
      ].includes(qualifier)
    ) {
      RecentHistory.add({ key, name, qualifier });
    }
  }, [key, name, qualifier]);

  return (
    <Layout.SidebarNavigation
      ariaLabel={intl.formatMessage({ id: `qualifier.${component.qualifier}` })}
    >
      <ComponentNavHeader
        allProjectsUrl={getProjectsUrl()}
        component={component}
        getItemUrl={getComponentUrl}
      />

      <Layout.SidebarNavigation.Body>
        {!isAnalyzed && (
          <Layout.SidebarNavigation.Item
            Icon={IconRocket}
            to={getProjectTutorialLocation(component.key)}
          >
            <FormattedMessage id="onboarding.project_analysis.menu_entry" />
          </Layout.SidebarNavigation.Item>
        )}
        {isAnalyzed && <ComponentNavAnalysisMenu branchLike={branchLike} component={component} />}
        {isAnalyzed && !isApplicationChildInaccessible && (
          <>
            <ComponentNavExtensionsMenu branchLike={branchLike} component={component} />
            <ComponentNavReportingMenu branchLike={branchLike} component={component} />
          </>
        )}
        {!isApplicationChildInaccessible && (
          <>
            <ComponentNavPoliciesMenu component={component} />
            <ComponentNavProjectMenu
              branchLike={branchLike}
              component={component}
              isAnalyzed={isAnalyzed}
            />
          </>
        )}
        <ComponentNavSettingsMenu branchLike={branchLike} component={component} />
      </Layout.SidebarNavigation.Body>
    </Layout.SidebarNavigation>
  );
}

function getComponentUrl(component: History) {
  if (isPortfolioLike(component.qualifier)) {
    return getPortfolioUrl(component.key);
  }
  return getProjectOverviewUrl(component.key);
}
