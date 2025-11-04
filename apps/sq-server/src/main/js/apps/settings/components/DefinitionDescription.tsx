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

import { Text, Tooltip } from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';
import DefinitionDescriptionBase from '~shared/components/configuration/DefinitionDescriptionBase';
import { ExtendedSettingDefinition } from '~shared/types/settings';

interface Props {
  definition: ExtendedSettingDefinition;
}

export default function DefinitionDescription({ definition }: Readonly<Props>) {
  const intl = useIntl();

  return (
    <DefinitionDescriptionBase definition={definition}>
      <Tooltip
        content={intl.formatMessage(
          {
            id: 'settings.key_x',
          },
          { 0: definition.key },
        )}
      >
        <Text as="div" className="sw-mt-4" isSubtle>
          <FormattedMessage id="settings.key_x" values={{ 0: definition.key }} />
        </Text>
      </Tooltip>
    </DefinitionDescriptionBase>
  );
}
