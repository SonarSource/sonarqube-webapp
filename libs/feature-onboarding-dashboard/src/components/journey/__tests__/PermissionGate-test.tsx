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

import { Button } from '@sonarsource/echoes-react';
import { useCanCreateProjects } from '~adapters/helpers/useCanCreateProjects';
import { useEditPermissionsUrl } from '~adapters/helpers/useEditPermissionsUrl';
import { renderWithRouter } from '~shared/helpers/test-utils';
import { byRole, byText } from '~shared/helpers/testSelector';
import { PermissionGate } from '../PermissionGate';

const PERMISSIONS_URL = { pathname: '/admin/permissions' };

jest.mock('~adapters/helpers/useCanCreateProjects', () => ({
  useCanCreateProjects: jest.fn(),
}));

jest.mock('~adapters/helpers/useEditPermissionsUrl', () => ({
  useEditPermissionsUrl: jest.fn(),
}));

beforeEach(() => {
  jest.mocked(useCanCreateProjects).mockReturnValue(true);
  jest.mocked(useEditPermissionsUrl).mockReturnValue(PERMISSIONS_URL);
});

const ui = {
  trigger: byRole('button', { name: 'action' }),
  triggerLink: byRole('link', { name: 'action' }),
  wrapper: byText('modal wrapper'),
  permissionDescription: byText('onboarding_dashboard.journey.permission_required.description'),
  permissionCta: byRole('link', { name: 'onboarding_dashboard.journey.permission_required.cta' }),
};

it('renders children wrapping the trigger when the user has permission', () => {
  renderWithRouter(
    <PermissionGate trigger={<Button>action</Button>}>
      {(t) => (
        <>
          <span>modal wrapper</span>
          {t}
        </>
      )}
    </PermissionGate>,
  );

  expect(ui.trigger.get()).toBeInTheDocument();
  expect(ui.wrapper.get()).toBeInTheDocument();
  expect(ui.permissionDescription.query()).not.toBeInTheDocument();
});

it('renders the trigger directly when no children are provided and the user has permission', () => {
  renderWithRouter(<PermissionGate trigger={<Button>action</Button>} />);

  expect(ui.trigger.get()).toBeInTheDocument();
  expect(ui.permissionDescription.query()).not.toBeInTheDocument();
});

it('preserves a navigation trigger as a link when the user has permission', () => {
  renderWithRouter(
    <PermissionGate trigger={<Button to={{ pathname: '/some/path' }}>action</Button>} />,
  );

  expect(ui.triggerLink.get()).toBeInTheDocument();
});

it('shows the permission popover and links to the permissions page when the user lacks permission', async () => {
  jest.mocked(useCanCreateProjects).mockReturnValue(false);
  const { user } = renderWithRouter(<PermissionGate trigger={<Button>action</Button>} />);

  await user.click(ui.trigger.get());

  expect(await ui.permissionDescription.find()).toBeInTheDocument();
  expect(await ui.permissionCta.find()).toHaveAttribute('href', PERMISSIONS_URL.pathname);
});

it('strips the navigation prop from the trigger when the user lacks permission', () => {
  jest.mocked(useCanCreateProjects).mockReturnValue(false);
  renderWithRouter(
    <PermissionGate trigger={<Button to={{ pathname: '/some/path' }}>action</Button>} />,
  );

  // 'to' stripped — renders as a <button>, not an <a>.
  expect(ui.trigger.get()).toBeInTheDocument();
  expect(ui.triggerLink.query()).not.toBeInTheDocument();
});

it('drops interactive props it does not know about when the user lacks permission', async () => {
  const onDoubleClick = jest.fn();

  // A plain button, so the handler is one the gate has no name for — the point is that anything
  // outside the presentational allowlist is dropped, not that this particular prop is.
  const trigger = (
    <button onDoubleClick={onDoubleClick} type="button">
      action
    </button>
  );

  // Positive control: the prop does reach the trigger while the user is permitted, so the
  // assertion below is about the gate stripping it, not about the prop being inert.
  const permitted = renderWithRouter(<PermissionGate trigger={trigger} />);
  await permitted.user.dblClick(ui.trigger.get());
  expect(onDoubleClick).toHaveBeenCalled();
  onDoubleClick.mockClear();
  permitted.unmount();

  jest.mocked(useCanCreateProjects).mockReturnValue(false);
  const { user } = renderWithRouter(<PermissionGate trigger={trigger} />);

  await user.dblClick(ui.trigger.get());

  expect(onDoubleClick).not.toHaveBeenCalled();
});

it('does not fire the trigger onClick when the user lacks permission', async () => {
  jest.mocked(useCanCreateProjects).mockReturnValue(false);
  const onTriggerClick = jest.fn();
  const { user } = renderWithRouter(
    <PermissionGate trigger={<Button onClick={onTriggerClick}>action</Button>} />,
  );

  await user.click(ui.trigger.get());

  expect(onTriggerClick).not.toHaveBeenCalled();
});
