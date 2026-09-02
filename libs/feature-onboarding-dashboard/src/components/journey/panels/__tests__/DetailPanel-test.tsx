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

import userEvent from '@testing-library/user-event';
import { useAutoImportToggle } from '~adapters/helpers/useAutoImportToggle';
import { useBindingSettingsUrl } from '~adapters/helpers/useBindingSettingsUrl';
import { useCreateDevopsConfigurationUrl } from '~adapters/helpers/useCreateDevopsConfigurationUrl';
import { useOnboardingCurrentBinding } from '~adapters/helpers/useOnboardingCurrentBinding';
import { useOnboardingDevopsConfigurations } from '~adapters/helpers/useOnboardingDevopsConfigurations';
import { useCurrentUser } from '~adapters/helpers/users';
import { mockLoggedInUser } from '~shared/helpers/mocks/users';
import { renderWithRouter } from '~shared/helpers/test-utils';
import { byRole, byText } from '~shared/helpers/testSelector';
import {
  JourneyLevel,
  JourneyState,
  JourneyStep,
  OnboardingDevopsConfigurations,
  OnboardingDevopsPlatform,
} from '~shared/types/onboarding';
import { DetailPanel } from '../DetailPanel';

// Both the binding settings destination and the bound organization names come from the product
// (SQS has no organizations at all), so the shared panel test pins them to stubs. What each product
// actually resolves is covered by its own adapter test.
const BINDING_SETTINGS_URL = { pathname: '/binding-settings', search: '?category=binding' };
const CREATE_CONFIGURATION_URL = { pathname: '/create-configuration', search: '?category=devops' };
const CURRENT_BINDING = { devopsOrganizationName: 'acme-devops', organizationName: 'Acme' };

// No per-platform split is what keeps the current-binding view rather than the breakdown.
const SINGLE_BINDING_PRODUCT: OnboardingDevopsConfigurations = { byPlatform: undefined };

const MULTI_CONFIGURATION_PRODUCT: OnboardingDevopsConfigurations = {
  byPlatform: [
    { count: 4, platform: OnboardingDevopsPlatform.Github },
    { count: 1, platform: OnboardingDevopsPlatform.Gitlab },
  ],
};

// How the product answers `isEnabledOnFirstLoad` is covered by its own adapter test; the panel only
// decides which card that answer maps to, and owns the "Edit" disclosure on top of it.
const AUTO_IMPORT_OFF = {
  autoImportEnabled: false,
  isEnabledOnFirstLoad: false,
  isLoading: false,
  isPending: false,
  repositoryAccessUrl: undefined,
  toggleAutoImport: jest.fn(),
};

const AUTO_IMPORT_ON_AT_LOAD = {
  ...AUTO_IMPORT_OFF,
  autoImportEnabled: true,
  isEnabledOnFirstLoad: true,
};

jest.mock('~adapters/helpers/useBindingSettingsUrl', () => ({
  useBindingSettingsUrl: jest.fn(),
}));

jest.mock('~adapters/helpers/useCreateDevopsConfigurationUrl', () => ({
  useCreateDevopsConfigurationUrl: jest.fn(),
}));

jest.mock('~adapters/helpers/useAutoImportToggle', () => ({
  useAutoImportToggle: jest.fn(),
}));

jest.mock('~adapters/helpers/useOnboardingCurrentBinding', () => ({
  useOnboardingCurrentBinding: jest.fn(),
}));

jest.mock('~adapters/helpers/useOnboardingDevopsConfigurations', () => ({
  useOnboardingDevopsConfigurations: jest.fn(),
}));

// SQS gates the import CTA on the Create Projects permission; SQC has no such concept and never
// reads this. Pinned to a permitted user so this shared test isn't exercising that permission
// check — the SQS adapter has its own test for the unpermitted case.
jest.mock('~adapters/helpers/users', () => ({
  useCurrentUser: jest.fn(),
}));

