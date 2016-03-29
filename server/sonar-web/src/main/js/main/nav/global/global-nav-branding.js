/*
 * SonarQube
 * Copyright (C) 2009-2016 SonarSource SA
 * mailto:contact AT sonarsource DOT com
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
import React from 'react';
import { translate } from '../../../helpers/l10n';

export default React.createClass({
  renderLogo() {
    let url = this.props.logoUrl || `${window.baseUrl}/images/logo.svg`;
    let width = this.props.logoWidth || 100;
    let height = 30;
    let title = translate('layout.sonar.slogan');
    return <img src={url}
                width={width}
                height={height}
                alt={title}
                title={title}/>;
  },

  render() {
    const homeUrl = window.baseUrl + '/';
    const homeLinkClassName = 'navbar-brand' + (this.props.logoUrl ? ' navbar-brand-custom' : '');
    return (
        <div className="navbar-header">
          <a className={homeLinkClassName} href={homeUrl}>{this.renderLogo()}</a>
        </div>
    );
  }
});
