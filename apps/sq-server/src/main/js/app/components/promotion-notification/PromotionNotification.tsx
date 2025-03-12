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
import { Button, Theme, ThemeProvider } from '@sonarsource/echoes-react';
import * as React from 'react';
import { ButtonPrimary, themeBorder, themeColor } from '~design-system';
import { dismissNotice } from '~sq-server-shared/api/users';
import { SonarQubeIDEPromotionIllustration } from '~sq-server-shared/components/branding/SonarQubeIDEPromotionIllustration';
import { CurrentUserContextInterface } from '~sq-server-shared/context/current-user/CurrentUserContext';
import withCurrentUserContext from '~sq-server-shared/context/current-user/withCurrentUserContext';
import { translate } from '~sq-server-shared/helpers/l10n';
import { NoticeType, isLoggedIn } from '~sq-server-shared/types/users';

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
    <PromotionNotificationWrapper className="it__promotion_notification sw-z-global-popup sw-rounded-1 sw-flex sw-items-center sw-px-4">
      <ThemeProvider theme={Theme.dark}>
        <div className="sw-mr-2">
          <SonarQubeIDEPromotionIllustration />
        </div>
      </ThemeProvider>
      <PromotionNotificationContent className="sw-flex-1 sw-px-2 sw-py-4">
        <span className="sw-typo-semibold">{translate('promotion.sonarlint.title')}</span>
        <p className="sw-mt-2">{translate('promotion.sonarlint.content')}</p>
      </PromotionNotificationContent>
      <div className="sw-ml-2 sw-pl-2 sw-flex sw-flex-col sw-items-stretch">
        <ButtonPrimary
          className="sw-mb-4"
          onClick={onClick}
          to="https://www.sonarsource.com/products/sonarlint/?referrer=sonarqube-welcome"
        >
          {translate('learn_more')}
        </ButtonPrimary>
        <Button className="sw-justify-center" onClick={onClick}>
          {translate('dismiss')}
        </Button>
      </div>
    </PromotionNotificationWrapper>
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
