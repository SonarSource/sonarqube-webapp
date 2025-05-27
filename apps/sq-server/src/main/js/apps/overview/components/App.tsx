/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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
import { useCurrentBranchQuery } from '~adapters/queries/branch';
import { isDefined, isStringDefined } from '~shared/helpers/types';
import { addons } from '~sq-server-addons/index';
import Suggestions from '~sq-server-commons/components/embed-docs-modal/Suggestions';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import withComponentContext from '~sq-server-commons/context/componentContext/withComponentContext';
import { translate } from '~sq-server-commons/helpers/l10n';
import { isPullRequest } from '~sq-server-commons/sonar-aligned/helpers/branch-like';
import { isPortfolioLike } from '~sq-server-commons/sonar-aligned/helpers/component';
import { Feature } from '~sq-server-commons/types/features';
import { Component } from '~sq-server-commons/types/types';
import BranchOverview from '../branches/BranchOverview';
import EmptyOverview from './EmptyOverview';

interface AppProps {
  component: Component;
}

export function App(props: AppProps) {
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
        <main>
          <Suggestions suggestionGroup="pull_requests" />

          {branchSupportEnabled && (
            <PullRequestOverview component={component} pullRequest={branchLike} />
          )}
        </main>
      ) : (
        <main>
          <Suggestions suggestionGroup="overview" />

          {!isStringDefined(component.analysisDate) && (
            <EmptyOverview branchLike={branchLike} component={component} />
          )}

          {isStringDefined(component.analysisDate) && (
            <BranchOverview branch={branchLike} component={component} />
          )}
        </main>
      )}
    </>
  );
}

export default withComponentContext(App);
