/*
 * SonarQube
 * Copyright (C) 2009-2017 SonarSource SA
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
import React from 'react';
import { translate } from '../../../helpers/l10n';

export default class ProfileExporters extends React.Component {
  static propTypes = {
    exporters: React.PropTypes.array.isRequired
  };

  getExportUrl (exporter) {
    return window.baseUrl + '/api/qualityprofiles/export' +
        '?exporterKey=' + encodeURIComponent(exporter.key) +
        '&language=' + encodeURIComponent(this.props.profile.language) +
        '&name=' + encodeURIComponent(this.props.profile.name);
  }

  render () {
    const { exporters, profile } = this.props;
    const exportersForLanguage = exporters.filter(e => (
        e.languages.includes(profile.language)
    ));

    if (exportersForLanguage.length === 0) {
      return null;
    }

    return (
        <div className="quality-profile-box quality-profile-exporters">
          <header className="big-spacer-bottom">
            <h2>{translate('quality_profiles.exporters')}</h2>
          </header>
          <ul>
            {exportersForLanguage.map(exporter => (
                <li key={exporter.key}
                    data-key={exporter.key}
                    className="spacer-top">
                  <a href={this.getExportUrl(exporter)} target="_blank">
                    {exporter.name}
                  </a>
                </li>
            ))}
          </ul>
        </div>
    );
  }
}
