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
  Button,
  ButtonGroup,
  Card,
  CardSize,
  cssVar,
  Heading,
  HeadingSize,
  Text,
} from '@sonarsource/echoes-react';
import { useCallback, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useLocation } from 'react-router-dom';
import { useFlags } from '~adapters/helpers/feature-flags';
import { BetaBadge } from '~shared/components/badges/BetaBadge';
import useLocalStorage from '~shared/helpers/useLocalStorage';
import { NewSidebarIllustration } from './NewSidebarIllustration';

export const NEW_NAVIGATION_PROMOTION_DISMISSED_KEY =
  'sonarqube.dismissed_new_navigation_promotion';
const ACCOUNT_APPEARANCE_PAGE = '/account/appearance';

export function NewNavigationPromotionNotification() {
  const { frontEndEngineeringEnableSidebarNavigation } = useFlags();
  const intl = useIntl();
  const location = useLocation();

  const [isDismissedPermanently, setIsDismissedPermanently] = useLocalStorage(
    NEW_NAVIGATION_PROMOTION_DISMISSED_KEY,
    false,
  );

  const [isDismissedTemporarily, setIsDismissedTemporarily] = useState(false);

  const onDismiss = useCallback(() => {
    setIsDismissedPermanently(true);
  }, [setIsDismissedPermanently]);

  const onGoToAppearance = useCallback(() => {
    setIsDismissedTemporarily(true);
  }, []);

  if (
    !frontEndEngineeringEnableSidebarNavigation ||
    isDismissedPermanently ||
    isDismissedTemporarily ||
    location.pathname === ACCOUNT_APPEARANCE_PAGE
  ) {
    return undefined;
  }

  return (
    <CardWrapper className="sw-z-global-popup" size={CardSize.Small}>
      <Card.Body className="sw-px-5 sw-py-6" insetContent>
        <div className="sw-flex sw-gap-3 sw-items-center sw-mb-2">
          <Heading as="h3" size={HeadingSize.Medium}>
            {intl.formatMessage({ id: 'promotion.new_navigation.title' })}
          </Heading>

          <BetaBadge />
        </div>

        <Text as="p" isSubtle>
          {intl.formatMessage({ id: 'promotion.new_navigation.content' })}
        </Text>

        <div className="sw-flex sw-justify-center sw-mb-6 sw-mt-4">
          <NewSidebarIllustration />
        </div>

        <ButtonGroup>
          <Button onClick={onDismiss} variety="primary">
            <FormattedMessage id="promotion.new_navigation.got_it" />
          </Button>

          <Button onClick={onGoToAppearance} to={ACCOUNT_APPEARANCE_PAGE}>
            <FormattedMessage id="promotion.new_navigation.go_to_appearance" />
          </Button>
        </ButtonGroup>
      </Card.Body>
    </CardWrapper>
  );
}

const CardWrapper = styled(Card)`
  bottom: ${cssVar('dimension-space-400')};
  box-shadow: ${cssVar('box-shadow-large')};
  height: auto;
  min-width: 300px;
  position: fixed;
  right: ${cssVar('dimension-space-400')};
  width: 300px;
`;
