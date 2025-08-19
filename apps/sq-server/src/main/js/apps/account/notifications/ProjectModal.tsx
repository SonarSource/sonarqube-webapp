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

import {
  Button,
  ButtonVariety,
  HelperText,
  SelectAsync,
  SelectOption,
} from '@sonarsource/echoes-react';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Modal } from '~design-system';
import { ComponentQualifier } from '~shared/types/component';
import { getSuggestions } from '~sq-server-commons/api/components';
import { NotificationProject } from '~sq-server-commons/types/notifications';

interface Props {
  addedProjects: NotificationProject[];
  closeModal: VoidFunction;
  onSubmit: (project: NotificationProject) => void;
}

interface State {
  loading?: boolean;
  selectedProject?: NotificationProject;
  suggestions: NotificationProject[];
}

export default class ProjectModal extends React.PureComponent<Props, State> {
  mounted = false;
  state: State;

  constructor(props: Props) {
    super(props);
    this.state = { suggestions: [] };
  }

  componentDidMount() {
    this.mounted = true;

    this.handleSearch('');
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  handleSearch = (query: string) => {
    const { addedProjects } = this.props;

    this.setState({ loading: true, selectedProject: undefined });

    getSuggestions(query.length >= 2 ? query : undefined).then(
      (r) => {
        if (this.mounted) {
          let suggestions: NotificationProject[] = [];

          const projects = r.results.find((domain) => domain.q === ComponentQualifier.Project);

          if (projects && projects.items.length > 0) {
            suggestions = projects.items
              .filter((item) => !addedProjects.find((p) => p.project === item.key))
              .map((item) => ({
                project: item.key,
                projectName: item.name,
              }));
          }

          this.setState(({ selectedProject }) => ({
            loading: false,
            suggestions: selectedProject ? suggestions?.concat(selectedProject) : suggestions,
          }));
        }
      },
      () => {
        if (this.mounted) {
          this.setState({ loading: false });
        }
      },
    );
  };

  handleSelect = (selectedProject?: NotificationProject) => {
    if (selectedProject) {
      this.setState({
        selectedProject,
      });
    }
  };

  handleSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { selectedProject } = this.state;

    if (selectedProject) {
      this.props.onSubmit(selectedProject);
    }
  };

  render() {
    const { closeModal } = this.props;
    const { loading, selectedProject, suggestions } = this.state;

    return (
      <Modal
        body={
          <form id="project-notifications-modal-form" onSubmit={this.handleSubmit}>
            <SelectAsync
              className="sw-py-1"
              data={suggestionsToOptions(suggestions)}
              isLoading={loading}
              label={<FormattedMessage id="my_account.set_notifications_for" />}
              labelNotFound={<FormattedMessage id="no_results" />}
              onChange={(key: string) => {
                this.handleSelect(suggestions.find(({ project }) => project === key));
              }}
              onSearch={this.handleSearch}
              value={selectedProject?.project ?? ''}
            />
            <HelperText>
              <FormattedMessage id="my_account.set_notifications_for.help" />
            </HelperText>
          </form>
        }
        headerTitle={<FormattedMessage id="my_account.set_notifications_for.title" />}
        onClose={closeModal}
        primaryButton={
          <Button
            form="project-notifications-modal-form"
            isDisabled={selectedProject === undefined}
            type="submit"
            variety={ButtonVariety.Primary}
          >
            {<FormattedMessage id="add_verb" />}
          </Button>
        }
        secondaryButtonLabel={<FormattedMessage id="cancel" />}
      />
    );
  }
}

function suggestionsToOptions(suggestions: NotificationProject[]): SelectOption[] {
  return suggestions.map((s) => ({
    label: s.projectName,
    value: s.project,
    items: [],
  }));
}
