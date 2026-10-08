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

import { Button, ButtonVariety, Divider, ModalAlert } from '@sonarsource/echoes-react';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { CodeSnippet } from '~design-system';
import { useDeleteEmailConfigurationMutation } from '~sq-server-commons/queries/system';
import { AuthMethod, EmailConfiguration } from '~sq-server-commons/types/system';
import EmailTestModal from './EmailTestModal';

interface EmailTestModalProps {
  emailConfiguration: EmailConfiguration;
  onEditClicked: () => void;
}

export default function EmailNotificationOverview(props: Readonly<EmailTestModalProps>) {
  const { formatMessage } = useIntl();
  const { emailConfiguration, onEditClicked } = props;
  const { mutate: deleteEmailConfiguration, isPending } = useDeleteEmailConfigurationMutation();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const onDeleteClicked = () => {
    if (emailConfiguration.id) {
      deleteEmailConfiguration(emailConfiguration.id, {
        onSuccess: () => {
          setIsDeleteModalOpen(false);
        },
      });
    }
  };

  const onDeleteModalOpenChange = (isOpen: boolean) => {
    setIsDeleteModalOpen(isOpen);
  };

  return (
    <>
      <Divider className="sw-my-6" />
      <EmailTestModal />
      <Divider className="sw-my-6" />
      <div className="sw-flex sw-justify-between">
        <div className="sw-grid sw-gap-4">
          <span className="sw-typo-lg-semibold sw-col-span-2">
            <FormattedMessage id="email_notification.overview.heading" />
          </span>

          <PublicValue
            messageKey="email_notification.overview.authentication_type"
            value={emailConfiguration.authMethod}
          />
          <PublicValue
            messageKey="email_notification.form.username"
            value={emailConfiguration.username}
          />

          {emailConfiguration.authMethod === AuthMethod.Basic ? (
            <PrivateValue messageKey="email_notification.form.basic_password" />
          ) : (
            <>
              <PublicValue
                messageKey="email_notification.form.oauth_authentication_host"
                value={emailConfiguration.oauthAuthenticationHost}
              />
              <PrivateValue messageKey="email_notification.form.oauth_client_id" />
              <PrivateValue messageKey="email_notification.form.oauth_client_secret" />
              <PublicValue
                messageKey="email_notification.form.oauth_tenant"
                value={emailConfiguration.oauthTenant}
              />
              {emailConfiguration.oauthScope && (
                <PublicValue
                  messageKey="email_notification.form.oauth_scope"
                  value={emailConfiguration.oauthScope}
                />
              )}
            </>
          )}

          <PublicValue messageKey="email_notification.form.host" value={emailConfiguration.host} />
          <PublicValue messageKey="email_notification.form.port" value={emailConfiguration.port} />
          <PublicValue
            messageKey="email_notification.form.security_protocol"
            value={emailConfiguration.securityProtocol}
          />
          <PublicValue
            messageKey="email_notification.form.from_address"
            value={emailConfiguration.fromAddress}
          />
          <PublicValue
            messageKey="email_notification.form.from_name"
            value={emailConfiguration.fromName}
          />
          <PublicValue
            messageKey="email_notification.form.subject_prefix"
            value={emailConfiguration.subjectPrefix}
          />
        </div>
        <div className="sw-flex sw-justify-end sw-gap-2">
          <Button onClick={onEditClicked} variety={ButtonVariety.Default}>
            <FormattedMessage id="edit" />
          </Button>
          <ModalAlert
            description={formatMessage({ id: 'email_notification.delete.confirm.text' })}
            isOpen={isDeleteModalOpen}
            onOpenChange={onDeleteModalOpenChange}
            primaryButton={
              <Button
                isLoading={isPending}
                onClick={onDeleteClicked}
                variety={ButtonVariety.Danger}
              >
                <FormattedMessage id="delete" />
              </Button>
            }
            title={formatMessage({ id: 'email_notification.delete.confirm.title' })}
          >
            <Button variety={ButtonVariety.DangerOutline}>
              <FormattedMessage id="delete" />
            </Button>
          </ModalAlert>
        </div>
      </div>
    </>
  );
}

function PublicValue({ messageKey, value }: Readonly<{ messageKey: string; value: string }>) {
  const { formatMessage } = useIntl();
  return (
    <>
      <label className="sw-typo-semibold">{formatMessage({ id: messageKey })}</label>
      <div className="sw-truncate" data-testid={`${messageKey}.value`}>
        <CodeSnippet className="sw-px-1" isOneLine noCopy snippet={value} />
      </div>
    </>
  );
}

function PrivateValue({ messageKey }: Readonly<{ messageKey: string }>) {
  const { formatMessage } = useIntl();
  return (
    <>
      <label className="sw-typo-semibold">{formatMessage({ id: messageKey })}</label>
      <span data-testid={`${messageKey}.value`}>
        <FormattedMessage id="email_notification.overview.private" />
      </span>
    </>
  );
}
