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

import { Button, ButtonVariety } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import { OnboardingAlm, OnboardingDevopsPlatformConfigurations } from '~shared/types/onboarding';
import { JourneyStep } from '../../../types/types';
import { PLATFORM_CONFIG } from '../../devops/platformConfig';
import { PanelDonut, PanelDonutSegment } from '../charts/PanelDonut';
import { DevopsConfigurationsModal } from '../modals/DevopsConfigurationsModal';

interface Props {
  /** Per-platform counts. Expected non-empty. */
  byPlatform: OnboardingDevopsPlatformConfigurations[];
  /** Total number of configurations, from the overview response. */
  configured: number;
  /** Lets the details modal hand the user on to another step of the journey. */
  onSelectStep: (step: JourneyStep) => void;
}

// Segments follow PLATFORM_CONFIG's declaration order, not the response order, so the ring and
// legend stay stable across reloads. Platforms with no configuration are left out.
export function DevopsConfigurationsDonut({
  byPlatform,
  configured,
  onSelectStep,
}: Readonly<Props>) {
  const { formatMessage } = useIntl();

  const countsByPlatform = new Map(byPlatform.map(({ count, platform }) => [platform, count]));

  const segments: PanelDonutSegment[] = Object.entries(PLATFORM_CONFIG).flatMap(
    ([platform, config]) => {
      const count = countsByPlatform.get(platform as OnboardingAlm) ?? 0;

      return count === 0
        ? []
        : [{ color: config.color, label: formatMessage({ id: config.labelKey }), value: count }];
    },
  );

  return (
    <PanelDonut
      centerLabel={configured}
      centerSubLabel={formatMessage({
        id: 'onboarding_dashboard.journey.binding.configured_label',
      })}
      segments={segments}
      viewAll={
        <DevopsConfigurationsModal onSelectStep={onSelectStep}>
          <Button variety={ButtonVariety.PrimaryGhost}>
            {formatMessage({ id: 'onboarding_dashboard.journey.binding.view_details' })}
          </Button>
        </DevopsConfigurationsModal>
      }
    />
  );
}
