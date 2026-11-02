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

import { ComponentProps, useContext } from 'react';
import { AppStateContext } from '../../../context/app-state/AppStateContext';
import { Avatar as BaseAvatar } from '../../../design-system';
import { GlobalSettingKeys } from '../../../types/settings';

type ExcludedProps =
  | 'enableGravatar'
  | 'gravatarServerUrl'
  | 'organizationAvatar'
  | 'organizationName';

type Props = Omit<ComponentProps<typeof BaseAvatar>, ExcludedProps> & {
  /**
   * @deprecated This prop is for compatibility with sq-cloud and should not be used by sq-server.
   */
  organization?: {
    avatar?: string;
    name?: string;
  };
};

export default function Avatar(props: Props) {
  const { settings } = useContext(AppStateContext);

  const enableGravatar = settings[GlobalSettingKeys.EnableGravatar] === 'true';
  const gravatarServerUrl = settings[GlobalSettingKeys.GravatarServerUrl] ?? '';

  if (props.organization) {
    throw new Error('SQ Server Avatar does not support organization');
  }

  return (
    <BaseAvatar enableGravatar={enableGravatar} gravatarServerUrl={gravatarServerUrl} {...props} />
  );
}
