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
import { Button, IconLinkExternal, Text, Theme, ThemeProvider } from '@sonarsource/echoes-react';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { themeBorder, themeColor } from '~design-system';
import { dismissNotice } from '~sq-server-commons/api/users';
import { SonarQubeIDEPromotionIllustration } from '~sq-server-commons/components/branding/SonarQubeIDEPromotionIllustration';
import { CurrentUserContextInterface } from '~sq-server-commons/context/current-user/CurrentUserContext';
import withCurrentUserContext from '~sq-server-commons/context/current-user/withCurrentUserContext';
import { translate } from '~sq-server-commons/helpers/l10n';
import { isLoggedIn, NoticeType } from '~sq-server-commons/types/users';

export function PromotionNotification(props: CurrentUserContextInterface) {
  const { currentUser, updateDismissedNotices } = props;

  const onClick = React.useCallback(() => {
    return dismissNotice(NoticeType.SONARLINT_AD)
      .then(() => {
        updateDismissedNotices(NoticeType.SONARLINT_AD, true);
      })
      .catch(() => {
        /* noop */
      });
  }, [updateDismissedNotices]);

  if (!isLoggedIn(currentUser) || currentUser.dismissedNotices[NoticeType.SONARLINT_AD]) {
    return null;
  }

  return (
    <ThemeProvider theme={Theme.dark}>
      <PromotionNotificationWrapper className="it__promotion_notification sw-z-global-popup sw-rounded-1 sw-flex sw-items-center sw-px-4">
        <div className="sw-mr-2">
          <SonarQubeIDEPromotionIllustration />
        </div>
        <PromotionNotificationContent className="sw-flex-1 sw-px-2 sw-py-4">
          <Text isHighlighted>{translate('promotion.sonarlint.title')}</Text>
          <Text as="p" className="sw-mt-2">
            {translate('promotion.sonarlint.content')}
          </Text>
        </PromotionNotificationContent>
        <div className="sw-ml-2 sw-pl-2 sw-flex sw-flex-col sw-items-stretch">
          <Button
            className="sw-mb-4"
            onClick={onClick}
            suffix={<IconLinkExternal />}
            to="https://www.sonarsource.com/products/sonarlint/?referrer=sonarqube-welcome"
            variety="primary"
          >
            <FormattedMessage id="learn_more" />
          </Button>
          <Button className="sw-justify-center" onClick={onClick}>
            <FormattedMessage id="dismiss" />
          </Button>
        </div>
      </PromotionNotificationWrapper>
    </ThemeProvider>
  );
}

export default withCurrentUserContext(PromotionNotification);

const PromotionNotificationWrapper = styled.div`
  position: fixed;
  right: 10px;
  bottom: 10px;
  max-width: 600px;
  box-shadow: 1px 1px 5px 0px black;

  background: ${themeColor('promotionNotificationBackground')};
  color: ${themeColor('promotionNotification')};
`;

const PromotionNotificationContent = styled.div`
  border-right: ${themeBorder('default', 'promotionNotificationSeparator')};
`;
