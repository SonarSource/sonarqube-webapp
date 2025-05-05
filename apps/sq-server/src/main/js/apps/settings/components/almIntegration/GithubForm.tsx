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
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { useDocUrl } from '~sq-server-commons/helpers/docs';
import { translate } from '~sq-server-commons/helpers/l10n';
import { GithubBindingDefinition } from '~sq-server-commons/types/alm-settings';
import { AlmBindingDefinitionFormField } from './AlmBindingDefinitionFormField';

export interface GithubFormProps {
  formData: GithubBindingDefinition;
  onFieldChange: (fieldId: keyof GithubBindingDefinition, value: string) => void;
}

export default function GithubForm(props: GithubFormProps) {
  const { formData, onFieldChange } = props;
  const toStatic = useDocUrl(DocLink.AlmGitHubIntegration);
  return (
    <>
      <FlagMessage className="sw-mb-8" variant="info">
        <span>
          <FormattedMessage
            id="settings.almintegration.github.info"
            values={{
              link: <Link to={toStatic}>{translate('learn_more')}</Link>,
            }}
          />
        </span>
      </FlagMessage>
      <AlmBindingDefinitionFormField
        autoFocus
        help={translate('settings.almintegration.form.name.github.help')}
        id="name.github"
        maxLength={200}
        onFieldChange={onFieldChange}
        propKey="key"
        value={formData.key}
      />
      <AlmBindingDefinitionFormField
        help={
          <>
            {translate('settings.almintegration.form.url.github.help1')}
            <br />
            <em>https://github.company.com/api/v3</em>
            <br />
            <br />
            {translate('settings.almintegration.form.url.github.help2')}
            <br />
            <em>https://api.github.com/</em>
            <br />
            <br />
            {translate('settings.almintegration.form.url.github.private_key_warning')}
          </>
        }
        id="url.github"
        maxLength={2000}
        onFieldChange={onFieldChange}
        propKey="url"
        value={formData.url}
      />

      <AlmBindingDefinitionFormField
        help={translate('settings.almintegration.form.app_id.github.help')}
        id="app_id"
        maxLength={80}
        onFieldChange={onFieldChange}
        propKey="appId"
        value={formData.appId}
      />
      <AlmBindingDefinitionFormField
        help={translate('settings.almintegration.form.client_id.github.help')}
        id="client_id.github"
        maxLength={80}
        onFieldChange={onFieldChange}
        propKey="clientId"
        value={formData.clientId}
      />
      <AlmBindingDefinitionFormField
        help={translate('settings.almintegration.form.client_secret.github.help')}
        id="client_secret.github"
        isSecret
        maxLength={160}
        onFieldChange={onFieldChange}
        overwriteOnly={Boolean(formData.key)}
        propKey="clientSecret"
        value={formData.clientSecret}
      />
      <AlmBindingDefinitionFormField
        help={translate('settings.almintegration.form.private_key.github.help')}
        id="private_key"
        isSecret
        isTextArea
        maxLength={2500}
        onFieldChange={onFieldChange}
        overwriteOnly={Boolean(formData.key)}
        propKey="privateKey"
        value={formData.privateKey}
      />
      <AlmBindingDefinitionFormField
        help={translate('settings.almintegration.form.webhook_secret.github.help')}
        id="webhook_secret.github"
        isSecret
        maxLength={160}
        onFieldChange={onFieldChange}
        optional
        overwriteOnly={Boolean(formData.key)}
        propKey="webhookSecret"
        value={formData.webhookSecret}
      />
    </>
  );
}
