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

import * as React from 'react';
import { NumberedListItem } from '../../../../design-system';
import { translate } from '../../../../helpers/l10n';
import { Component } from '../../../../types/types';
import { CompilationInfo } from '../../components/CompilationInfo';
import CreateYmlFile from '../../components/CreateYmlFile';
import DefaultProjectKey from '../../components/DefaultProjectKey';
import GithubCFamilyExampleRepositories from '../../components/GithubCFamilyExampleRepositories';
import RenderOptions from '../../components/RenderOptions';
import { Arch, AutoConfig, BuildTools, OSs, TutorialConfig, TutorialModes } from '../../types';
import { getBuildWrapperExecutable } from '../../utils';
import { generateGitHubActionsYaml } from '../utils';
import MonorepoDocLinkFallback from './MonorepoDocLinkFallback';
import Others from './Others';

export interface CFamilyProps {
  branchesEnabled?: boolean;
  component: Component;
  config: TutorialConfig;
  mainBranchName: string;
  monorepo?: boolean;
}

function yamlSteps(os: OSs, arch: Arch) {
  const buildWrapperExecutable = getBuildWrapperExecutable(os, arch);
  return `
      - name: Install Build Wrapper
        uses: SonarSource/sonarqube-scan-action/install-build-wrapper@v5
        env:
          SONAR_HOST_URL: \${{secrets.SONAR_HOST_URL}}
      - name: Run Build Wrapper
        run: |
          ${buildWrapperExecutable} --out-dir \${{ env.BUILD_WRAPPER_OUT_DIR }} <insert_your_clean_build_command>
      - name: SonarQube Scan
        uses: SonarSource/sonarqube-scan-action@v5
        env:
          SONAR_TOKEN: \${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: \${{secrets.SONAR_HOST_URL}}
        with:
          args: >
            -Dsonar.cfamily.compile-commands="\${{ env.BUILD_WRAPPER_OUT_DIR }}/compile_commands.json"`;
}

export default function CFamily(props: Readonly<CFamilyProps>) {
  const { config, component, branchesEnabled, mainBranchName, monorepo } = props;
  const [os, setOs] = React.useState<OSs>(OSs.Linux);
  const [arch, setArch] = React.useState<Arch>(Arch.X86_64);

  if (config.buildTool === BuildTools.Cpp && config.autoConfig === AutoConfig.Automatic) {
    return <Others buildSteps="" {...props} />;
  }

  const runsOn = {
    [OSs.Linux]: 'ubuntu-latest',
    [OSs.MacOS]: 'macos-latest',
    [OSs.Windows]: 'windows-latest',
  };
  return (
    <>
      <DefaultProjectKey component={component} monorepo={monorepo} />
      <NumberedListItem>
        <span>{translate('onboarding.build.other.os')}</span>
        <RenderOptions
          checked={os}
          label={translate('onboarding.build.other.os')}
          onCheck={(value: OSs) => {
            setOs(value);
          }}
          optionLabelKey="onboarding.build.other.os"
          options={Object.values(OSs)}
        />
        {os === OSs.Linux && (
          <>
            <div className="sw-mt-4">{translate('onboarding.build.other.architecture')}</div>
            <RenderOptions
              checked={arch}
              label={translate('onboarding.build.other.architecture')}
              onCheck={(value: Arch) => {
                setArch(value);
              }}
              optionLabelKey="onboarding.build.other.architecture"
              options={[Arch.X86_64, Arch.Arm64]}
            />
          </>
        )}
        <GithubCFamilyExampleRepositories
          ci={TutorialModes.GitHubActions}
          className="sw-mt-4 sw-w-abs-600"
          os={os}
        />
      </NumberedListItem>
      {monorepo ? (
        <MonorepoDocLinkFallback />
      ) : (
        <>
          <CreateYmlFile
            yamlFileName=".github/workflows/build.yml"
            yamlTemplate={generateGitHubActionsYaml(
              mainBranchName,
              !!branchesEnabled,
              runsOn[os],
              yamlSteps(os, arch),
              `env:
      BUILD_WRAPPER_OUT_DIR: build_wrapper_output_directory # Directory where build-wrapper output will be placed`,
            )}
          />
          <CompilationInfo />
        </>
      )}
    </>
  );
}
