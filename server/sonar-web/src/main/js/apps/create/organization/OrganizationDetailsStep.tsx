/*
 * SonarQube
 * Copyright (C) 2009-2018 SonarSource SA
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
import OrganizationAvatarInput from './components/OrganizationAvatarInput';
import OrganizationDescriptionInput from './components/OrganizationDescriptionInput';
import OrganizationKeyInput from './components/OrganizationKeyInput';
import OrganizationNameInput from './components/OrganizationNameInput';
import OrganizationUrlInput from './components/OrganizationUrlInput';
import Step from '../../tutorials/components/Step';
import { translate } from '../../../helpers/l10n';
import { ResetButtonLink, SubmitButton } from '../../../components/ui/buttons';
import AlertSuccessIcon from '../../../components/icons-components/AlertSuccessIcon';
import DropdownIcon from '../../../components/icons-components/DropdownIcon';
import { OrganizationBase } from '../../../app/types';

type RequiredOrganization = Required<OrganizationBase>;

interface Props {
  description?: React.ReactNode;
  finished: boolean;
  keyReadOnly?: boolean;
  onContinue: (organization: RequiredOrganization) => Promise<void>;
  onOpen: () => void;
  open: boolean;
  organization?: OrganizationBase & { key: string };
  submitText: string;
}

interface State {
  additional: boolean;
  avatar?: string;
  description?: string;
  key?: string;
  name?: string;
  submitting: boolean;
  url?: string;
}

type ValidState = Pick<State, Exclude<keyof State, RequiredOrganization>> & RequiredOrganization;

export default class OrganizationDetailsStep extends React.PureComponent<Props, State> {
  mounted = false;

  constructor(props: Props) {
    super(props);
    const { organization } = props;
    this.state = {
      additional: false,
      avatar: (organization && organization.avatar) || '',
      description: (organization && organization.description) || '',
      key: (organization && organization.key) || undefined,
      name: (organization && organization.name) || '',
      submitting: false,
      url: (organization && organization.url) || ''
    };
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  canSubmit(state: State): state is ValidState {
    return Boolean(
      state.key !== undefined &&
        state.name !== undefined &&
        state.description !== undefined &&
        state.avatar !== undefined &&
        state.url !== undefined
    );
  }

  handleAdditionalClick = () => {
    this.setState(state => ({ additional: !state.additional }));
  };

  handleKeyUpdate = (key: string | undefined) => {
    this.setState({ key });
  };

  handleNameUpdate = (name: string | undefined) => {
    this.setState({ name });
  };

  handleDescriptionUpdate = (description: string | undefined) => {
    this.setState({ description });
  };

  handleAvatarUpdate = (avatar: string | undefined) => {
    this.setState({ avatar });
  };

  handleUrlUpdate = (url: string | undefined) => {
    this.setState({ url });
  };

  handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { state } = this;
    if (this.canSubmit(state)) {
      this.setState({ submitting: true });
      this.props
        .onContinue({
          avatar: state.avatar,
          description: state.description,
          key: state.key,
          name: state.name,
          url: state.url
        })
        .then(this.stopSubmitting, this.stopSubmitting);
    }
  };

  stopSubmitting = () => {
    if (this.mounted) {
      this.setState({ submitting: false });
    }
  };

  renderForm = () => {
    return (
      <div className="boxed-group-inner">
        <form id="organization-form" onSubmit={this.handleSubmit}>
          {this.props.description}
          <OrganizationKeyInput
            initialValue={this.state.key}
            onChange={this.handleKeyUpdate}
            readOnly={this.props.keyReadOnly}
          />
          <div className="big-spacer-top">
            <ResetButtonLink onClick={this.handleAdditionalClick}>
              {translate(
                this.state.additional
                  ? 'onboarding.create_organization.hide_additional_info'
                  : 'onboarding.create_organization.add_additional_info'
              )}
              <DropdownIcon className="little-spacer-left" turned={this.state.additional} />
            </ResetButtonLink>
          </div>
          <div className="js-additional-info" hidden={!this.state.additional}>
            <div className="big-spacer-top">
              <OrganizationNameInput
                initialValue={this.state.name}
                onChange={this.handleNameUpdate}
              />
            </div>
            <div className="big-spacer-top">
              <OrganizationAvatarInput
                initialValue={this.state.avatar}
                name={this.state.name}
                onChange={this.handleDescriptionUpdate}
              />
            </div>
            <div className="big-spacer-top">
              <OrganizationDescriptionInput
                initialValue={this.state.description}
                onChange={this.handleAvatarUpdate}
              />
            </div>
            <div className="big-spacer-top">
              <OrganizationUrlInput initialValue={this.state.url} onChange={this.handleUrlUpdate} />
            </div>
          </div>
          <div className="big-spacer-top">
            <SubmitButton disabled={this.state.submitting || !this.canSubmit(this.state)}>
              {this.props.submitText}
            </SubmitButton>
          </div>
        </form>
      </div>
    );
  };

  renderResult = () => {
    const { organization } = this.props;
    return organization ? (
      <div className="boxed-group-actions display-flex-center">
        <AlertSuccessIcon className="spacer-right" />
        <strong className="text-limited">{organization.key}</strong>
      </div>
    ) : null;
  };

  render() {
    return (
      <Step
        finished={this.props.finished}
        onOpen={this.props.onOpen}
        open={this.props.open}
        renderForm={this.renderForm}
        renderResult={this.renderResult}
        stepNumber={1}
        stepTitle={translate('onboarding.create_organization.enter_org_details')}
      />
    );
  }
}
