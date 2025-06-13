/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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

import { Badge, BadgeProps, IconSparkle } from '@sonarsource/echoes-react';
import { forwardRef } from 'react';
import { FormattedMessage } from 'react-intl';

export type Props = Omit<BadgeProps, 'children' | 'IconLeft' | 'variety'>;

export const ContainsAICodeBadge = forwardRef<HTMLButtonElement, Props>((props, ref) => {
  return (
    <Badge {...props} IconLeft={IconSparkle} ref={ref} variety="highlight">
      <FormattedMessage id="contains_ai_code" />
    </Badge>
  );
});
ContainsAICodeBadge.displayName = 'ContainsAICodeBadge';
