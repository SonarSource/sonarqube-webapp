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

import { LinkHighlight, LinkStandalone, Text, TextSize } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import { Image } from '~adapters/components/common/Image';
import { useAlmIconSrc } from '~adapters/helpers/almIcons';
import { getProjectOverviewUrl } from '~shared/helpers/urls';
import { OnboardingAlm } from '~shared/types/onboarding';
import { PLATFORM_CONFIG } from '../devops/platformConfig';

interface Props {
  alm: OnboardingAlm | null;
  language?: string;
  name: string;
  path?: string;
  projectKey?: string | null;
}

export function RepositoryCell({ alm, language, name, path, projectKey }: Readonly<Props>) {
  const { formatMessage } = useIntl();
  const platformConfig = alm ? PLATFORM_CONFIG[alm] : undefined;
  const iconSrc = useAlmIconSrc(platformConfig?.imageKey);
  const almLabel = platformConfig ? formatMessage({ id: platformConfig.labelKey }) : '';

  const meta = [path, language].filter(Boolean).join(' · ');

  return (
    <div className="sw-flex sw-min-w-0 sw-items-center sw-justify-start sw-gap-2">
      {iconSrc !== undefined && (
        <Image alt={almLabel} className="sw-shrink-0" height={16} src={iconSrc} />
      )}
      <div className="sw-flex sw-min-w-0 sw-flex-col">
        {projectKey ? (
          <LinkStandalone highlight={LinkHighlight.Default} to={getProjectOverviewUrl(projectKey)}>
            {name}
          </LinkStandalone>
        ) : (
          <Text isHighlighted>{name}</Text>
        )}
        {meta !== '' && (
          <Text className="sw-truncate" isSubtle size={TextSize.Small}>
            {meta}
          </Text>
        )}
      </div>
    </div>
  );
}
