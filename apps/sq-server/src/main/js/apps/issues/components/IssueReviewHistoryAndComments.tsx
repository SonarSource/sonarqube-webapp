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

import { Button, Heading } from '@sonarsource/echoes-react';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import {
  addIssueComment,
  deleteIssueComment,
  editIssueComment,
} from '~sq-server-commons/api/issues';
import HotspotCommentModal from '~sq-server-commons/components/findings/HotspotCommentModal';
import { updateIssue } from '~sq-server-commons/components/issue/actions';
import { IssueActions } from '~sq-server-commons/types/issues';
import { Issue } from '~sq-server-commons/types/types';
import IssueReviewHistory from './IssueReviewHistory';

interface Props {
  issue: Issue;
  onChange: (issue: Issue) => void;
}

interface State {
  showAddCommentModal: boolean;
}

export default class IssueReviewHistoryAndComments extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showAddCommentModal: false,
    };
  }

  handleSubmitComment = (comment: string) => {
    return updateIssue(
      this.props.onChange,
      // eslint-disable-next-line local-rules/no-api-imports
      addIssueComment({ issue: this.props.issue.key, text: comment }),
    );
  };

  handleDeleteComment = (key: string) => {
    // eslint-disable-next-line local-rules/no-api-imports
    return updateIssue(this.props.onChange, deleteIssueComment({ comment: key }));
  };

  handleEditComment = (key: string, text: string) => {
    // eslint-disable-next-line local-rules/no-api-imports
    return updateIssue(this.props.onChange, editIssueComment({ comment: key, text }));
  };

  handleShowCommentModal = () => {
    this.setState({ showAddCommentModal: true });
  };

  handleHideCommentModal = () => {
    this.setState({ showAddCommentModal: false });
  };

  render() {
    const { issue } = this.props;
    const { showAddCommentModal } = this.state;

    return (
      <div>
        <Heading as="h2" size="medium">
          <FormattedMessage id="hotspot.section.activity" />
        </Heading>
        {issue.actions.includes(IssueActions.Comment) && (
          <Button className="sw-mt-4 sw-mb-2" onClick={this.handleShowCommentModal}>
            <FormattedMessage id="issue.activity.add_comment" />
          </Button>
        )}
        <IssueReviewHistory
          issue={issue}
          onDeleteComment={this.handleDeleteComment}
          onEditComment={this.handleEditComment}
        />
        {/* <IssueChangeLogContent issue={issue} /> */}
        {showAddCommentModal && (
          <HotspotCommentModal
            onCancel={this.handleHideCommentModal}
            onSubmit={(comment) => {
              this.handleSubmitComment(comment);
              this.setState({ showAddCommentModal: false });
            }}
          />
        )}
      </div>
    );
  }
}
