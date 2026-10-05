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

import { Divider, Layout, Text, toast } from '@sonarsource/echoes-react';
import classNames from 'classnames';
import { ComponentType, ReactNode, useCallback, useContext } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Location } from 'react-router-dom';
import { useIsNoticeDismissed } from '~adapters/helpers/notices';
import { useCurrentUser } from '~adapters/helpers/users';
import { AssigneeUser } from '~shared/components/issues/IssueAssign';
import { IssueMetadata } from '~shared/components/issues/IssueMetadata';
import {
  IssuePopupContext,
  IssuePopupName,
  IssuePopupProvider,
} from '~shared/components/issues/IssuePopupContext';
import { SOFTWARE_QUALITY_LABELS } from '~shared/helpers/l10n';
import { SoftwareImpactSeverity, SoftwareQuality } from '~shared/types/clean-code-taxonomy';
import { IssueSeverity } from '~shared/types/issues';
import { RuleDetails } from '~shared/types/rules';
import { setIssueAssignee, setIssueSeverity } from '../../../api/issues';
import { ToggleButton } from '../../../design-system';
import { fillBranchLike } from '../../../helpers/branch-like';
import { getKeyboardShortcutEnabled } from '../../../helpers/preferences';
import { withUseGetFixSuggestionsIssues } from '../../../queries/fix-suggestions';
import { useStandardExperienceModeQuery } from '../../../queries/mode';
import { IssueActions } from '../../../types/issues';
import { Issue } from '../../../types/types';
import { NoticeType } from '../../../types/users';
import withLocation from '../../hoc/withLocation';
import IssueHeader from '../../issues/IssueHeader';
import { TabSelectorContext } from '../../rules/TabSelectorContext';
import IssueTypePill from '../../shared/IssueTypePill';
import { WorkspaceContext } from '../../workspace/context';
import { updateIssue } from '../actions';
import { useIssueTabs } from '../hooks/useIssueTabs';
import { useSetIssueTags } from '../hooks/useSetIssueTags';
import IssueTagsPopup from '../popups/IssueTagsPopup';
import { AssigneeDropdown } from './AssigneeDropdown';
import { hasIssueBadges, IssueBadges } from './IssueBadges';

interface IssueTabViewerProps {
  activityTabContent?: ReactNode;
  additionalIssueActions?: ComponentType<{ issue: Issue }>[];
  aiSuggestionAvailable?: boolean;
  codeTabContent?: ReactNode;
  extendedDescription?: string;
  issue: Issue;
  location: Location;
  /**
   * Rendered to the right of the tab strip, in the page header navigation row.
   * Used by SonarQube Server to inject addon actions (e.g. "Intended architecture").
   */
  navigationActions?: ReactNode;
  onIssueChange: (issue: Issue) => void;
  ruleDescriptionContextKey?: string;
  ruleDetails: RuleDetails;
  selectedFlowIndex?: number;
  selectedLocationIndex?: number;
  suggestionTabContent?: ReactNode;
  closeIssue: () => void;
}

