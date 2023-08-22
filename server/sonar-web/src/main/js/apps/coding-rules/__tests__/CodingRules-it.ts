/*
 * SonarQube
 * Copyright (C) 2009-2023 SonarSource SA
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
import { act, fireEvent, screen } from '@testing-library/react';
import selectEvent from 'react-select-event';
import CodingRulesServiceMock, { RULE_TAGS_MOCK } from '../../../api/mocks/CodingRulesServiceMock';
import { RULE_TYPES } from '../../../helpers/constants';
import { parseDate } from '../../../helpers/dates';
import { mockCurrentUser, mockLoggedInUser } from '../../../helpers/testMocks';
import { dateInputEvent, renderAppRoutes } from '../../../helpers/testReactTestingUtils';
import {
  CleanCodeAttribute,
  CleanCodeAttributeCategory,
  SoftwareQuality,
} from '../../../types/clean-code-taxonomy';
import { CurrentUser } from '../../../types/users';
import routes from '../routes';
import { getPageObjects } from '../utils-tests';

const handler: CodingRulesServiceMock = new CodingRulesServiceMock();

afterEach(() => handler.reset());

describe('Rules app list', () => {
  it('renders correctly', async () => {
    const { ui } = getPageObjects();
    renderCodingRulesApp();

    await ui.appLoaded();

    // Renders list
    handler
      .allRulesName()
      .forEach((name) => expect(ui.ruleListItemLink(name).get()).toBeInTheDocument());

    // Render clean code attributes.
    expect(
      ui.ruleCleanCodeAttributeCategory(CleanCodeAttributeCategory.Adaptable).getAll().length
    ).toBeGreaterThan(1);
    expect(ui.ruleSoftwareQuality(SoftwareQuality.Maintainability).getAll().length).toBeGreaterThan(
      1
    );

    // Renders type facets
    RULE_TYPES.map((type) => `issue.type.${type}`).forEach((name) =>
      expect(ui.facetItem(name).get()).toBeInTheDocument()
    );

    // Renders language facets
    ['JavaScript', 'Java', 'C'].forEach((name) =>
      expect(ui.facetItem(name).get()).toBeInTheDocument()
    );

    // Other facets are collapsed
    [
      ui.tagsFacet,
      ui.repositoriesFacet,
      ui.severetiesFacet,
      ui.statusesFacet,
      ui.standardsFacet,
      ui.availableSinceFacet,
      ui.templateFacet,
      ui.qpFacet,
    ].forEach((facet) => {
      expect(facet.get()).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('filtering', () => {
    it('combine facet filters', async () => {
      const { ui, user } = getPageObjects();
      const { pickDate } = dateInputEvent(user);
      renderCodingRulesApp(mockCurrentUser());
      await ui.appLoaded();

      expect(ui.ruleListItem.getAll(ui.rulesList.get())).toHaveLength(11);

      // Filter by language facet
      await act(async () => {
        await user.type(ui.facetSearchInput('search.search_for_languages').get(), 'ja');
        await user.click(ui.facetItem('JavaScript').get());
      });
      expect(ui.ruleListItem.getAll(ui.rulesList.get())).toHaveLength(2);

      // Clear language facet and search box, and filter by python language
      await act(async () => {
        await user.clear(ui.facetSearchInput('search.search_for_languages').get());
        await user.click(ui.facetItem('py').get());
      });
      expect(ui.ruleListItem.getAll(ui.rulesList.get())).toHaveLength(6);

      // Filter by date facet
      await act(async () => {
        await user.click(await ui.availableSinceFacet.find());
        await pickDate(ui.availableSinceDateField.get(), parseDate('Nov 1, 2022'));
      });
      expect(ui.ruleListItem.getAll(ui.rulesList.get())).toHaveLength(1);

      // Clear filters
      await act(async () => {
        await user.click(ui.clearAllFiltersButton.get());
      });
      expect(ui.ruleListItem.getAll(ui.rulesList.get())).toHaveLength(11);

      // Filter by repository
      await act(async () => {
        await user.click(ui.repositoriesFacet.get());
        await user.click(ui.facetItem('Repository 1').get());
      });
      expect(ui.ruleListItem.getAll(ui.rulesList.get())).toHaveLength(2);

      // Search second repository
      await act(async () => {
        await user.type(ui.facetSearchInput('search.search_for_repositories').get(), 'y 2');
        await user.click(ui.facetItem('Repository 2').get());
      });
      expect(ui.ruleListItem.getAll(ui.rulesList.get())).toHaveLength(1);

      // Clear filters
      await act(async () => {
        await user.click(ui.clearAllFiltersButton.get());
      });
      expect(ui.ruleListItem.getAll(ui.rulesList.get())).toHaveLength(11);

      // Filter by quality profile
      await act(async () => {
        await user.click(ui.qpFacet.get());
        await user.click(ui.facetItem('QP Foo Java').get());
      });
      expect(ui.ruleListItem.getAll(ui.rulesList.get())).toHaveLength(1);

      // Filter by tag
      await act(async () => {
        await user.click(ui.facetClear('coding_rules.facet.qprofile').get()); // Clear quality profile facet
        await user.click(ui.tagsFacet.get());
        await user.click(ui.facetItem('awesome').get());
      });
      expect(ui.ruleListItem.getAll(ui.rulesList.get())).toHaveLength(5);

      // Search by tag
      await act(async () => {
        await user.type(ui.facetSearchInput('search.search_for_tags').get(), 'te');
        await user.click(ui.facetItem('cute').get());
      });
      expect(ui.ruleListItem.getAll(ui.rulesList.get())).toHaveLength(1);
    });

    it('filter by standards', async () => {
      const { ui, user } = getPageObjects();
      renderCodingRulesApp(mockCurrentUser());
      await ui.appLoaded();

      expect(ui.ruleListItem.getAll(ui.rulesList.get())).toHaveLength(11);
      await act(async () => {
        await user.click(ui.standardsFacet.get());
        await user.click(ui.facetItem('Buffer Overflow').get());
      });
      expect(ui.ruleListItem.getAll(ui.rulesList.get())).toHaveLength(6);

      await act(async () => {
        await user.click(ui.standardsOwasp2021Top10Facet.get());
        await user.click(ui.facetItem('A2 - Cryptographic Failures').get());
        await user.click(ui.standardsOwasp2021Top10Facet.get()); // Close facet
      });
      expect(ui.ruleListItem.getAll(ui.rulesList.get())).toHaveLength(5);

      await act(async () => {
        await user.click(ui.standardsOwasp2017Top10Facet.get());
        await user.click(ui.facetItem('A3 - Sensitive Data Exposure').get());
      });
      expect(ui.ruleListItem.getAll(ui.rulesList.get())).toHaveLength(4);

      await act(async () => {
        await user.click(ui.standardsCweFacet.get());
        await user.click(ui.facetItem('CWE-102 - Struts: Duplicate Validation Forms').get());
      });
      expect(ui.ruleListItem.getAll(ui.rulesList.get())).toHaveLength(3);

      await act(async () => {
        await user.type(ui.facetSearchInput('search.search_for_cwe').get(), 'Certificate');
        await user.click(
          ui.facetItem('CWE-297 - Improper Validation of Certificate with Host Mismatch').get()
        );
      });
      expect(ui.ruleListItem.getAll(ui.rulesList.get())).toHaveLength(2);

      await act(async () => {
        await user.click(ui.facetClear('issues.facet.standards').get());
      });
      expect(ui.ruleListItem.getAll(ui.rulesList.get())).toHaveLength(11);
    });

    it('filters by search', async () => {
      const { ui, user } = getPageObjects();
      renderCodingRulesApp(mockCurrentUser());
      await ui.appLoaded();

      await act(async () => {
        await user.type(ui.searchInput.get(), 'Python');
      });
      expect(ui.ruleListItem.getAll(ui.rulesList.get())).toHaveLength(4);

      await act(async () => {
        await user.clear(ui.searchInput.get());
        await user.type(ui.searchInput.get(), 'Hot hotspot');
      });
      expect(ui.ruleListItem.getAll(ui.rulesList.get())).toHaveLength(1);
    });
  });

  describe('bulk change', () => {
    it('no quality profile for bulk change based on language search', async () => {
      const { ui, user } = getPageObjects();
      handler.setIsAdmin();
      renderCodingRulesApp(mockLoggedInUser());
      await ui.appLoaded();

      await act(async () => {
        await user.click(ui.facetItem('C').get());
      });
      await user.click(ui.bulkChangeButton.get());
      await user.click(ui.activateIn.get());

      const dialog = ui.bulkChangeDialog(1).get();
      expect(dialog).toBeInTheDocument();

      selectEvent.openMenu(ui.activateInSelect.get());
      expect(ui.noQualityProfiles.get(dialog)).toBeInTheDocument();
    });

    it('should be able to bulk activate quality profile', async () => {
      const { ui, user } = getPageObjects();
      handler.setIsAdmin();
      renderCodingRulesApp(mockLoggedInUser());
      await ui.appLoaded();

      const [selectQPSuccess, selectQPWarning] = handler.allQualityProfile('java');

      const rulesCount = handler.allRulesCount();

      await ui.bulkActivate(rulesCount, selectQPSuccess);

      expect(
        ui.bulkSuccessMessage(selectQPSuccess.name, selectQPSuccess.languageName, rulesCount).get()
      ).toBeInTheDocument();

      await user.click(ui.bulkClose.get());

      // Try bulk change when quality profile has warnning.
      handler.activateWithWarning();

      await ui.bulkActivate(rulesCount, selectQPWarning);
      expect(
        ui
          .bulkWarningMessage(selectQPWarning.name, selectQPWarning.languageName, rulesCount - 1)
          .get()
      ).toBeInTheDocument();
    });

    it('should be able to bulk deactivate quality profile', async () => {
      const { ui } = getPageObjects();
      handler.setIsAdmin();
      renderCodingRulesApp(mockLoggedInUser());
      await ui.appLoaded();

      const [selectQP] = handler.allQualityProfile('java');
      const rulesCount = handler.allRulesCount();

      await ui.bulkDeactivate(rulesCount, selectQP);

      expect(
        ui.bulkSuccessMessage(selectQP.name, selectQP.languageName, rulesCount).get()
      ).toBeInTheDocument();
    });
  });

  it('can activate/deactivate specific rule for quality profile', async () => {
    const { ui, user } = getPageObjects();
    renderCodingRulesApp(mockLoggedInUser());
    await ui.appLoaded();

    await act(async () => {
      await user.click(ui.qpFacet.get());
      await user.click(ui.facetItem('QP Foo Java').get());
    });

    // Only one rule is activated in selected QP
    expect(ui.ruleListItem.getAll(ui.rulesList.get())).toHaveLength(1);

    // Switch to inactive rules
    await act(async () => {
      await user.click(ui.qpInactiveRadio.get(ui.facetItem('QP Foo Java').get()));
    });
    expect(ui.ruleListItem.getAll(ui.rulesList.get())).toHaveLength(1);

    // Activate Rule for qp
    await user.click(ui.activateButton.get());
    await user.click(ui.activateButton.get(ui.activateQPDialog.get()));
    expect(ui.activateButton.query()).not.toBeInTheDocument();
    expect(ui.deactivateButton.get()).toBeInTheDocument();

    // Deactivate activated rule
    await user.click(ui.deactivateButton.get());
    await user.click(ui.yesButton.get());
    expect(ui.deactivateButton.query()).not.toBeInTheDocument();
    expect(ui.activateButton.get()).toBeInTheDocument();
  });

  it('navigates by keyboard', async () => {
    const { user, ui } = getPageObjects();
    renderCodingRulesApp();
    await ui.appLoaded();

    expect(
      ui.ruleListItemLink('Awsome java rule').get(ui.currentListItem.get())
    ).toBeInTheDocument();

    await act(async () => {
      await user.keyboard('{ArrowDown}');
    });
    expect(ui.ruleListItemLink('Hot hotspot').get(ui.currentListItem.get())).toBeInTheDocument();

    await act(async () => {
      await user.keyboard('{ArrowUp}');
    });
    expect(
      ui.ruleListItemLink('Awsome java rule').get(ui.currentListItem.get())
    ).toBeInTheDocument();

    await act(async () => {
      await user.keyboard('{ArrowRight}');
    });
    expect(screen.getByRole('heading', { level: 1, name: 'Awsome java rule' })).toBeInTheDocument();

    await act(async () => {
      await user.keyboard('{ArrowLeft}');
    });
    expect(
      ui.ruleListItemLink('Awsome java rule').get(ui.currentListItem.get())
    ).toBeInTheDocument();
  });
});

describe('Rule app details', () => {
  describe('rendering', () => {
    it('shows rule with default description section and params', async () => {
      const { ui } = getPageObjects();
      renderCodingRulesApp(undefined, 'coding_rules?open=rule1');
      await ui.appLoaded();
      expect(ui.ruleTitle('Awsome java rule').get()).toBeInTheDocument();
      expect(
        ui.ruleCleanCodeAttributeCategory(CleanCodeAttributeCategory.Adaptable).get()
      ).toBeInTheDocument();
      expect(ui.ruleCleanCodeAttribute(CleanCodeAttribute.Clear).get()).toBeInTheDocument();
      expect(ui.ruleSoftwareQuality(SoftwareQuality.Maintainability).get()).toBeInTheDocument();
      expect(document.title).toEqual('page_title.template.with_category.coding_rules.page');
      expect(screen.getByText('Why')).toBeInTheDocument();
      expect(screen.getByText('Because')).toBeInTheDocument();

      // Check params data
      expect(screen.getByText('html description for key 1')).toBeInTheDocument();
      expect(screen.getByText('default value for key 2')).toBeInTheDocument();
    });

    it('shows external rule', async () => {
      const { ui } = getPageObjects();
      renderCodingRulesApp(undefined, 'coding_rules?open=rule6');
      await ui.appLoaded();
      expect(ui.ruleTitle('Bad Python rule').get()).toBeInTheDocument();
      expect(ui.externalDescription('Bad Python rule').get()).toBeInTheDocument();
    });

    it('shows hotspot rule', async () => {
      const { ui, user } = getPageObjects();
      renderCodingRulesApp(undefined, 'coding_rules?open=rule2');
      await ui.appLoaded();
      expect(ui.ruleTitle('Hot hotspot').get()).toBeInTheDocument();
      expect(ui.introTitle.get()).toBeInTheDocument();

      // Shows correct tabs
      [ui.whatRiskTab, ui.assessTab, ui.moreInfoTab].forEach((tab) => {
        expect(tab.get()).toBeInTheDocument();
      });

      await user.click(ui.moreInfoTab.get());
      expect(ui.resourceLink.get()).toBeInTheDocument();
    });

    it('shows rule advanced section', async () => {
      const { ui } = getPageObjects();
      renderCodingRulesApp(undefined, 'coding_rules?open=rule5');
      await ui.appLoaded();
      expect(ui.ruleTitle('Awsome Python rule').get()).toBeInTheDocument();
      expect(ui.introTitle.get()).toBeInTheDocument();
      // Shows correct tabs
      [ui.howToFixTab, ui.moreInfoTab].forEach((tab) => {
        expect(tab.get()).toBeInTheDocument();
      });
    });

    it('shows rule advanced section with context', async () => {
      const { ui, user } = getPageObjects();
      renderCodingRulesApp(undefined, 'coding_rules?open=rule7');
      await ui.appLoaded();
      expect(ui.ruleTitle('Python rule with context').get()).toBeInTheDocument();

      await user.click(ui.howToFixTab.get());

      expect(ui.contextSubtitle('Spring').get()).toBeInTheDocument();
      expect(screen.getByText('This is how to fix for spring')).toBeInTheDocument();

      await user.click(ui.contextRadio('Spring boot').get());
      expect(ui.contextSubtitle('Spring boot').get()).toBeInTheDocument();
      expect(screen.getByText('This is how to fix for spring boot')).toBeInTheDocument();

      await user.click(ui.contextRadio('coding_rules.description_context.other').get());
      expect(ui.otherContextTitle.get()).toBeInTheDocument();
    });

    it('should show CYAC notification for rule advanced section and removes it after user`s visit', async () => {
      const { ui, user } = getPageObjects();
      renderCodingRulesApp(mockLoggedInUser(), 'coding_rules?open=rule10');
      await ui.appLoaded();
      await user.click(ui.moreInfoTab.get());

      expect(ui.caycNotificationButton.get()).toBeInTheDocument();

      // navigate away and come back
      await user.click(ui.howToFixTab.get());
      await user.click(ui.moreInfoTab.get());

      expect(ui.caycNotificationButton.query()).not.toBeInTheDocument();
    });

    it('should show CAYC notification for rule advanced section and removes it when user scrolls to the principles', async () => {
      const { ui, user } = getPageObjects();
      renderCodingRulesApp(mockLoggedInUser(), 'coding_rules?open=rule10');
      await ui.appLoaded();
      await user.click(ui.moreInfoTab.get());
      expect(ui.caycNotificationButton.get()).toBeInTheDocument();

      fireEvent.scroll(screen.getByText('coding_rules.more_info.education_principles.title'));

      // navigate away and come back
      await user.click(ui.howToFixTab.get());
      await user.click(ui.moreInfoTab.get());

      expect(ui.caycNotificationButton.query()).not.toBeInTheDocument();
    });

    it('should not show notification for anonymous users', async () => {
      const { ui, user } = getPageObjects();
      renderCodingRulesApp(mockCurrentUser(), 'coding_rules?open=rule10');

      await ui.appLoaded();
      await user.click(ui.moreInfoTab.get());

      expect(ui.caycNotificationButton.query()).not.toBeInTheDocument();
    });
  });

  it('can activate/change/deactivate rule in quality profile', async () => {
    const { ui, user } = getPageObjects();
    handler.setIsAdmin();
    renderCodingRulesApp(mockLoggedInUser(), 'coding_rules?open=rule1');
    await ui.appLoaded();
    expect(ui.qpLink('QP Foo').get()).toBeInTheDocument();

    // Activate rule in quality profile
    await user.click(ui.activateButton.get());
    await selectEvent.select(ui.qualityProfileSelect.get(), 'QP FooBar');
    await user.type(ui.paramInput('1').get(), 'paramInput');

    await act(() => user.click(ui.activateButton.get(ui.activateQPDialog.get())));
    expect(ui.qpLink('QP FooBar').get()).toBeInTheDocument();

    // Change rule details in quality profile
    await user.click(ui.changeButton('QP FooBar').get());
    await user.type(ui.paramInput('1').get(), 'New');
    await act(() => user.click(ui.saveButton.get(ui.changeQPDialog.get())));
    expect(screen.getByText('paramInputNew')).toBeInTheDocument();

    // activate last java rule
    await user.click(ui.activateButton.get());
    await act(() => user.click(ui.activateButton.get(ui.activateQPDialog.get())));
    expect(ui.qpLink('QP FooBarBaz').get()).toBeInTheDocument();

    // Rule is activated in all quality profiles - show notification in dialog
    await user.click(ui.activateButton.get());
    expect(ui.activaInAllQPs.get()).toBeInTheDocument();
    expect(ui.activateButton.get(ui.activateQPDialog.get())).toBeDisabled();
    await user.click(ui.cancelButton.get());

    // Deactivate rule in quality profile
    await user.click(ui.deactivateInQPButton('QP FooBar').get());
    await act(() => user.click(ui.yesButton.get()));
    expect(ui.qpLink('QP FooBar').query()).not.toBeInTheDocument();
  });

  it('can extend the rule description', async () => {
    const { ui, user } = getPageObjects();
    handler.setIsAdmin();
    renderCodingRulesApp(undefined, 'coding_rules?open=rule5');
    await ui.appLoaded();
    expect(ui.ruleTitle('Awsome Python rule').get()).toBeInTheDocument();

    // Add
    await user.click(ui.extendDescriptionButton.get());
    await user.type(ui.extendDescriptionTextbox.get(), 'TEST DESC');
    await user.click(ui.saveButton.get());
    expect(await screen.findByText('TEST DESC')).toBeInTheDocument();

    // Edit
    await user.click(ui.extendDescriptionButton.get());
    await user.clear(ui.extendDescriptionTextbox.get());
    await user.type(ui.extendDescriptionTextbox.get(), 'NEW DESC');
    await user.click(ui.saveButton.get());
    expect(await screen.findByText('NEW DESC')).toBeInTheDocument();

    // Cancel
    await user.click(ui.extendDescriptionButton.get());
    await user.type(ui.extendDescriptionTextbox.get(), 'Difference');
    await user.click(ui.cancelButton.get());
    expect(await screen.findByText('NEW DESC')).toBeInTheDocument();

    // Remove
    await user.click(ui.extendDescriptionButton.get());
    await user.click(ui.removeButton.get());
    await user.click(ui.removeButton.get(screen.getByRole('dialog')));
    expect(screen.queryByText('NEW DESC')).not.toBeInTheDocument();
  });

  it('can set tags', async () => {
    const { ui, user } = getPageObjects();
    handler.setIsAdmin();
    renderCodingRulesApp(undefined, 'coding_rules?open=rule10');
    await ui.appLoaded();

    await user.click(ui.tagsDropdown.get());
    expect(ui.tagsMenu.get()).toBeInTheDocument();

    RULE_TAGS_MOCK.forEach((tag) => {
      expect(ui.tagCheckbox(tag).get()).toBeInTheDocument();
    });

    // Rule already has this tag
    expect(ui.tagCheckbox(RULE_TAGS_MOCK[0]).get()).toBeChecked();

    // Set tag
    await user.click(ui.tagCheckbox(RULE_TAGS_MOCK[1]).get());
    expect(ui.tagCheckbox(RULE_TAGS_MOCK[1]).get()).toBeChecked();
    await user.click(ui.tagCheckbox(RULE_TAGS_MOCK[1]).get());

    // Search for specific tag
    await user.type(ui.tagSearch.get(), RULE_TAGS_MOCK[2]);
    expect(ui.tagCheckbox(RULE_TAGS_MOCK[2]).get()).toBeInTheDocument();
    expect(ui.tagCheckbox(RULE_TAGS_MOCK[1]).query()).not.toBeInTheDocument();
  });

  describe('custom rule', () => {
    it('can create custom rule', async () => {
      const { ui, user } = getPageObjects();
      handler.setIsAdmin();
      renderCodingRulesApp(mockLoggedInUser());
      await ui.appLoaded();

      await act(async () => {
        await user.click(ui.templateFacet.get());
        await user.click(ui.facetItem('coding_rules.filters.template.is_template').get());
      });
      // Shows only one template rule
      expect(ui.ruleListItem.getAll(ui.rulesList.get())).toHaveLength(1);

      // Show template rule details
      await act(async () => {
        await user.click(ui.ruleListItemLink('Template rule').get());
      });
      expect(ui.ruleTitle('Template rule').get()).toBeInTheDocument();
      expect(ui.customRuleSectionTitle.get()).toBeInTheDocument();

      // Create custom rule
      await user.click(ui.createCustomRuleButton.get());
      await user.type(ui.ruleNameTextbox.get(), 'New Custom Rule');
      expect(ui.keyTextbox.get()).toHaveValue('New_Custom_Rule');
      await user.clear(ui.keyTextbox.get());
      await user.type(ui.keyTextbox.get(), 'new_custom_rule');

      await selectEvent.select(ui.typeSelect.get(), 'issue.type.BUG');
      await selectEvent.select(ui.severitySelect.get(), 'severity.MINOR');
      await selectEvent.select(ui.statusSelect.get(), 'rules.status.BETA');

      await user.type(ui.descriptionTextbox.get(), 'Some description for custom rule');
      await user.type(ui.paramInput('1').get(), 'Default value');

      await act(async () => {
        await user.click(ui.createButton.get());
      });

      // Verify the rule is created
      expect(ui.customRuleItemLink('New Custom Rule').get()).toBeInTheDocument();
    });

    it('can edit custom rule', async () => {
      const { ui, user } = getPageObjects();
      handler.setIsAdmin();
      renderCodingRulesApp(mockLoggedInUser(), 'coding_rules?open=rule9');
      await ui.appLoaded();

      await user.click(ui.editCustomRuleButton.get());

      // Change name and description of custom rule
      await user.clear(ui.ruleNameTextbox.get());
      await user.type(ui.ruleNameTextbox.get(), 'Updated custom rule name');
      await user.type(ui.descriptionTextbox.get(), 'Some description for custom rule');

      await act(async () => {
        await user.click(ui.saveButton.get(ui.updateCustomRuleDialog.get()));
      });

      expect(ui.ruleTitle('Updated custom rule name').get()).toBeInTheDocument();
    });

    it('can delete custom rule', async () => {
      const { ui, user } = getPageObjects();
      handler.setIsAdmin();
      renderCodingRulesApp(mockLoggedInUser(), 'coding_rules?open=rule9');
      await ui.appLoaded();

      await user.click(ui.deleteButton.get());
      await act(async () => {
        await user.click(ui.deleteButton.get(ui.deleteCustomRuleDialog.get()));
      });

      // Shows the list of rules, custom rule should not be included
      expect(ui.ruleListItemLink('Custom Rule based on rule8').query()).not.toBeInTheDocument();
    });

    it('can delete custom rule from template page', async () => {
      const { ui, user } = getPageObjects();
      handler.setIsAdmin();
      renderCodingRulesApp(mockLoggedInUser(), 'coding_rules?open=rule8');
      await ui.appLoaded();

      await user.click(ui.deleteCustomRuleButton('Custom Rule based on rule8').get());
      await user.click(ui.deleteButton.get(ui.deleteCustomRuleDialog.get()));
      expect(ui.customRuleItemLink('Custom Rule based on rule8').query()).not.toBeInTheDocument();
    });

    it('anonymous user cannot modify custom rule', async () => {
      const { ui } = getPageObjects();
      renderCodingRulesApp(undefined, 'coding_rules?open=rule9');
      await ui.appLoaded();

      expect(ui.editCustomRuleButton.query()).not.toBeInTheDocument();
      expect(ui.deleteButton.query()).not.toBeInTheDocument();
    });
  });
});

describe('redirects', () => {
  it('should open with permalink', async () => {
    const { ui } = getPageObjects();
    renderCodingRulesApp(undefined, 'coding_rules?rule_key=rule1');
    await ui.appLoaded();
    expect(ui.ruleListItemLink('Awsome java rule').get()).toBeInTheDocument();
    expect(ui.ruleListItemLink('Hot hotspot').query()).not.toBeInTheDocument();
  });

  it('should handle hash parameters', async () => {
    renderCodingRulesApp(mockLoggedInUser(), 'coding_rules#languages=c,js|types=BUG');
    // 2 languages
    expect(await screen.findByText('x_selected.2')).toBeInTheDocument();
    expect(screen.getAllByTitle('issue.type.BUG')).toHaveLength(2);
    // Only 3 rules shown
    expect(screen.getByText('x_of_y_shown.2.2')).toBeInTheDocument();
  });
});

function renderCodingRulesApp(currentUser?: CurrentUser, navigateTo?: string) {
  renderAppRoutes('coding_rules', routes, {
    navigateTo,
    currentUser,
    languages: {
      js: { key: 'js', name: 'JavaScript' },
      java: { key: 'java', name: 'Java' },
      c: { key: 'c', name: 'C' },
    },
  });
}
