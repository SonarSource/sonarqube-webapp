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
  ButtonVariety,
  DropdownMenu,
  DropdownMenuAlign,
  IconChevronDown,
} from '@sonarsource/echoes-react';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import Tooltip from '~sq-server-commons/components/controls/Tooltip';
import { translate } from '~sq-server-commons/helpers/l10n';
import { CodingRulesQuery } from '~sq-server-commons/types/coding-rules';
import { BaseProfile } from '~sq-server-commons/types/quality-profiles';
import BulkChangeModal from './BulkChangeModal';

interface Props {
  onSubmit?: () => void;
  query: CodingRulesQuery;
  referencedProfiles: Record<string, BaseProfile>;
  total: number;
}

interface State {
  action?: string;
  modal: boolean;
  profile?: BaseProfile;
}

export default class BulkChange extends React.PureComponent<Props, State> {
  state: State = { modal: false };

  triggerRef = React.createRef<HTMLButtonElement>();

  getSelectedProfile = () => {
    const { profile } = this.props.query;
    return (profile && this.props.referencedProfiles[profile]) || undefined;
  };

  closeModal = () => {
    // The menu item that opened the modal is unmounted once the menu closes, so the modal cannot
    // return focus to it: hand focus back to the "Bulk Change" button explicitly.
    this.setState({ action: undefined, modal: false, profile: undefined }, () => {
      this.triggerRef.current?.focus();
    });
  };

  handleActivateClick = () => {
    this.setState({ action: 'activate', modal: true, profile: undefined });
  };

  handleActivateInProfileClick = () => {
    this.setState({ action: 'activate', modal: true, profile: this.getSelectedProfile() });
  };

  handleDeactivateClick = () => {
    this.setState({ action: 'deactivate', modal: true, profile: undefined });
  };

  handleDeactivateInProfileClick = () => {
    this.setState({ action: 'deactivate', modal: true, profile: this.getSelectedProfile() });
  };

  render() {
    // show "Bulk Change" button only if user is admin of at least one QP
    const canBulkChange = Object.values(this.props.referencedProfiles).some((profile) =>
      Boolean(profile.actions?.edit),
    );
    if (!canBulkChange) {
      return (
        <Tooltip content={translate('coding_rules.can_not_bulk_change')}>
          <Button isDisabled variety={ButtonVariety.Primary}>
            <FormattedMessage id="bulk_change" />
          </Button>
        </Tooltip>
      );
    }

    const { activation } = this.props.query;
    const profile = this.getSelectedProfile();
    const canChangeProfile = Boolean(profile && !profile.isBuiltIn && profile.actions?.edit);
    const allowActivateOnProfile = canChangeProfile && activation === false;
    const allowDeactivateOnProfile = canChangeProfile && activation === true;

    return (
      <>
        <DropdownMenu
          align={DropdownMenuAlign.End}
          id="issue-bulkaction-menu"
          items={
            <>
              <DropdownMenu.ItemButton onClick={this.handleActivateClick}>
                <FormattedMessage id="coding_rules.activate_in" />
              </DropdownMenu.ItemButton>

              {allowActivateOnProfile && profile && (
                <DropdownMenu.ItemButton onClick={this.handleActivateInProfileClick}>
                  <FormattedMessage id="coding_rules.activate_in" />{' '}
                  <strong className="sw:ml-1">{profile.name}</strong>
                </DropdownMenu.ItemButton>
              )}

              <DropdownMenu.ItemButton onClick={this.handleDeactivateClick}>
                <FormattedMessage id="coding_rules.deactivate_in" />
              </DropdownMenu.ItemButton>

              {allowDeactivateOnProfile && profile && (
                <DropdownMenu.ItemButton onClick={this.handleDeactivateInProfileClick}>
                  <FormattedMessage id="coding_rules.deactivate_in" />{' '}
                  <strong className="sw:ml-1">{profile.name}</strong>
                </DropdownMenu.ItemButton>
              )}
            </>
          }
        >
          <Button ref={this.triggerRef} suffix={<IconChevronDown className="sw:ml-1" />}>
            <FormattedMessage id="bulk_change" />
          </Button>
        </DropdownMenu>
        {this.state.modal && this.state.action && (
          <BulkChangeModal
            action={this.state.action}
            onClose={this.closeModal}
            onSubmit={this.props.onSubmit}
            profile={this.state.profile}
            query={this.props.query}
            referencedProfiles={this.props.referencedProfiles}
            total={this.props.total}
          />
        )}
      </>
    );
  }
}
