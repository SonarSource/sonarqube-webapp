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
import SelectList from '../../../components/common/SelectList';
import SelectListItem from '../../../components/common/SelectListItem';
import { DropdownOverlay } from '../../../components/controls/Dropdown';
import SeverityHelper from '../../../components/shared/SeverityHelper';
import StatusHelper from '../../../components/shared/StatusHelper';
import QualifierIcon from '../../../components/icons-components/QualifierIcon';
import TagsIcon from '../../../components/icons-components/TagsIcon';
import IssueTypeIcon from '../../../components/ui/IssueTypeIcon';
import Avatar from '../../../components/ui/Avatar';
import { translate } from '../../../helpers/l10n';
import { fileFromPath, limitComponentName } from '../../../helpers/path';
/*:: import type { Issue } from '../types'; */

/*::
type Props = {|
  issue: Issue,
  onFilter: (property: string, issue: Issue) => void,
|};
*/

export default class SimilarIssuesPopup extends React.PureComponent {
  /*:: props: Props; */

  handleSelect = (property /*: string */) => {
    this.props.onFilter(property, this.props.issue);
  };

  render() {
    const { issue } = this.props;

    const items = [
      'type',
      'severity',
      'status',
      'resolution',
      'assignee',
      'rule',
      ...(issue.tags || []).map(tag => `tag###${tag}`),
      'project',
      // $FlowFixMe items are filtered later
      issue.subProject ? 'module' : undefined,
      'file'
    ].filter(item => item);

    return (
      <DropdownOverlay noPadding={true}>
        <header className="menu-search">
          <h6>{translate('issue.filter_similar_issues')}</h6>
        </header>

        <SelectList
          className="issues-similar-issues-menu"
          currentItem={items[0]}
          items={items}
          onSelect={this.handleSelect}>
          <SelectListItem item="type">
            <IssueTypeIcon className="little-spacer-right" query={issue.type} />
            {translate('issue.type', issue.type)}
          </SelectListItem>

          <SelectListItem item="severity">
            <SeverityHelper severity={issue.severity} />
          </SelectListItem>

          <SelectListItem item="status">
            <StatusHelper status={issue.status} />
          </SelectListItem>

          <SelectListItem item="resolution">
            {issue.resolution != null
              ? translate('issue.resolution', issue.resolution)
              : translate('unresolved')}
          </SelectListItem>

          <SelectListItem item="assignee">
            {issue.assignee != null ? (
              <span>
                {translate('assigned_to')}
                <Avatar
                  className="little-spacer-left little-spacer-right"
                  hash={issue.assigneeAvatar}
                  name={issue.assigneeName}
                  size={16}
                />
                {issue.assigneeName}
              </span>
            ) : (
              translate('unassigned')
            )}
          </SelectListItem>

          <li className="divider" />

          <SelectListItem item="rule">{limitComponentName(issue.ruleName)}</SelectListItem>

          {issue.tags != null &&
            issue.tags.map(tag => (
              <SelectListItem item={`tag###${tag}`} key={`tag###${tag}`}>
                <TagsIcon className="icon-half-transparent little-spacer-right text-middle" />
                <span className="text-middle">{tag}</span>
              </SelectListItem>
            ))}

          <li className="divider" />

          <SelectListItem item="project">
            <QualifierIcon className="little-spacer-right" qualifier="TRK" />
            {issue.projectName}
          </SelectListItem>

          {issue.subProject != null && (
            <SelectListItem item="module">
              <QualifierIcon className="little-spacer-right" qualifier="BRC" />
              {issue.subProjectName}
            </SelectListItem>
          )}

          <SelectListItem item="file">
            <QualifierIcon className="little-spacer-right" qualifier={issue.componentQualifier} />
            {fileFromPath(issue.componentLongName)}
          </SelectListItem>
        </SelectList>
      </DropdownOverlay>
    );
  }
}
