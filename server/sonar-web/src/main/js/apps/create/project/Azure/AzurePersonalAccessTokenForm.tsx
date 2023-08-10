/*
 * SonarQube
 * Copyright (C) 2009-2023 SonarSource SA
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
  ButtonPrimary,
  DeferredSpinner,
  FlagErrorIcon,
  FlagMessage,
  FormField,
  InputField,
  LightPrimary,
  Link,
} from 'design-system';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { translate } from '../../../../helpers/l10n';
import { AlmSettingsInstance } from '../../../../types/alm-settings';

export interface AzurePersonalAccessTokenFormProps {
  almSetting: AlmSettingsInstance;
  onPersonalAccessTokenCreate: (token: string) => void;
  submitting?: boolean;
  validationFailed: boolean;
  firstConnection?: boolean;
}

function getAzurePatUrl(url: string) {
  return `${url.replace(/\/$/, '')}/_usersSettings/tokens`;
}

export default function AzurePersonalAccessTokenForm(props: AzurePersonalAccessTokenFormProps) {
  const {
    almSetting: { url },
    submitting = false,
    validationFailed,
    firstConnection,
  } = props;

  const [touched, setTouched] = React.useState(false);
  React.useEffect(() => {
    setTouched(false);
  }, [submitting]);

  const [token, setToken] = React.useState('');

  const isInvalid = (validationFailed && !touched) || (touched && !token);

  let errorMessage;
  if (!token) {
    errorMessage = translate('onboarding.create_project.pat_form.pat_required');
  } else if (isInvalid) {
    errorMessage = translate('onboarding.create_project.pat_incorrect.azure');
  }

  return (
    <form
      className="sw-mt-3 sw-w-[50%]"
      onSubmit={(e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        props.onPersonalAccessTokenCreate(token);
      }}
    >
      <LightPrimary as="h2" className="sw-heading-md">
        {translate('onboarding.create_project.pat_form.title')}
      </LightPrimary>
      <LightPrimary as="p" className="sw-mt-2 sw-mb-4 sw-body-sm">
        {translate('onboarding.create_project.pat_form.help.azure')}
      </LightPrimary>

      {isInvalid && (
        <div>
          <FlagMessage variant="error" className="sw-mb-4">
            <p>{errorMessage}</p>
          </FlagMessage>
        </div>
      )}

      {!firstConnection && (
        <FlagMessage variant="warning">
          <p>
            {translate('onboarding.create_project.pat.expired.info_message')}{' '}
            {translate('onboarding.create_project.pat.expired.info_message_contact')}
          </p>
        </FlagMessage>
      )}

      <FormField
        htmlFor="personal_access_token"
        className="sw-mt-6 sw-mb-3"
        label={translate('onboarding.create_project.enter_pat')}
        required
      >
        <div>
          <InputField
            autoFocus
            id="personal_access_token"
            minLength={1}
            name="personal_access_token"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setToken(e.target.value);
              setTouched(true);
            }}
            type="text"
            value={token}
            size="large"
            isInvalid={isInvalid}
          />
          {isInvalid && <FlagErrorIcon className="sw-ml-2" />}
        </div>
      </FormField>

      <div className="sw-mb-6">
        <FlagMessage variant="info">
          <p>
            <FormattedMessage
              id="onboarding.create_project.pat_help.instructions.azure"
              defaultMessage={translate('onboarding.create_project.pat_help.instructions.azure')}
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
          </p>
        </FlagMessage>
      </div>

      <div className="sw-flex sw-items-center sw-mb-6">
        <ButtonPrimary type="submit" disabled={isInvalid || submitting || !touched}>
          {translate('save')}
        </ButtonPrimary>
        <DeferredSpinner className="sw-ml-2" loading={submitting} />
      </div>
    </form>
  );
}
