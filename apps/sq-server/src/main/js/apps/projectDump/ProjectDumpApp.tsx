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

import { Divider, Layout } from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useFlags } from '~adapters/helpers/feature-flags';
import { ProjectPageTemplate } from '~shared/components/pages/ProjectPageTemplate';
import withAvailableFeatures, {
  WithAvailableFeaturesProps,
} from '~sq-server-commons/context/available-features/withAvailableFeatures';
import withComponentContext from '~sq-server-commons/context/componentContext/withComponentContext';
import { Feature } from '~sq-server-commons/types/features';
import { Component } from '~sq-server-commons/types/types';
import Export from './components/Export';
import Import from './components/Import';
import './styles.css';

interface Props extends WithAvailableFeaturesProps {
  component: Component;
}

export function ProjectDumpApp({ component, hasFeature }: Readonly<Props>) {
  const intl = useIntl();
  const { frontEndEngineeringEnableSidebarNavigation } = useFlags();
  const projectImportFeatureEnabled = hasFeature(Feature.ProjectImport);

  const description = projectImportFeatureEnabled ? (
    <>
      <FormattedMessage id="project_dump.page.description1" tagName="p" />
      <FormattedMessage id="project_dump.page.description2" tagName="p" />
    </>
  ) : (
    <>
      <FormattedMessage id="project_dump.page.description_without_import1" tagName="p" />
      <FormattedMessage id="project_dump.page.description_without_import2" tagName="p" />
    </>
  );

  const title = intl.formatMessage({ id: 'project_dump.page' });

  return (
    <ProjectPageTemplate
      description={<Layout.PageHeader.Description>{description}</Layout.PageHeader.Description>}
      disableBranchSelector
      header={
        !frontEndEngineeringEnableSidebarNavigation && (
          <Layout.PageHeader
            description={
              <Layout.PageHeader.Description>{description}</Layout.PageHeader.Description>
            }
            title={<Layout.PageHeader.Title>{title}</Layout.PageHeader.Title>}
          />
        )
      }
      title={title}
    >
      <div className="sw-mb-4">
        <h2 className="sw-heading-lg">
          <FormattedMessage id="project_dump.export" />
        </h2>
      </div>
      <Export componentKey={component.key} />
      <Divider className="sw-my-8" />
      <Import componentKey={component.key} importEnabled={!!projectImportFeatureEnabled} />
    </ProjectPageTemplate>
  );
}

export default withComponentContext(withAvailableFeatures(ProjectDumpApp));
