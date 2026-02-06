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
  Card,
  Form,
  FormFieldWidth,
  LinkStandalone,
  MessageCallout,
} from '@sonarsource/echoes-react';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage, useIntl } from 'react-intl';
import { Location } from '~shared/types/router';
import UserPasswordInput, {
  PasswordChangeHandlerParams,
} from '~sq-server-commons/components/common/UserPasswordInput';
import { getReturnUrl } from '~sq-server-commons/helpers/urls';
import Unauthorized from '../sessions/components/Unauthorized';
import { DEFAULT_ADMIN_PASSWORD } from './constants';

export interface ChangeAdminPasswordAppRendererProps {
  canAdmin?: boolean;
  location: Location;
  onSubmit: (password: string) => void;
  submitting: boolean;
  success: boolean;
}

export default function ChangeAdminPasswordAppRenderer(
  props: Readonly<ChangeAdminPasswordAppRendererProps>,
) {
  const { formatMessage } = useIntl();
  const { canAdmin, location, onSubmit, submitting, success } = props;
  const [newPassword, setNewPassword] = React.useState<PasswordChangeHandlerParams>({
    value: '',
    isValid: false,
  });
  const canSubmit = newPassword.isValid && newPassword.value !== DEFAULT_ADMIN_PASSWORD;

  if (!canAdmin) {
    return <Unauthorized />;
  }

  return (
    <>
      <Helmet defer={false} title={formatMessage({ id: 'users.change_admin_password.page' })} />

      <div className="sw-flex sw-flex-col sw-items-center sw-justify-center">
        <Card className="sw-mx-auto sw-mt-24 sw-w-abs-600">
          <Card.Body>
            {success ? (
              <MessageCallout variety="success">
                <div>
                  <p className="sw-mb-2">
                    <FormattedMessage id="users.change_admin_password.form.success" />
                  </p>

                  {/* We must reload because we need a refresh of the /api/navigation/global call. */}
                  <LinkStandalone reloadDocument to={getReturnUrl(location)}>
                    <FormattedMessage id="users.change_admin_password.form.continue_to_app" />
                  </LinkStandalone>
                </div>
              </MessageCallout>
            ) : (
              <Form
                onSubmit={(e: React.SyntheticEvent<HTMLFormElement>) => {
                  e.preventDefault();
                  onSubmit(newPassword.value);
                }}
              >
                <Form.Header
                  description={<FormattedMessage id="users.change_admin_password.description" />}
                  extraContent={<FormattedMessage id="users.change_admin_password.header" />}
                  title={<FormattedMessage id="users.change_admin_password.instance_is_at_risk" />}
                />
                <Form.Section
                  title={<FormattedMessage id="users.change_admin_password.form.header" />}
                >
                  <UserPasswordInput
                    onChange={setNewPassword}
                    size={FormFieldWidth.Large}
                    value={newPassword.value}
                  />
                </Form.Section>
                <Form.Footer>
                  <Button
                    isDisabled={!canSubmit || submitting}
                    isLoading={submitting}
                    type="submit"
                    variety={ButtonVariety.Primary}
                  >
                    <FormattedMessage id="update_verb" />
                  </Button>
                </Form.Footer>
              </Form>
            )}
          </Card.Body>
        </Card>
      </div>
    </>
  );
}
