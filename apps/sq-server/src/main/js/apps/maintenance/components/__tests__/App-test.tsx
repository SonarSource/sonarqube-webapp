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

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  getMigrationsStatus,
  getSystemStatus,
  migrateDatabase,
} from '~sq-server-commons/api/system';
import { mockLocation } from '~sq-server-commons/helpers/testMocks';
import { renderApp } from '~sq-server-commons/helpers/testReactTestingUtils';
import { byText } from '~sq-server-commons/sonar-aligned/helpers/testSelector';
import { MigrationStatus } from '~sq-server-commons/types/system';
import App from '../App';

jest.mock('~sq-server-commons/api/system', () => ({
  getMigrationsStatus: jest.fn().mockResolvedValue(null),
  getSystemStatus: jest.fn().mockResolvedValue(null),
  migrateDatabase: jest.fn().mockResolvedValue(null),
}));

jest.mock('~sq-server-commons/helpers/system', () => ({
  ...jest.requireActual('~sq-server-commons/helpers/system'),
  getBaseUrl: jest.fn().mockReturnValue('/context'),
}));

const originalLocation = window.location;
const replace = jest.fn();

beforeAll(() => {
  const location = {
    ...window.location,
    replace,
  };
  Object.defineProperty(window, 'location', {
    writable: true,
    value: location,
  });
});

afterAll(() => {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: originalLocation,
  });
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

describe('Maintenance', () => {
  it.each([
    [
      'OFFLINE',
      'maintenance.is_offline',
      'maintenance.sonarqube_is_offline.text',
      { name: 'maintenance.try_again', href: '/context/' },
    ],
    [
      'UP',
      'maintenance.is_up',
      'maintenance.all_systems_opetational',
      { name: 'layout.home', href: '/' },
    ],
    ['STARTING', 'maintenance.is_starting'],
    [
      'DOWN',
      'maintenance.is_down',
      'maintenance.sonarqube_is_down.text',
      { name: 'maintenance.try_again', href: '/context/' },
    ],
    ['DB_MIGRATION_NEEDED', 'maintenance.is_under_maintenance'],
    ['DB_MIGRATION_RUNNING', 'maintenance.is_under_maintenance'],
  ])(
    'should handle "%p" status correctly',
    async (status, heading, body = undefined, linkInfo = undefined) => {
      (getSystemStatus as jest.Mock).mockResolvedValueOnce({ status });
      renderMaintenanceApp();

      const title = await screen.findByRole('heading', { name: heading });
      expect(title).toBeInTheDocument();
      // eslint-disable-next-line jest/no-conditional-in-test
      if (body) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(screen.getByText(body)).toBeInTheDocument();
      }
      // eslint-disable-next-line jest/no-conditional-in-test
      if (linkInfo) {
        const link = screen.getByRole('link', { name: linkInfo.name });
        // eslint-disable-next-line jest/no-conditional-expect
        expect(link).toBeInTheDocument();
        // eslint-disable-next-line jest/no-conditional-expect
        expect(link).toHaveAttribute('href', linkInfo.href);
      }
    },
  );

  it('should poll status', async () => {
    (getSystemStatus as jest.Mock)
      .mockResolvedValueOnce({ status: 'STARTING' })
      .mockResolvedValueOnce({ status: 'DB_MIGRATION_RUNNING' })
      .mockResolvedValueOnce({ status: 'UP' });

    renderMaintenanceApp();

    let title = await screen.findByRole('heading', { name: 'maintenance.is_starting' });
    expect(title).toBeInTheDocument();

    jest.runOnlyPendingTimers();

    title = await screen.findByRole('heading', { name: 'maintenance.is_under_maintenance' });
    expect(title).toBeInTheDocument();

    jest.runOnlyPendingTimers();

    title = await screen.findByRole('heading', { name: 'maintenance.is_up' });
    expect(title).toBeInTheDocument();

    // Should redirect automatically.
    jest.runOnlyPendingTimers();
    expect(replace).toHaveBeenCalledWith('/return/to');
  });

  function renderMaintenanceApp(props: Partial<App['props']> = {}) {
    return renderApp(
      '/',
      <App
        location={mockLocation({ query: { return_to: '/return/to' } })}
        setup={false}
        {...props}
      />,
    );
  }
});

