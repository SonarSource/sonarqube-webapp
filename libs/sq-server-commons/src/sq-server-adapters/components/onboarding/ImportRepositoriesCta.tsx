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
  Button,
  ButtonVariety,
  DropdownMenu,
  DropdownMenuAlign,
  IconChevronDown,
} from '@sonarsource/echoes-react';
import { PropsWithChildren, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { queryToSearchString } from '~shared/helpers/query';
import { getAlmSettingsNoCatch } from '../../../api/alm-settings';
import { getBoundAlmKeys } from '../../../helpers/alm-settings';
import { almKeyToIconKey } from '../../../helpers/almIcons';
import { IMPORT_COMPATIBLE_ALMS } from '../../../helpers/constants';
import { hasGlobalPermission } from '../../../helpers/users';
import { AlmKeys } from '../../../types/alm-settings';
import { Permissions } from '../../../types/permissions';
import { useAlmIconSrc } from '../../helpers/almIcons';
import { useCurrentUser } from '../../helpers/users';
import { Image } from '../common/Image';

interface Props {
  variety?: ButtonVariety;
}

export function ImportRepositoriesCta({ children, variety }: Readonly<PropsWithChildren<Props>>) {
  const { formatMessage } = useIntl();
  const { currentUser } = useCurrentUser();
  const canCreateProject = hasGlobalPermission(currentUser, Permissions.ProjectCreation);
  const [boundAlms, setBoundAlms] = useState<AlmKeys[]>([]);
  const [loading, setLoading] = useState(canCreateProject);

  useEffect(() => {
    if (!canCreateProject) {
      return;
    }

    setLoading(true);

    getAlmSettingsNoCatch()
      .then((almSettings) => {
        setBoundAlms(getBoundAlmKeys(almSettings));
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, [canCreateProject]);

  if (!canCreateProject) {
    return null;
  }

  return (
    <DropdownMenu
      align={DropdownMenuAlign.End}
      items={
        <>
          {boundAlms.map((alm) => (
            <AlmDropdownItem alm={alm} key={alm} />
          ))}
          {boundAlms.length < IMPORT_COMPATIBLE_ALMS.length && (
            <>
              {boundAlms.length > 0 && <DropdownMenu.Separator />}
              <DropdownMenu.ItemLink to={{ pathname: '/projects/create' }}>
                {formatMessage({
                  id:
                    boundAlms.length === 0
                      ? 'my_account.add_project.more'
                      : 'my_account.add_project.more_others',
                })}
              </DropdownMenu.ItemLink>
            </>
          )}
        </>
      }
    >
      <Button
        isLoading={loading}
        suffix={<IconChevronDown className="sw-ml-1" />}
        variety={variety}
      >
        {children}
      </Button>
    </DropdownMenu>
  );
}

function AlmDropdownItem({ alm }: Readonly<{ alm: AlmKeys }>) {
  const { formatMessage } = useIntl();
  const iconSrc = useAlmIconSrc(almKeyToIconKey(alm));

  return (
    <DropdownMenu.ItemLink
      to={{ pathname: '/projects/create', search: queryToSearchString({ mode: alm }) }}
    >
      <Image alt={alm} className="sw-mr-2" src={iconSrc} width={16} />
      {formatMessage({ id: `my_account.add_project.${alm}` })}
    </DropdownMenu.ItemLink>
  );
}
