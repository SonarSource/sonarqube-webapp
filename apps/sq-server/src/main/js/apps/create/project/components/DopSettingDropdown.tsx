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

import { Label } from '@sonarsource/echoes-react';
import classNames from 'classnames';
import { FormattedMessage, useIntl } from 'react-intl';
import AlmSettingsInstanceSelector from '~sq-server-commons/components/devops-platform/AlmSettingsInstanceSelector';
import { AlmKeys } from '~sq-server-commons/types/alm-settings';
import { DopSetting } from '~sq-server-commons/types/dop-translation';

export interface DopSettingDropdownProps {
  almKey: AlmKeys;
  className?: string;
  dopSettings?: DopSetting[];
  onChangeSetting: (setting: DopSetting) => void;
  selectedDopSetting?: DopSetting;
}

const MIN_SIZE_INSTANCES = 2;

export default function DopSettingDropdown(props: Readonly<DopSettingDropdownProps>) {
  const { formatMessage } = useIntl();

  const { almKey, className, dopSettings, onChangeSetting, selectedDopSetting } = props;
  if (!dopSettings || dopSettings.length < MIN_SIZE_INSTANCES) {
    return null;
  }

  return (
    <div className={classNames('sw:flex sw:flex-col', className)}>
      <Label className="sw:mb-2" htmlFor="dop-setting-dropdown">
        <FormattedMessage
          id="onboarding.create_project.monorepo.choose_dop_setting"
          values={{ almKey: formatMessage({ id: `alm.${almKey}` }) }}
        />
      </Label>

      <AlmSettingsInstanceSelector
        className="sw:w-abs-400"
        initialValue={selectedDopSetting?.key ?? null}
        inputId="dop-setting-dropdown"
        instances={dopSettings}
        onChange={(instance) => {
          const setting = dopSettings.find(({ key }) => key === instance.key);
          if (setting) {
            onChangeSetting(setting);
          }
        }}
      />
    </div>
  );
}
