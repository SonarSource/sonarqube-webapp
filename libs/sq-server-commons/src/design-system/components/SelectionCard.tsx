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
import type * as Echoes from '@sonarsource/echoes-react';
import { Text, cssVar } from '@sonarsource/echoes-react';
import classNames from 'classnames';
import { useIntl } from 'react-intl';
import { RecommendedIcon } from './icons/RecommendedIcon';
import { RadioButtonStyled } from './input/RadioButton';

export interface SelectionCardProps {
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: VoidFunction;
  recommended?: boolean;
  recommendedReason?: string;
  selected?: boolean;
  title: string;
  titleInfo?: React.ReactNode;
  vertical?: boolean;
}

/**
 * @deprecated Use {@link Echoes.SelectionCards | SelectionCards} from Echoes instead.
 */
export function SelectionCard(props: Readonly<SelectionCardProps>) {
  const {
    children,
    className,
    disabled,
    onClick,
    recommended,
    recommendedReason,
    selected = false,
    title,
    titleInfo,
    vertical = false,
  } = props;
  const isActionable = Boolean(onClick);

  const intl = useIntl();

  return (
    <StyledButton
      aria-checked={selected}
      aria-disabled={disabled}
      className={classNames(
        'js-radio-card',
        {
          'card-actionable': isActionable && !disabled,
          'card-vertical': vertical,
          disabled,
          selected,
        },
        className,
      )}
      onClick={isActionable && !disabled && !selected ? onClick : undefined}
      role={isActionable ? 'radio' : 'presentation'}
      tabIndex={disabled ? -1 : 0}
      type="button"
    >
      <StyledContent>
        {isActionable && (
          <div className="sw-items-start sw-mt-1/2 sw-mr-2">
            <RadioButtonStyled
              as="i"
              className={classNames({
                'is-checked': selected,
                'is-disabled': disabled,
              })}
            />
          </div>
        )}
        <div>
          <StyledLabel>
            {title}
            <Text isSubtle>{titleInfo}</Text>
          </StyledLabel>
          <StyledBody>{children}</StyledBody>
        </div>
      </StyledContent>
      {recommended && (
        <StyledRecommended>
          <StyledRecommendedIcon className="sw-mr-1" />
          <span className="sw-align-middle">
            <strong>{intl.formatMessage({ id: 'recommended' })}</strong> {recommendedReason}
          </span>
        </StyledRecommended>
      )}
    </StyledButton>
  );
}

const StyledButton = styled.button`
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: ${cssVar('border-radius-400', '0.5rem')};
  box-sizing: border-box;

  background-color: ${cssVar('color-surface-default')};
  border: ${cssVar('border-width-default')} solid ${cssVar('color-border-weak')};
  color: inherit;

  &:focus {
    outline: 4px solid ${cssVar('color-border-accent-default')};
    box-shadow: ${cssVar('box-shadow-small')};
  }

  &.card-vertical {
    width: 100%;
    min-height: auto;
  }

  &.card-actionable {
    cursor: pointer;

    &:hover {
      border: ${cssVar('border-width-default')} solid ${cssVar('color-border-accent-default')};
      box-shadow: ${cssVar('box-shadow-small')};
    }

    &.selected {
      border: ${cssVar('border-width-default')} solid ${cssVar('color-border-accent-default')};
    }
  }

  &.disabled {
    cursor: not-allowed;

    background-color: ${cssVar('color-surface-disabled')};
    color: ${cssVar('color-text-disabled')};
    border: ${cssVar('border-width-default')} solid ${cssVar('color-border-disabled')};
  }
`;

const StyledContent = styled.div`
  margin-left: ${cssVar('dimension-space-150', '0.75rem')};
  margin-right: ${cssVar('dimension-space-150', '0.75rem')};
  margin-top: ${cssVar('dimension-space-200', '1rem')};
  margin-bottom: ${cssVar('dimension-space-200', '1rem')};
  display: flex;
  flex-grow: 1;
  text-align: left;
`;

const StyledRecommended = styled.div`
  font: ${cssVar('typography-text-default-regular')};
  padding-left: ${cssVar('dimension-space-200', '1rem')};
  padding-right: ${cssVar('dimension-space-200', '1rem')};
  padding-top: ${cssVar('dimension-space-100', '0.5rem')};
  padding-bottom: ${cssVar('dimension-space-100', '0.5rem')};
  box-sizing: border-box;
  border-bottom-right-radius: ${cssVar('border-radius-400', '0.5rem')};
  border-bottom-left-radius: ${cssVar('border-radius-400', '0.5rem')};
  width: 100%;
  text-align: left;

  color: ${cssVar('color-text-info')};
  background-color: ${cssVar('color-background-info-weak-default')};
`;

const StyledRecommendedIcon = styled(RecommendedIcon)`
  color: ${cssVar('color-icon-info')};
  vertical-align: middle;
`;

const StyledLabel = styled.label`
  display: flex;
  margin-bottom: ${cssVar('dimension-space-150', '0.75rem')};
  gap: ${cssVar('dimension-space-100', '0.5rem')};
  font: ${cssVar('typography-text-default-semi-bold')};

  color: ${cssVar('color-text-default')};
  cursor: inherit;

  .disabled & {
    color: ${cssVar('color-text-disabled')};
  }
`;

const StyledBody = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  justify-content: space-between;
`;
