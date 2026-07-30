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

import { ComponentProps } from 'react';
import { renderWithContext } from '~shared/helpers/test-utils';
import { byRole, byText } from '~shared/helpers/testSelector';
import { OnboardingDashboardHeader } from '../OnboardingDashboardHeader';

const ui = {
  heading: byRole('heading', { name: 'layout.onboarding_dashboard' }),
  subtitle: byText('onboarding_dashboard.header.subtitle'),
  congratsTitle: byText('onboarding_dashboard.journey.congrats.title'),
  // The progress ring label is rendered by OnboardingProgressDonut as `percent.<value>`.
  progressLabel: (value: number) => byText(`onboarding_dashboard.percent.${value}`),
};

function renderHeader(props: Partial<ComponentProps<typeof OnboardingDashboardHeader>> = {}) {
  return renderWithContext(
    <OnboardingDashboardHeader
      discovered={301}
      overallPct={60}
      showCongrats={false}
      showProgress={false}
      {...props}
    />,
  );
}

it('always renders the heading and subtitle', () => {
  renderHeader();

  expect(ui.heading.get()).toBeInTheDocument();
  expect(ui.subtitle.get()).toBeInTheDocument();
});

it('shows the progress ring only when showProgress is true', () => {
  const { rerender } = renderHeader({ showProgress: false });
  expect(ui.progressLabel(60).query()).not.toBeInTheDocument();

  rerender(
    <OnboardingDashboardHeader
      discovered={301}
      overallPct={60}
      showCongrats={false}
      showProgress
    />,
  );
  expect(ui.progressLabel(60).get()).toBeInTheDocument();
});

it('shows the congratulations callout only when showCongrats is true', () => {
  const { rerender } = renderHeader({ showCongrats: false });
  expect(ui.congratsTitle.query()).not.toBeInTheDocument();

  rerender(
    <OnboardingDashboardHeader
      discovered={301}
      overallPct={60}
      showCongrats
      showProgress={false}
    />,
  );
  expect(ui.congratsTitle.get()).toBeInTheDocument();
});
