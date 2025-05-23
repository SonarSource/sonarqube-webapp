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
import { InteractiveIcon, MenuIcon, PencilIcon } from '~design-system';
import { translateWithParameters } from '~sq-server-commons/helpers/l10n';
import { Group } from '~sq-server-commons/types/types';
import EditMembersModal from './EditMembersModal';
import ViewMembersModal from './ViewMembersModal';

interface Props {
  group: Group;
  isManaged: boolean;
  onEdit: () => void;
}

export default function Members(props: Readonly<Props>) {
  const [openModal, setOpenModal] = React.useState(false);
  const { isManaged, group } = props;

  const handleModalClose = () => {
    setOpenModal(false);
    if (!isManaged && !group.default) {
      props.onEdit();
    }
  };

  const isReadonly = isManaged || group.default;

  const title = translateWithParameters(
    isReadonly ? 'groups.users.view' : 'groups.users.edit',
    group.name,
  );

  return (
    <>
      <InteractiveIcon
        Icon={isReadonly ? MenuIcon : PencilIcon}
        aria-label={title}
        className="sw-ml-2"
        onClick={() => {
          setOpenModal(true);
        }}
        size="small"
      />
      {openModal &&
        (isReadonly ? (
          <ViewMembersModal group={group} isManaged={isManaged} onClose={handleModalClose} />
        ) : (
          <EditMembersModal group={group} onClose={handleModalClose} />
        ))}
    </>
  );
}
