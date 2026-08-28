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

import * as React from 'react';
import { withRouter } from '~shared/components/hoc/withRouter';
import { Location } from '~shared/types/router';
import { getScannableProjects } from '../../api/components';
import { getValue } from '../../api/settings';
import { getHostUrl } from '../../helpers/urls';
import { hasGlobalPermission } from '../../helpers/users';
import { useAlmSettingsQuery } from '../../queries/alm-settings';
import { useProjectBindingQuery } from '../../queries/devops-integration';
import { Permissions } from '../../types/permissions';
import { SettingsKey } from '../../types/settings';
import { Component } from '../../types/types';
import { LoggedInUser } from '../../types/users';
import TutorialSelectionRenderer from './TutorialSelectionRenderer';
import { TutorialModes } from './types';

export interface TutorialSelectionProps {
  component: Component;
  currentUser: LoggedInUser;
  location: Location;
  willRefreshAutomatically?: boolean;
}

function TutorialSelection(props: Readonly<TutorialSelectionProps>) {
  const { component, currentUser, location, willRefreshAutomatically } = props;
  const [currentUserCanScanProject, setCurrentUserCanScanProject] = React.useState(false);
  const [baseUrl, setBaseUrl] = React.useState(getHostUrl());
  const [loading, setLoading] = React.useState(true);
  const { data: projectBinding } = useProjectBindingQuery(component.key);
  const { data: almSettings, isLoading: loadingAlm } = useAlmSettingsQuery(component.key, {
    enabled: projectBinding != null,
  });
  const almBinding = almSettings?.find((d) => d.key === projectBinding?.key);

  React.useEffect(() => {
    const checkUserPermissions = async () => {
      if (hasGlobalPermission(currentUser, Permissions.Scan)) {
        setCurrentUserCanScanProject(true);
        return Promise.resolve();
      }

      const { projects } = await getScannableProjects();
      setCurrentUserCanScanProject(projects.find((p) => p.key === component.key) !== undefined);

      return Promise.resolve();
    };

    const fetchBaseUrl = async () => {
      const setting = await getValue({ key: SettingsKey.ServerBaseUrl }).catch(() => undefined);
      const baseUrl = setting?.value;
      if (baseUrl && baseUrl.length > 0) {
        setBaseUrl(baseUrl);
      }
    };

    Promise.all([fetchBaseUrl(), checkUserPermissions()])
      .then(() => {
        setLoading(false);
      })
      .catch(() => {});
  }, [component.key, currentUser]);

  const selectedTutorial: TutorialModes | undefined = location.query?.selectedTutorial;

  return (
    <TutorialSelectionRenderer
      almBinding={almBinding}
      baseUrl={baseUrl}
      component={component}
      currentUser={currentUser}
      currentUserCanScanProject={currentUserCanScanProject}
      loading={loading || loadingAlm}
      projectBinding={projectBinding}
      selectedTutorial={selectedTutorial}
      willRefreshAutomatically={willRefreshAutomatically}
    />
  );
}

export default withRouter(TutorialSelection);
