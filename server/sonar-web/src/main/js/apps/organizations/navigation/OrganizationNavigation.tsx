/*
 * SonarQube
 * Copyright (C) 2009-2017 SonarSource SA
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
import OrganizationNavigationHeaderContainer from './OrganizationNavigationHeaderContainer';
import OrganizationNavigationMeta from './OrganizationNavigationMeta';
import OrganizationNavigationMenu from './OrganizationNavigationMenu';
import * as theme from '../../../app/theme';
import ContextNavBar from '../../../components/nav/ContextNavBar';
import { Organization } from '../../../app/types';
import './OrganizationNavigation.css';

interface Props {
  location: { pathname: string };
  organization: Organization;
}

export default function OrganizationNavigation({ organization, location }: Props) {
  return (
    <ContextNavBar id="context-navigation" height={theme.contextNavHeightRaw}>
      <OrganizationNavigationHeaderContainer organization={organization} />
      <OrganizationNavigationMeta organization={organization} />
      <OrganizationNavigationMenu location={location} organization={organization} />
    </ContextNavBar>
  );
}
