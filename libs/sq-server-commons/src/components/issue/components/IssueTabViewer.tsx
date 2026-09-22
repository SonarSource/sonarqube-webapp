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
import classNames from 'classnames';
import { ComponentType, ReactNode } from 'react';
import { Location } from 'react-router-dom';
import { useIsNoticeDismissed } from '~adapters/helpers/notices';
import { useCurrentUser } from '~adapters/helpers/users';
import { RuleDetails } from '~shared/types/rules';
import { ToggleButton } from '../../../design-system';
import { fillBranchLike } from '../../../helpers/branch-like';
import { withUseGetFixSuggestionsIssues } from '../../../queries/fix-suggestions';
import { Issue } from '../../../types/types';
import { NoticeType } from '../../../types/users';
import withLocation from '../../hoc/withLocation';
import IssueHeader from '../../issues/IssueHeader';
import { TabSelectorContext } from '../../rules/TabSelectorContext';
import { useIssueTabs } from '../hooks/useIssueTabs';

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
  } = props;

  const { isLoggedIn } = useCurrentUser();
  const isEducationPrinciplesDismissed = useIsNoticeDismissed(NoticeType.EDUCATION_PRINCIPLES);

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

  if (!tabs || tabs.length === 0 || !selectedTab) {
    return null;
  }

  return (
    <>
      <IssueHeader
        additionalIssueActions={additionalIssueActions}
        branchLike={fillBranchLike(issue.branch, issue.pullRequest)}
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

      <Layout.PageContent>
        <div
          aria-labelledby={`tab-${selectedTab.key}`}
          className="sw-flex sw-flex-col"
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
      </Layout.PageContent>
    </>
  );
}

const IssueTabViewerWithLocationAndFixSuggestions = withLocation(
  withUseGetFixSuggestionsIssues<IssueTabViewerProps>(IssueTabViewer),
);

export { IssueTabViewerWithLocationAndFixSuggestions as IssueTabViewer };
