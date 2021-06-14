/*
 * SonarQube
 * Copyright (C) 2009-2021 SonarSource SA
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
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router';
import { Alert } from 'sonar-ui-common/components/ui/Alert';
import { translate } from 'sonar-ui-common/helpers/l10n';
import { PULL_REQUEST_DECORATION_BINDING_CATEGORY } from '../../../../apps/settings/components/AdditionalCategoryKeys';

export interface ComponentNavProjectBindingErrorNotifProps {
  component: T.Component;
}

export function ComponentNavProjectBindingErrorNotif(
  props: ComponentNavProjectBindingErrorNotifProps
) {
  const { component } = props;
  let action;

  if (component.configuration?.showSettings) {
    action = (
      <Link
        to={{
          pathname: '/project/settings',
          query: { category: PULL_REQUEST_DECORATION_BINDING_CATEGORY, id: component.key }
        }}>
        {translate('component_navigation.pr_deco.action.check_project_settings')}
      </Link>
    );
  } else {
    action = translate('component_navigation.pr_deco.action.contact_project_admin');
  }

  return (
    <Alert display="banner" variant="warning">
      <FormattedMessage
        defaultMessage={translate('component_navigation.pr_deco.error_detected_X')}
        id="component_navigation.pr_deco.error_detected_X"
        values={{ action }}
      />
    </Alert>
  );
}

export default ComponentNavProjectBindingErrorNotif;
