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
// @flow
import React from 'react';
import SimilarIssuesPopup from '../popups/SimilarIssuesPopup';
import Toggler from '../../../components/controls/Toggler';
import DropdownIcon from '../../../components/icons-components/DropdownIcon';
import FilterIcon from '../../../components/icons-components/FilterIcon';
import { Button } from '../../../components/ui/buttons';
import { translate } from '../../../helpers/l10n';
/*:: import type { Issue } from '../types'; */

/*::
type Props = {|
  isOpen: boolean,
  issue: Issue,
  togglePopup: (string, boolean | void) => void,
  onFail: Error => void,
  onFilter: (property: string, issue: Issue) => void
|};
*/

export default class SimilarIssuesFilter extends React.PureComponent {
  /*:: props: Props; */

  handleClick = (evt /*: SyntheticInputEvent */) => {
    evt.preventDefault();
    this.togglePopup();
  };

  handleFilter = (property /*: string */, issue /*: Issue */) => {
    this.togglePopup(false);
    this.props.onFilter(property, issue);
  };

  togglePopup = (open /*: boolean | void */) => {
    this.props.togglePopup('similarIssues', open);
  };

  handleClose = () => {
    this.togglePopup(false);
  };

  render() {
    return (
      <div className="dropdown">
        <Toggler
          onRequestClose={this.handleClose}
          open={this.props.isOpen}
          overlay={<SimilarIssuesPopup issue={this.props.issue} onFilter={this.handleFilter} />}>
          <Button
            aria-label={translate('issue.filter_similar_issues')}
            className="js-issue-filter button-link issue-action issue-action-with-options"
            onClick={this.handleClick}>
            <FilterIcon className="icon-half-transparent" />
            <DropdownIcon className="icon-half-transparent" />
          </Button>
        </Toggler>
      </div>
    );
  }
}
