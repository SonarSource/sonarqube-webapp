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
import * as classNames from 'classnames';
import * as PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import ComponentNavBranchesMenu from './ComponentNavBranchesMenu';
import SingleBranchHelperPopup from './SingleBranchHelperPopup';
import NoBranchSupportPopup from './NoBranchSupportPopup';
import { BranchLike, Component } from '../../../types';
import * as theme from '../../../theme';
import BranchIcon from '../../../../components/icons-components/BranchIcon';
import {
  isShortLivingBranch,
  isSameBranchLike,
  getBranchLikeDisplayName,
  isPullRequest
} from '../../../../helpers/branches';
import { translate } from '../../../../helpers/l10n';
import PlusCircleIcon from '../../../../components/icons-components/PlusCircleIcon';
import Popup from '../../../../components/controls/Popup';
import Tooltip from '../../../../components/controls/Tooltip';

interface Props {
  branchLikes: BranchLike[];
  component: Component;
  currentBranchLike: BranchLike;
  location?: any;
}

interface State {
  dropdownOpen: boolean;
}

export default class ComponentNavBranch extends React.PureComponent<Props, State> {
  mounted = false;

  static contextTypes = {
    branchesEnabled: PropTypes.bool.isRequired,
    onSonarCloud: PropTypes.bool
  };

  state: State = {
    dropdownOpen: false
  };

  componentDidMount() {
    this.mounted = true;
  }

  componentWillReceiveProps(nextProps: Props) {
    if (
      nextProps.component !== this.props.component ||
      !isSameBranchLike(nextProps.currentBranchLike, this.props.currentBranchLike) ||
      nextProps.location !== this.props.location
    ) {
      this.setState({ dropdownOpen: false });
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  handleClick = (event: React.SyntheticEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.blur();
    this.setState(state => ({ dropdownOpen: !state.dropdownOpen }));
  };

  closeDropdown = () => {
    if (this.mounted) {
      this.setState({ dropdownOpen: false });
    }
  };

  renderDropdown = () => {
    const { configuration } = this.props.component;
    return this.state.dropdownOpen ? (
      <ComponentNavBranchesMenu
        branchLikes={this.props.branchLikes}
        canAdmin={configuration && configuration.showSettings}
        component={this.props.component}
        currentBranchLike={this.props.currentBranchLike}
        onClose={this.closeDropdown}
      />
    ) : null;
  };

  renderMergeBranch = () => {
    const { currentBranchLike } = this.props;
    if (isShortLivingBranch(currentBranchLike)) {
      return currentBranchLike.isOrphan ? (
        <span className="note big-spacer-left text-ellipsis flex-shrink">
          {translate('branches.orphan_branch')}
          <Tooltip overlay={translate('branches.orphan_branches.tooltip')}>
            <i className="icon-help spacer-left" />
          </Tooltip>
        </span>
      ) : (
        <span className="note big-spacer-left">
          {translate('from')} <strong>{currentBranchLike.mergeBranch}</strong>
        </span>
      );
    } else if (isPullRequest(currentBranchLike)) {
      return (
        <span className="note big-spacer-left text-ellipsis flex-shrink">
          <FormattedMessage
            defaultMessage={translate('branches.pull_request.for_merge_into_x_from_y')}
            id="branches.pull_request.for_merge_into_x_from_y"
            values={{
              base: <strong>{currentBranchLike.base}</strong>,
              branch: <strong>{currentBranchLike.branch}</strong>
            }}
          />
        </span>
      );
    } else {
      return null;
    }
  };

  renderSingleBranchPopup = () => (
    <Popup overlay={<SingleBranchHelperPopup />}>
      {({ onClick }) => (
        <a className="display-flex-center spacer-left link-no-underline" href="#" onClick={onClick}>
          <PlusCircleIcon fill={theme.blue} size={12} />
        </a>
      )}
    </Popup>
  );

  renderNoBranchSupportPopup = () => (
    <Popup overlay={<NoBranchSupportPopup />}>
      {({ onClick }) => (
        <a className="display-flex-center spacer-left link-no-underline" href="#" onClick={onClick}>
          <PlusCircleIcon fill={theme.gray80} size={12} />
        </a>
      )}
    </Popup>
  );

  render() {
    const { branchLikes, currentBranchLike } = this.props;

    if (this.context.onSonarCloud && !this.context.branchesEnabled) {
      return null;
    }

    const displayName = getBranchLikeDisplayName(currentBranchLike);

    if (!this.context.branchesEnabled) {
      return (
        <div className="navbar-context-branches">
          <BranchIcon
            branchLike={currentBranchLike}
            className="little-spacer-right"
            fill={theme.gray80}
          />
          <span className="note">{displayName}</span>
          {this.renderNoBranchSupportPopup()}
        </div>
      );
    }

    if (branchLikes.length < 2) {
      return (
        <div className="navbar-context-branches">
          <BranchIcon branchLike={currentBranchLike} className="little-spacer-right" />
          <span className="note">{displayName}</span>
          {this.renderSingleBranchPopup()}
        </div>
      );
    }

    return (
      <div
        className={classNames('navbar-context-branches', 'dropdown', {
          open: this.state.dropdownOpen
        })}>
        <a className="link-base-color link-no-underline nowrap" href="#" onClick={this.handleClick}>
          <BranchIcon branchLike={currentBranchLike} className="little-spacer-right" />
          <Tooltip mouseEnterDelay={1} overlay={displayName}>
            <span className="text-limited text-top">{displayName}</span>
          </Tooltip>
          <i className="icon-dropdown little-spacer-left" />
        </a>
        {this.renderDropdown()}
        {this.renderMergeBranch()}
      </div>
    );
  }
}
