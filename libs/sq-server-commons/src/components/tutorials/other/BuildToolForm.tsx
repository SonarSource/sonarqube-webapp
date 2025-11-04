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

import { translate } from '../../../helpers/l10n';
import { withCLanguageFeature } from '../../hoc/withCLanguageFeature';
import BuildConfigSelection from '../components/BuildConfigSelection';
import GithubCFamilyExampleRepositories from '../components/GithubCFamilyExampleRepositories';
import RenderOptions from '../components/RenderOptions';
import { Arch, OSs, TutorialConfig, TutorialModes } from '../types';
import {
  shouldShowArchSelector,
  shouldShowGithubCFamilyExampleRepositories,
  shouldShowOsSelector,
} from '../utils';

interface Props {
  arch?: Arch;
  config: TutorialConfig;
  hasCLanguageFeature: boolean;
  isLocal: boolean;
  os?: OSs;
  setArch: (arch: Arch) => void;
  setConfig: (config: TutorialConfig) => void;
  setOs: (os: OSs) => void;
}

export function BuildToolForm(props: Readonly<Props>) {
  const { config, setConfig, os, setOs, arch, setArch, isLocal, hasCLanguageFeature } = props;

  function handleConfigChange(newConfig: TutorialConfig) {
    setConfig({
      ...config,
      ...newConfig,
    });
  }

  return (
    <>
      {config && (
        <BuildConfigSelection
          ci={TutorialModes.OtherCI}
          config={config}
          onSetConfig={handleConfigChange}
          supportCFamily={hasCLanguageFeature}
        />
      )}
      {shouldShowOsSelector(config, isLocal) && (
        <RenderOptions
          checked={os}
          label={translate('onboarding.build.other.os')}
          onCheck={(value: OSs) => {
            setOs(value);
          }}
          optionLabelKey="onboarding.build.other.os"
          options={[OSs.Linux, OSs.Windows, OSs.MacOS]}
          titleLabelKey="onboarding.build.other.os"
        />
      )}
      {shouldShowArchSelector(os, config, !isLocal) && (
        <RenderOptions
          checked={arch}
          label={translate('onboarding.build.other.architecture')}
          onCheck={(value: Arch) => {
            setArch(value);
          }}
          optionLabelKey="onboarding.build.other.architecture"
          options={[Arch.X86_64, Arch.Arm64]}
          titleLabelKey="onboarding.build.other.architecture"
        />
      )}
      {shouldShowGithubCFamilyExampleRepositories(config) && (
        <GithubCFamilyExampleRepositories
          ci={TutorialModes.OtherCI}
          className="sw-my-4 sw-w-abs-600"
        />
      )}
    </>
  );
}

export default withCLanguageFeature(BuildToolForm);
