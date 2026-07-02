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
import { cssVar, Heading, Text } from '@sonarsource/echoes-react';
import { ReactNode } from 'react';
import tw from 'twin.macro';

interface Props {
  actions?: ReactNode;
  className?: string;
  description: ReactNode;
  icon: ReactNode;
  title: ReactNode;
}

export function QualityGateHistoryEmptyState(props: Readonly<Props>) {
  const { actions, className, description, icon, title } = props;

  return (
    <div
      className={`sw-flex sw-flex-col sw-items-center sw-gap-3 sw-py-8 sw-text-center ${className ?? ''}`}
    >
      <IconWrapper>{icon}</IconWrapper>

      <Heading as="h2" size="medium">
        {title}
      </Heading>

      <Text isSubtle>{description}</Text>

      {actions}
    </div>
  );
}

const IconWrapper = styled.div`
  ${tw`sw-p-2`};
  border-radius: ${cssVar('border-radius-400')};
  background-color: ${cssVar('color-background-neutral-subtle-default')};
`;
