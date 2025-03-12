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
  ButtonIcon,
  ButtonVariety,
  FormFieldWidth,
  IconDelete,
  TextInput,
} from '@sonarsource/echoes-react';
import { translate, translateWithParameters } from '~sq-server-shared/helpers/l10n';

export interface Props {
  idx: number;
  onChange: (idx: number, scmAccount: string) => void;
  onRemove: (idx: number) => void;
  scmAccount: string;
}

export default function UserScmAccountInput(props: Readonly<Props>) {
  const { idx, scmAccount } = props;

  const inputAriaLabel = scmAccount.trim()
    ? translateWithParameters('users.create_user.scm_account_x', scmAccount)
    : translate('users.create_user.scm_account_new');

  return (
    <div className="it__scm-account sw-flex sw-mb-2 sw-items-end">
      <TextInput
        aria-label={inputAriaLabel}
        id="scm-account"
        maxLength={255}
        onChange={(event) => {
          props.onChange(idx, event.currentTarget.value);
        }}
        type="text"
        value={scmAccount}
        width={FormFieldWidth.Full}
      />
      <ButtonIcon
        Icon={IconDelete}
        ariaLabel={translateWithParameters('remove_x', inputAriaLabel)}
        className="sw-ml-1"
        onClick={() => props.onRemove(idx)}
        variety={ButtonVariety.DangerGhost}
      />
    </div>
  );
}
