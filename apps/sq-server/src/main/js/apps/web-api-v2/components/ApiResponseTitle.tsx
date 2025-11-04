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

import { Badge, BadgeProps } from '@sonarsource/echoes-react';

interface Props {
  code: string;
  codeDescription: string;
}

export default function ApiResponseTitle({ code, codeDescription }: Props) {
  return (
    <div className="sw-flex sw-items-center sw-gap-2">
      <Badge variety={getResponseCodeVariety(code)}>{code}</Badge>
      <span>{codeDescription}</span>
    </div>
  );
}

export const getResponseCodeVariety = (code: string): BadgeProps['variety'] => {
  switch (code[0]) {
    case '1':
      return 'info'; // Blue for informational
    case '2':
      return 'success'; // Green for success
    case '3':
      return 'warning'; // Yellow for redirection/warning
    case '4':
    case '5':
      return 'danger'; // Red for client/server errors
    default:
      return 'neutral'; // Default gray for others
  }
};
