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

import { Spinner } from '@sonarsource/echoes-react';
import { translate } from '~sq-server-commons/helpers/l10n';
import { AlmInstanceBase, AlmKeys } from '~sq-server-commons/types/alm-settings';
import { PersonalAccessTokenFields } from '../components/PersonalAccessTokenFields';
import PersonalAccessTokenForm from '../components/PersonalAccessTokenForm';
import { usePersonalAccessToken } from '../usePersonalAccessToken';

interface Props {
  almSetting: AlmInstanceBase;
  onPersonalAccessTokenCreated: () => void;
  resetPat: boolean;
}

export default function BitbucketServerPersonalAccessTokenForm({
  almSetting,
  resetPat,
  onPersonalAccessTokenCreated,
}: Props) {
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
  } = usePersonalAccessToken(almSetting, resetPat, onPersonalAccessTokenCreated);

  if (checkingPat) {
    return <Spinner className="sw:ml-2" isLoading />;
  }

  const isInvalid = validationFailed && !touched;
  const canSubmit = Boolean(password);
  const submitButtonDisabled = isInvalid || submitting || !canSubmit;

  const errorMessage =
    validationErrorMessage ?? translate('onboarding.create_project.pat_incorrect.bitbucket');

  return (
    <PersonalAccessTokenForm
      almKey={AlmKeys.BitbucketServer}
      className="sw:w-[50%]"
      errorMessage={errorMessage}
      firstConnection={firstConnection}
      handleSubmit={handleSubmit}
      isCurrentPatInvalid={isCurrentPatInvalid}
      isInvalid={isInvalid}
      submitButtonDisabled={submitButtonDisabled}
      submitting={submitting}
      touched={touched}
    >
      <PersonalAccessTokenFields
        almKey={AlmKeys.BitbucketServer}
        almSetting={almSetting}
        isInvalid={isInvalid}
        onPasswordChange={handlePasswordChange}
        password={password}
      />
    </PersonalAccessTokenForm>
  );
}
