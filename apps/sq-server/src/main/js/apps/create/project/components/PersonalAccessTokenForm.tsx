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
    <Form onSubmit={handleSubmit} className={`sw-mb-6 ${className}`}>
      <Form.Header
        title={translate('onboarding.create_project.pat_form.title')}
        description={translate(`onboarding.create_project.pat_form.help.${almKey}`)}
      />
      <Form.Section>
        {isInvalid && <MessageCallout type={MessageType.Danger} text={errorMessage} />}
        {!firstConnection && (
          <MessageCallout
            type={MessageType.Warning}
            text={
              <p>
                {translate('onboarding.create_project.pat.expired.info_message')}{' '}
                {translate('onboarding.create_project.pat.expired.info_message_contact')}{' '}
              </p>
            }
          />
        )}
        {children}
      </Form.Section>
      <Form.Footer>
        <Button
          variety={ButtonVariety.Primary}
          type="submit"
          isDisabled={submitButtonDisabled}
          isLoading={submitting}
        >
          {translate('save')}
        </Button>
      </Form.Footer>
    </Form>
  );
}
