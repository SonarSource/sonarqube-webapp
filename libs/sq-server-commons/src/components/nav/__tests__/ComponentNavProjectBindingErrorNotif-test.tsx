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
import React from 'react';
import { validateProjectAlmBinding } from '../../../api/alm-settings';
import { mockComponent } from '../../../helpers/mocks/component';
import { renderComponent } from '../../../helpers/testReactTestingUtils';
import { Feature } from '../../../types/features';
import ComponentNavProjectBindingErrorNotif, {
  ComponentNavProjectBindingErrorNotifProps,
} from '../ComponentNavProjectBindingErrorNotif';

jest.mock('~sq-server-commons/api/alm-settings', () => {
  return {
    deleteProjectAlmBinding: jest.fn().mockResolvedValue(undefined),
    validateProjectAlmBinding: jest
      .fn()
      .mockResolvedValue(
        jest
          .requireActual<
            typeof import('~sq-server-commons/helpers/mocks/alm-settings')
          >('~sq-server-commons/helpers/mocks/alm-settings')
          .mockProjectAlmBindingConfigurationErrors(),
      ),
  };
});

beforeEach(() => {
  jest.clearAllMocks();
});

it('should not show a link if use is not allowed', async () => {
  renderComponentNavProjectBindingErrorNotif({
    component: mockComponent({ configuration: { showSettings: false } }),
  });
  expect(
    await screen.findByText(/component_navigation.pr_deco.action.contact_project_admin/),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole('link', {
      name: 'component_navigation.pr_deco.action.check_project_settings',
    }),
  ).not.toBeInTheDocument();
});

it('should show a link if use is allowed', async () => {
  renderComponentNavProjectBindingErrorNotif({
    component: mockComponent({ configuration: { showSettings: true } }),
  });
  expect(
    await screen.findByRole('link', {
      name: 'component_navigation.pr_deco.action.check_project_settings',
    }),
  ).toBeInTheDocument();
});

it('should only call the binding validation API once across re-renders', async () => {
  // Regression guard: the old code called validateProjectAlmBinding inside a useEffect
  // whose dependency array included hasFeature — a function recreated on every render.
  // Any parent re-render therefore triggered a new API call. The fix moves to
  // useValidateProjectAlmBindingQuery (staleTime: NEVER), so remounts and re-renders
  // are served from cache without a network round-trip.
  function RerenderWrapper() {
    const [count, setCount] = React.useState(0);
    return (
      <>
        <button
          onClick={() => {
            setCount((n) => n + 1);
          }}
          type="button"
        >
          trigger rerender {count}
        </button>
        <ComponentNavProjectBindingErrorNotif component={mockComponent()} />
      </>
    );
  }

  const user = userEvent.setup();
  renderComponent(<RerenderWrapper />, '', { featureList: [Feature.BranchSupport] });

  expect(
    await screen.findByText(/component_navigation.pr_deco.action.contact_project_admin/),
  ).toBeInTheDocument();
  expect(validateProjectAlmBinding).toHaveBeenCalledTimes(1);

  await user.click(screen.getByRole('button', { name: /trigger rerender/ }));

  expect(validateProjectAlmBinding).toHaveBeenCalledTimes(1);
});

function renderComponentNavProjectBindingErrorNotif(
  props: Partial<ComponentNavProjectBindingErrorNotifProps> = {},
) {
  return renderComponent(
    <ComponentNavProjectBindingErrorNotif component={mockComponent()} {...props} />,
    '',
    { featureList: [Feature.BranchSupport] },
  );
}
