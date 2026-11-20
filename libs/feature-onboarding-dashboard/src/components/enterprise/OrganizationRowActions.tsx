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
  DropdownMenu,
  DropdownMenuAlign,
  IconMoreVertical,
  Table,
} from '@sonarsource/echoes-react';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { Path } from 'react-router';
import { OnboardingOrganizationRow } from '~shared/types/onboarding';
import { OnboardingDashboardAction } from '~shared/types/onboarding-dashboard-telemetry';
import { OrganizationAccess } from './OrganizationAccessContext';
import { RequestAdminAccessModal } from './RequestAdminAccessModal';

interface Props {
  access: OrganizationAccess | undefined;
  getBindingUrl: (organizationKey: string) => Partial<Path>;
  getDashboardUrl: (organizationKey: string) => Partial<Path>;
  onAction?: (action: OnboardingDashboardAction) => void;
  organization: OnboardingOrganizationRow;
}

/**
 * Admins get View (and Bind when unbound); members and non-members get "Get admin access". Unknown
 * access holds nothing back.
 */
export function OrganizationRowActions({
  access,
  getBindingUrl,
  getDashboardUrl,
  onAction,
  organization,
}: Readonly<Props>) {
  const { formatMessage } = useIntl();
  const [isRequestAccessModalOpen, setIsRequestAccessModalOpen] = useState(false);
  const { key, name } = organization;

  const canRequestAdminAccess =
    access === OrganizationAccess.Member || access === OrganizationAccess.None;

  // The figures of an organization that could not be read do not say whether it is bound.
  const canBind = organization.availability !== 'UNAVAILABLE' && !organization.bound;

  const items = canRequestAdminAccess ? (
    <DropdownMenu.ItemButton
      helpText={formatMessage({
        id: 'onboarding_dashboard.enterprise.organizations.action.request_access.hint',
      })}
      onClick={() => {
        setIsRequestAccessModalOpen(true);
        onAction?.(OnboardingDashboardAction.RequestAdminAccess);
      }}
    >
      {formatMessage({ id: 'onboarding_dashboard.enterprise.organizations.action.request_access' })}
    </DropdownMenu.ItemButton>
  ) : (
    <>
      <DropdownMenu.ItemLink
        onClick={() => {
          onAction?.(OnboardingDashboardAction.ViewOrganizationDashboard);
        }}
        to={getDashboardUrl(key)}
      >
        {formatMessage({ id: 'onboarding_dashboard.enterprise.organizations.action.view' })}
      </DropdownMenu.ItemLink>

      {canBind && (
        <DropdownMenu.ItemLink
          onClick={() => {
            onAction?.(OnboardingDashboardAction.BindOrganization);
          }}
          to={getBindingUrl(key)}
        >
          {formatMessage({ id: 'onboarding_dashboard.enterprise.organizations.action.bind' })}
        </DropdownMenu.ItemLink>
      )}
    </>
  );

  return (
    <>
      <DropdownMenu align={DropdownMenuAlign.End} items={items}>
        <Table.CellButtonIcon
          Icon={IconMoreVertical}
          ariaLabel={formatMessage(
            { id: 'onboarding_dashboard.enterprise.organizations.actions.label' },
            { name },
          )}
        />
      </DropdownMenu>

      {canRequestAdminAccess && isRequestAccessModalOpen && (
        <RequestAdminAccessModal
          access={access}
          onClose={() => {
            setIsRequestAccessModalOpen(false);
          }}
          organizationKey={key}
        />
      )}
    </>
  );
}
