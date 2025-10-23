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
  Badge,
  BadgeCounter,
  BadgeVariety,
  Button,
  cssVar,
  Divider,
  Heading,
  IconBell,
  Layout,
  Link,
  MessageCallout,
  Modal,
  Spinner,
  Text,
} from '@sonarsource/echoes-react';
import { isEmpty } from 'lodash';
import { useCallback, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useBeamerContextData } from '~adapters/helpers/vendorConfig';
import DateFormatter from '~shared/components/intl/DateFormatter';
import { HtmlFormatter } from '~shared/components/typography/HtmlFormatter';
import { SafeHTMLInjection, SanitizeLevel } from '~shared/helpers/sanitize';
import { isDefined, isStringDefined } from '~shared/helpers/types';
import {
  useBeamerNewsListQuery,
  useBeamerUnreadCountQuery,
  useMarkUnreadPostsMutation,
} from '../../queries/beamer';
import { useCurrentUserDetailsQuery } from '../../queries/users';

interface Props {
  hideCounter?: boolean;
}

const badgeVarietyForCategory: Record<string, BadgeVariety> = {
  new: BadgeVariety.Info,
};

export function BeamerWidgetCustom({ hideCounter = true }: Readonly<Props>) {
  const intl = useIntl();

  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Fetch the current user's uuid
  const { data: userData } = useCurrentUserDetailsQuery();
  const userId = userData?.id;

  const filter = useBeamerContextData();

  const { data: unreadCountData } = useBeamerUnreadCountQuery(
    { filter: filter!, userId: userId! },
    { enabled: isStringDefined(filter) && isStringDefined(userId) },
  );

  const {
    data: newsListData,
    isLoading: isNewsListLoading,
    isError: newsListError,
    refetch: refetchNewsList,
    fetchNextPage: fetchNextPageOfNews,
    hasNextPage: hasNextPageOfNews,
    isFetching: isFetchingNews,
  } = useBeamerNewsListQuery(
    { filter: filter!, userId: userId! },
    { enabled: isStringDefined(filter) && isPanelOpen && isStringDefined(userId) },
  );

  // Flatten the infinite query data
  const flattenedNewsData = useMemo(() => newsListData?.pages.flat() ?? [], [newsListData]);

  const { mutate: markUnreadPostsAsRead } = useMarkUnreadPostsMutation({
    filter: filter!,
    userId: userId!,
  });

  const handleOnClick = useCallback(async () => {
    setIsPanelOpen(true);
    await refetchNewsList();
    markUnreadPostsAsRead();
  }, [markUnreadPostsAsRead, refetchNewsList]);

  if (!userData) {
    return null;
  }

  const unreadCount = unreadCountData?.count ?? 0;

  return (
    <div className="sw-relative">
      <NewsPanel
        content={
          <div>
            <Divider />
            <div className="sw-flex sw-justify-center">
              <Spinner className="sw-mt-4" isLoading={isNewsListLoading} />
            </div>

            {newsListError && (
              <MessageCallout className="sw-m-2" variety="danger">
                <FormattedMessage id="beamer.news.error" />
              </MessageCallout>
            )}

            {flattenedNewsData
              ?.filter((newsItem) => isDefined(newsItem.translations[0]))
              .map((newsItem) => (
                <NewsItem key={newsItem.id}>
                  <div className="sw-flex sw-justify-between">
                    <div className="sw-flex sw-flex-wrap sw-gap-4">
                      {newsItem.category.split(';').map((category) => (
                        <Badge
                          key={category}
                          size="medium"
                          variety={badgeVarietyForCategory[category] ?? 'neutral'}
                        >
                          {category}
                        </Badge>
                      ))}
                    </div>
                    <Text className="sw-text-nowrap sw-ml-2">
                      <DateFormatter date={newsItem.date} long />
                    </Text>
                  </div>

                  <Heading as="h3" className="sw-my-4">
                    {newsItem.translations[0].title}
                  </Heading>

                  <HtmlFormatter>
                    <SafeHTMLInjection
                      htmlAsString={newsItem.translations[0].contentHtml}
                      sanitizeLevel={SanitizeLevel.USER_INPUT}
                    />
                  </HtmlFormatter>

                  {isStringDefined(newsItem.translations[0].linkUrl) && (
                    <div className="sw-mt-8">
                      <Link enableOpenInNewTab to={newsItem.translations[0].linkUrl}>
                        {newsItem.translations[0].linkText ?? newsItem.translations[0].linkUrl}
                      </Link>
                    </div>
                  )}
                </NewsItem>
              ))}

            {isEmpty(flattenedNewsData) && (
              <div className="sw-p-5 sw-text-center">
                <Text>
                  <FormattedMessage id="beamer.news.no_news" />
                </Text>
              </div>
            )}

            {hasNextPageOfNews && (
              <div className="sw-flex sw-justify-center">
                <Button
                  isDisabled={isFetchingNews}
                  isLoading={isFetchingNews}
                  onClick={() => fetchNextPageOfNews()}
                  size="medium"
                >
                  <FormattedMessage id="load_more" />
                </Button>
              </div>
            )}
          </div>
        }
        title={<FormattedMessage id="beamer.panel.title" />}
      >
        <Layout.GlobalNavigation.Action
          Icon={IconBell}
          ariaLabel={intl.formatMessage({ id: 'global_nav.news.tooltip' })}
          isIconFilled
          onClick={handleOnClick}
          size="medium"
          variety="default-ghost"
        />
      </NewsPanel>
      {!hideCounter && unreadCount > 0 && <UnreadBadge value={unreadCount} />}
    </div>
  );
}

const UnreadBadge = styled(BadgeCounter)`
  position: absolute;
  top: 0px;
  right: 0px;
  background: ${cssVar('color-background-accent-default')};
  color: ${cssVar('color-text-on-color')};
`;

const NewsPanel = styled(Modal)`
  // reset Modal styles
  transform: unset;
  left: unset;
  max-height: unset;
  border-radius: 0;
  box-shadow: none;

  // Place correctly
  top: 0;
  bottom: 0;
  right: 0;
  width: 400px;
  background: ${cssVar('color-surface-default')};
  border-left: 1px solid ${cssVar('color-border-bold')};
`;

const NewsItem = styled.div`
  padding: ${cssVar('dimension-space-200')} 0;
  border-bottom: ${cssVar('border-width-default')} solid ${cssVar('color-border-weak')};
  margin-bottom: ${cssVar('dimension-space-300')};
`;
