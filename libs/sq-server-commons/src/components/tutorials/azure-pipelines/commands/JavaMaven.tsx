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

import { Text } from '@sonarsource/echoes-react';
import { NumberedList, NumberedListItem } from '../../../../design-system';
import { translate, translateWithParameters } from '../../../../helpers/l10n';
import SentenceWithHighlights from '../../components/SentenceWithHighlights';
import { BuildTools } from '../../types';
import JavaToolInstallation from '../JavaToolInstallation';
import AlertClassicEditor from './AlertClassicEditor';
import PrepareAnalysisCommand, { PrepareType } from './PrepareAnalysisCommand';
import PublishSteps from './PublishSteps';

export interface JavaMavenProps {
  projectKey: string;
  projectName: string;
}

export default function JavaMaven(props: JavaMavenProps) {
  const { projectKey, projectName } = props;
  return (
    <>
      <AlertClassicEditor />
      <NumberedList className="sw-mt-4">
        <NumberedListItem>
          <SentenceWithHighlights
            highlightKeys={['pipeline', 'task', 'before']}
            translationKey="onboarding.tutorial.with.azure_pipelines.BranchAnalysis.prepare"
          />
          <PrepareAnalysisCommand
            buildTool={BuildTools.Gradle}
            kind={PrepareType.JavaMavenGradle}
            projectKey={projectKey}
            projectName={projectName}
          />
        </NumberedListItem>

        <JavaToolInstallation />

        <NumberedListItem>
          {translateWithParameters(
            'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.java',
            translate('onboarding.build', BuildTools.Maven),
          )}
          <Text as="ul" className="sw-max-w-full sw-ml-6 sw-mb-4">
            <li>
              <SentenceWithHighlights
                highlightKeys={['section', 'option']}
                translationKey="onboarding.tutorial.with.azure_pipelines.BranchAnalysis.java.settings"
              />
            </li>
          </Text>
        </NumberedListItem>

        <PublishSteps />
      </NumberedList>
    </>
  );
}
