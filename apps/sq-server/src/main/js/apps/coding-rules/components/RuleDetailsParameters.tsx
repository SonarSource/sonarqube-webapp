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

import { Heading, Text } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import { CellComponent, Table, TableRow } from '~design-system';
import { SafeHTMLInjection, SanitizeLevel } from '~shared/helpers/sanitize';
import { isDefined } from '~shared/helpers/types';
import { RuleParameter } from '~shared/types/rules';

interface Props {
  params: RuleParameter[];
}

export function RuleDetailsParameters({ params }: Readonly<Props>) {
  const intl = useIntl();

  return (
    <div className="js-rule-parameters">
      <Heading as="h3" className="sw-mb-2">
        {intl.formatMessage({ id: 'coding_rules.parameters' })}
      </Heading>

      <Table className="sw-my-4" columnCount={2} columnWidths={[0, 'auto']}>
        {params.map((param) => (
          <TableRow key={param.key}>
            <CellComponent className="sw-align-top sw-font-semibold">{param.key}</CellComponent>

            <CellComponent>
              <div className="sw-flex sw-flex-col sw-gap-2">
                {isDefined(param.htmlDesc) && (
                  <SafeHTMLInjection
                    htmlAsString={param.htmlDesc}
                    sanitizeLevel={SanitizeLevel.FORBID_SVG_MATHML}
                  >
                    <div />
                  </SafeHTMLInjection>
                )}

                {isDefined(param.defaultValue) && (
                  <Text isSubtle>
                    {intl.formatMessage({ id: 'coding_rules.parameters.default_value' })}

                    <br />

                    <span className="sw-code sw-break-all">{param.defaultValue}</span>
                  </Text>
                )}
              </div>
            </CellComponent>
          </TableRow>
        ))}
      </Table>
    </div>
  );
}
