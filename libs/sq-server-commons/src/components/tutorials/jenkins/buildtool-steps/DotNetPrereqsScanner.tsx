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

import { MessageCallout, MessageVariety, Text } from '@sonarsource/echoes-react';
import { ClipboardIconButton } from '~shared/components/clipboard';
import { NumberedListItem } from '../../../../design-system';
import { translate } from '../../../../helpers/l10n';
import { InlineSnippet } from '../../components/InlineSnippet';
import SentenceWithHighlights from '../../components/SentenceWithHighlights';

export default function DotNetPrereqsScanner() {
  return (
    <NumberedListItem>
      <SentenceWithHighlights
        highlightKeys={['default_scanner']}
        translationKey="onboarding.tutorial.with.jenkins.dotnet.scanner.prereqs.title"
      />
      <br />
      <MessageCallout className="sw-mt-2" variety={MessageVariety.Info}>
        {translate('onboarding.tutorial.with.jenkins.dotnet.scanner.prereqs.info')}
      </MessageCallout>
      <Text as="ol" className="sw-ml-12 sw-list-[lower-alpha]">
        <li>
          <SentenceWithHighlights
            highlightKeys={['path']}
            translationKey="onboarding.tutorial.with.jenkins.dotnet.scanner.prereqs.step1"
          />
        </li>
        <li>
          <SentenceWithHighlights
            highlightKeys={['default_scanner', 'add_scanner_for_msbuild']}
            translationKey="onboarding.tutorial.with.jenkins.dotnet.scanner.prereqs.step2"
          />
        </li>
        <li>
          <SentenceWithHighlights
            highlightKeys={['name']}
            translationKey="onboarding.tutorial.with.jenkins.dotnet.scanner.prereqs.step3"
          />
          <InlineSnippet className="sw-ml-1" snippet="SonarScanner for .NET" />
          <ClipboardIconButton className="sw-ml-2 sw-align-sub" copyValue="SonarScanner for .NET" />
        </li>
        <li>
          <SentenceWithHighlights
            highlightKeys={['install_from']}
            translationKey="onboarding.tutorial.with.jenkins.dotnet.scanner.prereqs.step5"
          />
        </li>
      </Text>
    </NumberedListItem>
  );
}