// The "View details" modal reads product-specific configurations and bound-project counts; this
// panel test only asserts that the link opens it.
jest.mock('~adapters/queries/onboarding', () => ({
  useOnboardingBoundProjectCountsQuery: jest.fn().mockReturnValue({ data: {}, isPending: false }),
  useOnboardingDopSettingsQuery: jest.fn().mockReturnValue({ data: [], isPending: false }),
}));

// Where a configuration's actions lead is product-specific, so the row menu is pinned to stubs here.
jest.mock('~adapters/helpers/onboarding-actions', () => ({
  getDevopsPlatformWebUrl: jest.fn().mockReturnValue(undefined),
  getImportRepositoriesUrl: jest.fn().mockReturnValue(undefined),
  getProjectCiConfigurationUrl: jest.fn().mockReturnValue({ pathname: '/tutorials' }),
}));

beforeEach(() => {
  jest.clearAllMocks();

  jest.mocked(useBindingSettingsUrl).mockReturnValue(BINDING_SETTINGS_URL);
  jest.mocked(useCreateDevopsConfigurationUrl).mockReturnValue(CREATE_CONFIGURATION_URL);
  jest.mocked(useAutoImportToggle).mockReturnValue(AUTO_IMPORT_OFF);
  jest.mocked(useOnboardingCurrentBinding).mockReturnValue(CURRENT_BINDING);
  jest.mocked(useOnboardingDevopsConfigurations).mockReturnValue(SINGLE_BINDING_PRODUCT);
  jest.mocked(useCurrentUser).mockReturnValue({
    currentUser: mockLoggedInUser({ permissions: { global: ['provisioning'] } }),
    isLoggedIn: true,
  });
});

// A fully-bound org with imported + analysed repositories (the "everything unlocked" state).
const boundState: JourneyState = {
  activeStep: JourneyStep.Projects,
  analyze: { notImported: 20, notScanned: 7 },
  analyzed: 72,
  analyzedPct: 60,
  configured: 1,
  discovered: 120,
  imported: 48,
  importedPct: 40,
  isBound: true,
  level: JourneyLevel.Imported,
  notYetImported: 72,
  overallPct: 80,
  totalProjects: 120,
};

function stateWith(overrides: Partial<JourneyState>): JourneyState {
  return { ...boundState, ...overrides };
}

const unboundState = stateWith({
  activeStep: JourneyStep.Binding,
  configured: 0,
  imported: 0,
  importedPct: 0,
  isBound: false,
  level: JourneyLevel.Unbound,
  notYetImported: 120,
});

const boundNoImportState = stateWith({
  activeStep: JourneyStep.Repositories,
  imported: 0,
  importedPct: 0,
  level: JourneyLevel.BoundNoImport,
  notYetImported: 120,
});

