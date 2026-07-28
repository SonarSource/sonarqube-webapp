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

import { OnboardingDevopsPlatform, OnboardingOverview } from '~shared/types/onboarding';
import { clampPercent } from '../components/dashboardSeverity';
import { JourneyLevel, JourneyState, JourneyStep } from '../types/types';

/** Rounded percentage of `part` over `whole`, clamped to [0, 100]. Returns 0 when `whole` is 0. */
function toPercent(part: number, whole: number): number {
  return whole > 0 ? Math.round(clampPercent((part / whole) * 100)) : 0;
}

/**
 * Reshapes the raw `OnboardingOverview` API response into the {@link JourneyState} view model
 * consumed by the onboarding dashboard. Pure and React-free so it can be unit-tested in isolation.
 *
 * Some design elements have no dedicated backend field yet and are approximated here (bound state,
 * the analyze breakdown).
 */
export function deriveJourneyState(overview: OnboardingOverview): JourneyState {
  const { cards, charts, checklist, devopsPlatforms } = overview;

  const discovered = cards.repositoriesDiscovered.discovered ?? 0;
  const { imported } = cards.repositoriesDiscovered;
  const notYetImported =
    cards.repositoriesDiscovered.notYetImported ?? Math.max(discovered - imported, 0);

  const analyzed = cards.projectsOnboarded.onboarded;

  // The overview has no explicit binding flag. Treat the org as bound when the DevOps
  // platform breakdown reports a positive total and at least one non-"not bound" platform.
  const isBound =
    (devopsPlatforms.total ?? 0) > 0 &&
    devopsPlatforms.shares.some(
      (share) => share.platform !== OnboardingDevopsPlatform.NotBound && share.count > 0,
    );

  let activeStep = JourneyStep.Projects;
  if (!isBound) {
    activeStep = JourneyStep.Binding;
  } else if (analyzed === 0) {
    activeStep = JourneyStep.Repositories;
  }

  let level = JourneyLevel.Imported;
  if (!isBound) {
    level = JourneyLevel.Unbound;
  } else if (imported === 0) {
    level = JourneyLevel.BoundNoImport;
  }

  const { scanConfiguration } = charts;

  return {
    activeStep,
    analyze: {
      autoscan: scanConfiguration.managed,
      fullCi: scanConfiguration.ci,
      local: scanConfiguration.local,
      moveToFullCi: scanConfiguration.managed + scanConfiguration.local,
      notImported: notYetImported,
      notScanned: charts.onboardingCoverage.failed,
    },
    analyzed,
    analyzedPct: toPercent(analyzed, discovered),
    discovered,
    imported,
    importedPct: toPercent(imported, discovered),
    isBound,
    level,
    notYetImported,
    overallPct: Math.round(clampPercent(checklist.overallMaturityPct)),
    totalProjects: discovered,
  };
}
