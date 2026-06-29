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

import { screen, waitFor } from '@testing-library/react';
import { byRole } from '~shared/helpers/testSelector';
import { SoftwareImpactSeverity, SoftwareQuality } from '~shared/types/clean-code-taxonomy';
import CodingRulesServiceMock from '~sq-server-commons/api/mocks/CodingRulesServiceMock';
import { LanguagesServiceMock } from '~sq-server-commons/api/mocks/LanguagesServiceMock';
import { ModeServiceMock } from '~sq-server-commons/api/mocks/ModeServiceMock';
import SettingsServiceMock from '~sq-server-commons/api/mocks/SettingsServiceMock';

import {
  IMPACT_SEVERITIES,
  ISSUE_TYPES,
  SEVERITIES,
  SOFTWARE_QUALITIES,
} from '~sq-server-commons/helpers/constants';

import { mockCurrentUser, mockLoggedInUser } from '~sq-server-commons/helpers/testMocks';
import { Feature } from '~sq-server-commons/types/features';
import { Mode } from '~sq-server-commons/types/mode';
import { getPageObjects, renderCodingRulesApp } from '../utils-tests';

const rulesHandler = new CodingRulesServiceMock();
const modeHandler = new ModeServiceMock();
const settingsHandler = new SettingsServiceMock();
const languagesHandler = new LanguagesServiceMock();

afterEach(() => {
  rulesHandler.reset();
  modeHandler.reset();
  settingsHandler.reset();
  languagesHandler.reset();
});

async function expectRuleListLength(
  ui: ReturnType<typeof getPageObjects>['ui'],
  expectedLength: number,
) {
  await waitFor(() => {
    expect(ui.getAllRuleListItems()).toHaveLength(expectedLength);
  });
}

async function pasteInInput(
  user: ReturnType<typeof getPageObjects>['user'],
  input: HTMLElement,
  value: string,
) {
  await user.click(input);
  await user.paste(value);
}

