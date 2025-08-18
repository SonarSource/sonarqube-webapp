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
import { Text } from '@sonarsource/echoes-react';
import classNames from 'classnames';
import { ClockIcon, ItemLink, StarFillIcon, themeColor, themeContrast } from '~design-system';
import { SafeHTMLInjection } from '~shared/helpers/sanitize';
import { translate } from '~sq-server-commons/helpers/l10n';
import { getComponentOverviewUrl } from '~sq-server-commons/helpers/urls';
import { ComponentResult } from './utils';

interface Props {
  component: ComponentResult;
  innerRef: (componentKey: string, node: HTMLElement | null) => void;
  onClose: () => void;
  selected: boolean;
}
export function GlobalSearchResult(props: Readonly<Props>) {
  const { component, innerRef, onClose, selected } = props;

  return (
    <ItemLink
      className={classNames('sw-flex sw-flex-col sw-items-start sw-space-y-1', {
        active: selected,
      })}
      innerRef={(node: HTMLAnchorElement | null) => {
        innerRef(component.key, node);
      }}
      key={component.key}
      onClick={onClose}
      to={getComponentOverviewUrl(component.key, component.qualifier)}
    >
      <div className="sw-flex sw-justify-between sw-items-center sw-w-full">
        <SearchedText match={component.match} name={component.name} />
        <div className="sw-ml-2">
          {component.isFavorite && <StarFillIcon />}
          {!component.isFavorite && component.isRecentlyBrowsed && (
            <ClockIcon aria-label={translate('recently_browsed')} />
          )}
        </div>
      </div>
      <Text isSubtle>{component.key}</Text>
    </ItemLink>
  );
}

interface SearchedTextProps {
  match?: string;
  name: string;
}

function SearchedText({ match, name }: SearchedTextProps) {
  return match ? (
    <SafeHTMLInjection htmlAsString={match}>
      <StyledText className="sw-truncate" isHighlighted />
    </SafeHTMLInjection>
  ) : (
    <Text className="sw-truncate" isHighlighted>
      {name}
    </Text>
  );
}

const StyledText = styled(Text)`
  mark {
    display: inline-block;

    background: ${themeColor('searchHighlight')};
    color: ${themeContrast('searchHighlight')};
  }
`;
