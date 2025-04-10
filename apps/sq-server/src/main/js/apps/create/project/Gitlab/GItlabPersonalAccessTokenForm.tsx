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
import { translate } from '~sq-server-shared/helpers/l10n';
import { AlmInstanceBase } from '~sq-server-shared/types/alm-settings';
import PersonalAccessTokenForm from '../components/PersonalAccessTokenForm';
import { ModifiedAlmKeys } from '../constants';
import { usePersonalAccessToken } from '../usePersonalAccessToken';

interface Props {
  almSetting: AlmInstanceBase;
  onPersonalAccessTokenCreated: () => void;
  resetPat: boolean;
}

export default function GitlabPersonalAccessTokenForm({
  almSetting,
  resetPat,
  onPersonalAccessTokenCreated,
}: Props) {
  const {
    password,
    firstConnection,
    validationFailed,
    touched,
    submitting,
    validationErrorMessage,
    checkingPat,
    handlePasswordChange,
    handleSubmit,
  } = usePersonalAccessToken(almSetting, resetPat, onPersonalAccessTokenCreated);

  if (checkingPat) {
    return <Spinner className="sw-ml-2" isLoading />;
  }

  const isInvalid = validationFailed && !touched;
  const canSubmit = Boolean(password);
  const submitButtonDisabled = isInvalid || submitting || !canSubmit;

  const errorMessage =
    validationErrorMessage ?? translate('onboarding.create_project.pat_incorrect.gitlab');

  return (
    <PersonalAccessTokenForm
      almKey={ModifiedAlmKeys.GitLab}
      className="sw-mt-3 sw-w-[50%]"
      errorMessage={errorMessage}
      firstConnection={firstConnection}
      handleSubmit={handleSubmit}
      isInvalid={isInvalid}
      submitButtonDisabled={submitButtonDisabled}
      submitting={submitting}
      touched={touched}
    >
      <TextInput
        autoFocus
        id="personal_access_token_validation"
        isRequired
        label={translate('onboarding.create_project.enter_pat')}
        minLength={1}
        onChange={handlePasswordChange}
        type="text"
        validation={isInvalid ? 'invalid' : 'none'}
        value={password}
        width={FormFieldWidth.Large}
      />

      <MessageCallout
        text={
          <p>
            <FormattedMessage
              id="onboarding.create_project.pat_help.instructions.gitlab"
              values={{
                link: (
                  <Link to="https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html">
                    {translate('onboarding.create_project.pat_help.instructions.gitlab.link')}
                  </Link>
                ),
              }}
            />
          </p>
        }
        type={MessageType.Info}
      />
    </PersonalAccessTokenForm>
  );
}
