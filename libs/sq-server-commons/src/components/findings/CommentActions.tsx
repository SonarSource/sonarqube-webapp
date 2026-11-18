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
  ButtonIcon,
  ButtonSize,
  ButtonVariety,
  IconDelete,
  IconEdit,
} from '@sonarsource/echoes-react';
import React from 'react';
import { useIntl } from 'react-intl';
import { CommentModal } from '~shared/components/common/CommentModal';
import { defaultFormatterOptions } from '~shared/components/intl/DateTimeFormatter';
import { Modal } from '../../design-system';
import FormattingTipsWithLink from '../common/FormattingTipsWithLink';

interface Props {
  author?: string;
  commentKey: string;
  date: string;
  markdown: string;
  onDeleteComment: (key: string) => void;
  onEditComment: (key: string, text: string) => void;
}

export default function CommentActions(props: Props) {
  const { author, commentKey, date, markdown, onDeleteComment, onEditComment } = props;

  const { formatDate, formatMessage } = useIntl();

  const labelValues = { author, date: formatDate(date, defaultFormatterOptions) };

  const [editCommentKey, setEditCommentKey] = React.useState('');
  const [deleteCommentKey, setDeleteCommentKey] = React.useState('');

  return (
    <>
      <div className="sw:flex sw:gap-6">
        <ButtonIcon
          Icon={IconEdit}
          ariaLabel={formatMessage(
            { id: author ? 'issue.comment.edit_by_author_on_date' : 'issue.comment.edit' },
            labelValues,
          )}
          onClick={() => {
            setEditCommentKey(commentKey);
          }}
          size={ButtonSize.Medium}
          tooltipContent={formatMessage({ id: 'issue.comment.edit' })}
          variety={ButtonVariety.DefaultGhost}
        />

        <ButtonIcon
          Icon={IconDelete}
          ariaLabel={formatMessage(
            { id: author ? 'issue.comment.delete_by_author_on_date' : 'issue.comment.delete' },
            labelValues,
          )}
          onClick={() => {
            setDeleteCommentKey(commentKey);
          }}
          size={ButtonSize.Medium}
          tooltipContent={formatMessage({ id: 'issue.comment.delete' })}
          variety={ButtonVariety.DangerGhost}
        />
      </div>

      {editCommentKey === commentKey && (
        <CommentModal
          comment={markdown}
          commentHeader={formatMessage({ id: 'issue.comment.edit' })}
          fieldLabel={formatMessage({ id: 'issue.comment.enter_comment' })}
          helpText={<FormattingTipsWithLink />}
          onCancel={() => {
            setEditCommentKey('');
          }}
          onSubmit={(text) => {
            setEditCommentKey('');
            onEditComment(commentKey, text);
          }}
        />
      )}

      {deleteCommentKey === commentKey && (
        <Modal
          body={<p>{formatMessage({ id: 'issue.comment.delete_confirm_message' })}</p>}
          headerTitle={formatMessage({ id: 'issue.comment.delete' })}
          onClose={() => {
            setDeleteCommentKey('');
          }}
          primaryButton={
            <Button
              onClick={() => {
                setDeleteCommentKey('');
                onDeleteComment(commentKey);
              }}
              variety={ButtonVariety.Danger}
            >
              {formatMessage({ id: 'delete' })}
            </Button>
          }
          secondaryButtonLabel={formatMessage({ id: 'cancel' })}
        />
      )}
    </>
  );
}
