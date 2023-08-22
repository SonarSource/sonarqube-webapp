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
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Profile } from '../../api/quality-profiles';
import { byLabelText, byPlaceholderText, byRole, byText } from '../../helpers/testSelector';
import {
  CleanCodeAttribute,
  CleanCodeAttributeCategory,
  SoftwareQuality,
} from '../../types/clean-code-taxonomy';

const selectors = {
  loading: byLabelText('loading'),

  // List
  rulesList: byRole('list', { name: 'list_of_rules' }),
  ruleListItemLink: (name: string) => byRole('link', { name }),
  ruleListItem: byRole('listitem'),
  currentListItem: byRole('listitem', { current: true }),

  // Filters
  searchInput: byRole('searchbox', { name: 'search.search_for_rules' }),
  clearAllFiltersButton: byRole('button', { name: 'clear_all_filters' }),

  // Facets
  languagesFacet: byRole('button', { name: 'coding_rules.facet.languages' }),
  typeFacet: byRole('button', { name: 'coding_rules.facet.types' }),
  tagsFacet: byRole('button', { name: 'coding_rules.facet.tags' }),
  repositoriesFacet: byRole('button', { name: 'coding_rules.facet.repositories' }),
  severetiesFacet: byRole('button', { name: 'coding_rules.facet.severities' }),
  statusesFacet: byRole('button', { name: 'coding_rules.facet.statuses' }),
  standardsFacet: byRole('button', { name: 'issues.facet.standards' }),
  standardsOwasp2017Top10Facet: byRole('button', { name: 'issues.facet.owaspTop10' }),
  standardsOwasp2021Top10Facet: byRole('button', { name: 'issues.facet.owaspTop10_2021' }),
  standardsCweFacet: byRole('button', { name: 'issues.facet.cwe' }),
  availableSinceFacet: byRole('button', { name: 'coding_rules.facet.available_since' }),
  templateFacet: byRole('button', { name: 'coding_rules.facet.template' }),
  qpFacet: byRole('button', { name: 'coding_rules.facet.qprofile' }),
  facetClear: (name: string) => byRole('button', { name: `clear_x_filter.${name}` }),
  facetSearchInput: (name: string) => byRole('searchbox', { name }),
  facetItem: (name: string) => byRole('checkbox', { name }),
  availableSinceDateField: byPlaceholderText('date'),
  qpActiveRadio: byRole('radio', { name: `active` }),
  qpInactiveRadio: byRole('radio', { name: `inactive` }),

  // Bulk change
  bulkChangeButton: byRole('button', { name: 'bulk_change' }),
  activateIn: byRole('link', { name: 'coding_rules.activate_in…' }),
  deactivateIn: byRole('link', { name: 'coding_rules.deactivate_in…' }),
  bulkChangeDialog: (count: number, activate = true) =>
    byRole('dialog', {
      name: `coding_rules.${
        activate ? 'ac' : 'deac'
      }tivate_in_quality_profile (${count} coding_rules._rules)`,
    }),
  activateInSelect: byRole('combobox', { name: 'coding_rules.activate_in' }),
  deactivateInSelect: byRole('combobox', { name: 'coding_rules.deactivate_in' }),
  noQualityProfiles: byText('coding_rules.bulk_change.no_quality_profile'),
  bulkApply: byRole('button', { name: 'apply' }),
  bulkSuccessMessage: (qpName: string, langName: string, count: number) =>
    byText(`coding_rules.bulk_change.success.${qpName}.${langName}.${count}`),
  bulkWarningMessage: (qpName: string, langName: string, count: number) =>
    byText(`coding_rules.bulk_change.warning.${qpName}.${langName}.${count}.1`),
  bulkClose: byRole('button', { name: 'close' }),

  // Rule details
  ruleTitle: (name: string) => byRole('heading', { level: 1, name }),
  externalDescription: (ruleName: string) => byText(`issue.external_issue_description.${ruleName}`),
  introTitle: byText(/Introduction to this rule/),
  rootCause: byText('Root cause'),
  howToFix: byText('This is how to fix'),
  resourceLink: byRole('link', { name: 'Awsome Reading' }),
  contextRadio: (name: string) => byRole('radio', { name }),
  contextSubtitle: (name: string) => byText(`coding_rules.description_context.subtitle.${name}`),
  otherContextTitle: byText('coding_rules.context.others.title'),
  caycNotificationButton: byRole('button', { name: 'coding_rules.more_info.scroll_message' }),
  extendDescriptionButton: byRole('button', { name: 'coding_rules.extend_description' }),
  extendDescriptionTextbox: byRole('textbox', { name: 'coding_rules.extend_description' }),
  saveButton: byRole('button', { name: 'save' }),
  cancelButton: byRole('button', { name: 'cancel' }),
  removeButton: byRole('button', { name: 'remove' }),
  ruleCleanCodeAttributeCategory: (category: CleanCodeAttributeCategory) =>
    byText(`rule.clean_code_attribute_category.${category}.title_short`),
  ruleCleanCodeAttribute: (attribute: CleanCodeAttribute) =>
    byText(new RegExp(`rule\\.clean_code_attribute\\.${attribute}$`)),
  ruleSoftwareQuality: (quality: SoftwareQuality) => byText(`issue.software_quality.${quality}`),

  // Rule tags
  tagsDropdown: byRole('button', { name: /tags_list_x/ }),
  tagsMenu: byRole('group', { name: 'select_tags' }),
  tagCheckbox: (tag: string) => byRole('checkbox', { name: tag }),
  tagSearch: byRole('searchbox', { name: 'search.search_for_tags' }),

  // Rule tabs
  whyIssueTab: byRole('tab', {
    name: 'coding_rules.description_section.title.root_cause',
  }),
  whatRiskTab: byRole('tab', {
    name: 'coding_rules.description_section.title.root_cause.SECURITY_HOTSPOT',
  }),
  assessTab: byRole('tab', {
    name: 'coding_rules.description_section.title.assess_the_problem',
  }),
  moreInfoTab: byRole('tab', {
    name: 'coding_rules.description_section.title.more_info',
  }),
  howToFixTab: byRole('tab', {
    name: 'coding_rules.description_section.title.how_to_fix',
  }),

  // Rule Quality Profiles
  qpLink: (name: string) => byRole('link', { name }),
  activateButton: byRole('button', { name: 'coding_rules.activate' }),
  deactivateButton: byRole('button', { name: 'coding_rules.deactivate' }),
  severitySelect: byRole('combobox', { name: 'severity' }),
  qualityProfileSelect: byRole('combobox', { name: 'coding_rules.quality_profile' }),
  activateQPDialog: byRole('dialog', { name: 'coding_rules.activate_in_quality_profile' }),
  changeButton: (profile: string) =>
    byRole('button', { name: `coding_rules.change_details_x.${profile}` }),
  changeQPDialog: byRole('dialog', { name: 'coding_rules.change_details' }),
  deactivateInQPButton: (profile: string) =>
    byRole('button', { name: `coding_rules.deactivate_in_quality_profile_x.${profile}` }),
  activaInAllQPs: byText('coding_rules.active_in_all_profiles'),
  yesButton: byRole('button', { name: 'yes' }),
  paramInput: (param: string) => byRole('textbox', { name: param }),

  // Custom rules
  customRuleSectionTitle: byRole('heading', { level: 2, name: 'coding_rules.custom_rules' }),
  createCustomRuleButton: byRole('button', { name: 'coding_rules.create' }),
  editCustomRuleButton: byRole('button', { name: 'edit' }),
  deleteCustomRuleButton: (rule: string) =>
    byRole('button', { name: `coding_rules.delete_rule_x.${rule}` }),
  customRuleItemLink: (name: string) => byRole('link', { name }),

  // Custom rule form
  createCustomRuleDialog: byRole('dialog', { name: 'coding_rules.create_custom_rule' }),
  updateCustomRuleDialog: byRole('dialog', { name: 'coding_rules.update_custom_rule' }),
  deleteCustomRuleDialog: byRole('dialog', { name: 'coding_rules.delete_rule' }),
  ruleNameTextbox: byRole('textbox', { name: 'name field_required' }),
  keyTextbox: byRole('textbox', { name: 'key field_required' }),
  typeSelect: byRole('combobox', { name: 'type' }),
  statusSelect: byRole('combobox', { name: 'coding_rules.filters.status' }),
  descriptionTextbox: byRole('textbox', { name: 'description field_required' }),
  createButton: byRole('button', { name: 'create' }),
  deleteButton: byRole('button', { name: 'delete' }),
};

export function getPageObjects() {
  const user = userEvent.setup();

  const ui = {
    ...selectors,
    async appLoaded() {
      await waitFor(() => {
        expect(selectors.loading.query()).not.toBeInTheDocument();
      });
    },

    async bulkActivate(rulesCount: number, profile: Profile) {
      await user.click(ui.bulkChangeButton.get());
      await user.click(ui.activateIn.get());

      const dialog = ui.bulkChangeDialog(rulesCount).get();
      expect(dialog).toBeInTheDocument();

      await user.click(ui.activateInSelect.get());
      await user.click(byText(`${profile.name} - ${profile.languageName}`).get(dialog));

      await user.click(ui.bulkApply.get());
    },

    async bulkDeactivate(rulesCount: number, profile: Profile) {
      await user.click(ui.bulkChangeButton.get());
      await user.click(ui.deactivateIn.get());

      const dialog = ui.bulkChangeDialog(rulesCount, false).get();
      expect(dialog).toBeInTheDocument();

      await user.click(ui.deactivateInSelect.get());
      await user.click(byText(`${profile.name} - ${profile.languageName}`).get(dialog));

      await user.click(ui.bulkApply.get());
    },
  };

  return {
    ui,
    user,
  };
}
