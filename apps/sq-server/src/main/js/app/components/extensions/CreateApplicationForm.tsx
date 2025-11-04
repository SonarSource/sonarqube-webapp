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

import {
  Button,
  Form,
  ModalForm,
  RadioButtonGroup,
  TextArea,
  TextInput,
} from '@sonarsource/echoes-react';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { RequiredIcon } from '~design-system';
import { ComponentQualifier, Visibility } from '~shared/types/component';
import { createApplication } from '~sq-server-commons/api/application';
import { translate } from '~sq-server-commons/helpers/l10n';

interface Props {
  onCreate: (application: { key: string; qualifier: ComponentQualifier }) => Promise<void>;
}

interface State {
  description: string;
  key: string;
  name: string;
  submitting: boolean;
  visibility: Visibility;
}

export default class CreateApplicationForm extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      description: '',
      key: '',
      name: '',
      visibility: Visibility.Public,
      submitting: false,
    };
  }

  handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({ description: event.currentTarget.value });
  };

  handleKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ key: event.currentTarget.value });
  };

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ name: event.currentTarget.value });
  };

  handleVisibilityChange = (visibility: Visibility) => {
    this.setState({ visibility });
  };

  handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const { name, description, key, visibility } = this.state;
    this.setState({ submitting: true });
    return createApplication(name, description, key.length > 0 ? key : undefined, visibility)
      .then(({ application }) => {
        this.setState({ submitting: false });
        this.props.onCreate({
          key: application.key,
          qualifier: ComponentQualifier.Application,
        });
      })
      .catch(() => {
        this.setState({ submitting: false });
      });
  };

  render() {
    const { name, description, key, submitting, visibility } = this.state;
    const header = translate('qualifiers.create.APP');
    const submitDisabled = !this.state.name.length;

    return (
      <ModalForm
        content={
          <Form.Section>
            <TextInput
              autoFocus
              id="view-edit-name"
              isRequired
              label={translate('name')}
              maxLength={100}
              name="name"
              onChange={this.handleNameChange}
              type="text"
              value={name}
            />

            <TextArea
              id="view-edit-description"
              label={translate('description')}
              name="description"
              onChange={this.handleDescriptionChange}
              value={description}
            />

            <TextInput
              autoComplete="off"
              helpText={translate('onboarding.create_application.key.description')}
              id="view-edit-key"
              label={translate('key')}
              maxLength={256}
              name="key"
              onChange={this.handleKeyChange}
              type="text"
              value={key}
            />

            <RadioButtonGroup
              alignment="horizontal"
              label={translate('visibility')}
              onChange={this.handleVisibilityChange}
              options={[Visibility.Public, Visibility.Private].map((value) => ({
                label: translate('visibility', value),
                value,
              }))}
              value={visibility}
            />
          </Form.Section>
        }
        description={
          <FormattedMessage
            id="fields_marked_with_x_required"
            values={{ star: <RequiredIcon className="sw-m-0" /> }}
          />
        }
        id="create-application-form"
        isSubmitDisabled={submitDisabled}
        isSubmitting={submitting}
        onSubmit={this.handleFormSubmit}
        secondaryButtonLabel={translate('cancel')}
        submitButtonLabel={translate('create')}
        title={header}
      >
        <Button>{translate('projects.create_application')}</Button>
      </ModalForm>
    );
  }
}
