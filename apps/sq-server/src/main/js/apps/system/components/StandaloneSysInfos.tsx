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
import { map } from 'lodash';
import { SysInfoStandalone } from '~sq-server-commons/types/types';
import {
  getHealth,
  getHealthCauses,
  getStandaloneMainSections,
  getStandaloneSecondarySections,
  ignoreInfoFields,
} from '../utils';
import HealthCard from './info-items/HealthCard';

interface Props {
  expandedCards: string[];
  sysInfoData: SysInfoStandalone;
  toggleCard: (toggledCard: string) => void;
}

const mainCardName = 'System';

export default function StandAloneSysInfos({
  expandedCards,
  sysInfoData,
  toggleCard,
}: Readonly<Props>) {
  return (
    <Text as="ul" className="sw-list-none sw-flex sw-flex-col sw-gap-4">
      <HealthCard
        health={getHealth(sysInfoData)}
        healthCauses={getHealthCauses(sysInfoData)}
        name={mainCardName}
        onClick={toggleCard}
        open={expandedCards.includes(mainCardName)}
        sysInfoData={ignoreInfoFields(getStandaloneMainSections(sysInfoData))}
      />
      {map(getStandaloneSecondarySections(sysInfoData), (section, name) => (
        <HealthCard
          key={name}
          name={name}
          onClick={toggleCard}
          open={expandedCards.includes(name)}
          sysInfoData={ignoreInfoFields(section)}
        />
      ))}
    </Text>
  );
}
