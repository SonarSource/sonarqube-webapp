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
import { Button, Spinner, cssVar } from '@sonarsource/echoes-react';
import classNames from 'classnames';
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { numberFormatter } from '../../helpers/measures';

export interface ListFooterProps {
  canFetchMore?: boolean;
  className?: string;
  count: number;
  loadMore?: () => void;
  loadMoreAriaLabel?: string;
  loading?: boolean;
  messageKey?: string;
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
    messageKey = 'x_of_y_shown',
    needReload,
    pageSize,
    ready = true,
    total,
  } = props;
  const { formatMessage } = useIntl();

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
        className="sw-ml-2 sw-typo-default"
        data-test="reload"
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
        className="sw-ml-2 sw-typo-default"
        data-test="show-more"
        isDisabled={loading}
        onClick={onLoadMore}
      >
        <FormattedMessage id="show_more" />
      </Button>
    );
  }

  return (
    <StyledDiv
      as="footer"
      className={classNames(
        'list-footer', // .list-footer is only used by Selenium tests; we should find a way to remove it.
        'sw-typo-default sw-flex sw-items-center sw-justify-center',
        { 'sw-opacity-50 sw-duration-500 sw-ease-in-out': !ready },
        className,
      )}
      ref={rootNode}
      tabIndex={-1}
    >
      <output aria-busy={loading}>
        {total !== undefined
          ? formatMessage(
              { id: messageKey },
              { '0': numberFormatter(count), '1': numberFormatter(total) },
            )
          : formatMessage({ id: 'x_show' }, { '0': numberFormatter(count) })}
      </output>
      {button}
      <Spinner className="sw-ml-2" isLoading={loading} />
    </StyledDiv>
  );
}

const StyledDiv = styled.div`
  color: ${cssVar('color-text-subtle')};

  margin-top: 1rem /* 16px */;
`;
