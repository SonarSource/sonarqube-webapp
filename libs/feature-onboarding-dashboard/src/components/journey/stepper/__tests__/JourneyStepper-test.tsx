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

import { useOnboardingDevopsConfigurations } from '~adapters/helpers/useOnboardingDevopsConfigurations';
import { renderWithContext } from '~shared/helpers/test-utils';
import { byRole, byText } from '~shared/helpers/testSelector';
import { OnboardingDevopsConfigurations, OnboardingDevopsPlatform } from '~shared/types/onboarding';
import { JourneyLevel, JourneyState, JourneyStep } from '../../../../types/types';
import { JourneyStepper } from '../JourneyStepper';

// Single-binding products report no per-platform split; multi-configuration ones report an entry.
const SINGLE_BINDING_PRODUCT: OnboardingDevopsConfigurations = { byPlatform: undefined };

const MULTI_CONFIGURATION_PRODUCT: OnboardingDevopsConfigurations = {
  byPlatform: [
    { count: 4, platform: OnboardingDevopsPlatform.Github },
    { count: 1, platform: OnboardingDevopsPlatform.Gitlab },
  ],
};

jest.mock('~adapters/helpers/useOnboardingDevopsConfigurations', () => ({
  useOnboardingDevopsConfigurations: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();

  jest.mocked(useOnboardingDevopsConfigurations).mockReturnValue(SINGLE_BINDING_PRODUCT);
});

const REPOSITORIES_TITLE = 'onboarding_dashboard.journey.step.repositories.title';
const PROJECTS_TITLE = 'onboarding_dashboard.journey.step.projects.title';

// formatMessage joins id + values with dots, nested calls included.
function donutCardName(titleId: string, percent: number) {
  return `onboarding_dashboard.journey.step.ring_count_aria_label.onboarding_dashboard.percent.${percent}.${titleId}`;
}

const ui = {
  binding: byRole('button', { name: 'onboarding_dashboard.journey.step.binding.title' }),
  bindingWithCount: (count: number) =>
    byRole('button', {
      name: `onboarding_dashboard.journey.step.ring_count_aria_label.${count}.onboarding_dashboard.journey.step.binding.title`,
    }),
  repositories: (percent = 0) =>
    byRole('button', { name: donutCardName(REPOSITORIES_TITLE, percent) }),
  projects: (percent = 0) => byRole('button', { name: donutCardName(PROJECTS_TITLE, percent) }),
  bindingBound: byText('onboarding_dashboard.journey.step.binding.bound'),
  bindingUnbound: byText('onboarding_dashboard.journey.step.binding.unbound'),
  // The configuration count rendered inside the binding card's ring.
  configuredCount: (count: number) => byText(String(count)),
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
    configured: 0,
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
  renderStepper({ state: mockState({ isBound: true }) });

  expect(ui.binding.get()).toBeInTheDocument();
  expect(ui.repositories().get()).toBeInTheDocument();
  expect(ui.projects().get()).toBeInTheDocument();
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
  const repositories = ui.lockedCard(REPOSITORIES_TITLE).get();
  const projects = ui.lockedCard(PROJECTS_TITLE).get();
  expect(repositories).toHaveAttribute('aria-disabled', 'true');
  expect(projects).toHaveAttribute('aria-disabled', 'true');

  // The binding step stays reachable, so its name is untouched.
  expect(ui.binding.get()).toHaveAttribute('aria-disabled', 'false');
  expect(ui.repositories().query()).not.toBeInTheDocument();
  expect(ui.projects().query()).not.toBeInTheDocument();
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
  expect(ui.repositories(40).get()).toHaveAttribute('aria-disabled', 'false');
  expect(ui.projects(30).get()).toHaveAttribute('aria-disabled', 'false');
});

it('shows the configuration count in the ring on products that hold several configurations', () => {
  jest.mocked(useOnboardingDevopsConfigurations).mockReturnValue(MULTI_CONFIGURATION_PRODUCT);

  renderStepper({ state: mockState({ configured: 5, isBound: true }) });

  // The count is the whole message, so the "Configured" caption would only repeat it — which makes
  // the accessible name the only place left to announce it.
  expect(ui.configuredCount(5).get()).toBeInTheDocument();
  expect(ui.bindingBound.query()).not.toBeInTheDocument();
  expect(ui.bindingUnbound.query()).not.toBeInTheDocument();
  expect(ui.bindingWithCount(5).get()).toBeInTheDocument();
  expect(ui.binding.query()).not.toBeInTheDocument();
});

it('names the count from the overview before the breakdown arrives', () => {
  // An unresolved lookup reports an empty split, never `undefined`, so the card must not flip.
  jest.mocked(useOnboardingDevopsConfigurations).mockReturnValue({ byPlatform: [] });

  renderStepper({ state: mockState({ configured: 5, isBound: true }) });

  expect(ui.configuredCount(5).get()).toBeInTheDocument();
  expect(ui.bindingBound.query()).not.toBeInTheDocument();
});

it('falls back to the unbound caption when such a product has no configuration yet', () => {
  jest.mocked(useOnboardingDevopsConfigurations).mockReturnValue({ byPlatform: [] });

  renderStepper({ state: mockState({ configured: 0, isBound: false }) });

  expect(ui.bindingUnbound.get()).toBeInTheDocument();
  expect(ui.configuredCount(0).query()).not.toBeInTheDocument();
});

it('marks the selected step as pressed', () => {
  renderStepper({ selectedStep: JourneyStep.Repositories, state: mockState({ isBound: true }) });

  expect(ui.repositories().get()).toHaveAttribute('aria-pressed', 'true');
  expect(ui.binding.get()).toHaveAttribute('aria-pressed', 'false');
  expect(ui.projects().get()).toHaveAttribute('aria-pressed', 'false');
});

it.each([
  [JourneyStep.Binding, () => ui.binding.get()],
  [JourneyStep.Repositories, () => ui.repositories().get()],
  [JourneyStep.Projects, () => ui.projects().get()],
] as const)('calls onSelectStep with %s when its card is clicked', async (step, getCard) => {
  const onSelectStep = jest.fn();
  const { user } = renderStepper({ onSelectStep, state: mockState({ isBound: true }) });

  await user.click(getCard());

  expect(onSelectStep).toHaveBeenCalledWith<[JourneyStep]>(step);
});
