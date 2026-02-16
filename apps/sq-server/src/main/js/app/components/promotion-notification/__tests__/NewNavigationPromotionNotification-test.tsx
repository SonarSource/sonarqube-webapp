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
import { useFlags } from '~adapters/helpers/feature-flags';
import { byRole, byText } from '~shared/helpers/testSelector';
import { mockAppState } from '~sq-server-commons/helpers/testMocks';
import { renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
import {
  NEW_NAVIGATION_PROMOTION_DISMISSED_KEY,
  NewNavigationPromotionNotification,
} from '../NewNavigationPromotionNotification';

jest.mock(
  '~adapters/helpers/feature-flags',
  () =>
    ({
      ...jest.requireActual('~adapters/helpers/feature-flags'),
      useFlags: jest.fn(),
    }) as typeof import('~adapters/helpers/feature-flags'),
);

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();

  jest.mocked(useFlags).mockReturnValue({
    frontEndEngineeringEnableSidebarNavigation: true,
  } as unknown as ReturnType<typeof useFlags>);
});

it('should not render when feature flag is disabled', () => {
  jest.mocked(useFlags).mockReturnValue({
    frontEndEngineeringEnableSidebarNavigation: false,
  } as unknown as ReturnType<typeof useFlags>);

  renderNewNavigationPromotionNotification();

  expect(byText('promotion.new_navigation.title').query()).not.toBeInTheDocument();
});

it('should not render if previously dismissed', () => {
  localStorage.setItem(NEW_NAVIGATION_PROMOTION_DISMISSED_KEY, JSON.stringify(true));

  renderNewNavigationPromotionNotification();

  expect(byText('promotion.new_navigation.title').query()).not.toBeInTheDocument();
});

it('should render when feature flag is enabled and not dismissed', () => {
  renderNewNavigationPromotionNotification();

  expect(byText('promotion.new_navigation.title').get()).toBeInTheDocument();
  expect(byText('promotion.new_navigation.content').get()).toBeInTheDocument();
  expect(byRole('button', { name: 'promotion.new_navigation.got_it' }).get()).toBeInTheDocument();

  expect(
    byRole('link', { name: 'promotion.new_navigation.go_to_appearance' }).get(),
  ).toBeInTheDocument();
});

it('should permanently dismiss when clicking "Got it"', async () => {
  const user = userEvent.setup();

  renderNewNavigationPromotionNotification();

  expect(byText('promotion.new_navigation.title').get()).toBeInTheDocument();

  const gotItButton = byRole('button', { name: 'promotion.new_navigation.got_it' }).get();

  await user.click(gotItButton);

  expect(byText('promotion.new_navigation.title').query()).not.toBeInTheDocument();
  expect(localStorage.getItem(NEW_NAVIGATION_PROMOTION_DISMISSED_KEY)).toBe(JSON.stringify(true));
});

it('should temporarily dismiss when clicking "Go to Appearance"', async () => {
  const user = userEvent.setup();

  renderNewNavigationPromotionNotification();

  expect(byText('promotion.new_navigation.title').get()).toBeInTheDocument();

  const goToAppearanceButton = byRole('link', {
    name: 'promotion.new_navigation.go_to_appearance',
  }).get();

  await user.click(goToAppearanceButton);

  expect(byText('promotion.new_navigation.title').query()).not.toBeInTheDocument();
  expect(localStorage.getItem(NEW_NAVIGATION_PROMOTION_DISMISSED_KEY)).toBeNull();
});

it('should not render when on account appearance page', () => {
  renderNewNavigationPromotionNotification('/account/appearance');

  expect(byText('promotion.new_navigation.title').query()).not.toBeInTheDocument();
});

it('should not render when force old navigation is set', () => {
  renderNewNavigationPromotionNotification('/', {
    appState: mockAppState({ settings: { 'sonar.ui.forceOldNavigation': 'true' } }),
  });

  expect(byText('promotion.new_navigation.title').query()).not.toBeInTheDocument();
});

function renderNewNavigationPromotionNotification(path = '/', context = {}) {
  return renderComponent(<NewNavigationPromotionNotification />, path, context);
}
