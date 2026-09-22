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

import { act, renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';
import { RuleDescriptionSections } from '~shared/types/rules';
import { mockIssue, mockRuleDetails } from '../../../../helpers/testMocks';
import { IssueComment } from '../../../../types/types';
import { useEducationPrinciplesVisibility } from '../useEducationPrinciplesVisibility';
import { TabKeys, useIssueTabs } from '../useIssueTabs';

jest.mock('../useEducationPrinciplesVisibility');

const mockUseEducationPrinciplesVisibility =
  useEducationPrinciplesVisibility as jest.MockedFunction<typeof useEducationPrinciplesVisibility>;

function wrapper(initialEntries: string[] = ['/?']) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <IntlProvider locale="en" messages={{}}>
        <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
      </IntlProvider>
    );
  };
}

describe('useIssueTabs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseEducationPrinciplesVisibility.mockImplementation(() => {
      // No-op implementation for mocking
    });
  });

  describe('tab structure', () => {
    it('should include Code tab when codeTabContent is provided', () => {
      const { result } = renderHook(
        () =>
          useIssueTabs({
            codeTabContent: <div>code</div>,
            issue: mockIssue(),
            ruleDetails: mockRuleDetails(),
            displayEducationalPrinciplesNotification: false,
            location: { pathname: '/', search: '', hash: '', state: undefined, key: 'default' },
          }),
        { wrapper: wrapper() },
      );

      const codeTab = result.current.tabs.find((t) => t.key === TabKeys.Code);
      expect(codeTab).toBeDefined();
      expect(codeTab?.label).toBeDefined();
    });

    it('should not include Code tab when codeTabContent is undefined', () => {
      const { result } = renderHook(
        () =>
          useIssueTabs({
            issue: mockIssue(),
            ruleDetails: mockRuleDetails(),
            displayEducationalPrinciplesNotification: false,
            location: { pathname: '/', search: '', hash: '', state: undefined, key: 'default' },
          }),
        { wrapper: wrapper() },
      );

      const codeTab = result.current.tabs.find((t) => t.key === TabKeys.Code);
      expect(codeTab).toBeUndefined();
    });

    it('should include CodeFix tab when aiSuggestionAvailable is true', () => {
      const { result } = renderHook(
        () =>
          useIssueTabs({
            aiSuggestionAvailable: true,
            suggestionTabContent: <div>fix</div>,
            issue: mockIssue(),
            ruleDetails: mockRuleDetails(),
            displayEducationalPrinciplesNotification: false,
            location: { pathname: '/', search: '', hash: '', state: undefined, key: 'default' },
          }),
        { wrapper: wrapper() },
      );

      const codeFixTab = result.current.tabs.find((t) => t.key === TabKeys.CodeFix);
      expect(codeFixTab).toBeDefined();
    });

    it('should not include CodeFix tab when aiSuggestionAvailable is false', () => {
      const { result } = renderHook(
        () =>
          useIssueTabs({
            aiSuggestionAvailable: false,
            issue: mockIssue(),
            ruleDetails: mockRuleDetails(),
            displayEducationalPrinciplesNotification: false,
            location: { pathname: '/', search: '', hash: '', state: undefined, key: 'default' },
          }),
        { wrapper: wrapper() },
      );

      const codeFixTab = result.current.tabs.find((t) => t.key === TabKeys.CodeFix);
      expect(codeFixTab).toBeUndefined();
    });

    it('should include Activity tab with comment counter', () => {
      const comments = [{ key: '1' }, { key: '2' }] as IssueComment[];
      const issue = mockIssue(false, { comments });
      const { result } = renderHook(
        () =>
          useIssueTabs({
            activityTabContent: <div>activity</div>,
            issue,
            ruleDetails: mockRuleDetails(),
            displayEducationalPrinciplesNotification: false,
            location: { pathname: '/', search: '', hash: '', state: undefined, key: 'default' },
          }),
        { wrapper: wrapper() },
      );

      const activityTab = result.current.tabs.find((t) => t.key === TabKeys.Activity);
      expect(activityTab).toBeDefined();
      expect(activityTab?.counter).toBe(2);
    });

    it('should always include WhyIsThisAnIssue tab', () => {
      const { result } = renderHook(
        () =>
          useIssueTabs({
            issue: mockIssue(),
            ruleDetails: mockRuleDetails(),
            displayEducationalPrinciplesNotification: false,
            location: { pathname: '/', search: '', hash: '', state: undefined, key: 'default' },
          }),
        { wrapper: wrapper() },
      );

      const whyTab = result.current.tabs.find((t) => t.key === TabKeys.WhyIsThisAnIssue);
      expect(whyTab).toBeDefined();
    });

    it('should filter out tabs with no content', () => {
      const ruleDetails = mockRuleDetails({
        descriptionSections: [],
      });
      const { result } = renderHook(
        () =>
          useIssueTabs({
            issue: mockIssue(),
            ruleDetails,
            displayEducationalPrinciplesNotification: false,
            location: { pathname: '/', search: '', hash: '', state: undefined, key: 'default' },
          }),
        { wrapper: wrapper() },
      );

      result.current.tabs.forEach((tab) => {
        expect(tab.content).toBeDefined();
      });
    });

    it('should use different label for WhyIsThisAnIssue tab for security hotspots', () => {
      const ruleDetails = mockRuleDetails({
        type: 'SECURITY_HOTSPOT',
      });

      const { result } = renderHook(
        () =>
          useIssueTabs({
            issue: mockIssue(),
            ruleDetails,
            displayEducationalPrinciplesNotification: false,
            location: { pathname: '/', search: '', hash: '', state: undefined, key: 'default' },
          }),
        { wrapper: wrapper() },
      );

      const whyTab = result.current.tabs.find((t) => t.key === TabKeys.WhyIsThisAnIssue);
      expect(whyTab?.label).toBe(
        'coding_rules.description_section.title.root_cause.SECURITY_HOTSPOT',
      );
    });
  });

  describe('initial tab selection', () => {
    it('should select the first tab by default', () => {
      const { result } = renderHook(
        () =>
          useIssueTabs({
            codeTabContent: <div>code</div>,
            issue: mockIssue(),
            ruleDetails: mockRuleDetails(),
            displayEducationalPrinciplesNotification: false,
            location: { pathname: '/', search: '', hash: '', state: undefined, key: 'default' },
          }),
        { wrapper: wrapper() },
      );

      expect(result.current.selectedTab.key).toBe(result.current.tabs[0].key);
    });

    it('should select WhyIsThisAnIssue tab when why query param is present', () => {
      const { result } = renderHook(
        () =>
          useIssueTabs({
            issue: mockIssue(),
            ruleDetails: mockRuleDetails(),
            displayEducationalPrinciplesNotification: false,
            location: {
              pathname: '/',
              search: '?why=1',
              hash: '',
              state: undefined,
              key: 'default',
            },
          }),
        { wrapper: wrapper(['/?why=1']) },
      );

      expect(result.current.selectedTab.key).toBe(TabKeys.WhyIsThisAnIssue);
    });

    it('should select first tab if why query param is present but WhyIsThisAnIssue tab does not exist', () => {
      const ruleDetails = mockRuleDetails({
        descriptionSections: [],
      });
      const { result } = renderHook(
        () =>
          useIssueTabs({
            issue: mockIssue(),
            ruleDetails,
            activityTabContent: <div>activity</div>,
            displayEducationalPrinciplesNotification: false,
            location: {
              pathname: '/',
              search: '?why=1',
              hash: '',
              state: undefined,
              key: 'default',
            },
          }),
        { wrapper: wrapper(['/?why=1']) },
      );

      expect(result.current.tabs.length).toBeGreaterThan(0);
      expect(result.current.selectedTab.key).toBe(result.current.tabs[0].key);
    });
  });

  describe('tab reset on identity change', () => {
    it('should reset to first tab when rule details change', () => {
      const { result, rerender } = renderHook((props) => useIssueTabs(props), {
        initialProps: {
          codeTabContent: <div>code</div>,
          issue: mockIssue(),
          ruleDetails: mockRuleDetails(),
          displayEducationalPrinciplesNotification: false,
          location: { pathname: '/', search: '', hash: '', state: undefined, key: 'default' },
        },
        wrapper: wrapper(),
      });

      const initialTabKey = result.current.selectedTab.key;

      // Select a different tab
      act(() => {
        result.current.handleSelectTabs(TabKeys.Activity);
      });

      // Change rule details
      const newRuleDetails = mockRuleDetails({ key: 'different-rule' });
      rerender({
        codeTabContent: <div>code</div>,
        issue: mockIssue(),
        ruleDetails: newRuleDetails,
        displayEducationalPrinciplesNotification: false,
        location: { pathname: '/', search: '', hash: '', state: undefined, key: 'default' },
      });

      expect(result.current.selectedTab.key).toBe(initialTabKey);
    });

    it('should reset to first tab when issue key changes', () => {
      const { result, rerender } = renderHook((props) => useIssueTabs(props), {
        initialProps: {
          codeTabContent: <div>code</div>,
          issue: mockIssue(false, { key: 'issue-1' }),
          ruleDetails: mockRuleDetails(),
          displayEducationalPrinciplesNotification: false,
          location: { pathname: '/', search: '', hash: '', state: undefined, key: 'default' },
        },
        wrapper: wrapper(),
      });

      const initialTabKey = result.current.selectedTab.key;

      // Select a different tab
      act(() => {
        result.current.handleSelectTabs(TabKeys.Activity);
      });

      // Change issue key
      rerender({
        codeTabContent: <div>code</div>,
        issue: mockIssue(false, { key: 'issue-2' }),
        ruleDetails: mockRuleDetails(),
        displayEducationalPrinciplesNotification: false,
        location: { pathname: '/', search: '', hash: '', state: undefined, key: 'default' },
      });

      expect(result.current.selectedTab.key).toBe(initialTabKey);
    });

    it('should reset to first tab when selectedFlowIndex changes', () => {
      const { result, rerender } = renderHook((props) => useIssueTabs(props), {
        initialProps: {
          codeTabContent: <div>code</div>,
          issue: mockIssue(),
          ruleDetails: mockRuleDetails(),
          selectedFlowIndex: 0,
          displayEducationalPrinciplesNotification: false,
          location: { pathname: '/', search: '', hash: '', state: undefined, key: 'default' },
        },
        wrapper: wrapper(),
      });

      const initialTabKey = result.current.selectedTab.key;

      // Select a different tab
      act(() => {
        result.current.handleSelectTabs(TabKeys.Activity);
      });

      // Change flow index
      rerender({
        codeTabContent: <div>code</div>,
        issue: mockIssue(),
        ruleDetails: mockRuleDetails(),
        selectedFlowIndex: 1,
        displayEducationalPrinciplesNotification: false,
        location: { pathname: '/', search: '', hash: '', state: undefined, key: 'default' },
      });

      expect(result.current.selectedTab.key).toBe(initialTabKey);
    });

    it('should reset to first tab when selectedLocationIndex changes', () => {
      const { result, rerender } = renderHook((props) => useIssueTabs(props), {
        initialProps: {
          codeTabContent: <div>code</div>,
          issue: mockIssue(),
          ruleDetails: mockRuleDetails(),
          selectedLocationIndex: 0,
          displayEducationalPrinciplesNotification: false,
          location: { pathname: '/', search: '', hash: '', state: undefined, key: 'default' },
        },
        wrapper: wrapper(),
      });

      const initialTabKey = result.current.selectedTab.key;

      // Select a different tab
      act(() => {
        result.current.handleSelectTabs(TabKeys.Activity);
      });

      // Change location index
      rerender({
        codeTabContent: <div>code</div>,
        issue: mockIssue(),
        ruleDetails: mockRuleDetails(),
        selectedLocationIndex: 1,
        displayEducationalPrinciplesNotification: false,
        location: { pathname: '/', search: '', hash: '', state: undefined, key: 'default' },
      });

      expect(result.current.selectedTab.key).toBe(initialTabKey);
    });

    it('should not reset to first tab when selectedLocationIndex changes between undefined and -1', () => {
      // Reused across renders: `ruleDetails` and `issue` identity/key must stay stable so only
      // selectedLocationIndex differs, isolating the undefined/-1 normalization being tested.
      const issue = mockIssue();
      const ruleDetails = mockRuleDetails();

      const { result, rerender } = renderHook((props) => useIssueTabs(props), {
        initialProps: {
          codeTabContent: <div>code</div>,
          activityTabContent: <div>activity</div>,
          issue,
          ruleDetails,
          selectedLocationIndex: undefined as number | undefined,
          displayEducationalPrinciplesNotification: false,
          location: { pathname: '/', search: '', hash: '', state: undefined, key: 'default' },
        },
        wrapper: wrapper(),
      });

      // Select a tab other than the first one
      act(() => {
        result.current.handleSelectTabs(TabKeys.Activity);
      });
      expect(result.current.selectedTab.key).toBe(TabKeys.Activity);

      // Re-opening the already-open issue sets selectedLocationIndex to -1 while it was
      // previously undefined — this must not be treated as an identity change.
      rerender({
        codeTabContent: <div>code</div>,
        activityTabContent: <div>activity</div>,
        issue,
        ruleDetails,
        selectedLocationIndex: -1,
        displayEducationalPrinciplesNotification: false,
        location: { pathname: '/', search: '', hash: '', state: undefined, key: 'default' },
      });

      expect(result.current.selectedTab.key).toBe(TabKeys.Activity);
    });
  });

  describe('extended description handling', () => {
    it('should include extended description in MoreInfo tab if Resources section exists', () => {
      const ruleDetails = mockRuleDetails({
        descriptionSections: [
          {
            key: RuleDescriptionSections.Resources,
            content: 'Original resources',
          },
        ],
      });

      const { result } = renderHook(
        () =>
          useIssueTabs({
            extendedDescription: '<p>Extended content</p>',
            issue: mockIssue(),
            ruleDetails,
            displayEducationalPrinciplesNotification: false,
            location: { pathname: '/', search: '', hash: '', state: undefined, key: 'default' },
          }),
        { wrapper: wrapper() },
      );

      const moreInfoTab = result.current.tabs.find((t) => t.key === TabKeys.MoreInfo);
      expect(moreInfoTab?.content).toBeDefined();
    });

    it('should create MoreInfo tab with extended description if Resources section does not exist', () => {
      const ruleDetails = mockRuleDetails({
        descriptionSections: [],
      });

      const { result } = renderHook(
        () =>
          useIssueTabs({
            extendedDescription: '<p>Extended content</p>',
            issue: mockIssue(),
            ruleDetails,
            displayEducationalPrinciplesNotification: false,
            location: { pathname: '/', search: '', hash: '', state: undefined, key: 'default' },
          }),
        { wrapper: wrapper() },
      );

      const moreInfoTab = result.current.tabs.find((t) => t.key === TabKeys.MoreInfo);
      expect(moreInfoTab).toBeDefined();
    });
  });

  describe('education principles notification', () => {
    it('should include notification counter when displayEducationalPrinciplesNotification is true', () => {
      const ruleDetails = mockRuleDetails({
        descriptionSections: [
          {
            key: RuleDescriptionSections.Resources,
            content: 'resources',
          },
        ],
      });

      const { result } = renderHook(
        () =>
          useIssueTabs({
            issue: mockIssue(),
            ruleDetails,
            displayEducationalPrinciplesNotification: true,
            location: { pathname: '/', search: '', hash: '', state: undefined, key: 'default' },
          }),
        { wrapper: wrapper() },
      );

      const moreInfoTab = result.current.tabs.find((t) => t.key === TabKeys.MoreInfo);
      expect(moreInfoTab?.counter).toBe(1);
    });

    it('should not include notification counter when displayEducationalPrinciplesNotification is false', () => {
      const ruleDetails = mockRuleDetails({
        descriptionSections: [
          {
            key: RuleDescriptionSections.Resources,
            content: 'resources',
          },
        ],
      });

      const { result } = renderHook(
        () =>
          useIssueTabs({
            issue: mockIssue(),
            ruleDetails,
            displayEducationalPrinciplesNotification: false,
            location: { pathname: '/', search: '', hash: '', state: undefined, key: 'default' },
          }),
        { wrapper: wrapper() },
      );

      const moreInfoTab = result.current.tabs.find((t) => t.key === TabKeys.MoreInfo);
      expect(moreInfoTab?.counter).toBeUndefined();
    });
  });
});
