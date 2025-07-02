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
import { isStringDefined } from '~shared/helpers/types';
import { translate } from '~sq-server-commons/helpers/l10n';
import { AlmKeys, AlmSettingsInstance } from '~sq-server-commons/types/alm-settings';
import PersonalAccessTokenForm from '../components/PersonalAccessTokenForm';
import { usePersonalAccessToken } from '../usePersonalAccessToken';

export interface AzurePersonalAccessTokenFormProps {
  almSetting: AlmSettingsInstance;
  onPersonalAccessTokenCreate: () => void;
  resetPat: boolean;
}

function getAzurePatUrl(url: string) {
  return `${url.replace(/\/$/, '')}/_usersSettings/tokens`;
}

export default function AzurePersonalAccessTokenForm({
  almSetting,
  resetPat,
  onPersonalAccessTokenCreate,
}: AzurePersonalAccessTokenFormProps) {
  const {
    checkingPat,
    firstConnection,
    handlePasswordChange,
    handleSubmit,
    isCurrentPatInvalid,
    password,
    submitting,
    touched,
    validationErrorMessage,
    validationFailed,
  } = usePersonalAccessToken(almSetting, resetPat, onPersonalAccessTokenCreate);

  if (checkingPat) {
    return <Spinner className="sw-ml-2" isLoading />;
  }

  const isInvalid = (validationFailed && !touched) || (touched && !isStringDefined(password));
  const { url } = almSetting;

  let errorMessage;
  if (!isStringDefined(password)) {
    errorMessage = translate('onboarding.create_project.pat_form.pat_required');
  } else if (isInvalid) {
    errorMessage =
      validationErrorMessage ?? translate('onboarding.create_project.pat_incorrect.azure');
  }

  return (
    <PersonalAccessTokenForm
      almKey={AlmKeys.Azure}
      className="sw-mt-3 sw-w-[50%]"
      errorMessage={errorMessage}
      firstConnection={firstConnection}
      handleSubmit={handleSubmit}
      isCurrentPatInvalid={isCurrentPatInvalid}
      isInvalid={isInvalid}
      submitButtonDisabled={isInvalid || submitting || !touched}
      submitting={submitting}
      touched={touched}
    >
      <TextInput
        autoFocus
        id="personal_access_token"
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
          <FormattedMessage
            id="onboarding.create_project.pat_help.instructions.azure"
            values={{
              link: url ? (
                <Link to={getAzurePatUrl(url)}>
                  {translate('onboarding.create_project.pat_help.instructions.link.azure')}
                </Link>
              ) : (
                translate('onboarding.create_project.pat_help.instructions.link.azure')
              ),
            }}
          />
        }
        type={MessageType.Info}
      />
    </PersonalAccessTokenForm>
  );
}
