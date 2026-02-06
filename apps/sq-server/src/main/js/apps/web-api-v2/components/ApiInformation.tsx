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

import { Badge, Heading } from '@sonarsource/echoes-react';
import { OpenAPIV3 } from 'openapi-types';
import { FormattedMessage } from 'react-intl';
import { ExcludeReferences, InternalExtension } from '~sq-server-commons/types/web-api-v2';
import { getApiEndpointKey } from '../utils';
import ApiParameters from './ApiParameters';
import ApiResponses from './ApiResponses';
import RestMethodPill from './RestMethodPill';

interface Props {
  apiUrl: string;
  data: ExcludeReferences<OpenAPIV3.OperationObject<InternalExtension>>;
  method: string;
  name: string;
}

export default function ApiInformation({ name, data, method, apiUrl }: Readonly<Props>) {
  return (
    <>
      {data.summary && (
        <Heading as="h1" hasMarginBottom>
          {data.summary}
        </Heading>
      )}
      <Heading as="h2" hasMarginBottom size="medium">
        <RestMethodPill method={method} />
        <span className="sw-ml-4">{apiUrl.replace(/.*(?=\/api)/, '') + name}</span>
        {data['x-sonar-internal'] && (
          <Badge className="sw-ml-3" variety="highlight">
            <FormattedMessage id="internal" />
          </Badge>
        )}
        {data.deprecated && (
          <Badge className="sw-ml-3" variety="danger">
            <FormattedMessage id="deprecated" />
          </Badge>
        )}
      </Heading>
      {data.description && <div>{data.description}</div>}
      <div className="sw-grid sw-grid-cols-2 sw-gap-4 sw-mt-4">
        <div>
          <ApiParameters data={data} key={getApiEndpointKey(name, method)} />
        </div>
        <div>
          <ApiResponses key={getApiEndpointKey(name, method)} responses={data.responses} />
        </div>
      </div>
    </>
  );
}
