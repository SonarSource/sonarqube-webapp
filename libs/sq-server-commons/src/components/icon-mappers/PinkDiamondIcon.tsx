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
import { IconDiamond } from '~shared/components/icon-mappers/IconDiamond';

// This component will be replaceable once diamond is an icon font
export function PinkDiamond() {
  return (
    <PinkDiamondSpan>
      <IconDiamond />
    </PinkDiamondSpan>
  );
}

// the color corresponds to COLORS.upgradePlanColors.pink[2] in sq-cloud
const PinkDiamondSpan = styled.span`
  color: rgb(212, 42, 161);
`;
