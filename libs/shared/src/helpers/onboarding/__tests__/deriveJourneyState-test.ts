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
  mockOnboardingEnterpriseOverview,
  mockOnboardingOverview,
  mockOnboardingUncountedEnterpriseOverview,
  mockOnboardingUnboundEnterpriseOverview,
} from '../../../api/mocks/OnboardingServiceMock';
import {
  JourneyLevel,
  JourneyStep,
  OnboardingDevopsPlatform,
  OnboardingOverview,
} from '../../../types/onboarding';
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
    analyze: { byMode: null, notImported: 295, notScanned: 11 },
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

it('maps the analyzed-by-mode split when the backend reports it', () => {
  const state = deriveJourneyState(
    buildOverview({
      projects: {
        analyzed: 10,
        analyzedByMode: { automatic: 3, ci: 5 },
        notImported: 20,
        notScanned: 3,
        percent: null,
        total: 40,
      },
    }),
  );

  expect(state.analyze.byMode).toEqual({ automatic: 3, ci: 5 });
  expect(state.analyzed).toBe(10);
});

it('exposes a null analyzed-by-mode split when the backend sends null or nothing', () => {
  const projects = { analyzed: 10, notImported: 20, notScanned: 3, percent: null, total: 40 };

  expect(
    deriveJourneyState(buildOverview({ projects: { ...projects, analyzedByMode: null } })).analyze
      .byMode,
  ).toBeNull();
  expect(deriveJourneyState(buildOverview({ projects })).analyze.byMode).toBeNull();
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

it('falls back to backend-computed percentages when there are no counts to divide', () => {
  const state = deriveJourneyState(
    buildOverview({
      projects: { analyzed: 5, notImported: null, notScanned: 3, percent: 42, total: null },
      repositories: { discovered: null, imported: 10, percent: 99.99 },
    }),
  );

  expect(state.importedPct).toBe(99);
  expect(state.analyzedPct).toBe(42);
});

it('only reports 0% or 100% when a step is empty or complete', () => {
  const state = deriveJourneyState(
    buildOverview(
      {
        projects: { analyzed: 1, notImported: 1, notScanned: 0, percent: null, total: 9711 },
        repositories: { discovered: 9711, imported: 9710, percent: null },
      },
      99.99,
    ),
  );

  expect(state.importedPct).toBe(99);
  expect(state.analyzedPct).toBe(1);
  expect(state.overallPct).toBe(99);
});

it('derives percentages from the counts rather than a rounded backend percentage', () => {
  const state = deriveJourneyState(
    buildOverview({
      projects: { analyzed: 1, notImported: 1, notScanned: 0, percent: 0, total: 9711 },
      repositories: { discovered: 9711, imported: 9710, percent: 100 },
    }),
  );

  expect(state.importedPct).toBe(99);
  expect(state.analyzedPct).toBe(1);
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

describe('enterprise scope', () => {
  it('reports no enterprise state for an organization or an instance', () => {
    expect(deriveJourneyState(buildOverview())).not.toHaveProperty('enterprise');
  });

  it('reads the first step as bound organizations over organizations in scope', () => {
    const state = deriveJourneyState(mockOnboardingEnterpriseOverview());

    expect(state.enterprise).toEqual({
      analyzedPct: 10,
      byPlatform: [
        { count: 5, platform: OnboardingDevopsPlatform.Github },
        { count: 2, platform: OnboardingDevopsPlatform.Gitlab },
        { count: 1, platform: OnboardingDevopsPlatform.AzureDevops },
      ],
      coverage: { organizationsTotal: 12, organizationsUnavailable: 1 },
      discovered: 800,
      importedPct: 88,
      organizationsBound: 8,
      organizationsTotal: 12,
      projectsTotal: 800,
    });
    expect(state).toMatchObject({ configured: 8, isBound: true, overallPct: 45 });
  });

  describe('when the backend cannot count the repositories on the platforms', () => {
    // No organization reported a discovery count, so the totals are null.
    function withoutDiscovery() {
      return deriveJourneyState(mockOnboardingUncountedEnterpriseOverview());
    }

    it('keeps the repositories total unknown instead of reading it as 0', () => {
      expect(withoutDiscovery().enterprise).toMatchObject({ discovered: null, importedPct: null });
    });

    it('counts the analyzed projects against the projects that exist', () => {
      expect(withoutDiscovery().enterprise).toMatchObject({
        // 555 / (555 + 9155)
        analyzedPct: 6,
        projectsTotal: 9710,
      });
    });

    it('still reports the imported count', () => {
      expect(withoutDiscovery().imported).toBe(9710);
    });
  });

  it('does not mistake a discovery count of 0 for an unknown one', () => {
    const overview = mockOnboardingEnterpriseOverview();
    const state = deriveJourneyState({
      ...overview,
      steps: {
        ...overview.steps,
        repositories: { discovered: 0, imported: 0, percent: null },
      },
    });

    expect(state.enterprise?.discovered).toBe(0);
  });

  it('is unbound while no organization is bound', () => {
    const state = deriveJourneyState(mockOnboardingUnboundEnterpriseOverview());

    expect(state).toMatchObject({
      activeStep: JourneyStep.Binding,
      isBound: false,
      level: JourneyLevel.Unbound,
    });
    expect(state.enterprise).toMatchObject({ organizationsBound: 0, organizationsTotal: 12 });
  });

  it('leaves out the platforms it has no icon or label for, and the unbound pseudo platform', () => {
    const overview = mockOnboardingEnterpriseOverview();
    const state = deriveJourneyState({
      ...overview,
      steps: {
        ...overview.steps,
        devopsPlatforms: {
          byPlatform: [
            { count: 4, percentage: 50, platform: 'github' },
            { count: 3, percentage: 38, platform: 'sourcehut' },
            { count: 1, percentage: 12, platform: OnboardingDevopsPlatform.NotBound },
          ],
          configured: 8,
          total: 8,
        },
      },
    });

    expect(state.enterprise?.byPlatform).toEqual([
      { count: 4, platform: OnboardingDevopsPlatform.Github },
    ]);
  });

  it('has no coverage when the backend does not report it', () => {
    const state = deriveJourneyState(mockOnboardingEnterpriseOverview({ coverage: null }));

    expect(state.enterprise?.coverage).toBeNull();
  });
});
