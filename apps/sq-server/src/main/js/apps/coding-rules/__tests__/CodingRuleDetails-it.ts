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

import { fireEvent, screen } from '@testing-library/react';
import { byRole } from '~shared/helpers/testSelector';
import {
  CodeAttribute,
  CodeAttributeCategory,
  SoftwareImpactSeverity,
  SoftwareQuality,
} from '~shared/types/clean-code-taxonomy';
import CodingRulesServiceMock, {
  RULE_TAGS_MOCK,
} from '~sq-server-commons/api/mocks/CodingRulesServiceMock';
import { QP_2, QP_4, RULE_1, RULE_10 } from '~sq-server-commons/api/mocks/data/ids';
import { LanguagesServiceMock } from '~sq-server-commons/api/mocks/LanguagesServiceMock';
import { ModeServiceMock } from '~sq-server-commons/api/mocks/ModeServiceMock';
import SettingsServiceMock from '~sq-server-commons/api/mocks/SettingsServiceMock';
import {
  mockCurrentUser,
  mockLoggedInUser,
  mockRuleActivationAdvanced,
} from '~sq-server-commons/helpers/testMocks';
import { Feature } from '~sq-server-commons/types/features';
import { Mode } from '~sq-server-commons/types/mode';
import { SettingsKey } from '~sq-server-commons/types/settings';
import { getPageObjects, renderCodingRulesApp } from '../utils-tests';

const rulesHandler = new CodingRulesServiceMock();
const settingsHandler = new SettingsServiceMock();
const modeHandler = new ModeServiceMock();
const languagesHandler = new LanguagesServiceMock();

afterEach(() => {
  settingsHandler.reset();
  modeHandler.reset();
  rulesHandler.reset();
  languagesHandler.reset();
});