function IssueTabViewer(props: Readonly<IssueTabViewerProps>) {
  const {
    activityTabContent,
    additionalIssueActions,
    aiSuggestionAvailable,
    codeTabContent,
    extendedDescription,
    issue,
    location,
    navigationActions,
    onIssueChange,
    ruleDescriptionContextKey,
    ruleDetails,
    selectedFlowIndex,
    selectedLocationIndex,
    suggestionTabContent,
    closeIssue,
  } = props;

  const { formatMessage } = useIntl();
  const { isLoggedIn } = useCurrentUser();
  const isEducationPrinciplesDismissed = useIsNoticeDismissed(NoticeType.EDUCATION_PRINCIPLES);
  const { data: isStandardMode } = useStandardExperienceModeQuery();
  const { externalRulesRepoNames } = useContext(WorkspaceContext);

  const displayEducationalPrinciplesNotification = Boolean(
    ruleDetails.educationPrinciples &&
    ruleDetails.educationPrinciples.length > 0 &&
    isLoggedIn &&
    !isEducationPrinciplesDismissed,
  );

  const { handleSelectTabs, selectedTab, tabs } = useIssueTabs({
    activityTabContent,
    aiSuggestionAvailable,
    codeTabContent,
    displayEducationalPrinciplesNotification,
    extendedDescription,
    issue,
    location,
    ruleDescriptionContextKey,
    ruleDetails,
    selectedFlowIndex,
    selectedLocationIndex,
    suggestionTabContent,
  });

  const canAssign = issue.actions.includes(IssueActions.Assign);
  const canSetSeverity = issue.actions.includes(IssueActions.SetSeverity);
  const { canSetTags, setTags } = useSetIssueTags(issue, onIssueChange);
  const assignedUser = issue.assigneeName ?? issue.assignee;

  const handleAssign = useCallback(
    (user: AssigneeUser) => {
      if (issue.assignee !== user.login) {
        void updateIssue(
          onIssueChange,
          setIssueAssignee({ issue: issue.key, assignee: user.login }),
        );
      }
    },
    [issue.assignee, issue.key, onIssueChange],
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
                    ? formatMessage({ id: SOFTWARE_QUALITY_LABELS[quality] })
                    : undefined,
                  before: formatMessage({
                    id: [quality ? 'severity_impact' : 'severity', severityBefore ?? '']
                      .filter(Boolean)
                      .join('.'),
                  }),
                  after: formatMessage({
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
    [issue.key, issue.impacts, issue.severity, onIssueChange, formatMessage],
  );

  if (!tabs || tabs.length === 0 || !selectedTab) {
    return null;
  }

  return (
    <IssuePopupProvider resetKey={issue.key}>
      <IssueHeader
        additionalIssueActions={additionalIssueActions}
        branchLike={fillBranchLike(issue.branch, issue.pullRequest)}
        closeIssue={closeIssue}
        issue={issue}
        navigation={
          // No bottom margin here: IssueHeader already wraps `navigation` in `sw-mb-300`.
          <div className="sw-flex sw-justify-between sw-items-center">
            {/* This toggle button is used as tabs, do not replace it with Echoes ToggleButtonGroup */}
            <ToggleButton
              onChange={handleSelectTabs}
              options={tabs}
              role="tablist"
              value={selectedTab.key}
            />
            {navigationActions}
          </div>
        }
        onIssueChange={onIssueChange}
        ruleDetails={ruleDetails}
      />

      <Layout.PageContent className="sw-grid sw-grid-cols-5 sw-gap-6">
        <div
          aria-labelledby={`tab-${selectedTab.key}`}
          className="sw-flex sw-flex-col sw-col-span-4"
          id={`tabpanel-${selectedTab.key}`}
          role="tabpanel"
        >
          {tabs
            .filter((t) => t.key === selectedTab.key)
            .map((tab) => (
              <div
                className={classNames({
                  'sw-hidden': tab.key !== selectedTab.key,
                })}
                key={tab.key}
              >
                <TabSelectorContext.Provider value={handleSelectTabs}>
                  {tab.content}
                </TabSelectorContext.Provider>
              </div>
            ))}
        </div>
        <div className="sw-col-span-1">
          <IssuePopupContext.Consumer>
            {(popupContext) => (
              <IssueMetadata
                assign={{
                  canAssign,
                  isSelected: true,
                  onAssign: handleAssign,
                  renderDropdown: ({ menuIsOpen, onMenuClose, onSelect }) => (
                    <AssigneeDropdown
                      assignedUser={assignedUser}
                      assigneeAvatar={issue.assigneeAvatar}
                      assigneeLogin={issue.assigneeLogin}
                      menuIsOpen={menuIsOpen}
                      onMenuClose={onMenuClose}
                      onSelect={onSelect}
                    />
                  ),
                }}
                externalRulesRepoNames={externalRulesRepoNames}
                isShortcutEnabled={getKeyboardShortcutEnabled()}
                issue={issue}
                issueType={
                  isStandardMode && (
                    <>
                      <dt>
                        <Text isHighlighted>
                          <FormattedMessage id="issue.details.type" />
                        </Text>
                      </dt>
                      <dd>
                        <IssueTypePill
                          issueType={issue.type}
                          onSetSeverity={canSetSeverity ? handleSeverityChange : undefined}
                          severity={issue.severity}
                        />
                      </dd>
                      <Divider className="sw-my-1" />
                    </>
                  )
                }
                line={issue.line}
                onSetSeverity={canSetSeverity ? handleSeverityChange : undefined}
                properties={hasIssueBadges(issue) ? <IssueBadges issue={issue} /> : undefined}
                rule={ruleDetails}
                showCleanCodeAttribute={!isStandardMode}
                showImpact={!isStandardMode}
                tags={{
                  canSetTags,
                  isOpen: popupContext?.currentPopup === IssuePopupName.EditTags,
                  overlay: <IssueTagsPopup selectedTags={issue.tags ?? []} setTags={setTags} />,
                  selectedIssueKey: issue.key,
                  togglePopup: popupContext?.togglePopup,
                }}
              />
            )}
          </IssuePopupContext.Consumer>
        </div>
      </Layout.PageContent>
    </IssuePopupProvider>
  );
}

const IssueTabViewerWithLocationAndFixSuggestions = withLocation(
  withUseGetFixSuggestionsIssues<IssueTabViewerProps>(IssueTabViewer),
);

export { IssueTabViewerWithLocationAndFixSuggestions as IssueTabViewer };
