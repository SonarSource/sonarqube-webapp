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
import { render } from '../../../helpers/test-utils';
import { ProgressStepper } from '../ProgressStepper';

type Step = 1 | 2 | 3 | 4;

const steps: Step[] = [1, 2, 3, 4];
const stepNames: Record<Step, string> = {
  1: 'Add details',
  2: 'Add projects',
  3: 'Set permissions',
  4: 'Review',
};

it('should render every step and mark the active one', () => {
  render(
    <ProgressStepper
      activeStep={2}
      onChange={jest.fn()}
      progress={3}
      stepNames={stepNames}
      steps={steps}
    />,
  );

  Object.values(stepNames).forEach((name) => {
    expect(screen.getByText(name)).toBeInTheDocument();
  });
  expect(screen.getByRole('button', { current: 'step' })).toHaveAccessibleName('Add projects');
});

it('should notify the parent when a reached step is clicked', async () => {
  const onChange = jest.fn();
  const { user } = render(
    <ProgressStepper
      activeStep={2}
      onChange={onChange}
      progress={3}
      stepNames={stepNames}
      steps={steps}
    />,
  );

  await user.click(screen.getByRole('button', { name: 'Add details' }));

  expect(onChange).toHaveBeenCalledWith(1);
});

it('should not be interactive when readOnly', () => {
  render(<ProgressStepper progress={3} readOnly stepNames={stepNames} steps={steps} />);

  expect(screen.queryByRole('button', { current: 'step' })).not.toBeInTheDocument();
});
