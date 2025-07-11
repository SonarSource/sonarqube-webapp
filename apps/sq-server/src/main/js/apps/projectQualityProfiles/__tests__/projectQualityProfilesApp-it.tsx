/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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
import { addGlobalSuccessMessage } from '~design-system';
import { LanguagesServiceMock } from '~sq-server-commons/api/mocks/LanguagesServiceMock';
import {
  associateProject,
  getProfileProjects,
  ProfileProject,
  searchQualityProfiles,
} from '~sq-server-commons/api/quality-profiles';
import { mockComponent } from '~sq-server-commons/helpers/mocks/component';
import {
  renderAppWithComponentContext,
  RenderContext,
} from '~sq-server-commons/helpers/testReactTestingUtils';
import { byRole, byText } from '~sq-server-commons/sonar-aligned/helpers/testSelector';
import { Component } from '~sq-server-commons/types/types';
import handleRequiredAuthorization from '../../../app/utils/handleRequiredAuthorization';
import routes from '../routes';

jest.mock('~sq-server-commons/api/quality-profiles', () => {
  const { mockQualityProfile } = jest.requireActual('~sq-server-commons/helpers/testMocks');

  return {
    associateProject: jest.fn().mockResolvedValue({}),
    dissociateProject: jest.fn().mockResolvedValue({}),
    searchQualityProfiles: jest.fn().mockResolvedValue({
      profiles: [
        mockQualityProfile({
          key: 'css',
          language: 'css',
          name: 'css profile',
          languageName: 'CSS',
        }),
        mockQualityProfile({
          key: 'java',
          language: 'java',
          name: 'java profile',
          languageName: 'Java',
        }),
        mockQualityProfile({
          key: 'js',
          language: 'js',
          name: 'js profile',
          languageName: 'JavaScript',
        }),
        mockQualityProfile({
          key: 'ts',
          language: 'ts',
          isDefault: true,
          name: 'ts profile',
          languageName: 'Typescript',
        }),
        mockQualityProfile({
          key: 'html',
          language: 'html',
          name: 'html profile',
          languageName: 'HTML',
        }),
        mockQualityProfile({
          key: 'html_default',
          language: 'html',
          isDefault: true,
          isBuiltIn: true,
          name: 'html default profile',
          languageName: 'HTML',
        }),
      ],
    }),
    getProfileProjects: jest.fn(({ key }) => {
      const results: ProfileProject[] = [];
      if (key === 'css' || key === 'java' || key === 'js' || key === 'ts' || key === 'java') {
        results.push({
          key: 'my-project',
          name: 'My project',
          selected: true,
        });
      }
      return Promise.resolve({ results });
    }),
  };
});

jest.mock('~sq-server-commons/api/rules', () => ({
  searchRules: jest.fn().mockResolvedValue({
    paging: { pageIndex: 1, pageSize: 100, total: 1 },
    facets: [{ property: 'languages', values: [{ val: 'html', count: '1' }] }],
  }),
}));

jest.mock('~design-system', () => ({
  ...jest.requireActual('~design-system'),
  addGlobalSuccessMessage: jest.fn(),
}));

jest.mock('../../../app/utils/handleRequiredAuthorization', () => jest.fn());

const languagesService = new LanguagesServiceMock();

beforeEach(jest.clearAllMocks);

afterEach(() => {
  languagesService.reset();
});

const ui = {
  pageTitle: byText('project_quality_profile.page'),
  pageSubTitle: byText('project_quality_profile.subtitle'),
  pageDescription: byText('project_quality_profile.page.description'),
  profileRows: byRole('row'),
  addLanguageButton: byRole('button', { name: 'project_quality_profile.add_language.action' }),
  modalAddLanguageTitle: byText('project_quality_profile.add_language_modal.title'),
  selectLanguage: byRole('combobox', {
    name: 'project_quality_profile.add_language_modal.choose_language',
  }),
  selectProfile: byRole('combobox', {
    name: 'project_quality_profile.add_language_modal.choose_profile',
  }),
  selectUseSpecificProfile: byRole('combobox', {
    name: 'project_quality_profile.always_use_specific',
  }),
  buttonSave: byRole('button', { name: 'save' }),
  htmlLanguage: byText('HTML'),
  htmlProfile: byText('html profile'),
  cssLanguage: byText('CSS'),
  cssProfile: byText('css profile'),
  htmlDefaultProfile: byText('html default profile'),
  htmlActiveRuleslink: byRole('link', { name: '10' }),
  radioButtonUseInstanceDefault: byRole('radio', {
    name: /project_quality_profile.always_use_default/,
  }),
  radioButtonUseSpecific: byRole('radio', { name: /project_quality_profile.always_use_specific/ }),
  newAnalysisWarningMessage: byText('project_quality_profile.requires_new_analysis'),
  builtInTag: byText('quality_profiles.built_in'),
};

