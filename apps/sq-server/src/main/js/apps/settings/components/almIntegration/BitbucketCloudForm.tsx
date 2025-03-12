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
import { FlagMessage, Link } from '~design-system';
import DocumentationLink from '~sq-server-shared/components/common/DocumentationLink';
import { DocLink } from '~sq-server-shared/helpers/doc-links';
import { translate } from '~sq-server-shared/helpers/l10n';
import { BitbucketCloudBindingDefinition } from '~sq-server-shared/types/alm-settings';
import { BITBUCKET_CLOUD_WORKSPACE_ID_FORMAT } from '../../constants';
import { AlmBindingDefinitionFormField } from './AlmBindingDefinitionFormField';

export interface BitbucketCloudFormProps {
  formData: BitbucketCloudBindingDefinition;
  onFieldChange: (fieldId: keyof BitbucketCloudBindingDefinition, value: string) => void;
}

export default function BitbucketCloudForm(props: BitbucketCloudFormProps) {
  const { formData } = props;
  const workspaceIDIsInvalid = Boolean(
    formData.workspace && !BITBUCKET_CLOUD_WORKSPACE_ID_FORMAT.test(formData.workspace),
  );

  return (
    <>
      <FlagMessage className="sw-mb-8" variant="info">
        <div>
          <FormattedMessage
            defaultMessage={translate(`settings.almintegration.bitbucketcloud.info`)}
            id="settings.almintegration.bitbucketcloud.info"
            values={{
              oauth: (
                <Link
                  target="_blank"
                  to="https://support.atlassian.com/bitbucket-cloud/docs/use-oauth-on-bitbucket-cloud/"
                >
                  {translate('settings.almintegration.bitbucketcloud.oauth')}
                </Link>
              ),
              permission: <strong>Pull Requests: Read</strong>,
              doc_link: (
                <DocumentationLink to={DocLink.AlmBitBucketCloudIntegration}>
                  {translate('learn_more')}
                </DocumentationLink>
              ),
            }}
          />
        </div>
      </FlagMessage>

      <AlmBindingDefinitionFormField
        autoFocus
        help={translate('settings.almintegration.form.name.bitbucketcloud.help')}
        id="name.bitbucket"
        maxLength={200}
        onFieldChange={props.onFieldChange}
        propKey="key"
        value={formData.key || ''}
      />
      <AlmBindingDefinitionFormField
        help={
          <>
            <FormattedMessage
              defaultMessage={translate(
                'settings.almintegration.form.workspace.bitbucketcloud.help',
              )}
              id="settings.almintegration.form.workspace.bitbucketcloud.help"
              values={{
                example: (
                  <>
                    {'https://bitbucket.org/'}
                    <strong>{'{workspace}'}</strong>
                    {'/{repository}'}
                  </>
                ),
              }}
            />
            <p>{translate('settings.almintegration.form.workspace.bitbucketcloud.error')}</p>
          </>
        }
        id="workspace.bitbucketcloud"
        isInvalid={workspaceIDIsInvalid}
        maxLength={80}
        onFieldChange={props.onFieldChange}
        propKey="workspace"
        value={formData.workspace || ''}
      />
      <AlmBindingDefinitionFormField
        help={translate('settings.almintegration.form.oauth_key.bitbucketcloud.help')}
        id="client_id.bitbucketcloud"
        maxLength={80}
        onFieldChange={props.onFieldChange}
        propKey="clientId"
        value={formData.clientId || ''}
      />
      <AlmBindingDefinitionFormField
        help={translate('settings.almintegration.form.oauth_secret.bitbucketcloud.help')}
        id="client_secret.bitbucketcloud"
        isSecret
        maxLength={160}
        onFieldChange={props.onFieldChange}
        overwriteOnly={Boolean(formData.key)}
        propKey="clientSecret"
        value={formData.clientSecret || ''}
      />
    </>
  );
}
