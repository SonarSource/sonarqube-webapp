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
import { byRole } from '~shared/helpers/testSelector';
import { SoftwareQuality } from '~shared/types/clean-code-taxonomy';
import CodingRulesServiceMock from '~sq-server-commons/api/mocks/CodingRulesServiceMock';
import { QP_2, RULE_10, RULE_7, RULE_9 } from '~sq-server-commons/api/mocks/data/ids';
import { LanguagesServiceMock } from '~sq-server-commons/api/mocks/LanguagesServiceMock';
import { ModeServiceMock } from '~sq-server-commons/api/mocks/ModeServiceMock';
import SettingsServiceMock from '~sq-server-commons/api/mocks/SettingsServiceMock';
import { mockLoggedInUser } from '~sq-server-commons/helpers/testMocks';
import { Feature } from '~sq-server-commons/types/features';
import { Mode } from '~sq-server-commons/types/mode';
import { SettingsKey } from '~sq-server-commons/types/settings';
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

describe('Rules app list', () => {
  describe('bulk change', () => {
    it('should handle bulk activate, deactivate, and no QP for language filter', async () => {
      const { ui, user } = getPageObjects();
      rulesHandler.setIsAdmin();
      renderCodingRulesApp(mockLoggedInUser());
      await ui.listLoaded();

      // --- No QP for C language filter ---
      await user.click(ui.facetItem('C 1').get());
      await user.click(ui.bulkChangeButton.get());
      await user.click(ui.activateIn.get());
      const dialog = ui.bulkChangeDialog(1);
      expect(dialog.get()).toBeInTheDocument();
      await user.click(ui.activateInSelect.get());
      expect(ui.noQualityProfiles.get(dialog.get())).toBeInTheDocument();
      await user.keyboard('{Escape}');
      await user.click(ui.clearAllFiltersButton.get());

      // --- Bulk activate with success + warning ---
      const [selectQPSuccess, selectQPWarning] = rulesHandler.allQualityProfile('java');
      const rulesCount = rulesHandler.allRulesCount();
      await ui.bulkActivate(rulesCount, selectQPSuccess);

      expect(
        ui.bulkSuccessMessage(selectQPSuccess.name, selectQPSuccess.languageName, rulesCount).get(),
      ).toBeInTheDocument();

      await user.click(ui.bulkClose.get());

      rulesHandler.activateWithWarning();
      await ui.bulkActivate(rulesCount, selectQPWarning);

      expect(
        ui
          .bulkWarningMessage(selectQPWarning.name, selectQPWarning.languageName, rulesCount - 1)
          .get(),
      ).toBeInTheDocument();

      await user.click(ui.bulkClose.get());

      // --- Bulk deactivate ---
      const [selectQP] = rulesHandler.allQualityProfile('java');
      await ui.bulkDeactivate(rulesCount, selectQP);

      expect(
        ui.bulkSuccessMessage(selectQP.name, selectQP.languageName, rulesCount).get(),
      ).toBeInTheDocument();
    });
  });

  describe('old severity', () => {
    beforeEach(() => {
      modeHandler.setMode(Mode.Standard);
    });

    it('can activate/change/deactivate specific rule for quality profile', async () => {
      const { ui, user } = getPageObjects();
      rulesHandler.setIsAdmin();
      renderCodingRulesApp(mockLoggedInUser(), undefined, [Feature.PrioritizedRules]);
      await ui.listLoaded();

      await user.click(ui.qpFacet.get());
      await user.click(ui.facetItem('QP Bar Python').get());

      // Only 4 rules are activated in selected QP
      expect(ui.getAllRuleListItems()).toHaveLength(4);

      // Switch to inactive rules
      await user.click(ui.qpInactiveRadio.get(ui.facetItem(/QP Bar Python/).get()));
      expect(ui.getAllRuleListItems()).toHaveLength(2);
      expect(ui.activateButton.getAll()).toHaveLength(2);
      expect(ui.changeButton(QP_2).query()).not.toBeInTheDocument();

      // Activate Rule for qp
      await user.click(ui.activateButton.getAll()[0]);

      expect(ui.oldSeveritySelect.get(ui.activateQPDialog.get())).toHaveValue(
        'coding_rules.custom_severity.severity_with_recommended.severity.MAJOR',
      );

      expect(ui.prioritizedSwitch.get(ui.activateQPDialog.get())).not.toBeChecked();
      await user.click(ui.oldSeveritySelect.get());
      await user.click(byRole('option', { name: 'severity.MINOR' }).get());
      expect(ui.notRecommendedSeverity.get()).toBeInTheDocument();
      expect(ui.notRecommendedSeverity.get()).toHaveTextContent('severity.MAJOR');

      await user.click(ui.prioritizedSwitch.get(ui.activateQPDialog.get()));
      await user.click(ui.activateButton.get(ui.activateQPDialog.get()));

      await waitFor(() => {
        expect(ui.activateButton.getAll()).toHaveLength(1);
      });

      expect(ui.changeButton('QP Bar').get()).toBeInTheDocument();
      expect(ui.deactivateButton.getAll()).toHaveLength(1);

      // Change Rule for qp
      await user.click(ui.changeButton('QP Bar').get());
      expect(ui.oldSeveritySelect.get(ui.changeQPDialog.get())).toHaveValue('severity.MINOR');
      expect(ui.notRecommendedSeverity.get()).toBeInTheDocument();
      expect(ui.notRecommendedSeverity.get()).toHaveTextContent('severity.MAJOR');
      expect(ui.prioritizedSwitch.get(ui.changeQPDialog.get())).toBeChecked();
      await user.click(ui.oldSeveritySelect.get());
      await user.click(byRole('option', { name: 'severity.BLOCKER' }).get());
      await user.click(ui.prioritizedSwitch.get(ui.changeQPDialog.get()));
      expect(ui.notRecommendedSeverity.get()).toBeInTheDocument();
      expect(ui.notRecommendedSeverity.get()).toHaveTextContent('severity.MAJOR');
      await user.click(ui.saveButton.get(ui.changeQPDialog.get()));

      // Check that new severity is saved
      await user.click(ui.changeButton('QP Bar').get());
      expect(ui.oldSeveritySelect.get(ui.changeQPDialog.get())).toHaveValue('severity.BLOCKER');
      expect(ui.prioritizedSwitch.get(ui.changeQPDialog.get())).not.toBeChecked();
      expect(ui.notRecommendedSeverity.get()).toBeInTheDocument();
      expect(ui.notRecommendedSeverity.get()).toHaveTextContent('severity.MAJOR');
      await user.click(ui.cancelButton.get(ui.changeQPDialog.get()));

      // Deactivate activated rule
      await user.click(ui.deactivateButton.get());
      await user.click(ui.yesButton.get());
      expect(ui.deactivateButton.query()).not.toBeInTheDocument();
      expect(ui.activateButton.getAll()).toHaveLength(2);
    });

    it('can revert to parent definition and should not override when no changes', async () => {
      const { ui, user } = getPageObjects();
      settingsHandler.set(SettingsKey.QPAdminCanDisableInheritedRules, 'false');
      rulesHandler.setIsAdmin();
      renderCodingRulesApp(mockLoggedInUser(), undefined, [Feature.PrioritizedRules]);
      await ui.listLoaded();

      await user.click(ui.qpFacet.get());
      await user.click(ui.facetItem('QP Bar Python').get());

      // Only 4 rules are activated in selected QP
      expect(ui.getAllRuleListItems()).toHaveLength(4);

      // 3 rules have deactivate button and 1 rule has revert to parent definition button
      expect(ui.deactivateButton.getAll()).toHaveLength(3);
      expect(ui.revertToParentDefinitionButton().get()).toBeInTheDocument();

      // --- Revert to parent definition for RULE_10 ---
      await user.type(ui.searchInput.get(), RULE_10);
      expect(ui.getAllRuleListItems()).toHaveLength(1);
      expect(ui.revertToParentDefinitionButton().get()).toBeInTheDocument();
      expect(ui.changeButton('QP Bar').get()).toBeInTheDocument();

      await user.click(ui.changeButton('QP Bar').get());
      expect(ui.oldSeveritySelect.get(ui.changeQPDialog.get())).toHaveValue('severity.MAJOR');
      expect(ui.notRecommendedSeverity.get()).toBeInTheDocument();
      expect(ui.notRecommendedSeverity.get()).toHaveTextContent('severity.MINOR');
      expect(ui.prioritizedSwitch.get(ui.changeQPDialog.get())).toBeChecked();
      await user.click(ui.cancelButton.get(ui.changeQPDialog.get()));

      await user.click(ui.revertToParentDefinitionButton().get());
      await user.click(ui.yesButton.get());

      await waitFor(() => {
        expect(ui.revertToParentDefinitionButton().query()).not.toBeInTheDocument();
      });

      expect(ui.getAllRuleListItems()).toHaveLength(1);
      expect(ui.deactivateButton.get()).toBeInTheDocument();
      expect(ui.deactivateButton.get()).toBeDisabled();
      expect(ui.changeButton('QP Bar').get()).toBeInTheDocument();

      await user.click(ui.changeButton('QP Bar').get());

      expect(ui.oldSeveritySelect.get(ui.changeQPDialog.get())).toHaveValue(
        'coding_rules.custom_severity.severity_with_recommended.severity.MINOR',
      );

      expect(ui.notRecommendedSeverity.query()).not.toBeInTheDocument();
      expect(ui.prioritizedSwitch.get(ui.changeQPDialog.get())).not.toBeChecked();
      await user.click(ui.cancelButton.get(ui.changeQPDialog.get()));

      // --- No override when saving without changes (RULE_9) ---
      await user.clear(ui.searchInput.get());
      await user.type(ui.searchInput.get(), RULE_9);

      expect(ui.getAllRuleListItems()).toHaveLength(1);
      expect(ui.deactivateButton.get()).toBeInTheDocument();
      expect(ui.deactivateButton.get()).toBeDisabled();
      expect(ui.changeButton('QP Bar').get()).toBeInTheDocument();

      await user.click(ui.changeButton('QP Bar').get());
      expect(ui.oldSeveritySelect.get(ui.changeQPDialog.get())).toHaveValue('severity.MAJOR');
      expect(ui.notRecommendedSeverity.get()).toBeInTheDocument();
      expect(ui.notRecommendedSeverity.get()).toHaveTextContent('severity.MINOR');
      expect(ui.prioritizedSwitch.get(ui.changeQPDialog.get())).not.toBeChecked();
      await user.click(ui.saveButton.get(ui.changeQPDialog.get()));

      expect(ui.revertToParentDefinitionButton().query()).not.toBeInTheDocument();
    });
  });

  describe('new severity', () => {
    it('can activate/change specific rule with multiple impacts for quality profile', async () => {
      const { ui, user } = getPageObjects();
      rulesHandler.setIsAdmin();
      renderCodingRulesApp(mockLoggedInUser(), undefined, []);
      await ui.facetsLoaded();

      await user.click(ui.qpFacet.get());
      await user.click(ui.facetItem('QP Bar Python').get());
      await user.click(ui.qpInactiveRadio.get(ui.facetItem(/QP Bar Python/).get()));

      // Activate Rule for qp
      await user.click(ui.activateButton.getAll()[1]);

      expect(ui.newSeveritySelect(SoftwareQuality.Maintainability).get()).toHaveValue(
        'coding_rules.custom_severity.severity_with_recommended.severity_impact.MEDIUM',
      );

      expect(ui.newSeveritySelect(SoftwareQuality.Security).get()).toHaveValue(
        'coding_rules.custom_severity.severity_with_recommended.severity_impact.LOW',
      );

      expect(ui.newSeveritySelect(SoftwareQuality.Reliability).get()).toBeDisabled();
      await user.click(ui.newSeveritySelect(SoftwareQuality.Maintainability).get());
      await user.click(byRole('option', { name: 'severity_impact.LOW' }).get());
      await user.click(ui.newSeveritySelect(SoftwareQuality.Security).get());
      await user.click(byRole('option', { name: 'severity_impact.MEDIUM' }).get());
      expect(ui.notRecommendedSeverity.getAll()).toHaveLength(2);
      expect(ui.notRecommendedSeverity.getAt(0)).toHaveTextContent('severity_impact.LOW');
      expect(ui.notRecommendedSeverity.getAt(1)).toHaveTextContent('severity_impact.MEDIUM');

      await user.click(ui.activateButton.get(ui.activateQPDialog.get()));

      await waitFor(() => {
        expect(ui.activateButton.getAll()).toHaveLength(1);
      });

      expect(ui.changeButton('QP Bar').get()).toBeInTheDocument();
      expect(ui.deactivateButton.getAll()).toHaveLength(1);

      await user.click(ui.changeButton('QP Bar').get());

      expect(ui.newSeveritySelect(SoftwareQuality.Maintainability).get()).toHaveValue(
        'severity_impact.LOW',
      );

      expect(ui.newSeveritySelect(SoftwareQuality.Security).get()).toHaveValue(
        'severity_impact.MEDIUM',
      );

      expect(ui.newSeveritySelect(SoftwareQuality.Reliability).get()).toBeDisabled();
      expect(ui.notRecommendedSeverity.getAll()).toHaveLength(2);
      expect(ui.notRecommendedSeverity.getAt(0)).toHaveTextContent('severity_impact.LOW');
      expect(ui.notRecommendedSeverity.getAt(1)).toHaveTextContent('severity_impact.MEDIUM');
      await user.click(ui.newSeveritySelect(SoftwareQuality.Security).get());
      await user.click(byRole('option', { name: 'severity_impact.BLOCKER' }).get());
      expect(ui.notRecommendedSeverity.getAll()).toHaveLength(2);
      expect(ui.notRecommendedSeverity.getAt(0)).toHaveTextContent('severity_impact.LOW');
      expect(ui.notRecommendedSeverity.getAt(1)).toHaveTextContent('severity_impact.MEDIUM');
      await user.click(ui.saveButton.get(ui.changeQPDialog.get()));

      // Check that new severity is saved
      await user.click(ui.changeButton('QP Bar').get());

      expect(ui.newSeveritySelect(SoftwareQuality.Maintainability).get()).toHaveValue(
        'severity_impact.LOW',
      );

      expect(ui.newSeveritySelect(SoftwareQuality.Security).get()).toHaveValue(
        'severity_impact.BLOCKER',
      );

      expect(ui.newSeveritySelect(SoftwareQuality.Reliability).get()).toBeDisabled();

      await user.click(ui.cancelButton.get(ui.changeQPDialog.get()));
    });

    it('can revert to parent definition specific rule for quality profile', async () => {
      const { ui, user } = getPageObjects();
      settingsHandler.set(SettingsKey.QPAdminCanDisableInheritedRules, 'false');
      rulesHandler.setIsAdmin();
      renderCodingRulesApp(mockLoggedInUser(), undefined, [Feature.PrioritizedRules]);
      await ui.listLoaded();

      await user.click(ui.qpFacet.get());
      await user.click(ui.facetItem('QP Bar Python').get());

      // Only 4 rules are activated in selected QP
      expect(ui.getAllRuleListItems()).toHaveLength(4);

      // 3 rules have deactivate button and 1 rule has revert to parent definition button
      expect(ui.deactivateButton.getAll()).toHaveLength(3);
      expect(ui.revertToParentDefinitionButton().get()).toBeInTheDocument();

      await user.type(ui.searchInput.get(), RULE_10);

      // Only 1 rule left after search
      expect(ui.getAllRuleListItems()).toHaveLength(1);
      expect(ui.revertToParentDefinitionButton().get()).toBeInTheDocument();
      expect(ui.changeButton('QP Bar').get()).toBeInTheDocument();

      // Check that severity is reflected correctly
      await user.click(ui.changeButton('QP Bar').get());

      expect(ui.newSeveritySelect(SoftwareQuality.Maintainability).get()).toHaveValue(
        'severity_impact.MEDIUM',
      );

      expect(ui.newSeveritySelect(SoftwareQuality.Reliability).get()).toHaveValue(
        'severity_impact.INFO',
      );

      expect(ui.newSeveritySelect(SoftwareQuality.Security).get()).toBeDisabled();
      expect(ui.notRecommendedSeverity.getAll()).toHaveLength(2);
      expect(ui.notRecommendedSeverity.getAt(0)).toHaveTextContent('severity_impact.HIGH');
      expect(ui.notRecommendedSeverity.getAt(1)).toHaveTextContent('severity_impact.LOW');
      expect(ui.prioritizedSwitch.get(ui.changeQPDialog.get())).toBeChecked();
      await user.click(ui.cancelButton.get(ui.changeQPDialog.get()));

      await user.click(ui.revertToParentDefinitionButton().get());
      await user.click(ui.yesButton.get());

      // The button is removed asynchronously after the revert request completes.
      // Assert disappearance via waitFor to avoid a race with immediate DOM checks.
      await waitFor(() => {
        expect(ui.revertToParentDefinitionButton().query()).not.toBeInTheDocument();
      });

      expect(ui.getAllRuleListItems()).toHaveLength(1);
      expect(ui.deactivateButton.get()).toBeInTheDocument();
      expect(ui.deactivateButton.get()).toBeDisabled();
      expect(ui.changeButton('QP Bar').get()).toBeInTheDocument();

      // Check that severity is reflected correctly
      await user.click(ui.changeButton('QP Bar').get());

      expect(ui.newSeveritySelect(SoftwareQuality.Maintainability).get()).toHaveValue(
        'coding_rules.custom_severity.severity_with_recommended.severity_impact.LOW',
      );

      expect(ui.newSeveritySelect(SoftwareQuality.Reliability).get()).toHaveValue(
        'severity_impact.BLOCKER',
      );

      expect(ui.newSeveritySelect(SoftwareQuality.Security).get()).toBeDisabled();
      expect(ui.notRecommendedSeverity.getAll()).toHaveLength(1);
      expect(ui.notRecommendedSeverity.getAt(0)).toHaveTextContent('severity_impact.HIGH');
      expect(ui.prioritizedSwitch.get(ui.changeQPDialog.get())).not.toBeChecked();
      await user.click(ui.cancelButton.get(ui.changeQPDialog.get()));
    });

    it('should not override when no changes and should ignore excessive impacts', async () => {
      const { ui, user } = getPageObjects();
      settingsHandler.set(SettingsKey.QPAdminCanDisableInheritedRules, 'false');
      rulesHandler.setIsAdmin();
      renderCodingRulesApp(mockLoggedInUser(), undefined, []);
      await ui.facetsLoaded();

      await user.click(ui.qpFacet.get());
      await user.click(ui.facetItem('QP Bar Python').get());

      // --- No override when saving without changes (RULE_9) ---
      await user.type(ui.searchInput.get(), RULE_9);
      expect(ui.changeButton('QP Bar').get()).toBeInTheDocument();

      await user.click(ui.changeButton('QP Bar').get());

      expect(ui.newSeveritySelect(SoftwareQuality.Reliability).get()).toHaveValue(
        'severity_impact.MEDIUM',
      );

      expect(ui.newSeveritySelect(SoftwareQuality.Security).get()).toBeDisabled();
      expect(ui.newSeveritySelect(SoftwareQuality.Maintainability).get()).toBeDisabled();
      expect(ui.notRecommendedSeverity.get()).toBeInTheDocument();
      expect(ui.notRecommendedSeverity.get()).toHaveTextContent('severity_impact.LOW');
      await user.click(ui.saveButton.get(ui.changeQPDialog.get()));
      expect(ui.revertToParentDefinitionButton().query()).not.toBeInTheDocument();

      // --- Ignore excessive activation impacts (RULE_7) ---
      await user.clear(ui.searchInput.get());
      await user.type(ui.searchInput.get(), RULE_7);
      expect(ui.changeButton('QP Bar').get()).toBeInTheDocument();

      await user.click(ui.changeButton('QP Bar').get());

      expect(ui.newSeveritySelect(SoftwareQuality.Maintainability).get()).toHaveValue(
        'severity_impact.MEDIUM',
      );

      expect(ui.newSeveritySelect(SoftwareQuality.Security).get()).toBeDisabled();
      expect(ui.newSeveritySelect(SoftwareQuality.Reliability).get()).toBeDisabled();
      expect(ui.notRecommendedSeverity.get()).toBeInTheDocument();
      expect(ui.notRecommendedSeverity.get()).toHaveTextContent('severity_impact.LOW');
      await user.click(ui.newSeveritySelect(SoftwareQuality.Maintainability).get());

      await user.click(
        byRole('option', {
          name: 'coding_rules.custom_severity.severity_with_recommended.severity_impact.LOW',
        }).get(),
      );

      await user.click(ui.saveButton.get(ui.changeQPDialog.get()));

      await user.click(ui.changeButton('QP Bar').get());

      expect(ui.newSeveritySelect(SoftwareQuality.Maintainability).get()).toHaveValue(
        'coding_rules.custom_severity.severity_with_recommended.severity_impact.LOW',
      );

      expect(ui.newSeveritySelect(SoftwareQuality.Security).get()).toBeDisabled();
      expect(ui.newSeveritySelect(SoftwareQuality.Reliability).get()).toBeDisabled();
      expect(ui.notRecommendedSeverity.query()).not.toBeInTheDocument();
    });
  });
});
