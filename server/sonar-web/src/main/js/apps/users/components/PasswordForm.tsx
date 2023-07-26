/*
 * SonarQube
 * Copyright (C) 2009-2023 SonarSource SA
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
import { RestUser, changePassword } from '../../../api/users';
import Modal from '../../../components/controls/Modal';
import { ResetButtonLink, SubmitButton } from '../../../components/controls/buttons';
import { Alert } from '../../../components/ui/Alert';
import MandatoryFieldMarker from '../../../components/ui/MandatoryFieldMarker';
import MandatoryFieldsExplanation from '../../../components/ui/MandatoryFieldsExplanation';
import { addGlobalSuccessMessage } from '../../../helpers/globalMessages';
import { translate } from '../../../helpers/l10n';
import { ChangePasswordResults } from '../../../types/users';

interface Props {
  isCurrentUser: boolean;
  onClose: () => void;
  user: RestUser<'admin'>;
}

interface State {
  confirmPassword: string;
  errorTranslationKey?: string;
  newPassword: string;
  oldPassword: string;
  submitting: boolean;
}

export default class PasswordForm extends React.PureComponent<Props, State> {
  mounted = false;
  state: State = {
    confirmPassword: '',
    newPassword: '',
    oldPassword: '',
    submitting: false,
  };

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  handleError = (result: ChangePasswordResults) => {
    if (this.mounted) {
      if (result === ChangePasswordResults.OldPasswordIncorrect) {
        this.setState({ errorTranslationKey: 'user.old_password_incorrect', submitting: false });
      } else if (result === ChangePasswordResults.NewPasswordSameAsOld) {
        this.setState({ errorTranslationKey: 'user.new_password_same_as_old', submitting: false });
      }
    }
  };

  handleConfirmPasswordChange = (event: React.SyntheticEvent<HTMLInputElement>) =>
    this.setState({ confirmPassword: event.currentTarget.value });

  handleNewPasswordChange = (event: React.SyntheticEvent<HTMLInputElement>) =>
    this.setState({ newPassword: event.currentTarget.value });

  handleOldPasswordChange = (event: React.SyntheticEvent<HTMLInputElement>) =>
    this.setState({ oldPassword: event.currentTarget.value });

  handleChangePassword = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      this.state.newPassword.length > 0 &&
      this.state.newPassword === this.state.confirmPassword
    ) {
      this.setState({ submitting: true });
      changePassword({
        login: this.props.user.login,
        password: this.state.newPassword,
        previousPassword: this.state.oldPassword,
      }).then(() => {
        addGlobalSuccessMessage(translate('my_profile.password.changed'));
        this.props.onClose();
      }, this.handleError);
    }
  };

  render() {
    const { errorTranslationKey, submitting, newPassword, confirmPassword } = this.state;

    const header = translate('my_profile.password.title');
    return (
      <Modal contentLabel={header} onRequestClose={this.props.onClose} size="small">
        <form autoComplete="off" id="user-password-form" onSubmit={this.handleChangePassword}>
          <header className="modal-head">
            <h2>{header}</h2>
          </header>
          <div className="modal-body">
            {errorTranslationKey && <Alert variant="error">{translate(errorTranslationKey)}</Alert>}

            <MandatoryFieldsExplanation className="modal-field" />

            {this.props.isCurrentUser && (
              <div className="modal-field">
                <label htmlFor="old-user-password">
                  {translate('my_profile.password.old')}
                  <MandatoryFieldMarker />
                </label>
                {/* keep this fake field to hack browser autofill */}
                <input className="hidden" aria-hidden name="old-password-fake" type="password" />
                <input
                  id="old-user-password"
                  name="old-password"
                  onChange={this.handleOldPasswordChange}
                  required
                  type="password"
                  value={this.state.oldPassword}
                />
              </div>
            )}
            <div className="modal-field">
              <label htmlFor="user-password">
                {translate('my_profile.password.new')}
                <MandatoryFieldMarker />
              </label>
              {/* keep this fake field to hack browser autofill */}
              <input className="hidden" aria-hidden name="password-fake" type="password" />
              <input
                id="user-password"
                name="password"
                onChange={this.handleNewPasswordChange}
                required
                type="password"
                value={this.state.newPassword}
              />
            </div>
            <div className="modal-field">
              <label htmlFor="confirm-user-password">
                {translate('my_profile.password.confirm')}
                <MandatoryFieldMarker />
              </label>
              {/* keep this fake field to hack browser autofill */}
              <input className="hidden" aria-hidden name="confirm-password-fake" type="password" />
              <input
                id="confirm-user-password"
                name="confirm-password"
                onChange={this.handleConfirmPasswordChange}
                required
                type="password"
                value={this.state.confirmPassword}
              />
            </div>
          </div>
          <footer className="modal-foot">
            {submitting && <i className="spinner spacer-right" />}
            <SubmitButton disabled={submitting || !newPassword || newPassword !== confirmPassword}>
              {translate('change_verb')}
            </SubmitButton>
            <ResetButtonLink onClick={this.props.onClose}>{translate('cancel')}</ResetButtonLink>
          </footer>
        </form>
      </Modal>
    );
  }
}
