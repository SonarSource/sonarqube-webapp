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

import { Button, ButtonVariety } from '@sonarsource/echoes-react';
import { useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { FileInput, FlagMessage, FormField, Modal } from '~design-system';
import { restoreQualityProfile } from '~sq-server-shared/api/quality-profiles';
import MandatoryFieldsExplanation from '~sq-server-shared/components/ui/MandatoryFieldsExplanation';

interface Props {
  onClose: () => void;
  onRestore: () => void;
}

export default function RestoreProfileForm({ onClose, onRestore }: Readonly<Props>) {
  const intl = useIntl();

  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState();
  const [ruleFailures, setRuleFailures] = useState();
  const [ruleSuccesses, setRuleSuccesses] = useState();

  const formRef = useRef<HTMLFormElement>(null);

  async function handleFormSubmit() {
    if (!formRef.current) {
      return;
    }
    const data = new FormData(formRef.current);

    try {
      setLoading(true);
      const { profile, ruleFailures, ruleSuccesses } = await restoreQualityProfile(data);
      setProfile(profile);
      setRuleFailures(ruleFailures);
      setRuleSuccesses(ruleSuccesses);
      onRestore();
    } finally {
      setLoading(false);
    }
  }

  function renderAlert(profile: { name: string }, ruleFailures: number, ruleSuccesses: number) {
    return ruleFailures ? (
      <FlagMessage variant="warning">
        {intl.formatMessage(
          {
            id: `quality_profiles.restore_profile.warning`,
          },
          {
            profileName: profile.name,
            ruleFailures,
            ruleSuccesses,
          },
        )}
      </FlagMessage>
    ) : (
      <FlagMessage variant="success">
        {intl.formatMessage(
          {
            id: `quality_profiles.restore_profile.success`,
          },
          {
            profileName: profile.name,
            ruleSuccesses,
          },
        )}
      </FlagMessage>
    );
  }

  return (
    <Modal
      body={
        <form ref={formRef}>
          {profile != null && ruleSuccesses != null ? (
            renderAlert(profile, ruleFailures ?? 0, ruleSuccesses)
          ) : (
            <>
              <MandatoryFieldsExplanation className="modal-field" />
              <FormField
                htmlFor="restore-profile-backup"
                label={intl.formatMessage({ id: 'backup' })}
              >
                <FileInput
                  chooseLabel={intl.formatMessage({ id: 'choose_file' })}
                  clearLabel={intl.formatMessage({ id: 'clear_file' })}
                  id="restore-profile-backup"
                  name="backup"
                  noFileLabel={intl.formatMessage({ id: 'no_file_selected' })}
                  required
                />
              </FormField>
            </>
          )}
        </form>
      }
      headerTitle={intl.formatMessage({ id: 'quality_profiles.restore_profile' })}
      onClose={onClose}
      primaryButton={
        ruleSuccesses == null && (
          <Button
            id="restore-profile-submit"
            isDisabled={loading}
            isLoading={loading}
            onClick={handleFormSubmit}
            variety={ButtonVariety.Primary}
          >
            {intl.formatMessage({ id: 'restore' })}
          </Button>
        )
      }
      secondaryButtonLabel={intl.formatMessage({ id: ruleSuccesses == null ? 'cancel' : 'close' })}
    />
  );
}