const ui = {
  bindingTitle: byText('onboarding_dashboard.journey.binding.title'),
  bindingDescription: byText('onboarding_dashboard.journey.binding.description'),
  importTitle: byText('onboarding_dashboard.journey.import.title'),
  analyzeTitle: byText('onboarding_dashboard.journey.analyze.title'),

  // Binding panel
  bindCta: byRole('link', { name: 'onboarding_dashboard.journey.binding.bind_cta' }),
  // Same call-to-action in a product that has no destination for it yet: a plain button.
  inertBindCta: byRole('button', { name: 'onboarding_dashboard.journey.binding.bind_cta' }),
  viewCta: byRole('link', { name: 'onboarding_dashboard.journey.binding.view_cta' }),
  currentBinding: byText('onboarding_dashboard.journey.binding.current'),
  boundOrgName: byText('Acme'),
  boundDevopsOrgName: byText('acme-devops'),
  configuredLabel: byText('onboarding_dashboard.journey.binding.configured_label'),
  viewDetails: byRole('button', { name: 'onboarding_dashboard.journey.binding.view_details' }),
  configurationsModal: byRole('dialog', {
    name: 'onboarding_dashboard.journey.binding.modal.title',
  }),
  githubLegend: byText('alm.github'),
  gitlabLegend: byText('alm.gitlab'),
  azureLegend: byText('alm.azure'),

  // Import panel
  toImport: byText('onboarding_dashboard.journey.import.to_import'),
  importCta: byRole('button', { name: 'onboarding_dashboard.journey.import.cta' }),
  importedLegend: byText('onboarding_dashboard.journey.import.legend.imported'),
  notImportedLegend: byText('onboarding_dashboard.journey.import.legend.not_imported'),
  autoImportRepoSwitch: byRole('switch', {
    name: 'onboarding_dashboard.journey.import.auto',
  }),
  autoEditButton: byRole('button', {
    name: 'onboarding_dashboard.journey.import.auto_edit_aria_label',
  }),
  autoHelpAccessLink: byRole('link', {
    name: /onboarding_dashboard\.journey\.import\.auto_help_link/,
  }),
  recommendedBadge: byText('onboarding_dashboard.journey.import.recommended'),
  nextCta: byRole('button', { name: 'next' }),
  // Matched by its own label rather than role or the generic "loading" text: the "status" role
  // and default spinner text are also used by the unrelated ImportRepositoriesCta loading spinner.
  spinner: byText('onboarding_dashboard.journey.import.auto_loading'),

  // Analyze panel
  notScannedLegend: byText('onboarding_dashboard.journey.analyze.legend.not_scanned'),
  notImportedAnalyzeLegend: byText('onboarding_dashboard.journey.analyze.legend.not_imported'),
  fixCta: byRole('button', { name: 'onboarding_dashboard.journey.analyze.not_scanned.cta' }),
  importRowCta: byRole('button', { name: 'onboarding_dashboard.journey.analyze.not_imported.cta' }),
  // The react-intl mock joins the message id with primitive values by ".", so a `{count}` message
  // renders as `<id>.<count>` — lets us assert the derived counts reach the right rows.
  // Not-scanned/not-imported counts now live in a "{count} projects" badge; full CI keeps it inline.
  notScannedCount: byText('onboarding_dashboard.journey.analyze.projects_count.7'),
  notImportedCount: byText('onboarding_dashboard.journey.analyze.projects_count.20'),
};

function renderPanel(
  selectedStep: JourneyStep,
  state: JourneyState,
  onSelectStep: (step: JourneyStep) => void = jest.fn(),
) {
  // Rendered within a router: the import panel's auto-import helper uses a LinkStandalone.
  return renderWithRouter(
    <DetailPanel onSelectStep={onSelectStep} selectedStep={selectedStep} state={state} />,
  );
}

it.each([
  [JourneyStep.Binding, ui.bindingTitle],
  [JourneyStep.Repositories, ui.importTitle],
  [JourneyStep.Projects, ui.analyzeTitle],
])('routes the "%s" step to its own panel', (step, expectedTitle) => {
  renderPanel(step, boundState);

  expect(expectedTitle.get()).toBeInTheDocument();
});

it('renders the unbound binding panel with only the bind call-to-action', () => {
  renderPanel(JourneyStep.Binding, unboundState);

  // The wording does not change with the bound state.
  expect(ui.bindingTitle.get()).toBeInTheDocument();
  expect(ui.bindingDescription.get()).toBeInTheDocument();

  // The call-to-action navigates to the product's DevOps configuration page.
  expect(ui.bindCta.get()).toHaveAttribute('href', '/create-configuration?category=devops');

  // The current-binding row and its controls only exist once the org is bound.
  expect(ui.currentBinding.query()).not.toBeInTheDocument();
  expect(ui.viewCta.query()).not.toBeInTheDocument();
});

it('keeps the bind call-to-action as an inert button when the product has no destination for it', () => {
  jest.mocked(useCreateDevopsConfigurationUrl).mockReturnValue(undefined);

  renderPanel(JourneyStep.Binding, unboundState);

  // The call-to-action is still offered, it just cannot navigate anywhere yet.
  expect(ui.inertBindCta.get()).not.toHaveAttribute('href');
  expect(ui.bindCta.query()).not.toBeInTheDocument();
});

