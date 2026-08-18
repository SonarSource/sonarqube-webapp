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
import { Button, cssVar, Text } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { SonarQubeIDEPromotionIllustration } from '~sq-server-commons/components/branding/SonarQubeIDEPromotionIllustration';
import {
  useDismissNotice,
  useIsNoticeDismissed,
} from '~sq-server-commons/sq-server-adapters/helpers/notices';
import { useCurrentUser } from '~sq-server-commons/sq-server-adapters/helpers/users';
import { NoticeType } from '~sq-server-commons/types/users';

export function SQIDEPromotionNotification() {
  const { isLoggedIn } = useCurrentUser();
  const isDismissed = useIsNoticeDismissed(NoticeType.SONARLINT_AD);
  const { dismissNotice } = useDismissNotice();

  const onClick = () => {
    dismissNotice(NoticeType.SONARLINT_AD);
  };

  if (!isLoggedIn || isDismissed) {
    return null;
  }

  return (
    <PromotionNotificationWrapper className="it__promotion_notification sw-z-global-popup sw-rounded-1 sw-flex sw-items-center sw-px-4">
      <div className="sw-mr-2">
        <SonarQubeIDEPromotionIllustration />
      </div>

      <div className="sw-flex-1 sw-px-2 sw-py-4">
        <Text isHighlighted>
          <FormattedMessage id="promotion.sqide.title" />
        </Text>

        <Text as="p" className="sw-mt-2" isSubtle>
          <FormattedMessage id="promotion.sqide.content" />
        </Text>
      </div>

      <div className="sw-ml-2 sw-pl-2 sw-flex sw-flex-col sw-items-stretch">
        <Button
          className="sw-mb-4"
          enableOpenInNewTab
          onClick={onClick}
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
  );
}

const PromotionNotificationWrapper = styled.div`
  bottom: 10px;
  box-shadow: ${cssVar('box-shadow-medium')};
  max-width: 600px;
  position: fixed;
  right: 10px;
  border: ${cssVar('border-width-default')} solid ${cssVar('color-border-weak')};

  background: ${cssVar('color-surface-default')};
`;
