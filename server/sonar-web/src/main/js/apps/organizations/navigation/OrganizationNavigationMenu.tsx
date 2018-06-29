/*
 * SonarQube
 * Copyright (C) 2009-2018 SonarSource SA
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
import { Link } from 'react-router';
import OrganizationNavigationExtensions from './OrganizationNavigationExtensions';
import OrganizationNavigationAdministration from './OrganizationNavigationAdministration';
import { Organization } from '../../../app/types';
import NavBarTabs from '../../../components/nav/NavBarTabs';
import { translate } from '../../../helpers/l10n';
import { getQualityGatesUrl } from '../../../helpers/urls';
import { hasPrivateAccess, isCurrentUserMemberOf } from '../../../helpers/organizations';

interface Props {
  location: { pathname: string };
  organization: Organization;
}

export default function OrganizationNavigationMenu({ location, organization }: Props) {
  return (
    <NavBarTabs className="navbar-context-tabs">
      <li>
        <Link activeClassName="active" to={`/organizations/${organization.key}/projects`}>
          {translate('projects.page')}
        </Link>
      </li>
      <li>
        <Link
          activeClassName="active"
          to={{
            pathname: `/organizations/${organization.key}/issues`,
            query: { resolved: 'false' }
          }}>
          {translate('issues.page')}
        </Link>
      </li>
      {hasPrivateAccess(organization) && (
        <>
          <li>
            <Link
              activeClassName="active"
              to={`/organizations/${organization.key}/quality_profiles`}>
              {translate('quality_profiles.page')}
            </Link>
          </li>
          <li>
            <Link activeClassName="active" to={`/organizations/${organization.key}/rules`}>
              {translate('coding_rules.page')}
            </Link>
          </li>
          <li>
            <Link activeClassName="active" to={getQualityGatesUrl(organization.key)}>
              {translate('quality_gates.page')}
            </Link>
          </li>
        </>
      )}

      {isCurrentUserMemberOf(organization) && (
        <li>
          <Link activeClassName="active" to={`/organizations/${organization.key}/members`}>
            {translate('organization.members.page')}
          </Link>
        </li>
      )}

      <OrganizationNavigationExtensions location={location} organization={organization} />
      {organization.canAdmin && (
        <OrganizationNavigationAdministration location={location} organization={organization} />
      )}
    </NavBarTabs>
  );
}