describe('Setup', () => {
  it.each([
    [
      MigrationStatus.noMigration,
      'maintenance.database_is_up_to_date',
      undefined,
      { name: 'layout.home', href: '/' },
    ],
    [
      MigrationStatus.required,
      'maintenance.back_up_database',
      ['maintenance.back_up_database.1', 'maintenance.back_up_database.2'],
    ],
    [
      MigrationStatus.notSupported,
      'maintenance.migration_not_supported',
      ['maintenance.migration_not_supported.text'],
    ],
    [
      MigrationStatus.running,
      'maintenance.database_migration',
      undefined,
      undefined,
      { message: 'MESSAGE', startedAt: '2022-12-01' },
    ],
    [
      MigrationStatus.succeeded,
      'maintenance.database_is_up_to_date',
      undefined,
      { name: 'layout.home', href: '/' },
    ],
    [MigrationStatus.failed, 'maintenance.upgrade_failed', ['maintenance.upgrade_failed.text']],
  ])(
    'should handle "%p" state correctly',
    async (status, heading, bodyText: string[] = [], linkInfo = undefined, payload = undefined) => {
      jest.mocked(getMigrationsStatus).mockResolvedValueOnce({ status, ...payload });
      renderSetupApp();

      const title = await screen.findByRole('heading', { name: heading });
      expect(title).toBeInTheDocument();
      // eslint-disable-next-line jest/no-conditional-in-test
      if (bodyText.length) {
        bodyText.forEach((text) => {
          // eslint-disable-next-line jest/no-conditional-expect
          expect(screen.getByText(text)).toBeInTheDocument();
        });
      }
      // eslint-disable-next-line jest/no-conditional-in-test
      if (payload) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(screen.getByText(payload.message)).toBeInTheDocument();
        // eslint-disable-next-line jest/no-conditional-expect
        expect(screen.getByText('background_tasks.table.started')).toBeInTheDocument();
      }
      // eslint-disable-next-line jest/no-conditional-in-test
      if (linkInfo) {
        const link = screen.getByRole('link', { name: linkInfo.name });
        // eslint-disable-next-line jest/no-conditional-expect
        expect(link).toBeInTheDocument();
        // eslint-disable-next-line jest/no-conditional-expect
        expect(link).toHaveAttribute('href', linkInfo.href);
      }
    },
  );

  it('should handle DB migration', async () => {
    (migrateDatabase as jest.Mock).mockResolvedValueOnce({
      message: 'MESSAGE',
      startedAt: '2022-12-01',
      state: 'MIGRATION_RUNNING',
    });
    jest
      .mocked(getMigrationsStatus)
      .mockResolvedValueOnce({ status: MigrationStatus.required })
      .mockResolvedValueOnce({
        status: MigrationStatus.running,
        completedSteps: 28,
        totalSteps: 42,
        expectedFinishTimestamp: '2027-11-10T13:42:20',
      })
      .mockResolvedValueOnce({ status: MigrationStatus.succeeded });

    renderSetupApp();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    jest.runOnlyPendingTimers();

    let title = await screen.findByRole('heading', { name: 'maintenance.back_up_database' });
    expect(title).toBeInTheDocument();

    expect(screen.getByText('maintenance.back_up_database.1')).toBeInTheDocument();
    expect(screen.getByText('maintenance.back_up_database.2')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'continue' }));

    expect(
      await screen.findByRole('heading', { name: 'maintenance.upgrade_database' }),
    ).toBeInTheDocument();
    expect(screen.getByText('maintenance.upgrade_database.1')).toBeInTheDocument();
    expect(screen.getByText('maintenance.upgrade_database.2')).toBeInTheDocument();
    const link = screen.getByRole('link', {
      name: 'maintenance.upgrade_database.2.link open_in_new_tab',
    });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      'href',
      'https://docs.sonarsource.com/sonarqube/10.0/server-upgrade-and-maintenance/upgrade/roadmap/',
    );

    // Trigger DB migration.
    await user.click(screen.getByRole('button', { name: 'maintenance.upgrade' }));

    const message = await screen.findByText('MESSAGE');
    expect(message).toBeInTheDocument();
    expect(screen.getByText('background_tasks.table.started')).toBeInTheDocument();

    // Trigger refresh; migration running.
    jest.runOnlyPendingTimers();

    title = await screen.findByRole('heading', { name: 'maintenance.database_migration' });
    expect(title).toBeInTheDocument();

    expect(await byText(/maintenance.running.progress/).find()).toBeInTheDocument();

    // Trigger refresh; migration done.
    jest.runOnlyPendingTimers();

    title = await screen.findByRole('heading', { name: 'maintenance.database_is_up_to_date' });
    expect(title).toBeInTheDocument();

    // Should redirect automatically.
    jest.runOnlyPendingTimers();
    expect(replace).toHaveBeenCalledWith('/return/to');
  });

  function renderSetupApp(props: Partial<App['props']> = {}) {
    return renderApp(
      '/',
      <App location={mockLocation({ query: { return_to: '/return/to' } })} setup {...props} />,
    );
  }
});
