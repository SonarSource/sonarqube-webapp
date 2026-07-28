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

import { mockOnboardingOverview } from '~shared/api/mocks/OnboardingServiceMock';
import {
  OnboardingDevopsPlatform,
  OnboardingDevopsPlatforms,
  OnboardingOverview,
} from '~shared/types/onboarding';
import { JourneyLevel, JourneyStep } from '../../types/types';
import { deriveJourneyState } from '../deriveJourneyState';

const boundPlatforms: OnboardingDevopsPlatforms = {
  total: 10,
  shares: [{ platform: OnboardingDevopsPlatform.Github, count: 10, percentage: 100 }],
};

function buildOverview({
  cards,
  charts,
  checklist,
  devopsPlatforms,
}: {
  cards?: Partial<OnboardingOverview['cards']>;
  charts?: Partial<OnboardingOverview['charts']>;
  checklist?: Partial<OnboardingOverview['checklist']>;
  devopsPlatforms?: OnboardingOverview['devopsPlatforms'];
} = {}): OnboardingOverview {
  const base = mockOnboardingOverview(cards);
  return {
    ...base,
    charts: charts ? { ...base.charts, ...charts } : base.charts,
    checklist: checklist ? { ...base.checklist, ...checklist } : base.checklist,
    devopsPlatforms: devopsPlatforms ?? base.devopsPlatforms,
  };
}

it('derives a fully bound, analysed state from the overview', () => {
  const state = deriveJourneyState(buildOverview());

  expect(state.isBound).toBe(true);
  expect(state.activeStep).toBe(JourneyStep.Projects);
  expect(state.level).toBe(JourneyLevel.Imported);

  expect(state.discovered).toBe(301);
  expect(state.imported).toBe(6);
  expect(state.notYetImported).toBe(295);
  expect(state.analyzed).toBe(1);
  expect(state.totalProjects).toBe(301);

  // Rounded, clamped percentages: 6/301 → 2, 1/301 → 0, header ring uses overallMaturityPct.
  expect(state.importedPct).toBe(2);
  expect(state.analyzedPct).toBe(0);
  expect(state.overallPct).toBe(75);

  // Analyze breakdown is approximated from the overview charts.
  expect(state.analyze).toEqual({
    autoscan: 44,
    fullCi: 31,
    local: 12,
    moveToFullCi: 56,
    notImported: 295,
    notScanned: 11,
  });
});

it.each([{ total: 0 }, { total: null }])(
  'marks the org unbound when the platform total is $total',
  ({ total }) => {
    const state = deriveJourneyState(buildOverview({ devopsPlatforms: { total, shares: [] } }));

    expect(state.isBound).toBe(false);
    expect(state.activeStep).toBe(JourneyStep.Binding);
    expect(state.level).toBe(JourneyLevel.Unbound);
  },
);

it('marks the org unbound when every share is not-bound or empty', () => {
  const state = deriveJourneyState(
    buildOverview({
      devopsPlatforms: {
        total: 5,
        shares: [
          { platform: OnboardingDevopsPlatform.NotBound, count: 5, percentage: 100 },
          { platform: OnboardingDevopsPlatform.Github, count: 0, percentage: 0 },
        ],
      },
    }),
  );

  expect(state.isBound).toBe(false);
  expect(state.activeStep).toBe(JourneyStep.Binding);
  expect(state.level).toBe(JourneyLevel.Unbound);
});

it('selects the repositories step when bound but nothing is analysed yet', () => {
  const state = deriveJourneyState(
    buildOverview({
      cards: {
        projectsOnboarded: {
          onboarded: 0,
          totalProjects: 6,
          importedEmpty: 5,
          percentOfImported: 0,
        },
      },
      devopsPlatforms: boundPlatforms,
    }),
  );

  expect(state.isBound).toBe(true);
  expect(state.activeStep).toBe(JourneyStep.Repositories);
  expect(state.analyzed).toBe(0);
});

it('reports the BoundNoImport level when bound with no imported repositories', () => {
  const state = deriveJourneyState(
    buildOverview({
      cards: {
        repositoriesDiscovered: {
          discovered: 120,
          imported: 0,
          notYetImported: 120,
          byAlm: [],
        },
        projectsOnboarded: {
          onboarded: 0,
          totalProjects: 0,
          importedEmpty: 0,
          percentOfImported: null,
        },
      },
      devopsPlatforms: boundPlatforms,
    }),
  );

  expect(state.isBound).toBe(true);
  expect(state.imported).toBe(0);
  expect(state.level).toBe(JourneyLevel.BoundNoImport);
});

it('falls back to zero when discovered/notYetImported are null and denominators are zero', () => {
  const state = deriveJourneyState(
    buildOverview({
      cards: {
        repositoriesDiscovered: {
          discovered: null,
          imported: 5,
          notYetImported: null,
          byAlm: [],
        },
        projectsOnboarded: {
          onboarded: 0,
          totalProjects: 0,
          importedEmpty: 0,
          percentOfImported: null,
        },
      },
      devopsPlatforms: boundPlatforms,
    }),
  );

  expect(state.discovered).toBe(0);
  // notYetImported falls back to max(discovered - imported, 0) = max(0 - 5, 0) = 0.
  expect(state.notYetImported).toBe(0);
  // toPercent returns 0 when the denominator (discovered / totalProjects) is 0.
  expect(state.importedPct).toBe(0);
  expect(state.analyzedPct).toBe(0);
});
