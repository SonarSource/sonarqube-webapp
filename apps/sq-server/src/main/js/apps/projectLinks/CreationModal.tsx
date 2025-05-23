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

import { Button, ButtonVariety } from '@sonarsource/echoes-react';
import * as React from 'react';
import { FormField, InputField, Modal } from '~design-system';
import MandatoryFieldsExplanation from '~sq-server-commons/components/ui/MandatoryFieldsExplanation';
import { translate } from '~sq-server-commons/helpers/l10n';

interface Props {
  onClose: () => void;
  onSubmit: (name: string, url: string) => Promise<void>;
}

interface State {
  name: string;
  url: string;
}

const FORM_ID = 'create-link-form';

export default class CreationModal extends React.PureComponent<Props, State> {
  state: State = { name: '', url: '' };

  handleSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    return this.props.onSubmit(this.state.name, this.state.url).then(this.props.onClose);
  };

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ name: event.currentTarget.value });
  };

  handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ url: event.currentTarget.value });
  };

  render() {
    const header = translate('project_links.create_new_project_link');

    const formBody = (
      <form className="sw-mb-2" id={FORM_ID} onSubmit={this.handleSubmit}>
        <MandatoryFieldsExplanation />

        <FormField
          className="sw-mt-4"
          htmlFor="create-link-name"
          label={translate('project_links.name')}
          required
        >
          <InputField
            autoFocus
            id="create-link-name"
            maxLength={128}
            name="name"
            onChange={this.handleNameChange}
            required
            size="auto"
            type="text"
            value={this.state.name}
          />
        </FormField>

        <FormField htmlFor="create-link-url" label={translate('project_links.url')} required>
          <InputField
            id="create-link-url"
            maxLength={128}
            name="url"
            onChange={this.handleUrlChange}
            required
            size="auto"
            type="text"
            value={this.state.url}
          />
        </FormField>
      </form>
    );

    return (
      <Modal
        body={formBody}
        headerTitle={header}
        onClose={this.props.onClose}
        primaryButton={
          <Button form={FORM_ID} type="submit" variety={ButtonVariety.Primary}>
            {translate('create')}
          </Button>
        }
      />
    );
  }
}
