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

import { Heading, Label, Link, Text } from '@sonarsource/echoes-react';
import { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
import { Switch } from '~adapters/components/common/Switch';
import { BetaBadge } from '~shared/components/badges/BetaBadge';
import useLocalStorage from '~shared/helpers/useLocalStorage';
import { useEnableSidebarNavigation } from '~sq-server-commons/helpers/useEnableSidebarNavigation';
import { NEW_NAVIGATION_PROMOTION_DISMISSED_KEY } from '../../../app/components/promotion-notification/NewNavigationPromotionNotification';

const SWITCH_ID = 'SIDEBAR_NAVIGATION_SETTING_SWITCH_ID';

interface Props {
  className?: string;
}

export function AppearanceLayout({ className }: Readonly<Props>) {
  const [enableSidebarNavigation, setEnableSidebarNavigation] = useEnableSidebarNavigation();
  const [, setPromotionDismissed] = useLocalStorage(NEW_NAVIGATION_PROMOTION_DISMISSED_KEY, false);

  const handleToggle = useCallback(
    (enabled: boolean) => {
      setEnableSidebarNavigation(enabled);
      setPromotionDismissed(true);
    },
    [setEnableSidebarNavigation, setPromotionDismissed],
  );

  return (
    <div className={className}>
      <Heading as="h2" className="sw-flex sw-items-center sw-gap-3" hasMarginBottom>
        <FormattedMessage id="my_account.appearance.new_ui.title" />
        <BetaBadge size="medium" />
      </Heading>

      <Text as="p">
        <FormattedMessage
          id="my_account.appearance.new_ui.description"
          values={{
            link: (text) => (
              <Link
                enableOpenInNewTab
                highlight="current-color"
                to="https://community.sonarsource.com/c/sq/10"
              >
                {text}
              </Link>
            ),
          }}
        />
      </Text>

      <div className="sw-mt-6 sw-flex sw-items-center sw-gap-3">
        <Switch id={SWITCH_ID} onChange={handleToggle} value={enableSidebarNavigation} />

        <Label htmlFor={SWITCH_ID}>
          <FormattedMessage id="my_account.appearance.new_ui.switch_label" />
        </Label>
      </div>
    </div>
  );
}
