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
import { ContentCell } from '~design-system';
import { translate } from '~sq-server-commons/helpers/l10n';
import { InstalledPlugin } from '~sq-server-commons/types/plugins';
import PluginDescription from './PluginDescription';
import PluginLicense from './PluginLicense';
import PluginOrganization from './PluginOrganization';
import PluginStatus from './PluginStatus';
import PluginUpdates from './PluginUpdates';
import PluginUrls from './PluginUrls';

interface Props {
  plugin: InstalledPlugin;
  readOnly: boolean;
  refreshPending: () => void;
  status?: string;
}

export default function PluginInstalled({
  plugin,
  readOnly,
  refreshPending,
  status,
}: Readonly<Props>) {
  return (
    <>
      <PluginDescription plugin={plugin} />
      <ContentCell>
        <StyledUnorderedList as="ul">
          <li>
            <strong className="sw-mr-1">{plugin.version}</strong>
            {translate('marketplace._installed')}
          </li>
          <PluginUpdates pluginName={plugin.name} updates={plugin.updates} />
        </StyledUnorderedList>
      </ContentCell>

      <ContentCell>
        <StyledUnorderedList as="ul">
          <PluginUrls plugin={plugin} />
          <PluginLicense license={plugin.license} />
          <PluginOrganization plugin={plugin} />
        </StyledUnorderedList>
      </ContentCell>

      {!readOnly && (
        <ContentCell>
          <PluginStatus plugin={plugin} refreshPending={refreshPending} status={status} />
        </ContentCell>
      )}
    </>
  );
}

const StyledUnorderedList = styled(Text)`
  list-style-type: none;
  margin-top: 0;
  max-width: 100%;

  & li:first {
    margin-top: 0;
  }
`;
