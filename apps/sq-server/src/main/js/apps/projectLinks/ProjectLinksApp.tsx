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

import { Button, ButtonVariety, Layout, Spinner } from '@sonarsource/echoes-react';
import { useCallback, useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useFlags } from '~adapters/helpers/feature-flags';
import A11ySkipTarget from '~shared/components/a11y/A11ySkipTarget';
import { ProjectPageTemplate } from '~shared/components/pages/ProjectPageTemplate';
import { createLink, deleteLink, getProjectLinks } from '~sq-server-commons/api/projectLinks';
import withComponentContext from '~sq-server-commons/context/componentContext/withComponentContext';
import { Component, ProjectLink } from '~sq-server-commons/types/types';
import CreationModal from './CreationModal';
import { Header } from './Header';
import ProjectLinkTable from './ProjectLinkTable';

export function ProjectLinksApp({ component }: Readonly<{ component: Component }>) {
  const [creationModal, setCreationModal] = useState(false);
  const [links, setLinks] = useState<ProjectLink[]>([]);
  const [loading, setLoading] = useState(true);
  const { frontEndEngineeringEnableSidebarNavigation } = useFlags();
  const intl = useIntl();

  useEffect(() => {
    setLoading(true);

    getProjectLinks(component.key).then(
      (fetchedLinks) => {
        setLinks(fetchedLinks);
        setLoading(false);
      },
      () => {
        setLoading(false);
      },
    );
  }, [component.key]);

  const addLinkToList = useCallback((link: ProjectLink) => {
    setLinks((prevLinks) => [...prevLinks, link]);
  }, []);

  const removeLinkFromList = useCallback((linkId: string) => {
    setLinks((prevLinks) => prevLinks.filter((link) => link.id !== linkId));
  }, []);

  const handleCreateLink = useCallback(
    (name: string, url: string) => {
      return createLink({ name, projectKey: component.key, url }).then(addLinkToList);
    },
    [component.key, addLinkToList],
  );

  const handleDeleteLink = useCallback(
    async (linkId: string) => {
      await deleteLink(linkId);
      removeLinkFromList(linkId);
    },
    [removeLinkFromList],
  );

  const handleOpenCreationModal = useCallback(() => {
    setCreationModal(true);
  }, []);

  const handleCloseCreationModal = useCallback(() => {
    setCreationModal(false);
  }, []);

  const handleCreateAndClose = useCallback(
    async (name: string, url: string) => {
      await handleCreateLink(name, url);
      setCreationModal(false);
    },
    [handleCreateLink],
  );

  const actions = (
    <Layout.ContentHeader.Actions>
      <Button
        id="create-project-link"
        onClick={handleOpenCreationModal}
        variety={ButtonVariety.Primary}
      >
        <FormattedMessage id="create" />
      </Button>
    </Layout.ContentHeader.Actions>
  );

  const description = (
    <Layout.ContentHeader.Description>
      <FormattedMessage id="project_links.page.description" />
    </Layout.ContentHeader.Description>
  );

  return (
    <>
      <ProjectPageTemplate
        actions={actions}
        description={description}
        disableBranchSelector
        title={intl.formatMessage({ id: 'project_links.page' })}
      >
        <A11ySkipTarget anchor="links_main" />

        {!frontEndEngineeringEnableSidebarNavigation && (
          <Header onCreateClick={handleOpenCreationModal} />
        )}

        <div className="sw-mt-16">
          <Spinner isLoading={loading}>
            <ProjectLinkTable links={links} onDelete={handleDeleteLink} />
          </Spinner>
        </div>
      </ProjectPageTemplate>

      {creationModal && (
        <CreationModal onClose={handleCloseCreationModal} onSubmit={handleCreateAndClose} />
      )}
    </>
  );
}

export default withComponentContext(ProjectLinksApp);
