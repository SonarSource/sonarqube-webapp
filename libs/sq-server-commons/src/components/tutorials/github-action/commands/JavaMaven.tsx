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

import { Component } from '../../../../types/types';
import CreateYmlFile from '../../components/CreateYmlFile';
import { GITHUB_ACTIONS_RUNS_ON_LINUX } from '../constants';
import { generateGitHubActionsYaml } from '../utils';
import MonorepoDocLinkFallback from './MonorepoDocLinkFallback';

export interface JavaMavenProps {
  branchesEnabled?: boolean;
  component: Component;
  mainBranchName: string;
  monorepo?: boolean;
}

function mavenYamlSteps(projectKey: string, projectName: string) {
  return `
      - name: Set up JDK 17
        uses: actions/setup-java@c1e323688fd81a25caa38c78aa6df2d33d3e20d9 # v4.8.0
        with:
          java-version: 17
          distribution: 'zulu' # Alternative distribution options are available.
      - name: Cache SonarQube packages
        uses: actions/cache@0057852bfaa89a56745cba8c7296529d2fc39830 # v4.3.0
        with:
          path: ~/.sonar/cache
          key: \${{ runner.os }}-sonar
          restore-keys: \${{ runner.os }}-sonar
      - name: Cache Maven packages
        uses: actions/cache@0057852bfaa89a56745cba8c7296529d2fc39830 # v4.3.0
        with:
          path: ~/.m2
          key: \${{ runner.os }}-m2-\${{ hashFiles('**/pom.xml') }}
          restore-keys: \${{ runner.os }}-m2
      - name: Build and analyze
        env:
          SONAR_TOKEN: \${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: \${{ secrets.SONAR_HOST_URL }}
        run: mvn -B verify org.sonarsource.scanner.maven:sonar-maven-plugin:sonar -Dsonar.projectKey=${projectKey} -Dsonar.projectName='${projectName}'`;
}

export default function JavaMaven(props: JavaMavenProps) {
  const { component, branchesEnabled, mainBranchName, monorepo } = props;

  if (monorepo) {
    return <MonorepoDocLinkFallback />;
  }

  return (
    <CreateYmlFile
      yamlFileName=".github/workflows/build.yml"
      yamlTemplate={generateGitHubActionsYaml(
        mainBranchName,
        !!branchesEnabled,
        GITHUB_ACTIONS_RUNS_ON_LINUX,
        mavenYamlSteps(component.key, component.name),
      )}
    />
  );
}
