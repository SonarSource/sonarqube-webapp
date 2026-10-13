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

/** @deprecated Use Heading from Echoes instead.
 */
export const Title = styled.h1`
  font: ${cssVar('typography-heading-xlarge')};
  letter-spacing: ${cssVar('letter-spacing-decreased')};
  margin-bottom: ${cssVar('dimension-space-200', '1rem')};
  color: ${cssVar('color-text-strong')};
`;

/** @deprecated Use Heading from Echoes instead.
 */
export const SubTitle = styled.h2`
  font: ${cssVar('typography-heading-large')};
  letter-spacing: ${cssVar('letter-spacing-decreased')};
  margin-bottom: ${cssVar('dimension-space-200', '1rem')};
  color: ${cssVar('color-text-strong')};
`;

/** @deprecated Use Heading from Echoes instead.
 */
export const HeadingDark = styled.h2`
  color: ${cssVar('color-text-strong')};

  font: ${cssVar('typography-text-default-semi-bold')};
`;

/** @deprecated Use Heading from Echoes instead.
 */
export const SubHeading = styled.h3`
  font: ${cssVar('typography-text-large-semi-bold')};
  margin-bottom: ${cssVar('dimension-space-100', '0.5rem')};
  color: ${cssVar('color-text-default')};
`;

/** @deprecated Use Heading from Echoes instead.
 */
export const SubHeadingHighlight = styled(SubHeading)`
  color: ${cssVar('color-text-strong')};
`;
