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
  Spinner,
  TextInput,
} from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';
import DocumentationLink from '~sq-server-commons/components/common/DocumentationLink';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { AlmInstanceBase, AlmKeys } from '~sq-server-commons/types/alm-settings';
import PersonalAccessTokenForm from '../components/PersonalAccessTokenForm';
import { usePersonalAccessToken } from '../usePersonalAccessToken';

interface Props {
  almSetting: AlmInstanceBase;
  onPersonalAccessTokenCreated: () => void;
  resetPat: boolean;
}

export default function BitbucketCloudPersonalAccessTokenForm({
  almSetting,
  resetPat,
  onPersonalAccessTokenCreated,
}: Readonly<Props>) {
  const {
    checkingPat,
    firstConnection,
    handlePasswordChange,
    handleSubmit,
    handleUsernameChange,
    isCurrentPatInvalid,
    password,
    submitting,
    touched,
    username,
    validationErrorMessage,
    validationFailed,
  } = usePersonalAccessToken(almSetting, resetPat, onPersonalAccessTokenCreated);

  const { formatMessage } = useIntl();

  if (checkingPat) {
    return <Spinner className="sw-ml-2" isLoading />;
  }

  const isInvalid = validationFailed && !touched;
  const canSubmit = Boolean(password) && Boolean(username);
  const submitButtonDisabled = isInvalid || submitting || !canSubmit;

  const errorMessage =
    validationErrorMessage ??
    formatMessage({ id: 'onboarding.create_project.pat_incorrect.bitbucket_cloud' });

  return (
    <PersonalAccessTokenForm
      almKey={AlmKeys.BitbucketCloud}
      className="sw-w-[50%]"
      errorMessage={errorMessage}
      firstConnection={firstConnection}
      handleSubmit={handleSubmit}
      isCurrentPatInvalid={isCurrentPatInvalid}
      isInvalid={isInvalid}
      submitButtonDisabled={submitButtonDisabled}
      submitting={submitting}
      touched={touched}
    >
      <TextInput
        autoFocus
        id="enter_username_validation"
        isRequired
        label={<FormattedMessage id="onboarding.create_project.bitbucket_cloud.enter_username" />}
        minLength={1}
        onChange={handleUsernameChange}
        type="text"
        validation={isInvalid ? 'invalid' : 'none'}
        value={username}
        width={FormFieldWidth.Large}
      />
      <MessageCallout variety={MessageVariety.Info}>
        <FormattedMessage
          id="onboarding.enter_username.instructions.bitbucket_cloud"
          values={{
            link: (
              <Link enableOpenInNewTab to="https://bitbucket.org/account/settings/">
                <FormattedMessage id="onboarding.enter_username.instructions.bitbucket_cloud.link" />
              </Link>
            ),
          }}
        />
      </MessageCallout>
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
        onChange={handlePasswordChange}
        type="text"
        validation={isInvalid ? 'invalid' : 'none'}
        value={password}
        width={FormFieldWidth.Large}
      />
    </PersonalAccessTokenForm>
  );
}
