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

import { Button, ButtonVariety } from '@sonarsource/echoes-react';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CenteredLayout, Title } from '~design-system';
import { setSimpleSettingValue } from '~sq-server-shared/api/settings';
import { whenLoggedIn } from '~sq-server-shared/components/hoc/whenLoggedIn';
import { translate } from '~sq-server-shared/helpers/l10n';
import { getBaseUrl } from '~sq-server-shared/helpers/system';
import { hasGlobalPermission } from '~sq-server-shared/helpers/users';
import { withRouter } from '~sq-server-shared/sonar-aligned/components/hoc/withRouter';
import { Router } from '~sq-server-shared/sonar-aligned/types/router';
import { Permissions } from '~sq-server-shared/types/permissions';
import { RiskConsent } from '~sq-server-shared/types/plugins';
import { SettingsKey } from '~sq-server-shared/types/settings';
import { LoggedInUser } from '~sq-server-shared/types/users';

export interface PluginRiskConsentProps {
  currentUser: LoggedInUser;
  router: Router;
}

export function PluginRiskConsent(props: Readonly<PluginRiskConsentProps>) {
  const { currentUser, router } = props;

  const isAdmin = hasGlobalPermission(currentUser, Permissions.Admin);

  React.useEffect(() => {
    if (!isAdmin) {
      router.replace('/');
    }
  }, [isAdmin, router]);

  if (!isAdmin) {
    return null;
  }

  const acknowledgeRisk = async () => {
    try {
      await setSimpleSettingValue({
        key: SettingsKey.PluginRiskConsent,
        value: RiskConsent.Accepted,
      });

      // force a refresh for the backend
      window.location.href = `${getBaseUrl()}/`;
    } catch (_) {
      /* Do nothing */
    }
  };

  return (
    <CenteredLayout className="sw-h-screen sw-pt-[10vh]">
      <Helmet defer={false} title={translate('plugin_risk_consent.page')} />

      <Card
        className="sw-typo-lg sw-min-w-[500px] sw-mx-auto sw-w-[40%] sw-text-center"
        data-testid="plugin-risk-consent-page">
        <Title className="sw-mb-4">{translate('plugin_risk_consent.title')}</Title>

        <p className="sw-mb-4">{translate('plugin_risk_consent.description')}</p>

        <p className="sw-mb-6">{translate('plugin_risk_consent.description2')}</p>

        <Button className="sw-my-4" onClick={acknowledgeRisk} variety={ButtonVariety.Primary}>
          {translate('plugin_risk_consent.action')}
        </Button>
      </Card>
    </CenteredLayout>
  );
}

export default whenLoggedIn(withRouter(PluginRiskConsent));
