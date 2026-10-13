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
import { ButtonGroup, cssVar, Spinner } from '@sonarsource/echoes-react';

interface Props {
  loading?: boolean;
  primaryButton?: React.ReactNode;
  secondaryButton: React.ReactNode;
}

export function ModalFooter({ loading = false, primaryButton, secondaryButton }: Readonly<Props>) {
  return (
    <StyledFooter>
      <Spinner isLoading={loading} />

      <ButtonGroup>
        {primaryButton}
        {secondaryButton}
      </ButtonGroup>
    </StyledFooter>
  );
}

const StyledFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${cssVar('dimension-space-150', '0.75rem')};
`;
