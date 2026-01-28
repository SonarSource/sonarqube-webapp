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

import { Button, ButtonVariety } from '@sonarsource/echoes-react';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Component } from '~sq-server-commons/types/types';
import ApplyTemplate from './ApplyTemplate';
import { useProjectProvisionedStatus } from './useProjectProvisionedStatus';

interface Props {
  component: Component;
  isProjectManaged: boolean;
  loadHolders: VoidFunction;
}

export function PermissionsProjectPageAction(props: Readonly<Props>) {
  const { component, isProjectManaged, loadHolders } = props;
  const [applyTemplateModal, setApplyTemplateModal] = React.useState(false);
  const { canApplyPermissionTemplate } = useProjectProvisionedStatus(component, isProjectManaged);

  const handleApplyTemplate = () => {
    setApplyTemplateModal(true);
  };

  const handleApplyTemplateClose = () => {
    setApplyTemplateModal(false);
  };

  if (!canApplyPermissionTemplate) {
    return null;
  }

  return (
    <>
      <Button
        className="js-apply-template"
        onClick={handleApplyTemplate}
        variety={ButtonVariety.Primary}
      >
        <FormattedMessage id="projects_role.apply_template" />
      </Button>

      {applyTemplateModal && (
        <ApplyTemplate
          onApply={loadHolders}
          onClose={handleApplyTemplateClose}
          project={component}
        />
      )}
    </>
  );
}
