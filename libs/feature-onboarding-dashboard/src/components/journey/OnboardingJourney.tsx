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

import { Divider } from '@sonarsource/echoes-react';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { OnboardingTimelinePoint } from '~shared/types/onboarding';
import { JourneyLevel, JourneyState, JourneyStep } from '../../types/types';
import { OnboardingDashboardHeader } from '../OnboardingDashboardHeader';
import { DetailPanel } from './panels/DetailPanel';
import { AllProjectsCard } from './projects/AllProjectsCard';
import { StaleProjectsCard } from './projects/StaleProjectsCard';
import { LockedStatisticsCard } from './stats/LockedStatisticsCard';
import { OnboardingOverTimeCard } from './stats/OnboardingOverTimeCard';
import { JourneyStepper } from './stepper/JourneyStepper';

/**
 * l10n keys for the "locked statistics" placeholder shown at each journey level. Levels that have
 * nothing left to unlock are absent from the map.
 *
 * The CTA is deliberately inert for now — the actions it will trigger land in follow-up PRs.
 */
const LOCKED_STATISTICS_KEYS: Partial<
  Record<JourneyLevel, { cta: string; message: string; title: string }>
> = {
  [JourneyLevel.Unbound]: {
    cta: 'onboarding_dashboard.journey.locked.stats.cta',
    message: 'onboarding_dashboard.journey.locked.stats.message',
    title: 'onboarding_dashboard.journey.locked.stats.title',
  },
  [JourneyLevel.BoundNoImport]: {
    cta: 'onboarding_dashboard.journey.locked.more.cta',
    message: 'onboarding_dashboard.journey.locked.more.message',
    title: 'onboarding_dashboard.journey.locked.more.title',
  },
};

interface Props {
  state: JourneyState;
  /** Adoption history for the over-time chart, from the statistics endpoint. */
  timeline: OnboardingTimelinePoint[];
}

/**
 * The onboarding journey section: header, stepper, the detail panel of the selected step, the
 * statistics unlocked at the current journey level and the project tables. Derives its whole
 * view model from the overview, so everything it renders is available as soon as the overview is —
 * the project tables fetch their own paged data.
 */
export function OnboardingJourney({ state, timeline }: Readonly<Props>) {
  const { formatMessage } = useIntl();

  // The stepper selection is UI-only for now. It defaults to the derived active step and is
  // overridden once the user picks a card.
  const [selectedStep, setSelectedStep] = useState<JourneyStep | undefined>(undefined);
  const step = selectedStep ?? state.activeStep;

  const lockedStatistics = LOCKED_STATISTICS_KEYS[state.level];

  return (
    <>
      <OnboardingDashboardHeader
        discovered={state.discovered}
        overallPct={state.overallPct}
        showCongrats={state.level === JourneyLevel.BoundNoImport}
        showProgress={state.isBound}
      />

      <div className="sw-mb-4">
        <JourneyStepper onSelectStep={setSelectedStep} selectedStep={step} state={state} />
      </div>

      <div className="sw-mb-4">
        <DetailPanel onSelectStep={setSelectedStep} selectedStep={step} state={state} />
      </div>

      <Divider className="sw-mb-4" role="separator" />

      <div className="sw-mb-4 sw-flex sw-flex-col sw-gap-4">
        {state.level !== JourneyLevel.Unbound && (
          <OnboardingOverTimeCard
            showImportedSeries={state.level === JourneyLevel.Imported}
            timeline={timeline}
          />
        )}

        {lockedStatistics !== undefined && (
          <LockedStatisticsCard
            ctaLabel={formatMessage({ id: lockedStatistics.cta })}
            message={formatMessage({ id: lockedStatistics.message })}
            title={formatMessage({ id: lockedStatistics.title })}
          />
        )}

        <StaleProjectsCard />

        <AllProjectsCard />
      </div>
    </>
  );
}
