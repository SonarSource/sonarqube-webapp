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

import { Text } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { ClipboardIconButton } from '~shared/components/clipboard';
import { CodeSnippet } from '../../../../design-system';
import { translate } from '../../../../helpers/l10n';
import { InlineSnippet } from '../../components/InlineSnippet';
import SentenceWithHighlights from '../../components/SentenceWithHighlights';
import { BuildTools } from '../../types';
import { isCFamily } from '../../utils';

export enum PrepareType {
  JavaMavenGradle,
  StandAlone,
  MSBuild,
}

export interface PrepareAnalysisCommandProps {
  buildTool: BuildTools;
  kind: PrepareType;
  projectKey: string;
  projectName?: string;
}

export default function PrepareAnalysisCommand(props: PrepareAnalysisCommandProps) {
  const { buildTool, kind, projectKey, projectName } = props;

  const ADDITIONAL_PROPERTY = 'sonar.cfamily.compile-commands=bw-output/compile_commands.json';

  const MAVEN_GRADLE_PROPS_SNIPPET = `# Additional properties that will be passed to the scanner,
# Put one key=value per line, example:
# sonar.exclusions=**/*.bin
sonar.projectKey=${projectKey}
sonar.projectName=${projectName}
`;

  return (
    <Text as="ul" className="sw-max-w-full sw-ml-6 sw-my-2">
      <li>
        <SentenceWithHighlights
          highlightKeys={['endpoint']}
          translationKey="onboarding.tutorial.with.azure_pipelines.BranchAnalysis.prepare.endpoint"
        />
      </li>
      <li>
        <FormattedMessage
          id="onboarding.tutorial.with.azure_pipelines.BranchAnalysis.prepare.run_analysis"
          values={{
            section: (
              <b>
                {translate(
                  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.prepare.run_analysis.section',
                )}
              </b>
            ),
            run_analysis_value: (
              <b>
                {translate(
                  'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.prepare.run_analysis.values',
                  buildTool,
                )}
              </b>
            ),
          }}
        />
      </li>

      {kind === PrepareType.StandAlone && (
        <>
          <li>
            <SentenceWithHighlights
              highlightKeys={['mode']}
              translationKey="onboarding.tutorial.with.azure_pipelines.BranchAnalysis.manual"
            />
          </li>

          <li>
            <span className="sw-flex sw-items-center">
              <FormattedMessage
                id="onboarding.tutorial.with.azure_pipelines.BranchAnalysis.run.key.sentence"
                values={{
                  project_key: (
                    <b className="sw-mx-1">
                      {translate(
                        'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.run.key.sentence.project_key',
                      )}
                    </b>
                  ),
                  key: (
                    <span className="sw-ml-1">
                      <InlineSnippet snippet={projectKey} />
                    </span>
                  ),
                  button: <ClipboardIconButton className="sw-ml-2" copyValue={projectKey} />,
                }}
              />
            </span>
          </li>
          {isCFamily(buildTool) && (
            <li>
              <span className="sw-flex sw-items-center sw-flex-wrap">
                <FormattedMessage
                  id="onboarding.tutorial.with.azure_pipelines.BranchAnalysis.prepare_additional.ccpp"
                  values={{
                    advanced: (
                      <b className="sw-mx-1">
                        {translate(
                          'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.prepare_additional.ccpp.advanced',
                        )}
                      </b>
                    ),
                    additional: (
                      <b className="sw-mx-1">
                        {translate(
                          'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.prepare_additional.ccpp.additional',
                        )}
                      </b>
                    ),
                    property: (
                      <span className="sw-ml-1">
                        <InlineSnippet snippet={ADDITIONAL_PROPERTY} />
                      </span>
                    ),
                    button: (
                      <ClipboardIconButton className="sw-ml-2" copyValue={ADDITIONAL_PROPERTY} />
                    ),
                  }}
                />
              </span>
            </li>
          )}
        </>
      )}

      {kind === PrepareType.JavaMavenGradle && (
        <li>
          <SentenceWithHighlights
            highlightKeys={['section', 'properties']}
            translationKey="onboarding.tutorial.with.azure_pipelines.BranchAnalysis.advanced_properties"
          />
          :
          <CodeSnippet
            className="sw-p-6"
            language="properties"
            snippet={MAVEN_GRADLE_PROPS_SNIPPET}
          />
        </li>
      )}
      {kind === PrepareType.MSBuild && (
        <li>
          <span className="sw-flex sw-items-center">
            <FormattedMessage
              id="onboarding.tutorial.with.azure_pipelines.BranchAnalysis.run.key.sentence"
              values={{
                project_key: (
                  <b className="sw-mx-1">
                    {translate(
                      'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.run.key.sentence.project_key',
                    )}
                  </b>
                ),
                key: (
                  <span className="sw-ml-1">
                    <InlineSnippet snippet={projectKey} />
                  </span>
                ),
                button: <ClipboardIconButton className="sw-ml-2" copyValue={projectKey} />,
              }}
            />
          </span>
        </li>
      )}
    </Text>
  );
}
