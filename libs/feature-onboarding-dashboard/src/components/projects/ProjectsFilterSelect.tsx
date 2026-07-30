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

import { FormFieldWidth, Label, Select } from '@sonarsource/echoes-react';
import { useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { OnboardingProjectsFilter } from '~shared/types/onboarding';
import { ProjectFilterOption } from '../../types/types';

interface Props<T extends OnboardingProjectsFilter> {
  /** Ties the external label to the select, which is how it gets its accessible name. */
  id: string;
  labelKey: string;
  /**
   * `NoInfer` keeps a `useState` setter out of the inference for `T` — `SetStateAction` widens it
   * to include the updater function, which would collapse `T` to its constraint.
   */
  onChange: (value: NoInfer<T>) => void;
  options: ReadonlyArray<ProjectFilterOption<T>>;
  value: T;
}

/**
 * A single filter dimension of the project tables, rendered as a compact labelled dropdown. Every
 * dimension always offers an "All" option, so the select never holds an empty value.
 */
export function ProjectsFilterSelect<T extends OnboardingProjectsFilter>({
  id,
  labelKey,
  onChange,
  options,
  value,
}: Readonly<Props<T>>) {
  const { formatMessage } = useIntl();

  const data = useMemo(
    () =>
      options.map((option) => ({
        label: formatMessage({ id: option.labelKey }),
        value: option.value,
      })),
    [formatMessage, options],
  );

  const handleChange = useCallback(
    (nextValue: string | null) => {
      // `isNotClearable` rules out clearing and deselecting, so this is always a known option.
      const option = options.find((candidate) => candidate.value === nextValue);

      if (option !== undefined) {
        onChange(option.value);
      }
    },
    [onChange, options],
  );

  return (
    <div className="sw-flex sw-items-center sw-gap-2">
      <Label htmlFor={id}>{formatMessage({ id: labelKey })}</Label>

      <Select
        data={data}
        hasDropdownAutoWidth
        id={id}
        isNotClearable
        onChange={handleChange}
        value={value}
        width={FormFieldWidth.Small}
      />
    </div>
  );
}
