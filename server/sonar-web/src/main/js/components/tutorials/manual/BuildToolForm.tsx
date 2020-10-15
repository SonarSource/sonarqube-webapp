/*
 * SonarQube
 * Copyright (C) 2009-2020 SonarSource SA
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
import RadioToggle from 'sonar-ui-common/components/controls/RadioToggle';
import { translate } from 'sonar-ui-common/helpers/l10n';
import RenderOptions from '../components/RenderOptions';
import { BuildTools, ManualTutorialConfig, OSs } from '../types';

interface Props {
  component: T.Component;
  config?: ManualTutorialConfig;
  onDone: (config: ManualTutorialConfig) => void;
}

interface State {
  config: ManualTutorialConfig;
}

export default class BuildToolForm extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      config: this.props.config || {}
    };
  }

  handleBuildToolChange = (buildTool: BuildTools) => {
    this.setState({ config: { buildTool } }, () => {
      this.props.onDone(this.state.config);
    });
  };

  handleOSChange = (os: OSs) => {
    this.setState({ config: { buildTool: BuildTools.Other, os } }, () => {
      this.props.onDone(this.state.config);
    });
  };

  render() {
    const { config } = this.state;
    const buildTools = [BuildTools.Maven, BuildTools.Gradle, BuildTools.DotNet, BuildTools.Other];

    return (
      <>
        <div>
          <h4 className="spacer-bottom">{translate('onboarding.build')}</h4>
          <RadioToggle
            name="language"
            onCheck={this.handleBuildToolChange}
            options={buildTools.map(tool => ({
              label: translate('onboarding.build', tool),
              value: tool
            }))}
            value={config.buildTool}
          />
        </div>

        {config.buildTool === BuildTools.Other && (
          <RenderOptions
            checked={config.os}
            name="os"
            onCheck={this.handleOSChange}
            optionLabelKey="onboarding.build.other.os"
            options={[OSs.Linux, OSs.Windows, OSs.MacOS]}
            titleLabelKey="onboarding.build.other.os"
          />
        )}
      </>
    );
  }
}
