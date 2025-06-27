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

import { MessageCallout, MessageVariety } from '@sonarsource/echoes-react';
import { translate } from '../../../helpers/l10n';
import { AutoConfig, BuildTools, TutorialConfig, TutorialModes } from '../types';
import { getBuildToolOptions, isCFamily, supportsAutoConfig } from '../utils';
import RenderOptions from './RenderOptions';

export interface BuildConfigSelectionProps {
  ci: TutorialModes;
  config: TutorialConfig;
  hideAutoConfig?: boolean;
  onSetConfig(config: TutorialConfig): void;
  supportCFamily: boolean;
}

export default function BuildConfigSelection(props: Readonly<BuildConfigSelectionProps>) {
  const { ci, config, hideAutoConfig, supportCFamily, onSetConfig } = props;

  function onSelectBuildTool(buildTool: BuildTools) {
    const autoConfig = buildTool === BuildTools.Cpp ? AutoConfig.Automatic : undefined;
    onSetConfig({ ...config, buildTool, autoConfig });
  }

  function onSelectAutoConfig(autoConfig: AutoConfig) {
    onSetConfig({ ...config, autoConfig });
  }

  return (
    <>
      {translate('onboarding.build')}
      <RenderOptions
        checked={config.buildTool}
        label={translate('onboarding.build')}
        onCheck={onSelectBuildTool}
        optionLabelKey="onboarding.build"
        options={getBuildToolOptions(supportCFamily)}
      />

      {ci === TutorialModes.Jenkins && isCFamily(config.buildTool) && (
        <MessageCallout className="sw-mt-2 sw-w-abs-600" variety={MessageVariety.Info}>
          {translate('onboarding.tutorial.with.jenkins.jenkinsfile.cfamilly.agent_setup')}
        </MessageCallout>
      )}

      {!hideAutoConfig &&
        config.buildTool &&
        supportsAutoConfig(config.buildTool) &&
        onSelectAutoConfig && (
          <>
            <div className="sw-mt-4">{translate('onboarding.build.cpp.autoconfig')}</div>
            <RenderOptions
              checked={config.autoConfig}
              label="onboarding.build.cpp.autoconfig"
              onCheck={onSelectAutoConfig}
              optionLabelKey="onboarding.build.cpp.autoconfig"
              options={[AutoConfig.Automatic, AutoConfig.Manual]}
            />
            <MessageCallout className="sw-mt-2 sw-w-abs-600" variety={MessageVariety.Info}>
              {translate(`onboarding.build.cpp.autoconfig.${config.autoConfig}.description`)}
            </MessageCallout>
          </>
        )}
    </>
  );
}
