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
  Form,
  FormFieldWidth,
  MessageCallout,
  MessageVariety,
  ModalForm,
  TextInput,
} from '@sonarsource/echoes-react';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { KeyboardKeys } from '~sq-server-commons/helpers/keycodes';
import { translate } from '~sq-server-commons/helpers/l10n';
import useKeyDown from '~sq-server-commons/hooks/useKeydown';
import { useProfileInheritanceQuery } from '~sq-server-commons/queries/quality-profiles';
import { Profile, ProfileActionModals } from '~sq-server-commons/types/quality-profiles';

export interface ProfileModalFormProps {
  action: ProfileActionModals.Copy | ProfileActionModals.Extend | ProfileActionModals.Rename;
  children: React.ReactNode;
  loading: boolean;
  onSubmit: (name: string) => void;
  profile: Profile;
}

const LABELS_FOR_ACTION: Record<string, { button: string; header: string }> = {
  [ProfileActionModals.Copy]: { button: 'copy', header: 'quality_profiles.copy_x_title' },
  [ProfileActionModals.Rename]: { button: 'rename', header: 'quality_profiles.rename_x_title' },
  [ProfileActionModals.Extend]: { button: 'extend', header: 'quality_profiles.extend_x_title' },
};

export default function ProfileModalForm(props: Readonly<ProfileModalFormProps>) {
  const { children, action, loading, profile, onSubmit } = props;
  const [name, setName] = React.useState('');

  const submitDisabled = loading || !name || name === profile.name;
  const labels = LABELS_FOR_ACTION[action];

  const { data: { ancestors } = {} } = useProfileInheritanceQuery(props.profile);

  const handleSubmit = React.useCallback(() => {
    if (name) {
      onSubmit(name);
    }
  }, [name, onSubmit]);

  useKeyDown(handleSubmit, [KeyboardKeys.Enter]);

  const extendsBuiltIn = ancestors?.some((profile) => profile.isBuiltIn);
  const showBuiltInWarning =
    (action === ProfileActionModals.Copy && !extendsBuiltIn) ||
    (action === ProfileActionModals.Extend && !profile.isBuiltIn && !extendsBuiltIn);

  return (
    <ModalForm
      content={
        <Form.Section>
          {showBuiltInWarning && (
            <MessageCallout className="sw-mb-4" variety={MessageVariety.Info}>
              <div className="sw-flex sw-flex-col">
                {translate('quality_profiles.no_built_in_updates_warning.new_profile')}
                <span className="sw-mt-2">
                  {translate('quality_profiles.no_built_in_updates_warning.new_profile.2')}
                </span>
              </div>
            </MessageCallout>
          )}

          {action === ProfileActionModals.Copy && (
            <p className="sw-mb-8">
              <FormattedMessage
                id="quality_profiles.copy_help"
                values={{ profile: profile.name }}
              />
            </p>
          )}
          {action === ProfileActionModals.Extend && (
            <p className="sw-mb-8">
              <FormattedMessage
                id="quality_profiles.extend_help"
                values={{ profile: profile.name }}
              />
            </p>
          )}
          <TextInput
            id="quality-profile-new-name"
            isRequired
            label={translate('quality_profiles.new_name')}
            name="name"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setName(event.target.value);
            }}
            type="text"
            value={name}
            width={FormFieldWidth.Full}
          />
        </Form.Section>
      }
      isSubmitDisabled={loading || submitDisabled}
      onSubmit={handleSubmit}
      secondaryButtonLabel={translate('cancel')}
      submitButtonLabel={translate(labels.button)}
      title={
        <FormattedMessage
          id={labels.header}
          values={{ profile: profile.name, language: profile.languageName }}
        />
      }
    >
      {children}
    </ModalForm>
  );
}
