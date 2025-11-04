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

import * as React from 'react';
import { useLocation } from '~shared/components/hoc/withRouter';
import { IssueMessageHighlighting } from '~shared/components/issues/IssueMessageHighlighting';
import { getBranchLikeQuery } from '~shared/helpers/branch-like';
import { ComponentContext } from '../../../context/componentContext/ComponentContext';
import { StandoutLink } from '../../../design-system/components/Link';
import { translate } from '../../../helpers/l10n';
import { getIssuesUrl } from '../../../helpers/urls';
import { getComponentIssuesUrl } from '../../../sonar-aligned/helpers/urls';
import { BranchLike } from '../../../types/branch-like';
import { Issue } from '../../../types/types';
import { areMyIssuesSelected, parseQuery, serializeQuery } from '../../../utils/issues-utils';

export interface IssueMessageProps {
  branchLike?: BranchLike;
  displayWhyIsThisAnIssue?: boolean;
  issue: Issue;
}

export default function IssueMessage(props: IssueMessageProps) {
  const { issue, branchLike, displayWhyIsThisAnIssue } = props;
  const location = useLocation();
  const query = parseQuery(location.query);
  const myIssuesSelected = areMyIssuesSelected(location.query);

  const { component } = React.useContext(ComponentContext);

  const { message, messageFormattings } = issue;

  const whyIsThisAnIssueUrl = getComponentIssuesUrl(issue.project, {
    ...getBranchLikeQuery(branchLike),
    files: issue.componentLongName,
    open: issue.key,
    why: '1',
  });

  const urlQuery = {
    ...getBranchLikeQuery(branchLike),
    ...serializeQuery(query),
    myIssues: myIssuesSelected ? 'true' : undefined,
    open: issue.key,
  };

  const issueUrl = component?.key
    ? getComponentIssuesUrl(component?.key, urlQuery)
    : getIssuesUrl(urlQuery);

  return (
    <>
      <StandoutLink className="it__issue-message" to={issueUrl}>
        <IssueMessageHighlighting message={message} messageFormattings={messageFormattings} />
      </StandoutLink>

      {displayWhyIsThisAnIssue && (
        <StandoutLink
          aria-label={translate('issue.why_this_issue.long')}
          className="sw-ml-2"
          target="_blank"
          to={whyIsThisAnIssueUrl}
        >
          {translate('issue.why_this_issue')}
        </StandoutLink>
      )}
    </>
  );
}
