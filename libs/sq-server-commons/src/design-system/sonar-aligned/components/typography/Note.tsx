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

import styled from '@emotion/styled';
import * as Echoes from '@sonarsource/echoes-react';
import { cssVar } from '@sonarsource/echoes-react';
import tw from 'twin.macro';

/**
 * @deprecated Use {@link Echoes.Text | \<Text isSubdued\>} or {@link Echoes.HelperText | \<HelperText\>} components from Echoes instead.
 */
export const Note = styled.span`
  color: ${cssVar('color-text-subtle')};

  ${tw`sw-typo-default`}
`;
