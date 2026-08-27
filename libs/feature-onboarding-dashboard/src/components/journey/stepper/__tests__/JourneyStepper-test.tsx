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
  // The donut percentage label, rendered by OnboardingProgressDonut only for unlocked steps.
  donutLabel: (value: number) => byText(`onboarding_dashboard.percent.${value}`),
  // A locked card folds "locked" into its accessible name, so it no longer answers to the bare
  // title. formatMessage joins id + values with dots → `...locked_aria_label.<title>`.
  lockedCard: (titleId: string) =>
    byRole('button', {
      name: `onboarding_dashboard.journey.step.locked_aria_label.${titleId}`,
    }),
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
  // Bound: every step is unlocked, so each card answers to its plain title.
  renderStepper({ state: mockState({ isBound: true }) });

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

  // The repositories and projects cards are locked while unbound: no count secondary line and no
  // progress percentage label.
  expect(ui.countLabel(0, 0).query()).not.toBeInTheDocument();
  expect(ui.donutLabel(0).query()).not.toBeInTheDocument();

  // Locked is spelled out in the accessible name, not left to the lock ring alone, and the cards
  // report themselves as unavailable.
  const repositories = ui.lockedCard('onboarding_dashboard.journey.step.repositories.title').get();
  const projects = ui.lockedCard('onboarding_dashboard.journey.step.projects.title').get();
  expect(repositories).toHaveAttribute('aria-disabled', 'true');
  expect(projects).toHaveAttribute('aria-disabled', 'true');

  // The binding step stays reachable, so its name is untouched.
  expect(ui.binding.get()).toHaveAttribute('aria-disabled', 'false');
  expect(ui.repositories.query()).not.toBeInTheDocument();
  expect(ui.projects.query()).not.toBeInTheDocument();
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

  // Both cards swap the lock visual for a donut carrying their own progress, and become selectable.
  expect(ui.donutLabel(40).get()).toBeInTheDocument();
  expect(ui.donutLabel(30).get()).toBeInTheDocument();
  expect(ui.repositories.get()).toHaveAttribute('aria-disabled', 'false');
  expect(ui.projects.get()).toHaveAttribute('aria-disabled', 'false');
});

it('marks the selected step as pressed', () => {
  renderStepper({ selectedStep: JourneyStep.Repositories, state: mockState({ isBound: true }) });

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
  // Bound: every step is unlocked, so all three cards are selectable.
  const { user } = renderStepper({ onSelectStep, state: mockState({ isBound: true }) });

  await user.click(getCard());

  expect(onSelectStep).toHaveBeenCalledWith<[JourneyStep]>(step);
});
