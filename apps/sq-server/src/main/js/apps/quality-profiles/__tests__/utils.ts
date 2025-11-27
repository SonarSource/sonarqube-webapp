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

import { waitFor } from '@testing-library/react';
import { byRole, byText } from '~shared/helpers/testSelector';

export const qualityProfilePageObjects = {
  loading: byRole('status', { name: 'loading' }),
  permissionSection: byRole('region', { name: 'permissions.page' }),
  projectSection: byRole('region', { name: 'projects' }),
  rulesSection: byRole('region', { name: 'rules' }),
  rulesSectionHeader: byRole('heading', { name: 'quality_profile.rules.breakdown' }),
  exportersSection: byRole('region', { name: 'quality_profiles.exporters' }),
  inheritanceSection: byRole('region', { name: 'quality_profiles.profile_inheritance' }),
  grantPermissionButton: byRole('button', {
    name: 'quality_profiles.grant_permissions_to_more_users',
  }),
  dialog: byRole('dialog'),
  alertDialog: byRole('alertdialog'),
  selectField: byRole('combobox'),
  selectUserOrGroup: byRole('combobox', { name: 'quality_profiles.search_description' }),
  twitterCheckbox: byRole('checkbox', { name: 'Twitter Twitter' }),
  benflixCheckbox: byRole('checkbox', { name: 'Benflix Benflix' }),
  addButton: byRole('button', { name: 'add_verb' }),
  removeButton: byRole('button', { name: 'remove' }),
  closeButton: byRole('dialog').byRole('button', { name: 'close' }),
  changeProjectsButton: byRole('button', { name: 'quality_profiles.change_projects' }),
  changeButton: byRole('button', { name: 'change_verb' }),
  withoutFilterButton: byRole('radio', { name: 'quality_gates.projects.without' }),
  changeParentButton: byRole('button', { name: 'quality_profiles.change_parent' }),
  qualityProfileActions: byRole('button', {
    name: /quality_profiles.actions/,
  }),
  qualityProfilesHeader: byRole('heading', { name: 'quality_profiles.page' }),
  deleteQualityProfileButton: byRole('menuitem', { name: 'delete' }),
  activateMoreLink: byRole('link', { name: 'quality_profiles.activate_more' }),
  activateMoreButton: byRole('button', { name: 'quality_profiles.activate_more' }),
  activateMoreRulesLink: byRole('menuitem', { name: 'quality_profiles.activate_more_rules' }),
  backUpLink: byRole('menuitem', { name: 'backup_verb' }),
  compareLink: byRole('menuitem', { name: 'compare' }),
  extendButton: byRole('menuitem', { name: 'extend' }),
  copyButton: byRole('menuitem', { name: 'copy' }),
  renameButton: byRole('menuitem', { name: 'rename' }),
  setAsDefaultButton: byRole('menuitem', { name: 'set_as_default' }),
  newNameInput: byRole('textbox', { name: /quality_profiles.new_name/ }),
  qualityProfilePageLink: byRole('link', { name: 'quality_profiles.back_to_list' }),
  rulesConsistencyRow: byRole('row', { name: /rule.clean_code_attribute_category.CONSISTENT/ }),
  rulesSecurityRow: byRole('row', { name: /rule.clean_code_attribute_category.SECURITY/ }),
  rulesMissingSonarWayWarning: byText('quality_profiles.sonarway_missing_rules_description'),
  rulesMissingSonarWayLink: byRole('link', {
    name: /quality_profiles.sonarway_see_x_missing_rules/,
  }),
  rulesDeprecatedWarning: byText('quality_profiles.deprecated_rules_description'),
  rulesDeprecatedLink: byRole('link', { name: '8' }),

  waitForDataLoaded: async () => {
    await waitFor(
      () => {
        expect(qualityProfilePageObjects.loading.query()).not.toBeInTheDocument();
      },
      { timeout: 10000 },
    );
  },

  checkRuleRow: (name: string, active: number, inactive: number) => {
    expect(
      byRole('row', { name: new RegExp(`${name}.+${active}.+${inactive}`) }).get(),
    ).toBeInTheDocument();
  },
};
