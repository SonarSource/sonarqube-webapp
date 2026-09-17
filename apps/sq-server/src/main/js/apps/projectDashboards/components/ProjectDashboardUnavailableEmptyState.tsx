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
  Button,
  ButtonGroup,
  ButtonVariety,
  EmptyState,
  IconInfo,
} from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { getBranchLikeQuery, isPullRequest } from '~shared/helpers/branch-like';
import { queryToSearchString } from '~shared/helpers/query';
import { getProjectOverviewUrl } from '~shared/helpers/urls';
import { BranchLikeBase } from '~shared/types/branch-like';
import { getProjectQueryUrl } from '~sq-server-commons/helpers/urls';

interface Props {
  branchLike?: BranchLikeBase;
  componentKey: string;
}

export function ProjectDashboardUnavailableEmptyState(props: Readonly<Props>) {
  const { branchLike, componentKey } = props;
  const { formatMessage } = useIntl();

  const targetBranch = isPullRequest(branchLike) ? branchLike.target : undefined;

  return (
    <div className="sw-flex sw-h-full sw-justify-center">
      <EmptyState
        action={
          <ButtonGroup>
            <Button
              to={{
                ...getProjectOverviewUrl(componentKey),
                search: queryToSearchString({ id: componentKey, branch: targetBranch }),
              }}
              variety={ButtonVariety.Primary}
            >
              {formatMessage({ id: 'overview.dashboard.not_available.switch_to_target_branch' })}
            </Button>
            <Button to={getProjectQueryUrl(componentKey, getBranchLikeQuery(branchLike))}>
              {formatMessage({ id: 'overview.dashboard.not_available.go_to_pr_analysis_summary' })}
            </Button>
          </ButtonGroup>
        }
        className="sw-my-24"
        graphic={<IconInfo />}
        text={
          <FormattedMessage
            id="overview.dashboard.not_available.description"
            values={{ branch: targetBranch }}
          />
        }
        title={formatMessage({ id: 'overview.dashboard.not_available.title' })}
        titleSize="large"
      />
    </div>
  );
}
