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

import { cssVar } from '@sonarsource/echoes-react';
import { renderWithContext } from '../../../helpers/test-utils';
import { byRole, byText } from '../../../helpers/testSelector';
import { OnboardingProgressDonut } from '../OnboardingProgressDonut';

const ui = {
  // The react-intl mock renders the label as `<id>.<value>`.
  label: (value: number) => byText(`onboarding_dashboard.percent.${value}`),
  ring: byRole('img'),
};

it('does not render the percentage unless asked', () => {
  renderWithContext(<OnboardingProgressDonut value={42} />);

  expect(ui.label(42).query()).not.toBeInTheDocument();
  // The ring still announces the percentage, so the value is never lost.
  expect(ui.ring.get()).toHaveAccessibleName('onboarding_dashboard.percent.42');
});

it('keeps the percentage compact by default, so it fits the smaller page-header ring', () => {
  renderWithContext(<OnboardingProgressDonut showLabel value={100} />);

  expect(ui.label(100).get()).toHaveStyle({
    font: cssVar('typography-text-default-semi-bold'),
  });
});

it('renders the percentage prominently when the ring is large enough for it', () => {
  renderWithContext(<OnboardingProgressDonut hasProminentLabel showLabel value={100} />);

  expect(ui.label(100).get()).toHaveStyle({ font: cssVar('typography-heading-medium') });
});
