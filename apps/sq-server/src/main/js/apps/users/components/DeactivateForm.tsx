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

import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import {
  Checkbox,
  DangerButtonPrimary,
  FlagMessage,
  LightPrimary,
  Link,
  Modal,
} from '~design-system';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { useDocUrl } from '~sq-server-commons/helpers/docs';
import { translate, translateWithParameters } from '~sq-server-commons/helpers/l10n';
import { useDeactivateUserMutation } from '~sq-server-commons/queries/users';
import { RestUserDetailed } from '~sq-server-commons/types/users';

export interface Props {
  onClose: () => void;
  user: RestUserDetailed;
}

const DEACTIVATE_FORM_ID = 'deactivate-user-form';

export default function DeactivateForm(props: Props) {
  const { user } = props;
  const [anonymize, setAnonymize] = React.useState(false);

  const { mutate: deactivateUser, isPending } = useDeactivateUserMutation();

  const handleDeactivate = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    deactivateUser(
      { id: user.id, anonymize },
      {
        onSuccess: props.onClose,
      },
    );
  };

  const header = translate('users.deactivate_user');
  const docUrl = useDocUrl(DocLink.AuthOverview);

  return (
    <Modal
      body={
        <form autoComplete="off" id={DEACTIVATE_FORM_ID} onSubmit={handleDeactivate}>
          {translateWithParameters('users.deactivate_user.confirmation', user.name, user.login)}
          <Checkbox
            checked={anonymize}
            className="sw-flex sw-items-center sw-mt-4"
            id="delete-user"
            onCheck={setAnonymize}
          >
            <LightPrimary className="sw-ml-3">{translate('users.delete_user')}</LightPrimary>
          </Checkbox>
          {anonymize && (
            <FlagMessage className="sw-mt-2" variant="warning">
              <span>
                <FormattedMessage
                  id="users.delete_user.help"
                  values={{
                    link: <Link to={docUrl}>{translate('users.delete_user.help.link')}</Link>,
                  }}
                />
              </span>
            </FlagMessage>
          )}
        </form>
      }
      headerTitle={header}
      loading={isPending}
      onClose={props.onClose}
      primaryButton={
        <DangerButtonPrimary disabled={isPending} form={DEACTIVATE_FORM_ID} type="submit">
          {translate('users.deactivate')}
        </DangerButtonPrimary>
      }
      secondaryButtonLabel={translate('cancel')}
    />
  );
}
