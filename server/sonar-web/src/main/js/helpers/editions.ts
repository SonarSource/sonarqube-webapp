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
import { stringify } from 'querystring';
import { omitNil } from 'sonar-ui-common/helpers/request';
import { Edition, EditionKey } from '../types/editions';
import { SystemUpgrade } from '../types/system';

const EDITIONS: { [x in EditionKey]: Edition } = {
  community: {
    key: EditionKey.community,
    name: 'Community Edition',
    homeUrl: 'https://redirect.sonarsource.com/editions/community.html',
    downloadProperty: 'downloadUrl'
  },
  developer: {
    key: EditionKey.developer,
    name: 'Developer Edition',
    homeUrl: 'https://redirect.sonarsource.com/editions/developer.html',
    downloadProperty: 'downloadDeveloperUrl'
  },
  enterprise: {
    key: EditionKey.enterprise,
    name: 'Enterprise Edition',
    homeUrl: 'https://redirect.sonarsource.com/editions/enterprise.html',
    downloadProperty: 'downloadEnterpriseUrl'
  },
  datacenter: {
    key: EditionKey.datacenter,
    name: 'Data Center Edition',
    homeUrl: 'https://redirect.sonarsource.com/editions/datacenter.html',
    downloadProperty: 'downloadDatacenterUrl'
  }
};

export function getEdition(editionKey: EditionKey) {
  return EDITIONS[editionKey];
}

export function getAllEditionsAbove(currentEdition?: EditionKey) {
  const editions = Object.values(EDITIONS);
  const currentEditionIdx = editions.findIndex(edition => edition.key === currentEdition);
  return editions.slice(currentEditionIdx + 1);
}

export function getEditionUrl(
  edition: Edition,
  data: { serverId?: string; ncloc?: number; sourceEdition?: EditionKey }
) {
  let url = edition.homeUrl;
  const query = stringify(omitNil(data));
  if (query) {
    url += '?' + query;
  }
  return url;
}

export function getEditionDownloadUrl(edition: Edition, lastUpgrade: SystemUpgrade) {
  return lastUpgrade[edition.downloadProperty] || lastUpgrade.downloadUrl;
}

export function getEditionDownloadFilename(url: string) {
  return url.replace(/^.+\/(sonarqube-[\w\-.]+\.zip)$/, '$1');
}
