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
import { ComponentProps } from 'react';
import { renderWithContext } from '../../../helpers/test-utils';
import { RuleStatus } from '../../../types/rules';
import { RuleStatusBadge } from '../RuleStatusBadge';

it('should display beta badge', () => {
  setupWithProps({
    rule: { status: RuleStatus.Beta },
  });
  expect(screen.getByText('rules.status.BETA')).toBeVisible();
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
