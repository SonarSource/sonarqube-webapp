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

import { matchers } from '@emotion/jest';
import { cssVar, type EchoesDesignTokens } from '@sonarsource/echoes-react';
import { screen } from '@testing-library/react';
import { IntlShape } from 'react-intl';
import { FCProps } from '../../../../types/misc';
import { render } from '../../../helpers/testUtils';
import { DismissableFlagMessage, FlagMessage, Variant } from '../FlagMessage';

expect.extend(matchers);

jest.mock(
  'react-intl',
  () =>
    ({
      ...jest.requireActual('react-intl'),
      useIntl: () => ({
        formatMessage: ({ id }: { id: string }, values = {}) =>
          [id, ...Object.values(values)].join('.'),
      }),
    }) as IntlShape,
);

it.each<[Variant, EchoesDesignTokens]>([
  ['error', 'color-border-danger-weak'],
  ['warning', 'color-border-warning-weak'],
  ['success', 'color-border-success-weak'],
  ['info', 'color-border-info-weak'],
])('should render the semantic border for "%s" variant', (variant, borderColor) => {
  renderFlagMessage({ variant });

  expect(screen.getByRole('status')).toHaveStyleRule(
    'border',
    `${cssVar('border-width-default')} solid ${cssVar(borderColor)}`,
  );
  expect(screen.getByText('This is an error!')).toBeInTheDocument();
});

it('should render Dismissable flag message properly', () => {
  const dismissFunc = jest.fn();
  render(<DismissableFlagMessage onDismiss={dismissFunc} role="status" variant="error" />);
  const item = screen.getByRole('status');
  expect(item).toBeInTheDocument();
  const dismissButton = screen.getByRole('button');
  expect(dismissButton).toBeInTheDocument();
  dismissButton.click();
  expect(dismissFunc).toHaveBeenCalled();
});

function renderFlagMessage(props: Partial<FCProps<typeof FlagMessage>> = {}) {
  return render(
    <FlagMessage role="status" variant="error" {...props}>
      This is an error!
    </FlagMessage>,
  );
}
