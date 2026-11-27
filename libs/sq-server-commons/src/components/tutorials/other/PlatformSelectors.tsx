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

import { useIntl } from 'react-intl';
import RenderOptions from '../components/RenderOptions';
import { Arch, OSs, TutorialConfig } from '../types';
import { shouldShowArchSelector, shouldShowOsSelector } from '../utils';

interface Props {
  arch?: Arch;
  config: TutorialConfig;
  isLocal: boolean;
  isScannerAutoConfigEnabled?: boolean;
  os?: OSs;
  setArch: (arch: Arch) => void;
  setOs: (os: OSs) => void;
}

function PlatformSelectors(props: Readonly<Props>) {
  const { arch, config, isLocal, isScannerAutoConfigEnabled, os, setArch, setOs } = props;
  const { formatMessage } = useIntl();

  return (
    <>
      {shouldShowOsSelector(config, isLocal, isScannerAutoConfigEnabled) && (
        <RenderOptions
          checked={os}
          label={formatMessage({ id: 'onboarding.build.other.os' })}
          onCheck={(value: OSs) => {
            setOs(value);
          }}
          optionLabelKey="onboarding.build.other.os"
          options={[OSs.Linux, OSs.Windows, OSs.MacOS]}
          titleLabelKey="onboarding.build.other.os"
        />
      )}
      {shouldShowArchSelector(os, config, !isLocal, isScannerAutoConfigEnabled) && (
        <RenderOptions
          checked={arch}
          label={formatMessage({ id: 'onboarding.build.other.architecture' })}
          onCheck={(value: Arch) => {
            setArch(value);
          }}
          optionLabelKey="onboarding.build.other.architecture"
          options={[Arch.X86_64, Arch.Arm64]}
          titleLabelKey="onboarding.build.other.architecture"
        />
      )}
    </>
  );
}

export { PlatformSelectors };
