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

import { Label, Text } from '@sonarsource/echoes-react';
import * as React from 'react';
import { ContentCell, HtmlFormatter, Table, TableRow } from '~design-system';
import { SafeHTMLInjection } from '~shared/helpers/sanitize';
import { translate, translateWithParameters } from '~sq-server-commons/helpers/l10n';
import { WebApi } from '~sq-server-commons/types/types';
import DeprecatedBadge from './DeprecatedBadge';
import InternalBadge from './InternalBadge';

interface Props {
  params: WebApi.Param[];
  showDeprecated: boolean;
  showInternal: boolean;
}

const TABLE_COLUMNS = ['200', 'auto', '200'];

export default class Params extends React.PureComponent<Props> {
  renderKey(param: WebApi.Param) {
    return (
      <ContentCell>
        <div>
          <HtmlFormatter>
            <code className="sw-code">{param.key}</code>
          </HtmlFormatter>

          {param.internal && (
            <div className="sw-mt-1">
              <InternalBadge />
            </div>
          )}

          {param.deprecatedSince && (
            <div className="sw-mt-1">
              <DeprecatedBadge since={param.deprecatedSince} />
            </div>
          )}

          <Text as="div" className="sw-mt-1" isSubtle>
            {param.required ? 'required' : 'optional'}
          </Text>

          {param.since && (
            <Text as="div" className="sw-mt-1" isSubtle>
              {translateWithParameters('since_x', param.since)}
            </Text>
          )}

          {this.props.showDeprecated && param.deprecatedKey && (
            <div className="sw-ml-2 sw-mt-4">
              <Text as="div" className="sw-mb-1" isSubtle>
                {translate('replaces')}:
              </Text>
              <code className="sw-code">{param.deprecatedKey}</code>
              {param.deprecatedKeySince && (
                <div className="sw-mt-1">
                  <DeprecatedBadge since={param.deprecatedKeySince} />
                </div>
              )}
            </div>
          )}
        </div>
      </ContentCell>
    );
  }

  renderConstraint(param: WebApi.Param, field: keyof WebApi.Param, label: string) {
    const value = param[field];
    if (value !== undefined) {
      return (
        <div className="sw-mt-1">
          <Label as="div">{translate('api_documentation', label)}</Label>
          <code className="sw-code">{value}</code>
        </div>
      );
    }
    return null;
  }

  render() {
    const { params, showDeprecated, showInternal } = this.props;
    const displayedParameters = params
      .filter((p) => showDeprecated || !p.deprecatedSince)
      .filter((p) => showInternal || !p.internal);
    return (
      <div className="sw-mt-6">
        <Table columnCount={TABLE_COLUMNS.length} columnWidths={TABLE_COLUMNS}>
          {displayedParameters.map((param) => (
            <TableRow key={param.key}>
              {this.renderKey(param)}

              <ContentCell>
                <SafeHTMLInjection htmlAsString={param.description}>
                  <div className="markdown" />
                </SafeHTMLInjection>
              </ContentCell>

              <ContentCell>
                <div>
                  {param.possibleValues && (
                    <div>
                      <Label as="div">{translate('api_documentation.possible_values')}</Label>
                      <ul>
                        {param.possibleValues.map((value) => (
                          <li className="sw-mt-1" key={value}>
                            <code>{value}</code>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {this.renderConstraint(param, 'defaultValue', 'default_values')}
                  {this.renderConstraint(param, 'exampleValue', 'example_values')}
                  {this.renderConstraint(param, 'maxValuesAllowed', 'max_values')}
                  {this.renderConstraint(param, 'minimumValue', 'min_value')}
                  {this.renderConstraint(param, 'maximumValue', 'max_value')}
                  {this.renderConstraint(param, 'minimumLength', 'min_length')}
                  {this.renderConstraint(param, 'maximumLength', 'max_length')}
                </div>
              </ContentCell>
            </TableRow>
          ))}
        </Table>
      </div>
    );
  }
}
