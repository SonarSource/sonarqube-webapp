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

import { Helmet } from 'react-helmet-async';
import { useIntl } from 'react-intl';
import { useFlags } from '~adapters/helpers/feature-flags';
import { useCurrentBranchQuery, useProjectBranchesQuery } from '~adapters/queries/branch';
import { ProjectPageTemplate } from '~shared/components/pages/ProjectPageTemplate';
import { isPullRequest } from '~shared/helpers/branch-like';
import { isPortfolioLike } from '~shared/helpers/component';
import { isDefined, isStringDefined } from '~shared/helpers/types';
import { ComponentQualifier } from '~shared/types/component';
import { addons } from '~sq-server-addons/index';
import Suggestions from '~sq-server-commons/components/embed-docs-modal/Suggestions';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import withComponentContext from '~sq-server-commons/context/componentContext/withComponentContext';
import { getProjectQueryUrl } from '~sq-server-commons/helpers/urls';
import { Feature } from '~sq-server-commons/types/features';
import { Component } from '~sq-server-commons/types/types';
import BranchOverview from '../branches/BranchOverview';
import EmptyOverview from './EmptyOverview';

interface AppProps {
  component: Component;
}

export function App(props: Readonly<AppProps>) {
  const { formatMessage } = useIntl();
  const { organizationReportingEnableDashboards } = useFlags();
  const { hasFeature } = useAvailableFeatures();
  const { component } = props;
  const { data: branchLike } = useCurrentBranchQuery(component);
  const { data: branchLikes = [] } = useProjectBranchesQuery(component);

  if (isPortfolioLike(component.qualifier) || !branchLike) {
    return null;
  }

  // Keep the branch selector available when other branches exist, so users can
  // navigate to an analyzed branch even if the current branch has no analysis yet.
  const hasBranches = branchLikes.length > 1;

  const branchSupportEnabled = hasFeature(Feature.BranchSupport) && isDefined(addons.branches);

  const PullRequestOverview = addons.branches?.PullRequestOverview || (() => undefined);
  const pageTitle = formatMessage({
    id:
      organizationReportingEnableDashboards ||
      component.qualifier !== ComponentQualifier.Project ||
      isPullRequest(branchLike)
        ? 'summary.page'
        : 'overview.page',
  });

  return (
    <>
      <Helmet defer={false} title={pageTitle} />
      {isPullRequest(branchLike) ? (
        <>
          <Suggestions suggestionGroup="pull_requests" />

          {branchSupportEnabled && (
            <PullRequestOverview component={component} pullRequest={branchLike} />
          )}
        </>
      ) : (
        <>
          <Suggestions suggestionGroup="overview" />

          {!isStringDefined(component.analysisDate) && (
            <ProjectPageTemplate
              disableBranchSelector={!hasBranches}
              overrideBranchSelectorPath={getProjectQueryUrl(component.key)}
              pageClassName="it__empty-overview"
              title={pageTitle}
            >
              <EmptyOverview branchLike={branchLike} component={component} />
            </ProjectPageTemplate>
          )}

          {isStringDefined(component.analysisDate) && (
            <BranchOverview branch={branchLike} component={component} />
          )}
        </>
      )}
    </>
  );
}

export default withComponentContext(App);
