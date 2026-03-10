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

import styled from '@emotion/styled';
import { cssVar, IconCalendar } from '@sonarsource/echoes-react';
import classNames from 'classnames';
import { format } from 'date-fns';
import * as React from 'react';
import { Matcher, DayPicker as OriginalDayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import tw from 'twin.macro';
import { PopupPlacement, PopupZLevel, themeColor, themeContrast } from '../../helpers';
import { InputSizeKeys } from '../../types/theme';
import EscKeydownHandler from '../EscKeydownHandler';
import { FocusOutHandler } from '../FocusOutHandler';
import { CloseIcon } from '../icons/CloseIcon';
import { InteractiveIcon } from '../InteractiveIcon';
import { OutsideClickHandler } from '../OutsideClickHandler';
import { Popup } from '../popups';
import { CustomCalendarNavigation } from './DatePickerCustomCalendarNavigation';
import { InputField } from './InputField';

// When no minDate is given, year dropdown will show year options up to PAST_MAX_YEARS in the past
const YEARS_TO_DISPLAY = 10;

interface Props {
  alignRight?: boolean;
  className?: string;
  clearButtonLabel: string;
  currentMonth?: Date;
  highlightFrom?: Date;
  highlightTo?: Date;
  id?: string;
  inputClassName?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  maxDate?: Date;
  minDate?: Date;
  name?: string;
  onChange: (date: Date | undefined) => void;
  placeholder: string;
  showClearButton?: boolean;
  size?: InputSizeKeys;
  value?: Date;
  valueFormatter?: (date?: Date) => string;
  zLevel?: PopupZLevel;
}

interface State {
  currentMonth: Date;
  lastHovered?: Date;
  open: boolean;
}

function formatWeekdayName(date: Date) {
  return format(date, 'EEE'); // Short weekday name, e.g. Wed, Thu
}

export class DatePicker extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      currentMonth: props.value ?? props.currentMonth ?? new Date(),
      open: false,
    };
  }

  handleResetClick = () => {
    this.closeCalendar();
    this.props.onChange(undefined);
  };

  openCalendar = () => {
    this.setState({
      currentMonth: this.props.value ?? this.props.currentMonth ?? new Date(),
      lastHovered: undefined,
      open: true,
    });
  };

  closeCalendar = () => {
    this.setState({ open: false });
  };

  handleDayClick = (day: Date, modifiers: Record<string, boolean>) => {
    if (!modifiers.disabled) {
      this.closeCalendar();
      this.props.onChange(day);
    }
  };

  handleDayMouseEnter = (day: Date, modifiers: Record<string, boolean>) => {
    this.setState({ lastHovered: modifiers.disabled ? undefined : day });
  };

  render() {
    const {
      alignRight,
      clearButtonLabel,
      highlightFrom,
      highlightTo,
      inputRef,
      minDate,
      maxDate = new Date(),
      value: selectedDay,
      name,
      className,
      inputClassName,
      id,
      placeholder,
      showClearButton = true,
      valueFormatter = (date?: Date) => (date ? format(date, 'MMM d, yyyy') : ''),
      size,
      zLevel = PopupZLevel.Global,
    } = this.props;

    const { lastHovered, currentMonth, open } = this.state;

    // Infer start and end dropdown year from min/max dates, if set
    const fromYear = minDate ? minDate.getFullYear() : new Date().getFullYear() - YEARS_TO_DISPLAY;
    const toYear = maxDate.getFullYear();

    let highlighted: Matcher = false;
    const lastHoveredOrValue = lastHovered ?? selectedDay;

    if (highlightFrom && lastHoveredOrValue) {
      highlighted = { from: highlightFrom, to: lastHoveredOrValue };
    }

    if (highlightTo && lastHoveredOrValue) {
      highlighted = { from: lastHoveredOrValue, to: highlightTo };
    }

    return (
      <OutsideClickHandler onClickOutside={this.closeCalendar}>
        <FocusOutHandler onFocusOut={this.closeCalendar}>
          <EscKeydownHandler onKeydown={this.closeCalendar}>
            <Popup
              allowResizing
              className="sw-overflow-visible" //Necessary for the month & year selectors
              overlay={
                open ? (
                  <div className="sw-px-2 sw-pb-2">
                    <DayPicker
                      captionLayout="dropdown"
                      className="sw-typo-default"
                      components={{
                        MonthCaption: CustomCalendarNavigation,
                        Nav: () => <></>,
                      }}
                      disabled={{ after: maxDate, before: minDate }}
                      endMonth={new Date(toYear, 11)}
                      formatters={{
                        formatWeekdayName,
                      }}
                      mode="single"
                      modifiers={{ highlighted }}
                      modifiersClassNames={{ highlighted: 'rdp-highlighted' }}
                      month={currentMonth}
                      onDayClick={this.handleDayClick}
                      onDayMouseEnter={this.handleDayMouseEnter}
                      onMonthChange={(currentMonth) => {
                        this.setState({ currentMonth });
                      }}
                      selected={selectedDay}
                      startMonth={new Date(fromYear, 0)}
                      weekStartsOn={1}
                    />
                  </div>
                ) : null
              }
              placement={alignRight ? PopupPlacement.BottomRight : PopupPlacement.BottomLeft}
              zLevel={zLevel}
            >
              <span className={classNames('sw-relative sw-block sw-cursor-pointer', className)}>
                <StyledInputField
                  aria-label={placeholder}
                  className={classNames(inputClassName, {
                    'is-filled': selectedDay !== undefined && showClearButton,
                  })}
                  id={id}
                  name={name}
                  onClick={this.openCalendar}
                  onFocus={this.openCalendar}
                  placeholder={placeholder}
                  readOnly
                  ref={inputRef}
                  size={size}
                  title={valueFormatter(selectedDay)}
                  type="text"
                  value={valueFormatter(selectedDay)}
                />

                <IconCalendar
                  className="sw-absolute sw-top-1/2 sw-left-2 -sw-translate-y-1/2"
                  color="echoes-color-icon-default"
                />

                {selectedDay !== undefined && showClearButton && (
                  <StyledInteractiveIcon
                    Icon={CloseIcon}
                    aria-label={clearButtonLabel}
                    onClick={this.handleResetClick}
                    size="small"
                  />
                )}
              </span>
            </Popup>
          </EscKeydownHandler>
        </FocusOutHandler>
      </OutsideClickHandler>
    );
  }
}

