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

import { Button, ButtonVariety, IconPeople, SelectAsync } from '@sonarsource/echoes-react';
import * as React from 'react';
import { GenericAvatar, Modal, Note } from '~design-system';
import Avatar from '~sq-server-shared/components/ui/Avatar';
import { translate } from '~sq-server-shared/helpers/l10n';
import { QGPermissionOption } from '~sq-server-shared/helpers/quality-gates';
import { Group as UserGroup, isUser } from '~sq-server-shared/types/quality-gates';
import { UserBase } from '~sq-server-shared/types/users';

export interface QualityGatePermissionsAddModalRendererProps {
  handleSearch: (q: string) => void;
  loading: boolean;
  onClose: () => void;
  onSelection: (selection: string) => void;
  onSubmit: (event: React.SyntheticEvent<HTMLFormElement>) => void;
  options: QGPermissionOption[];
  selection?: UserBase | UserGroup;
  submitting: boolean;
}

const FORM_ID = 'quality-gate-permissions-add-modal';
const USER_SELECT_INPUT_ID = 'quality-gate-permissions-add-modal-select-input';

export default function QualityGatePermissionsAddModalRenderer(
  props: Readonly<QualityGatePermissionsAddModalRendererProps>,
) {
  const { loading, options, selection, submitting } = props;

  const selectValue = selection && isUser(selection) ? selection.login : selection?.name;

  return (
    <Modal
      body={
        <form id={FORM_ID} onSubmit={props.onSubmit}>
          <SelectAsync
            ariaLabel={translate('quality_gates.permissions.search')}
            className="sw-mb-4"
            data={options}
            id={USER_SELECT_INPUT_ID}
            isLoading={loading}
            label={translate('quality_gates.permissions.search')}
            labelNotFound={translate('select.search.noMatches')}
            onChange={props.onSelection}
            onSearch={props.handleSearch}
            optionComponent={OptionRenderer}
            value={selectValue}
          />
        </form>
      }
      headerTitle={translate('quality_gates.permissions.grant')}
      onClose={props.onClose}
      primaryButton={
        <Button
          form={FORM_ID}
          isDisabled={!selection || submitting}
          type="submit"
          variety={ButtonVariety.Primary}
        >
          {translate('add_verb')}
        </Button>
      }
      secondaryButtonLabel={translate('cancel')}
    />
  );
}

function OptionRenderer(option: Readonly<QGPermissionOption>) {
  if (!option) {
    return null;
  }
  return (
    <div className="sw-flex sw-items-center sw-justify-start">
      {isUser(option) ? (
        <>
          <Avatar hash={option.avatar} name={option.name} />
          <div className="sw-ml-2">
            <strong className="sw-typo-semibold sw-mr-1">{option.name}</strong>
            <br />
            <Note>{option.login}</Note>
          </div>
        </>
      ) : (
        <>
          <GenericAvatar Icon={IconPeople} name={option.name} />
          <strong className="sw-typo-semibold sw-ml-2">{option.name}</strong>
        </>
      )}
    </div>
  );
}
