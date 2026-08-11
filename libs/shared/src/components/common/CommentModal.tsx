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

import { Button, ButtonVariety, Modal, TextArea, TextAreaProps } from '@sonarsource/echoes-react';
import { ChangeEvent, KeyboardEvent, useCallback, useState } from 'react';
import { useIntl } from 'react-intl';
import { Key } from '../../helpers/keyboard';
import FormattingTips from './FormattingTips';

export interface CommentModalProps {
  cancelButtonText?: string;
  comment?: string;
  commentHeader: string;
  fieldLabel?: string;
  loading?: boolean;
  onCancel: VoidFunction;
  onSubmit: (comment: string) => void;
  submitButtonText?: string;
  helpText?: NonNullable<TextAreaProps['helpText']>;
}

export function CommentModal(props: Readonly<CommentModalProps>) {
  const {
    onCancel,
    onSubmit,
    comment: initialComment,
    commentHeader,
    fieldLabel,
    loading,
    submitButtonText,
    cancelButtonText,
    helpText,
  } = props;
  const { formatMessage } = useIntl();
  const [comment, setComment] = useState(initialComment ?? '');
  const submitButtonDisabled = !comment || loading;

  const handleChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
    setComment(event.target.value);
  }, []);

  const handleSubmit = useCallback(() => {
    if (comment) {
      onSubmit(comment.trim());
    }
  }, [comment, onSubmit]);

  const handleCancel = useCallback(() => {
    setComment('');
    onCancel();
  }, [onCancel]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (!submitButtonDisabled && event.key === Key.Enter && (event.metaKey || event.ctrlKey)) {
        handleSubmit();
      }
    },
    [handleSubmit, submitButtonDisabled],
  );

  return (
    <Modal
      content={
        <TextArea
          ariaLabel={fieldLabel ?? commentHeader}
          autoFocus
          helpText={helpText ?? <FormattingTips />}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows={3}
          value={comment}
          width="full"
        />
      }
      isOpen
      onOpenChange={(open) => {
        if (!open) {
          handleCancel();
        }
      }}
      primaryButton={
        <Button
          isDisabled={submitButtonDisabled}
          onClick={handleSubmit}
          variety={ButtonVariety.Primary}
        >
          {submitButtonText ?? formatMessage({ id: 'save' })}
        </Button>
      }
      secondaryButton={
        <Button isDisabled={loading} onClick={handleCancel}>
          {cancelButtonText ?? formatMessage({ id: 'cancel' })}
        </Button>
      }
      title={commentHeader}
    />
  );
}
