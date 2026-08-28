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
  Heading,
  Label,
  Layout,
  LinkStandalone,
  Spinner,
  Text,
  Theme,
  ToggleTip,
} from '@sonarsource/echoes-react';
import { FormattedMessage, MessageDescriptor, useIntl } from 'react-intl';
import { Image } from '~adapters/components/common/Image';
import { GreyCard } from '~design-system';
import { useCurrentTheme } from '~shared/helpers/css';
import { GlobalPageTemplate } from '~sq-server-commons/components/ui/GlobalPageTemplate';
import withAppStateContext from '~sq-server-commons/context/app-state/withAppStateContext';
import {
  almIconUrl,
  almIconUrlUnthemed,
  almKeyToIconKey,
} from '~sq-server-commons/helpers/almIcons';
import { getCreateProjectModeLocation } from '~sq-server-commons/helpers/urls';
import { AlmKeys } from '~sq-server-commons/types/alm-settings';
import { AppState } from '~sq-server-commons/types/appstate';
import { CreateProjectModes } from '~sq-server-commons/types/create-project';

export interface CreateProjectModeSelectionProps {
  almCounts: {
    [k in AlmKeys]: number;
  };
  appState: AppState;
  loadingBindings: boolean;
  onConfigMode: (mode: AlmKeys) => void;
  redirect?: string;
}

type almList = {
  key: AlmKeys;
  mode: CreateProjectModes;
}[];

const almList: almList = [
  { key: AlmKeys.Azure, mode: CreateProjectModes.AzureDevOps },
  { key: AlmKeys.BitbucketCloud, mode: CreateProjectModes.BitbucketCloud },
  { key: AlmKeys.BitbucketServer, mode: CreateProjectModes.BitbucketServer },
  { key: AlmKeys.GitHub, mode: CreateProjectModes.GitHub },
  { key: AlmKeys.GitLab, mode: CreateProjectModes.GitLab },
];

function renderAlmOption(
  props: CreateProjectModeSelectionProps,
  alm: AlmKeys,
  mode: CreateProjectModes,
  formatMessage: (descriptor: MessageDescriptor) => string,
  currentTheme: Theme,
) {
  const {
    almCounts,
    appState: { canAdmin },
    loadingBindings,
    redirect,
  } = props;

  const count = almCounts[alm];
  const hasConfig = count > 0;
  const disabled = loadingBindings || (!hasConfig && !canAdmin);
  const configMode = alm === AlmKeys.BitbucketCloud ? AlmKeys.BitbucketServer : alm;

  const iconKey = almKeyToIconKey(alm);

  const icon = (
    <Image
      alt="" // Should be ignored by screen readers
      className="sw-h-400 sw-w-200"
      src={
        !disabled && hasConfig
          ? almIconUrl(currentTheme, iconKey)
          : almIconUrlUnthemed(`${iconKey}_grey`)
      }
    />
  );

  return (
    <GreyCard className="sw-col-span-4 sw-p-4 sw-flex sw-justify-between sw-items-center" key={alm}>
      <div className="sw-items-center sw-flex sw-py-2">
        {!disabled && hasConfig ? (
          <LinkStandalone iconLeft={icon} to={getCreateProjectModeLocation(mode, { redirect })}>
            <span className="sw-ml-2">
              <FormattedMessage id={`onboarding.create_project.import_select_method.${alm}`} />
            </span>
          </LinkStandalone>
        ) : (
          <>
            {icon}
            <Text className="sw-ml-3 sw-text-sm sw-font-semibold" isSubtle>
              <FormattedMessage id={`onboarding.create_project.import_select_method.${alm}`} />
            </Text>
          </>
        )}
      </div>

      <Spinner isLoading={loadingBindings}>
        {!hasConfig &&
          (canAdmin ? (
            <Button
              onClick={() => {
                props.onConfigMode(configMode);
              }}
            >
              <FormattedMessage id="setup" />
            </Button>
          ) : (
            <ToggleTip
              ariaLabel={formatMessage({ id: 'toggle_tip.aria_label.alm_not_configured' })}
              description={formatMessage({ id: 'onboarding.create_project.alm_not_configured' })}
            />
          ))}
      </Spinner>
    </GreyCard>
  );
}

function separateAvailableOptions(almCounts: CreateProjectModeSelectionProps['almCounts']) {
  const availableOptions: almList = [];
  const unavailableOptions: almList = [];
  almList.forEach(({ key, mode }) =>
    (almCounts[key] > 0 ? availableOptions : unavailableOptions).push({ key, mode }),
  );
  return {
    availableOptions,
    unavailableOptions,
  };
}

export function CreateProjectModeSelection(props: Readonly<CreateProjectModeSelectionProps>) {
  const {
    appState: { canAdmin },
    almCounts,
    redirect,
  } = props;

  const { formatMessage } = useIntl();
  const currentTheme = useCurrentTheme() as Theme;

  const almTotalCount = Object.values(almCounts).reduce((prev, cur) => prev + cur, 0);
  const filteredAlm = separateAvailableOptions(almCounts);

  return (
    <GlobalPageTemplate
      description={
        <Layout.PageHeader.Description>
          <FormattedMessage id="onboarding.create_project.select_method.devops_platform" />
        </Layout.PageHeader.Description>
      }
      title={formatMessage({ id: 'onboarding.create_project.select_method' })}
    >
      <Heading as="h2" className="sw-mt-6">
        <FormattedMessage id="onboarding.create_project.select_method.devops_platform_second" />
      </Heading>
      {almTotalCount === 0 && canAdmin && (
        <Text className="sw-mt-3">
          <FormattedMessage id="onboarding.create_project.select_method.no_alm_yet.admin" />
        </Text>
      )}
      <div className="sw-grid sw-gap-x-12 sw-gap-y-6 sw-grid-cols-12 sw-mt-4">
        {filteredAlm.availableOptions.map(({ key, mode }) =>
          renderAlmOption(props, key, mode, formatMessage, currentTheme),
        )}
        {filteredAlm.unavailableOptions.map(({ key, mode }) =>
          renderAlmOption(props, key, mode, formatMessage, currentTheme),
        )}
      </div>
      <Label className="sw-block sw-mb-4 sw-mt-10">
        <FormattedMessage id="onboarding.create_project.select_method.manually" />
      </Label>
      <div className="sw-grid sw-gap-x-12 sw-gap-y-6 sw-grid-cols-12">
        <GreyCard className="sw-col-span-4 sw-p-4 sw-py-6 sw-flex sw-justify-between sw-items-center">
          <div>
            <LinkStandalone
              to={getCreateProjectModeLocation(CreateProjectModes.Manual, { redirect })}
            >
              <FormattedMessage id="onboarding.create_project.import_select_method.manual" />
            </LinkStandalone>
          </div>
        </GreyCard>
      </div>
    </GlobalPageTemplate>
  );
}

export default withAppStateContext(CreateProjectModeSelection);
