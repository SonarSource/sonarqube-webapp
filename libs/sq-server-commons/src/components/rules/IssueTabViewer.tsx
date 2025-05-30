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

import classNames from 'classnames';
import { cloneDeep, debounce, groupBy } from 'lodash';
import * as React from 'react';
import { Location } from 'react-router-dom';
import { RuleDescriptionSections, RuleDetails } from '~shared/types/rules';
import { dismissNotice } from '../../api/users';
import { CurrentUserContextInterface } from '../../context/current-user/CurrentUserContext';
import withCurrentUserContext from '../../context/current-user/withCurrentUserContext';
import { LAYOUT_FOOTER_HEIGHT, ToggleButton } from '../../design-system';
import { fillBranchLike } from '../../helpers/branch-like';
import { translate } from '../../helpers/l10n';
import { withUseGetFixSuggestionsIssues } from '../../queries/fix-suggestions';
import { Issue } from '../../types/types';
import { CurrentUser, NoticeType } from '../../types/users';
import ScreenPositionHelper from '../common/ScreenPositionHelper';
import withLocation from '../hoc/withLocation';
import IssueHeader from '../issues/IssueHeader';
import StyledHeader from '../issues/StyledHeader';
import MoreInfoRuleDescription from './MoreInfoRuleDescription';
import RuleDescription from './RuleDescription';
import { TabSelectorContext } from './TabSelectorContext';

interface IssueTabViewerProps extends CurrentUserContextInterface {
  activityTabContent?: React.ReactNode;
  aiSuggestionAvailable: boolean;
  codeTabContent?: React.ReactNode;
  currentUser: CurrentUser;
  extendedDescription?: string;
  issue: Issue;
  location: Location;
  onIssueChange: (issue: Issue) => void;
  ruleDescriptionContextKey?: string;
  ruleDetails: RuleDetails;
  selectedFlowIndex?: number;
  selectedLocationIndex?: number;
  suggestionTabContent?: React.ReactNode;
}
interface State {
  displayEducationalPrinciplesNotification?: boolean;
  educationalPrinciplesNotificationHasBeenDismissed?: boolean;
  selectedTab?: Tab;
  tabs: Tab[];
}

export interface Tab {
  content: React.ReactNode;
  counter?: number;
  key: TabKeys;
  label: string;
  value: TabKeys;
}

export enum TabKeys {
  Code = 'code',
  WhyIsThisAnIssue = 'why',
  HowToFixIt = 'how_to_fix',
  AssessTheIssue = 'assess_the_problem',
  CodeFix = 'code_fix',
  Activity = 'activity',
  MoreInfo = 'more_info',
}

const DEBOUNCE_FOR_SCROLL = 250;

export class IssueTabViewer extends React.PureComponent<IssueTabViewerProps, State> {
  headerNode?: HTMLElement | null = null;
  state: State = {
    tabs: [],
  };

  educationPrinciplesRef: React.RefObject<HTMLDivElement>;

  constructor(props: IssueTabViewerProps) {
    super(props);

    this.educationPrinciplesRef = React.createRef();

    this.checkIfEducationPrinciplesAreVisible = debounce(
      this.checkIfEducationPrinciplesAreVisible,
      DEBOUNCE_FOR_SCROLL,
    );
  }

  componentDidMount() {
    this.setState((prevState) => this.computeState(prevState));
    this.attachScrollEvent();

    const tabs = this.computeTabs(Boolean(this.state.displayEducationalPrinciplesNotification));

    const query = new URLSearchParams(this.props.location.search);

    if (query.has('why')) {
      this.setState({
        selectedTab: tabs.find((tab) => tab.key === TabKeys.WhyIsThisAnIssue) || tabs[0],
      });
    }
  }

  componentDidUpdate(prevProps: IssueTabViewerProps, prevState: State) {
    const {
      ruleDetails,
      ruleDescriptionContextKey,
      currentUser,
      issue,
      selectedFlowIndex,
      selectedLocationIndex,
      aiSuggestionAvailable,
    } = this.props;

    const { selectedTab } = this.state;

    if (
      prevProps.ruleDetails.key !== ruleDetails.key ||
      prevProps.ruleDescriptionContextKey !== ruleDescriptionContextKey ||
      prevProps.issue !== issue ||
      prevProps.selectedFlowIndex !== selectedFlowIndex ||
      (prevProps.selectedLocationIndex ?? -1) !== (selectedLocationIndex ?? -1) ||
      prevProps.currentUser !== currentUser ||
      prevProps.aiSuggestionAvailable !== aiSuggestionAvailable
    ) {
      this.setState((pState) =>
        this.computeState(
          pState,
          prevProps.ruleDetails !== ruleDetails ||
            (prevProps.issue && issue && prevProps.issue.key !== issue.key) ||
            prevProps.selectedFlowIndex !== selectedFlowIndex ||
            prevProps.selectedLocationIndex !== selectedLocationIndex,
        ),
      );
    }

    if (selectedTab?.key === TabKeys.MoreInfo) {
      this.checkIfEducationPrinciplesAreVisible();
    }

    if (
      prevState.selectedTab?.key === TabKeys.MoreInfo &&
      prevState.displayEducationalPrinciplesNotification &&
      prevState.educationalPrinciplesNotificationHasBeenDismissed
    ) {
      this.props.updateDismissedNotices(NoticeType.EDUCATION_PRINCIPLES, true);
    }
  }

