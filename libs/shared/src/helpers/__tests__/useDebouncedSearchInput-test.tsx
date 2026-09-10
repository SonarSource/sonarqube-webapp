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

import { act, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../helpers/test-utils';
import { useDebouncedSearchInput } from '../useDebouncedSearchInput';

// Use the real lodash `debounce` (with timers) instead of the global immediate pass-through mock,
// so the debounce/cancel timing is actually exercised.
jest.mock('lodash', () => jest.requireActual<typeof import('lodash')>('lodash'));

const DEBOUNCE_DELAY = 250;
const LONG_DEBOUNCE_DELAY = 2_147_483_647;

describe('useDebouncedSearchInput', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('keeps an in-progress edit when the external value changes', () => {
    const onChange = jest.fn();
    const { rerender } = render(
      <TestComponent debounceDelay={LONG_DEBOUNCE_DELAY} externalValue="" onChange={onChange} />,
    );

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'project' },
    });
    rerender(
      <TestComponent
        debounceDelay={LONG_DEBOUNCE_DELAY}
        externalValue="other"
        onChange={onChange}
      />,
    );

    expect(screen.getByRole('textbox')).toHaveValue('project');

    act(() => {
      jest.advanceTimersByTime(LONG_DEBOUNCE_DELAY);
    });

    expect(onChange).toHaveBeenCalledWith('project');
  });

  it('debounces valid values and allows clearing', async () => {
    const user = userEvent.setup({ delay: null });
    const onChange = jest.fn();
    render(<TestComponent externalValue="project" onChange={onChange} />);

    await user.clear(screen.getByRole('textbox'));

    act(() => {
      jest.advanceTimersByTime(DEBOUNCE_DELAY);
    });

    expect(onChange).toHaveBeenCalledWith('');
  });

  it('resets the pending edit when a short value is cancelled', async () => {
    const user = userEvent.setup({ delay: null });
    const onChange = jest.fn();
    const { rerender } = render(<TestComponent externalValue="project" onChange={onChange} />);

    await user.clear(screen.getByRole('textbox'));
    await user.type(screen.getByRole('textbox'), 'p');
    rerender(<TestComponent externalValue="" onChange={onChange} />);

    expect(screen.getByRole('textbox')).toHaveValue('');
  });

  it('can reset the external value below the minimum length', async () => {
    const user = userEvent.setup({ delay: null });
    const onChange = jest.fn();
    render(<TestComponent externalValue="project" onChange={onChange} resetBelowMinLength />);

    await user.clear(screen.getByRole('textbox'));
    await user.type(screen.getByRole('textbox'), 'p');

    act(() => {
      jest.advanceTimersByTime(DEBOUNCE_DELAY);
    });

    expect(onChange).toHaveBeenCalledWith('');
  });

  it('syncs later external changes after the cleared search is dropped from the query', async () => {
    const user = userEvent.setup({ delay: null });
    const onChange = jest.fn();
    const { rerender } = render(<TestComponent externalValue="project" onChange={onChange} />);

    await user.clear(screen.getByRole('textbox'));
    act(() => {
      jest.advanceTimersByTime(DEBOUNCE_DELAY);
    });
    rerender(<TestComponent onChange={onChange} />);
    rerender(<TestComponent externalValue="other" onChange={onChange} />);

    expect(screen.getByRole('textbox')).toHaveValue('other');
  });

  it('keeps syncing after a committed write whose external value comes back transformed', () => {
    // The consumer/router may store a transformed value (e.g. a trimmed query), so the external
    // value that returns differs from what onChange was given. The pending marker must still clear
    // so later external changes (browser back, an external reset) are not permanently ignored.
    const onChange = jest.fn();
    const { rerender } = render(<TestComponent externalValue="" onChange={onChange} />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'project ' } });
    act(() => {
      jest.advanceTimersByTime(DEBOUNCE_DELAY);
    });
    expect(onChange).toHaveBeenCalledWith('project ');

    // External value comes back trimmed — different from the 'project ' we sent.
    rerender(<TestComponent externalValue="project" onChange={onChange} />);
    expect(screen.getByRole('textbox')).toHaveValue('project');

    // A later, unrelated external change must still be reflected.
    rerender(<TestComponent externalValue="other" onChange={onChange} />);
    expect(screen.getByRole('textbox')).toHaveValue('other');
  });
});

function TestComponent({
  externalValue,
  onChange,
  debounceDelay,
  resetBelowMinLength,
}: Readonly<{
  debounceDelay?: number;
  externalValue?: string;
  onChange: (value: string) => void;
  resetBelowMinLength?: boolean;
}>) {
  const [value, handleChange] = useDebouncedSearchInput({
    debounceDelay,
    onChange,
    resetBelowMinLength,
    value: externalValue,
  });
  return (
    <input
      onChange={(event) => {
        handleChange(event.currentTarget.value);
      }}
      type="text"
      value={value}
    />
  );
}
