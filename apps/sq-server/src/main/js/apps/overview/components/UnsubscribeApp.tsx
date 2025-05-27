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

import { Spinner } from '@sonarsource/echoes-react';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useCurrentBranchQuery } from '~adapters/queries/branch';
import { isProject } from '~shared/types/component';
import { useComponent } from '~sq-server-commons/context/componentContext/withComponentContext';
import { translate } from '~sq-server-commons/helpers/l10n';
import { useUnsubscribeFromEmailReportMutation } from '~sq-server-commons/queries/subscriptions';
import { useLocation } from '~sq-server-commons/sonar-aligned/components/hoc/withRouter';
import { isBranch, isPullRequest } from '~sq-server-commons/sonar-aligned/helpers/branch-like';
import { isPortfolioLike } from '~sq-server-commons/sonar-aligned/helpers/component';

export function UnsubscribeApp() {
  const { component } = useComponent();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: branchLike, isLoading: isLoadingBranch } = useCurrentBranchQuery(component);
  const { mutate: unsubscribe } = useUnsubscribeFromEmailReportMutation();

  useEffect(() => {
    const redirect = () => {
      const basePath = isPortfolioLike(component?.qualifier) ? '/portfolio' : '/dashboard';
      navigate(basePath + (location.search ?? ''), { replace: true });
    };

    if (component && !isLoadingBranch) {
      if (isProject(component.qualifier) && isPullRequest(branchLike)) {
        redirect();
        return;
      }

      unsubscribe(
        { component, branchKey: isBranch(branchLike) ? branchLike?.name : undefined },
        { onSuccess: redirect, onError: redirect },
      );
    }
  }, [component, isLoadingBranch, branchLike, location.search, navigate, unsubscribe]);

  return (
    <>
      <Helmet defer={false} title={translate('component_report.unsubscribe.page_title')} />
      <Spinner isLoading />
    </>
  );
}
