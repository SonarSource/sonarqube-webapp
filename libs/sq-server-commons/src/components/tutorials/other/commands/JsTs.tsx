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

import { Component } from '../../../../types/types';
import { Heading, LinkStandalone } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { CodeSnippet } from '../../../../design-system';
import { DocLink } from '../../../../helpers/doc-links';
import { useDocUrl } from '../../../../helpers/docs';
import { InlineSnippet } from '../../components/InlineSnippet';
import DoneNextSteps from '../DoneNextSteps';

export interface JsTsProps {
  baseUrl: string;
  component: Component;
  token: string;
}

export default function JsTs(props: Readonly<JsTsProps>) {
  const { baseUrl, component, token } = props;

  const installCommand = ['npm install -g @sonar/scan'];

  const executeCommand = ['sonar', `-Dsonar.host.url=${baseUrl}`, `-Dsonar.projectKey=${component.key}`, `-Dsonar.token=${token}`];

  const docUrl = useDocUrl(DocLink.SonarScannerNpm);

  return (
    <div>
      <Heading as="h3" className="sw-mb-2">
        <FormattedMessage id="onboarding.analysis.jsts.install.header" />
      </Heading>
      <CodeSnippet className="sw-p-4" language="shell" snippet={installCommand} />
      <p className="sw-mb-2">
        <FormattedMessage
          id="onboarding.analysis.jsts.step.footer"
          values={{
            link: (
              <LinkStandalone shouldOpenInNewTab to={docUrl}>
                <FormattedMessage id="onboarding.analysis.jsts.links.documentation" />
              </LinkStandalone>
            ),
          }}
        />
      </p>
      <Heading as="h3" className="sw-mb-2">
        <FormattedMessage id="onboarding.analysis.jsts.execute.header" />
      </Heading>
      <p className="sw-mb-2">
        <FormattedMessage
          id="onboarding.analysis.jsts.execute.text"
          values={{
            projectManifestName: <InlineSnippet snippet="package.json" />,
          }}
        />
      </p>
      <CodeSnippet className="sw-p-4" language="shell" snippet={executeCommand} />
      <p className="sw-mt-4">
        <FormattedMessage
          id="onboarding.analysis.jsts.step.footer"
          values={{
            link: (
              <LinkStandalone shouldOpenInNewTab to={docUrl}>
                <FormattedMessage id="onboarding.analysis.jsts.links.documentation" />
              </LinkStandalone>
            ),
          }}
        />
      </p>
      <DoneNextSteps />
    </div>
  );
}
