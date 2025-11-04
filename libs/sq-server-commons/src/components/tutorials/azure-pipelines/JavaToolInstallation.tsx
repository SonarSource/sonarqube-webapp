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
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { NumberedListItem } from '../../../design-system';
import { translate } from '../../../helpers/l10n';

function renderSentenceWithFieldAndValue(props: {
  field: React.ReactNode;
  value: React.ReactNode;
}) {
  const { field, value } = props;
  return (
    <FormattedMessage
      id="onboarding.tutorial.with.azure_pipelines.BranchAnalysis.java_installer.sentence"
      values={{
        field: <b className="sw-font-semibold">{field}</b>,
        value: <b className="sw-font-semibold">{value}</b>,
      }}
    />
  );
}

export default function JavaToolInstallation() {
  return (
    <NumberedListItem>
      {translate('onboarding.tutorial.with.azure_pipelines.BranchAnalysis.java_installer.title')}
      <Text as="ul" className="sw-max-w-full sw-ml-6">
        <li>
          {renderSentenceWithFieldAndValue({
            field: translate(
              'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.java_installer.java_version',
            ),
            value: '17',
          })}
          {' ' /* explicit space between the two strings */}
          {translate(
            'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.java_installer.or_higher',
          )}
        </li>
        <li>
          {renderSentenceWithFieldAndValue({
            field: translate(
              'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.java_installer.java_architecture',
            ),
            value: 'x64',
          })}
        </li>
        <li>
          {renderSentenceWithFieldAndValue({
            field: translate(
              'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.java_installer.java_source',
            ),
            value: translate(
              'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.java_installer.pre-installed',
            ),
          })}
        </li>
      </Text>
    </NumberedListItem>
  );
}