it('renders the bound binding panel with the current binding and auto-import controls', () => {
  renderPanel(JourneyStep.Binding, boundState);

  expect(ui.bindingTitle.get()).toBeInTheDocument();
  expect(ui.bindingDescription.get()).toBeInTheDocument();

  // Both ends of the binding are named: Sonar organization → DevOps organization.
  expect(ui.currentBinding.get()).toBeInTheDocument();
  expect(ui.boundOrgName.get()).toBeInTheDocument();
  expect(ui.boundDevopsOrgName.get()).toBeInTheDocument();

  // "View binding" links to the product's binding settings page rather than acting as a button.
  expect(ui.viewCta.get()).toHaveAttribute('href', '/binding-settings?category=binding');

  expect(ui.bindCta.get()).toHaveAttribute('href', '/create-configuration?category=devops');

  // Without a per-platform split there is nothing to break down.
  expect(ui.configuredLabel.query()).not.toBeInTheDocument();
  expect(ui.viewDetails.query()).not.toBeInTheDocument();
});

it('drops the create call-to-action once bound on products that cannot add configurations', () => {
  jest.mocked(useCreateDevopsConfigurationUrl).mockReturnValue(undefined);

  renderPanel(JourneyStep.Binding, boundState);

  // Nothing to create and nowhere to create it: only the existing binding is described.
  expect(ui.currentBinding.get()).toBeInTheDocument();
  expect(ui.bindCta.query()).not.toBeInTheDocument();
  expect(ui.inertBindCta.query()).not.toBeInTheDocument();
});

it('renders the configuration breakdown on products that hold several configurations', () => {
  jest.mocked(useOnboardingDevopsConfigurations).mockReturnValue(MULTI_CONFIGURATION_PRODUCT);

  renderPanel(JourneyStep.Binding, stateWith({ configured: 5 }));

  // The donut carries the total from the overview, and one legend entry per configured platform.
  expect(ui.configuredLabel.get()).toBeInTheDocument();
  expect(ui.githubLegend.get()).toBeInTheDocument();
  expect(ui.gitlabLegend.get()).toBeInTheDocument();

  // Platforms with no configuration are left out of the ring and the legend entirely.
  expect(ui.azureLegend.query()).not.toBeInTheDocument();

  // The breakdown is only a summary, so the details live behind a modal rather than a destination.
  expect(ui.viewDetails.get()).not.toHaveAttribute('href');

  // No single binding to describe, so neither the row nor "View binding" is offered.
  expect(ui.bindCta.get()).toBeInTheDocument();
  expect(ui.currentBinding.query()).not.toBeInTheDocument();
  expect(ui.viewCta.query()).not.toBeInTheDocument();
});

it('opens the configuration details from the breakdown', async () => {
  const user = userEvent.setup();
  jest.mocked(useOnboardingDevopsConfigurations).mockReturnValue(MULTI_CONFIGURATION_PRODUCT);

  renderPanel(JourneyStep.Binding, stateWith({ configured: 5 }));

  await user.click(ui.viewDetails.get());

  expect(await ui.configurationsModal.find()).toBeInTheDocument();
});

it.each([
  ['nothing is configured yet', unboundState],
  ['the split is not known yet', stateWith({ configured: 5 })],
])('omits the breakdown when %s', (_, state) => {
  jest.mocked(useOnboardingDevopsConfigurations).mockReturnValue({ byPlatform: [] });

  renderPanel(JourneyStep.Binding, state);

  // An unresolved lookup must not be mistaken for a single-binding product either.
  expect(ui.configuredLabel.query()).not.toBeInTheDocument();
  expect(ui.viewDetails.query()).not.toBeInTheDocument();
  expect(ui.currentBinding.query()).not.toBeInTheDocument();
  expect(ui.viewCta.query()).not.toBeInTheDocument();
  expect(ui.bindCta.get()).toBeInTheDocument();
});

