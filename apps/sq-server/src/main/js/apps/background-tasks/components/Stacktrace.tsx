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

import { Spinner } from '@sonarsource/echoes-react';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Modal } from '~design-system';
import { getTask } from '~sq-server-commons/api/ce';
import { translate } from '~sq-server-commons/helpers/l10n';
import { Task } from '~sq-server-commons/types/tasks';

interface Props {
  onClose: () => void;
  task: Pick<Task, 'componentName' | 'errorMessage' | 'id' | 'type'>;
}

interface State {
  loading: boolean;
  stacktrace?: string;
}

export default class Stacktrace extends React.PureComponent<Props, State> {
  mounted = false;
  state: State = { loading: true };

  componentDidMount() {
    this.mounted = true;
    this.loadStacktrace();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  loadStacktrace() {
    getTask(this.props.task.id, ['stacktrace']).then(
      (task) => {
        if (this.mounted) {
          this.setState({ loading: false, stacktrace: task.errorStacktrace });
        }
      },
      () => {
        if (this.mounted) {
          this.setState({ loading: false });
        }
      },
    );
  }

  render() {
    const { task } = this.props;
    const { loading, stacktrace } = this.state;

    return (
      <Modal
        body={
          <Spinner isLoading={loading}>
            {stacktrace ? (
              <div>
                <h4 className="sw-mb-2">{translate('background_tasks.error_stacktrace')}</h4>
                <pre className="it__task-stacktrace sw-whitespace-pre-wrap">{stacktrace}</pre>
              </div>
            ) : (
              <div>
                <h4 className="sw-mb-2">{translate('background_tasks.error_message')}</h4>
                <pre className="sw-whitespace-pre-wrap">{task.errorMessage}</pre>
              </div>
            )}
          </Spinner>
        }
        headerTitle={
          <FormattedMessage
            id="background_tasks.error_stacktrace.title"
            values={{
              project: task.componentName,
              type: translate('background_task.type', task.type),
            }}
          />
        }
        isLarge
        isScrollable
        onClose={this.props.onClose}
        secondaryButtonLabel={translate('close')}
      />
    );
  }
}
