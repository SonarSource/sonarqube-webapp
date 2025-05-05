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

import { Form, ModalForm } from '@sonarsource/echoes-react';
import { FormEvent, useState } from 'react';
import { useIntl } from 'react-intl';
import {
  addGlobalErrorMessage,
  addGlobalSuccessMessage,
  FileInput,
  FormField,
} from '~design-system';
import { restoreQualityProfile } from '~sq-server-commons/api/quality-profiles';
import MandatoryFieldsExplanation from '~sq-server-commons/components/ui/MandatoryFieldsExplanation';
import { translate } from '~sq-server-commons/helpers/l10n';

interface Props {
  children: React.ReactNode;
  onRestore: () => void;
}

export default function RestoreProfileForm({ children, onRestore }: Readonly<Props>) {
  const intl = useIntl();

  const [loading, setLoading] = useState(false);

  async function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    try {
      setLoading(true);
      const { profile, ruleFailures, ruleSuccesses } = await restoreQualityProfile(data);
      renderAlert(profile, ruleFailures ?? 0, ruleSuccesses);
      onRestore();
    } finally {
      setLoading(false);
    }
  }

  function renderAlert(profile: { name: string }, ruleFailures: number, ruleSuccesses: number) {
    if (ruleFailures > 0) {
      addGlobalErrorMessage(
        intl.formatMessage(
          {
            id: `quality_profiles.restore_profile.warning`,
          },
          {
            profileName: profile.name,
            ruleFailures,
            ruleSuccesses,
          },
        ),
      );
    } else {
      addGlobalSuccessMessage(
        intl.formatMessage(
          {
            id: `quality_profiles.restore_profile.success`,
          },
          {
            profileName: profile.name,
            ruleSuccesses,
          },
        ),
      );
    }
  }

  return (
    <ModalForm
      content={
        <Form.Section>
          <MandatoryFieldsExplanation className="modal-field" />
          <FormField htmlFor="restore-profile-backup" label={intl.formatMessage({ id: 'backup' })}>
            <FileInput
              chooseLabel={intl.formatMessage({ id: 'choose_file' })}
              clearLabel={intl.formatMessage({ id: 'clear_file' })}
              id="restore-profile-backup"
              name="backup"
              noFileLabel={intl.formatMessage({ id: 'no_file_selected' })}
              required
            />
          </FormField>
        </Form.Section>
      }
      isSubmitDisabled={loading}
      onSubmit={handleFormSubmit}
      secondaryButtonLabel={translate('cancel')}
      submitButtonLabel={translate('restore')}
      title={intl.formatMessage({ id: 'quality_profiles.restore_profile' })}
    >
      {children}
    </ModalForm>
  );
}
