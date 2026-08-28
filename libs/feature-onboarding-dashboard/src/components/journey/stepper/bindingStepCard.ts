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

import { OnboardingDevopsConfigurations } from '~shared/types/onboarding';
import { StepCardVisual } from '../../../types/types';

interface BindingStepCardArgs {
  /** Per-platform configuration counts, or `undefined` on single-binding products. */
  byPlatform: OnboardingDevopsConfigurations['byPlatform'];
  configured: number;
  isBound: boolean;
}

interface BindingStepCard {
  ringLabel?: string;
  /** Message id of the caption under the title, omitted when the ring already carries the count. */
  secondaryLineId?: string;
  visual: StepCardVisual;
}

// Products that can hold several configurations show the count inside the ring, so the "Configured"
// caption would only repeat it. Single-binding products keep the bound/unbound avatar and caption.
export function getBindingStepCard({
  byPlatform,
  configured,
  isBound,
}: BindingStepCardArgs): BindingStepCard {
  if (byPlatform !== undefined && configured > 0) {
    return { ringLabel: String(configured), visual: StepCardVisual.CountRing };
  }

  return isBound
    ? {
        secondaryLineId: 'onboarding_dashboard.journey.step.binding.bound',
        visual: StepCardVisual.AvatarDone,
      }
    : {
        secondaryLineId: 'onboarding_dashboard.journey.step.binding.unbound',
        visual: StepCardVisual.AvatarUnbound,
      };
}
