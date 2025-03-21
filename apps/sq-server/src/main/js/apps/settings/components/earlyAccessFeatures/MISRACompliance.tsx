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

import { Heading, Text } from '@sonarsource/echoes-react';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import RestartButton from '~sq-server-shared/components/common/RestartButton';
import { useSystemStatusQuery } from '~sq-server-shared/queries/system';
import { SettingsKey } from '~sq-server-shared/types/settings';
import { SimpleEarlyAccessFeature } from './SimpleEarlyAccessFeature';

export function MISRACompliance() {
  const intl = useIntl();
  const [showRestartButton, setShowRestartButton] = useState(false);
  const { data: systemStatus, refetch } = useSystemStatusQuery();

  const handleSaved = () => {
    setShowRestartButton(true);
  };

  return (
    <>
      <SimpleEarlyAccessFeature onChanged={handleSaved} settingKey={SettingsKey.MISRACompliance}>
        <Heading as="h3" className="sw-mb-6">
          {intl.formatMessage({ id: 'settings.early_access.misra.title' })}
        </Heading>
        <Text as="p">
          {intl.formatMessage({ id: 'settings.early_access.misra.description.line1' })}
        </Text>
        <Text as="p" className="sw-mt-4">
          {intl.formatMessage({ id: 'settings.early_access.misra.description.line2' })}
        </Text>
      </SimpleEarlyAccessFeature>
      {showRestartButton && systemStatus?.status && (
        <div>
          <RestartButton fetchSystemStatus={refetch} systemStatus={systemStatus.status} />
        </div>
      )}
    </>
  );
}
