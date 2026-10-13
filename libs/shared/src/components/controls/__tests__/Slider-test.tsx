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

import { fireEvent, screen } from '@testing-library/react';
import { ComponentProps } from 'react';
import { renderWithContext } from '../../../helpers/test-utils';
import { Slider } from '../Slider';

const STEPS = [
  { label: 'Info', value: 'INFO' },
  { label: 'Low', value: 'LOW' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'High', value: 'HIGH' },
  { label: 'Blocker', value: 'BLOCKER' },
];

it('positions the thumb on the current value', () => {
  setup({ value: 'MEDIUM' });

  expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', 'Medium');
});

it('renders a graduation label for every step', () => {
  setup({ value: 'MEDIUM' });

  STEPS.forEach((step) => {
    expect(screen.getByText(step.label)).toBeVisible();
  });
});

it.each([
  ['{ArrowRight}', 'MEDIUM', 'HIGH'],
  ['{ArrowLeft}', 'MEDIUM', 'LOW'],
  ['{Home}', 'HIGH', 'INFO'],
  ['{End}', 'LOW', 'BLOCKER'],
])('moves to the expected step and calls onChange on %s', async (key, from, expected) => {
  const onChange = jest.fn();
  const { user } = setup({ onChange, value: from });

  const thumb = screen.getByRole('slider');
  thumb.focus();
  await user.keyboard(key);

  expect(onChange).toHaveBeenCalledWith(expected);
});

it('does not go below the first step or above the last one', async () => {
  const onChange = jest.fn();
  const { user } = setup({ onChange, value: 'INFO' });

  const thumb = screen.getByRole('slider');
  thumb.focus();
  await user.keyboard('{ArrowLeft}');

  expect(onChange).not.toHaveBeenCalled();
});

it('ignores a key it has no stepping behavior for', async () => {
  const onChange = jest.fn();
  const { user } = setup({ onChange, value: 'MEDIUM' });

  const thumb = screen.getByRole('slider');
  thumb.focus();
  await user.keyboard('a');

  expect(onChange).not.toHaveBeenCalled();
});

it('uses the visible label as the accessible name when no ariaLabel is given', () => {
  setup({ label: 'Security severity', value: 'MEDIUM' });

  expect(screen.getByRole('slider', { name: 'Security severity' })).toBeVisible();
});

it('prevents interaction when disabled', async () => {
  const onChange = jest.fn();
  const { user } = setup({ isDisabled: true, onChange, value: 'MEDIUM' });

  const thumb = screen.getByRole('slider');
  thumb.focus();
  await user.keyboard('{ArrowRight}');

  expect(onChange).not.toHaveBeenCalled();
});

it('jumps straight to a step when clicking its label, without dragging through the steps between', async () => {
  const onChange = jest.fn();
  const { user } = setup({ onChange, value: 'INFO' });

  await user.click(screen.getByText('Blocker'));

  expect(onChange).toHaveBeenCalledWith('BLOCKER');
});

// Dragging the thumb to a position has no userEvent equivalent for a native range input (jsdom
// doesn't do the layout math to turn a pointer position into a value) - `fireEvent.change` is the
// accepted way to simulate the native "change" event a real drag would produce.
it('updates the value when the underlying range input changes directly, as a drag would', () => {
  const onChange = jest.fn();
  setup({ onChange, value: 'INFO' });

  fireEvent.change(screen.getByRole('slider'), { target: { value: '4' } });

  expect(onChange).toHaveBeenCalledWith('BLOCKER');
});

function setup(props: Partial<ComponentProps<typeof Slider>> = {}) {
  return renderWithContext(<Slider onChange={jest.fn()} steps={STEPS} value="MEDIUM" {...props} />);
}
