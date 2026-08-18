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

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '~shared/helpers/test-utils';
import { DashboardKebabMenu, DashboardKebabMenuItems } from '../DashboardKebabMenu';

describe('DashboardKebabMenu', () => {
  it('renders nothing when isVisible is false', () => {
    renderWithRouter(
      <DashboardKebabMenu
        ariaLabel="more_actions"
        id="dash-kebab-hidden"
        isVisible={false}
        items={<button type="button">Item</button>}
      />,
    );

    expect(screen.queryByRole('button', { name: 'more_actions' })).not.toBeInTheDocument();
  });

  it('renders the trigger and exposes items in the menu', async () => {
    const user = userEvent.setup();
    renderWithRouter(
      <DashboardKebabMenu
        ariaLabel="more_actions"
        id="dash-kebab-visible"
        items={<span>menu_action_one</span>}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'more_actions' }));

    expect(await screen.findByText('menu_action_one')).toBeInTheDocument();
  });

  it('renders all shared actions and triggers callbacks', async () => {
    const user = userEvent.setup();
    const onEditNameDescription = jest.fn();
    const onEditDashboard = jest.fn();
    const onDuplicate = jest.fn();
    const onDownloadSchema = jest.fn();
    const onDelete = jest.fn().mockResolvedValue(undefined);

    renderWithRouter(
      <DashboardKebabMenu
        ariaLabel="more_actions"
        id="dash-kebab-items"
        items={
          <DashboardKebabMenuItems
            dashboardName="My dashboard"
            isBuiltIn={false}
            onDelete={onDelete}
            onDownloadSchema={onDownloadSchema}
            onDuplicate={onDuplicate}
            onEditDashboard={onEditDashboard}
            onEditNameDescription={onEditNameDescription}
          />
        }
      />,
    );

    await user.click(screen.getByRole('button', { name: 'more_actions' }));
    await user.click(
      await screen.findByRole('menuitem', { name: 'dashboard.edit_dashboard_title' }),
    );

    await user.click(screen.getByRole('button', { name: 'more_actions' }));
    await user.click(screen.getByRole('menuitem', { name: 'dashboard.edit_dashboard' }));

    await user.click(screen.getByRole('button', { name: 'more_actions' }));
    await user.click(screen.getByRole('menuitem', { name: 'dashboard.list.actions.duplicate' }));

    await user.click(screen.getByRole('button', { name: 'more_actions' }));
    await user.click(screen.getByRole('menuitem', { name: 'dashboard.download_schema' }));

    await user.click(screen.getByRole('button', { name: 'more_actions' }));
    await user.click(screen.getByRole('menuitem', { name: 'dashboard.list.actions.delete' }));
    expect(
      await screen.findByRole('alertdialog', {
        name: 'dashboard.modal.delete_dashboard.title',
      }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'delete' }));

    expect(onEditNameDescription).toHaveBeenCalledTimes(1);
    expect(onEditDashboard).toHaveBeenCalledTimes(1);
    expect(onDuplicate).toHaveBeenCalledTimes(1);
    expect(onDownloadSchema).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('disables built-in actions when callbacks are provided', async () => {
    const user = userEvent.setup();
    const onDelete = jest.fn();

    renderWithRouter(
      <DashboardKebabMenu
        ariaLabel="more_actions"
        id="dash-kebab-built-in"
        items={
          <DashboardKebabMenuItems
            dashboardName="Built-in"
            isBuiltIn
            onDelete={onDelete}
            onEditDashboard={jest.fn()}
            onEditNameDescription={jest.fn()}
          />
        }
      />,
    );

    await user.click(screen.getByRole('button', { name: 'more_actions' }));

    expect(
      screen.getByRole('menuitem', { name: 'dashboard.edit_dashboard_title' }),
    ).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('menuitem', { name: 'dashboard.edit_dashboard' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    expect(screen.getByRole('menuitem', { name: 'dashboard.list.actions.delete' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );

    await user.click(screen.getByRole('menuitem', { name: 'dashboard.list.actions.delete' }));

    expect(
      screen.queryByRole('alertdialog', { name: 'dashboard.modal.delete_dashboard.title' }),
    ).not.toBeInTheDocument();
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('hides optional actions when callbacks are omitted', async () => {
    const user = userEvent.setup();

    renderWithRouter(
      <DashboardKebabMenu
        ariaLabel="more_actions"
        id="dash-kebab-minimal"
        items={<DashboardKebabMenuItems dashboardName="No actions" isBuiltIn={false} />}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'more_actions' }));

    expect(
      screen.queryByRole('menuitem', { name: 'dashboard.edit_dashboard_title' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('menuitem', { name: 'dashboard.edit_dashboard' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('menuitem', { name: 'dashboard.list.actions.duplicate' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('menuitem', { name: 'dashboard.download_schema' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('menuitem', { name: 'dashboard.list.actions.delete' }),
    ).not.toBeInTheDocument();
  });
});
