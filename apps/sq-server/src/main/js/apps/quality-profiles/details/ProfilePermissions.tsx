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

import { Button, Spinner, Text } from '@sonarsource/echoes-react';
import { sortBy } from 'lodash';
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { CellComponent, SubTitle, Table, TableRow } from '~design-system';
import { useProfilePermissionsQuery } from '~sq-server-commons/queries/quality-profiles';
import { Profile } from '~sq-server-commons/types/quality-profiles';
import { ProfilePermissionsForm } from './ProfilePermissionsForm';
import { ProfilePermissionsGroup } from './ProfilePermissionsGroup';
import { ProfilePermissionsUser } from './ProfilePermissionsUser';

export interface Group {
  name: string;
}

interface Props {
  profile: Pick<Profile, 'key' | 'language' | 'name'>;
}

export function ProfilePermissions({ profile }: Readonly<Props>) {
  const { formatMessage } = useIntl();
  const [addUserForm, setAddUserForm] = React.useState(false);

  const { data, isLoading } = useProfilePermissionsQuery({
    language: profile.language,
    name: profile.name,
    selected: 'selected',
  });

  const users = data?.users ?? [];
  const groups = data?.groups ?? [];

  return (
    <section aria-label={formatMessage({ id: 'permissions.page' })}>
      <div className="sw-mb-6">
        <SubTitle className="sw-mb-0">
          <FormattedMessage id="permissions.page" />
        </SubTitle>
        <Text as="p" className="sw-mt-6" isSubtle>
          <FormattedMessage id="quality_profiles.default_permissions" />
        </Text>
      </div>
      <Spinner isLoading={isLoading}>
        <Table columnCount={2} columnWidths={['100%', '0%']}>
          {sortBy(users, 'name').map((user) => (
            <TableRow key={user.login}>
              <CellComponent>
                <ProfilePermissionsUser key={user.login} profile={profile} user={user} />
              </CellComponent>
            </TableRow>
          ))}
          {sortBy(groups, 'name').map((group) => (
            <TableRow key={group.name}>
              <CellComponent>
                <ProfilePermissionsGroup group={group} key={group.name} profile={profile} />
              </CellComponent>
            </TableRow>
          ))}
        </Table>
        <div className="sw-mt-6">
          <Button
            onClick={() => {
              setAddUserForm(true);
            }}
          >
            <FormattedMessage id="quality_profiles.grant_permissions_to_more_users" />
          </Button>
        </div>
      </Spinner>
      {addUserForm && (
        <ProfilePermissionsForm
          onClose={() => {
            setAddUserForm(false);
          }}
          profile={profile}
        />
      )}
    </section>
  );
}
