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

import { Card, Text, TextSize } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import { OnboardingMomentum } from '~shared/types/onboarding';
import { NO_DATA } from '../dashboardConstants';
import { MomentumChart } from './MomentumChart';

interface Props {
  momentum: OnboardingMomentum;
}

export function OnboardingMomentumCard({ momentum }: Readonly<Props>) {
  const { formatMessage } = useIntl();

  return (
    <Card className="sw-flex sw-h-full sw-flex-col">
      <Card.Header
        description={formatMessage({ id: 'onboarding_dashboard.momentum.description' })}
        title={formatMessage({ id: 'onboarding_dashboard.momentum.title' })}
      />
      <Card.Body className="sw-flex sw-min-h-0 sw-grow sw-flex-col">
        <div className="sw-flex sw-h-full sw-min-h-0 sw-flex-col sw-gap-4">
          <div className="sw-flex sw-items-baseline sw-gap-2">
            <Text isHighlighted size={TextSize.Large}>
              {momentum.onboardedCount}
            </Text>
            <Text isSubtle>
              {formatMessage(
                { id: 'onboarding_dashboard.momentum.headline_suffix' },
                { total: momentum.totalRepos ?? NO_DATA },
              )}
            </Text>
          </div>

          <div className="sw-min-h-0 sw-grow">
            <MomentumChart momentum={momentum} />
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}
