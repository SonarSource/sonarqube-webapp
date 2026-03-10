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
  ButtonSize,
  ButtonVariety,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
} from '@sonarsource/echoes-react';
import {
  format,
  getYear,
  isSameMonth,
  isSameYear,
  setMonth,
  setYear,
  startOfMonth,
} from 'date-fns';
import { range } from 'lodash';
import { MonthCaptionProps, useDayPicker } from 'react-day-picker';
import { useIntl } from 'react-intl';
import { InputSelect } from '../../sonar-aligned/components/input';

function CompactDropdownIndicator() {
  return (
    <div className="sw-flex sw-pr-1">
      <IconChevronDown />
    </div>
  );
}

const YEARS_TO_DISPLAY = 10;
const MONTHS_IN_A_YEAR = 12;

export function CustomCalendarNavigation(props: MonthCaptionProps) {
  const { calendarMonth } = props;
  const { dayPickerProps, goToMonth, nextMonth, previousMonth } = useDayPicker();

  const intl = useIntl();

  const formatChevronLabel = (date?: Date) => {
    if (date === undefined) {
      return intl.formatMessage({ id: 'disabled_' });
    }

    return `${intl.formatDate(date, { month: 'long' })} ${intl.formatDate(date, {
      year: 'numeric',
    })}`;
  };

  const displayMonth = calendarMonth.date;
  const baseDate = startOfMonth(displayMonth); // reference date

  const months = range(MONTHS_IN_A_YEAR).map((month) => {
    const monthValue = setMonth(baseDate, month);

    return {
      label: format(monthValue, 'MMM'),
      value: monthValue,
    };
  });

  const startYear = dayPickerProps.startMonth
    ? getYear(dayPickerProps.startMonth)
    : getYear(Date.now()) - YEARS_TO_DISPLAY;

  const endYear = dayPickerProps.endMonth ? getYear(dayPickerProps.endMonth) : undefined;

  const years = range(startYear, endYear ? endYear + 1 : undefined).map((year) => {
    const yearValue = setYear(baseDate, year);

    return {
      label: String(year),
      value: yearValue,
    };
  });

  return (
    <nav className="sw-flex sw-items-center sw-gap-1 sw-pt-2 sw-px-2">
      <ButtonIcon
        Icon={IconChevronLeft}
        ariaLabel={intl.formatMessage(
          { id: 'previous_month_x' },
          { month: formatChevronLabel(previousMonth) },
        )}
        isDisabled={previousMonth === undefined}
        onClick={() => {
          if (previousMonth) {
            goToMonth(previousMonth);
          }
        }}
        size={ButtonSize.Medium}
        variety={ButtonVariety.DefaultGhost}
      />

      <span data-testid="month-select">
        <InputSelect
          className="sw-w-[5rem]"
          components={{ DropdownIndicator: CompactDropdownIndicator }}
          isClearable={false}
          onChange={(value) => {
            if (value) {
              goToMonth(value.value);
            }
          }}
          options={months}
          value={months.find((m) => isSameMonth(m.value, displayMonth))}
        />
      </span>

      <span data-testid="year-select">
        <InputSelect
          className="sw-w-[5rem]"
          components={{ DropdownIndicator: CompactDropdownIndicator }}
          data-testid="year-select"
          isClearable={false}
          onChange={(value) => {
            if (value) {
              goToMonth(value.value);
            }
          }}
          options={years}
          value={years.find((y) => isSameYear(y.value, displayMonth))}
        />
      </span>

      <ButtonIcon
        Icon={IconChevronRight}
        ariaLabel={intl.formatMessage(
          { id: 'next_month_x' },
          {
            month: formatChevronLabel(nextMonth),
          },
        )}
        isDisabled={nextMonth === undefined}
        onClick={() => {
          if (nextMonth) {
            goToMonth(nextMonth);
          }
        }}
        size={ButtonSize.Medium}
        variety={ButtonVariety.DefaultGhost}
      />
    </nav>
  );
}
