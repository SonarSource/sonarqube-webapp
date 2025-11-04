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
import { Text } from '@sonarsource/echoes-react';
import { SubnavigationHeading, themeBorder } from '~design-system';
import { collapsePath } from '~sq-server-commons/helpers/path';

const COLLAPSE_PATH_LIMIT = 8;

interface Props {
  path: string;
}

export default function SubnavigationIssueComponentName({ path }: Props) {
  return (
    <StyledHeading className="sw-pb-1 sw-pt-6 sw-flex sw-truncate" title={path}>
      <Text className="sw-truncate" isSubtle>
        {collapsePath(path, COLLAPSE_PATH_LIMIT)}
      </Text>
    </StyledHeading>
  );
}

const StyledHeading = styled(SubnavigationHeading)`
  &:not(:last-child) {
    border-bottom: ${themeBorder('default')};
  }
`;
