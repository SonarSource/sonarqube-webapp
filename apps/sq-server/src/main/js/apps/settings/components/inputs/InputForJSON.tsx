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

import {
  Button,
  ButtonVariety,
  MessageInline,
  MessageType,
  TextArea,
} from '@sonarsource/echoes-react';
import * as React from 'react';
import { translate } from '~sq-server-commons/helpers/l10n';
import { DefaultSpecializedInputProps, getPropertyName } from '../../utils';

const JSON_SPACE_SIZE = 4;

interface Props extends DefaultSpecializedInputProps {
  innerRef: React.ForwardedRef<HTMLTextAreaElement>;
}

interface State {
  formatError: boolean;
}

class InputForJSON extends React.PureComponent<Props, State> {
  state: State = { formatError: false };

  handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({ formatError: false });
    this.props.onChange(event.target.value);
  };

  format = () => {
    const { value } = this.props;
    try {
      if (value) {
        this.props.onChange(JSON.stringify(JSON.parse(value), undefined, JSON_SPACE_SIZE));
      }
    } catch (e) {
      this.setState({ formatError: true });
    }
  };

  render() {
    const { value, name, innerRef, setting, isInvalid, id } = this.props;
    const { formatError } = this.state;

    return (
      <>
        <div className="sw-flex sw-items-end">
          <TextArea
            aria-label={getPropertyName(setting.definition)}
            id={id ?? ''}
            name={name}
            onChange={this.handleInputChange}
            ref={innerRef}
            rows={5}
            validation={isInvalid ? 'invalid' : undefined}
            value={value ?? ''}
            width="large"
          />
          <div className="sw-ml-2">
            <Button className="sw-mt-2" onClick={this.format} variety={ButtonVariety.Primary}>
              {translate('settings.json.format')}
            </Button>
          </div>
        </div>
        {formatError && (
          <MessageInline className="sw-mt-2 sw-block" type={MessageType.Warning}>
            {translate('settings.json.format_error')}
          </MessageInline>
        )}
      </>
    );
  }
}

export default React.forwardRef(
  (props: DefaultSpecializedInputProps, ref: React.ForwardedRef<HTMLTextAreaElement>) => (
    <InputForJSON innerRef={ref} {...props} />
  ),
);
