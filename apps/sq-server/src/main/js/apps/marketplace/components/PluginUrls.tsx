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

import { FormattedMessage } from 'react-intl';
import { Link } from '~design-system';
import { Plugin } from '~sq-server-commons/types/plugins';

interface Props {
  plugin: Plugin;
}

export default function PluginUrls({ plugin }: Readonly<Props>) {
  if (!plugin.homepageUrl && !plugin.issueTrackerUrl) {
    return null;
  }
  return (
    <li className="sw-flex sw-flex-wrap sw-gap-4">
      {plugin.homepageUrl && (
        <Link className="sw-whitespace-nowrap" to={plugin.homepageUrl}>
          <FormattedMessage id="marketplace.homepage" />
        </Link>
      )}
      {plugin.issueTrackerUrl && (
        <Link className="sw-whitespace-nowrap" to={plugin.issueTrackerUrl}>
          <FormattedMessage id="marketplace.issue_tracker" />
        </Link>
      )}
    </li>
  );
}
