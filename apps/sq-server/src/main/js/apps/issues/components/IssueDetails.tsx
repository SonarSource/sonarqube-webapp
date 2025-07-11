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

import styled from '@emotion/styled';
import { Spinner } from '@sonarsource/echoes-react';
import { Helmet } from 'react-helmet-async';
import { useIntl } from 'react-intl';
import {
  FlagMessage,
  LargeCenteredLayout,
  LAYOUT_FOOTER_HEIGHT,
  PageContentFontWrapper,
  themeBorder,
  themeColor,
} from '~design-system';
import { isPortfolioLike } from '~shared/helpers/component';
import { ComponentQualifier } from '~shared/types/component';
import ScreenPositionHelper from '~sq-server-commons/components/common/ScreenPositionHelper';
import StyledNavFix from '~sq-server-commons/components/nav/NavFix';
import { AiCodeFixTab } from '~sq-server-commons/components/rules/AiCodeFixTab';
import IssueTabViewer from '~sq-server-commons/components/rules/IssueTabViewer';
import { fillBranchLike } from '~sq-server-commons/helpers/branch-like';
import { translate } from '~sq-server-commons/helpers/l10n';
import { useRuleDetailsQuery } from '~sq-server-commons/queries/rules';
import A11ySkipTarget from '~sq-server-commons/sonar-aligned/components/a11y/A11ySkipTarget';
import { Component, Issue, Paging } from '~sq-server-commons/types/types';
import SubnavigationIssuesList from '../issues-subnavigation/SubnavigationIssuesList';
import IssueReviewHistoryAndComments from './IssueReviewHistoryAndComments';
import IssuesSourceViewer from './IssuesSourceViewer';

interface IssueDetailsProps {
  component?: Component;
  fetchMoreIssues: () => void;
  handleIssueChange: (issue: Issue) => void;
  handleOpenIssue: (issueKey: string) => void;
  issues: Issue[];
  loading: boolean;
  loadingMore: boolean;
  locationsNavigator: boolean;
  openIssue: Issue;
  paging?: Paging;
  selectFlow: (flowIndex: number) => void;
  selectLocation: (locationIndex: number) => void;
  selected?: string;
  selectedFlowIndex?: number;
  selectedLocationIndex?: number;
}

