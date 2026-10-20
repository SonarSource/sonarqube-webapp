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
import {
  ButtonIcon,
  ButtonSize,
  ButtonVariety,
  cssVar,
  IconX,
  Spinner,
  Text,
} from '@sonarsource/echoes-react';
import classNames from 'classnames';
import { uniqueId } from 'lodash';
import * as React from 'react';
import { useIntl } from 'react-intl';
import { BareButton } from '../sonar-aligned/components/buttons';
import { Badge } from './Badge';
import { Tooltip as SCTooltip } from './Tooltip';
import { OpenCloseIndicator } from './icons';

export interface FacetBoxProps {
  ariaLabel?: string;
  children: React.ReactNode;
  className?: string;
  clearIconLabel?: string;
  count?: number;
  countLabel?: string;
  'data-property'?: string;
  disabled?: boolean;
  disabledHelper?: string;
  hasEmbeddedFacets?: boolean;
  help?: React.ReactNode;
  id?: string;
  inner?: boolean;
  loading?: boolean;
  name: string;
  onClear?: () => void;
  onClick?: (isOpen: boolean) => void;
  open?: boolean;
  secondLine?: string;
  tooltipComponent?: React.ComponentType<React.PropsWithChildren<{ content: React.ReactNode }>>;
}

export function FacetBox(props: FacetBoxProps) {
  const {
    ariaLabel,
    children,
    className,
    clearIconLabel,
    count,
    countLabel,
    'data-property': dataProperty,
    disabled = false,
    disabledHelper,
    secondLine,
    hasEmbeddedFacets = false,
    help,
    id: idProp,
    inner = false,
    loading = false,
    name,
    onClear,
    onClick,
    open = false,
    tooltipComponent,
  } = props;
  const intl = useIntl();

  const clearable = !disabled && Boolean(onClear) && count !== undefined && count > 0;
  const counter = count ?? 0;
  const expandable = !disabled && Boolean(onClick);
  const id = React.useMemo(() => idProp ?? uniqueId('filter-facet-'), [idProp]);
  const Tooltip = tooltipComponent ?? SCTooltip;

  return (
    <Accordion
      className={classNames(className, { open })}
      data-property={dataProperty}
      hasEmbeddedFacets={hasEmbeddedFacets}
      inner={inner}
    >
      <Header>
        <div className="sw:flex sw:items-center">
          <TitleWithHelp>
            <ChevronAndTitle
              aria-controls={`${id}-panel`}
              aria-disabled={!expandable}
              aria-expanded={open}
              aria-label={ariaLabel ?? name}
              expandable={expandable}
              id={`${id}-header`}
              onClick={() => {
                if (!disabled) {
                  onClick?.(!open);
                }
              }}
            >
              {expandable && <OpenCloseIndicator aria-hidden open={open} />}

              {disabled ? (
                <Tooltip content={disabledHelper}>
                  <HeaderTitle
                    aria-disabled
                    aria-label={`${name}, ${disabledHelper ?? ''}`}
                    disabled={disabled}
                  >
                    {name}
                  </HeaderTitle>
                </Tooltip>
              ) : (
                <div>
                  <HeaderTitle>{name}</HeaderTitle>
                  {secondLine !== undefined && (
                    <Text as="div" isSubtle>
                      {secondLine}
                    </Text>
                  )}
                </div>
              )}
            </ChevronAndTitle>
          </TitleWithHelp>
          {help && <span className="sw:flex sw:ml-1">{help}</span>}
        </div>

        {<Spinner isLoading={loading} />}

        {counter > 0 && (
          <BadgeAndIcons>
            <Badge className="sw:px-2" title={countLabel} variant="counter">
              {counter}
            </Badge>

            {Boolean(clearable) && (
              <Tooltip content={clearIconLabel}>
                <ButtonIcon
                  Icon={IconX}
                  ariaLabel={
                    clearIconLabel ?? intl.formatMessage({ id: 'clear_x_filter' }, { '0': name })
                  }
                  data-testid={`clear-${name}`}
                  onClick={onClear}
                  size={ButtonSize.Medium}
                  variety={ButtonVariety.DefaultGhost}
                />
              </Tooltip>
            )}
          </BadgeAndIcons>
        )}
      </Header>

      {open && (
        <div aria-labelledby={`${id}-header`} id={`${id}-panel`} role="group">
          {children}
        </div>
      )}
    </Accordion>
  );
}

FacetBox.displayName = 'FacetBox'; // so that tests don't see the obfuscated production name

const Accordion = styled.div<{
  hasEmbeddedFacets?: boolean;
  inner?: boolean;
}>`
  flex-direction: column;
  display: flex;
  gap: ${cssVar('dimension-space-150', '0.75rem')};

  ${({ hasEmbeddedFacets }) => (hasEmbeddedFacets ? 'gap: 0;' : '')};

  ${({ inner }) =>
    inner
      ? `
          margin-left: 0.75rem;
          margin-top: 0.25rem;
          gap: 0.25rem;
        `
      : ''};
`;

const BadgeAndIcons = styled.div`
  display: flex;
  align-items: center;
  gap: ${cssVar('dimension-space-100', '0.5rem')};
`;

const TitleWithHelp = styled.div`
  display: flex;
  align-items: center;
`;

const ChevronAndTitle = styled(BareButton)<{
  expandable?: boolean;
}>`
  display: flex;
  gap: ${cssVar('dimension-space-50', '0.25rem')};
  height: ${cssVar('dimension-height-900', '2.25rem')};
  align-items: center;

  cursor: ${({ expandable }) => (expandable ? 'pointer' : 'default')};

  &:focus-visible {
    background: transparent;
    outline: ${cssVar('focus-border-width-default')} solid ${cssVar('color-focus-default')};
    outline-offset: 4px;
    border-radius: ${cssVar('border-radius-200')};
  }
`;

const Header = styled.div`
  display: flex;
  gap: ${cssVar('dimension-space-150', '0.75rem')};
  align-items: center;
  justify-content: space-between;
`;

const HeaderTitle = styled.span<{
  disabled?: boolean;
}>`
  font: ${cssVar('typography-text-default-semi-bold')};

  color: ${({ disabled }) =>
    disabled ? cssVar('color-text-disabled') : cssVar('color-text-default')};

  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'inherit')};
`;
