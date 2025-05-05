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
  Button,
  ButtonVariety,
  MessageInline,
  MessageType,
  ModalAlert,
} from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { translate } from '~sq-server-commons/helpers/l10n';
import { Profile } from '~sq-server-commons/types/quality-profiles';

export interface DeleteProfileFormProps {
  children?: React.ReactNode;
  loading: boolean;
  onDelete: () => void;
  profile: Profile;
}

export default function DeleteProfileForm(props: Readonly<DeleteProfileFormProps>) {
  const { children, loading, profile } = props;
  const header = translate('quality_profiles.delete_confirm_title');

  return (
    <ModalAlert
      content={
        <>
          {profile.childrenCount > 0 ? (
            <div className="sw-flex sw-flex-col">
              <MessageInline className="sw-mb-4" type={MessageType.Warning}>
                {translate('quality_profiles.this_profile_has_descendants')}
              </MessageInline>
              <FormattedMessage
                id="quality_profiles.are_you_sure_want_delete_profile_x_and_descendants"
                values={{ profileName: profile.name }}
              />
            </div>
          ) : (
            <FormattedMessage
              id="quality_profiles.are_you_sure_want_delete_profile_x"
              values={{ profileName: profile.name }}
            />
          )}
        </>
      }
      description={translate('quality_profiles.delete_confirm_description')}
      primaryButton={
        <Button
          isDisabled={loading}
          onClick={() => {
            props.onDelete();
          }}
          variety={ButtonVariety.Danger}
        >
          {translate('delete')}
        </Button>
      }
      secondaryButtonLabel={translate('cancel')}
      title={header}
    >
      {children}
    </ModalAlert>
  );
}
