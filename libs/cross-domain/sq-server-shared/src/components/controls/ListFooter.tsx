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
import { Button, Spinner } from '@sonarsource/echoes-react';
import classNames from 'classnames';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { translateWithParameters } from '../../helpers/l10n';
import { formatMeasure } from '../../sonar-aligned/helpers/measures';
import { MetricType } from '../../sonar-aligned/types/metrics';

export interface ListFooterProps {
  canFetchMore?: boolean;
  className?: string;
  count: number;
  loadMore?: () => void;
  loadMoreAriaLabel?: string;
  loading?: boolean;
  needReload?: boolean;
  pageSize?: number;
  ready?: boolean;
  reload?: () => void;
  total?: number;
}

export default function ListFooter(props: Readonly<ListFooterProps>) {
  const {
    canFetchMore = false,
    className,
    count,
    loadMore,
    loadMoreAriaLabel,
    loading = false,
    needReload,
    pageSize,
    ready = true,
    total,
  } = props;

  const rootNode = React.useRef<HTMLDivElement>(null);

  const onLoadMore = React.useCallback(() => {
    if (loadMore) {
      loadMore();
    }

    if (rootNode.current) {
      rootNode.current.focus();
    }
  }, [loadMore, rootNode]);

  let hasMore = canFetchMore;
  if (total !== undefined) {
    hasMore = total > count;
  } else if (pageSize !== undefined) {
    hasMore = count % pageSize === 0;
  }

  let button;
  if (needReload && props.reload) {
    button = (
      <Button
        data-test="reload"
        className="sw-ml-2 sw-typo-default"
        isDisabled={loading}
        onClick={props.reload}
      >
        <FormattedMessage id="reload" />
      </Button>
    );
  } else if (hasMore && props.loadMore) {
    button = (
      <Button
        aria-label={loadMoreAriaLabel}
        data-test="show-more"
        className="sw-ml-2 sw-typo-default"
        isDisabled={loading}
        onClick={onLoadMore}
      >
        <FormattedMessage id="show_more" />
      </Button>
    );
  }

  return (
    <StyledDiv
      tabIndex={-1}
      ref={rootNode}
      className={classNames(
        'list-footer', // .list-footer is only used by Selenium tests; we should find a way to remove it.
        'sw-typo-default sw-flex sw-items-center sw-justify-center',
        { 'sw-opacity-50 sw-duration-500 sw-ease-in-out': !ready },
        className,
      )}
    >
      <output aria-busy={loading}>
        {total !== undefined
          ? translateWithParameters(
              'x_of_y_shown',
              formatMeasure(count, MetricType.Integer),
              formatMeasure(total, MetricType.Integer),
            )
          : translateWithParameters(
              'x_show',
              formatMeasure(count, MetricType.Integer),
            )}
      </output>
      {button}
      <Spinner isLoading={loading} className="sw-ml-2" />
    </StyledDiv>
  );
}

const StyledDiv = styled.div`
  color: var(--echoes-color-text-subdued);

  margin-top: 1rem /* 16px */;
`;
