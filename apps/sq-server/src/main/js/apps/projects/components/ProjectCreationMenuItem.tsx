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

import { ItemLink } from '~design-system';
import { translate } from '~sq-server-shared/helpers/l10n';
import { Image } from '~sq-server-shared/sonar-aligned/components/common/Image';
import { queryToSearchString } from '~sq-server-shared/sonar-aligned/helpers/urls';
import { AlmKeys } from '~sq-server-shared/types/alm-settings';

export interface ProjectCreationMenuItemProps {
  alm: string;
}

export default function ProjectCreationMenuItem(props: ProjectCreationMenuItemProps) {
  const { alm } = props;
  let almIcon = alm;
  if (alm === AlmKeys.BitbucketCloud) {
    almIcon = 'bitbucket';
  }
  return (
    <ItemLink
      className="sw-flex sw-items-center"
      to={{ pathname: '/projects/create', search: queryToSearchString({ mode: alm }) }}
    >
      {alm !== 'manual' && (
        <Image alt={alm} className="sw-mr-2" src={`/images/alm/${almIcon}.svg`} width={16} />
      )}
      {translate('my_account.add_project', alm)}
    </ItemLink>
  );
}
