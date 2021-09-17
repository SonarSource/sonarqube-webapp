/*
 * SonarQube
 * Copyright (C) 2009-2021 SonarSource SA
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
import classNames from 'classnames';
import * as React from 'react';
import { translate } from '../../helpers/l10n';
import { getFormattingHelpUrl } from '../../helpers/urls';

interface Props {
  className?: string;
}

export default class FormattingTips extends React.PureComponent<Props> {
  handleClick(evt: React.SyntheticEvent<HTMLAnchorElement>) {
    evt.preventDefault();
    window.open(
      getFormattingHelpUrl(),
      'Formatting',
      'height=300,width=600,scrollbars=1,resizable=1'
    );
  }

  render() {
    return (
      <div className={classNames('markdown-tips', this.props.className)}>
        <a className="little-spacer-right" href="#" onClick={this.handleClick}>
          {translate('formatting.helplink')}
        </a>
        {':'}
        <span className="spacer-left">*{translate('bold')}*</span>
        <span className="spacer-left">
          ``
          {translate('code')}
          ``
        </span>
        <span className="spacer-left">* {translate('bulleted_point')}</span>
      </div>
    );
  }
}
