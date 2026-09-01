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

import { toast } from '@sonarsource/echoes-react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentQualifier } from '~shared/types/component';
import {
  getReportStatus,
  subscribeToEmailReport,
  unsubscribeFromEmailReport,
} from '~sq-server-commons/api/component-report';
import { mockBranch } from '~sq-server-commons/helpers/mocks/branch-like';
import { mockComponent } from '~sq-server-commons/helpers/mocks/component';
import { mockComponentReportStatus } from '~sq-server-commons/helpers/mocks/component-report';
import {
  mockAppState,
  mockCurrentUser,
  mockLoggedInUser,
} from '~sq-server-commons/helpers/testMocks';
import { renderApp } from '~sq-server-commons/helpers/testReactTestingUtils';
import { ComponentReportActions } from '../ComponentReportActions';

jest.mock('~sq-server-commons/api/component-report', () => ({
  ...jest.requireActual('~sq-server-commons/api/component-report'),
  getReportStatus: jest
    .fn()
    .mockResolvedValue(
      jest
        .requireActual('~sq-server-commons/helpers/mocks/component-report')
        .mockComponentReportStatus(),
    ),
  subscribeToEmailReport: jest.fn().mockResolvedValue(undefined),
  unsubscribeFromEmailReport: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('~sq-server-commons/helpers/system', () => ({
  ...jest.requireActual('~sq-server-commons/helpers/system'),
  getBaseUrl: jest.fn().mockReturnValue('baseUrl'),
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(toast, 'success');
});

it('should not render anything when no status', async () => {
  jest.mocked(getReportStatus).mockRejectedValueOnce('Nope');

  renderComponentReportActions();

  // Loading
  expect(screen.queryByRole('button')).not.toBeInTheDocument();

  await waitFor(() => {
    expect(getReportStatus).toHaveBeenCalled();
  });

  // No status
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});

it('should render disabled options when branch is purgeable', async () => {
  renderComponentReportActions({
    branch: mockBranch({ excludedFromPurge: false }),
  });

  const user = userEvent.setup();

  await waitFor(() => {
    expect(getReportStatus).toHaveBeenCalled();
  });

  const button = screen.getByRole('button', { name: /component_regulatory_report\.dropdown/i });
  expect(button).toBeInTheDocument();
  await user.click(button);
  expect(
    screen.getByRole('menuitem', {
      name: 'component_regulatory_report.download component_regulatory_report.download.help_text',
    }),
  ).toHaveAttribute('aria-disabled', 'true');
  expect(
    screen.getByRole('menuitem', {
      name: 'component_report.subscribe_x.report.frequency.',
    }),
  ).toHaveAttribute('aria-disabled', 'true');
  expect(
    screen.getByRole('menuitem', {
      name: 'component_report.download.qualifier.TRK component_report.download.help_text',
    }),
  ).toHaveAttribute('aria-disabled', 'true');
});

it('should not render anything without governance', () => {
  renderComponentReportActions({ appState: mockAppState({ qualifiers: [] }) });

  expect(getReportStatus).not.toHaveBeenCalled();

  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});

it('should allow user to (un)subscribe', async () => {
  jest
    .mocked(getReportStatus)
    .mockResolvedValueOnce(mockComponentReportStatus({ globalFrequency: 'monthly' }))
    .mockResolvedValueOnce(
      mockComponentReportStatus({
        subscribed: true,
        globalFrequency: 'monthly',
      }),
    );

  const user = userEvent.setup();
  const component = mockComponent();
  const branch = mockBranch();

  renderComponentReportActions({
    component,
    branch,
    currentUser: mockLoggedInUser({ email: 'igot@nEmail.address' }),
  });

  expect(getReportStatus).toHaveBeenCalledWith(component.key, branch.name);

  const button = await screen.findByRole('button', {
    name: /component_regulatory_report\.dropdown/i,
  });
  expect(button).toBeInTheDocument();
  await user.click(button);

  // Subscribe!
  const subscribeButton = screen.getByText('component_report.subscribe_x.report.frequency.monthly');
  expect(subscribeButton).toBeInTheDocument();

  await user.click(subscribeButton);

  expect(subscribeToEmailReport).toHaveBeenCalledWith(component.key, branch.name);
  expect(toast.success).toHaveBeenLastCalledWith({
    description: 'component_report.subscribe_x_success.report.frequency.monthly.qualifier.trk',
  });

  // And unsubscribe!
  await user.click(button);

  const unsubscribeButton = screen.getByText(
    'component_report.unsubscribe_x.report.frequency.monthly',
  );
  expect(unsubscribeButton).toBeInTheDocument();

  await user.click(unsubscribeButton);

  expect(unsubscribeFromEmailReport).toHaveBeenCalledWith(component.key, branch.name);
  expect(toast.success).toHaveBeenLastCalledWith({
    description: 'component_report.unsubscribe_x_success.report.frequency.monthly.qualifier.trk',
  });
});

it('should prevent user to subscribe if no email', async () => {
  const user = userEvent.setup();

  renderComponentReportActions({
    currentUser: mockLoggedInUser({ email: undefined }),
  });

  await user.click(
    await screen.findByRole('button', {
      name: /component_regulatory_report\.dropdown/i,
    }),
  );

  const subscribeButton = screen.getByRole('menuitem', {
    name: 'component_report.unsubscribe_x.report.frequency.monthly',
  });
  expect(subscribeButton).toBeInTheDocument();
  expect(subscribeButton).toHaveAttribute('aria-disabled', 'true');
});

it('should link to report settings from the success toast when the user can administer the report', async () => {
  jest
    .mocked(getReportStatus)
    .mockResolvedValueOnce(
      mockComponentReportStatus({ canAdmin: true, globalFrequency: 'monthly' }),
    );

  const user = userEvent.setup();
  const component = mockComponent({ key: 'my-app', qualifier: ComponentQualifier.Application });

  renderComponentReportActions({
    component,
    currentUser: mockLoggedInUser({ email: 'igot@nEmail.address' }),
  });

  await user.click(
    await screen.findByRole('button', { name: /component_regulatory_report\.dropdown/i }),
  );
  await user.click(screen.getByText('component_report.subscribe_x.report.frequency.monthly'));

  const link = await screen.findByRole('link', {
    name: 'component_report.subscribe_x_success_action',
  });
  expect(link).toHaveAttribute('href', '/project/admin/application-report?id=my-app');
  expect(toast.success).toHaveBeenCalledTimes(1);
  expect(toast.success).toHaveBeenCalledWith(
    expect.objectContaining({ actions: expect.any(Function) }),
  );
});

it('should show a plain success toast when the user cannot administer the report', async () => {
  jest
    .mocked(getReportStatus)
    .mockResolvedValueOnce(
      mockComponentReportStatus({ canAdmin: false, globalFrequency: 'monthly' }),
    );

  const user = userEvent.setup();
  const component = mockComponent({ key: 'my-app', qualifier: ComponentQualifier.Application });

  renderComponentReportActions({
    component,
    currentUser: mockLoggedInUser({ email: 'igot@nEmail.address' }),
  });

  await user.click(
    await screen.findByRole('button', { name: /component_regulatory_report\.dropdown/i }),
  );
  await user.click(screen.getByText('component_report.subscribe_x.report.frequency.monthly'));

  expect(toast.success).toHaveBeenCalledWith({
    description: 'component_report.subscribe_x_success.report.frequency.monthly.qualifier.app',
  });
  expect(
    screen.queryByRole('link', { name: 'component_report.subscribe_x_success_action' }),
  ).not.toBeInTheDocument();
});

function renderComponentReportActions(
  props: Partial<Parameters<typeof ComponentReportActions>[0]> = {},
) {
  return renderApp(
    '/',
    <ComponentReportActions
      appState={mockAppState({ qualifiers: [ComponentQualifier.Portfolio] })}
      component={mockComponent()}
      currentUser={mockCurrentUser()}
      {...props}
    />,
  );
}
