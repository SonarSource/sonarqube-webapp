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

import styled from '@emotion/styled';
import { cssVar } from '@sonarsource/echoes-react';
import { ReactEventHandler, useState } from 'react';
import { AvatarSize, sizeMap } from '~shared/components/avatar';
import { GenericAvatar } from './GenericAvatar';

interface AvatarProps {
  border?: boolean;
  className?: string;
  enableGravatar?: boolean;
  gravatarServerUrl?: string;
  hash?: string;
  name?: string;
  organizationAvatar?: string;
  organizationName?: string;
  size?: AvatarSize;
}

/**
 * @deprecated (!) Do not use directly. it requires the gravatar settings to properly fetch the avatars.
 * This is injected by the `Avatar` component in `sq-server-adapters/components/ui`
 */
export function Avatar({
  className,
  enableGravatar,
  gravatarServerUrl,
  hash,
  name,
  organizationAvatar,
  organizationName,
  size = 'sm',
  border,
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const numberSize = sizeMap[size];
  const resolvedName = organizationName ?? name;

  const handleImgError: ReactEventHandler<HTMLImageElement> = () => {
    setImgError(true);
  };

  if (!imgError) {
    if (enableGravatar && gravatarServerUrl && hash) {
      const url = gravatarServerUrl
        .replace('{EMAIL_MD5}', hash)
        .replace('{SIZE}', String(numberSize * 2));

      return (
        <StyledAvatar
          alt={resolvedName}
          className={className}
          height={numberSize}
          onError={handleImgError}
          role="img"
          src={url}
          style={borderStyle(border)}
          width={numberSize}
        />
      );
    }

    if (resolvedName && organizationAvatar) {
      return (
        <StyledAvatar
          alt={resolvedName}
          className={className}
          height={numberSize}
          onError={handleImgError}
          role="img"
          src={organizationAvatar}
          style={borderStyle(border)}
          width={numberSize}
        />
      );
    }
  }

  if (!resolvedName) {
    return null;
  }

  return <GenericAvatar className={className} name={resolvedName} size={size} />;
}

const borderStyle = (border = false) =>
  border
    ? { border: `${cssVar('border-width-default')} solid ${cssVar('color-border-weak')}` }
    : undefined;

const StyledAvatar = styled.img`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: top;
  border-radius: ${cssVar('border-radius-200', '0.25rem')};
  background: ${cssVar('color-surface-default')};
`;