const StyledInputField = styled(InputField)`
  ${tw`sw-pl-8`};
  ${tw`sw-cursor-pointer`};
  ${tw`sw-w-full`};

  &.is-filled {
    ${tw`sw-pr-8`};
  }
`;

const StyledInteractiveIcon = styled(InteractiveIcon)`
  ${tw`sw-absolute`};
  ${tw`sw-top-1/2 -sw-translate-y-1/2 sw-right-1`};
`;

const DayPicker = styled(OriginalDayPicker)`
  margin: 0;

  .rdp-month {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .rdp-month_grid {
    margin: 0 0.5rem;
  }

  .rdp-weekday {
    color: ${cssVar('color-text-subtle')};
    opacity: 1;
    text-transform: none;
  }

  .rdp-day {
    height: 28px;
    width: 33px;
    color: ${themeContrast('datePickerDefault')};
    opacity: 1;
  }

  .rdp-day_button {
    height: 28px;
    width: 33px;
    border: none;
    border-radius: 0;
  }

  /* Default modifiers */

  .rdp-disabled .rdp-day_button {
    cursor: not-allowed;
    background: ${themeColor('datePickerDisabled')};
    color: ${cssVar('color-text-subtle')};
  }

  .rdp-day:hover:not(.rdp-outside):not(.rdp-disabled):not(.rdp-selected) .rdp-day_button {
    background: ${themeColor('datePickerHover')};
    color: ${themeContrast('datePickerHover')};
  }

  .rdp-today:not(.rdp-selected) .rdp-day_button {
    font-weight: bold;
  }

  .rdp-day_button:focus-visible {
    outline: ${cssVar('color-focus-default')} solid ${cssVar('focus-border-width-default')};
    z-index: 1;
  }

  .rdp-highlighted:not(.rdp-selected) .rdp-day_button {
    background: ${themeColor('datePickerRange')};
    color: ${themeContrast('datePickerRange')};
  }

  .rdp-selected {
    font-size: inherit;
    font-weight: inherit;
  }

  .rdp-selected .rdp-day_button,
  .rdp-selected:focus-visible .rdp-day_button {
    background: ${themeColor('datePickerSelected')};
    border-radius: 0;
    color: ${themeContrast('datePickerSelected')};
    border: none;
  }
`;
