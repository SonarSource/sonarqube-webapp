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
import { ComponentProps, ReactNode } from 'react';
import { renderWithContext } from '../../../helpers/test-utils';
import { RuleStatus } from '../../../types/rules';
import { RuleStatusBadge } from '../RuleStatusBadge';

jest.mock('@sonarsource/echoes-react', () => ({
  ...jest.requireActual<typeof import('@sonarsource/echoes-react')>('@sonarsource/echoes-react'),
  Badge: ({ children, variety }: { children: ReactNode; variety: string }) => (
    <span data-testid="mocked-badge" data-variety={variety}>
      {children}
    </span>
  ),
  Tooltip: ({ children }: { children: ReactNode }) => children,
}));

it('should display beta badge', () => {
  setupWithProps({
    rule: { status: RuleStatus.Beta },
  });

  expect(screen.getByText('rules.status.BETA')).toBeVisible();
  expect(screen.getByTestId('mocked-badge')).toHaveAttribute('data-variety', 'info');
});

it.each([
  [RuleStatus.Deprecated, 'rules.status.DEPRECATED'],
  [RuleStatus.Removed, 'rules.status.REMOVED'],
])('should display %s badge with danger sentiment', (status, label) => {
  setupWithProps({
    rule: { status },
  });

  expect(screen.getByText(label)).toBeVisible();
  expect(screen.getByTestId('mocked-badge')).toHaveAttribute('data-variety', 'danger');
});

it('shoud not display badge unknown status', () => {
  setupWithProps({
    rule: { status: 'UNKNOWN' },
  });
  expect(screen.queryByText('rules.status.UNKNOWN')).not.toBeInTheDocument();
});

function setupWithProps(props: ComponentProps<typeof RuleStatusBadge>) {
  return renderWithContext(<RuleStatusBadge rule={props.rule} />);
}