it('omits the current-binding row when the bound organizations are unknown', () => {
  jest.mocked(useOnboardingCurrentBinding).mockReturnValue(undefined);

  renderPanel(JourneyStep.Binding, boundState);

  expect(ui.currentBinding.query()).not.toBeInTheDocument();

  // The link to the binding settings is independent of the names and still renders.
  expect(ui.viewCta.get()).toBeInTheDocument();
});

it('hides the view-binding link when the binding settings page cannot be resolved', () => {
  jest.mocked(useBindingSettingsUrl).mockReturnValue(undefined);

  renderPanel(JourneyStep.Binding, boundState);

  // The rest of the bound panel still renders — only the link is dropped.
  expect(ui.currentBinding.get()).toBeInTheDocument();
  expect(ui.viewCta.query()).not.toBeInTheDocument();
});

it('renders the import panel breakdown before any repository is imported', async () => {
  renderPanel(JourneyStep.Repositories, boundNoImportState);

  expect(ui.toImport.get()).toBeInTheDocument();
  // Awaited: the SQS import CTA fetches its ALM bindings on mount and stays in its own loading
  // state (covered by ImportRepositoriesCta's own test) until that settles.
  expect(await ui.importCta.find()).toBeInTheDocument();

  // With nothing imported the "Imported" donut segment is omitted; only "Not imported" remains.
  expect(ui.notImportedLegend.get()).toBeInTheDocument();
  expect(ui.importedLegend.query()).not.toBeInTheDocument();

  // The auto-import control belongs to the "some imported" variant.
  expect(ui.autoImportRepoSwitch.query()).not.toBeInTheDocument();

  // Both footer actions are always present.
  expect(ui.nextCta.get()).toBeInTheDocument();
});

it('renders the import panel auto-import control once repositories are imported', async () => {
  renderPanel(JourneyStep.Repositories, boundState);

  expect(ui.autoImportRepoSwitch.get()).toBeInTheDocument();
  expect(ui.recommendedBadge.get()).toBeInTheDocument();
  expect(await ui.importCta.find()).toBeInTheDocument();
  expect(ui.nextCta.get()).toBeInTheDocument();

  // Both donut segments are present once something is imported.
  expect(ui.importedLegend.get()).toBeInTheDocument();
  expect(ui.notImportedLegend.get()).toBeInTheDocument();

  // The pre-import breakdown is not shown in this variant.
  expect(ui.toImport.query()).not.toBeInTheDocument();
});

it('shows a spinner inside the toggle card while the binding query is loading', () => {
  jest.mocked(useAutoImportToggle).mockReturnValue({ ...AUTO_IMPORT_OFF, isLoading: true });

  renderPanel(JourneyStep.Repositories, boundState);

  expect(ui.autoImportRepoSwitch.query()).not.toBeInTheDocument();
  expect(ui.autoEditButton.query()).not.toBeInTheDocument();
  expect(ui.spinner.get()).toBeInTheDocument();
});

it('renders the full toggle card when auto-import was off on load', async () => {
  renderPanel(JourneyStep.Repositories, boundState);

  expect(await ui.autoImportRepoSwitch.find()).toBeInTheDocument();
  expect(ui.recommendedBadge.get()).toBeInTheDocument();
  expect(ui.autoEditButton.query()).not.toBeInTheDocument();
});

it('renders the compact card when auto-import was already on at load', async () => {
  jest.mocked(useAutoImportToggle).mockReturnValue(AUTO_IMPORT_ON_AT_LOAD);

  renderPanel(JourneyStep.Repositories, boundState);

  expect(await ui.autoEditButton.find()).toBeInTheDocument();
  expect(ui.autoImportRepoSwitch.query()).not.toBeInTheDocument();
  expect(ui.recommendedBadge.query()).not.toBeInTheDocument();
});

