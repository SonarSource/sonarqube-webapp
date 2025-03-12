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

import { Heading } from '@sonarsource/echoes-react';
import * as React from 'react';
import { BasicSeparator, TutorialStep, TutorialStepList } from '../../../design-system';
import { translate } from '../../../helpers/l10n';
import { AlmKeys, AlmSettingsInstance } from '../../../types/alm-settings';
import { Component } from '../../../types/types';
import { LoggedInUser } from '../../../types/users';
import AllSet from '../components/AllSet';
import YamlFileStep from '../components/YamlFileStep';
import { TutorialConfig, TutorialModes } from '../types';
import AnalysisCommand from './AnalysisCommand';
import SecretStep from './SecretStep';

export interface GitHubActionTutorialProps {
  almBinding?: AlmSettingsInstance;
  baseUrl: string;
  component: Component;
  currentUser: LoggedInUser;
  mainBranchName: string;
  monorepo?: boolean;
  willRefreshAutomatically?: boolean;
}

export default function GitHubActionTutorial(props: Readonly<GitHubActionTutorialProps>) {
  const {
    almBinding,
    baseUrl,
    currentUser,
    component,
    monorepo,
    mainBranchName,
    willRefreshAutomatically,
  } = props;

  const [config, setConfig] = React.useState<TutorialConfig>({});
  const [done, setDone] = React.useState<boolean>(false);

  React.useEffect(() => {
    setDone(Boolean(config.buildTool));
  }, [config.buildTool]);

  return (
    <>
      <Heading as="h1">{translate('onboarding.tutorial.with.github_ci.title')}</Heading>
      <TutorialStepList className="sw-mb-8">
        <TutorialStep
          title={translate('onboarding.tutorial.with.github_action.create_secret.title')}
        >
          <SecretStep
            almBinding={almBinding}
            baseUrl={baseUrl}
            component={component}
            currentUser={currentUser}
            monorepo={monorepo}
          />
        </TutorialStep>
        <TutorialStep title={translate('onboarding.tutorial.with.github_action.yaml.title')}>
          <YamlFileStep ci={TutorialModes.GitHubActions} config={config} setConfig={setConfig}>
            {(config) => (
              <AnalysisCommand
                component={component}
                config={config}
                mainBranchName={mainBranchName}
                monorepo={monorepo}
              />
            )}
          </YamlFileStep>
        </TutorialStep>
        {done && (
          <>
            <BasicSeparator className="sw-my-10" />
            <AllSet
              alm={almBinding?.alm || AlmKeys.GitHub}
              willRefreshAutomatically={willRefreshAutomatically}
            />
          </>
        )}
      </TutorialStepList>
    </>
  );
}
