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
import { sortBy } from 'lodash';
import { translate } from '~sq-server-commons/helpers/l10n';
import { Release, Update } from '~sq-server-commons/types/plugins';
import PluginChangeLogItem from './PluginChangeLogItem';

export interface Props {
  release: Release;
  update: Update;
}

export default function PluginChangeLog({ release, update }: Props) {
  return (
    <div className="sw-p-4">
      <Text isHighlighted size="large">
        {translate('changelog')}
      </Text>
      <Text as="ul" className="sw-list-none sw-max-w-full">
        {update.previousUpdates &&
          sortBy(update.previousUpdates, (prevUpdate) => prevUpdate.release?.date).map(
            (previousUpdate) =>
              previousUpdate.release ? (
                <PluginChangeLogItem
                  key={previousUpdate.release.version}
                  release={previousUpdate.release}
                  update={previousUpdate}
                />
              ) : null,
          )}
        <PluginChangeLogItem release={release} update={update} />
      </Text>
    </div>
  );
}
