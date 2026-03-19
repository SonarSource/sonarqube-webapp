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

import { Heading } from '@sonarsource/echoes-react';
import { ReactNode, useMemo } from 'react';
import { useIntl } from 'react-intl';
import {
  getDescriptionDescriptionAsIntlParams,
  getDescriptionNameAsIntlParams,
} from '../../helpers/configuration';
import { SafeHTMLInjection, SanitizeLevel } from '../../helpers/sanitize';
import { ExtendedSettingDefinition } from '../../types/settings';

interface Props {
  children?: ReactNode;
  definition: ExtendedSettingDefinition;
  descriptionOverride?: ReactNode;
  nameOverride?: string;
}

export default function DefinitionDescriptionBase({
  definition,
  descriptionOverride,
  nameOverride,
  children,
}: Readonly<Props>) {
  const intl = useIntl();

  const name = nameOverride ?? intl.formatMessage(getDescriptionNameAsIntlParams(definition));

  const finalDescription = useMemo(() => {
    // If description comes from UI, no need for html injection
    if (descriptionOverride) {
      return descriptionOverride;
    }

    const description = intl.formatMessage(getDescriptionDescriptionAsIntlParams(definition));

    if (description) {
      return (
        <SafeHTMLInjection htmlAsString={description} sanitizeLevel={SanitizeLevel.RESTRICTED}>
          <div className="markdown sw-mt-1" />
        </SafeHTMLInjection>
      );
    }
    return null;
  }, [descriptionOverride, definition, intl]);

  return (
    <div className="sw-w-abs-300">
      <Heading as="h4" className="sw-text-ellipsis sw-overflow-hidden">
        {name}
      </Heading>

      {finalDescription}

      {children}
    </div>
  );
}
