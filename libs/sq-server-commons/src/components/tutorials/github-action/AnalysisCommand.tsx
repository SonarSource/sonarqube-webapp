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

import withAvailableFeatures, {
  WithAvailableFeaturesProps,
} from '../../../context/available-features/withAvailableFeatures';
import { Feature } from '../../../types/features';
import { Component } from '../../../types/types';
import { BuildTools, TutorialConfig } from '../types';
import CFamily from './commands/CFamily';
import DotNet from './commands/DotNet';
import Gradle from './commands/Gradle';
import JavaMaven from './commands/JavaMaven';
import Others from './commands/Others';

export interface AnalysisCommandProps extends WithAvailableFeaturesProps {
  component: Component;
  config: TutorialConfig;
  mainBranchName: string;
  monorepo?: boolean;
}

export function AnalysisCommand(props: Readonly<AnalysisCommandProps>) {
  const { config, component, mainBranchName, monorepo } = props;
  const branchSupportEnabled = props.hasFeature(Feature.BranchSupport);

  switch (config.buildTool) {
    case BuildTools.Maven:
      return (
        <JavaMaven
          branchesEnabled={branchSupportEnabled}
          component={component}
          mainBranchName={mainBranchName}
          monorepo={monorepo}
        />
      );
    case BuildTools.Gradle:
      return (
        <Gradle
          branchesEnabled={branchSupportEnabled}
          component={component}
          mainBranchName={mainBranchName}
          monorepo={monorepo}
        />
      );
    case BuildTools.DotNet:
      return (
        <DotNet
          branchesEnabled={branchSupportEnabled}
          component={component}
          mainBranchName={mainBranchName}
          monorepo={monorepo}
        />
      );
    case BuildTools.Cpp:
    case BuildTools.ObjectiveC:
      return (
        <CFamily
          branchesEnabled={branchSupportEnabled}
          component={component}
          config={config}
          mainBranchName={mainBranchName}
          monorepo={monorepo}
        />
      );
    case BuildTools.Dart:
      return (
        <Others
          branchesEnabled={branchSupportEnabled}
          buildSteps={`
      # The analysis requires to retrieve dependencies and build successfully
      - name: Build project
        run: <commands to build your project>`}
          component={component}
          mainBranchName={mainBranchName}
          monorepo={monorepo}
        />
      );
    case BuildTools.JsTs:
    case BuildTools.Python:
    case BuildTools.Other:
      return (
        <Others
          branchesEnabled={branchSupportEnabled}
          buildSteps=""
          component={component}
          mainBranchName={mainBranchName}
          monorepo={monorepo}
        />
      );
    default:
      return undefined;
  }
}

export default withAvailableFeatures(AnalysisCommand);
