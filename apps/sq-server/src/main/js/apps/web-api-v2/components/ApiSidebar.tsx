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

import { Badge, Checkbox } from '@sonarsource/echoes-react';
import { sortBy } from 'lodash';
import { OpenAPIV3 } from 'openapi-types';
import { Fragment, useContext, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  BasicSeparator,
  InputSearch,
  SubnavigationAccordion,
  SubnavigationItem,
  SubnavigationSubheading,
} from '~design-system';
import { translate } from '~sq-server-commons/helpers/l10n';
import { InternalExtension } from '~sq-server-commons/types/web-api-v2';
import { URL_DIVIDER, getApiEndpointKey } from '../utils';
import ApiFilterContext from './ApiFilterContext';
import RestMethodPill from './RestMethodPill';

interface Api {
  info: OpenAPIV3.OperationObject<InternalExtension>;
  method: string;
  name: string;
}

interface Props {
  apisList: Api[];
  docInfo: OpenAPIV3.InfoObject;
}

const METHOD_ORDER: Record<string, number> = {
  post: 0,
  get: 1,
  patch: 2,
  delete: 3,
};

export default function ApiSidebar({ apisList, docInfo }: Readonly<Props>) {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { showInternal, setShowInternal } = useContext(ApiFilterContext);
  const activeApi = location.hash.replace('#', '').split(URL_DIVIDER);

  const handleApiClick = (value: string) => {
    navigate(`.#${value}`, { replace: true });
  };

  const lowerCaseSearch = search.toLowerCase();

  const groupedList = useMemo(
    () =>
      apisList
        .filter(
          (api) =>
            api.name.toLowerCase().includes(lowerCaseSearch) ||
            api.method.toLowerCase().includes(lowerCaseSearch) ||
            api.info.summary?.toLowerCase().includes(lowerCaseSearch),
        )
        .filter((api) => showInternal || !api.info['x-sonar-internal'])
        .reduce<Record<string, Api[]>>((acc, api) => {
          const subgroup = api.name.split('/')[1];

          return {
            ...acc,
            [subgroup]: [...(acc[subgroup] ?? []), api],
          };
        }, {}),
    [lowerCaseSearch, apisList, showInternal],
  );

  return (
    <>
      <h1 className="sw-mb-2">{docInfo.title}</h1>

      <InputSearch
        className="sw-w-full"
        onChange={setSearch}
        placeholder={translate('api_documentation.v2.search')}
        value={search}
      />

      <div className="sw-my-4">
        <Checkbox
          checked={showInternal}
          helpText={translate('api_documentation.internal_tooltip')}
          label={translate('api_documentation.show_internal_v2')}
          onCheck={() => {
            setShowInternal((prev) => !prev);
          }}
        />
      </div>

      {Object.entries(groupedList).map(([group, apis]) => (
        <SubnavigationAccordion
          className="sw-mt-2"
          header={group}
          id={`web-api-${group}`}
          initExpanded={apis.some(
            ({ name, method }) => name === activeApi[0] && method === activeApi[1],
          )}
          key={group}
        >
          {sortBy(apis, (a) => [a.name, METHOD_ORDER[a.method]]).map(
            ({ method, name, info }, index, sorted) => {
              const resourceName = getResourceFromName(name);

              const previousResourceName =
                index > 0 ? getResourceFromName(sorted[index - 1].name) : undefined;

              const isNewResource = resourceName !== previousResourceName;

              return (
                <Fragment key={getApiEndpointKey(name, method)}>
                  {index > 0 && isNewResource && <BasicSeparator />}

                  {(index === 0 || isNewResource) && (
                    <SubnavigationSubheading>{resourceName}</SubnavigationSubheading>
                  )}

                  <SubnavigationItem
                    active={name === activeApi[0] && method === activeApi[1]}
                    onClick={handleApiClick}
                    value={getApiEndpointKey(name, method)}
                  >
                    <div className="sw-flex sw-gap-2 sw-w-full sw-justify-between">
                      <div className="sw-flex sw-gap-2">
                        <RestMethodPill method={method} />

                        <div>{info.summary ?? name}</div>
                      </div>

                      {(info['x-sonar-internal'] || info.deprecated) && (
                        <div className="sw-flex sw-flex-col sw-justify-center sw-gap-2">
                          {info['x-sonar-internal'] && (
                            <Badge className="sw-self-center" variety="highlight">
                              <FormattedMessage id="internal" />
                            </Badge>
                          )}

                          {info.deprecated && (
                            <Badge className="sw-self-center" variety="danger">
                              <FormattedMessage id="deprecated" />
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </SubnavigationItem>
                </Fragment>
              );
            },
          )}
        </SubnavigationAccordion>
      ))}
    </>
  );
}

function getResourceFromName(name: string) {
  const parts = name.split('/').slice(2); // remove domain + pre-slash empty string

  if (name.endsWith('}')) {
    parts.pop(); // remove the resource id
  }

  return parts.join('/');
}
