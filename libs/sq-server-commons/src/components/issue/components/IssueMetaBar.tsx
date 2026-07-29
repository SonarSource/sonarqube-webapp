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

import styled from '@emotion/styled';
import { cssVar, IconComment, Tooltip } from '@sonarsource/echoes-react';
import classNames from 'classnames';
import * as React from 'react';
import { useIntl } from 'react-intl';
import { useLocation } from '~shared/components/hoc/withRouter';
import DateFromNow from '~shared/components/intl/DateFromNow';
import { ExternalRuleEngineBadge } from '~shared/components/issues/ExternalRuleEngineBadge';
import { isDefined } from '~shared/helpers/types';
import { SeparatorCircleIcon } from '../../../design-system';
import { useStandardExperienceModeQuery } from '../../../queries/mode';
import { Issue } from '../../../types/types';
import { WorkspaceContext } from '../../workspace/context';
import IssuePrioritized from './IssuePrioritized';
import IssueSeverity from './IssueSeverity';
import IssueType from './IssueType';
import SonarLintBadge from './SonarLintBadge';

interface Props {
  issue: Issue;
  showLine?: boolean;
}

export default function IssueMetaBar(props: Readonly<Props>) {
  const { issue, showLine } = props;
  const location = useLocation();

  const { formatMessage } = useIntl();
  const { externalRulesRepoNames } = React.useContext(WorkspaceContext);
  const { data: isStandardMode } = useStandardExperienceModeQuery();

  const ruleEngine =
    (issue.externalRuleEngine && externalRulesRepoNames[issue.externalRuleEngine]) ||
    issue.externalRuleEngine;

  const hasComments = !!issue.comments?.length;

  const issueMetaListItemClassNames =
    'sw-typo-sm sw-overflow-hidden sw-whitespace-nowrap sw-max-w-abs-150';

  return (
    <ul className="sw-flex sw-items-center sw-gap-1 sw-typo-sm sw-whitespace-nowrap">
      {issue.quickFixAvailable && (
        <>
          <li className={issueMetaListItemClassNames}>
            <SonarLintBadge compact />
          </li>
          <SeparatorCircleIcon aria-hidden as="li" />
        </>
      )}

      {ruleEngine && (
        <>
          <li className={issueMetaListItemClassNames}>
            <ExternalRuleEngineBadge
              externalRuleEngine={issue.externalRuleEngine!}
              label={ruleEngine}
            />
          </li>
          <SeparatorCircleIcon aria-hidden as="li" />
        </>
      )}

      {issue.line && (
        <>
          <IssueMetaListItem className={issueMetaListItemClassNames}>
            L{issue.line}
          </IssueMetaListItem>

          <SeparatorCircleIcon aria-hidden as="li" />
        </>
      )}

      {!!issue.codeVariants?.length && (
        <>
          <IssueMetaListItem>
            <Tooltip content={issue.codeVariants.join(', ')}>
              <span>
                {issue.codeVariants.length > 1
                  ? formatMessage({ id: 'issue.x_code_variants' }, { 0: issue.codeVariants.length })
                  : formatMessage({ id: 'issue.1_code_variant' })}
              </span>
            </Tooltip>
          </IssueMetaListItem>
          <SeparatorCircleIcon aria-hidden as="li" />
        </>
      )}

      {hasComments && (
        <>
          <IssueMetaListItem
            className={classNames(issueMetaListItemClassNames, 'sw-flex sw-gap-1')}
          >
            <IconComment aria-label={formatMessage({ id: 'issue.comment.formlink' })} />
            {issue.comments?.length}
          </IssueMetaListItem>

          <SeparatorCircleIcon aria-hidden as="li" />
        </>
      )}

      {showLine && isDefined(issue.textRange) && (
        <>
          <Tooltip content={formatMessage({ id: 'line_number' })}>
            <IssueMetaListItem className={issueMetaListItemClassNames}>
              {formatMessage({ id: 'issue.ncloc_x.short' }, { 0: issue.textRange.endLine })}
            </IssueMetaListItem>
          </Tooltip>

          <SeparatorCircleIcon aria-hidden as="li" />
        </>
      )}

      {issue.effort && (
        <>
          <IssueMetaListItem className={issueMetaListItemClassNames}>
            {formatMessage({ id: 'issue.x_effort' }, { 0: issue.effort })}
          </IssueMetaListItem>

          <SeparatorCircleIcon aria-hidden as="li" />
        </>
      )}

      <IssueMetaListItem className={issueMetaListItemClassNames}>
        <DateFromNow date={issue.creationDate} />
      </IssueMetaListItem>
      {!isStandardMode && (location.query.types || location.query.severities) && (
        <>
          <SeparatorCircleIcon aria-hidden as="li" />

          <IssueType height={12} issue={issue} width={12} />

          <SeparatorCircleIcon aria-hidden as="li" data-guiding-id="issue-4" />

          <IssueSeverity height={12} issue={issue} width={12} />
        </>
      )}

      {issue.prioritizedRule && (
        <>
          <SeparatorCircleIcon aria-hidden as="li" />

          <IssueMetaListItem className={issueMetaListItemClassNames}>
            <IssuePrioritized />
          </IssueMetaListItem>
        </>
      )}
    </ul>
  );
}

const IssueMetaListItem = styled.li`
  color: ${cssVar('color-text-subtle')};
`;
