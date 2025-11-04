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

import {
  Button,
  ButtonVariety,
  PromotedSection,
  PromotedSectionVariety,
  Text,
} from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { useAppState } from '../../context/app-state/withAppStateContext';
import { SonarSourceLink } from '../../helpers/doc-links';
import { getSonarSourceComUrl } from '../../helpers/urls';
import useLocalStorage from '../../hooks/useLocalStorage';
import { EditionKey } from '../../types/editions';
import { LockIllustration } from '../illustrations/LockIllustration';

interface SecurityDevEditionPromoteBannerProps {
  className?: string;
  isWide?: boolean;
}

const SECURITY_DEV_EDITION_PROMOTION_KEY = 'security_dev_edition_promotion';

export function SecurityDevEditionPromoteBanner({
  isWide,
  className,
}: Readonly<SecurityDevEditionPromoteBannerProps>) {
  const { edition } = useAppState();
  const [showPromotion, setShowPromotion] = useLocalStorage(
    SECURITY_DEV_EDITION_PROMOTION_KEY,
    true,
  );

  if (!showPromotion || edition !== EditionKey.community) {
    return null;
  }

  return (
    <PromotedSection
      actions={
        <Button
          enableOpenInNewTab
          to={getSonarSourceComUrl(SonarSourceLink.Downloads)}
          variety={ButtonVariety.Default}
        >
          <FormattedMessage id="promotion.security_dev_edition.action" />
        </Button>
      }
      className={className}
      headerText={<FormattedMessage id="promotion.security_dev_edition.title" />}
      illustration={isWide ? <LockIllustration /> : null}
      onDismiss={() => {
        setShowPromotion(false);
      }}
      text={
        <FormattedMessage
          id="promotion.security_dev_edition.text"
          values={{ b: (text) => <Text isHighlighted>{text}</Text> }}
        />
      }
      variety={PromotedSectionVariety.Highlight}
    />
  );
}
