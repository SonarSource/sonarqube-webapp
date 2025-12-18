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

import { Layout, MessageCallout, Spinner, ToggleTip } from '@sonarsource/echoes-react';
import { ComponentProps, useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import A11ySkipTarget from '~shared/components/a11y/A11ySkipTarget';
import { isPortfolioLike } from '~shared/helpers/component';
import { filterQueryToSearchString } from '~shared/helpers/query';
import { ComponentQualifier } from '~shared/types/component';
import { Paging } from '~shared/types/paging';
import { Location, Router } from '~shared/types/router';
import { addons } from '~sq-server-addons/index';
import { AiCodeFixTab } from '~sq-server-commons/components/rules/AiCodeFixTab';
import IssueTabViewer from '~sq-server-commons/components/rules/IssueTabViewer';
import { fillBranchLike } from '~sq-server-commons/helpers/branch-like';
import { useRuleDetailsQuery } from '~sq-server-commons/queries/rules';
import { Component, Issue } from '~sq-server-commons/types/types';
import SubnavigationIssuesList from '../issues-subnavigation/SubnavigationIssuesList';
import IssueReviewHistoryAndComments from './IssueReviewHistoryAndComments';
import { IssuesPageTemplate } from './IssuesPageTemplate';
import IssuesSourceViewer from './IssuesSourceViewer';

interface IssueDetailsProps {
  component?: Component;
  fetchMoreIssues: () => void;
  handleIssueChange: (issue: Issue) => void;
  handleOpenIssue: (issueKey: string) => void;
  issues: Issue[];
  loading: boolean;
  loadingMore: boolean;
  location: Location;
  locationsNavigator: boolean;
  openIssue: Issue;
  paging?: Paging;
  router: Router;
  selectFlow: (flowIndex: number) => void;
  selectLocation: (locationIndex: number) => void;
  selected?: string;
  selectedFlowIndex?: number;
  selectedLocationIndex?: number;
}

export default function IssueDetails(props: Readonly<IssueDetailsProps>) {
  const { handleOpenIssue, handleIssueChange, openIssue, component, fetchMoreIssues } = props;
  const { selectFlow, selectLocation, issues, loading, loadingMore, locationsNavigator } = props;
  const { paging, selected, selectedFlowIndex, selectedLocationIndex } = props;
  const { canBrowseAllChildProjects, qualifier = ComponentQualifier.Project } = component ?? {};
  const { data: ruleData, isLoading: isLoadingRule } = useRuleDetailsQuery({ key: openIssue.rule });
  const openRuleDetails = ruleData?.rule;

  const intl = useIntl();

  const additionalIssueActions = useMemo(() => {
    const additionalActions = [] as Required<
      ComponentProps<typeof IssueTabViewer>
    >['additionalIssueActions'];

    if (addons.jira !== undefined && component !== undefined) {
      const { IssueJiraWorkItem } = addons.jira;
      additionalActions.push(({ issue }) => (
        <IssueJiraWorkItem component={component} issue={issue} />
      ));
    }

    return additionalActions;
  }, [component]);

  return (
    <IssuesPageTemplate
      asideLeft={
        <Layout.AsideLeft className="it__layout-page-filters" size="medium">
          <nav
            aria-label={intl.formatMessage({ id: 'list_of_issues' })}
            data-testid="issues-nav-bar"
          >
            <A11ySkipTarget
              anchor="issues_sidebar"
              label={intl.formatMessage({ id: 'issues.skip_to_list' })}
              weight={10}
            />

            {!canBrowseAllChildProjects && isPortfolioLike(qualifier) && (
              <MessageCallout className="it__portfolio_warning sw-pb-4" variety="warning">
                <span className="sw-flex sw-items-center sw-text-nowrap">
                  <FormattedMessage id="issues.not_all_issue_show" />
                  <ToggleTip
                    className="sw-ml-1"
                    description={<FormattedMessage id="issues.not_all_issue_show_why" />}
                  />
                </span>
              </MessageCallout>
            )}

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
          </nav>
        </Layout.AsideLeft>
      }
      breadcrumbs={useMemo(
        () => [
          {
            linkElement: intl.formatMessage({ id: 'issues.page' }),
            to: {
              ...props.location,
              search: filterQueryToSearchString(props.router.searchParams, (key) => key !== 'open'),
            },
          },
          { hasEllipsis: true, linkElement: openIssue.message },
        ],
        [openIssue.message, props.location, props.router.searchParams, intl],
      )}
      skipPageContentWrapper
      title={intl.formatMessage({ id: 'issues.page' })}
    >
      <div className="sw-contents it__layout-page-main-inner details-open" id="issues-page">
        <A11ySkipTarget anchor="issues_main" />

        <Spinner className="sw-p-4" isLoading={isLoadingRule}>
          {openRuleDetails && (
            <IssueTabViewer
              activityTabContent={
                <IssueReviewHistoryAndComments issue={openIssue} onChange={handleIssueChange} />
              }
              additionalIssueActions={additionalIssueActions}
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
      </div>
    </IssuesPageTemplate>
  );
}
