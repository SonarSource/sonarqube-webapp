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
  Divider,
  Label,
  LinkStandalone,
  SelectionCards,
  Spinner,
  Text,
  Theme,
} from '@sonarsource/echoes-react';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Image } from '~adapters/components/common/Image';
import { useCurrentTheme } from '~shared/helpers/css';
import AlmSettingsInstanceSelector from '~sq-server-commons/components/devops-platform/AlmSettingsInstanceSelector';
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
import { DopSetting } from '~sq-server-commons/types/dop-translation';
import { CreateProjectPageLayout } from './components/CreateProjectPageLayout';
import { CreateProjectStep } from './components/CreateProjectStepper';

export interface CreateProjectModeSelectionProps {
  appState: AppState;
  dopSettings: Record<AlmKeys, DopSetting[]>;
  loadingBindings: boolean;
  onConfigMode: (alm: AlmKeys) => void;
  onContinue: (mode: CreateProjectModes, dopSettingId: string) => void;
  redirect?: string;
}

const ALM_LIST: { key: AlmKeys; mode: CreateProjectModes }[] = [
  { key: AlmKeys.GitHub, mode: CreateProjectModes.GitHub },
  { key: AlmKeys.GitLab, mode: CreateProjectModes.GitLab },
  { key: AlmKeys.Azure, mode: CreateProjectModes.AzureDevOps },
  { key: AlmKeys.BitbucketServer, mode: CreateProjectModes.BitbucketServer },
  { key: AlmKeys.BitbucketCloud, mode: CreateProjectModes.BitbucketCloud },
];

// Bitbucket Data Center and Cloud share the same "short" label, so the "long" one is preferred.
// Only the platform cards use a shorter name for Bitbucket Data Center, to fit on one line.
function getAlmCardLabelId(alm: AlmKeys) {
  return alm === AlmKeys.BitbucketServer
    ? 'onboarding.create_project.configure.bitbucket_server_card'
    : getAlmLabelId(alm);
}

function getAlmLabelId(alm: AlmKeys) {
  return alm === AlmKeys.BitbucketServer || alm === AlmKeys.BitbucketCloud
    ? `alm.${alm}.long`
    : `alm.${alm}`;
}

export function CreateProjectModeSelection(props: Readonly<CreateProjectModeSelectionProps>) {
  const {
    appState: { canAdmin },
    dopSettings,
    loadingBindings,
    onConfigMode,
    onContinue,
    redirect,
  } = props;

  const { formatMessage } = useIntl();
  const currentTheme = useCurrentTheme() as Theme;

  const [selectedAlm, setSelectedAlm] = useState<AlmKeys>();
  // Only set when the user explicitly picks one, otherwise a lone configuration is used.
  const [pickedSettingKey, setPickedSettingKey] = useState<string>();

  const selectedAlmSettings = selectedAlm ? dopSettings[selectedAlm] : [];
  const selectedSetting =
    selectedAlmSettings.find(({ key }) => key === pickedSettingKey) ??
    (selectedAlmSettings.length === 1 ? selectedAlmSettings[0] : undefined);

  const hasUnconfiguredAlm = ALM_LIST.some(({ key }) => dopSettings[key].length === 0);

  const options = ALM_LIST.map(({ key }) => {
    const count = dopSettings[key].length;
    const isDisabled = count === 0 && !canAdmin;
    const iconKey = almKeyToIconKey(key);
    const name = formatMessage({ id: getAlmCardLabelId(key) });

    const helpText = formatMessage(
      {
        id:
          count > 0
            ? 'onboarding.create_project.configure.configurations_count'
            : 'onboarding.create_project.configure.not_configured',
      },
      { count },
    );

    return {
      ariaLabel: name,
      helpText,
      isDisabled,
      label: (
        <span className="sw:flex sw:items-center sw:gap-3">
          <Image
            alt="" // Decorative, the name is announced by the label
            className="sw:h-400 sw:w-200"
            src={
              isDisabled || count === 0
                ? almIconUrlUnthemed(`${iconKey}_grey`)
                : almIconUrl(currentTheme, iconKey)
            }
          />
          {name}
        </span>
      ),
      value: key,
    };
  });

  const handleSelectAlm = (value: string) => {
    setSelectedAlm(value as AlmKeys);
    setPickedSettingKey(undefined);
  };

  const handleContinue = () => {
    const mode = ALM_LIST.find(({ key }) => key === selectedAlm)?.mode;
    if (mode === undefined || selectedSetting === undefined) {
      return;
    }

    onContinue(mode, selectedSetting.id);
  };

  return (
    <CreateProjectPageLayout
      description={
        <FormattedMessage id="onboarding.create_project.select_method.devops_platform" />
      }
      step={CreateProjectStep.Configure}
      title={formatMessage({ id: 'onboarding.create_project.select_method' })}
    >
      <Spinner isLoading={loadingBindings}>
        <SelectionCards
          alignment="horizontal"
          ariaLabel={formatMessage({
            id: 'onboarding.create_project.configure.platform_aria_label',
          })}
          className="sw:w-full"
          onChange={handleSelectAlm}
          options={options}
          value={selectedAlm ?? ''}
        />

        {!canAdmin && hasUnconfiguredAlm && (
          <Text as="p" className="sw:mt-4" isSubtle>
            <FormattedMessage id="onboarding.create_project.configure.contact_admin" />
          </Text>
        )}

        {selectedAlm !== undefined && (
          <div className="sw:mt-6 sw:flex sw:flex-col sw:gap-3">
            {selectedAlmSettings.length > 0 ? (
              <>
                <Label htmlFor="alm-config-selector">
                  <FormattedMessage
                    id="alm.configuration.selector.label"
                    values={{ '0': formatMessage({ id: getAlmLabelId(selectedAlm) }) }}
                  />
                </Label>
                <AlmSettingsInstanceSelector
                  className="sw:w-abs-400"
                  initialValue={selectedSetting?.key}
                  inputId="alm-config-selector"
                  instances={selectedAlmSettings}
                  onChange={({ key }) => {
                    setPickedSettingKey(key);
                  }}
                />
              </>
            ) : (
              <Text>
                <FormattedMessage
                  id="onboarding.create_project.configure.no_configuration_admin"
                  values={{ platform: formatMessage({ id: getAlmLabelId(selectedAlm) }) }}
                />
              </Text>
            )}

            {canAdmin && (
              <div>
                <Button
                  onClick={() => {
                    onConfigMode(selectedAlm);
                  }}
                  variety={
                    selectedAlmSettings.length > 0
                      ? ButtonVariety.DefaultGhost
                      : ButtonVariety.Default
                  }
                >
                  <FormattedMessage
                    id={
                      selectedAlmSettings.length > 0
                        ? 'onboarding.create_project.configure.create_another'
                        : 'onboarding.create_project.configure.create'
                    }
                  />
                </Button>
              </div>
            )}
          </div>
        )}
      </Spinner>

      <Divider className="sw:my-6" />

      <div className="sw:flex sw:items-center sw:justify-between">
        <Button
          isDisabled={selectedSetting === undefined}
          onClick={handleContinue}
          variety={ButtonVariety.Primary}
        >
          <FormattedMessage id="onboarding.create_project.configure.continue" />
        </Button>

        <LinkStandalone to={getCreateProjectModeLocation(CreateProjectModes.Manual, { redirect })}>
          <FormattedMessage id="onboarding.create_project.import_select_method.manual" />
        </LinkStandalone>
      </div>
    </CreateProjectPageLayout>
  );
}

export default withAppStateContext(CreateProjectModeSelection);
