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

import { renderHook } from '@testing-library/react';
import { PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router-dom';
import {
  getDevopsPlatformWebUrl,
  getImportRepositoriesUrl,
} from '~adapters/helpers/onboarding-actions';
import { getContextWrapper } from '~adapters/helpers/test-utils';
import { OnboardingDevopsPlatform } from '~shared/types/onboarding';
import { JourneyStep, RowActionKind } from '../../../../types/types';
import { DevopsConfigurationRowAction } from '../devopsConfigurationRowActions';
import { DevopsConfigurationRow } from '../devopsConfigurationRows';
import {
  DevopsConfigurationRowActionItem,
  useDevopsConfigurationRowActionItems,
} from '../useDevopsConfigurationRowActionItems';

// Where a configuration's actions lead is product-specific, so both helpers are stubbed here — which
// lets this file assert what an offered entry does and that a missing destination drops it.
jest.mock('~adapters/helpers/onboarding-actions', () => ({
  getDevopsPlatformWebUrl: jest.fn(),
  getImportRepositoriesUrl: jest.fn(),
}));

const IMPORT_URL = { pathname: '/projects/create', search: '?dopSetting=gh-1&mode=github' };
const WEB_URL = 'https://github.com';

const GITHUB_CONFIGURATION: DevopsConfigurationRow = {
  alm: OnboardingDevopsPlatform.Github,
  id: 'gh-1',
  imported: 12,
  key: 'GitHub Main',
  url: 'https://api.github.com',
};

const onGoToStep = jest.fn();

function Wrapper({ children }: Readonly<PropsWithChildren>) {
  const ContextWrapper = getContextWrapper();

  return (
    <MemoryRouter>
      <ContextWrapper>{children}</ContextWrapper>
    </MemoryRouter>
  );
}

function renderRowActionItems(row = GITHUB_CONFIGURATION): DevopsConfigurationRowActionItem[] {
  const { result } = renderHook(() => useDevopsConfigurationRowActionItems(row, { onGoToStep }), {
    wrapper: Wrapper,
  });

  return result.current;
}

// Missing entries throw, so a test asking for one the menu dropped fails here rather than passing.
function activate(items: DevopsConfigurationRowActionItem[], action: DevopsConfigurationRowAction) {
  const item = items.find((candidate) => candidate.action === action);

  if (item?.kind !== RowActionKind.Button) {
    throw new Error(`The menu offers no button entry for ${action}`);
  }

  item.onClick();
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(getImportRepositoriesUrl).mockReturnValue(IMPORT_URL);
  jest.mocked(getDevopsPlatformWebUrl).mockReturnValue(WEB_URL);
});

it('offers every action of a configuration a product can fully act on', () => {
  const items = renderRowActionItems();

  expect(items.map(({ action }) => action)).toEqual([
    DevopsConfigurationRowAction.ImportRepositories,
    DevopsConfigurationRowAction.AnalyzeProjects,
    DevopsConfigurationRowAction.ViewOnPlatform,
  ]);
});

it('sends the import entry to the creation flow scoped to that configuration', () => {
  const items = renderRowActionItems();

  expect(items[0]).toEqual({
    action: DevopsConfigurationRowAction.ImportRepositories,
    kind: RowActionKind.Link,
    to: IMPORT_URL,
  });
  expect(getImportRepositoriesUrl).toHaveBeenCalledWith(
    OnboardingDevopsPlatform.Github,
    GITHUB_CONFIGURATION.id,
  );
});

it('opens the platform in a new tab, naming it in the label', () => {
  const items = renderRowActionItems();

  expect(items[2]).toEqual({
    action: DevopsConfigurationRowAction.ViewOnPlatform,
    isExternal: true,
    kind: RowActionKind.Link,
    labelValues: { platform: 'alm.github' },
    to: WEB_URL,
  });
});

it('hands the user to the projects step instead of analysing anything', () => {
  const items = renderRowActionItems();

  activate(items, DevopsConfigurationRowAction.AnalyzeProjects);

  expect(onGoToStep).toHaveBeenCalledWith(JourneyStep.Projects);
});

it('drops the import entry on the products with nowhere to import from', () => {
  jest.mocked(getImportRepositoriesUrl).mockReturnValue(undefined);

  const actions = renderRowActionItems().map(({ action }) => action);

  // Dropped rather than shown disabled, so the menu never offers a dead end.
  expect(actions).not.toContain(DevopsConfigurationRowAction.ImportRepositories);
  expect(actions).toContain(DevopsConfigurationRowAction.AnalyzeProjects);
});

it('drops the platform entry when the configuration has no web address', () => {
  jest.mocked(getDevopsPlatformWebUrl).mockReturnValue(undefined);

  const actions = renderRowActionItems().map(({ action }) => action);

  expect(actions).not.toContain(DevopsConfigurationRowAction.ViewOnPlatform);
});

it('keeps the step navigation on a product that can do nothing else', () => {
  jest.mocked(getImportRepositoriesUrl).mockReturnValue(undefined);
  jest.mocked(getDevopsPlatformWebUrl).mockReturnValue(undefined);

  // "Analyze projects" needs no product destination, so the menu always has one entry to offer.
  expect(renderRowActionItems().map(({ action }) => action)).toEqual([
    DevopsConfigurationRowAction.AnalyzeProjects,
  ]);
});
