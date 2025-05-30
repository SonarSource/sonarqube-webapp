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

import { Badge, Text } from '@sonarsource/echoes-react';
import { isEmpty } from 'lodash';
import { OpenAPIV3 } from 'openapi-types';
import React, { useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import { Accordion } from '~design-system';
import { ExcludeReferences, InternalExtension } from '~sq-server-commons/types/web-api-v2';
import ApiFilterContext from './ApiFilterContext';

interface Props {
  content?: ExcludeReferences<OpenAPIV3.ResponseObject>['content'];
}

export default function ApiRequestBodyParameters({ content }: Readonly<Props>) {
  const [openParameters, setOpenParameters] = React.useState<string[]>([]);
  const { showInternal } = useContext(ApiFilterContext);

  const toggleParameter = (parameter: string) => {
    if (openParameters.includes(parameter)) {
      setOpenParameters(openParameters.filter((n) => n !== parameter));
    } else {
      setOpenParameters([...openParameters, parameter]);
    }
  };

  const schema =
    content &&
    (content['application/json']?.schema || content['application/merge-patch+json']?.schema);

  if (!schema?.properties || schema?.type !== 'object' || isEmpty(schema?.properties)) {
    return null;
  }

  const parameters = schema.properties;
  const required = schema.required ?? [];

  const orderedKeys = Object.keys(parameters).sort((a, b) => {
    if (required?.includes(a) && !required?.includes(b)) {
      return -1;
    }
    if (!required?.includes(a) && required?.includes(b)) {
      return 1;
    }
    return 0;
  });

  return (
    <ul aria-labelledby="api_documentation.v2.request_subheader.request_body">
      {orderedKeys
        .filter(
          (key) => showInternal || !(parameters[key] as InternalExtension)['x-sonar-internal'],
        )
        .map((key) => {
          return (
            <Accordion
              className="sw-mt-2 sw-mb-4"
              data={key}
              header={
                <div>
                  {key}{' '}
                  {schema.required?.includes(key) && (
                    <Badge className="sw-ml-2" variety="neutral">
                      <FormattedMessage id="required" />
                    </Badge>
                  )}
                  {parameters[key].deprecated && (
                    <Badge className="sw-ml-2" variety="danger">
                      <FormattedMessage id="deprecated" />
                    </Badge>
                  )}
                  {(parameters[key] as InternalExtension)['x-sonar-internal'] && (
                    <Badge className="sw-ml-2" variety="highlight">
                      <FormattedMessage id="internal" />
                    </Badge>
                  )}
                </div>
              }
              key={key}
              onClick={() => {
                toggleParameter(key);
              }}
              open={openParameters.includes(key)}
            >
              <div className="sw-whitespace-pre-line">{parameters[key].description}</div>

              {parameters[key].enum && (
                <div className="sw-mt-2">
                  <FormattedMessage
                    id="api_documentation.v2.enum_description"
                    values={{
                      values: <i>{parameters[key].enum?.join(', ')}</i>,
                    }}
                  />
                </div>
              )}
              {parameters[key].maxLength && (
                <Text className="sw-mt-2 sw-block" isSubdued>
                  <FormattedMessage id="max" />
                  {`: ${parameters[key].maxLength}`}
                </Text>
              )}
              {typeof parameters[key].minLength === 'number' && (
                <Text className="sw-mt-2 sw-block" isSubdued>
                  <FormattedMessage id="min" />
                  {`: ${parameters[key].minLength}`}
                </Text>
              )}
              {parameters[key].default !== undefined && (
                <Text className="sw-mt-2 sw-block" isSubdued>
                  <FormattedMessage id="default" />
                  {`: ${parameters[key].default}`}
                </Text>
              )}
            </Accordion>
          );
        })}
    </ul>
  );
}
