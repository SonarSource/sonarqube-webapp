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

import { Button, ButtonGroup, ButtonVariety, Tooltip } from '@sonarsource/echoes-react';
import { ReactElement, useState } from 'react';
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
  const { key, name } = organization;

  if (access === OrganizationAccess.Member || access === OrganizationAccess.None) {
    return (
      <RequestAdminAccessButton access={access} onAction={onAction} organization={organization} />
    );
  }

  const viewButton = (
    <Button
      ariaLabel={formatMessage(
        { id: 'onboarding_dashboard.enterprise.organizations.action.view.label' },
        { name },
      )}
      onClick={() => {
        onAction?.(OnboardingDashboardAction.ViewOrganizationDashboard);
      }}
      to={getDashboardUrl(key)}
      variety={ButtonVariety.Default}
    >
      {formatMessage({ id: 'onboarding_dashboard.enterprise.organizations.action.view' })}
    </Button>
  );

  // The figures of an organization that could not be read do not say whether it is bound.
  if (organization.availability === 'UNAVAILABLE' || organization.bound) {
    return viewButton;
  }

  // Default variety: the table has no primary action, so unbound rows should not draw the eye.
  return (
    <ButtonGroup isCombined>
      <Button
        ariaLabel={formatMessage(
          { id: 'onboarding_dashboard.enterprise.organizations.action.bind.label' },
          { name },
        )}
        onClick={() => {
          onAction?.(OnboardingDashboardAction.BindOrganization);
        }}
        to={getBindingUrl(key)}
        variety={ButtonVariety.Default}
      >
        {formatMessage({ id: 'onboarding_dashboard.enterprise.organizations.action.bind' })}
      </Button>
      {viewButton}
    </ButtonGroup>
  );
}

type RequestAdminAccessButtonProps = Pick<Props, 'onAction' | 'organization'> & {
  access: OrganizationAccess.Member | OrganizationAccess.None;
};

/** Not disabled, so it stays focusable and the tooltip can explain why. */
function RequestAdminAccessButton({
  access,
  onAction,
  organization,
}: Readonly<RequestAdminAccessButtonProps>): ReactElement {
  const { formatMessage } = useIntl();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Tooltip
        content={formatMessage({
          id: 'onboarding_dashboard.enterprise.organizations.action.request_access.hint',
        })}
      >
        <Button
          ariaLabel={formatMessage(
            { id: 'onboarding_dashboard.enterprise.organizations.action.request_access.label' },
            { name: organization.name },
          )}
          onClick={() => {
            setIsModalOpen(true);
            onAction?.(OnboardingDashboardAction.RequestAdminAccess);
          }}
          variety={ButtonVariety.Default}
        >
          {formatMessage({
            id: 'onboarding_dashboard.enterprise.organizations.action.request_access',
          })}
        </Button>
      </Tooltip>

      {isModalOpen && (
        <RequestAdminAccessModal
          access={access}
          onClose={() => {
            setIsModalOpen(false);
          }}
          organizationKey={organization.key}
        />
      )}
    </>
  );
}
