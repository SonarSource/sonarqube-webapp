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

import { Select, SelectOption, Text } from '@sonarsource/echoes-react';
import { sortBy } from 'lodash';
import { useMemo } from 'react';
import { translate } from '../../helpers/l10n';
import { AlmInstanceBase } from '../../types/alm-settings';

interface Props {
  className: string;

  // /!\ undefined = uncontrolled, null = no selected value, '' = value of empty string
  initialValue?: string | null;

  inputId: string;
  instances: AlmInstanceBase[];
  onChange: (instance: AlmInstanceBase) => void;
}

export default function AlmSettingsInstanceSelector(props: Readonly<Props>) {
  const { instances, initialValue, className, inputId } = props;

  const instancesOption = useMemo(
    () =>
      sortBy(
        instances.map((instance) => ({
          instance,
          label: instance.key,
          value: instance.key,
        })),
        'label',
      ),
    [instances],
  );

  return (
    <Select
      ariaLabelledBy={inputId}
      className={className}
      data={instancesOption}
      id={inputId}
      onChange={(value: string) => {
        const instance = instances.find((instance) => instance.key === value);
        if (instance) {
          props.onChange(instance);
        }
      }}
      optionComponent={InstanceSelectItem}
      placeholder={translate('alm.configuration.selector.placeholder')}
      value={
        // /!\ To clear a possible previous selection, the value must explicitly be set to null
        initialValue ? instancesOption.find(({ value }) => value === initialValue)?.value : null
      }
      width="full"
    />
  );
}

function InstanceSelectItem({ instance }: Readonly<SelectOption & { instance: AlmInstanceBase }>) {
  return instance.url ? (
    <>
      <span>{instance.key} — </span>
      <Text isSubdued>{instance.url}</Text>
    </>
  ) : (
    <span>{instance.key}</span>
  );
}
