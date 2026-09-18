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

import { Heading, LinkStandalone } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import {
  buildCargoManifestSnippet,
  CARGO_BINSTALL_COMMAND,
  CARGO_INSTALL_COMMAND,
  CARGO_MANIFEST_NAME,
  CARGO_SCAN_COMMAND,
  CARGO_WORKSPACE_METADATA_TABLE,
} from '~shared/helpers/tutorials/cargo';
import { CodeSnippet } from '../../../../design-system';
import { DocLink } from '../../../../helpers/doc-links';
import { useDocUrl } from '../../../../helpers/docs';
import { Component } from '../../../../types/types';
import { InlineSnippet } from '../../components/InlineSnippet';
import DoneNextSteps from '../DoneNextSteps';

export interface RustProps {
  baseUrl: string;
  component: Component;
  token: string;
}

export default function Rust(props: Readonly<RustProps>) {
  const { baseUrl, component, token } = props;

  const installCommand = [CARGO_INSTALL_COMMAND];

  const manifestSnippet = buildCargoManifestSnippet({ projectKey: component.key });

  const executeCommand = [
    CARGO_SCAN_COMMAND,
    `-Dsonar.host.url=${baseUrl}`,
    `-Dsonar.token=${token}`,
  ];

  const docUrl = useDocUrl(DocLink.SonarScannerCargo);

  const documentationLink = (
    <LinkStandalone enableOpenInNewTab to={docUrl}>
      <FormattedMessage id="onboarding.analysis.rust.links.documentation" />
    </LinkStandalone>
  );

  return (
    <div>
      <Heading as="h3" className="sw-mb-2">
        <FormattedMessage id="onboarding.analysis.rust.install.header" />
      </Heading>
      <CodeSnippet className="sw-p-4" language="shell" snippet={installCommand} />
      <p className="sw-mb-2">
        <FormattedMessage
          id="onboarding.analysis.rust.install.text"
          values={{
            binstallCommand: <InlineSnippet snippet={CARGO_BINSTALL_COMMAND} />,
          }}
        />
      </p>
      <p className="sw-mb-2">
        <FormattedMessage
          id="onboarding.analysis.rust.step.footer"
          values={{ link: documentationLink }}
        />
      </p>
      <Heading as="h3" className="sw-mb-2">
        <FormattedMessage id="onboarding.analysis.rust.configure.header" />
      </Heading>
      <p className="sw-mb-2">
        <FormattedMessage
          id="onboarding.analysis.rust.configure.text"
          values={{
            projectManifestName: <InlineSnippet snippet={CARGO_MANIFEST_NAME} />,
            workspaceTable: <InlineSnippet snippet={CARGO_WORKSPACE_METADATA_TABLE} />,
          }}
        />
      </p>
      {/* No `toml` grammar is registered; `properties` covers the key/value lines. */}
      <CodeSnippet className="sw-p-4" language="properties" snippet={manifestSnippet} />
      <Heading as="h3" className="sw-mb-2">
        <FormattedMessage id="onboarding.analysis.rust.execute.header" />
      </Heading>
      <p className="sw-mb-2">
        <FormattedMessage id="onboarding.analysis.rust.execute.text" />
      </p>
      <CodeSnippet className="sw-p-4" language="shell" snippet={executeCommand} />
      <p className="sw-mt-4">
        <FormattedMessage
          id="onboarding.analysis.rust.step.footer"
          values={{ link: documentationLink }}
        />
      </p>
      <DoneNextSteps />
    </div>
  );
}
