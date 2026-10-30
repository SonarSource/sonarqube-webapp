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
  FormFieldWidth,
  Link,
  LinkHighlight,
  MessageCallout,
  MessageVariety,
  TextInput,
} from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import DocumentationLink from '~sq-server-commons/components/common/DocumentationLink';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { AlmInstanceBase, AlmKeys } from '~sq-server-commons/types/alm-settings';
import { ATLASSIAN_ACCOUNT_EMAIL_LINK } from '../BitbucketCloud/utils';

interface PersonalAccessTokenFieldsProps {
  almKey: AlmKeys;
  almSetting: AlmInstanceBase;
  isInvalid: boolean;
  onPasswordChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onUsernameChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  password: string;
  username?: string;
}

function getAzurePatUrl(url: string) {
  return `${url.replace(/\/$/, '')}/_usersSettings/tokens`;
}

export { PersonalAccessTokenFields };

function PersonalAccessTokenFields(props: Readonly<PersonalAccessTokenFieldsProps>) {
  switch (props.almKey) {
    case AlmKeys.Azure:
      return <AzureFields {...props} />;
    case AlmKeys.BitbucketServer:
      return <BitbucketServerFields {...props} />;
    case AlmKeys.BitbucketCloud:
      return <BitbucketCloudFields {...props} />;
    case AlmKeys.GitLab:
      return <GitlabFields {...props} />;
    case AlmKeys.GitHub:
      return null;
  }
}

function AzureFields({
  almSetting,
  isInvalid,
  onPasswordChange,
  password,
}: Readonly<PersonalAccessTokenFieldsProps>) {
  const { url } = almSetting;

  return (
    <>
      <TextInput
        id="personal_access_token"
        isRequired
        label={<FormattedMessage id="onboarding.create_project.enter_pat" />}
        minLength={1}
        onChange={onPasswordChange}
        type="text"
        validation={isInvalid ? 'invalid' : 'none'}
        value={password}
        width={FormFieldWidth.Large}
      />
      <MessageCallout variety={MessageVariety.Info}>
        <FormattedMessage
          id="onboarding.create_project.pat_help.instructions.azure"
          values={{
            link: url ? (
              <Link enableOpenInNewTab to={getAzurePatUrl(url)}>
                <FormattedMessage id="onboarding.create_project.pat_help.instructions.link.azure" />
              </Link>
            ) : (
              <FormattedMessage id="onboarding.create_project.pat_help.instructions.link.azure" />
            ),
          }}
        />
      </MessageCallout>
    </>
  );
}

function BitbucketServerFields({
  almSetting,
  isInvalid,
  onPasswordChange,
  password,
}: Readonly<PersonalAccessTokenFieldsProps>) {
  const { url } = almSetting;

  return (
    <>
      <TextInput
        id="personal_access_token_validation"
        isRequired
        label={<FormattedMessage id="onboarding.create_project.enter_pat" />}
        minLength={1}
        onChange={onPasswordChange}
        type="text"
        validation={isInvalid ? 'invalid' : 'none'}
        value={password}
        width={FormFieldWidth.Large}
      />
      <MessageCallout variety={MessageVariety.Info}>
        <FormattedMessage
          id="onboarding.create_project.pat_help.instructions.bitbucket_server"
          values={{
            link: url ? (
              <Link enableOpenInNewTab to={`${url.replace(/\/$/, '')}/account`}>
                <FormattedMessage id="onboarding.create_project.pat_help.instructions.bitbucket_server.link" />
              </Link>
            ) : (
              <FormattedMessage id="onboarding.create_project.pat_help.instructions.bitbucket_server.link" />
            ),
          }}
        />
      </MessageCallout>
    </>
  );
}

function BitbucketCloudFields({
  isInvalid,
  onPasswordChange,
  onUsernameChange,
  password,
  username,
}: Readonly<PersonalAccessTokenFieldsProps>) {
  return (
    <>
      <TextInput
        helpText={
          <FormattedMessage
            id="onboarding.enter_username.instructions.bitbucket_cloud"
            values={{
              link: (
                <Link
                  enableOpenInNewTab
                  highlight={LinkHighlight.CurrentColor}
                  to={ATLASSIAN_ACCOUNT_EMAIL_LINK}
                >
                  <FormattedMessage id="onboarding.enter_username.instructions.bitbucket_cloud.link" />
                </Link>
              ),
            }}
          />
        }
        id="enter_username_validation"
        isRequired
        label={<FormattedMessage id="onboarding.create_project.bitbucket_cloud.enter_username" />}
        minLength={1}
        onChange={onUsernameChange}
        type="email"
        validation={isInvalid ? 'invalid' : 'none'}
        value={username}
        width={FormFieldWidth.Large}
      />
      <TextInput
        helpText={
          <FormattedMessage
            id="onboarding.create_project.enter_password.instructions.bitbucket_cloud"
            values={{
              link: (
                <DocumentationLink
                  enableOpenInNewTab
                  highlight={LinkHighlight.CurrentColor}
                  to={DocLink.AlmBitBucketCloudIntegrationApiToken}
                >
                  <FormattedMessage id="onboarding.create_project.enter_password.instructions.bitbucket_cloud.link" />
                </DocumentationLink>
              ),
            }}
          />
        }
        id="enter_password_validation"
        isRequired
        label={<FormattedMessage id="onboarding.create_project.bitbucket_cloud.enter_password" />}
        minLength={1}
        onChange={onPasswordChange}
        type="text"
        validation={isInvalid ? 'invalid' : 'none'}
        value={password}
        width={FormFieldWidth.Large}
      />
    </>
  );
}

function GitlabFields({
  isInvalid,
  onPasswordChange,
  password,
}: Readonly<PersonalAccessTokenFieldsProps>) {
  return (
    <>
      <TextInput
        id="personal_access_token_validation"
        isRequired
        label={<FormattedMessage id="onboarding.create_project.enter_pat" />}
        messageInvalid={
          <FormattedMessage id="onboarding.create_project.pat_incorrect.gitlab.hint" />
        }
        minLength={1}
        onChange={onPasswordChange}
        type="text"
        validation={isInvalid ? 'invalid' : 'none'}
        value={password}
        width={FormFieldWidth.Large}
      />
      <MessageCallout variety={MessageVariety.Info}>
        <p>
          <FormattedMessage
            id="onboarding.create_project.pat_help.instructions.gitlab"
            values={{
              link: (
                <Link
                  enableOpenInNewTab
                  to="https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html"
                >
                  <FormattedMessage id="onboarding.create_project.pat_help.instructions.gitlab.link" />
                </Link>
              ),
            }}
          />
        </p>
      </MessageCallout>
    </>
  );
}
