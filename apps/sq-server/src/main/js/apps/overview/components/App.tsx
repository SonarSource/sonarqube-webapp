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
import { useCurrentBranchQuery } from '~adapters/queries/branch';
import { ProjectPageTemplate } from '~shared/components/pages/ProjectPageTemplate';
import { isPullRequest } from '~shared/helpers/branch-like';
import { isPortfolioLike } from '~shared/helpers/component';
import { isDefined, isStringDefined } from '~shared/helpers/types';
import { addons } from '~sq-server-addons/index';
import Suggestions from '~sq-server-commons/components/embed-docs-modal/Suggestions';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import withComponentContext from '~sq-server-commons/context/componentContext/withComponentContext';
import { translate } from '~sq-server-commons/helpers/l10n';
import { Feature } from '~sq-server-commons/types/features';
import { Component } from '~sq-server-commons/types/types';
import BranchOverview from '../branches/BranchOverview';
import EmptyOverview from './EmptyOverview';

interface AppProps {
  component: Component;
}

export function App(props: AppProps) {
  const intl = useIntl();
  const { hasFeature } = useAvailableFeatures();
  const { component } = props;
  const { data: branchLike } = useCurrentBranchQuery(component);

  if (isPortfolioLike(component.qualifier) || !branchLike) {
    return null;
  }

  const branchSupportEnabled = hasFeature(Feature.BranchSupport) && isDefined(addons.branches);

  const PullRequestOverview = addons.branches?.PullRequestOverview || (() => undefined);

  return (
    <>
      <Helmet defer={false} title={translate('overview.page')} />
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
              disableBranchSelector
              pageClassName="it__empty-overview"
              title={intl.formatMessage({ id: 'overview.page' })}
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
