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
import userEvent from '@testing-library/user-event';
import { render } from '../../helpers/test-utils';
import { useDebouncedValue } from '../useDebouncedValue';

const DEBOUNCE_DELAY = 300;

describe('useDebouncedValue hook', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should update value immediately but debounce the debouncedValue', async () => {
    const user = userEvent.setup({ delay: null });
    renderTestComponent();

    const input = screen.getByRole('textbox');
    await user.type(input, 'test');

    // Value should update immediately for each keystroke
    expect(screen.getByText('Value: "test"')).toBeInTheDocument();
    // Debounced value should not update for each keystroke
    expect(screen.getByText('Debounced: ""')).toBeInTheDocument();

    // After debounce delay, debounced value should be updated
    act(() => {
      jest.advanceTimersByTime(DEBOUNCE_DELAY);
    });
    expect(screen.getByText('Debounced: "test"')).toBeInTheDocument();
  });

  it('should handle clearing the input', async () => {
    const user = userEvent.setup({ delay: null });
    renderTestComponent();

    const input = screen.getByRole('textbox');
    await user.type(input, 'test');
    act(() => {
      jest.advanceTimersByTime(DEBOUNCE_DELAY);
    });
    expect(screen.getByText('Debounced: "test"')).toBeInTheDocument();

    await user.clear(input);
    expect(screen.getByText('Value: ""')).toBeInTheDocument();
    expect(screen.getByText('Debounced: "test"')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(DEBOUNCE_DELAY);
    });
    expect(screen.getByText('Debounced: ""')).toBeInTheDocument();
  });
});

function TestComponent() {
  const [value, debouncedValue, handleValueChange] = useDebouncedValue();

  return (
    <div>
      <input
        onChange={(e) => {
          handleValueChange(e.target.value);
        }}
        type="text"
        value={value}
      />
      <div>Value: &quot;{value}&quot;</div>
      <div>Debounced: &quot;{debouncedValue}&quot;</div>
    </div>
  );
}

function renderTestComponent() {
  return render(<TestComponent />);
}
