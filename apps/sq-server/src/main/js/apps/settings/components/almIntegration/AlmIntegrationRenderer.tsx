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

import { Link } from '@sonarsource/echoes-react';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { Image } from '~adapters/components/common/Image';
import { FlagMessage, SubTitle, ToggleButton } from '~design-system';
import { useCurrentTheme } from '~shared/helpers/css';
import { isDefined } from '~shared/helpers/types';
import { almIconUrl, almKeyToIconKey } from '~sq-server-commons/helpers/almIcons';
import { useGetValuesQuery } from '~sq-server-commons/queries/settings';
import {
  AlmKeys,
  AlmSettingsBindingDefinitions,
  AlmSettingsBindingStatus,
} from '~sq-server-commons/types/alm-settings';
import { SettingsKey } from '~sq-server-commons/types/settings';
import { AlmTabs } from './AlmIntegration';
import AlmTab from './AlmTab';
import DeleteModal from './DeleteModal';

export interface AlmIntegrationRendererProps {
  branchesEnabled: boolean;
  currentAlmTab: AlmTabs;
  definitionKeyForDeletion?: string;
  definitionStatus: Record<string, AlmSettingsBindingStatus>;
  definitions: AlmSettingsBindingDefinitions;
  loadingAlmDefinitions: boolean;
  loadingProjectCount: boolean;
  multipleAlmEnabled: boolean;
  onCancelDelete: () => void;
  onCheckConfiguration: (definitionKey: string) => void;
  onConfirmDelete: (definitionKey: string) => void;
  onDelete: (definitionKey: string) => void;
  onSelectAlmTab: (alm: AlmTabs) => void;
  projectCount?: number;
}

const TABS = [AlmKeys.GitHub, AlmKeys.BitbucketServer, AlmKeys.Azure, AlmKeys.GitLab];

export default function AlmIntegrationRenderer(props: Readonly<AlmIntegrationRendererProps>) {
  const {
    definitionKeyForDeletion,
    definitions,
    definitionStatus,
    currentAlmTab,
    loadingAlmDefinitions,
    loadingProjectCount,
    branchesEnabled,
    multipleAlmEnabled,
    projectCount,
  } = props;

  const bindingDefinitions = {
    [AlmKeys.Azure]: definitions.azure,
    [AlmKeys.GitLab]: definitions.gitlab,
    [AlmKeys.GitHub]: definitions.github,
    [AlmKeys.BitbucketServer]: [...definitions.bitbucket, ...definitions.bitbucketcloud],
  };

  const currentTheme = useCurrentTheme();
  const tabs = useMemo(
    () =>
      TABS.map((almKey) => ({
        label: (
          <>
            <Image
              alt={almKey}
              className="sw-mr-2"
              height={16}
              src={almIconUrl(currentTheme, almKeyToIconKey(almKey))}
            />
            <FormattedMessage id={`settings.almintegration.tab.${almKey}`} />
          </>
        ),
        value: almKey,
      })),
    [currentTheme],
  );

  const { data, isLoading } = useGetValuesQuery([SettingsKey.ServerBaseUrl]);
  const hasServerBaseUrl = data?.length === 1 && data[0]?.value !== undefined;

  return (
    <>
      <header className="sw-mb-5">
        <SubTitle>
          <FormattedMessage id="settings.almintegration.title" />
        </SubTitle>
      </header>
      {!hasServerBaseUrl && !isLoading && branchesEnabled && (
        <FlagMessage variant="warning">
          <p>
            <FormattedMessage
              id="settings.almintegration.empty.server_base_url"
              values={{
                serverBaseUrl: (
                  <Link to="/admin/settings?category=general#sonar.core.serverBaseURL">
                    <FormattedMessage id="settings.almintegration.empty.server_base_url.setting_link" />
                  </Link>
                ),
              }}
            />
          </p>
        </FlagMessage>
      )}
      <div className="sw-my-4">
        <FormattedMessage id="settings.almintegration.description" />
      </div>
      <div className="sw-mb-6">
        <ToggleButton
          onChange={props.onSelectAlmTab}
          options={tabs}
          role="tablist"
          value={currentAlmTab}
        />
      </div>
      <AlmTab
        almTab={currentAlmTab}
        branchesEnabled={branchesEnabled}
        definitionStatus={definitionStatus}
        definitions={bindingDefinitions[currentAlmTab]}
        loadingAlmDefinitions={loadingAlmDefinitions}
        loadingProjectCount={loadingProjectCount}
        multipleAlmEnabled={multipleAlmEnabled}
        onCheck={props.onCheckConfiguration}
        onDelete={props.onDelete}
      />
      <DeleteModal
        id={definitionKeyForDeletion}
        isOpen={isDefined(definitionKeyForDeletion)}
        onCancel={props.onCancelDelete}
        onDelete={props.onConfirmDelete}
        projectCount={projectCount}
      />
    </>
  );
}
