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

import {
  ButtonIcon,
  ButtonVariety,
  FormFieldWidth,
  IconSortAscending,
  IconSortDescending,
  Label,
  Select,
} from '@sonarsource/echoes-react';
import { useId, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { OnboardingOrganizationSort, OnboardingSortDirection } from '~shared/types/onboarding';

const SORT_OPTIONS = [
  {
    labelKey: 'onboarding_dashboard.enterprise.organizations.sort.progress',
    value: OnboardingOrganizationSort.Progress,
  },
  {
    labelKey: 'onboarding_dashboard.enterprise.organizations.sort.name',
    value: OnboardingOrganizationSort.Name,
  },
];

interface Props {
  direction: OnboardingSortDirection;
  onDirectionChange: (direction: OnboardingSortDirection) => void;
  onSortChange: (sort: OnboardingOrganizationSort) => void;
  sort: OnboardingOrganizationSort;
}

export function OrganizationsSortControl({
  direction,
  onDirectionChange,
  onSortChange,
  sort,
}: Readonly<Props>) {
  const { formatMessage } = useIntl();
  const id = useId();
  const isDescending = direction === OnboardingSortDirection.Descending;

  const data = useMemo(
    () =>
      SORT_OPTIONS.map(({ labelKey, value }) => ({
        label: formatMessage({ id: labelKey }),
        value,
      })),
    [formatMessage],
  );

  const handleSortChange = (value: string | null) => {
    const nextSort = SORT_OPTIONS.find((option) => option.value === value)?.value;

    if (nextSort !== undefined) {
      onSortChange(nextSort);
    }
  };

  return (
    <div className="sw:flex sw:items-center sw:gap-2">
      <Label htmlFor={id}>{formatMessage({ id: 'projects.sort_by' })}</Label>

      <Select
        data={data}
        hasDropdownAutoWidth
        id={id}
        isNotClearable
        onChange={handleSortChange}
        value={sort}
        width={FormFieldWidth.Small}
      />

      <ButtonIcon
        Icon={isDescending ? IconSortDescending : IconSortAscending}
        ariaLabel={formatMessage({
          id: isDescending
            ? 'onboarding_dashboard.enterprise.organizations.sort.descending'
            : 'onboarding_dashboard.enterprise.organizations.sort.ascending',
        })}
        onClick={() => {
          onDirectionChange(
            isDescending ? OnboardingSortDirection.Ascending : OnboardingSortDirection.Descending,
          );
        }}
        variety={ButtonVariety.DefaultGhost}
      />
    </div>
  );
}
