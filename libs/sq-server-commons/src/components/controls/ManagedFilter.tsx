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

import { ToggleButtonGroup } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import { isDefined } from '~shared/helpers/types';
import { Provider } from '../../types/types';

interface ManagedFilterProps {
  loading: boolean;
  manageProvider: Provider | undefined;
  managed: boolean | undefined;
  setManaged: (managed: boolean | undefined) => void;
}

export function ManagedFilter(props: Readonly<ManagedFilterProps>) {
  const { manageProvider, loading, managed } = props;
  const intl = useIntl();

  if (manageProvider === undefined) {
    return null;
  }

  return (
    <ToggleButtonGroup
      className="sw-mr-4"
      isDisabled={loading}
      onChange={(filterOption) => {
        if (filterOption === 'all') {
          props.setManaged(undefined);
        } else {
          props.setManaged(filterOption === 'true');
        }
      }}
      options={[
        { label: intl.formatMessage({ id: 'all' }), value: 'all' },
        {
          label: intl.formatMessage(
            {
              id: 'managed',
            },
            { source: intl.formatMessage({ id: `managed.${manageProvider}` }) },
          ),
          value: 'true',
        },
        { label: intl.formatMessage({ id: 'local' }), value: 'false' },
      ]}
      selected={isDefined(managed) ? `${managed}` : 'all'}
    />
  );
}
