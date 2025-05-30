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

import { FormattedMessage } from 'react-intl';
import { FlagMessage } from '~design-system';
import DocumentationLink from '~sq-server-commons/components/common/DocumentationLink';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { translate } from '~sq-server-commons/helpers/l10n';
import { useGetValueQuery } from '~sq-server-commons/queries/settings';
import { AlmKeys } from '~sq-server-commons/types/alm-settings';
import { ExtendedSettingDefinition } from '~sq-server-commons/types/settings';
import { AUTHENTICATION_CATEGORY } from '../../constants';
import CategoryDefinitionsList from '../CategoryDefinitionsList';

interface Props {
  definitions: ExtendedSettingDefinition[];
}

export default function BitbucketAuthenticationTab(props: Readonly<Props>) {
  const { definitions } = props;

  const { data: allowToSignUpEnabled } = useGetValueQuery({
    key: 'sonar.auth.bitbucket.allowUsersToSignUp',
  });
  const { data: workspaces } = useGetValueQuery({ key: 'sonar.auth.bitbucket.workspaces' });

  const isConfigurationUnsafe =
    allowToSignUpEnabled?.value === 'true' &&
    (!workspaces?.values || workspaces?.values.length === 0);

  return (
    <>
      {isConfigurationUnsafe && (
        <FlagMessage className="sw-mb-2" variant="error">
          <div>
            <FormattedMessage
              id="settings.authentication.gitlab.configuration.insecure"
              values={{
                documentation: (
                  <DocumentationLink to={DocLink.AlmBitBucketCloudSettings}>
                    {translate('documentation')}
                  </DocumentationLink>
                ),
              }}
            />
          </div>
        </FlagMessage>
      )}
      <FlagMessage variant="info">
        <div>
          <FormattedMessage
            id="settings.authentication.help"
            values={{
              link: (
                <DocumentationLink to={DocLink.AlmBitBucketCloudAuth}>
                  {translate('settings.authentication.help.link')}
                </DocumentationLink>
              ),
            }}
          />
        </div>
      </FlagMessage>
      <CategoryDefinitionsList
        category={AUTHENTICATION_CATEGORY}
        definitions={definitions}
        displaySubCategoryTitle={false}
        noPadding
        subCategory={AlmKeys.BitbucketServer}
      />
    </>
  );
}
