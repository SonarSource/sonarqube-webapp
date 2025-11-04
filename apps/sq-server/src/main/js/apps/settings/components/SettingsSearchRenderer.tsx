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
import { Text, cssVar } from '@sonarsource/echoes-react';
import classNames from 'classnames';
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  DropdownMenu,
  InputSearch,
  LinkBox,
  OutsideClickHandler,
  Popup,
  PopupPlacement,
  themeColor,
} from '~design-system';
import { ExtendedSettingDefinition } from '~shared/types/settings';
import { Component } from '~sq-server-commons/types/types';
import { buildSettingLink, isRealSettingKey } from '../utils';

const SEARCH_INPUT_ID = 'settings-search-input';
export interface SettingsSearchRendererProps {
  component?: Component;
  onClickOutside: () => void;
  onMouseOverResult: (key: string) => void;
  onSearchInputChange: (query: string) => void;
  onSearchInputFocus: () => void;
  onSearchInputKeyDown: (event: React.KeyboardEvent) => void;
  results?: ExtendedSettingDefinition[];
  searchQuery: string;
  selectedResult?: string;
  showResults: boolean;
}

export default function SettingsSearchRenderer(props: Readonly<SettingsSearchRendererProps>) {
  const { component, results, searchQuery, selectedResult, showResults } = props;
  const intl = useIntl();

  const selectedNodeRef = React.useRef<HTMLLIElement>(null);

  React.useEffect(() => {
    selectedNodeRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });

  return (
    <OutsideClickHandler onClickOutside={props.onClickOutside}>
      <Popup
        allowResizing
        overlay={
          showResults && (
            <DropdownMenu
              aria-owns={SEARCH_INPUT_ID}
              className="sw-overflow-y-auto sw-overflow-x-hidden"
              maxHeight="50vh"
              size="auto"
            >
              {results && results.length > 0 ? (
                results.map((r) => (
                  <ResultItem
                    active={selectedResult === r.key}
                    innerRef={selectedResult === r.key ? selectedNodeRef : undefined}
                    key={r.key}
                    onMouseEnter={props.onMouseOverResult}
                    resultKey={r.key}
                  >
                    <LinkBox
                      className="sw-block sw-py-2 sw-px-4"
                      onClick={props.onClickOutside}
                      to={buildSettingLink(r, component)}
                    >
                      <h3 className="sw-typo-semibold">{r.name ?? r.subCategory}</h3>
                      {isRealSettingKey(r.key) && (
                        <Text isSubtle>
                          <FormattedMessage id="settings.key_x" values={{ 0: r.key }} />
                        </Text>
                      )}
                    </LinkBox>
                  </ResultItem>
                ))
              ) : (
                <div className="sw-p-4">
                  <FormattedMessage id="no_results" />
                </div>
              )}
            </DropdownMenu>
          )
        }
        placement={PopupPlacement.BottomLeft}
      >
        <InputSearch
          id={SEARCH_INPUT_ID}
          onChange={props.onSearchInputChange}
          onFocus={props.onSearchInputFocus}
          onKeyDown={props.onSearchInputKeyDown}
          placeholder={intl.formatMessage({ id: 'settings.search.placeholder' })}
          value={searchQuery}
        />
      </Popup>
    </OutsideClickHandler>
  );
}

interface ResultItemProps {
  active: boolean;
  children: React.ReactNode;
  innerRef?: React.Ref<HTMLLIElement>;
  onMouseEnter: (resultKey: string) => void;
  resultKey: string;
}

function ResultItem({
  active,
  onMouseEnter,
  children,
  resultKey,
  innerRef,
}: Readonly<ResultItemProps>) {
  const handleMouseEnter = React.useCallback(() => {
    onMouseEnter(resultKey);
  }, [onMouseEnter, resultKey]);

  return (
    <StyledItem className={classNames({ active })} onMouseEnter={handleMouseEnter} ref={innerRef}>
      {children}
    </StyledItem>
  );
}

const StyledItem = styled.li`
  &:focus,
  &.active {
    background-color: ${themeColor('dropdownMenuHover')};

    h3 {
      color: ${themeColor('linkActive')};
    }

    span {
      color: ${cssVar('color-text-default')};
    }
  }
`;
