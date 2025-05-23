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

import { Label } from '@sonarsource/echoes-react';
import AlmSettingsInstanceSelector from '~sq-server-commons/components/devops-platform/AlmSettingsInstanceSelector';
import { hasMessage, translate, translateWithParameters } from '~sq-server-commons/helpers/l10n';
import { AlmKeys, AlmSettingsInstance } from '~sq-server-commons/types/alm-settings';

interface Props {
  almInstances?: AlmSettingsInstance[];
  almKey: AlmKeys;
  onChangeConfig: (instance: AlmSettingsInstance) => void;
  selectedAlmInstance?: AlmSettingsInstance;
}

const MIN_SIZE_INSTANCES = 2;

export default function AlmSettingsInstanceDropdown(props: Readonly<Props>) {
  const { almKey, almInstances, selectedAlmInstance } = props;
  if (!almInstances || almInstances.length < MIN_SIZE_INSTANCES) {
    return null;
  }

  const almKeyTranslation = hasMessage(`alm.${almKey}.long`)
    ? `alm.${almKey}.long`
    : `alm.${almKey}`;

  return (
    <div className="sw-flex sw-flex-col sw-mb-9">
      <Label className="sw-mb-2" htmlFor="alm-config-selector">
        {translateWithParameters('alm.configuration.selector.label', translate(almKeyTranslation))}
      </Label>
      <AlmSettingsInstanceSelector
        className="sw-w-abs-400"
        initialValue={selectedAlmInstance ? selectedAlmInstance.key : undefined}
        inputId="alm-config-selector"
        instances={almInstances}
        onChange={props.onChangeConfig}
      />
    </div>
  );
}
