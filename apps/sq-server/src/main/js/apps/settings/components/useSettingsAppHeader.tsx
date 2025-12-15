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

import { useIntl } from 'react-intl';
import InstanceMessage from '~sq-server-commons/components/common/InstanceMessage';
import { getInstance } from '~sq-server-commons/helpers/system';
import { Component } from '~sq-server-commons/types/types';

export function useSettingsAppHeader(component?: Component) {
  const intl = useIntl();

  const pageTitle = component
    ? intl.formatMessage({ id: 'project_settings.page' })
    : intl.formatMessage({ id: 'settings.page' });

  const pageDescription = component ? (
    intl.formatMessage({ id: 'project_settings.page.description' })
  ) : (
    <InstanceMessage
      message={intl.formatMessage({ id: 'settings.page.description' }, { instance: getInstance() })}
    />
  );

  return { pageTitle, pageDescription };
}
