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
import { clampPercent } from './dashboardSeverity';

function toPercent(part: number, whole: number): number {
  return whole > 0 ? Math.round(clampPercent((part / whole) * 100)) : 0;
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
  const isBound = configured > 0;

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
    analyze: { notImported: notYetImported, notScanned: steps.projects.notScanned },
    analyzed,
    analyzedPct:
      steps.projects.percent === null
        ? toPercent(analyzed, totalProjects)
        : Math.round(clampPercent(steps.projects.percent)),
    configured,
    discovered,
    imported,
    importedPct:
      steps.repositories.percent === null
        ? toPercent(imported, discovered)
        : Math.round(clampPercent(steps.repositories.percent)),
    isBound,
    level,
    notYetImported,
    overallPct: Math.round(clampPercent(progressPct)),
    totalProjects,
  };
}
