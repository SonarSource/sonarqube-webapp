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

import classNames from 'classnames';
import { cloneDeep, debounce, groupBy, isEqual } from 'lodash';
import * as React from 'react';
import { Location } from 'react-router-dom';
import { useDismissNotice, useIsNoticeDismissed } from '~adapters/helpers/notices';
import { useCurrentUser } from '~adapters/helpers/users';
import { RuleDescriptionSections, RuleDetails } from '~shared/types/rules';
import { ToggleButton, getTabId, getTabPanelId } from '../../design-system';
import { translate } from '../../helpers/l10n';
import { NoticeType } from '../../types/users';
import withLocation from '../hoc/withLocation';
import MoreInfoRuleDescription from './MoreInfoRuleDescription';
import RuleDescription from './RuleDescription';

interface RuleTabViewerProps {
  isEducationPrinciplesDismissed: boolean;
  isLoggedIn: boolean;
  location: Location;
  onDismissEducationPrinciples?: () => void;
  ruleDetails: RuleDetails;
}

interface State {
  displayEducationalPrinciplesNotification?: boolean;
  educationalPrinciplesNotificationHasBeenDismissed?: boolean;
  selectedTab?: Tab;
  tabs: Tab[];
}

interface Tab {
  content: React.ReactNode;
  counter?: number;
  label: string;
  value: TabKeys;
}

export enum TabKeys {
  Code = 'code',
  WhyIsThisAnIssue = 'why',
  HowToFixIt = 'how_to_fix',
  AssessTheIssue = 'assess_the_problem',
  Activity = 'activity',
  MoreInfo = 'more_info',
}

const DEBOUNCE_FOR_SCROLL = 250;

class RuleTabViewer extends React.PureComponent<RuleTabViewerProps, State> {
  state: State = {
    tabs: [],
    educationalPrinciplesNotificationHasBeenDismissed: false,
  };

  educationPrinciplesRef: React.RefObject<HTMLDivElement | null>;

