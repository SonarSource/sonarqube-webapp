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
  isKnownPlatform,
  JourneyEnterpriseState,
  JourneyLevel,
  JourneyState,
  JourneyStep,
  OnboardingAlm,
  OnboardingOverview,
} from '../../types/onboarding';
import { toDisplayPercent } from './percent';

/**
 * The first step of an enterprise journey: organizations bound over organizations read. Only
 * reported when the overview carries a total, i.e. for enterprise scope. Platforms the UI has no
 * icon or label for are left out of the split rather than shown under a raw id.
 */
function deriveEnterpriseState(overview: OnboardingOverview): JourneyEnterpriseState | undefined {
  const { byPlatform, configured, total } = overview.steps.devopsPlatforms;

  if (total === undefined || total === null) {
    return undefined;
  }

  const { projects, repositories } = overview.steps;
  // Unlike an organization, an enterprise often has no discovery count to report (not every
  // organization's platform can be asked), and the page must say so rather than count against 0.
  const discovered = repositories.discovered ?? null;
  // Without the repositories still to import, the projects that exist are the denominator that is known.
  const projectsTotal = projects.total ?? projects.analyzed + projects.notScanned;

  return {
    analyzedPct: toPercent(projects.analyzed, projectsTotal, projects.percent),
    byPlatform: (byPlatform ?? [])
      .filter((share): share is typeof share & { platform: OnboardingAlm } =>
        isKnownPlatform(share.platform),
      )
      .map(({ count, platform }) => ({ count, platform })),
    coverage: overview.coverage ?? null,
    discovered,
    importedPct:
      discovered === null
        ? null
        : toPercent(repositories.imported, discovered, repositories.percent),
    organizationsBound: configured,
    organizationsTotal: total,
    projectsTotal,
  };
}

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

  const enterprise = deriveEnterpriseState(overview);

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
    ...(enterprise !== undefined && { enterprise }),
    imported,
    importedPct: toPercent(imported, discovered, steps.repositories.percent),
    isBound,
    isFullyImported: steps.repositories.discovered !== null && notYetImported === 0,
    level,
    notYetImported,
    overallPct: toDisplayPercent(progressPct),
    totalProjects,
  };
}
