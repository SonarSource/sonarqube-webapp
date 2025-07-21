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

import { Button, ButtonVariety, Heading, SearchInput, Text } from '@sonarsource/echoes-react';
import { sortBy, uniqBy } from 'lodash';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { getIntl } from '~sq-server-commons/helpers/l10nBundle';
import { Notification, NotificationProject } from '~sq-server-commons/types/notifications';
import ProjectModal from './ProjectModal';
import ProjectNotifications from './ProjectNotifications';

export interface Props {
  notifications: Notification[];
}

interface State {
  addedProjects: NotificationProject[];
  search: string;
  showModal: boolean;
}

function isNotificationProject(project: {
  project?: string;
  projectName?: string;
}): project is NotificationProject {
  return project.project !== undefined && project.projectName !== undefined;
}

export default class Projects extends React.PureComponent<Props, State> {
  state: State = {
    addedProjects: [],
    search: '',
    showModal: false,
  };

  filterSearch = (project: NotificationProject, search: string) => {
    return project.projectName?.toLowerCase().includes(search);
  };

  handleAddProject = (project: NotificationProject) => {
    this.setState((state) => {
      return {
        addedProjects: [...state.addedProjects, project],
      };
    });
  };

  handleSearch = (search = '') => {
    this.setState({ search });
  };

  handleSubmit = (selectedProject: NotificationProject) => {
    if (selectedProject) {
      this.handleAddProject(selectedProject);
    }

    this.closeModal();
  };

  closeModal = () => {
    this.setState({ showModal: false });
  };

  openModal = () => {
    this.setState({ showModal: true });
  };

  render() {
    const { notifications } = this.props;
    const { addedProjects, search } = this.state;
    const intl = getIntl();

    const projects = uniqBy(notifications, ({ project }) => project).filter(
      isNotificationProject,
    ) as NotificationProject[];

    const allProjects = uniqBy([...addedProjects, ...projects], (project) => project.project);

    const lowerCaseSearch = search.toLowerCase();
    const filteredProjects = sortBy(
      allProjects.filter((p) => this.filterSearch(p, lowerCaseSearch)),
      'projectName',
    );

    return (
      <section data-test="account__project-notifications">
        <div className="sw-flex sw-justify-between">
          <Heading as="h2" hasMarginBottom>
            <FormattedMessage id="my_profile.per_project_notifications.title" />
          </Heading>

          <div className="sw-flex sw-gap-4">
            {allProjects.length > 0 && (
              <div className="sw-mb-4">
                <SearchInput
                  onChange={this.handleSearch}
                  placeholderLabel={intl.formatMessage({
                    id: 'my_profile.per_project_notifications.filter',
                  })}
                  value={this.state.search}
                  width="medium"
                />
              </div>
            )}

            <Button onClick={this.openModal} variety={ButtonVariety.Primary}>
              <span data-test="account__add-project-notification">
                <FormattedMessage id="my_profile.per_project_notifications.add" />
              </span>
            </Button>
          </div>
        </div>

        {this.state.showModal && (
          <ProjectModal
            addedProjects={allProjects}
            closeModal={this.closeModal}
            onSubmit={this.handleSubmit}
          />
        )}

        <div>
          {allProjects.length === 0 && (
            <Text isSubtle>
              <FormattedMessage id="my_account.no_project_notifications" />
            </Text>
          )}

          {filteredProjects.map((project) => (
            <ProjectNotifications key={project.project} project={project} />
          ))}
        </div>
      </section>
    );
  }
}
