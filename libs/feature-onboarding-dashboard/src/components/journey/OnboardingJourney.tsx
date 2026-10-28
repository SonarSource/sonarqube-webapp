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

import { useState } from 'react';
import { JourneyState, JourneyStep } from '~shared/types/onboarding';
import { useOnboardingDashboardTracking } from '../telemetry/OnboardingDashboardTelemetry';
import { DetailPanel } from './panels/DetailPanel';
import { JourneyStepper } from './stepper/JourneyStepper';

interface Props {
  state: JourneyState;
}

/**
 * The onboarding journey: the stepper and the detail panel of the selected step, both derived from
 * the overview.
 */
export function OnboardingJourney({ state }: Readonly<Props>) {
  // The stepper selection is UI-only for now. It defaults to the derived active step and is
  // overridden once the user picks a card.
  const [selectedStep, setSelectedStep] = useState<JourneyStep | undefined>(undefined);
  const step = selectedStep ?? state.activeStep;
  const { trackStepSelected } = useOnboardingDashboardTracking();

  const selectStep = (nextStep: JourneyStep) => {
    if (nextStep !== step) {
      trackStepSelected(step, nextStep);
    }
    setSelectedStep(nextStep);
  };

  return (
    <div className="sw:flex sw:flex-col sw:gap-6">
      <JourneyStepper onSelectStep={selectStep} selectedStep={step} state={state} />

      <DetailPanel onSelectStep={selectStep} selectedStep={step} state={state} />
    </div>
  );
}
