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

import {
  JourneyLevel,
  JourneyState,
  JourneyStep,
  OnboardingOverview,
} from '../../types/onboarding';
import { toDisplayPercent } from './percent';

/**
 * Derives the percentage from the counts, which are exact: the backend may round its own `percent`
 * up to 100 for a step that is not complete yet.
 */
function toPercent(part: number, whole: number, backendPercent: number | null): number {
  if (whole > 0) {
    return toDisplayPercent((part / whole) * 100);
  }
  return backendPercent === null ? 0 : toDisplayPercent(backendPercent);
}

/** Whether at least one DevOps platform configuration exists, as the overview reports it. */
export function hasConfiguredDevopsPlatform(overview: OnboardingOverview): boolean {
  return overview.steps.devopsPlatforms.configured > 0;
}

/**
 * Reshapes the `OnboardingOverview` API response into the {@link JourneyState} view model consumed
 * by the onboarding dashboard. Pure and React-free so it can be unit-tested in isolation.
 */
export function deriveJourneyState(overview: OnboardingOverview): JourneyState {
  const { progressPct, steps } = overview;

  const discovered = steps.repositories.discovered ?? 0;
  const { imported } = steps.repositories;
  const analyzed = steps.projects.analyzed;
  const notYetImported = steps.projects.notImported ?? Math.max(discovered - imported, 0);
  const totalProjects = steps.projects.total ?? discovered;
  const { configured } = steps.devopsPlatforms;
  const isBound = hasConfiguredDevopsPlatform(overview);

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

  return {
    activeStep,
    analyze: {
      byMode: steps.projects.analyzedByMode ?? null,
      notImported: notYetImported,
      notScanned: steps.projects.notScanned,
    },
    analyzed,
    analyzedPct: toPercent(analyzed, totalProjects, steps.projects.percent),
    configured,
    discovered,
    imported,
    importedPct: toPercent(imported, discovered, steps.repositories.percent),
    isBound,
    level,
    notYetImported,
    overallPct: toDisplayPercent(progressPct),
    totalProjects,
  };
}
