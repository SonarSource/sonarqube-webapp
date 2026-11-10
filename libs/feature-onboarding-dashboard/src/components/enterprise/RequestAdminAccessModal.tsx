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
  LoadingContainer,
  MessageCallout,
  Modal,
  Text,
  TextSize,
} from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useOrganizationAdminsQuery } from '~adapters/queries/onboarding';
import { ClipboardIconButton } from '~shared/components/clipboard';
import { OnboardingOrganizationAdmin } from '~shared/types/onboarding';
import { OrganizationAccess } from './OrganizationAccessContext';

interface Props {
  /** What the viewer is to the organization: only a member can be told who its administrators are. */
  access: OrganizationAccess.Member | OrganizationAccess.None;
  onClose: VoidFunction;
  organizationKey: string;
}

/**
 * Tells a viewer without admin rights whom to ask. Admins are listed (with copyable email) only for
 * members; the users service answers no one else.
 */
export function RequestAdminAccessModal({ access, onClose, organizationKey }: Readonly<Props>) {
  const { formatMessage } = useIntl();

  return (
    <Modal
      content={
        access === OrganizationAccess.Member ? (
          <OrganizationAdmins organizationKey={organizationKey} />
        ) : (
          <Text>
            <FormattedMessage id="onboarding_dashboard.enterprise.request_access.not_member" />
          </Text>
        )
      }
      description={formatMessage({
        id: 'onboarding_dashboard.enterprise.request_access.description',
      })}
      isOpen
      // The modal is mounted only while it is open, so the only change it can report is a dismissal.
      onOpenChange={onClose}
      secondaryButton={<Button onClick={onClose}>{formatMessage({ id: 'close' })}</Button>}
      title={formatMessage({ id: 'onboarding_dashboard.enterprise.request_access.title' })}
    />
  );
}

function OrganizationAdmins({ organizationKey }: Readonly<{ organizationKey: string }>) {
  const { formatMessage } = useIntl();
  const { data, isError, isPending } = useOrganizationAdminsQuery(organizationKey);

  if (isError) {
    return (
      <MessageCallout variety="danger">
        <FormattedMessage id="onboarding_dashboard.enterprise.request_access.admins.error" />
      </MessageCallout>
    );
  }

  return (
    <LoadingContainer
      isLoading={isPending}
      loadingMessage={formatMessage({ id: 'onboarding_dashboard.loading' })}
    >
      {data !== undefined && data.admins.length > 0 && (
        <div className="sw:flex sw:flex-col sw:gap-3">
          <Text isHighlighted>
            <FormattedMessage id="onboarding_dashboard.enterprise.request_access.admins.title" />
          </Text>

          <ul className="sw:m-0 sw:flex sw:list-none sw:flex-col sw:gap-3 sw:p-0">
            {data.admins.map((admin) => (
              <AdminItem admin={admin} key={admin.id} />
            ))}
          </ul>

          {data.total > data.admins.length && (
            <Text isSubtle size={TextSize.Small}>
              <FormattedMessage
                id="onboarding_dashboard.enterprise.request_access.admins.more"
                values={{ count: data.total - data.admins.length }}
              />
            </Text>
          )}
        </div>
      )}
    </LoadingContainer>
  );
}

function AdminItem({ admin }: Readonly<{ admin: OnboardingOrganizationAdmin }>) {
  const { formatMessage } = useIntl();
  const { email, login, name } = admin;

  return (
    <li className="sw:flex sw:items-center sw:justify-between sw:gap-4">
      <div className="sw:flex sw:min-w-0 sw:flex-col">
        <Text isHighlighted>{name}</Text>
        {/* Masked from session recordings. */}
        <Text className="sw:truncate fs-mask" isSubtle size={TextSize.Small}>
          {email ?? login}
        </Text>
      </div>

      {email !== undefined && (
        <ClipboardIconButton
          aria-label={formatMessage(
            { id: 'onboarding_dashboard.enterprise.request_access.admins.copy' },
            { name },
          )}
          copyValue={email}
          discreet
        />
      )}
    </li>
  );
}
