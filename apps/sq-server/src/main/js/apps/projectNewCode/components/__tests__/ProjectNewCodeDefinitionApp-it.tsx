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

import userEvent from '@testing-library/user-event';
import { last } from 'lodash';
import { byLabelText, byRole, byText } from '~shared/helpers/testSelector';
import { MessageTypes } from '~sq-server-commons/api/messages';
import BranchesServiceMock from '~sq-server-commons/api/mocks/BranchesServiceMock';
import MessagesServiceMock from '~sq-server-commons/api/mocks/MessagesServiceMock';
import NewCodeDefinitionServiceMock from '~sq-server-commons/api/mocks/NewCodeDefinitionServiceMock';
import { ProjectActivityServiceMock } from '~sq-server-commons/api/mocks/ProjectActivityServiceMock';
import { mockComponent } from '~sq-server-commons/helpers/mocks/component';
import { mockNewCodePeriodBranch } from '~sq-server-commons/helpers/mocks/new-code-definition';
import { mockAnalysis } from '~sq-server-commons/helpers/mocks/project-activity';
import { mockAppState } from '~sq-server-commons/helpers/testMocks';
import {
  RenderContext,
  renderAppWithComponentContext,
} from '~sq-server-commons/helpers/testReactTestingUtils';
import { Feature } from '~sq-server-commons/types/features';
import { NewCodeDefinitionType } from '~sq-server-commons/types/new-code-definition';
import routes from '../../routes';

jest.mock('~sq-server-commons/api/newCodeDefinition');
jest.mock('~sq-server-commons/api/projectActivity');
jest.mock('~sq-server-commons/api/branches');

const newCodeDefinitionMock = new NewCodeDefinitionServiceMock();
const projectActivityMock = new ProjectActivityServiceMock();
const branchHandler = new BranchesServiceMock();
const messagesMock = new MessagesServiceMock();

beforeEach(() => {
  branchHandler.reset();
  newCodeDefinitionMock.reset();
  projectActivityMock.reset();
  messagesMock.reset();
});

it('renders correctly without branch support feature', async () => {
  const { ui } = getPageObjects();
  renderProjectNewCodeDefinitionApp();
  await ui.appIsLoaded();

  expect(await ui.generalSettingRadio.find()).toBeChecked();
  expect(ui.specificAnalysisRadio.query()).not.toBeInTheDocument();

  // User is not admin
  expect(ui.generalSettingsLink.query()).not.toBeInTheDocument();

  expect(ui.generalSettingRadio.get()).toBeInTheDocument();

  expect(ui.branchListHeading.query()).not.toBeInTheDocument();
});

it('can set previous version specific setting', async () => {
  const { ui, user } = getPageObjects();
  renderProjectNewCodeDefinitionApp();
  await ui.appIsLoaded();

  expect(ui.previousVersionRadio.query()).not.toBeInTheDocument();
  await ui.setPreviousVersionSetting();
  expect(ui.previousVersionRadio.get()).toBeChecked();

  // Save changes
  await user.click(ui.saveButton.get());

  expect(ui.saveButton.query()).not.toBeInTheDocument();

  // Set general setting
  await user.click(ui.generalSettingRadio.get());
  expect(ui.previousVersionRadio.query()).not.toBeInTheDocument();
  await user.click(ui.saveButton.get());
  expect(ui.saveButton.query()).not.toBeInTheDocument();
});

it('can set number of days specific setting', async () => {
  const { ui, user } = getPageObjects();
  renderProjectNewCodeDefinitionApp();
  await ui.appIsLoaded();

  expect(ui.previousVersionRadio.query()).not.toBeInTheDocument();
  await ui.setNumberDaysSetting('10');
  expect(ui.numberDaysRadio.get()).toBeChecked();

  // Reset to initial state
  await user.click(ui.cancelButton.get());
  expect(ui.generalSettingRadio.get()).toBeChecked();
  expect(ui.numberDaysRadio.query()).not.toBeInTheDocument();

  // Save changes
  await ui.setNumberDaysSetting('10');
  await user.click(ui.saveButton.get());

  expect(ui.saveButton.query()).not.toBeInTheDocument();
});

it('cannot set specific analysis setting', async () => {
  const { ui } = getPageObjects();
  newCodeDefinitionMock.setListBranchesNewCode([
    mockNewCodePeriodBranch({
      branchKey: 'main',
      type: NewCodeDefinitionType.SpecificAnalysis,
      value: 'analysis_id',
    }),
  ]);
  projectActivityMock.setAnalysesList([
    mockAnalysis({
      key: `analysis_id`,
      date: '2018-01-11T00:00:00+0200',
    }),
  ]);
  renderProjectNewCodeDefinitionApp();
  await ui.appIsLoaded();

  expect(await ui.specificAnalysisRadio.find()).toBeChecked();
  expect(await ui.baselineSpecificAnalysisDate.find()).toBeInTheDocument();

  expect(ui.specificAnalysisRadio.get()).toBeDisabled();
  expect(ui.specificAnalysisWarning.get()).toBeInTheDocument();

  expect(ui.saveButton.query()).not.toBeInTheDocument();
});


