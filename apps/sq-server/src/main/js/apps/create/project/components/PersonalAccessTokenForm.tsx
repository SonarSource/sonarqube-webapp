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
  MessageVariety,
} from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { queryToSearchString } from '~shared/helpers/query';
import { AlmKeys } from '~sq-server-commons/types/alm-settings';

interface Props extends React.PropsWithChildren {
  almKey: AlmKeys;
  className?: string;
  errorMessage: string | undefined;
  firstConnection: boolean;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isCurrentPatInvalid: boolean;
  isInvalid: boolean;
  submitButtonDisabled: boolean;
  submitting: boolean;
  touched: boolean;
}

const FORM_HEADER_DESCRIPTIONS = {
  [AlmKeys.Azure]: <FormattedMessage id="onboarding.create_project.pat_form.help.azure" />,
  [AlmKeys.BitbucketServer]: (
    <FormattedMessage id="onboarding.create_project.pat_form.help.bitbucket" />
  ),
  [AlmKeys.BitbucketCloud]: (
    <FormattedMessage id="onboarding.create_project.pat_form.help.bitbucket_cloud" />
  ),
  [AlmKeys.GitLab]: <FormattedMessage id="onboarding.create_project.pat_form.help.gitlab" />,
  [AlmKeys.GitHub]: null,
};

export default function PersonalAccessTokenForm({
  className,
  children,
  errorMessage,
  firstConnection,
  handleSubmit,
  isCurrentPatInvalid,
  isInvalid,
  almKey,
  submitting,
  submitButtonDisabled,
}: Readonly<Props>) {
  const navigate = useNavigate();

  const onCancel = () => {
    navigate({
      pathname: '/projects/create',
      search: queryToSearchString({
        mode: almKey,
      }),
    });
  };

  return (
    <Form className={`sw-mb-6 ${className}`} onSubmit={handleSubmit}>
      <Form.Header
        description={FORM_HEADER_DESCRIPTIONS[almKey]}
        title={<FormattedMessage id="onboarding.create_project.pat_form.title" />}
      />
      <Form.Section>
        {isInvalid && <MessageCallout text={errorMessage} variety={MessageVariety.Danger} />}
        {!firstConnection && isCurrentPatInvalid && (
          <MessageCallout
            text={
              <p>
                <FormattedMessage id="onboarding.create_project.pat.expired.info_message" />{' '}
                <FormattedMessage id="onboarding.create_project.pat.expired.info_message_contact" />{' '}
              </p>
            }
            variety={MessageVariety.Warning}
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
          <FormattedMessage id="save" />
        </Button>
        {!firstConnection && !isCurrentPatInvalid && (
          <Button onClick={onCancel}>
            <FormattedMessage id="cancel" />
          </Button>
        )}
      </Form.Footer>
    </Form>
  );
}
