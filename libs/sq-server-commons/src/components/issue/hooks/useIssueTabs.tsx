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

import { cloneDeep, groupBy } from 'lodash';
import { ReactNode, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { Location } from 'react-router-dom';
import { isHunterAgentRuleEngine } from '~shared/helpers/issues';
import { RuleDescriptionSections, RuleDetails } from '~shared/types/rules';
import { type Issue } from '../../../types/types';
import MoreInfoRuleDescription from '../../rules/MoreInfoRuleDescription';
import RuleDescription from '../../rules/RuleDescription';
import { useEducationPrinciplesVisibility } from './useEducationPrinciplesVisibility';

export enum TabKeys {
  Code = 'code',
  WhyIsThisAnIssue = 'why',
  HowToFixIt = 'how_to_fix',
  AssessTheIssue = 'assess_the_problem',
  CodeFix = 'code_fix',
  Activity = 'activity',
  MoreInfo = 'more_info',
}

export interface Tab {
  content: ReactNode;
  counter?: number;
  key: TabKeys;
  label: string;
  value: TabKeys;
}

interface UseIssueTabsParams {
  activityTabContent?: ReactNode;
  aiSuggestionAvailable?: boolean;
  codeTabContent?: ReactNode;
  displayEducationalPrinciplesNotification: boolean;
  extendedDescription?: string;
  issue: Issue;
  location: Location;
  ruleDescriptionContextKey?: string;
  ruleDetails: RuleDetails;
  selectedFlowIndex?: number;
  selectedLocationIndex?: number;
  suggestionTabContent?: ReactNode;
}

export function useIssueTabs({
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
}: Readonly<UseIssueTabsParams>) {
  const { formatMessage } = useIntl();
  const educationPrinciplesRef = useRef<HTMLDivElement>(null);

  // As we might tamper with the description later on, we clone to avoid any side effect.
  // This is the only expensive part of building the tabs, so it's the only part worth memoizing.
  const descriptionSectionsByKey = useMemo(() => {
    const byKey = cloneDeep(groupBy(ruleDetails.descriptionSections, (section) => section.key));

    if (extendedDescription) {
      if (byKey[RuleDescriptionSections.Resources]?.length > 0) {
        // We add the extended description (htmlNote) in the first context, in case there are contexts
        // Extended description will get reworked in future
        byKey[RuleDescriptionSections.Resources][0].content += '<br/>' + extendedDescription;
      } else {
        byKey[RuleDescriptionSections.Resources] = [
          {
            key: RuleDescriptionSections.Resources,
            content: extendedDescription,
          },
        ];
      }
    }

    return byKey;
  }, [ruleDetails, extendedDescription]);

  const tabs = (() => {
    const { educationPrinciples, lang: ruleLanguage, type: ruleType } = ruleDetails;

    const isHunterAgent = isHunterAgentRuleEngine(issue.externalRuleEngine);

    const computedTabs: Tab[] = [
      {
        value: TabKeys.WhyIsThisAnIssue,
        key: TabKeys.WhyIsThisAnIssue,
        label:
          ruleType === 'SECURITY_HOTSPOT'
            ? formatMessage({
                id: 'coding_rules.description_section.title.root_cause.SECURITY_HOTSPOT',
              })
            : formatMessage({ id: 'coding_rules.description_section.title.root_cause' }),
        content: (descriptionSectionsByKey[RuleDescriptionSections.Default] ||
          descriptionSectionsByKey[RuleDescriptionSections.RootCause]) && (
          <RuleDescription
            defaultContextKey={ruleDescriptionContextKey}
            isHunterAgent={isHunterAgent}
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
        label: formatMessage({
          id: `coding_rules.description_section.title.${TabKeys.AssessTheIssue}`,
        }),
        content: descriptionSectionsByKey[RuleDescriptionSections.AssessTheProblem] && (
          <RuleDescription
            isHunterAgent={isHunterAgent}
            language={ruleLanguage}
            sections={descriptionSectionsByKey[RuleDescriptionSections.AssessTheProblem]}
          />
        ),
      },
      {
        value: TabKeys.HowToFixIt,
        key: TabKeys.HowToFixIt,
        label: formatMessage({
          id: `coding_rules.description_section.title.${TabKeys.HowToFixIt}`,
        }),
        content: descriptionSectionsByKey[RuleDescriptionSections.HowToFix] && (
          <RuleDescription
            defaultContextKey={ruleDescriptionContextKey}
            isHunterAgent={isHunterAgent}
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
              label: formatMessage({
                id: `coding_rules.description_section.title.${TabKeys.CodeFix}`,
              }),
              content: suggestionTabContent,
            },
          ]
        : []),
      {
        value: TabKeys.Activity,
        key: TabKeys.Activity,
        label: formatMessage({
          id: `coding_rules.description_section.title.${TabKeys.Activity}`,
        }),
        content: activityTabContent,
        counter: issue?.comments?.length,
      },
      {
        value: TabKeys.MoreInfo,
        key: TabKeys.MoreInfo,
        label: formatMessage({
          id: `coding_rules.description_section.title.${TabKeys.MoreInfo}`,
        }),
        content: ((educationPrinciples && educationPrinciples.length > 0) ||
          descriptionSectionsByKey[RuleDescriptionSections.Resources]) && (
          <MoreInfoRuleDescription
            displayEducationalPrinciplesNotification={displayEducationalPrinciplesNotification}
            educationPrinciples={educationPrinciples}
            educationPrinciplesRef={educationPrinciplesRef}
            isHunterAgent={isHunterAgent}
            language={ruleLanguage}
            sections={descriptionSectionsByKey[RuleDescriptionSections.Resources]}
          />
        ),
        counter: displayEducationalPrinciplesNotification ? 1 : undefined,
      },
    ];

    if (codeTabContent !== undefined) {
      computedTabs.unshift({
        value: TabKeys.Code,
        key: TabKeys.Code,
        label: formatMessage({ id: `issue.tabs.${TabKeys.Code}` }),
        content: codeTabContent,
      });
    }

    return computedTabs.filter((tab) => Boolean(tab.content));
  })();

  const [selectedTabKey, setSelectedTabKey] = useState<TabKeys | undefined>(() => {
    const query = new URLSearchParams(location?.search);
    const initialTab = query.has('why')
      ? (tabs.find((tab) => tab.key === TabKeys.WhyIsThisAnIssue) ?? tabs[0])
      : tabs[0];

    return initialTab?.key;
  });

  const [prevIdentity, setPrevIdentity] = useState({
    ruleDetails,
    issueKey: issue.key,
    selectedFlowIndex,
    selectedLocationIndex,
  });

  const identityChanged =
    prevIdentity.ruleDetails !== ruleDetails ||
    (!!prevIdentity.issueKey && !!issue.key && prevIdentity.issueKey !== issue.key) ||
    prevIdentity.selectedFlowIndex !== selectedFlowIndex ||
    // `undefined` and `-1` both mean "no location selected" (IssuesApp sets -1 when re-opening
    // the already-open issue) — treat them as equal, same as the previous class component.
    (prevIdentity.selectedLocationIndex ?? -1) !== (selectedLocationIndex ?? -1);

  if (identityChanged) {
    setPrevIdentity({ ruleDetails, issueKey: issue.key, selectedFlowIndex, selectedLocationIndex });
    setSelectedTabKey(tabs[0]?.key);
  }

  const selectedTab = tabs.find((tab) => tab.key === selectedTabKey) ?? tabs[0];

  const handleSelectTabs = (currentTabKey: TabKeys) => {
    setSelectedTabKey(currentTabKey);
  };

  useEducationPrinciplesVisibility({
    displayEducationalPrinciplesNotification,
    educationPrinciplesRef,
    isMoreInfoSelected: selectedTab?.key === TabKeys.MoreInfo,
  });

  return { handleSelectTabs, selectedTab, tabs };
}
