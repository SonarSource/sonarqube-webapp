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

import { Form, ModalForm, toast } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import { FileInput, FormField } from '~design-system';
import MandatoryFieldsExplanation from '~sq-server-commons/components/ui/MandatoryFieldsExplanation';
import { translate } from '~sq-server-commons/helpers/l10n';
import { useRestoreProfileMutation } from '~sq-server-commons/queries/quality-profiles';

interface Props {
  children: React.ReactNode;
}

export function RestoreProfileForm({ children }: Readonly<Props>) {
  const intl = useIntl();
  const { mutate: restoreProfile, isPending } = useRestoreProfileMutation();

  function handleFormSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    restoreProfile(data, {
      onSuccess: (result: {
        profile: { name: string };
        ruleFailures?: number;
        ruleSuccesses: number;
      }) => {
        renderAlert(result.profile, result.ruleFailures ?? 0, result.ruleSuccesses);
      },
    });
  }

  function renderAlert(profile: { name: string }, ruleFailures: number, ruleSuccesses: number) {
    if (ruleFailures > 0) {
      toast.error({
        description: intl.formatMessage(
          { id: `quality_profiles.restore_profile.warning` },
          {
            profileName: profile.name,
            ruleFailures,
            ruleSuccesses,
          },
        ),
        duration: 'medium',
      });
    } else {
      toast.success({
        description: intl.formatMessage(
          { id: `quality_profiles.restore_profile.success` },
          {
            profileName: profile.name,
            ruleSuccesses,
          },
        ),
        duration: 'medium',
      });
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
      isSubmitDisabled={isPending}
      onSubmit={handleFormSubmit}
      secondaryButtonLabel={translate('cancel')}
      submitButtonLabel={translate('restore')}
      title={intl.formatMessage({ id: 'quality_profiles.restore_profile' })}
    >
      {children}
    </ModalForm>
  );
}
