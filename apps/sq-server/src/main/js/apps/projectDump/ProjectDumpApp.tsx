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

import { Helmet } from 'react-helmet-async';
import { BasicSeparator, LargeCenteredLayout, Title } from '~design-system';
import withAvailableFeatures, {
  WithAvailableFeaturesProps,
} from '~sq-server-commons/context/available-features/withAvailableFeatures';
import withComponentContext from '~sq-server-commons/context/componentContext/withComponentContext';
import { translate } from '~sq-server-commons/helpers/l10n';
import { Feature } from '~sq-server-commons/types/features';
import { Component } from '~sq-server-commons/types/types';
import Export from './components/Export';
import Import from './components/Import';
import './styles.css';

interface Props extends WithAvailableFeaturesProps {
  component: Component;
}

export function ProjectDumpApp({ component, hasFeature }: Readonly<Props>) {
  const projectImportFeatureEnabled = hasFeature(Feature.ProjectImport);

  return (
    <LargeCenteredLayout id="project-dump">
      <div className="sw-my-8">
        <header className="sw-mb-5">
          <Helmet defer={false} title={translate('project_dump.page')} />
          <Title className="sw-mb-4">{translate('project_dump.page')}</Title>
          <div>
            {projectImportFeatureEnabled ? (
              <>
                <p>{translate('project_dump.page.description1')}</p>
                <p>{translate('project_dump.page.description2')}</p>
              </>
            ) : (
              <>
                <p>{translate('project_dump.page.description_without_import1')}</p>
                <p>{translate('project_dump.page.description_without_import2')}</p>
              </>
            )}
          </div>
        </header>

        <>
          <div className="sw-mb-4">
            <h2 className="sw-heading-lg">{translate('project_dump.export')}</h2>
          </div>
          <Export componentKey={component.key} />
          <BasicSeparator className="sw-my-8" />
          <Import componentKey={component.key} importEnabled={!!projectImportFeatureEnabled} />
        </>
      </div>
    </LargeCenteredLayout>
  );
}

export default withComponentContext(withAvailableFeatures(ProjectDumpApp));
