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

import styled from '@emotion/styled';
import { Button, TextArea } from '@sonarsource/echoes-react';
import * as React from 'react';
import {
  HtmlFormatter,
  PencilIcon,
  SafeHTMLInjection,
  SanitizeLevel,
  themeBorder,
  themeColor,
} from '~design-system';
import FormattingTipsWithLink from '~sq-server-shared/components/common/FormattingTipsWithLink';
import { translate } from '~sq-server-shared/helpers/l10n';
import { DefaultSpecializedInputProps, getPropertyName } from '../../utils';

function InputForFormattedText(
  props: DefaultSpecializedInputProps,
  ref: React.ForwardedRef<HTMLTextAreaElement>,
) {
  const { isEditing, setting, name, value, id } = props;
  const { values, hasValue } = setting;
  const editMode = !hasValue || isEditing;
  // 0th value of the values array is markdown and 1st is the formatted text
  const formattedValue = values ? values[1] : undefined;

  function handleInputChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    props.onChange(event.target.value);
  }

  return editMode ? (
    <div>
      <TextArea
        aria-label={getPropertyName(setting.definition)}
        className="settings-large-input sw-mr-2"
        id={id ?? ''}
        name={name}
        onChange={handleInputChange}
        ref={ref}
        rows={5}
        value={value ?? ''}
        width="large"
      />
      <FormattingTipsWithLink className="sw-mt-2" />
    </div>
  ) : (
    <>
      <HtmlFormatter>
        <SafeHTMLInjection
          htmlAsString={formattedValue ?? ''}
          sanitizeLevel={SanitizeLevel.USER_INPUT}
        >
          <FormattedPreviewBox />
        </SafeHTMLInjection>
      </HtmlFormatter>

      <Button className="sw-mt-2" onClick={props.onEditing} prefix={<PencilIcon />}>
        {translate('edit')}
      </Button>
    </>
  );
}

const FormattedPreviewBox = styled.div`
  width: 450px;
  background-color: ${themeColor('infoBackground')};
  border: ${themeBorder('default', 'infoBorder')};
  border-radius: 2px;
  padding: 16px;
  overflow-wrap: break-word;
  line-height: 1.5;
`;

export default React.forwardRef(InputForFormattedText);
