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

import { Card } from '@sonarsource/echoes-react';
import { JourneyState, JourneyStep } from '../../../types/types';
import { AnalyzeProjectsPanel } from './AnalyzeProjectsPanel';
import { ImportRepositoriesPanel } from './ImportRepositoriesPanel';
import { OrganizationBindingPanel } from './OrganizationBindingPanel';

interface Props {
  onSelectStep: (step: JourneyStep) => void;
  selectedStep: JourneyStep;
  state: JourneyState;
}

function renderPanel(
  selectedStep: JourneyStep,
  state: JourneyState,
  onSelectStep: (step: JourneyStep) => void,
) {
  switch (selectedStep) {
    case JourneyStep.Binding:
      return <OrganizationBindingPanel onSelectStep={onSelectStep} state={state} />;
    case JourneyStep.Repositories:
      return <ImportRepositoriesPanel onSelectStep={onSelectStep} state={state} />;
    case JourneyStep.Projects:
      return <AnalyzeProjectsPanel state={state} />;
  }
}

/**
 * Renders the detail panel for the currently-selected onboarding step inside a single bordered card
 * under the stepper. Purely a router — each step's content lives in its own panel component.
 */
export function DetailPanel({ onSelectStep, selectedStep, state }: Readonly<Props>) {
  return (
    <Card>
      <Card.Body>{renderPanel(selectedStep, state, onSelectStep)}</Card.Body>
    </Card>
  );
}