  componentWillUnmount() {
    this.detachScrollEvent();
  }

  computeState = (prevState: State, resetSelectedTab = false) => {
    const {
      ruleDetails,
      currentUser: { isLoggedIn, dismissedNotices },
    } = this.props;

    const displayEducationalPrinciplesNotification =
      !!ruleDetails.educationPrinciples &&
      ruleDetails.educationPrinciples.length > 0 &&
      isLoggedIn &&
      !dismissedNotices[NoticeType.EDUCATION_PRINCIPLES];

    const tabs = this.computeTabs(displayEducationalPrinciplesNotification);

    const selectedTab =
      resetSelectedTab || !prevState.selectedTab ? tabs[0] : prevState.selectedTab;

    return {
      tabs,
      selectedTab,
      displayEducationalPrinciplesNotification,
    };
  };

  computeTabs = (displayEducationalPrinciplesNotification: boolean) => {
    const {
      codeTabContent,
      ruleDetails: { descriptionSections, educationPrinciples, lang: ruleLanguage, type: ruleType },
      ruleDescriptionContextKey,
      extendedDescription,
      activityTabContent,
      issue,
      suggestionTabContent,
      aiSuggestionAvailable,
    } = this.props;

    // As we might tamper with the description later on, we clone to avoid any side effect
    const descriptionSectionsByKey = cloneDeep(
      groupBy(descriptionSections, (section) => section.key),
    );

    if (extendedDescription) {
      if (descriptionSectionsByKey[RuleDescriptionSections.Resources]?.length > 0) {
        // We add the extended description (htmlNote) in the first context, in case there are contexts
        // Extended description will get reworked in future
        descriptionSectionsByKey[RuleDescriptionSections.Resources][0].content +=
          '<br/>' + extendedDescription;
      } else {
        descriptionSectionsByKey[RuleDescriptionSections.Resources] = [
          {
            key: RuleDescriptionSections.Resources,
            content: extendedDescription,
          },
        ];
      }
    }

    const tabs: Tab[] = [
      {
        value: TabKeys.WhyIsThisAnIssue,
        key: TabKeys.WhyIsThisAnIssue,
        label:
          ruleType === 'SECURITY_HOTSPOT'
            ? translate('coding_rules.description_section.title.root_cause.SECURITY_HOTSPOT')
            : translate('coding_rules.description_section.title.root_cause'),
        content: (descriptionSectionsByKey[RuleDescriptionSections.Default] ||
          descriptionSectionsByKey[RuleDescriptionSections.RootCause]) && (
          <RuleDescription
            defaultContextKey={ruleDescriptionContextKey}
            language={ruleLanguage}
            sections={(
              descriptionSectionsByKey[RuleDescriptionSections.Default] ??
              descriptionSectionsByKey[RuleDescriptionSections.RootCause]
            ).concat(descriptionSectionsByKey[RuleDescriptionSections.Introduction] ?? [])}
          />
        ),
      },
      {
        value: TabKeys.AssessTheIssue,
        key: TabKeys.AssessTheIssue,
        label: translate('coding_rules.description_section.title', TabKeys.AssessTheIssue),
        content: descriptionSectionsByKey[RuleDescriptionSections.AssessTheProblem] && (
          <RuleDescription
            language={ruleLanguage}
            sections={descriptionSectionsByKey[RuleDescriptionSections.AssessTheProblem]}
          />
        ),
      },
      {
        value: TabKeys.HowToFixIt,
        key: TabKeys.HowToFixIt,
        label: translate('coding_rules.description_section.title', TabKeys.HowToFixIt),
        content: descriptionSectionsByKey[RuleDescriptionSections.HowToFix] && (
          <RuleDescription
            defaultContextKey={ruleDescriptionContextKey}
            language={ruleLanguage}
            sections={descriptionSectionsByKey[RuleDescriptionSections.HowToFix]}
          />
        ),
      },
      ...(aiSuggestionAvailable
        ? [
            {
              value: TabKeys.CodeFix,
              key: TabKeys.CodeFix,
              label: translate('coding_rules.description_section.title', TabKeys.CodeFix),
              content: suggestionTabContent,
            },
          ]
        : []),
      {
        value: TabKeys.Activity,
        key: TabKeys.Activity,
        label: translate('coding_rules.description_section.title', TabKeys.Activity),
        content: activityTabContent,
        counter: issue?.comments?.length,
      },
      {
        value: TabKeys.MoreInfo,
        key: TabKeys.MoreInfo,
        label: translate('coding_rules.description_section.title', TabKeys.MoreInfo),
        content: ((educationPrinciples && educationPrinciples.length > 0) ||
          descriptionSectionsByKey[RuleDescriptionSections.Resources]) && (
          <MoreInfoRuleDescription
            displayEducationalPrinciplesNotification={displayEducationalPrinciplesNotification}
            educationPrinciples={educationPrinciples}
            educationPrinciplesRef={this.educationPrinciplesRef}
            language={ruleLanguage}
            sections={descriptionSectionsByKey[RuleDescriptionSections.Resources]}
          />
        ),
        counter: displayEducationalPrinciplesNotification ? 1 : undefined,
      },
    ];

    if (codeTabContent !== undefined) {
      tabs.unshift({
        value: TabKeys.Code,
        key: TabKeys.Code,
        label: translate('issue.tabs', TabKeys.Code),
        content: codeTabContent,
      });
    }

    return tabs.filter((tab) => tab.content);
  };