it('reveals the toggle, already on, when Edit is clicked on the compact card', async () => {
  const user = userEvent.setup();
  jest.mocked(useAutoImportToggle).mockReturnValue(AUTO_IMPORT_ON_AT_LOAD);

  renderPanel(JourneyStep.Repositories, boundState);

  await user.click(await ui.autoEditButton.find());

  expect(await ui.autoImportRepoSwitch.find()).toBeChecked();
  expect(ui.autoEditButton.query()).not.toBeInTheDocument();
});

it('keeps the toggle visible after auto-import is turned on', async () => {
  // Once a save has happened the product reports isEnabledOnFirstLoad=false, so it can be undone.
  jest.mocked(useAutoImportToggle).mockReturnValue({
    ...AUTO_IMPORT_OFF,
    autoImportEnabled: true,
  });

  renderPanel(JourneyStep.Repositories, boundState);

  expect(await ui.autoImportRepoSwitch.find()).toBeChecked();
  expect(ui.autoEditButton.query()).not.toBeInTheDocument();
});

it('calls toggleAutoImport when the switch is clicked', async () => {
  const toggleAutoImport = jest.fn();
  const user = userEvent.setup();
  jest.mocked(useAutoImportToggle).mockReturnValue({ ...AUTO_IMPORT_OFF, toggleAutoImport });

  renderPanel(JourneyStep.Repositories, boundState);

  await user.click(await ui.autoImportRepoSwitch.find());

  expect(toggleAutoImport).toHaveBeenCalledWith(true);
});

it('navigates to the analyze step when the next button is clicked', async () => {
  const user = userEvent.setup();
  const onSelectStep = jest.fn();

  renderPanel(JourneyStep.Repositories, boundState, onSelectStep);

  await user.click(await ui.nextCta.find());

  expect(onSelectStep).toHaveBeenCalledWith(JourneyStep.Projects);
});

it('disables the switch while the mutation is pending', async () => {
  jest.mocked(useAutoImportToggle).mockReturnValue({ ...AUTO_IMPORT_OFF, isPending: true });

  renderPanel(JourneyStep.Repositories, boundState);

  expect(await ui.autoImportRepoSwitch.find()).toBeDisabled();
});

it('renders nothing when the product has no auto-import setting', () => {
  jest.mocked(useAutoImportToggle).mockReturnValue({
    ...AUTO_IMPORT_ON_AT_LOAD,
    toggleAutoImport: undefined,
  });

  renderPanel(JourneyStep.Repositories, boundState);

  expect(ui.autoImportRepoSwitch.query()).not.toBeInTheDocument();
  expect(ui.autoEditButton.query()).not.toBeInTheDocument();
});

it('renders a link with the repositoryAccessUrl in the auto-import help text', async () => {
  const accessUrl = 'https://github.com/organizations/acme/settings/installations/123';
  jest.mocked(useAutoImportToggle).mockReturnValue({
    ...AUTO_IMPORT_OFF,
    repositoryAccessUrl: accessUrl,
  });

  renderPanel(JourneyStep.Repositories, boundState);

  expect(await ui.autoHelpAccessLink.find()).toHaveAttribute('href', accessUrl);
});

it('renders the analyze panel with its two legend entries and two action rows', async () => {
  renderPanel(JourneyStep.Projects, boundState);

  // Donut legend — the overview reports these two cohorts.
  expect(ui.notScannedLegend.get()).toBeInTheDocument();
  expect(ui.notImportedAnalyzeLegend.get()).toBeInTheDocument();

  // Two action rows, each with its own CTA...
  expect(ui.fixCta.get()).toBeInTheDocument();
  expect(await ui.importRowCta.find()).toBeInTheDocument();

  // ...and the cohort counts land on the matching row.
  expect(ui.notScannedCount.get()).toBeInTheDocument();
  expect(ui.notImportedCount.get()).toBeInTheDocument();
});
