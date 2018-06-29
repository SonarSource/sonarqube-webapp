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
import { getJSON, post, postJSON, RequestData } from '../helpers/request';
import throwGlobalError from '../app/utils/throwGlobalError';
import { LightOrganization, Paging } from '../app/types';

export function getOrganizations(data: {
  organizations?: string;
  member?: boolean;
}): Promise<{
  organizations: LightOrganization[];
  paging: Paging;
}> {
  return getJSON('/api/organizations/search', data);
}

export function getOrganization(key: string): Promise<any> {
  return getOrganizations({ organizations: key })
    .then(r => r.organizations.find((o: any) => o.key === key))
    .catch(throwGlobalError);
}

interface GetOrganizationNavigation {
  canAdmin: boolean;
  canDelete: boolean;
  canProvisionProjects: boolean;
  isDefault: boolean;
  pages: Array<{ key: string; name: string }>;
  adminPages: Array<{ key: string; name: string }>;
}

export function getOrganizationNavigation(key: string): Promise<GetOrganizationNavigation> {
  return getJSON('/api/navigation/organization', { organization: key }).then(r => r.organization);
}

export function createOrganization(data: RequestData): Promise<any> {
  return postJSON('/api/organizations/create', data).then(r => r.organization, throwGlobalError);
}

export function updateOrganization(key: string, changes: RequestData): Promise<void> {
  return post('/api/organizations/update', { key, ...changes });
}

export function deleteOrganization(key: string): Promise<void | Response> {
  return post('/api/organizations/delete', { key }).catch(throwGlobalError);
}

export function searchMembers(data: {
  organization?: string;
  p?: number;
  ps?: number;
  q?: string;
  selected?: string;
}): Promise<{ paging: Paging; users: Array<{ avatar?: string; login: string; name: string }> }> {
  return getJSON('/api/organizations/search_members', data);
}

export function addMember(data: { login: string; organization: string }): Promise<any> {
  return postJSON('/api/organizations/add_member', data).then(r => r.user);
}

export function removeMember(data: { login: string; organization: string }): Promise<void> {
  return post('/api/organizations/remove_member', data);
}

export interface OrganizationBilling {
  nclocCount: number;
  subscription: {
    plan?: {
      maxNcloc: number;
      price: number;
    };
    nextBillingDate?: string;
    status: 'active' | 'inactive' | 'suspended';
    trial: boolean;
  };
}

export function getOrganizationBilling(organization: string): Promise<OrganizationBilling> {
  return getJSON('/api/billing/show', { organization, p: 1, ps: 1 });
}
