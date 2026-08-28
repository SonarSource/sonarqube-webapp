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
  OnboardingDevopsPlatform,
  OnboardingDevopsPlatformConfigurations,
} from '~shared/types/onboarding';
import { StepCardVisual } from '../../../../types/types';
import { getBindingStepCard } from '../bindingStepCard';

const GITHUB_ONLY: OnboardingDevopsPlatformConfigurations[] = [
  { count: 4, platform: OnboardingDevopsPlatform.Github },
];

it('puts the total in the ring when several configurations can coexist', () => {
  expect(getBindingStepCard({ byPlatform: GITHUB_ONLY, configured: 4, isBound: true })).toEqual({
    ringLabel: '4',
    visual: StepCardVisual.CountRing,
  });
});

it('keeps the bound caption on products that bind to a single platform', () => {
  expect(getBindingStepCard({ byPlatform: undefined, configured: 1, isBound: true })).toEqual({
    secondaryLineId: 'onboarding_dashboard.journey.step.binding.bound',
    visual: StepCardVisual.AvatarDone,
  });
});

it('reads as unbound while nothing is configured, whichever product it is', () => {
  const unbound = {
    secondaryLineId: 'onboarding_dashboard.journey.step.binding.unbound',
    visual: StepCardVisual.AvatarUnbound,
  };

  expect(getBindingStepCard({ byPlatform: undefined, configured: 0, isBound: false })).toEqual(
    unbound,
  );

  // An empty breakdown says the same thing as no breakdown at all — a "0" ring would not.
  expect(getBindingStepCard({ byPlatform: [], configured: 0, isBound: false })).toEqual(unbound);
});
