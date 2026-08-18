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

import { cssVar, Text } from '@sonarsource/echoes-react';
import type { ReactNode } from 'react';

type Props = {
  sectionDescription: string;
  titleRow: ReactNode;
};

function sectionHeaderHasDescription(sectionDescription: string): boolean {
  return Boolean(sectionDescription.trim());
}

/**
 * SC-47130 / SC-47122 / SC-47131: shared explicit-section header text stack (Echoes body/small +
 * subdued; title–description gap from Figma Part 2 Story 6). Empty descriptions omit the second
 * line and gap; no extra title bottom padding (header row stays vertically centered).
 */
export function SectionHeaderTitleAndDescriptionColumn(props: Readonly<Props>) {
  const { sectionDescription, titleRow } = props;
  const hasDescription = sectionHeaderHasDescription(sectionDescription);

  return (
    <div
      className="sw-text-left"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: hasDescription ? cssVar('dimension-space-100') : undefined,
      }}
    >
      {titleRow}
      {hasDescription ? (
        <Text isSubtle size="small">
          {sectionDescription}
        </Text>
      ) : null}
    </div>
  );
}
