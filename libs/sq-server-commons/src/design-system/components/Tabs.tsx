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
import { Badge, cssVar, EchoesCSSVarString } from '@sonarsource/echoes-react';
import { PropsWithChildren } from 'react';
import { FormattedMessage } from 'react-intl';
import { BareButton } from '../sonar-aligned/components/buttons';
import { getTabId, getTabPanelId } from '../sonar-aligned/helpers/tabs';

type TabValueType = string | number | boolean;

export interface TabOption<T extends TabValueType> {
  counter?: number;
  disabled?: boolean;
  label: string | React.ReactNode;
  value: T;
}

export interface TabsProps<T extends TabValueType> {
  borderColor?: EchoesCSSVarString;
  className?: string;
  disabled?: boolean;
  label?: string;
  large?: boolean;
  onChange: (value: T) => void;
  options: ReadonlyArray<TabOption<T>>;
  value?: T;
}

export function Tabs<T extends TabValueType>(props: PropsWithChildren<TabsProps<T>>) {
  const {
    disabled = false,
    label,
    options,
    value,
    className,
    children,
    large = false,
    borderColor = cssVar('color-border-weak'),
  } = props;

  return (
    <TabsContainer borderColor={borderColor} className={className} large={large}>
      <TabList aria-label={label} role="tablist">
        {options.map((option) => (
          <TabButton
            aria-controls={getTabPanelId(String(option.value))}
            aria-current={option.value === value}
            aria-selected={option.value === value}
            borderColor={borderColor}
            data-value={option.value}
            disabled={disabled || option.disabled}
            id={getTabId(String(option.value))}
            key={option.value.toString()}
            large={large}
            onClick={() => {
              if (option.value !== value) {
                props.onChange(option.value);
              }
            }}
            role="tab"
            selected={option.value === value}
          >
            {option.label}
            {option.counter ? (
              <Badge className="sw-ml-2" variety="danger">
                <FormattedMessage id="overview.failed.badge" values={{ counter: option.counter }} />
              </Badge>
            ) : null}
          </TabButton>
        ))}
      </TabList>
      <RightSection>{children}</RightSection>
    </TabsContainer>
  );
}

const TabsContainer = styled.div<{
  borderColor: EchoesCSSVarString;
  large: boolean;
}>`
  width: 100%;
  ${(props) =>
    !props.large && {
      paddingLeft: '1rem',
    }}
  display: flex;
  justify-content: space-between;
  border-bottom: ${cssVar('border-width-default')} solid ${(props) => props.borderColor};
`;

const TabList = styled.div`
  display: inline-flex;
`;

const TabButton = styled(BareButton)<{
  borderColor: EchoesCSSVarString;
  large: boolean;
  selected: boolean;
}>`
  position: relative;
  margin-bottom: -1px;
  display: flex;
  align-items: center;
  ${(props) =>
    props.large
      ? {
          paddingLeft: '1.5rem',
          paddingRight: '1.5rem',
          paddingTop: '1rem',
          paddingBottom: '1rem',
          font: cssVar('typography-text-large-regular'),
        }
      : {
          paddingLeft: '0.75rem',
          paddingRight: '0.75rem',
          paddingTop: '0.25rem',
          paddingBottom: '0.25rem',
          font: cssVar('typography-text-default-regular'),
        }}
  font-weight: ${cssVar('font-weight-semi-bold')};
  border-top-left-radius: ${cssVar('border-radius-200', '0.25rem')};
  border-top-right-radius: ${cssVar('border-radius-200', '0.25rem')};

  height: 34px;
  background: ${(props) => (props.selected ? cssVar('color-surface-default') : 'none')};
  color: ${(props) =>
    props.selected ? cssVar('color-text-accent') : cssVar('color-text-default')};
  border: ${(props) =>
    props.selected
      ? `${cssVar('border-width-default')} solid ${props.borderColor}`
      : `${cssVar('border-width-default')} solid ${cssVar('color-border-none')}`};
  border-bottom: ${(props) =>
    props.selected
      ? `${cssVar('border-width-default')} solid ${cssVar('color-surface-default')}`
      : `${cssVar('border-width-default')} solid ${props.borderColor}`};

  &:hover {
    background: ${(props) =>
      props.selected ? cssVar('color-surface-default') : cssVar('color-surface-hover')};
  }

  &:focus-visible {
    background: ${(props) =>
      props.selected ? cssVar('color-surface-default') : cssVar('color-surface-hover')};
    outline: ${cssVar('focus-border-width-default')} solid ${cssVar('color-focus-default')};
    z-index: 1;
  }

  &:active {
    outline: ${cssVar('focus-border-width-default')} solid ${cssVar('color-focus-default')};
    z-index: 1;
  }

  // Active line
  &::after {
    content: '';
    position: absolute;
    border-top-left-radius: ${cssVar('border-radius-200', '0.25rem')};
    border-top-right-radius: ${cssVar('border-radius-200', '0.25rem')};
    top: 0;
    left: 0;
    width: calc(100%);
    height: 2px;
    background: ${(props) => (props.selected ? cssVar('color-text-accent') : 'none')};
  }
`;

const RightSection = styled.div`
  max-height: 43px;
  display: flex;
  align-items: center;
`;
