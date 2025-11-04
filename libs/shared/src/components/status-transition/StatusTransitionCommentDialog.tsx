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

import { Button, ButtonVariety, Label, Modal, TextArea } from '@sonarsource/echoes-react';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

interface Props<T extends string> {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (comment: string) => void;
  transition: T;
}

export function IssueTransitionCommentDialog<T extends string>({
  isOpen,
  onClose,
  transition,
  onConfirm,
}: Readonly<Props<T>>) {
  const intl = useIntl();
  const [comment, setComment] = useState('');

  return (
    <Modal
      content={
        <TextArea
          label={
            <Label>
              <FormattedMessage
                id="status_transition.comment.label"
                values={{
                  status: intl.formatMessage({
                    id: `status_transition.${transition}.to_status`,
                  }),
                }}
              />
            </Label>
          }
          onChange={(event) => {
            setComment(event.target.value);
          }}
          placeholder={intl.formatMessage({ id: 'status_transition.comment.placeholder' })}
          value={comment}
        />
      }
      isOpen={isOpen}
      onOpenChange={onClose}
      primaryButton={
        <Button
          onClick={() => {
            onConfirm(comment);
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
      title={<FormattedMessage id="status_transition.comment.title" />}
    />
  );
}
