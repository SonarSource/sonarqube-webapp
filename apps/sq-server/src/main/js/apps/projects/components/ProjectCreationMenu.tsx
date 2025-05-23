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

import { IconChevronDown } from '@sonarsource/echoes-react';
import * as React from 'react';
import {
  ButtonSecondary,
  Dropdown,
  ItemDivider,
  ItemLink,
  PopupPlacement,
  PopupZLevel,
} from '~design-system';
import { getAlmSettings } from '~sq-server-commons/api/alm-settings';
import withCurrentUserContext from '~sq-server-commons/context/current-user/withCurrentUserContext';
import { IMPORT_COMPATIBLE_ALMS } from '~sq-server-commons/helpers/constants';
import { translate } from '~sq-server-commons/helpers/l10n';
import { hasGlobalPermission } from '~sq-server-commons/helpers/users';
import { AlmKeys, AlmSettingsInstance } from '~sq-server-commons/types/alm-settings';
import { Permissions } from '~sq-server-commons/types/permissions';
import { LoggedInUser } from '~sq-server-commons/types/users';
import ProjectCreationMenuItem from './ProjectCreationMenuItem';

interface Props {
  currentUser: LoggedInUser;
}

interface State {
  boundAlms: Array<string>;
}

const almSettingsValidators = {
  [AlmKeys.Azure]: (settings: AlmSettingsInstance) => Boolean(settings.url),
  [AlmKeys.BitbucketCloud]: (_: AlmSettingsInstance) => true,
  [AlmKeys.BitbucketServer]: (_: AlmSettingsInstance) => true,
  [AlmKeys.GitHub]: (_: AlmSettingsInstance) => true,
  [AlmKeys.GitLab]: (settings: AlmSettingsInstance) => Boolean(settings.url),
};

export class ProjectCreationMenu extends React.PureComponent<Props, State> {
  mounted = false;
  state: State = { boundAlms: [] };

  componentDidMount() {
    this.mounted = true;

    this.fetchAlmBindings();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  almSettingIsValid = (settings: AlmSettingsInstance) => {
    return almSettingsValidators[settings.alm](settings);
  };

  fetchAlmBindings = async () => {
    const { currentUser } = this.props;
    const canCreateProject = hasGlobalPermission(currentUser, Permissions.ProjectCreation);

    // getAlmSettings requires branchesEnabled
    if (!canCreateProject) {
      return;
    }

    const almSettings: AlmSettingsInstance[] = await getAlmSettings().catch(() => []);

    const boundAlms = IMPORT_COMPATIBLE_ALMS.filter((key) => {
      const currentAlmSettings = almSettings.filter((s) => s.alm === key);

      return (
        currentAlmSettings.length > 0 &&
        key === currentAlmSettings[0].alm &&
        this.almSettingIsValid(currentAlmSettings[0])
      );
    });

    if (this.mounted) {
      this.setState({
        boundAlms,
      });
    }
  };

  render() {
    const { currentUser } = this.props;
    const { boundAlms } = this.state;

    const canCreateProject = hasGlobalPermission(currentUser, Permissions.ProjectCreation);

    if (!canCreateProject) {
      return null;
    }

    return (
      <Dropdown
        id="project-creation-menu"
        overlay={
          <>
            {[...boundAlms, 'manual'].map((alm) => (
              <ProjectCreationMenuItem alm={alm} key={alm} />
            ))}
            {boundAlms.length < IMPORT_COMPATIBLE_ALMS.length && (
              <>
                <ItemDivider />

                <ItemLink to={{ pathname: '/projects/create' }}>
                  {boundAlms.length === 0
                    ? translate('my_account.add_project.more')
                    : translate('my_account.add_project.more_others')}
                </ItemLink>
              </>
            )}
          </>
        }
        placement={PopupPlacement.BottomRight}
        size="auto"
        zLevel={PopupZLevel.Global}
      >
        <ButtonSecondary>
          {translate('projects.add')}

          <IconChevronDown className="sw-ml-1" />
        </ButtonSecondary>
      </Dropdown>
    );
  }
}

export default withCurrentUserContext(ProjectCreationMenu);
