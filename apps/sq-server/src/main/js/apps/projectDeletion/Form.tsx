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

import { Button, ButtonVariety, ModalAlert, toast } from '@sonarsource/echoes-react';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { withRouter } from '~shared/components/hoc/withRouter';
import { isApplication, isPortfolioLike } from '~shared/helpers/component';
import { ComponentQualifier } from '~shared/types/component';
import { Router } from '~shared/types/router';
import { useDeleteApplicationMutation } from '~sq-server-commons/queries/applications';
import { useDeletePortfolioMutation } from '~sq-server-commons/queries/portfolios';
import { useDeleteProjectMutation } from '~sq-server-commons/queries/projects';
import { Component } from '~sq-server-commons/types/types';

interface Props {
  component: Pick<Component, 'key' | 'name' | 'qualifier'>;
  router: Router;
}

export function Form({ component, router }: Readonly<Props>) {
  const intl = useIntl();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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

    setIsDeleting(true);
    deleteMethod(component.key, {
      onSuccess: () => {
        toast.success({
          description: intl.formatMessage(
            { id: 'project_deletion.resource_deleted' },
            { name: component.name },
          ),
          duration: 'medium',
        });

        setIsModalOpen(false);
        router.replace(redirectTo);
      },
      onSettled: () => {
        setIsDeleting(false);
      },
    });
  };

  const getTitle = (qualifier: ComponentQualifier) => {
    switch (qualifier) {
      case ComponentQualifier.Project:
        return intl.formatMessage({ id: 'qualifier.delete.TRK' });
      case ComponentQualifier.Portfolio:
        return intl.formatMessage({ id: 'qualifier.delete.VW' });
      case ComponentQualifier.Application:
        return intl.formatMessage({ id: 'qualifier.delete.APP' });
      default:
        return '';
    }
  };

  return (
    <ModalAlert
      description={intl.formatMessage(
        { id: 'project_deletion.delete_resource_confirmation' },
        { name: component.name },
      )}
      isOpen={isModalOpen}
      onOpenChange={setIsModalOpen}
      primaryButton={
        <Button
          isDisabled={isDeleting}
          isLoading={isDeleting}
          onClick={handleDelete}
          variety={ButtonVariety.Danger}
        >
          {intl.formatMessage({ id: 'delete' })}
        </Button>
      }
      secondaryButton={
        <Button
          isDisabled={isDeleting}
          onClick={() => {
            setIsModalOpen(false);
          }}
        >
          {intl.formatMessage({ id: 'cancel' })}
        </Button>
      }
      title={intl.formatMessage({ id: getTitle(component.qualifier) })}
    >
      <Button
        id="delete-project"
        onClick={() => {
          setIsModalOpen(true);
        }}
        variety={ButtonVariety.Danger}
      >
        {intl.formatMessage({ id: 'delete' })}
      </Button>
    </ModalAlert>
  );
}

export default withRouter(Form);
