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

import { Link, MessageCallout } from '@sonarsource/echoes-react';
import { isEmpty } from 'lodash';
import { FormattedMessage } from 'react-intl';
import { getSystemUpgrades } from '~sq-server-commons/api/system';
import { DismissableBanner } from '~sq-server-commons/components/ui/DismissableBanner';
import { SystemUpgradeButton } from '~sq-server-commons/components/upgrade/SystemUpgradeButton';
import { UpdateUseCase } from '~sq-server-commons/components/upgrade/utils';
import { useAppState } from '~sq-server-commons/context/app-state/withAppStateContext';
import { ProductNameForUpgrade } from '~sq-server-commons/types/system';
import {
  analyzeUpgrades,
  isVersionAPatchUpdate,
  parseVersion,
} from '~sq-server-commons/utils/update-notification-helpers';

interface Props {
  data?: Awaited<ReturnType<typeof getSystemUpgrades>>;
  isGlobalBanner?: boolean;
}

export function SQCBUpdateBanners({ data, isGlobalBanner }: Readonly<Props>) {
  const appState = useAppState();

  const parsedVersion = parseVersion(appState.version);
  const { upgrades = [], latestLTA } = data ?? {};

  const SQSUpgrades = upgrades.filter(
    (upgrade) =>
      upgrade.product === ProductNameForUpgrade.SonarQubeServer &&
      !isVersionAPatchUpdate(upgrade.version),
  );

  const SQCBUpgrades = upgrades.filter(
    (upgrade) => upgrade.product === ProductNameForUpgrade.SonarQubeCommunityBuild,
  );

  const banners = [];

  if (!isEmpty(SQCBUpgrades)) {
    const content = (
      <FormattedMessage
        id="admin_notification.update.new_sqcb_version"
        values={{
          link: (
            <Link
              className="sw-ml-1"
              highlight="current-color"
              to="https://www.sonarsource.com/open-source-editions/sonarqube-community-edition/"
            >
              <FormattedMessage id="admin_notification.update.latest" />
            </Link>
          ),
        }}
      />
    );

    const { latest } = analyzeUpgrades({
      parsedVersion,
      upgrades: SQCBUpgrades,
    });

    const dismissKey = latest?.version ?? appState.version;

    banners.push(
      isGlobalBanner ? (
        <DismissableBanner alertKey={dismissKey} key="SQCB" variety="info">
          {content}
        </DismissableBanner>
      ) : (
        <MessageCallout key="SQCB" variety="info">
          {content}
        </MessageCallout>
      ),
    );
  }

  if (!isEmpty(SQSUpgrades)) {
    const { latest } = analyzeUpgrades({
      parsedVersion,
      upgrades: SQSUpgrades,
    });

    const contents = (
      <>
        <FormattedMessage id="admin_notification.update.new_sqs_version_when_running_sqcb.banner" />{' '}
        <FormattedMessage id="admin_notification.update.new_sqs_version_when_running_sqcb.upgrade" />
        {'.'}
      </>
    );
    const action = (
      <SystemUpgradeButton
        latestLTA={latestLTA}
        systemUpgrades={[latest]}
        updateUseCase={UpdateUseCase.NewVersion}
      />
    );

    const dismissKey = latest?.version ?? appState.version;

    banners.push(
      isGlobalBanner ? (
        <DismissableBanner alertKey={dismissKey} key="SQS" variety="info">
          {contents}
          {action}
        </DismissableBanner>
      ) : (
        <MessageCallout action={action} key="SQS" variety="info">
          {contents}
        </MessageCallout>
      ),
    );
  }

  if (!isGlobalBanner && !isEmpty(banners)) {
    return <div className="sw-flex sw-flex-col sw-gap-y-4 sw-mt-8">{banners}</div>;
  }

  return banners;
}