function renderProjectNewCodeDefinitionApp(context: RenderContext = {}, params?: string) {
  return renderAppWithComponentContext(
    'baseline',
    routes,
    {
      ...context,
      navigateTo: params ? `baseline?id=my-project&${params}` : 'baseline?id=my-project',
    },
    {
      component: mockComponent(),
    },
  );
}

function getPageObjects() {
  const user = userEvent.setup();

  const ui = {
    pageHeading: byRole('heading', { name: 'project_baseline.page' }),
    branchListHeading: byText('project_baseline.configure_branches'),
    branchTableHeading: byText('branch_list.branch'),
    generalSettingsLink: byRole('link', { name: 'project_baseline.page.description3_link' }),
    generalSettingRadio: byRole('radio', { name: 'project_baseline.global_setting' }),
    specificSettingRadio: byRole('radio', { name: 'project_baseline.specific_setting' }),
    previousVersionRadio: byRole('radio', {
      name: /new_code_definition.specific_setting.previous_version.label/,
    }),
    numberDaysRadio: byRole('radio', {
      name: /new_code_definition.specific_setting.number_of_days.label/,
    }),
    numberDaysInput: byRole('spinbutton'),
    referenceBranchRadio: byRole('radio', {
      name: /new_code_definition.specific_setting.reference_branch.label/,
    }),
    chooseBranchSelect: byRole('combobox', {
      name: 'new_code_definition.specific_setting.reference_branch.input.label',
    }),
    specificAnalysisRadio: byRole('radio', {
      name: /new_code_definition.specific_setting.specific_analysis.label/,
    }),
    specificAnalysisWarning: byText(
      'new_code_definition.specific_setting.specific_analysis.warning.label',
    ),
    saveButton: byRole('button', { name: 'save' }),
    cancelButton: byRole('button', { name: 'cancel' }),
    branchActionsButton: (name: string) =>
      byRole('button', { name: `branch_list.show_actions_for_x.${name}` }),
    resetToDefaultButton: byRole('menuitem', { name: 'reset_to_default' }),
    branchNCDsBanner: byText(/new_code_definition.auto_update.branch.message/),
    dismissButton: byLabelText('dismiss'),
    baselineSpecificAnalysisDate: byText(/January 10, 2018/),
    missingReferenceBranchWarning: byText('baseline.reference_branch.does_not_exist'),
  };

  async function appIsLoaded() {
    expect(await ui.pageHeading.find()).toBeInTheDocument();
  }

  async function setPreviousVersionSetting() {
    await user.click(await ui.specificSettingRadio.find());
    await user.click(ui.previousVersionRadio.get());
  }

  async function setBranchPreviousVersionSetting(branch: string) {
    await openBranchSettingModal(branch);
    await user.click(last(ui.previousVersionRadio.getAll()) as HTMLElement);
    await user.click(last(ui.saveButton.getAll()) as HTMLElement);
  }

  async function setNumberDaysSetting(value: string) {
    await user.click(await ui.specificSettingRadio.find());
    await user.click(ui.numberDaysRadio.get());
    await user.clear(ui.numberDaysInput.get());
    await user.type(ui.numberDaysInput.get(), value);
  }

  async function setBranchNumberOfDaysSetting(branch: string, value: string) {
    await openBranchSettingModal(branch);
    await user.click(last(ui.numberDaysRadio.getAll()) as HTMLElement);
    await user.clear(ui.numberDaysInput.get());
    await user.type(ui.numberDaysInput.get(), value);
    await user.click(last(ui.saveButton.getAll()) as HTMLElement);
  }

  async function setReferenceBranchSetting(branch: string) {
    await user.click(await ui.specificSettingRadio.find());
    await user.click(ui.referenceBranchRadio.get());

    await user.click(ui.chooseBranchSelect.get());
    await user.click(byRole('option', { name: new RegExp(branch) }).get());
  }

  async function setBranchReferenceToBranchSetting(branch: string, branchRef: string) {
    await openBranchSettingModal(branch);
    await user.click(last(ui.referenceBranchRadio.getAll()) as HTMLElement);

    await user.click(ui.chooseBranchSelect.get());
    await user.click(byRole('option', { name: new RegExp(branchRef) }).get());

    await user.click(last(ui.saveButton.getAll()) as HTMLElement);
  }

  async function openBranchSettingModal(branch: string) {
    await user.click(await byLabelText(`branch_list.edit_for_x.${branch}`).find());
  }

  return {
    ui: {
      ...ui,
      appIsLoaded,
      setNumberDaysSetting,
      setPreviousVersionSetting,
      setReferenceBranchSetting,
      setBranchPreviousVersionSetting,
      setBranchNumberOfDaysSetting,
      setBranchReferenceToBranchSetting,
      openBranchSettingModal,
    },
    user,
  };
}
