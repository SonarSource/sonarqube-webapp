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

import {
  Button,
  ButtonVariety,
  Form,
  MessageCallout,
  MessageType,
} from '@sonarsource/echoes-react';
import { translate } from '~sq-server-shared/helpers/l10n';
import { ModifiedAlmKeys } from '../constants';

interface Props extends React.PropsWithChildren {
  almKey: ModifiedAlmKeys;
  className?: string;
  errorMessage: string | undefined;
  firstConnection: boolean;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isInvalid: boolean;
  submitButtonDisabled: boolean;
  submitting: boolean;
  touched: boolean;
}

export default function PersonalAccessTokenForm({
  className,
  children,
  errorMessage,
  firstConnection,
  handleSubmit,
  isInvalid,
  almKey,
  submitting,
  submitButtonDisabled,
}: Readonly<Props>) {
  return (
    <Form className={`sw-mb-6 ${className}`} onSubmit={handleSubmit}>
      <Form.Header
        description={translate(`onboarding.create_project.pat_form.help.${almKey}`)}
        title={translate('onboarding.create_project.pat_form.title')}
      />
      <Form.Section>
        {isInvalid && <MessageCallout text={errorMessage} type={MessageType.Danger} />}
        {!firstConnection && (
          <MessageCallout
            text={
              <p>
                {translate('onboarding.create_project.pat.expired.info_message')}{' '}
                {translate('onboarding.create_project.pat.expired.info_message_contact')}{' '}
              </p>
            }
            type={MessageType.Warning}
          />
        )}
        {children}
      </Form.Section>
      <Form.Footer>
        <Button
          isDisabled={submitButtonDisabled}
          isLoading={submitting}
          type="submit"
          variety={ButtonVariety.Primary}
        >
          {translate('save')}
        </Button>
      </Form.Footer>
    </Form>
  );
}
