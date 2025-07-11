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
  FormFieldWidth,
  Link,
  MessageCallout,
  MessageType,
  Spinner,
  TextInput,
} from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { translate } from '~sq-server-commons/helpers/l10n';
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

  if (checkingPat) {
    return <Spinner className="sw-ml-2" isLoading />;
  }

  const isInvalid = validationFailed && !touched;
  const canSubmit = Boolean(password) && Boolean(username);
  const submitButtonDisabled = isInvalid || submitting || !canSubmit;

  const errorMessage =
    validationErrorMessage ?? translate('onboarding.create_project.pat_incorrect.bitbucket_cloud');

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
        label={translate('onboarding.create_project.bitbucket_cloud.enter_username')}
        minLength={1}
        onChange={handleUsernameChange}
        type="text"
        validation={isInvalid ? 'invalid' : 'none'}
        value={username}
        width={FormFieldWidth.Large}
      />
      <MessageCallout
        text={
          <FormattedMessage
            id="onboarding.enter_username.instructions.bitbucket_cloud"
            values={{
              link: (
                <Link to="https://bitbucket.org/account/settings/">
                  {translate('onboarding.enter_username.instructions.bitbucket_cloud.link')}
                </Link>
              ),
            }}
          />
        }
        type={MessageType.Info}
      />
      <TextInput
        id="enter_password_validation"
        isRequired
        label={translate('onboarding.create_project.bitbucket_cloud.enter_password')}
        minLength={1}
        onChange={handlePasswordChange}
        type="text"
        validation={isInvalid ? 'invalid' : 'none'}
        value={password}
        width={FormFieldWidth.Large}
      />
      <MessageCallout
        text={
          <FormattedMessage
            id="onboarding.create_project.enter_password.instructions.bitbucket_cloud"
            values={{
              link: (
                <Link to="https://bitbucket.org/account/settings/app-passwords/new">
                  {translate(
                    'onboarding.create_project.enter_password.instructions.bitbucket_cloud.link',
                  )}
                </Link>
              ),
            }}
          />
        }
        type={MessageType.Info}
      />
    </PersonalAccessTokenForm>
  );
}
