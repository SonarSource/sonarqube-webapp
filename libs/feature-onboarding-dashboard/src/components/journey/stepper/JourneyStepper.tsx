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

import { useIntl } from 'react-intl';
import { useOnboardingDevopsConfigurations } from '~adapters/helpers/useOnboardingDevopsConfigurations';
import { JourneyState, JourneyStep } from '~shared/types/onboarding';
import { StepCardVisual } from '../../../types/types';
import { getBindingStepCard } from './bindingStepCard';
import { StepCard } from './StepCard';

interface Props {
  onSelectStep: (step: JourneyStep) => void;
  selectedStep: JourneyStep;
  state: JourneyState;
}

/**
 * The row of three selectable step cards (Organization binding, Repositories imported, Projects
 * analyzed). Presentational: the selected step and its setter are owned by the parent so the detail
 * panel below can react to the selection.
 */
export function JourneyStepper({ onSelectStep, selectedStep, state }: Readonly<Props>) {
  const { formatMessage } = useIntl();
  const { byPlatform } = useOnboardingDevopsConfigurations();

  const countLabel = (done: number, total: number) =>
    formatMessage({ id: 'onboarding_dashboard.journey.step.count' }, { done, total });

  const bindingCard = getBindingStepCard({
    byPlatform,
    configured: state.configured,
    isBound: state.isBound,
  });

  return (
    <div className="sw-grid sw-grid-cols-3 sw-gap-4">
      <StepCard
        isSelected={selectedStep === JourneyStep.Binding}
        onSelect={() => {
          onSelectStep(JourneyStep.Binding);
        }}
        ringLabel={bindingCard.ringLabel}
        secondaryLine={
          bindingCard.secondaryLineId === undefined
            ? undefined
            : formatMessage({ id: bindingCard.secondaryLineId })
        }
        title={formatMessage({ id: 'onboarding_dashboard.journey.step.binding.title' })}
        visual={bindingCard.visual}
      />

      <StepCard
        donutPercent={state.importedPct}
        isLocked={!state.isBound}
        isSelected={selectedStep === JourneyStep.Repositories}
        onSelect={() => {
          onSelectStep(JourneyStep.Repositories);
        }}
        secondaryLine={state.isBound ? countLabel(state.imported, state.discovered) : undefined}
        title={formatMessage({ id: 'onboarding_dashboard.journey.step.repositories.title' })}
        visual={state.isBound ? StepCardVisual.Donut : StepCardVisual.RingLocked}
      />

      <StepCard
        donutPercent={state.analyzedPct}
        isLocked={!state.isBound}
        isSelected={selectedStep === JourneyStep.Projects}
        onSelect={() => {
          onSelectStep(JourneyStep.Projects);
        }}
        secondaryLine={state.isBound ? countLabel(state.analyzed, state.totalProjects) : undefined}
        title={formatMessage({ id: 'onboarding_dashboard.journey.step.projects.title' })}
        visual={state.isBound ? StepCardVisual.Donut : StepCardVisual.RingLocked}
      />
    </div>
  );
}
