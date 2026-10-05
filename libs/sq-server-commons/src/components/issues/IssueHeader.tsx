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

import { Layout, Link, Text } from '@sonarsource/echoes-react';
import { memo, ReactNode } from 'react';
import { RuleStatusBadge } from '~shared/components/coding-rules/RuleStatusBadge';
import { IssueMessageHighlighting } from '~shared/components/issues/IssueMessageHighlighting';
import { IssueTitle } from '~shared/components/issues/IssueTitle';
import { getBranchLikeQuery } from '~shared/helpers/branch-like';
import { getExternalRuleKey } from '~shared/helpers/issues';
import { RuleDetails, RuleStatus } from '~shared/types/rules';
import { getPathUrlAsString, getRuleUrl } from '../../helpers/urls';
import { getComponentIssuesUrl } from '../../sonar-aligned/helpers/urls';
import { BranchLike } from '../../types/branch-like';
import { IssueType } from '../../types/issues';
import { Issue } from '../../types/types';
import { IssueActions as IssueActionsComponent } from '../issue/components/IssueActions';

interface Props {
  additionalIssueActions?: React.ComponentType<{ issue: Issue }>[];
  branchLike?: BranchLike;
  issue: Issue;
  navigation: ReactNode;
  onIssueChange: (issue: Issue) => void;
  ruleDetails: RuleDetails;
  closeIssue: () => void;
}

function IssueHeader(props: Readonly<Props>) {
  const {
    additionalIssueActions,
    branchLike,
    issue,
    navigation,
    onIssueChange,
    ruleDetails,
    closeIssue,
  } = props;

  const issueUrl = getComponentIssuesUrl(issue.project, {
    ...getBranchLikeQuery(branchLike),
    issues: issue.key,
    open: issue.key,
    types: issue.type === IssueType.SecurityHotspot ? issue.type : undefined,
  });

  const externalRuleKey = getExternalRuleKey(ruleDetails.key);

  return (
    <Layout.PageHeader
      actions={
        <IssueActionsComponent
          additionalIssueActions={additionalIssueActions}
          issue={issue}
          onChange={onIssueChange}
        />
      }
      className="sw-z-normal"
      description={
        <Layout.PageHeader.Description>
          <Text className="sw-pr-1" isSubtle>
            {ruleDetails.name}
          </Text>
          {ruleDetails.isExternal ? (
            externalRuleKey !== ruleDetails.name && <Text isSubtle>({externalRuleKey})</Text>
          ) : (
            <Link enableOpenInNewTab to={getRuleUrl(ruleDetails.key)}>
              {ruleDetails.key}
            </Link>
          )}

          {/* Only show beta status badge for non-external rules */}
          {!ruleDetails.isExternal && ruleDetails.status === RuleStatus.Beta && (
            <span className="sw-ml-1">
              <RuleStatusBadge rule={ruleDetails} />
            </span>
          )}
        </Layout.PageHeader.Description>
      }
      // `Layout.PageHeader.Navigation` is deliberately not used here: it renders a Radix nav
      // `<ul>`, semantically wrong for the tablist we render, and shrinks its child to content
      // width, which caused the action button to stop short of the header's right edge.
      navigation={<div className="sw-mb-300">{navigation}</div>}
      scrollBehavior="sticky"
      title={
        <IssueTitle
          closeIssue={closeIssue}
          issuePermalink={getPathUrlAsString(issueUrl, false)}
          title={
            <IssueMessageHighlighting
              message={issue.message}
              messageFormattings={issue.messageFormattings}
            />
          }
        />
      }
    />
  );
}

export default memo(IssueHeader);
