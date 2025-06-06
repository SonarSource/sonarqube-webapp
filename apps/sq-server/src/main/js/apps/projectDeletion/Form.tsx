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
import { addGlobalSuccessMessage } from '~design-system';
import { withRouter } from '~shared/components/hoc/withRouter';
import { Router } from '~shared/types/router';
import ConfirmButton from '~sq-server-commons/components/controls/ConfirmButton';
import { translate, translateWithParameters } from '~sq-server-commons/helpers/l10n';
import { useDeleteApplicationMutation } from '~sq-server-commons/queries/applications';
import { useDeletePortfolioMutation } from '~sq-server-commons/queries/portfolios';
import { useDeleteProjectMutation } from '~sq-server-commons/queries/projects';
import { isPortfolioLike } from '~sq-server-commons/sonar-aligned/helpers/component';
import { isApplication } from '~sq-server-commons/types/component';
import { Component } from '~sq-server-commons/types/types';

interface Props {
  component: Pick<Component, 'key' | 'name' | 'qualifier'>;
  router: Router;
}

export function Form({ component, router }: Readonly<Props>) {
  const { mutate: deleteProject } = useDeleteProjectMutation();
  const { mutate: deleteApplication } = useDeleteApplicationMutation();
  const { mutate: deletePortfolio } = useDeletePortfolioMutation();

  const handleDelete = () => {
    let deleteMethod = deleteProject;
    let redirectTo = '/';

    if (isPortfolioLike(component.qualifier)) {
      deleteMethod = deletePortfolio;
      redirectTo = '/portfolios';
    } else if (isApplication(component.qualifier)) {
      deleteMethod = deleteApplication;
    }

    deleteMethod(component.key, {
      onSuccess: () => {
        addGlobalSuccessMessage(
          translateWithParameters('project_deletion.resource_deleted', component.name),
        );

        router.replace(redirectTo);
      },
    });
  };

  return (
    <ConfirmButton
      confirmButtonText={translate('delete')}
      isDestructive
      modalBody={translateWithParameters(
        'project_deletion.delete_resource_confirmation',
        component.name,
      )}
      modalHeader={translate('qualifier.delete', component.qualifier)}
      onConfirm={handleDelete}
    >
      {({ onClick }) => (
        <Button id="delete-project" onClick={onClick} variety={ButtonVariety.Danger}>
          {translate('delete')}
        </Button>
      )}
    </ConfirmButton>
  );
}

export default withRouter(Form);
