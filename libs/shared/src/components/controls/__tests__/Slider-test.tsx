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

it('does not render per-step labels, only the optional start/end labels', () => {
  setup({ endLabel: 'All Recommended issues', startLabel: 'Only blockers', value: 'MEDIUM' });

  expect(screen.getByText('Only blockers')).toBeVisible();
  expect(screen.getByText('All Recommended issues')).toBeVisible();
  STEPS.forEach((step) => {
    expect(screen.queryByText(step.label)).not.toBeInTheDocument();
  });
});

it('moves to the next step and calls onChange on ArrowRight', async () => {
  const onChange = jest.fn();
  const { user } = setup({ onChange, value: 'MEDIUM' });

  const thumb = screen.getByRole('slider');
  thumb.focus();
  await user.keyboard('{ArrowRight}');

  expect(onChange).toHaveBeenCalledWith('HIGH');
});

it('moves to the previous step and calls onChange on ArrowLeft', async () => {
  const onChange = jest.fn();
  const { user } = setup({ onChange, value: 'MEDIUM' });

  const thumb = screen.getByRole('slider');
  thumb.focus();
  await user.keyboard('{ArrowLeft}');

  expect(onChange).toHaveBeenCalledWith('LOW');
});

it('does not go below the first step or above the last one', async () => {
  const onChange = jest.fn();
  const { user } = setup({ onChange, value: 'INFO' });

  const thumb = screen.getByRole('slider');
  thumb.focus();
  await user.keyboard('{ArrowLeft}');

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

function setup(props: Partial<ComponentProps<typeof Slider>> = {}) {
  return renderWithContext(<Slider onChange={jest.fn()} steps={STEPS} value="MEDIUM" {...props} />);
}
