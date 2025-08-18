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
import { Text } from '@sonarsource/echoes-react';
import { translate } from '~sq-server-commons/helpers/l10n';
import { HotspotStatusOption } from '~sq-server-commons/types/security-hotspots';

export interface StatusDescriptionProps {
  statusOption: HotspotStatusOption;
}

export default function StatusDescription(props: StatusDescriptionProps) {
  const { statusOption } = props;

  return (
    <div>
      <h2>
        <Text isHighlighted>
          {`${translate('status')}: `}
          {translate('hotspots.status_option', statusOption)}
        </Text>
      </h2>
      <Description className="sw-mt-1">
        <Text isSubtle>{translate('hotspots.status_option', statusOption, 'description')}</Text>
      </Description>
    </div>
  );
}

const Description = styled.div`
  max-width: 360px;
`;
