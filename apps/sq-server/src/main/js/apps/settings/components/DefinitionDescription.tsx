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

import {
  LinkHighlight,
  MessageCallout,
  MessageVariety,
  Text,
  Tooltip,
} from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';
import DefinitionDescriptionBase from '~shared/components/configuration/DefinitionDescriptionBase';
import { ExtendedSettingDefinition } from '~shared/types/settings';
import DocumentationLink from '~sq-server-commons/components/common/DocumentationLink';
import { hasMessage } from '~sq-server-commons/helpers/l10n';
import { DEPRECATED_SETTINGS_KEYS, SettingsKey } from '~sq-server-commons/types/settings';
import { Component } from '~sq-server-commons/types/types';
import { DEFINITION_DESCRIPTION_SETING_DOC_LINKS } from '../constants';

interface Props {
  component?: Component;
  definition: ExtendedSettingDefinition;
}

export default function DefinitionDescription({ component, definition }: Readonly<Props>) {
  const intl = useIntl();
  const isDeprecated = DEPRECATED_SETTINGS_KEYS.includes(definition.key as SettingsKey);

  const descriptionKey = component
    ? `property.${definition.key}.description.project`
    : `property.${definition.key}.description`;

  const descriptionOverride = hasMessage(descriptionKey)
    ? intl.formatMessage(
        { id: descriptionKey },
        {
          docLink: (text) => (
            <DocumentationLink
              highlight={LinkHighlight.CurrentColor}
              to={DEFINITION_DESCRIPTION_SETING_DOC_LINKS[definition.key]}
            >
              {text}
            </DocumentationLink>
          ),
        },
      )
    : undefined;

  const nameKey = component
    ? `property.${definition.key}.name.project`
    : `property.${definition.key}.name`;
  const nameOverride = hasMessage(nameKey) ? intl.formatMessage({ id: nameKey }) : undefined;

  return (
    <DefinitionDescriptionBase
      definition={definition}
      descriptionOverride={descriptionOverride}
      nameOverride={nameOverride}
    >
      {isDeprecated && (
        <MessageCallout variety={MessageVariety.Warning}>
          <FormattedMessage id="settings.deprecated_setting_warning" />
        </MessageCallout>
      )}
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
