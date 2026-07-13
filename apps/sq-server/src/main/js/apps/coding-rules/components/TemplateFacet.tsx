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

import { ToggleTip } from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';
import Facet, { BasicProps } from '~sq-server-commons/components/facets/Facet';

interface Props extends Omit<BasicProps, 'onChange' | 'values'> {
  onChange: (changes: { template: boolean | undefined }) => void;
  value: boolean | undefined;
}

export default function TemplateFacet({ onChange, value, ...props }: Readonly<Props>) {
  const { formatMessage } = useIntl();

  const handleChange = (changes: { template: string | any[] }) => {
    const template =
      // empty array is returned when a user cleared the facet
      // otherwise `"true"`, `"false"` or `undefined` can be returned
      Array.isArray(changes.template) || changes.template === undefined
        ? undefined
        : changes.template === 'true';
    onChange({ ...changes, template });
  };

  const renderName = (template: string) =>
    template === 'true'
      ? formatMessage({ id: 'coding_rules.filters.template.is_template' })
      : formatMessage({ id: 'coding_rules.filters.template.is_not_template' });

  return (
    <Facet
      {...props}
      help={
        <ToggleTip
          ariaLabel={formatMessage({ id: 'help' })}
          description={<FormattedMessage id="coding_rules.rule_template.help" />}
        />
      }
      onChange={handleChange}
      options={['true', 'false']}
      property="template"
      renderName={renderName}
      renderTextName={renderName}
      singleSelection
      values={value !== undefined ? [String(value)] : []}
    />
  );
}
