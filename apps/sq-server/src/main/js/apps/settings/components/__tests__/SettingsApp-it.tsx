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

import { within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route } from 'react-router-dom';
import { registerServiceMocks } from '~shared/api/mocks/server';
import {
  EntitlementsServiceDefaultDataset,
  EntitlementsServiceMock,
} from '~sq-server-commons/api/mocks/EntitlementsServiceMock';
import { ModeServiceMock } from '~sq-server-commons/api/mocks/ModeServiceMock';
import ScaServiceSettingsMock from '~sq-server-commons/api/mocks/ScaServiceSettingsMock';
import SettingsServiceMock from '~sq-server-commons/api/mocks/SettingsServiceMock';
import { KeyboardKeys } from '~sq-server-commons/helpers/keycodes';
import { mockComponent } from '~sq-server-commons/helpers/mocks/component';
import {
  renderAppRoutes,
  renderAppWithComponentContext,
  RenderContext,
} from '~sq-server-commons/helpers/testReactTestingUtils';
import { byRole, byText } from '~sq-server-commons/sonar-aligned/helpers/testSelector';
import { Feature } from '~sq-server-commons/types/features';
import { Component } from '~sq-server-commons/types/types';
import routes from '../../routes';

let settingsMock: SettingsServiceMock;
let scaSettingsMock: ScaServiceSettingsMock;
let modeHandler: ModeServiceMock;
let entitlementsMock: EntitlementsServiceMock;

beforeAll(() => {
  settingsMock = new SettingsServiceMock();
  scaSettingsMock = new ScaServiceSettingsMock();
  modeHandler = new ModeServiceMock();
  entitlementsMock = new EntitlementsServiceMock(EntitlementsServiceDefaultDataset);
});

afterEach(() => {
  settingsMock.reset();
  scaSettingsMock.reset();
  modeHandler.reset();
  entitlementsMock.reset();
});

beforeEach(() => {
  jest.clearAllMocks();
  registerServiceMocks(entitlementsMock);
});

const ui = {
  categoryLink: (category: string) => byRole('link', { name: category }),
  announcementHeading: byRole('heading', { name: 'property.category.general.Announcement' }),

  languagesHeading: byRole('heading', { name: 'property.category.languages' }),
  languagesSelect: byRole('combobox', { name: 'property.category.languages' }),
  jsGeneralSubCategoryHeading: byRole('heading', { name: 'property.category.javascript.General' }),
  scaHeading: byRole('heading', { name: 'property.sca.admin.title' }),

  settingsSearchInput: byRole('searchbox', { name: 'settings.search.placeholder' }),
  searchResultsList: byRole('menu'),
  searchItem: (key: string) => byRole('link', { name: new RegExp(key) }),
  searchClear: byRole('button', { name: 'clear' }),

  externalAnalyzersAndroidHeading: byRole('heading', {
    name: 'property.category.External Analyzers.Android',
  }),
  generalComputeEngineHeading: byRole('heading', {
    name: 'property.category.general.Compute Engine',
  }),
};

