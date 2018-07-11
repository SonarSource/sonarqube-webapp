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
import MarkdownTips from '../../common/MarkdownTips';
import { Button, ResetButtonLink } from '../../ui/buttons';
import { translate } from '../../../helpers/l10n';
import { DropdownOverlay } from '../../controls/Dropdown';
/*:: import type { IssueComment } from '../types'; */

/*::
type Props = {
  comment?: IssueComment,
  onComment: string => void,
  toggleComment: boolean => void,
  placeholder: string,
  popupPosition?: {}
};
*/

/*::
type State = {
  textComment: string
};
*/

export default class CommentPopup extends React.PureComponent {
  /*:: props: Props; */
  /*:: state: State; */

  constructor(props /*: Props */) {
    super(props);
    this.state = {
      textComment: props.comment ? props.comment.markdown : ''
    };
  }

  handleCommentChange = (evt /*: SyntheticInputEvent */) => {
    this.setState({ textComment: evt.target.value });
  };

  handleCommentClick = () => {
    if (this.state.textComment.trim().length > 0) {
      this.props.onComment(this.state.textComment);
    }
  };

  handleCancelClick = () => {
    this.props.toggleComment(false);
  };

  handleKeyboard = (evt /*: KeyboardEvent */) => {
    if (evt.keyCode === 13 && (evt.metaKey || evt.ctrlKey)) {
      // Ctrl + Enter
      this.handleCommentClick();
    } else if ([37, 38, 39, 40].includes(evt.keyCode)) {
      // Arrow keys
      evt.stopPropagation();
    }
  };

  render() {
    const { comment } = this.props;
    return (
      <DropdownOverlay>
        <div className="issue-comment-bubble-popup">
          <div className="issue-comment-form-text">
            <textarea
              autoFocus={true}
              onChange={this.handleCommentChange}
              onKeyDown={this.handleKeyboard}
              placeholder={this.props.placeholder}
              rows="2"
              value={this.state.textComment}
            />
          </div>
          <div className="issue-comment-form-footer">
            <div className="issue-comment-form-actions">
              <Button
                className="js-issue-comment-submit little-spacer-right"
                disabled={this.state.textComment.trim().length < 1}
                onClick={this.handleCommentClick}>
                {comment && translate('save')}
                {!comment && translate('issue.comment.submit')}
              </Button>
              <ResetButtonLink className="js-issue-comment-cancel" onClick={this.handleCancelClick}>
                {translate('cancel')}
              </ResetButtonLink>
            </div>
            <div className="issue-comment-form-tips">
              <MarkdownTips />
            </div>
          </div>
        </div>
      </DropdownOverlay>
    );
  }
}
