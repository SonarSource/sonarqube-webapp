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

import { Layout } from '@sonarsource/echoes-react';
import { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { withComponentContext } from '~adapters/context/withComponentContext';
import NotFound from '~shared/components/NotFound';
import { isProject } from '~shared/helpers/component';
import { LightComponent } from '~shared/types/component';

const BRANCH_LIKE_SEARCH_PARAMS = ['branch', 'pullRequest', 'fixedInPullRequest'];

interface Props {
  component: LightComponent;
}

// This page is project-only and main-branch only. Any other qualifier (application,
// portfolio, ...) gets a 404, and any branch/PR context is stripped before it mounts.
function QualityGateHistoryGuard({ children, component }: Readonly<PropsWithChildren<Props>>) {
  const { pathname, search } = useLocation();
  const searchParams = new URLSearchParams(search);

  if (!isProject(component.qualifier)) {
    return (
      <Layout.PageGrid>
        <NotFound />
      </Layout.PageGrid>
    );
  }

  if (BRANCH_LIKE_SEARCH_PARAMS.some((param) => searchParams.has(param))) {
    BRANCH_LIKE_SEARCH_PARAMS.forEach((param) => {
      searchParams.delete(param);
    });
    return <Navigate replace to={{ pathname, search: searchParams.toString() }} />;
  }

  return children;
}

export default withComponentContext(QualityGateHistoryGuard);
