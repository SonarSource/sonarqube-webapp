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

import { Heading, LinkStandalone as Link } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { DocLink } from '../../../../helpers/doc-links';
import { useDocUrl } from '../../../../helpers/docs';
import { translate } from '../../../../helpers/l10n';
import { InlineSnippet } from '../../components/InlineSnippet';
import { DotNetProps } from './DotNet';
import DotNetExecute from './DotNetExecute';

export default function DotNetFramework(props: Readonly<DotNetProps>) {
  const { baseUrl, component, token } = props;

  const docUrl = useDocUrl(DocLink.SonarScannerDotNet);

  const commands = [
    `SonarScanner.MSBuild.exe begin /k:"${component.key}" /d:sonar.host.url="${baseUrl}" /d:sonar.token="${token}"`,
    'MsBuild.exe /t:Rebuild',
    `SonarScanner.MSBuild.exe end /d:sonar.token="${token}"`,
  ];

  return (
    <div>
      <div>
        <Heading as="h2" className=" sw-mb-2 sw-mt-8">
          {translate('onboarding.analysis.msbuild.header')}
        </Heading>
        <p>
          <FormattedMessage
            id="onboarding.analysis.msbuild.text"
            values={{
              code: <InlineSnippet snippet="SonarScanner.MSBuild.exe" />,
              path: <InlineSnippet snippet="%PATH%" />,
              link: <Link to={docUrl}>{translate('onboarding.analysis.msbuild.docs_link')}</Link>,
            }}
          />
        </p>
      </div>

      <DotNetExecute commands={commands} />
    </div>
  );
}
