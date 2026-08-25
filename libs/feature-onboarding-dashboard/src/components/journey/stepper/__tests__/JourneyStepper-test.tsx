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

import { renderWithContext } from '~shared/helpers/test-utils';
import { byRole, byText } from '~shared/helpers/testSelector';
import { JourneyLevel, JourneyState, JourneyStep } from '../../../../types/types';
import { JourneyStepper } from '../JourneyStepper';

const ui = {
  binding: byRole('button', { name: 'onboarding_dashboard.journey.step.binding.title' }),
  repositories: byRole('button', { name: 'onboarding_dashboard.journey.step.repositories.title' }),
  projects: byRole('button', { name: 'onboarding_dashboard.journey.step.projects.title' }),
  bindingBound: byText('onboarding_dashboard.journey.step.binding.bound'),
  bindingUnbound: byText('onboarding_dashboard.journey.step.binding.unbound'),
  // The count secondary line: formatMessage joins id + primitives with dots → `...count.<done>.<total>`.
  countLabel: (done: number, total: number) =>
    byText(`onboarding_dashboard.journey.step.count.${done}.${total}`),
};

function mockState(overrides: Partial<JourneyState> = {}): JourneyState {
  return {
    activeStep: JourneyStep.Binding,
    analyze: { notImported: 0, notScanned: 0 },
    analyzed: 0,
    analyzedPct: 0,
    discovered: 0,
    imported: 0,
    importedPct: 0,
    isBound: false,
    level: JourneyLevel.Unbound,
    notYetImported: 0,
    overallPct: 0,
    totalProjects: 0,
    ...overrides,
  };
}

function renderStepper(props: Partial<React.ComponentProps<typeof JourneyStepper>> = {}) {
  return renderWithContext(
    <JourneyStepper
      onSelectStep={jest.fn()}
      selectedStep={JourneyStep.Binding}
      state={mockState()}
      {...props}
    />,
  );
}

it('renders the three step cards', () => {
  renderStepper();

  expect(ui.binding.get()).toBeInTheDocument();
  expect(ui.repositories.get()).toBeInTheDocument();
  expect(ui.projects.get()).toBeInTheDocument();
});

it('renders the unbound presentation when the org is not bound', () => {
  renderStepper({
    state: mockState({ isBound: false }),
  });

  // Binding card shows the unbound caption.
  expect(ui.bindingUnbound.get()).toBeInTheDocument();
  expect(ui.bindingBound.query()).not.toBeInTheDocument();

  // Repositories card falls back to a numeric "0" visual; neither the repositories nor the
  // projects card shows a count secondary line while unbound.
  expect(byText('0').get()).toBeInTheDocument();
  expect(ui.countLabel(0, 0).query()).not.toBeInTheDocument();
});

it('renders bound counts and progress captions when the org is bound', () => {
  renderStepper({
    state: mockState({
      analyzed: 12,
      analyzedPct: 30,
      discovered: 120,
      imported: 48,
      importedPct: 40,
      isBound: true,
      level: JourneyLevel.Imported,
      totalProjects: 40,
    }),
  });

  expect(ui.bindingBound.get()).toBeInTheDocument();
  // Repositories caption: imported / discovered. Projects caption: analyzed / total.
  expect(ui.countLabel(48, 120).get()).toBeInTheDocument();
  expect(ui.countLabel(12, 40).get()).toBeInTheDocument();
});

it('marks the selected step as pressed', () => {
  renderStepper({ selectedStep: JourneyStep.Repositories });

  expect(ui.repositories.get()).toHaveAttribute('aria-pressed', 'true');
  expect(ui.binding.get()).toHaveAttribute('aria-pressed', 'false');
  expect(ui.projects.get()).toHaveAttribute('aria-pressed', 'false');
});

it.each([
  [JourneyStep.Binding, () => ui.binding.get()],
  [JourneyStep.Repositories, () => ui.repositories.get()],
  [JourneyStep.Projects, () => ui.projects.get()],
] as const)('calls onSelectStep with %s when its card is clicked', async (step, getCard) => {
  const onSelectStep = jest.fn();
  const { user } = renderStepper({ onSelectStep });

  await user.click(getCard());

  expect(onSelectStep).toHaveBeenCalledWith<[JourneyStep]>(step);
});
