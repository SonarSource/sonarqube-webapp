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

import { Banner, Link } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { getProjectSettingsUrl } from '~sq-server-commons/helpers/urls';
import { Component } from '~sq-server-commons/types/types';
import { PULL_REQUEST_DECORATION_BINDING_CATEGORY } from '../../../../apps/settings/constants';

export interface ComponentNavProjectBindingErrorNotifProps {
  component: Component;
}

export default function ComponentNavProjectBindingErrorNotif(
  props: Readonly<ComponentNavProjectBindingErrorNotifProps>,
) {
  const { component } = props;
  let action;

  if (component.configuration?.showSettings) {
    action = (
      <Link
        highlight="current-color"
        to={getProjectSettingsUrl(component.key, PULL_REQUEST_DECORATION_BINDING_CATEGORY)}
      >
        <FormattedMessage id="component_navigation.pr_deco.action.check_project_settings" />
      </Link>
    );
  } else {
    action = <FormattedMessage id="component_navigation.pr_deco.action.contact_project_admin" />;
  }

  return (
    <Banner type="warning">
      <FormattedMessage id="component_navigation.pr_deco.error_detected_X" values={{ action }} />
    </Banner>
  );
}