describe('rendering', () => {
  it('shows rule with default description section and params', async () => {
    const { ui } = getPageObjects();
    renderCodingRulesApp(undefined, 'coding_rules?open=' + RULE_1);
    await ui.detailsloaded();
    expect(ui.ruleTitle('Awsome java rule').get()).toBeInTheDocument();
    expect(
      ui.ruleCleanCodeAttributeCategory(CodeAttributeCategory.Intentional).get(),
    ).toBeInTheDocument();
    expect(ui.ruleCleanCodeAttribute(CodeAttribute.Clear).get()).toBeInTheDocument();
    // 1 In Rule details + 1 in facet
    expect(ui.ruleSoftwareQuality(SoftwareQuality.Maintainability).getAll()).toHaveLength(2);
    expect(document.title).toEqual('page_title.template.with_category.coding_rules.page');
    expect(screen.getByText('Why')).toBeInTheDocument();
    expect(screen.getByText('Because')).toBeInTheDocument();

    // Check params data
    expect(screen.getByText('html description for key 1')).toBeInTheDocument();
    expect(screen.getByText('default value for key 2')).toBeInTheDocument();
    expect(ui.softwareQualitiesSection.get()).toBeInTheDocument();
    expect(ui.cleanCodeAttributeSection.get()).toBeInTheDocument();
  });

  it('shows external rule', async () => {
    const { ui } = getPageObjects();
    renderCodingRulesApp(undefined, 'coding_rules?open=rule6');
    await ui.detailsloaded();
    expect(ui.ruleTitle('Bad Python rule').get()).toBeInTheDocument();
    expect(ui.externalDescription('Bad Python rule').get()).toBeInTheDocument();
  });

  it('shows hotspot rule', async () => {
    const { ui, user } = getPageObjects();
    renderCodingRulesApp(undefined, 'coding_rules?open=rule2');
    await ui.detailsloaded();
    expect(ui.ruleTitle('Hot hotspot').get()).toBeInTheDocument();
    expect(ui.introTitle.get()).toBeInTheDocument();
    expect(ui.softwareQualitiesSection.query()).not.toBeInTheDocument();
    expect(ui.cleanCodeAttributeSection.query()).not.toBeInTheDocument();

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
    await ui.detailsloaded();
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
    await ui.detailsloaded();
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

  it('should show CaYC notification for rule advanced section and removes it after user`s visit', async () => {
    const { ui, user } = getPageObjects();
    renderCodingRulesApp(mockLoggedInUser(), 'coding_rules?open=rule10');
    await ui.detailsloaded();
    await user.click(ui.moreInfoTab.get());

    expect(ui.caycNotificationButton.get()).toBeInTheDocument();

    // navigate away and come back
    await user.click(ui.howToFixTab.get());
    await user.click(ui.moreInfoTab.get());

    expect(ui.caycNotificationButton.query()).not.toBeInTheDocument();
  });

  it('should show CaYC notification for rule advanced section and removes it when user scrolls to the principles', async () => {
    const { ui, user } = getPageObjects();
    renderCodingRulesApp(mockLoggedInUser(), 'coding_rules?open=rule10');
    await ui.detailsloaded();
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

    await ui.detailsloaded();
    await user.click(ui.moreInfoTab.get());

    expect(ui.caycNotificationButton.query()).not.toBeInTheDocument();
  });

  it('should show customized severity and prioritized rule', async () => {
    const { ui, user } = getPageObjects();
    renderCodingRulesApp(mockCurrentUser(), 'coding_rules?open=rule10');

    await ui.detailsloaded();
    await user.click(ui.moreInfoTab.get());

    expect(ui.caycNotificationButton.query()).not.toBeInTheDocument();
  });

  it('should not show customized severity if the order of impacts is different', async () => {
    const { ui } = getPageObjects();
    rulesHandler.rulesActivations = {
      [RULE_10]: [
        mockRuleActivationAdvanced({
          qProfile: QP_2,
          severity: 'MINOR',
          impacts: [
            {
              softwareQuality: SoftwareQuality.Reliability,
              severity: SoftwareImpactSeverity.High,
            },
            {
              softwareQuality: SoftwareQuality.Maintainability,
              severity: SoftwareImpactSeverity.Low,
            },
          ],
        }),
      ],
    };
    renderCodingRulesApp(mockCurrentUser(), 'coding_rules?open=rule10');

    await ui.detailsloaded();

    expect(ui.newSeverityCustomizedCell.query()).not.toBeInTheDocument();
  });
});

it('can activate/change/deactivate rule in quality profile', async () => {
  const { ui, user } = getPageObjects();
  rulesHandler.setIsAdmin();

  renderCodingRulesApp(mockLoggedInUser(), 'coding_rules?open=rule1&qprofile=' + QP_4, [
    Feature.PrioritizedRules,
  ]);

  expect(await ui.qpLink('QP Foo').find()).toBeInTheDocument();
  const mainContainer = screen.getByRole('main');
  expect(ui.qpLink('QP FooBarBaz').query()).not.toBeInTheDocument();

  // 'QP FooBaz' is inherited from 'QP FooBarBaz'
  expect(ui.qpLink('QP FooBaz').query()).not.toBeInTheDocument();

  // Activate profile with inherited ones java rule
  fireEvent.click(ui.activateButton.get(mainContainer)); // Use fireEvent instead of userEvent to speed up that very long test, fireEvent is around 4x faster but less safe
  let activationDialog = ui.activateQPDialog.get();
  fireEvent.click(ui.qualityProfileSelect.get(activationDialog));
  fireEvent.click(byRole('option', { name: 'QP FooBarBaz' }).get(activationDialog));
  fireEvent.paste(ui.paramInput('1').get(activationDialog), 'paramInput');
  fireEvent.click(ui.activateButton.get(activationDialog));
  expect(await ui.qpLink('QP FooBarBaz').find(mainContainer)).toBeInTheDocument();

  // 'QP FooBaz' is inherited from 'QP FooBarBaz'
  expect(ui.qpLink('QP FooBaz').get(mainContainer)).toBeInTheDocument();

  // Activate rule in quality profile
  expect(ui.prioritizedRuleCell.query(mainContainer)).not.toBeInTheDocument();
  fireEvent.click(ui.activateButton.get(mainContainer));
  activationDialog = ui.activateQPDialog.get();
  fireEvent.click(ui.prioritizedSwitch.get(activationDialog));
  fireEvent.click(ui.newSeveritySelect(SoftwareQuality.Maintainability).get(activationDialog));
  fireEvent.click(byRole('option', { name: 'severity_impact.LOW' }).get(activationDialog));
  fireEvent.click(ui.activateButton.get(activationDialog));

  const qpTable = await ui.qualityProfileTable.find(mainContainer);
  expect(ui.qpLink('QP FooBar').get(qpTable)).toBeInTheDocument();
  expect(ui.prioritizedRuleCell.get(qpTable)).toBeInTheDocument();
  expect(ui.oldSeverityCustomizedCell.query(qpTable)).not.toBeInTheDocument();
  expect(ui.newSeverityCustomizedCell.get(qpTable)).toBeInTheDocument();
  await expect(ui.newSeverityCustomizedCell.get(qpTable)).toHaveATooltipWithContent(
    'coding_rules.impact_customized.detail software_quality.MAINTAINABILITYseverity_impact.MEDIUMseverity_impact.LOW',
  );

  // Rule is activated in all quality profiles - show notification in dialog
  await user.click(ui.activateButton.get(mainContainer));
  activationDialog = ui.activateQPDialog.get();
  expect(ui.activaInAllQPs.get(activationDialog)).toBeInTheDocument();
  expect(ui.activateButton.get(activationDialog)).toBeDisabled();
  await user.click(ui.cancelButton.get(activationDialog));

  // Change rule details in quality profile
  fireEvent.click(ui.changeButton('QP FooBaz').get(mainContainer));
  const changeDialog = await ui.changeQPDialog.find();
  await user.clear(ui.paramInput('1').get(changeDialog));
  await user.click(ui.paramInput('1').get(changeDialog));
  await user.paste('New');
  fireEvent.click(ui.newSeveritySelect(SoftwareQuality.Maintainability).get(changeDialog));
  fireEvent.click(byRole('option', { name: 'severity_impact.BLOCKER' }).get(changeDialog));
  await user.click(ui.saveButton.get(changeDialog));
  let qpRow = await ui.qualityProfileRow.findAt(4);
  expect(qpRow).toHaveTextContent('QP FooBaz');
  expect(qpRow).toHaveTextContent('New');
  await expect(ui.newSeverityCustomizedCell.get(qpRow)).toHaveATooltipWithContent(
    'coding_rules.impact_customized.detail software_quality.MAINTAINABILITYseverity_impact.MEDIUMseverity_impact.BLOCKER',
  );

  // Revert rule details in quality profile
  fireEvent.click(ui.revertToParentDefinitionButton.get(mainContainer));
  await user.click(ui.yesButton.get());
  qpRow = await ui.qualityProfileRow.findAt(4);
  expect(qpRow).toHaveTextContent('QP FooBaz');
  expect(qpRow).not.toHaveTextContent('New');
  expect(ui.newSeverityCustomizedCell.query(qpRow)).not.toBeInTheDocument();

  // Deactivate rule in quality profile
  await user.click(ui.deactivateInQPButton('QP FooBar').get(mainContainer));
  await user.click(ui.yesButton.get());
  expect(ui.qpLink('QP FooBar').query(mainContainer)).not.toBeInTheDocument();
}, 80000);

it('can activate/change/deactivate rule in quality profile for legacy mode', async () => {
  const { ui, user } = getPageObjects();
  modeHandler.setMode(Mode.Standard);
  rulesHandler.setIsAdmin();
  renderCodingRulesApp(mockLoggedInUser(), 'coding_rules?open=rule1', [Feature.PrioritizedRules]);
  await ui.detailsloaded();

  const mainContainer = screen.getByRole('main');
  expect(ui.qpLink('QP Foo').get(mainContainer)).toBeInTheDocument();

  // Activate rule in quality profile
  expect(ui.prioritizedRuleCell.query(mainContainer)).not.toBeInTheDocument();
  fireEvent.click(ui.activateButton.get(mainContainer)); // Use fireEvent instead of userEvent to speed up that very long test, fireEvent is around 4x faster but less safe

  let activationDialog = ui.activateQPDialog.get();
  fireEvent.click(ui.prioritizedSwitch.get(activationDialog));
  fireEvent.click(ui.oldSeveritySelect.get(activationDialog));
  fireEvent.click(byRole('option', { name: 'severity.MINOR' }).get(activationDialog));
  fireEvent.click(ui.activateButton.get(activationDialog));
  expect(await ui.qpLink('QP FooBar').find(mainContainer)).toBeInTheDocument();
  expect(await ui.prioritizedRuleCell.find(mainContainer)).toBeInTheDocument();
  expect(ui.newSeverityCustomizedCell.query(mainContainer)).not.toBeInTheDocument();
  expect(ui.oldSeverityCustomizedCell.get(mainContainer)).toBeInTheDocument();
  expect(ui.oldSeverityCustomizedCell.get(mainContainer)).toHaveTextContent(
    'severity.MAJORseverity.MINOR',
  );

  fireEvent.click(ui.changeButton('QP FooBar').get());
  let changeDialog = await ui.changeQPDialog.find();
  fireEvent.click(ui.oldSeveritySelect.get(changeDialog));
  fireEvent.click(
    byRole('option', { name: /coding_rules.custom_severity.severity_with_recommended/ }).get(
      changeDialog,
    ),
  );
  fireEvent.click(ui.saveButton.get(changeDialog));
  expect(await ui.prioritizedRuleCell.find(mainContainer)).toBeInTheDocument();
  expect(ui.oldSeverityCustomizedCell.query(mainContainer)).not.toBeInTheDocument();
  expect(ui.newSeverityCustomizedCell.query(mainContainer)).not.toBeInTheDocument();

  // Activate last java rule
  fireEvent.click(ui.activateButton.get(mainContainer));
  activationDialog = await ui.activateQPDialog.find();
  fireEvent.paste(ui.paramInput('1').get(activationDialog), 'paramInput');
  fireEvent.click(ui.activateButton.get(activationDialog));
  expect(await ui.qpLink('QP FooBarBaz').find()).toBeInTheDocument();
  expect(ui.qpLink('QP FooBaz').get()).toBeInTheDocument();

  // Change rule details in quality profile
  fireEvent.click(ui.changeButton('QP FooBaz').get(mainContainer));
  changeDialog = await ui.changeQPDialog.find();
  fireEvent.click(ui.oldSeveritySelect.get(changeDialog));
  fireEvent.click(byRole('option', { name: 'severity.BLOCKER' }).get(changeDialog));
  fireEvent.click(ui.saveButton.get(changeDialog));
  let qpRow = await ui.qualityProfileRow.findAt(5);
  expect(qpRow).toHaveTextContent('QP FooBaz');
  expect(ui.oldSeverityCustomizedCell.get(qpRow)).toBeInTheDocument();
  expect(ui.oldSeverityCustomizedCell.get(qpRow)).toHaveTextContent(
    'severity.MAJORseverity.BLOCKER',
  );

  // Revert rule details in quality profile
  await user.click(ui.revertToParentDefinitionButton.get(mainContainer));
  await user.click(ui.yesButton.get());
  qpRow = await ui.qualityProfileRow.findAt(5);
  expect(qpRow).toHaveTextContent('QP FooBaz');
  expect(ui.oldSeverityCustomizedCell.query(qpRow)).not.toBeInTheDocument();
});

it('should show multiple customized severities', async () => {
  const { ui, user } = getPageObjects();
  rulesHandler.setIsAdmin();
  renderCodingRulesApp(mockLoggedInUser(), 'coding_rules?open=rule10', [Feature.PrioritizedRules]);
  await ui.detailsloaded();

  expect(ui.newSeverityCustomizedCell.get(ui.qualityProfileRow.getAt(1))).toBeInTheDocument();
  await expect(
    ui.newSeverityCustomizedCell.get(ui.qualityProfileRow.getAt(1)),
  ).toHaveATooltipWithContent(
    'coding_rules.impact_customized.detail software_quality.RELIABILITYseverity_impact.HIGHseverity_impact.INFOcoding_rules.impact_customized.detail software_quality.MAINTAINABILITYseverity_impact.LOWseverity_impact.MEDIUM',
  );

  expect(ui.newSeverityCustomizedCell.get(ui.qualityProfileRow.getAt(2))).toBeInTheDocument();
  await expect(
    ui.newSeverityCustomizedCell.get(ui.qualityProfileRow.getAt(2)),
  ).toHaveATooltipWithContent(
    'coding_rules.impact_customized.detail software_quality.RELIABILITYseverity_impact.HIGHseverity_impact.BLOCKER',
  );

  await user.click(ui.changeButton('QP Bar').get());
  await user.click(ui.newSeveritySelect(SoftwareQuality.Reliability).get());
  await user.click(
    byRole('option', { name: /coding_rules.custom_severity.severity_with_recommended/ }).get(),
  );
  await user.click(ui.newSeveritySelect(SoftwareQuality.Maintainability).get());
  await user.click(
    byRole('option', { name: /coding_rules.custom_severity.severity_with_recommended/ }).get(),
  );
  await user.click(ui.saveButton.get(ui.changeQPDialog.get()));
  expect(ui.newSeverityCustomizedCell.query(ui.qualityProfileRow.getAt(1))).not.toBeInTheDocument();
});

it('can deactivate an inherrited rule', async () => {
  const { ui, user } = getPageObjects();
  rulesHandler.setIsAdmin();
  renderCodingRulesApp(mockLoggedInUser(), 'coding_rules?open=rule11');
  await ui.detailsloaded();

  // Should show 2 deactivate buttons: one for the parent, one for the child profile.
  expect(ui.deactivateInQPButton('QP FooBarBaz').get()).toBeInTheDocument();
  expect(ui.deactivateInQPButton('QP FooBaz').get()).toBeInTheDocument();

  // Deactivate rule in inherited quality profile
  await user.click(ui.deactivateInQPButton('QP FooBaz').get());
  await user.click(ui.yesButton.get());
  expect(ui.qpLink('QP FooBaz').query()).not.toBeInTheDocument();
});

it('cannot deactivate an inherrited rule if the setting is false', async () => {
  const { ui } = getPageObjects();
  rulesHandler.setIsAdmin();
  settingsHandler.set(SettingsKey.QPAdminCanDisableInheritedRules, 'false');
  renderCodingRulesApp(mockLoggedInUser(), 'coding_rules?open=rule11');
  await ui.detailsloaded();

  // Should show 1 deactivate button: one for the parent, none for the child profile.
  expect(ui.deactivateInQPButton('QP FooBarBaz').get()).toBeInTheDocument();
  expect(ui.deactivateInQPButton('QP FooBaz').query()).not.toBeInTheDocument();
});

it('can extend the rule description', async () => {
  const { ui, user } = getPageObjects();
  rulesHandler.setIsAdmin();
  renderCodingRulesApp(undefined, 'coding_rules?open=rule5');
  await ui.detailsloaded();
  expect(ui.ruleTitle('Awsome Python rule').get()).toBeInTheDocument();

  // Add
  await user.click(ui.extendDescriptionButton.get());
  await user.click(ui.extendDescriptionTextbox.get());
  await user.paste('TEST DESC');
  await user.click(ui.saveButton.get());
  expect(await screen.findByText('TEST DESC')).toBeInTheDocument();

  // Edit
  await user.click(ui.extendDescriptionButton.get());
  await user.clear(ui.extendDescriptionTextbox.get());
  await user.click(ui.extendDescriptionTextbox.get());
  await user.paste('NEW DESC');
  await user.click(ui.saveButton.get());
  expect(await screen.findByText('NEW DESC')).toBeInTheDocument();

  // Cancel
  await user.click(ui.extendDescriptionButton.get());
  await user.click(ui.extendDescriptionTextbox.get());
  await user.paste('Difference');
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
  rulesHandler.setIsAdmin();
  renderCodingRulesApp(undefined, 'coding_rules?open=rule10');
  await ui.detailsloaded();

  await user.click(ui.tagsDropdown.get());

  RULE_TAGS_MOCK.forEach((tag) => {
    expect(ui.tagCheckbox(tag).get()).toBeInTheDocument();
  });

  expect(ui.tagCheckbox(RULE_TAGS_MOCK[0]).get()).toBeChecked();

  // Set tag
  await user.click(ui.tagCheckbox(RULE_TAGS_MOCK[1]).get());
  await user.keyboard('{Escape}');
  await expect(ui.tagsDropdown.byText('multi-threading').get()).toHaveATooltipWithContent(
    'multi-threading, awesome, cute',
  );

  await user.click(ui.tagsDropdown.get());

  // Search for specific tag
  await user.click(ui.tagSearch.get());
  await user.paste(RULE_TAGS_MOCK[2]);
  expect(ui.tagCheckbox(RULE_TAGS_MOCK[2]).get()).toBeInTheDocument();
  expect(ui.tagCheckbox(RULE_TAGS_MOCK[1]).query()).not.toBeInTheDocument();
});