  attachScrollEvent = () => {
    document.addEventListener('scroll', this.checkIfEducationPrinciplesAreVisible, {
      capture: true,
    });
  };

  detachScrollEvent = () => {
    document.removeEventListener('scroll', this.checkIfEducationPrinciplesAreVisible, {
      capture: true,
    });
  };

  checkIfEducationPrinciplesAreVisible = () => {
    const {
      displayEducationalPrinciplesNotification,
      educationalPrinciplesNotificationHasBeenDismissed,
    } = this.state;

    if (this.educationPrinciplesRef.current) {
      const rect = this.educationPrinciplesRef.current.getBoundingClientRect();
      const isVisible = rect.top <= (window.innerHeight || document.documentElement.clientHeight);

      if (
        isVisible &&
        displayEducationalPrinciplesNotification &&
        !educationalPrinciplesNotificationHasBeenDismissed
      ) {
        dismissNotice(NoticeType.EDUCATION_PRINCIPLES)
          .then(() => {
            this.detachScrollEvent();
            this.setState({
              educationalPrinciplesNotificationHasBeenDismissed: true,
            });
          })
          .catch(() => {
            /* noop */
          });
      }
    }
  };

  handleSelectTabs = (currentTabKey: TabKeys) => {
    this.setState(({ tabs }) => {
      return {
        selectedTab: tabs.find((tab) => tab.key === currentTabKey) || tabs[0],
      };
    });
  };

  render() {
    const { issue, ruleDetails } = this.props;
    const { tabs, selectedTab } = this.state;

    if (!tabs || tabs.length === 0 || !selectedTab) {
      return null;
    }

    return (
      <ScreenPositionHelper>
        {({ top }) => (
          <div
            className="sw-overflow-y-auto"
            style={{
              height: `calc(100vh - ${top + 20 + LAYOUT_FOOTER_HEIGHT}px)`,
            }}
          >
            <StyledHeader
              className="sw-z-issue-header"
              headerHeight={this.headerNode?.clientHeight ?? 0}
            >
              <div className="sw-p-6 sw-pb-4" ref={(node) => (this.headerNode = node)}>
                <IssueHeader
                  branchLike={fillBranchLike(issue.branch, issue.pullRequest)}
                  issue={issue}
                  onIssueChange={this.props.onIssueChange}
                  ruleDetails={ruleDetails}
                />
                {/* This toggle button is used as tabs, do not replace it with Echoes ToggleButtonGroup */}
                <ToggleButton
                  onChange={this.handleSelectTabs}
                  options={tabs}
                  role="tablist"
                  value={selectedTab.key}
                />
              </div>
            </StyledHeader>
            <div
              aria-labelledby={`tab-${selectedTab.key}`}
              className="sw-flex sw-flex-col sw-px-6"
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
                    <TabSelectorContext.Provider value={this.handleSelectTabs}>
                      {tab.content}
                    </TabSelectorContext.Provider>
                  </div>
                ))}
            </div>
          </div>
        )}
      </ScreenPositionHelper>
    );
  }
}

export default withCurrentUserContext(
  withLocation(withUseGetFixSuggestionsIssues<IssueTabViewerProps>(IssueTabViewer)),
);
