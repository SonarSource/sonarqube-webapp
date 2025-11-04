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

import { Badge, Heading, Text } from '@sonarsource/echoes-react';
import { groupBy } from 'lodash';
import { OpenAPIV3 } from 'openapi-types';
import React, { useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import { Accordion } from '~design-system';
import { ExcludeReferences, InternalExtension } from '~sq-server-commons/types/web-api-v2';
import { mapOpenAPISchema } from '../utils';
import ApiFilterContext from './ApiFilterContext';
import ApiRequestBodyParameters from './ApiRequestParameters';
import ApiRequestSchema from './ApiRequestSchema';

interface Props {
  data: ExcludeReferences<OpenAPIV3.OperationObject>;
}

export default function ApiParameters({ data }: Readonly<Props>) {
  const [openParameters, setOpenParameters] = React.useState<string[]>([]);
  const { showInternal } = useContext(ApiFilterContext);

  const toggleParameter = (name: string) => {
    if (openParameters.includes(name)) {
      setOpenParameters(openParameters.filter((n) => n !== name));
    } else {
      setOpenParameters([...openParameters, name]);
    }
  };

  const getSchemaType = (schema: ExcludeReferences<OpenAPIV3.SchemaObject>) => {
    const mappedSchema = mapOpenAPISchema(schema);

    return typeof mappedSchema === 'object' ? JSON.stringify(mappedSchema) : mappedSchema;
  };

  const requestBody = data.requestBody?.content;

  return (
    <>
      <Heading as="h2" hasMarginBottom>
        <FormattedMessage id="api_documentation.v2.parameter_header" />
      </Heading>
      {Object.entries(groupBy(data.parameters, (p) => p.in)).map(
        ([group, parameters]: [
          string,
          ExcludeReferences<Array<OpenAPIV3.ParameterObject & InternalExtension>>,
        ]) => (
          <div key={group}>
            <Heading as="h3" hasMarginBottom id={`api-parameters-${group}`}>
              <FormattedMessage id={`api_documentation.v2.request_subheader.${group}`} />
            </Heading>
            <ul aria-labelledby={`api-parameters-${group}`}>
              {parameters
                .filter((parameter) => showInternal || !parameter['x-sonar-internal'])
                .map((parameter) => {
                  return (
                    <Accordion
                      className="sw-mt-2 sw-mb-4"
                      data={parameter.name}
                      header={
                        <div>
                          {parameter.name}{' '}
                          {parameter.schema && (
                            <Text className="sw-inline sw-ml-2" isSubtle>
                              {getSchemaType(parameter.schema)}
                            </Text>
                          )}
                          {parameter.required && (
                            <Badge className="sw-ml-2" variety="neutral">
                              <FormattedMessage id="required" />
                            </Badge>
                          )}
                          {parameter.deprecated && (
                            <Badge className="sw-ml-2" variety="danger">
                              <FormattedMessage id="deprecated" />
                            </Badge>
                          )}
                          {parameter['x-sonar-internal'] && (
                            <Badge className="sw-ml-2" variety="highlight">
                              <FormattedMessage id="internal" />
                            </Badge>
                          )}
                        </div>
                      }
                      key={parameter.name}
                      onClick={toggleParameter}
                      open={openParameters.includes(parameter.name)}
                    >
                      <div>{parameter.description}</div>
                      {parameter.schema?.enum && (
                        <div className="sw-mt-2">
                          <FormattedMessage
                            id="api_documentation.v2.enum_description"
                            values={{
                              values: (
                                <div className="sw-typo-semibold">
                                  {parameter.schema.enum.join(', ')}
                                </div>
                              ),
                            }}
                          />
                        </div>
                      )}
                      {parameter.schema?.maximum && (
                        <Text className="sw-mt-2 sw-block" isSubtle>
                          <FormattedMessage id="max" />
                          {`: ${parameter.schema?.maximum}`}
                        </Text>
                      )}
                      {typeof parameter.schema?.minimum === 'number' && (
                        <Text className="sw-mt-2 sw-block" isSubtle>
                          <FormattedMessage id="min" />
                          {`: ${parameter.schema?.minimum}`}
                        </Text>
                      )}
                      {parameter.example !== undefined && (
                        <Text className="sw-mt-2 sw-block" isSubtle>
                          <FormattedMessage id="example" />
                          {`: ${parameter.example}`}
                        </Text>
                      )}
                      {parameter.schema?.default !== undefined && (
                        <Text className="sw-mt-2 sw-block" isSubtle>
                          <FormattedMessage id="default" />
                          {`: ${parameter.schema?.default}`}
                        </Text>
                      )}
                    </Accordion>
                  );
                })}
            </ul>
          </div>
        ),
      )}
      {!requestBody && !data.parameters?.length && (
        <Text isSubtle>
          <FormattedMessage id="no_data" />
        </Text>
      )}
      {requestBody && (
        <div>
          <Heading as="h3" hasMarginBottom id="api_documentation.v2.request_subheader.request_body">
            <FormattedMessage id="api_documentation.v2.request_subheader.request_body" />
          </Heading>
          <ApiRequestSchema content={requestBody} />
          <ApiRequestBodyParameters content={requestBody} />
        </div>
      )}
    </>
  );
}
