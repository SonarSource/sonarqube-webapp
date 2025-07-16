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

import { Heading, LinkStandalone } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { CodeSnippet } from '../../../../design-system';
import { DocLink } from '../../../../helpers/doc-links';
import { useDocUrl } from '../../../../helpers/docs';
import { Component } from '../../../../types/types';
import { InlineSnippet } from '../../components/InlineSnippet';
import DoneNextSteps from '../DoneNextSteps';

export interface PythonProps {
  baseUrl: string;
  component: Component;
  token: string;
}

export default function Python(props: Readonly<PythonProps>) {
  const { baseUrl, component, token } = props;

  const installCommand = ['pip install pysonar'];

  const executeCommand = [
    'pysonar',
    `--sonar-host-url=${baseUrl}`,
    `--sonar-token=${token}`,
    `--sonar-project-key=${component.key}`,
  ];

  const docUrl = useDocUrl(DocLink.SonarScannerPython);

  return (
    <div>
      <Heading as="h3" className="sw-mb-2">
        <FormattedMessage id="onboarding.analysis.python.install.header" />
      </Heading>
      <CodeSnippet className="sw-p-4" language="shell" snippet={installCommand} />
      <p className="sw-mb-2">
        <FormattedMessage
          id="onboarding.analysis.python.step.footer"
          values={{
            link: (
              <LinkStandalone enableOpenInNewTab to={docUrl}>
                <FormattedMessage id="onboarding.analysis.python.links.documentation" />
              </LinkStandalone>
            ),
          }}
        />
      </p>
      <Heading as="h3" className="sw-mb-2">
        <FormattedMessage id="onboarding.analysis.python.execute.header" />
      </Heading>
      <p className="sw-mb-2">
        <FormattedMessage
          id="onboarding.analysis.python.execute.text"
          values={{
            projectManifestName: <InlineSnippet snippet="package.json" />,
          }}
        />
      </p>
      <CodeSnippet className="sw-p-4" language="shell" snippet={executeCommand} />
      <p className="sw-mt-4">
        <FormattedMessage
          id="onboarding.analysis.python.step.footer"
          values={{
            link: (
              <LinkStandalone enableOpenInNewTab to={docUrl}>
                <FormattedMessage id="onboarding.analysis.python.links.documentation" />
              </LinkStandalone>
            ),
          }}
        />
      </p>
      <DoneNextSteps />
    </div>
  );
}
