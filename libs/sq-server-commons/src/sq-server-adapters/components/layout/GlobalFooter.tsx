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

import { Layout, LinkHighlight, LinkStandalone, Text } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import AppVersionStatus from '../../../components/shared/AppVersionStatus';
import GlobalFooterBranding from '../../../components/ui/GlobalFooterBranding';
import { useAppState } from '../../../context/app-state/withAppStateContext';
import { SeparatorCircleIcon } from '../../../design-system';
import { COMMUNITY_FORUM_URL, DocLink } from '../../../helpers/doc-links';
import { useDocUrl } from '../../../helpers/docs';
import { getEdition } from '../../../helpers/editions';
import { getInstanceVersionNumber } from '../../../helpers/strings';
import { useStandardExperienceModeQuery } from '../../../queries/mode';
import { EditionKey } from '../../../types/editions';

interface GlobalFooterProps {
  hideLoggedInInfo?: boolean;
}

export function GlobalFooter({ hideLoggedInInfo }: Readonly<GlobalFooterProps>) {
  const appState = useAppState();
  const { data: isStandardMode } = useStandardExperienceModeQuery({
    enabled: appState.version !== '',
  });
  const currentEdition = appState?.edition && getEdition(appState.edition);
  const intl = useIntl();
  const version = getInstanceVersionNumber(appState.version);

  const docUrl = useDocUrl();

  const isCommunityBuildRunning = appState.edition === EditionKey.community;

  return (
    <Layout.PageFooter>
      <Text as="div" className="sw-flex sw-grow sw-shrink-0 sw-flex-auto" isSubtle size="small">
        <GlobalFooterBranding />
      </Text>

      {!hideLoggedInInfo && (
        <ul className="sw-code sw-flex sw-grow sw-flex-wrap sw-justify-center sw-items-center sw-gap-1 sw-mx-8">
          {currentEdition && (
            <>
              <Text as="li" isSubtle size="small">
                {currentEdition.name}
              </Text>
              <SeparatorCircleIcon aria-hidden as="li" />
            </>
          )}

          {appState?.version && (
            <>
              <Text as="li" isSubtle size="small">
                {intl.formatMessage({ id: 'footer.version.short' }, { version })}
              </Text>
              <SeparatorCircleIcon aria-hidden as="li" />
              <Text as="li" isSubtle size="small">
                <AppVersionStatus
                  linkStyleProps={{ highlight: LinkHighlight.Subtle, isDiscreet: true }}
                  statusOnly
                />
              </Text>
            </>
          )}
          {isStandardMode !== undefined && (
            <>
              <SeparatorCircleIcon aria-hidden as="li" />
              <Text as="li" className="sw-uppercase" isSubtle size="small">
                {intl.formatMessage({
                  id: `footer.mode.${isStandardMode ? 'STANDARD' : 'MQR'}`,
                })}
              </Text>
            </>
          )}
        </ul>
      )}

      <ul className="sw-flex sw-grow sw-justify-end sw-items-center sw-gap-4 sw-typo-sm">
        <li>
          {isCommunityBuildRunning ? (
            <LinkStandalone
              className="sw-text-nowrap"
              highlight={LinkHighlight.Subtle}
              isDiscreet
              to="https://www.gnu.org/licenses/lgpl-3.0.txt"
            >
              {intl.formatMessage({ id: 'footer.license.lgplv3' })}
            </LinkStandalone>
          ) : (
            <LinkStandalone
              className="sw-text-nowrap"
              highlight={LinkHighlight.Subtle}
              isDiscreet
              to="https://www.sonarsource.com/legal/sonarqube/terms-and-conditions/"
            >
              {intl.formatMessage({ id: 'footer.license.sqs' })}
            </LinkStandalone>
          )}
        </li>

        <li>
          <LinkStandalone highlight={LinkHighlight.Subtle} isDiscreet to={COMMUNITY_FORUM_URL}>
            {intl.formatMessage({ id: 'footer.community' })}
          </LinkStandalone>
        </li>

        <li>
          <LinkStandalone highlight={LinkHighlight.Subtle} isDiscreet to={docUrl(DocLink.Root)}>
            {intl.formatMessage({ id: 'footer.documentation' })}
          </LinkStandalone>
        </li>

        <li>
          <LinkStandalone
            highlight={LinkHighlight.Subtle}
            isDiscreet
            to={docUrl(DocLink.InstanceAdminPluginVersionMatrix)}
          >
            {intl.formatMessage({ id: 'footer.plugins' })}
          </LinkStandalone>
        </li>

        {!hideLoggedInInfo && (
          <li>
            <LinkStandalone
              className="sw-text-nowrap"
              highlight={LinkHighlight.Subtle}
              isDiscreet
              to="/web_api"
            >
              {intl.formatMessage({ id: 'footer.web_api' })}
            </LinkStandalone>
          </li>
        )}
      </ul>
    </Layout.PageFooter>
  );
}
