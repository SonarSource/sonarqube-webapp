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

import * as React from 'react';
import { Tags } from '~shared/components/tags/Tags';
import { setIssueTags } from '../../../api/issues';
import withComponentContext from '../../../context/componentContext/withComponentContext';
import { ComponentContextShape } from '../../../types/component';
import { Issue } from '../../../types/types';
import { updateIssue } from '../actions';
import IssueTagsPopup from '../popups/IssueTagsPopup';

interface Props extends ComponentContextShape {
  canSetTags?: boolean;
  issue: Pick<Issue, 'key' | 'tags'>;
  onChange: (issue: Issue) => void;
  open?: boolean;
  tagsToDisplay?: number;
  togglePopup?: (popup: string, show?: boolean) => void;
}

export class IssueTags extends React.PureComponent<Props> {
  setTags = (tags: string[]) => {
    const { issue } = this.props;
    const newIssue = { ...issue, tags };

    updateIssue(
      this.props.onChange,
      setIssueTags({ issue: issue.key, tags: tags.join(',') }),
      issue as Issue,
      newIssue as Issue,
    );
  };

  render() {
    const { component, issue, tagsToDisplay = 2 } = this.props;
    const { tags = [] } = issue;

    return (
      <Tags
        allowUpdate={this.props.canSetTags && !component?.needIssueSync}
        className="js-issue-edit-tags sw-typo-sm"
        isOpen={this.props.open}
        menuId="issue-tags-menu"
        overlay={<IssueTagsPopup selectedTags={tags} setTags={this.setTags} />}
        setIsOpen={(isOpen: boolean) => this.props.togglePopup?.('edit-tags', isOpen)}
        tags={tags}
        tagsToDisplay={tagsToDisplay}
      />
    );
  }
}

export default withComponentContext(IssueTags);
