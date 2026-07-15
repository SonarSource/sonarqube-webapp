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
import { Image } from '~adapters/components/common/Image';
import { Button, ButtonProps } from './Button';

interface ThirdPartyProps extends Omit<ButtonProps, 'Icon'> {
  iconPath: string;
  name: string;
}

export function ThirdPartyButton({
  children,
  iconPath,
  name,
  ...buttonProps
}: Readonly<ThirdPartyProps>) {
  const size = 16;
  return (
    <ThirdPartyButtonStyled {...buttonProps}>
      <Image alt={name} className="sw-mr-2" height={size} src={iconPath} width={size} />
      {children}
    </ThirdPartyButtonStyled>
  );
}

const ThirdPartyButtonStyled = styled(Button)`
  --background: ${cssVar('color-surface-default')};
  --backgroundHover: ${cssVar('color-surface-hover')};
  --color: ${cssVar('color-text-default')};
  --focus: color-mix(in srgb, ${cssVar('color-border-bold')} 20%, transparent);
  --border: ${cssVar('border-width-default')} solid ${cssVar('color-border-bold')};
`;
