/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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

import { Button, ButtonVariety, SelectionCards } from '@sonarsource/echoes-react';
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { FormField, InputTextArea, Modal } from '~design-system';
import FormattingTips from '~shared/components/common/FormattingTips';
import { HotspotStatusOption } from '~sq-server-commons/types/security-hotspots';

export interface StatusSelectionRendererProps {
  comment?: string;
  loading: boolean;
  onCancel: () => void;
  onCommentChange: (comment: string) => void;
  onStatusChange: (statusOption: HotspotStatusOption) => void;
  onSubmit: () => Promise<void>;
  status: HotspotStatusOption;
  submitDisabled: boolean;
}

export default function StatusSelectionRenderer(props: StatusSelectionRendererProps) {
  const { comment, loading, status, submitDisabled } = props;

  const intl = useIntl();

  const options = [
    HotspotStatusOption.TO_REVIEW,
    HotspotStatusOption.ACKNOWLEDGED,
    HotspotStatusOption.FIXED,
    HotspotStatusOption.SAFE,
  ].map((statusOption: HotspotStatusOption) => {
    return {
      value: statusOption,
      label: intl.formatMessage({ id: `hotspots.status_option.${statusOption}` }),
      helpText: intl.formatMessage({ id: `hotspots.status_option.${statusOption}.description` }),
    };
  });

  return (
    <Modal
      body={
        <>
          <SelectionCards
            ariaLabel={intl.formatMessage({ id: 'hotspots.status.select' })}
            className="sw-mb-4"
            onChange={props.onStatusChange}
            options={options}
            value={status}
          />
          <FormField
            htmlFor="comment-textarea"
            label={intl.formatMessage({ id: 'hotspots.status.add_comment_optional' })}
          >
            <InputTextArea
              className="sw-mb-2 sw-resize-y"
              id="comment-textarea"
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                props.onCommentChange(event.currentTarget.value);
              }}
              rows={4}
              size="full"
              value={comment}
            />
            <FormattingTips />
          </FormField>
        </>
      }
      headerTitle={intl.formatMessage({ id: 'hotspots.status.review_title' })}
      isScrollable
      loading={loading}
      onClose={props.onCancel}
      primaryButton={
        <Button
          isDisabled={submitDisabled || loading}
          onClick={props.onSubmit}
          variety={ButtonVariety.Primary}
        >
          <FormattedMessage id="hotspots.status.change_status" />
        </Button>
      }
      secondaryButtonLabel={intl.formatMessage({ id: 'cancel' })}
    />
  );
}
