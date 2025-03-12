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

import { Link, MessageCallout, MessageType } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { DocLink } from '../../../../helpers/doc-links';
import { useDocUrl } from '../../../../helpers/docs';
import { translate } from '../../../../helpers/l10n';

export default function AlertClassicEditor() {
  const docUrl = useDocUrl(DocLink.AlmAzureIntegration);

  return (
    <MessageCallout
      className="sw-mt-4"
      text={
        <span>
          <FormattedMessage
            defaultMessage={translate(
              'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.info',
            )}
            id="onboarding.tutorial.with.azure_pipelines.BranchAnalysis.info"
            values={{
              doc_link: (
                <Link to={docUrl}>
                  {translate(
                    'onboarding.tutorial.with.azure_pipelines.BranchAnalysis.info.doc_link',
                  )}
                </Link>
              ),
            }}
          />
        </span>
      }
      type={MessageType.Info}
    />
  );
}