export default function IssueDetails({
  handleOpenIssue,
  handleIssueChange,
  openIssue,
  component,
  fetchMoreIssues,
  selectFlow,
  selectLocation,
  issues,
  loading,
  loadingMore,
  locationsNavigator,
  paging,
  selected,
  selectedFlowIndex,
  selectedLocationIndex,
}: Readonly<IssueDetailsProps>) {
  const { canBrowseAllChildProjects, qualifier = ComponentQualifier.Project } = component ?? {};
  const { data: ruleData, isLoading: isLoadingRule } = useRuleDetailsQuery({ key: openIssue.rule });
  const openRuleDetails = ruleData?.rule;

  const intl = useIntl();

  const warning = !canBrowseAllChildProjects && isPortfolioLike(qualifier) && (
    <FlagMessage
      className="it__portfolio_warning sw-flex"
      title={translate('issues.not_all_issue_show_why')}
      variant="warning"
    >
      {translate('issues.not_all_issue_show')}
    </FlagMessage>
  );

  return (
    <PageWrapperStyle id="issues-page">
      <LargeCenteredLayout>
        <PageContentFontWrapper className="sw-typo-default">
          <div className="sw-w-full sw-flex" id="issues-page">
            <Helmet
              defer={false}
              title={openIssue.message}
              titleTemplate={intl.formatMessage(
                { id: 'page_title.template.with_category' },
                { page: translate('issues.page') },
              )}
            />
            <h1 className="sw-sr-only">{translate('issues.page')}</h1>

            <SideBarStyle>
              <ScreenPositionHelper className="sw-z-filterbar">
                {({ top }) => (
                  <StyledNavFix
                    aria-label={translate('list_of_issues')}
                    className="issues-nav-bar sw-overflow-y-auto"
                    data-testid="issues-nav-bar"
                    style={{ height: `calc((100vh - ${top}px) - ${LAYOUT_FOOTER_HEIGHT}px)` }}
                  >
                    <div className="sw-w-[300px] lg:sw-w-[390px] sw-h-full">
                      <A11ySkipTarget
                        anchor="issues_sidebar"
                        label={translate('issues.skip_to_list')}
                        weight={10}
                      />
                      <div className="sw-h-full">
                        {warning && <div className="sw-py-4">{warning}</div>}

                        <SubnavigationIssuesList
                          fetchMoreIssues={fetchMoreIssues}
                          issues={issues}
                          loading={loading}
                          loadingMore={loadingMore}
                          onFlowSelect={selectFlow}
                          onIssueSelect={handleOpenIssue}
                          onLocationSelect={selectLocation}
                          paging={paging}
                          selected={selected}
                          selectedFlowIndex={selectedFlowIndex}
                          selectedLocationIndex={selectedLocationIndex}
                        />
                      </div>
                    </div>
                  </StyledNavFix>
                )}
              </ScreenPositionHelper>
            </SideBarStyle>

            <main className="sw-relative sw-flex-1 sw-min-w-0">
              <ScreenPositionHelper>
                {({ top }) => (
                  <StyledIssueWrapper
                    className="it__layout-page-main-inner sw-pt-0 details-open sw-ml-12"
                    style={{ height: `calc((100vh - ${top + LAYOUT_FOOTER_HEIGHT}px)` }}
                  >
                    <A11ySkipTarget anchor="issues_main" />

                    <Spinner isLoading={isLoadingRule}>
                      {openRuleDetails && (
                        <IssueTabViewer
                          activityTabContent={
                            <IssueReviewHistoryAndComments
                              issue={openIssue}
                              onChange={handleIssueChange}
                            />
                          }
                          codeTabContent={
                            <IssuesSourceViewer
                              branchLike={fillBranchLike(openIssue.branch, openIssue.pullRequest)}
                              issues={issues}
                              locationsNavigator={locationsNavigator}
                              onIssueSelect={handleOpenIssue}
                              onLocationSelect={selectLocation}
                              openIssue={openIssue}
                              selectedFlowIndex={selectedFlowIndex}
                              selectedLocationIndex={selectedLocationIndex}
                            />
                          }
                          extendedDescription={openRuleDetails.htmlNote}
                          issue={openIssue}
                          onIssueChange={handleIssueChange}
                          ruleDescriptionContextKey={openIssue.ruleDescriptionContextKey}
                          ruleDetails={openRuleDetails}
                          selectedFlowIndex={selectedFlowIndex}
                          selectedLocationIndex={selectedLocationIndex}
                          suggestionTabContent={
                            <AiCodeFixTab
                              branchLike={fillBranchLike(openIssue.branch, openIssue.pullRequest)}
                              issue={openIssue}
                              language={openRuleDetails.lang}
                            />
                          }
                        />
                      )}
                    </Spinner>
                  </StyledIssueWrapper>
                )}
              </ScreenPositionHelper>
            </main>
          </div>
        </PageContentFontWrapper>
      </LargeCenteredLayout>
    </PageWrapperStyle>
  );
}

const PageWrapperStyle = styled.div`
  background-color: ${themeColor('backgroundPrimary')};
`;

const SideBarStyle = styled.div`
  border-left: ${themeBorder('default', 'filterbarBorder')};
  border-right: ${themeBorder('default', 'filterbarBorder')};
  background-color: ${themeColor('backgroundSecondary')};
`;

const StyledIssueWrapper = styled.div`
  &.details-open {
    box-sizing: border-box;
    border-radius: 4px;
    border: ${themeBorder('default', 'filterbarBorder')};
    background-color: ${themeColor('filterbar')};
    border-bottom: none;
    border-top: none;
  }
`;
