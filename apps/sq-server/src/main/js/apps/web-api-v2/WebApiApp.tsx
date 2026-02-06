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

import { Heading, Layout, Spinner, Text } from '@sonarsource/echoes-react';
import { omit } from 'lodash';
import { useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useLocation } from 'react-router-dom';
import { GlobalPageTemplate } from '~sq-server-commons/components/ui/GlobalPageTemplate';
import { useOpenAPI } from '~sq-server-commons/queries/web-api';
import ApiFilterContext from './components/ApiFilterContext';
import ApiInformation from './components/ApiInformation';
import ApiSidebar from './components/ApiSidebar';
import { URL_DIVIDER, dereferenceSchema } from './utils';

export default function WebApiApp() {
  const [showInternal, setShowInternal] = useState(false);
  const { data, isLoading } = useOpenAPI();
  const location = useLocation();
  const activeApi = location.hash.replace('#', '').split(URL_DIVIDER);

  const { formatMessage } = useIntl();

  const apis = useMemo(() => {
    if (!data) {
      return [];
    }
    return Object.entries(dereferenceSchema(data).paths ?? {}).reduce(
      (acc, [name, methods]) => [
        ...acc,
        ...Object.entries(
          omit(methods, 'summary', '$ref', 'description', 'servers', 'parameters') ?? {},
        ).map(([method, info]) => ({ name, method, info })),
      ],
      [],
    );
  }, [data]);

  const activeData =
    activeApi.length > 1 &&
    apis.find((api) => api.name === activeApi[0] && api.method === activeApi[1]);

  const contextValue = useMemo(
    () => ({
      showInternal,
      setShowInternal,
    }),
    [showInternal],
  );

  return (
    <ApiFilterContext.Provider value={contextValue}>
      <Layout.ContentGrid>
        <Spinner isLoading={isLoading}>
          {data && (
            <GlobalPageTemplate
              asideLeft={
                <ApiSidebar
                  apisList={apis.map(({ name, method, info }) => ({
                    method,
                    name,
                    info,
                  }))}
                />
              }
              hidePageHeader
              title={formatMessage({ id: 'api_documentation.page' })}
            >
              {!activeData && (
                <>
                  <Heading as="h1">
                    <FormattedMessage id="about" />
                  </Heading>
                  <Text as="p">{data.info.description}</Text>
                </>
              )}
              {data && activeData && (
                <ApiInformation
                  apiUrl={data.servers?.[0]?.url ?? ''}
                  data={activeData.info}
                  method={activeData.method}
                  name={activeData.name}
                />
              )}
            </GlobalPageTemplate>
          )}
        </Spinner>
      </Layout.ContentGrid>
    </ApiFilterContext.Provider>
  );
}
