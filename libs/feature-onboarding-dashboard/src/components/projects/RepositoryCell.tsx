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

import { Text, TextSize } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import { Image } from '~adapters/components/common/Image';
import { OnboardingProject } from '~shared/types/onboarding';
import { PLATFORM_CONFIG } from '../devops/platformConfig';

interface Props {
  project: OnboardingProject;
}

export function RepositoryCell({ project }: Readonly<Props>) {
  const { formatMessage } = useIntl();
  const platformConfig = project.alm ? PLATFORM_CONFIG[project.alm] : undefined;
  const imageKey = platformConfig?.imageKey;
  const almLabel = platformConfig ? formatMessage({ id: platformConfig.labelKey }) : '';

  const meta = [project.path, project.language].filter(Boolean).join(' · ');

  return (
    <div className="sw-flex sw-min-w-0 sw-items-center sw-justify-start sw-gap-2">
      {imageKey !== undefined && (
        <Image
          alt={almLabel}
          className="sw-shrink-0"
          height={16}
          src={`/images/alm/${imageKey}.svg`}
        />
      )}
      <div className="sw-flex sw-min-w-0 sw-flex-col">
        <Text isHighlighted>{project.name}</Text>
        {meta !== '' && (
          <Text className="sw-truncate" isSubtle size={TextSize.Small}>
            {meta}
          </Text>
        )}
      </div>
    </div>
  );
}
