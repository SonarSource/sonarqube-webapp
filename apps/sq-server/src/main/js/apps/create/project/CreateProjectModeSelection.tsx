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

/* eslint-disable react/no-unused-prop-types */

import {
  Button,
  Heading,
  Label,
  LinkStandalone,
  Spinner,
  Text,
  ToggleTip,
} from '@sonarsource/echoes-react';
import { Image } from '~adapters/components/common/Image';
import { GreyCard } from '~design-system';
import withAppStateContext from '~sq-server-commons/context/app-state/withAppStateContext';
import { translate } from '~sq-server-commons/helpers/l10n';
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
) {
  const {
    almCounts,
    appState: { canAdmin },
    loadingBindings,
  } = props;
  const count = almCounts[alm];
  const hasConfig = count > 0;
  const disabled = loadingBindings || (!hasConfig && !canAdmin);
  const configMode = alm === AlmKeys.BitbucketCloud ? AlmKeys.BitbucketServer : alm;

  const svgFileName = alm === AlmKeys.BitbucketCloud ? AlmKeys.BitbucketServer : alm;
  const svgFileNameGrey = `${svgFileName}_grey`;

  const icon = (
    <Image
      alt="" // Should be ignored by screen readers
      className="sw-h-400 sw-w-200"
      src={`/images/alm/${!disabled && hasConfig ? svgFileName : svgFileNameGrey}.svg`}
    />
  );

  return (
    <GreyCard className="sw-col-span-4 sw-p-4 sw-flex sw-justify-between sw-items-center" key={alm}>
      <div className="sw-items-center sw-flex sw-py-2">
        {!disabled && hasConfig ? (
          <LinkStandalone iconLeft={icon} to={getCreateProjectModeLocation(mode)}>
            <span className="sw-ml-2">
              {translate('onboarding.create_project.import_select_method', alm)}
            </span>
          </LinkStandalone>
        ) : (
          <>
            {icon}
            <Text className="sw-ml-3 sw-text-sm sw-font-semibold" isSubtle>
              {translate('onboarding.create_project.import_select_method', alm)}
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
              {translate('setup')}
            </Button>
          ) : (
            <ToggleTip
              ariaLabel={translate('toggle_tip.aria_label.alm_not_configured')}
              description={translate('onboarding.create_project.alm_not_configured')}
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

export function CreateProjectModeSelection(props: CreateProjectModeSelectionProps) {
  const {
    appState: { canAdmin },
    almCounts,
  } = props;
  const almTotalCount = Object.values(almCounts).reduce((prev, cur) => prev + cur, 0);
  const filteredAlm = separateAvailableOptions(almCounts);

  return (
    <div className="sw-typo-default">
      <div className="sw-flex sw-flex-col">
        <Heading as="h1" className="sw-mb-4">
          {translate('onboarding.create_project.select_method')}
        </Heading>
        <Text>{translate('onboarding.create_project.select_method.devops_platform')}</Text>
        <Heading as="h2" className="sw-mt-6">
          {translate('onboarding.create_project.select_method.devops_platform_second')}
        </Heading>
        {almTotalCount === 0 && canAdmin && (
          <Text className="sw-mt-3">
            {translate('onboarding.create_project.select_method.no_alm_yet.admin')}
          </Text>
        )}
        <div className="sw-grid sw-gap-x-12 sw-gap-y-6 sw-grid-cols-12 sw-mt-4">
          {filteredAlm.availableOptions.map(({ key, mode }) => renderAlmOption(props, key, mode))}
          {filteredAlm.unavailableOptions.map(({ key, mode }) => renderAlmOption(props, key, mode))}
        </div>
        <Label className="sw-mb-4 sw-mt-10">
          {translate('onboarding.create_project.select_method.manually')}
        </Label>
        <div className="sw-grid sw-gap-x-12 sw-gap-y-6 sw-grid-cols-12">
          <GreyCard className="sw-col-span-4 sw-p-4 sw-py-6 sw-flex sw-justify-between sw-items-center">
            <div>
              <LinkStandalone to={getCreateProjectModeLocation(CreateProjectModes.Manual)}>
                {translate('onboarding.create_project.import_select_method.manual')}
              </LinkStandalone>
            </div>
          </GreyCard>
        </div>
      </div>
    </div>
  );
}

export default withAppStateContext(CreateProjectModeSelection);
