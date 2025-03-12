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

import { Heading, Text } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import { ListItem, OrderedList } from '../../../../design-system';
import { Component } from '../../../../types/types';
import { InlineSnippet } from '../../components/InlineSnippet';
import { Arch, OSs } from '../../types';
import DownloadScanner from './DownloadScanner';
import ExecScanner from './ExecScanner';

export interface DartProps {
  arch: Arch;
  baseUrl: string;
  component: Component;
  isLocal: boolean;
  os: OSs;
  token: string;
}

export default function Dart(props: Readonly<DartProps>) {
  const { arch, baseUrl, os, component, isLocal, token } = props;

  return (
    <div>
      <DownloadScanner arch={arch} isLocal={isLocal} os={os} token={token} />
      <PrepareDart />
      <ExecScanner
        baseUrl={baseUrl}
        component={component}
        isLocal={isLocal}
        os={os}
        token={token}
      />
    </div>
  );
}

function PrepareDart() {
  const intl = useIntl();

  return (
    <>
      <Heading as="h3" className="sw-mt-4 sw-mb-2">
        {intl.formatMessage({ id: 'onboarding.analysis.sq_scanner.prepare' })}
      </Heading>
      <Text>
        {intl.formatMessage({
          id: 'onboarding.analysis.sq_scanner.prepare.flutter',
        })}
      </Text>
      <OrderedList className="sw-list-inside sw-my-2">
        <ListItem className="sw-my-1">
          {intl.formatMessage(
            { id: 'onboarding.analysis.sq_scanner.prepare.flutter.pub_get' },
            {
              snippet: (snippet) => <InlineSnippet snippet={snippet} />,
            },
          )}
        </ListItem>
        <ListItem className="sw-my-1">
          {intl.formatMessage({
            id: 'onboarding.analysis.sq_scanner.prepare.flutter.build',
          })}
        </ListItem>
      </OrderedList>
      <Text>
        {intl.formatMessage({
          id: 'onboarding.analysis.sq_scanner.prepare.flutter.tip',
        })}
      </Text>
    </>
  );
}
