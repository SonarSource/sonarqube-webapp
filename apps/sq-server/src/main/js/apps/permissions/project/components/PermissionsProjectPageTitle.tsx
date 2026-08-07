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

import { FormattedMessage, useIntl } from 'react-intl';
import { Image } from '~adapters/components/common/Image';
import { useAlmIconSrc } from '~adapters/helpers/almIcons';
import { AlmKeys } from '~sq-server-commons/types/alm-settings';
import { Component } from '~sq-server-commons/types/types';
import { useProjectProvisionedStatus } from './useProjectProvisionedStatus';

interface Props {
  component: Component;
  isProjectManaged: boolean;
}

export function PermissionsProjectPageTitle(props: Readonly<Props>) {
  const { component, isProjectManaged } = props;
  const intl = useIntl();

  const { provisioned, provisionedByGitHub } = useProjectProvisionedStatus(
    component,
    isProjectManaged,
  );

  const iconUrl = useAlmIconSrc(provisionedByGitHub ? AlmKeys.GitHub : AlmKeys.GitLab);

  return (
    <>
      <FormattedMessage id="permissions.page" />
      {provisioned && (
        <Image
          alt={provisionedByGitHub ? 'github' : 'gitlab'}
          aria-label={intl.formatMessage(
            { id: 'project_permission.managed' },
            {
              0: provisionedByGitHub
                ? intl.formatMessage({ id: 'alm.github' })
                : intl.formatMessage({ id: 'alm.gitlab' }),
            },
          )}
          className="sw-mx-2 sw-align-baseline"
          height={16}
          src={iconUrl}
        />
      )}
    </>
  );
}
