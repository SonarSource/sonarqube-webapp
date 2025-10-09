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

import { Heading, Text, TextSize } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import { CardSeparator } from '~design-system';
import { isDefined } from '~shared/helpers/types';
import { addons } from '~sq-server-addons/index';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import { Feature } from '~sq-server-commons/types/features';

export function EarlyAccessFeatures() {
  const { hasFeature } = useAvailableFeatures();
  const intl = useIntl();

  const Architecture = addons.architecture?.ArchitectureEnablementForm;

  return (
    <>
      <Heading as="h2" className="sw-mb-4">
        {intl.formatMessage({ id: 'settings.early_access.title' })}
      </Heading>
      <Text as="p" className="sw-mb-4" size={TextSize.Large}>
        {intl.formatMessage({ id: 'settings.early_access.description' })}
      </Text>
      <div className="sw-flex sw-flex-col sw-gap-4">
        {hasFeature(Feature.Architecture) && isDefined(Architecture) && (
          <>
            <CardSeparator />
            <Architecture />
          </>
        )}
      </div>
    </>
  );
}
