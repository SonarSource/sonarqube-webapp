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
  Badge,
  BadgeVariety,
  Heading,
  IconLink,
  Link,
  Text,
  toast,
} from '@sonarsource/echoes-react';
import { memo, useCallback, useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { ClipboardIconButton } from '~shared/components/clipboard';
import { RuleStatusBadge } from '~shared/components/coding-rules/RuleStatusBadge';
import { IssueMessageHighlighting } from '~shared/components/issues/IssueMessageHighlighting';
import { getBranchLikeQuery } from '~shared/helpers/branch-like';
import { SOFTWARE_QUALITY_LABELS } from '~shared/helpers/l10n';
import { SoftwareImpactSeverity, SoftwareQuality } from '~shared/types/clean-code-taxonomy';
import { RuleDetails, RuleStatus } from '~shared/types/rules';
import { setIssueAssignee, setIssueSeverity } from '../../api/issues';
import { BasicSeparator } from '../../design-system';
import { isInput, isShortcut } from '../../helpers/keyboardEventHelpers';
import { KeyboardKeys } from '../../helpers/keycodes';
import { getKeyboardShortcutEnabled } from '../../helpers/preferences';
import { getPathUrlAsString, getRuleUrl } from '../../helpers/urls';
import { getComponentIssuesUrl } from '../../sonar-aligned/helpers/urls';
import { BranchLike } from '../../types/branch-like';
import { IssueActions, IssueSeverity, IssueType } from '../../types/issues';
import { Issue } from '../../types/types';
import { updateIssue } from '../issue/actions';
import IssueActionsBar from '../issue/components/IssueActionsBar';
import { WorkspaceContext } from '../workspace/context';
import IssueHeaderMeta from './IssueHeaderMeta';
import IssueHeaderSide from './IssueHeaderSide';

interface Props {
  additionalIssueActions?: React.ComponentType<{ issue: Issue }>[];
  branchLike?: BranchLike;
  issue: Issue;
  onIssueChange: (issue: Issue) => void;
  ruleDetails: RuleDetails;
}

function IssueHeader({
  additionalIssueActions,
  branchLike,
  issue,
  onIssueChange,
  ruleDetails,
}: Readonly<Props>) {
  const [issuePopupName, setIssuePopupName] = useState<string | undefined>(undefined);
  const intl = useIntl();

  const handleIssuePopupToggle = useCallback((nextPopup: string) => {
    setIssuePopupName((openPopup) => {
      if (nextPopup === openPopup) {
        return undefined;
      }

      // Close current popup first
      if (openPopup) {
        // Needed delay to have correct focus on next popup
        setTimeout(() => {
          setIssuePopupName(nextPopup);
        }, 100);
        return undefined;
      }

      return nextPopup;
    });
  }, []);

  const handleAssignement = useCallback(
    (login: string) => {
      if (issue.assignee !== login) {
        void updateIssue(
          onIssueChange,
          // eslint-disable-next-line local-rules/no-api-imports
          setIssueAssignee({ issue: issue.key, assignee: login }),
        );
      }
      handleIssuePopupToggle('assign');
    },
    [issue.assignee, issue.key, onIssueChange, handleIssuePopupToggle],
  );

  const handleSeverityChange = useCallback(
    (severity: IssueSeverity | SoftwareImpactSeverity, quality?: SoftwareQuality) => {
      const data = quality
        ? { issue: issue.key, impact: `${quality}=${severity}` }
        : { issue: issue.key, severity: severity as IssueSeverity };

      const severityBefore = quality
        ? issue.impacts.find((impact) => impact.softwareQuality === quality)?.severity
        : issue.severity;

      return updateIssue(
        onIssueChange,
        setIssueSeverity(data).then((r) => {
          toast.success({
            description: (
              <FormattedMessage
                id="issue.severity.updated_notification"
                values={{
                  issueLink: undefined,
                  quality: quality
                    ? intl.formatMessage({ id: SOFTWARE_QUALITY_LABELS[quality] })
                    : undefined,
                  before: intl.formatMessage({
                    id: [quality ? 'severity_impact' : 'severity', severityBefore ?? '']
                      .filter(Boolean)
                      .join('.'),
                  }),
                  after: intl.formatMessage({
                    id: [quality ? 'severity_impact' : 'severity', severity].join('.'),
                  }),
                }}
              />
            ),
          });

          return r;
        }),
      );
    },
    [issue.key, issue.impacts, issue.severity, onIssueChange],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (isInput(event) || isShortcut(event) || !getKeyboardShortcutEnabled()) {
        return true;
      } else if (event.key === KeyboardKeys.KeyF) {
        event.preventDefault();
        handleIssuePopupToggle('transition');

        return undefined;
      } else if (event.key === KeyboardKeys.KeyA) {
        event.preventDefault();
        handleIssuePopupToggle('assign');

        return undefined;
      } else if (event.key === KeyboardKeys.KeyM && issue.actions.includes('assign')) {
        event.preventDefault();
        handleAssignement('_me');

        return undefined;
      } else if (event.key === KeyboardKeys.KeyT) {
        event.preventDefault();
        handleIssuePopupToggle('edit-tags');

        return undefined;
      }

      return true;
    },
    [issue.actions, handleAssignement, handleIssuePopupToggle],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown, { capture: true });

    return () => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [handleKeyDown]);

  useEffect(() => {
    setIssuePopupName(undefined);
  }, [issue.key]);

  const issueUrl = getComponentIssuesUrl(issue.project, {
    ...getBranchLikeQuery(branchLike),
    issues: issue.key,
    open: issue.key,
    types: issue.type === IssueType.SecurityHotspot ? issue.type : undefined,
  });

  const canSetTags = issue.actions.includes(IssueActions.SetTags);

  return (
    <header className="sw-flex sw-mb-6">
      <div className="sw-mr-8 sw-flex-1 sw-flex sw-flex-col sw-gap-4 sw-min-w-0">
        <div className="sw-flex sw-flex-col sw-gap-2">
          <div className="sw-flex sw-items-center">
            <Heading as="h1" size="medium">
              <IssueMessageHighlighting
                message={issue.message}
                messageFormattings={issue.messageFormattings}
              />
            </Heading>
            <ClipboardIconButton
              Icon={IconLink}
              aria-label={intl.formatMessage(
                { id: 'issue.permalink_copy' },
                { title: issue.message },
              )}
              className="sw-ml-1 sw-align-bottom"
              copyValue={getPathUrlAsString(issueUrl, false)}
              discreet
            />
          </div>

          <div className="sw-flex sw-items-center sw-justify-between">
            <Text isSubtle>
              <span className="sw-pr-1">{ruleDetails.name}</span>
              {ruleDetails.isExternal ? (
                <span>({ruleDetails.key})</span>
              ) : (
                <Link enableOpenInNewTab to={getRuleUrl(ruleDetails.key)}>
                  {ruleDetails.key}
                </Link>
              )}
              <WorkspaceContext.Consumer>
                {({ externalRulesRepoNames }) => {
                  const ruleEngine =
                    (issue.externalRuleEngine &&
                      externalRulesRepoNames[issue.externalRuleEngine]) ||
                    issue.externalRuleEngine;
                  if (ruleEngine) {
                    return (
                      <Badge className="sw-ml-1" variety={BadgeVariety.Neutral}>
                        {ruleEngine}
                      </Badge>
                    );
                  }

                  return null;
                }}
              </WorkspaceContext.Consumer>

              {/* Only show beta status badge for non-external rules */}
              {!ruleDetails.isExternal && ruleDetails.status === RuleStatus.Beta && (
                <span className="sw-ml-1">
                  <RuleStatusBadge rule={ruleDetails} />
                </span>
              )}
            </Text>
          </div>
        </div>

        <IssueHeaderMeta issue={issue} />

        <BasicSeparator />

        <IssueActionsBar
          additionalIssueActions={additionalIssueActions}
          canSetTags={canSetTags}
          currentPopup={issuePopupName}
          issue={issue}
          onAssign={handleAssignement}
          onChange={onIssueChange}
          showSonarLintBadge
          showTags
          togglePopup={handleIssuePopupToggle}
        />
      </div>
      <IssueHeaderSide
        issue={issue}
        onSetSeverity={
          issue.actions.includes(IssueActions.SetSeverity) ? handleSeverityChange : undefined
        }
      />
    </header>
  );
}

export default memo(IssueHeader);
