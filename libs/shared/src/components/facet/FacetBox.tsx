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

import styled from '@emotion/styled';
import {
  BadgeCounter,
  Button,
  ButtonIcon,
  ButtonSize,
  ButtonVariety,
  IconX,
  Tooltip as SCTooltip,
  Spinner,
  Text,
} from '@sonarsource/echoes-react';
import classNames from 'classnames';
import { uniqueId } from 'lodash';
import * as React from 'react';
import { useIntl } from 'react-intl';
import tw from 'twin.macro';
import { OpenCloseIndicator } from '../OpenCloseIndicator';

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

/**
 * This version of FacetBox is taken from SQS design-system.
 * It is a drop-in replacement.
 * SQC splits this functionality between FacetBox and FacetHeader.
 */
export function FacetBox(props: Readonly<FacetBoxProps>) {
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
        <div className="sw-flex sw-items-center">
          <TitleWithHelp>
            <ChevronAndTitle
              aria-controls={`${id}-panel`}
              aria-disabled={!expandable}
              aria-expanded={open}
              aria-label={ariaLabel ?? name}
              className="sw-pl-0"
              expandable={expandable}
              id={`${id}-header`}
              onClick={() => {
                if (!disabled) {
                  onClick?.(!open);
                }
              }}
              prefix={expandable && <OpenCloseIndicator aria-hidden open={open} />}
              variety={ButtonVariety.DefaultGhost}
            >
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
                    <Text as="div" isSubdued>
                      {secondLine}
                    </Text>
                  )}
                </div>
              )}
            </ChevronAndTitle>
          </TitleWithHelp>
          {help && <span className="sw-ml-1">{help}</span>}
        </div>

        {<Spinner isLoading={loading} />}

        {counter > 0 && (
          <BadgeAndIcons>
            <BadgeCounter aria-label={countLabel} className="sw-px-2" value={counter} />

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
        <fieldset aria-labelledby={`${id}-header`} id={`${id}-panel`}>
          {children}
        </fieldset>
      )}
    </Accordion>
  );
}

FacetBox.displayName = 'FacetBox'; // so that tests don't see the obfuscated production name

const Accordion = styled.div<{
  hasEmbeddedFacets?: boolean;
  inner?: boolean;
}>`
  ${tw`sw-flex-col`};
  ${tw`sw-flex`};
  ${tw`sw-gap-3`};

  ${({ hasEmbeddedFacets }) => (hasEmbeddedFacets ? tw`sw-gap-0` : '')};

  ${({ inner }) => (inner ? tw`sw-gap-1 sw-ml-3 sw-mt-1` : '')};
`;

const BadgeAndIcons = styled.div`
  ${tw`sw-flex`};
  ${tw`sw-items-center`};
  ${tw`sw-gap-2`};
`;

const TitleWithHelp = styled.div`
  ${tw`sw-flex`};
  ${tw`sw-items-center`};
`;

const ChevronAndTitle = styled(Button)<{
  expandable?: boolean;
}>`
  ${tw`sw-flex`};
  ${tw`sw-gap-1`};
  ${tw`sw-h-9`};
  ${tw`sw-items-center`};

  cursor: ${({ expandable }) => (expandable ? 'pointer' : 'default')};

  &:focus-visible {
    background: transparent;
    outline: var(--echoes-focus-border-width-default) solid var(--echoes-color-focus-default);
    outline-offset: 4px;
    border-radius: var(--echoes-border-radius-200);
  }
`;

const Header = styled.div`
  ${tw`sw-flex`};
  ${tw`sw-gap-3`};
  ${tw`sw-items-center`};
  ${tw`sw-justify-between`};
`;

const HeaderTitle = styled.span<{
  disabled?: boolean;
}>`
  ${tw`sw-typo-semibold`};

  color: ${({ disabled }) =>
    disabled ? 'var(--echoes-color-text-disabled)' : 'var(--echoes-color-text-default)'};

  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'inherit')};
`;