describe('Global Settings', () => {
  it('renders categories list and definitions', async () => {
    const user = userEvent.setup();
    renderSettingsApp();

    const globalCategories = [
      'property.category.general',
      'property.category.languages',
      'property.category.External Analyzers',
      'settings.new_code_period.category',
      'property.category.almintegration',
    ];

    expect(
      await ui.categoryLink(globalCategories[0]).find(undefined, { timeout: 10000 }),
    ).toBeInTheDocument();
    globalCategories.forEach((name) => {
      expect(ui.categoryLink(name).get()).toBeInTheDocument();
    });

    // Visible only for project
    expect(
      ui.categoryLink('settings.pr_decoration.binding.category').query(),
    ).not.toBeInTheDocument();

    expect(await ui.announcementHeading.find()).toBeInTheDocument();

    // Navigating to Languages category
    await user.click(await ui.categoryLink('property.category.languages').find());
    expect(await ui.languagesHeading.find()).toBeInTheDocument();
  });

  it('renders Language category and can select any language', async () => {
    const user = userEvent.setup();
    renderSettingsApp();

    // Navigating to Languages category
    await user.click(await ui.categoryLink('property.category.languages').find());
    expect(await ui.languagesHeading.find()).toBeInTheDocument();

    await user.click(ui.languagesSelect.get());
    await user.click(byText('property.category.javascript').get());

    expect(await ui.jsGeneralSubCategoryHeading.find()).toBeInTheDocument();
  });

  it('renders Advanced Security category', async () => {
    const user = userEvent.setup();
    entitlementsMock.data.purchasableFeatures = [
      { featureKey: 'sca', isAvailable: true, isEnabled: false },
    ];
    renderSettingsApp();

    // Navigating to Advanced Security category
    await user.click(await ui.categoryLink('property.category.Advanced Security').find());

    expect(await ui.scaHeading.find()).toBeInTheDocument();

    await user.click(ui.settingsSearchInput.get());
    await user.type(ui.settingsSearchInput.get(), 'global');
    expect(ui.searchItem('sonar.sca.enabled').query()).not.toBeInTheDocument();
    await user.type(ui.settingsSearchInput.get(), 'sca');
    expect(ui.searchItem('sonar.sca.enabled').query()).not.toBeInTheDocument();
  });

  it('can search definitions by name or key', async () => {
    const user = userEvent.setup();
    renderSettingsApp();

    expect(await ui.settingsSearchInput.find()).toBeInTheDocument();

    // List popup should be closed if input is empty
    await user.click(ui.settingsSearchInput.get());
    expect(ui.searchResultsList.query()).not.toBeInTheDocument();

    // Should shot 'no results' based on input value
    await user.type(ui.settingsSearchInput.get(), 'asdjasnd');
    expect(ui.searchResultsList.get()).toBeInTheDocument();
    expect(within(ui.searchResultsList.get()).getByText('no_results')).toBeInTheDocument();
    await user.click(ui.searchClear.get());

    // Should show results based on input value
    const searchResultsKeys = [
      'sonar.announcement.message',
      'sonar.ce.parallelProjectTasks',
      'sonar.androidLint.reportPaths',
    ];

    await user.type(ui.settingsSearchInput.get(), 'an');
    searchResultsKeys.forEach((key) => {
      expect(ui.searchItem(key).get()).toBeInTheDocument();
    });
    expect(ui.searchItem('sonar.javascript.globals').query()).not.toBeInTheDocument();

    // Navigating through keyboard
    await user.keyboard(`{${KeyboardKeys.DownArrow}}`);
    await user.keyboard(`{${KeyboardKeys.UpArrow}}`);
    await user.keyboard(`{${KeyboardKeys.DownArrow}}`);
    await user.keyboard(`{${KeyboardKeys.Enter}}`);

    expect(await ui.externalAnalyzersAndroidHeading.find()).toBeInTheDocument();

    // Navigating through link
    await user.click(ui.searchClear.get());
    await user.type(ui.settingsSearchInput.get(), 'an');
    await user.click(ui.searchItem(searchResultsKeys[1]).get());

    expect(await ui.generalComputeEngineHeading.find()).toBeInTheDocument();
  });

  it('can open mode and see custom implementation', async () => {
    const user = userEvent.setup();
    renderSettingsApp();

    await user.click(await ui.categoryLink('settings.mode.title').find());
    expect(byRole('radio', { name: /settings.mode.standard/ }).get()).toBeInTheDocument();
  });
});

describe('Project Settings', () => {
  it('renders categories list and definitions', async () => {
    const user = userEvent.setup();
    renderSettingsApp(mockComponent(), { featureList: [Feature.BranchSupport] });

    const projectCategories = [
      'property.category.general',
      'property.category.languages',
      'property.category.External Analyzers',
      'settings.pr_decoration.binding.category',
    ];

    expect(await ui.categoryLink(projectCategories[0]).find()).toBeInTheDocument();
    projectCategories.forEach((name) => {
      expect(ui.categoryLink(name).get()).toBeInTheDocument();
    });

    // Visible only for global settings
    expect(ui.categoryLink('property.category.almintegration').query()).not.toBeInTheDocument();

    expect(await ui.announcementHeading.find()).toBeInTheDocument();

    // Navigating to Languages category
    await user.click(await ui.categoryLink('property.category.languages').find());
    expect(await ui.languagesHeading.find()).toBeInTheDocument();
  });
});

function renderSettingsApp(component?: Component, context: RenderContext = {}) {
  const path = component ? 'project' : 'admin';
  const wrapperRoutes = () => <Route path={path}>{routes()}</Route>;
  const params: [string, typeof routes, RenderContext] = [
    `${path}/settings`,
    wrapperRoutes,
    context,
  ];

  return component
    ? renderAppWithComponentContext(...params, { component })
    : renderAppRoutes(...params);
}
