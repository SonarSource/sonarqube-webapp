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
  Checkbox,
  Label,
  Modal,
  ModalProps,
  TextArea,
  ToggleTip,
} from '@sonarsource/echoes-react';
import { ReactNode } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

interface Props<T extends string> {
  comment: string;
  /** Extra content rendered above the comment field — static info or an interactive control
   * (e.g. a snoozed-until note, or a date selector for a dated transition). */
  extraContent?: ReactNode;
  isFeedback: boolean;
  isOpen: boolean;
  /** Overrides the comment field's label. Defaults to the generic status_transition.comment.label. */
  label?: ReactNode;
  onClose: () => void;
  onCommentChange: (comment: string) => void;
  onConfirm: (comment: string, isFeedback: boolean) => void;
  onIsFeedbackChange: (isFeedback: boolean) => void;
  showFeedbackCheckbox?: boolean;
  /** Overrides the dialog's title. Defaults to the generic status_transition.comment.title. */
  title?: ModalProps['title'];
  transition: T;
}

export function IssueTransitionCommentDialog<T extends string>({
  comment,
  extraContent,
  isFeedback,
  isOpen,
  label,
  onClose,
  onCommentChange,
  onConfirm,
  onIsFeedbackChange,
  showFeedbackCheckbox,
  title,
  transition,
}: Readonly<Props<T>>) {
  const { formatMessage } = useIntl();

  return (
    <Modal
      content={
        <div className="sw-flex sw-flex-col sw-gap-4">
          {extraContent}
          <TextArea
            isResizable
            label={
              <Label>
                {label ?? (
                  <FormattedMessage
                    id="status_transition.comment.label"
                    values={{
                      status: formatMessage({
                        id: `status_transition.${transition}.to_status`,
                      }),
                    }}
                  />
                )}
              </Label>
            }
            onChange={(event) => {
              onCommentChange(event.target.value);
            }}
            placeholder={formatMessage({ id: 'status_transition.comment.placeholder' })}
            rows={5}
            value={comment}
          />
          {showFeedbackCheckbox && (
            <div className="sw-flex sw-gap-1">
              <Checkbox
                checked={isFeedback}
                label={<FormattedMessage id="status_transition.comment.share" />}
                onCheck={(checked) => {
                  onIsFeedbackChange(checked === true);
                }}
              />
              <ToggleTip
                className="sw-mt-1/2"
                description={
                  <FormattedMessage
                    id="status_transition.comment.share.helper"
                    values={{ br: () => <br /> }}
                  />
                }
                side="top"
              />
            </div>
          )}
        </div>
      }
      isOpen={isOpen}
      onOpenChange={onClose}
      primaryButton={
        <Button
          onClick={() => {
            onConfirm(comment, isFeedback);
          }}
          variety={ButtonVariety.Primary}
        >
          <FormattedMessage id="status_transition.change_status" />
        </Button>
      }
      secondaryButton={
        <Button onClick={onClose}>
          <FormattedMessage id="cancel" />
        </Button>
      }
      title={title ?? <FormattedMessage id="status_transition.comment.title" />}
    />
  );
}
