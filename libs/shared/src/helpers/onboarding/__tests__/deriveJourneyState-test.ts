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

import { mockOnboardingOverview } from '../../../api/mocks/OnboardingServiceMock';
import { JourneyLevel, JourneyStep, OnboardingOverview } from '../../../types/onboarding';
import { deriveJourneyState } from '../deriveJourneyState';

function buildOverview(
  steps: Partial<OnboardingOverview['steps']> = {},
  progressPct = 50,
): OnboardingOverview {
  return { ...mockOnboardingOverview(steps), progressPct };
}

it('maps the step counters onto the view model', () => {
  const state = deriveJourneyState(buildOverview());

  expect(state).toMatchObject({
    analyze: { notImported: 295, notScanned: 11 },
    analyzed: 1,
    configured: 1,
    discovered: 301,
    imported: 6,
    isBound: true,
    notYetImported: 295,
    overallPct: 50,
    totalProjects: 301,
  });
});

it('treats a configured platform count of zero as unbound', () => {
  const state = deriveJourneyState(buildOverview({ devopsPlatforms: { configured: 0 } }));

  expect(state.configured).toBe(0);
  expect(state.isBound).toBe(false);
  expect(state.activeStep).toBe(JourneyStep.Binding);
  expect(state.level).toBe(JourneyLevel.Unbound);
});

it('reports the repositories step when bound but nothing is analysed yet', () => {
  const state = deriveJourneyState(
    buildOverview({
      projects: { analyzed: 0, notImported: 20, notScanned: 0, percent: null, total: 40 },
    }),
  );

  expect(state.activeStep).toBe(JourneyStep.Repositories);
  expect(state.level).toBe(JourneyLevel.Imported);
});

it('reports BoundNoImport when bound with nothing imported', () => {
  const state = deriveJourneyState(
    buildOverview({
      projects: { analyzed: 0, notImported: null, notScanned: 0, percent: null, total: null },
      repositories: { discovered: null, imported: 0, percent: null },
    }),
  );

  expect(state.level).toBe(JourneyLevel.BoundNoImport);
});

it('computes percentages when the backend sends none', () => {
  const state = deriveJourneyState(
    buildOverview({
      projects: { analyzed: 5, notImported: 20, notScanned: 3, percent: null, total: 40 },
      repositories: { discovered: 40, imported: 10, percent: null },
    }),
  );

  expect(state.importedPct).toBe(25);
  expect(state.analyzedPct).toBe(13);
});

it('prefers backend-computed percentages when present', () => {
  const state = deriveJourneyState(
    buildOverview({
      projects: { analyzed: 5, notImported: 20, notScanned: 3, percent: 42, total: 40 },
      repositories: { discovered: 40, imported: 10, percent: 99 },
    }),
  );

  expect(state.importedPct).toBe(99);
  expect(state.analyzedPct).toBe(42);
});

it('derives notYetImported from discovered minus imported when the backend omits it', () => {
  const state = deriveJourneyState(
    buildOverview({
      projects: { analyzed: 5, notImported: null, notScanned: 3, percent: null, total: 40 },
      repositories: { discovered: 40, imported: 10, percent: null },
    }),
  );

  expect(state.notYetImported).toBe(30);
});

it('clamps an out-of-range progress percentage', () => {
  expect(deriveJourneyState(buildOverview({}, 140)).overallPct).toBe(100);
  expect(deriveJourneyState(buildOverview({}, -5)).overallPct).toBe(0);
});
