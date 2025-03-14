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

import { Heading, MessageCallout, MessageType } from '@sonarsource/echoes-react';
import { CodeSnippet } from '../../../../design-system';
import { translate } from '../../../../helpers/l10n';
import { DotNetProps } from './DotNet';
import DotNetExecute from './DotNetExecute';

export default function DotNetCore(props: Readonly<DotNetProps>) {
  const { baseUrl, component, token } = props;

  const commands = [
    `dotnet sonarscanner begin /k:"${component.key}" /d:sonar.host.url="${baseUrl}"  /d:sonar.token="${token}"`,
    'dotnet build',
    `dotnet sonarscanner end /d:sonar.token="${token}"`,
  ];

  return (
    <div>
      <Heading as="h2" className="sw-mt-8 sw-mb-2">
        {translate('onboarding.analysis.dotnetcore.global')}
      </Heading>
      <p className="sw-mt-4">{translate('onboarding.analysis.dotnetcore.global.text')}</p>
      <CodeSnippet
        className="sw-px-4"
        isOneLine
        snippet="dotnet tool install --global dotnet-sonarscanner"
      />
      <MessageCallout
        className="sw-mt-2"
        text={translate('onboarding.analysis.dotnetcore.global.text.path')}
        type={MessageType.Info}
      />
      <DotNetExecute commands={commands} />
    </div>
  );
}
