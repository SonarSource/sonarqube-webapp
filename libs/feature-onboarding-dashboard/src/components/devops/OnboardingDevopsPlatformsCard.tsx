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
import { OnboardingDevopsPlatforms } from '~shared/types/onboarding';
import { DevopsPlatformRow } from './DevopsPlatformRow';

interface Props {
  data: OnboardingDevopsPlatforms;
}

export function OnboardingDevopsPlatformsCard({ data }: Readonly<Props>) {
  const { formatMessage } = useIntl();

  return (
    <Card className="sw-min-w-0">
      <Card.Header
        description={formatMessage({ id: 'onboarding_dashboard.devops.description' })}
        title={formatMessage({ id: 'onboarding_dashboard.devops.title' })}
      />
      <Card.Body>
        <div className="sw-flex sw-flex-col">
          <div className="sw-w-full sw-flex sw-items-center sw-justify-end">
            <Text isSubtle size={TextSize.Small}>
              {formatMessage(
                { id: 'onboarding_dashboard.devops.platform_count' },
                { count: data.shares.length, b: (count) => <Text isHighlighted>{count}</Text> },
              )}
            </Text>
          </div>
          {data.shares.map((share) => (
            <DevopsPlatformRow key={share.platform} share={share} />
          ))}
        </div>
      </Card.Body>
    </Card>
  );
}
