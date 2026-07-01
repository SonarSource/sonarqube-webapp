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

import { cssVar, IconSlash, Text, TextSize } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import { Image } from '~adapters/components/common/Image';
import { OnboardingDevopsPlatform, OnboardingDevopsPlatformShare } from '~shared/types/onboarding';
import { DevopsProgressBar } from './DevopsProgressBar';
import { PLATFORM_CONFIG } from './platformConfig';

const NOT_BOUND_COLOR = cssVar('color-text-subtle');

interface Props {
  share: OnboardingDevopsPlatformShare;
}

export function DevopsPlatformRow({ share }: Readonly<Props>) {
  const { formatMessage } = useIntl();

  const config =
    share.platform === OnboardingDevopsPlatform.NotBound
      ? undefined
      : PLATFORM_CONFIG[share.platform];
  const color = config?.color ?? NOT_BOUND_COLOR;
  const name = config
    ? formatMessage({ id: config.labelKey })
    : formatMessage({ id: 'onboarding_dashboard.devops.not_bound' });

  return (
    <div className="sw-flex sw-flex-col sw-gap-2 sw-py-3">
      <div className="sw-flex sw-items-center sw-justify-between">
        <div className="sw-flex sw-shrink-0 sw-items-center sw-justify-center sw-gap-2 sw-w-[150px]">
          {config?.imageKey === undefined ? (
            <IconSlash color="echoes-color-icon-subtle" />
          ) : (
            <Image alt="" height={20} src={`/images/alm/${config.imageKey}.svg`} />
          )}
          <p className="sw-grow sw-truncate sw-font-semibold" style={{ color }}>
            {name}
          </p>
        </div>

        <Text as="p" isSubtle size={TextSize.Small}>
          {formatMessage({ id: 'onboarding_dashboard.devops.count' }, { count: share.count })}
        </Text>
        <Text as="p" isSubtle size={TextSize.Small}>
          {formatMessage(
            { id: 'onboarding_dashboard.devops.share' },
            { percent: Math.round(share.percentage ?? 0) },
          )}
        </Text>
      </div>

      <DevopsProgressBar ariaLabel={name} color={color} value={share.percentage ?? 0} />
    </div>
  );
}