describe('Rules app list', () => {
  it('renders correctly', async () => {
    const { ui } = getPageObjects();
    renderCodingRulesApp();

    await ui.listLoaded();

    // Renders list
    rulesHandler.allRulesName().forEach((name) => {
      expect(ui.ruleListItemLink(name).get()).toBeInTheDocument();
    });

    // Render clean code attributes.
    expect(ui.ruleSoftwareQuality(SoftwareQuality.Maintainability).getAll().length).toBeGreaterThan(
      1,
    );

    // Renders clean code categories and software qualities facets
    SOFTWARE_QUALITIES.map((quality) => `software_quality.${quality}`).forEach((name) => {
      expect(ui.facetItem(new RegExp(name)).get()).toBeInTheDocument();
    });

    IMPACT_SEVERITIES.map((severity) => `severity_impact.${severity}`).forEach((name) => {
      expect(ui.facetItem(new RegExp(name)).get()).toBeInTheDocument();
    });

    expect(
      ui.facetItem(/coding_rules.facet.security_hotspots.show_only/).get(),
    ).toBeInTheDocument();

    // Renders language facets
    ['JavaScript 2', 'Java 2', 'C 1'].forEach((name) => {
      expect(ui.facetItem(name).get()).toBeInTheDocument();
    });

    // Other facets are collapsed
    [
      ui.tagsFacet,
      ui.cleanCodeCategoriesFacet,
      ui.repositoriesFacet,
      ui.statusesFacet,
      ui.standardsFacet,
      ui.availableSinceFacet,
      ui.templateFacet,
      ui.qpFacet,
    ].forEach((facet) => {
      expect(facet.get()).toHaveAttribute('aria-expanded', 'false');
    });

    // Standard facets are hidden
    [ui.standardSeveritiesFacet, ui.typeFacet].forEach((facet) => {
      expect(facet.query()).not.toBeInTheDocument();
    });
  });

  it('renders correctly in Standard mode', async () => {
    const { ui } = getPageObjects();
    modeHandler.setMode(Mode.Standard);
    renderCodingRulesApp();

    await ui.listLoaded();

    // Renders list
    rulesHandler.allRulesName().forEach((name) => {
      expect(ui.ruleListItemLink(name).get()).toBeInTheDocument();
    });

    // Renders clean code categories and software qualities facets
    ISSUE_TYPES.map((type) => `issue.type.${type}`).forEach((name) => {
      expect(ui.facetItem(new RegExp(name)).get()).toBeInTheDocument();
    });

    SEVERITIES.map((severity) => `severity.${severity}`).forEach((name) => {
      expect(ui.facetItem(new RegExp(name)).get()).toBeInTheDocument();
    });

    // Renders language facets
    ['JavaScript 2', 'Java 2', 'C 1'].forEach((name) => {
      expect(ui.facetItem(name).get()).toBeInTheDocument();
    });

    // Other facets are collapsed
    [
      ui.tagsFacet,
      ui.repositoriesFacet,
      ui.statusesFacet,
      ui.standardsFacet,
      ui.availableSinceFacet,
      ui.templateFacet,
      ui.qpFacet,
    ].forEach((facet) => {
      expect(facet.get()).toHaveAttribute('aria-expanded', 'false');
    });

    // MQR facets are hidden
    [
      ui.severetiesFacet,
      ui.securityHotspotFacet,
      ui.softwareQualitiesFacet,
      ui.cleanCodeCategoriesFacet,
    ].forEach((facet) => {
      expect(facet.query()).not.toBeInTheDocument();
    });
  });

  describe('filtering', () => {
    it('should filter by language, date, repository, quality profile and tags', async () => {
      const { ui, user } = getPageObjects();
      renderCodingRulesApp(mockCurrentUser());
      await ui.listLoaded();

      expect(ui.getAllRuleListItems()).toHaveLength(11);

      // --- Combine facet filters: language + date ---
      await user.type(ui.facetSearchInput('search.search_for_languages').get(), 'ja');
      await user.click(ui.facetItem(/Ja\svaScript/).get());
      expect(ui.getAllRuleListItems()).toHaveLength(2);
      await user.clear(ui.facetSearchInput('search.search_for_languages').get());
      await user.click(ui.facetItem(/Python/).get());
      expect(ui.getAllRuleListItems()).toHaveLength(6);

      await user.click(await ui.availableSinceFacet.find());
      await user.click(screen.getByPlaceholderText('date'));
      const monthSelector = ui.dateInputMonthSelect.byRole('combobox').get();
      await user.click(monthSelector);
      await user.click(monthSelector);
      await user.click(byRole('option', { name: 'Nov' }).get());
      const yearSelector = ui.dateInputYearSelect.byRole('combobox').get();
      await user.click(yearSelector);
      await user.click(yearSelector);
      await user.click(byRole('option', { name: '2022' }).get());
      await user.click(await screen.findByText('1', { selector: 'button' }));
      expect(ui.getAllRuleListItems()).toHaveLength(1);

      await user.click(ui.clearAllFiltersButton.get());
      expect(ui.getAllRuleListItems()).toHaveLength(11);

      // --- Filter by repository ---
      await user.click(ui.repositoriesFacet.get());
      await user.click(ui.facetItem(/Repository 1/).get());
      expect(ui.getAllRuleListItems()).toHaveLength(2);
      await user.type(ui.facetSearchInput('search.search_for_repositories').get(), 'y 2');
      await user.click(ui.facetItem(/Repositor\sy 2/).get());
      expect(ui.getAllRuleListItems()).toHaveLength(1);

      await user.click(ui.clearAllFiltersButton.get());
      expect(ui.getAllRuleListItems()).toHaveLength(11);

      // --- Filter by quality profile, tag, search by tag ---
      await user.click(ui.qpFacet.get());
      await user.click(ui.facetItem('QP Foo Java').get());
      expect(ui.getAllRuleListItems()).toHaveLength(1);
      expect(ui.prioritizedRuleFacet.query()).not.toBeInTheDocument();

      await user.click(ui.facetClear('clear-coding_rules.facet.qprofile').get());
      await user.click(ui.tagsFacet.get());
      await user.click(ui.facetItem(/awesome\s/).get());
      expect(ui.getAllRuleListItems()).toHaveLength(5);
      await user.type(ui.facetSearchInput('search.search_for_tags').get(), 'te');
      expect(ui.facetItem(/cu\ste/).get()).toBeInTheDocument();
      await user.click(ui.facetItem(/cu\ste/).get());
      expect(ui.getAllRuleListItems()).toHaveLength(1);
    });

    it('should filter by clean code category, software quality and severity', async () => {
      const { ui, user } = getPageObjects();
      expect.hasAssertions();
      renderCodingRulesApp(mockCurrentUser());
      await ui.listLoaded();

      await expectRuleListLength(ui, 11);

      await user.click(ui.cleanCodeCategoriesFacet.get());

      await user.click(
        await ui.facetItem('issue.clean_code_attribute_category.INTENTIONAL').find(),
      );

      await expectRuleListLength(ui, 9);
      await user.click(ui.facetItem('software_quality.MAINTAINABILITY').get());
      await expectRuleListLength(ui, 8);
      await user.click(ui.facetItem(/severity_impact.HIGH/).get());
      await expectRuleListLength(ui, 4);

      await user.click(ui.clearAllFiltersButton.get());
      await expectRuleListLength(ui, 11);
    });

    it('should filter by standards', async () => {
      const { ui, user } = getPageObjects();
      expect.hasAssertions();
      renderCodingRulesApp(mockCurrentUser());
      await ui.listLoaded();

      await expectRuleListLength(ui, 11);

      await user.click(ui.standardsFacet.get());
      await user.click(ui.facetItem(/Buffer Overflow/).get());
      await expectRuleListLength(ui, 6);
      await user.click(ui.standardsOwasp2021Top10Facet.get());
      await user.click(ui.facetItem(/A2 - Cryptographic Failures/).get());
      await user.click(ui.standardsOwasp2021Top10Facet.get());
      await expectRuleListLength(ui, 5);
      await user.click(ui.standardsOwasp2017Top10Facet.get());
      await user.click(ui.facetItem(/A3 - Sensitive Data Exposure/).get());
      await expectRuleListLength(ui, 4);
      await user.click(ui.standardsCweFacet.get());
      await user.click(ui.facetItem(/CWE-102 - Struts: Duplicate Validation Forms/).get());
      await expectRuleListLength(ui, 3);
      await pasteInInput(user, ui.facetSearchInput('search.search_for_cwe').get(), 'Certificate');

      await user.click(
        await ui
          .facetItem(/CWE-297 - Improper Validation of Certificate with Host Mismatch/)
          .find(),
      );

      await expectRuleListLength(ui, 2);
      await user.clear(ui.facetSearchInput('search.search_for_cwe').get());
      await pasteInInput(user, ui.facetSearchInput('search.search_for_cwe').get(), 'CWE-14');

      await user.click(
        await ui.facetItem(/CWE-14 - Compiler Removal of Code to Clear Buffers/).find(),
      );

      await expectRuleListLength(ui, 0);
      await user.click(ui.facetClear('clear-issues.facet.standards').get());
      await expectRuleListLength(ui, 11);
    });

    it('should search rules', async () => {
      const { ui, user } = getPageObjects();
      expect.hasAssertions();
      renderCodingRulesApp(mockCurrentUser());
      await ui.listLoaded();

      await expectRuleListLength(ui, 11);

      await pasteInInput(user, ui.searchInput.get(), 'Python');
      await expectRuleListLength(ui, 4);
      await user.clear(ui.searchInput.get());
      await expectRuleListLength(ui, 11);
      await pasteInInput(user, ui.searchInput.get(), 'Hot hotspot');
      await expectRuleListLength(ui, 1);
    });

    it('filter by type and severity in standard mode', async () => {
      const { ui, user } = getPageObjects();
      expect.hasAssertions();
      modeHandler.setMode(Mode.Standard);
      renderCodingRulesApp(mockCurrentUser());
      await ui.listLoaded();

      await expectRuleListLength(ui, 11);
      await user.click(await ui.facetItem(/issue.type.BUG/).find());

      await expectRuleListLength(ui, 7);

      await user.click(ui.facetItem(/severity.MAJOR/).get());
      await expectRuleListLength(ui, 5);
    });

    it('filter by quality profile and prioritizedRule', async () => {
      const { ui, user } = getPageObjects();
      renderCodingRulesApp(mockCurrentUser(), undefined, [Feature.PrioritizedRules]);
      await ui.listLoaded();

      expect(ui.getAllRuleListItems()).toHaveLength(11);

      // Verify severities of reliability rules
      expect(
        ui
          .ruleSoftwareQualitySeverityButton(
            SoftwareQuality.Reliability,
            SoftwareImpactSeverity.Low,
          )
          .get(),
      ).toBeInTheDocument();

      expect(
        ui
          .ruleSoftwareQualitySeverityButton(
            SoftwareQuality.Reliability,
            SoftwareImpactSeverity.Medium,
          )
          .query(),
      ).not.toBeInTheDocument();

      expect(ui.prioritizedRuleFacet.get()).toHaveAttribute('aria-disabled', 'true');

      // Filter by quality profile
      await user.click(ui.qpFacet.get());
      await user.click(ui.facetItem('QP Bar Python').get());
      expect(ui.getAllRuleListItems()).toHaveLength(4);

      // Show customized severities of rules with filter by QP
      expect(
        ui
          .ruleSoftwareQualitySeverityButton(
            SoftwareQuality.Reliability,
            SoftwareImpactSeverity.Low,
          )
          .query(),
      ).not.toBeInTheDocument();

      expect(
        ui
          .ruleSoftwareQualitySeverityButton(
            SoftwareQuality.Reliability,
            SoftwareImpactSeverity.Medium,
          )
          .get(),
      ).toBeInTheDocument();

      // Filter by prioritized rule
      expect(ui.prioritizedRuleFacet.get()).not.toHaveAttribute('aria-disabled', 'true');
      await user.click(ui.prioritizedRuleFacet.get());
      await user.click(ui.facetItem('coding_rules.filters.prioritizedRule.true').get());
      expect(ui.getAllRuleListItems()).toHaveLength(1);

      // Filter by non-prioritized rule
      await user.click(ui.facetItem('coding_rules.filters.prioritizedRule.false').get());
      expect(ui.getAllRuleListItems()).toHaveLength(3);

      await user.click(ui.facetClear('clear-coding_rules.facet.prioritizedRule').get());
      expect(ui.getAllRuleListItems()).toHaveLength(4);
    });

    it('filter by quality profile and severity', async () => {
      const { ui, user } = getPageObjects();
      rulesHandler.setIsAdmin();
      renderCodingRulesApp(mockLoggedInUser());
      await ui.listLoaded();

      expect(ui.getAllRuleListItems()).toHaveLength(11);

      // Filter by severity
      await user.click(ui.facetItem(/severity_impact.HIGH/).get());
      expect(ui.getAllRuleListItems()).toHaveLength(4);

      // Filter by quality profile
      await user.click(ui.qpFacet.get());
      await user.click(ui.facetItem('QP Bar Python').get());
      expect(ui.getAllRuleListItems()).toHaveLength(1);
      expect(ui.facetItem(/severity_impact.MEDIUM/).get()).toHaveTextContent('4');
      expect(ui.facetItem(/severity_impact.LOW/).get()).toHaveTextContent('0');

      // Filter by 'active' severity
      await user.click(ui.facetItem(/severity_impact.MEDIUM/).get());
      expect(ui.getAllRuleListItems()).toHaveLength(4);
      await user.click(ui.changeButton('QP Bar').getAt(0));
      await user.click(ui.newSeveritySelect(SoftwareQuality.Maintainability).get());

      await user.click(
        byRole('option', {
          name: /LOW/,
        }).get(),
      );

      await user.click(ui.saveButton.get());

      expect(ui.facetItem(/severity_impact.MEDIUM/).get()).toHaveTextContent('3');
      expect(ui.facetItem(/severity_impact.LOW/).get()).toHaveTextContent('1');
    });
  });
});
