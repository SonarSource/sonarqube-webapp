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

import { act, screen } from '@testing-library/react';
import * as storage from '../../../helpers/storage';
import { renderWithContext } from '../../../helpers/test-utils';
import {
  DISMISSED_CALLOUT_STORAGE_KEY,
  DismissableMessageCallout,
  DismissableMessageCalloutProps,
} from '../DismissableMessageCallout';

jest.mock('../../../helpers/storage', () => ({
  get: jest.fn(),
  save: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

it('should render the callout when not dismissed', () => {
  jest.mocked(storage.get).mockReturnValue(null);

  renderDismissableMessageCallout();

  expect(screen.getByText('Test message')).toBeInTheDocument();
});

it('should not render the callout when already dismissed', () => {
  jest.mocked(storage.get).mockReturnValue('true');

  renderDismissableMessageCallout();

  expect(screen.queryByText('Test message')).not.toBeInTheDocument();
});

it('should dismiss the callout when dismiss button is clicked', async () => {
  jest.mocked(storage.get).mockReturnValue(null);

  const { user } = renderDismissableMessageCallout();

  expect(screen.getByText('Test message')).toBeInTheDocument();

  const dismissButton = screen.getByRole('button', { name: 'message_callout.dismiss' });
  await user.click(dismissButton);

  expect(storage.save).toHaveBeenCalledWith(`${DISMISSED_CALLOUT_STORAGE_KEY}.test-alert`, 'true');

  jest.mocked(storage.get).mockReturnValue('true');
  act(() => {
    globalThis.dispatchEvent(
      new StorageEvent('storage', {
        key: `${DISMISSED_CALLOUT_STORAGE_KEY}.test-alert`,
        newValue: 'true',
        oldValue: null,
      }),
    );
  });

  expect(screen.queryByText('Test message')).not.toBeInTheDocument();
});

function renderDismissableMessageCallout(props: Partial<DismissableMessageCalloutProps> = {}) {
  return renderWithContext(
    <DismissableMessageCallout alertKey="test-alert" variety="info" {...props}>
      Test message
    </DismissableMessageCallout>,
  );
}