it('should be able to add and change profile for languages', async () => {
  const user = userEvent.setup();
  renderProjectQualityProfilesApp();

  expect(await ui.pageTitle.find()).toBeInTheDocument();
  expect(ui.pageDescription.get()).toBeInTheDocument();
  expect(await ui.addLanguageButton.find()).toBeInTheDocument();

  expect(ui.profileRows.getAll()).toHaveLength(5);
  expect(ui.cssLanguage.get()).toBeInTheDocument();
  expect(ui.cssProfile.get()).toBeInTheDocument();

  await user.click(ui.addLanguageButton.get());

  // Opens the add language modal
  expect(ui.modalAddLanguageTitle.get()).toBeInTheDocument();
  expect(ui.selectLanguage.get()).toBeEnabled();
  expect(ui.selectProfile.get()).toBeDisabled();
  expect(ui.buttonSave.get()).toBeInTheDocument();

  await user.click(ui.selectLanguage.get());
  await user.click(await byRole('option', { name: 'HTML' }).find());

  expect(ui.selectProfile.get()).toBeEnabled();

  await user.click(ui.selectProfile.get());
  await user.click(byRole('option', { name: 'html profile' }).get());

  await user.click(ui.buttonSave.get());
  expect(associateProject).toHaveBeenLastCalledWith(
    expect.objectContaining({ key: 'html', name: 'html profile' }),
    'my-project',
  );
  expect(addGlobalSuccessMessage).toHaveBeenCalledWith(
    'project_quality_profile.successfully_updated.HTML',
  );

  // Updates the page after API call
  const htmlRow = byRole('row', {
    name: 'HTML html profile 10',
  });

  expect(ui.htmlLanguage.get()).toBeInTheDocument();
  expect(ui.htmlProfile.get()).toBeInTheDocument();
  expect(ui.profileRows.getAll()).toHaveLength(6);
  expect(htmlRow.get()).toBeInTheDocument();
  expect(htmlRow.byRole('link', { name: '10' }).get()).toHaveAttribute(
    'href',
    '/coding_rules?activation=true&qprofile=html',
  );
  expect(ui.builtInTag.query()).not.toBeInTheDocument();

  await user.click(
    htmlRow.byRole('button', { name: 'project_quality_profile.change_profile_x.HTML' }).get(),
  );

  //Opens modal to change profile
  expect(ui.radioButtonUseInstanceDefault.get()).not.toBeChecked();
  expect(ui.radioButtonUseSpecific.get()).toBeChecked();
  expect(ui.newAnalysisWarningMessage.get()).toBeInTheDocument();
  expect(ui.selectUseSpecificProfile.get()).toBeInTheDocument();

  await user.click(ui.selectUseSpecificProfile.get());
  await user.click(byRole('option', { name: 'html default profile' }).get());

  await user.click(ui.buttonSave.get());

  expect(addGlobalSuccessMessage).toHaveBeenCalledWith(
    'project_quality_profile.successfully_updated.HTML',
  );

  // Updates the page after API call
  expect(ui.htmlProfile.query()).not.toBeInTheDocument();
  expect(ui.htmlDefaultProfile.get()).toBeInTheDocument();
  expect(ui.builtInTag.get()).toBeInTheDocument();
});

it('cannot add a profile for language with no rules', async () => {
  const user = userEvent.setup();
  renderProjectQualityProfilesApp();
  await user.click(await ui.addLanguageButton.find());
  await user.click(ui.selectLanguage.get());

  expect(byRole('option', { name: 'JavaScript' }).query()).not.toBeInTheDocument();
});

it('should call authorization api when permissions is not proper', () => {
  renderProjectQualityProfilesApp({}, { configuration: { showQualityProfiles: false } });
  expect(handleRequiredAuthorization).toHaveBeenCalled();
});

it('should still show page with add language button when api fails', async () => {
  jest.mocked(searchQualityProfiles).mockRejectedValueOnce(null);
  jest.mocked(getProfileProjects).mockRejectedValueOnce(null);

  renderProjectQualityProfilesApp();
  expect(ui.pageTitle.get()).toBeInTheDocument();
  expect(ui.pageDescription.get()).toBeInTheDocument();
  expect(await ui.addLanguageButton.find()).toBeInTheDocument();
});

function renderProjectQualityProfilesApp(
  context?: RenderContext,
  componentOverrides: Partial<Component> = { configuration: { showQualityProfiles: true } },
) {
  return renderAppWithComponentContext('project/quality_profiles', routes, context, {
    component: mockComponent(componentOverrides),
  });
}
