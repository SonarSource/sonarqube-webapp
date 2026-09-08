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

import { Text } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { HealthTypes, SysInfoBase } from '~sq-server-commons/types/types';
import { getAgenticHarnessSections } from '../utils';
import HealthCard from './info-items/HealthCard';

interface Props {
  expandedCards: string[];
  sysInfoData: SysInfoBase;
  toggleCard: (toggledCard: string) => void;
}

export function AgenticHarnessSysInfos({
  expandedCards,
  sysInfoData,
  toggleCard,
}: Readonly<Props>) {
  const sections = getAgenticHarnessSections(sysInfoData);

  if (sections.length === 0) {
    return null;
  }

  return (
    <>
      <li>
        <Text isSubtle>
          <FormattedMessage id="system.agentic_harness_title" />
        </Text>
      </li>
      {sections.map(({ name, section }) => (
        <HealthCard
          health={section.Healthy === false ? HealthTypes.RED : HealthTypes.GREEN}
          healthCauses={typeof section.Error === 'string' ? [section.Error] : undefined}
          key={name}
          name={name}
          onClick={toggleCard}
          open={expandedCards.includes(name)}
          sysInfoData={section}
        />
      ))}
    </>
  );
}