  constructor(props: RuleTabViewerProps) {
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
        selectedTab: tabs.find((tab) => tab.value === TabKeys.WhyIsThisAnIssue) ?? tabs[0],
      });
    }
  }

  componentDidUpdate(prevProps: RuleTabViewerProps, prevState: State) {
    const { ruleDetails, isLoggedIn, isEducationPrinciplesDismissed } = this.props;

    const { selectedTab } = this.state;

    if (
      !isEqual(prevProps.ruleDetails, ruleDetails) ||
      prevProps.isLoggedIn !== isLoggedIn ||
      prevProps.isEducationPrinciplesDismissed !== isEducationPrinciplesDismissed
    ) {
      this.setState((pState) =>
        this.computeState(pState, prevProps.ruleDetails.key !== ruleDetails.key),
      );
    }

    // When the user navigates away from the MoreInfo tab after having scrolled to see the principles,
    // hide the notification locally (the backend was already persisted via the scroll handler)
    if (
      prevState.selectedTab?.value === TabKeys.MoreInfo &&
      selectedTab?.value !== TabKeys.MoreInfo &&
      prevState.educationalPrinciplesNotificationHasBeenDismissed
    ) {
      this.setState({ displayEducationalPrinciplesNotification: false });
    }
  }

  componentWillUnmount() {
    this.detachScrollEvent();
  }

  computeState = (prevState: State, resetSelectedTab = false) => {
    const { ruleDetails, isLoggedIn, isEducationPrinciplesDismissed } = this.props;

    const displayEducationalPrinciplesNotification =
      !!ruleDetails.educationPrinciples &&
      ruleDetails.educationPrinciples.length > 0 &&
      isLoggedIn &&
      !isEducationPrinciplesDismissed;

    const tabs = this.computeTabs(displayEducationalPrinciplesNotification);

    return {
      tabs,
      selectedTab: resetSelectedTab || !prevState.selectedTab ? tabs[0] : prevState.selectedTab,
      displayEducationalPrinciplesNotification,
      educationalPrinciplesNotificationHasBeenDismissed:
        prevState.educationalPrinciplesNotificationHasBeenDismissed ?? false,
    };
  };

  computeTabs = (displayEducationalPrinciplesNotification: boolean) => {
    const {
      ruleDetails: { descriptionSections, educationPrinciples, lang: ruleLanguage, type: ruleType },
    } = this.props;

    // As we might tamper with the description later on, we clone to avoid any side effect
    const descriptionSectionsByKey = cloneDeep(
      groupBy(descriptionSections, (section) => section.key),
    );

    const tabs: Tab[] = [
      {
        content: (descriptionSectionsByKey[RuleDescriptionSections.Default] ||
          descriptionSectionsByKey[RuleDescriptionSections.RootCause]) && (
          <RuleDescription
            language={ruleLanguage}
            sections={(
              descriptionSectionsByKey[RuleDescriptionSections.Default] ??
              descriptionSectionsByKey[RuleDescriptionSections.RootCause]
            ).concat(descriptionSectionsByKey[RuleDescriptionSections.Introduction] ?? [])}
          />
        ),
        value: TabKeys.WhyIsThisAnIssue,
        label:
          ruleType === 'SECURITY_HOTSPOT'
            ? translate('coding_rules.description_section.title.root_cause.SECURITY_HOTSPOT')
            : translate('coding_rules.description_section.title.root_cause'),
      },
      {
        content: descriptionSectionsByKey[RuleDescriptionSections.AssessTheProblem] && (
          <RuleDescription
            language={ruleLanguage}
            sections={descriptionSectionsByKey[RuleDescriptionSections.AssessTheProblem]}
          />
        ),
        value: TabKeys.AssessTheIssue,
        label: translate('coding_rules.description_section.title', TabKeys.AssessTheIssue),
      },
      {
        content: descriptionSectionsByKey[RuleDescriptionSections.HowToFix] && (
          <RuleDescription
            language={ruleLanguage}
            sections={descriptionSectionsByKey[RuleDescriptionSections.HowToFix]}
          />
        ),
        value: TabKeys.HowToFixIt,
        label: translate('coding_rules.description_section.title', TabKeys.HowToFixIt),
      },
      {
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
        value: TabKeys.MoreInfo,
        label: translate('coding_rules.description_section.title', TabKeys.MoreInfo),
        counter: displayEducationalPrinciplesNotification ? 1 : undefined,
      },
    ];

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
    const { onDismissEducationPrinciples } = this.props;

    if (this.educationPrinciplesRef.current) {
      const rect = this.educationPrinciplesRef.current.getBoundingClientRect();
      const isVisible = rect.top <= (window.innerHeight || document.documentElement.clientHeight);

      if (
        isVisible &&
        displayEducationalPrinciplesNotification &&
        !educationalPrinciplesNotificationHasBeenDismissed
      ) {
        if (onDismissEducationPrinciples) {
          onDismissEducationPrinciples();
        }
        this.detachScrollEvent();
        this.setState({
          educationalPrinciplesNotificationHasBeenDismissed: true,
        });
      }
    }
  };

  handleSelectTabs = (currentTabKey: TabKeys) => {
    this.setState(({ tabs }) => ({
      selectedTab: tabs.find((tab) => tab.value === currentTabKey) ?? tabs[0],
    }));
  };

  render() {
    const { tabs, selectedTab } = this.state;

    if (!tabs || tabs.length === 0 || !selectedTab) {
      return null;
    }

    return (
      <>
        <div className="sw-mt-4">
          {/* This toggle button is used as tabs, do not replace it with Echoes ToggleButtonGroup */}
          <ToggleButton
            onChange={this.handleSelectTabs}
            options={tabs}
            role="tablist"
            value={selectedTab.value}
          />
        </div>

        <div
          aria-labelledby={getTabId(selectedTab.value)}
          className="sw-flex sw-flex-col"
          id={getTabPanelId(selectedTab.value)}
          role="tabpanel"
        >
          {
            // Preserve tabs state by always rendering all of them. Only hide them when not selected
            tabs.map((tab) => (
              <div
                className={classNames({
                  'sw-hidden': tab.value !== selectedTab.value,
                })}
                key={tab.value}
              >
                {tab.content}
              </div>
            ))
          }
        </div>
      </>
    );
  }
}

interface RuleTabViewerContainerProps extends Omit<
  RuleTabViewerProps,
  'isEducationPrinciplesDismissed' | 'isLoggedIn' | 'onDismissEducationPrinciples'
> {}

function RuleTabViewerContainer(props: Readonly<RuleTabViewerContainerProps>) {
  const isDismissed = useIsNoticeDismissed(NoticeType.EDUCATION_PRINCIPLES);
  const { isLoggedIn } = useCurrentUser();
  const { dismissNotice } = useDismissNotice();

  const handleDismiss = async () => {
    await dismissNotice(NoticeType.EDUCATION_PRINCIPLES);
  };

  return (
    <RuleTabViewer
      {...props}
      isEducationPrinciplesDismissed={isDismissed}
      isLoggedIn={isLoggedIn}
      onDismissEducationPrinciples={handleDismiss}
    />
  );
}

export default withLocation(RuleTabViewerContainer);
