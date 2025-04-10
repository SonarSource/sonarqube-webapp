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
import { Link } from '~design-system';
import { DocLink } from '~sq-server-shared/helpers/doc-links';
import { useDocUrl } from '~sq-server-shared/helpers/docs';
import { translate } from '~sq-server-shared/helpers/l10n';
import { GitlabBindingDefinition } from '~sq-server-shared/types/alm-settings';
import { AlmBindingDefinitionFormField } from './AlmBindingDefinitionFormField';

export interface GitlabFormProps {
  formData: GitlabBindingDefinition;
  onFieldChange: (fieldId: keyof GitlabBindingDefinition, value: string) => void;
}

export default function GitlabForm(props: GitlabFormProps) {
  const { formData, onFieldChange } = props;
  const toStatic = useDocUrl(DocLink.AlmGitLabIntegration);
  return (
    <>
      <AlmBindingDefinitionFormField
        autoFocus
        help={translate('settings.almintegration.form.name.gitlab.help')}
        id="name.gitlab"
        maxLength={200}
        onFieldChange={onFieldChange}
        propKey="key"
        value={formData.key}
      />
      <AlmBindingDefinitionFormField
        help={
          <>
            {translate('settings.almintegration.form.url.gitlab.help')}
            <br />
            <em>https://gitlab.com/api/v4</em>
            <br />
            <br />
            {translate('settings.almintegration.form.url.pat_warning')}
          </>
        }
        id="url.gitlab"
        maxLength={2000}
        onFieldChange={onFieldChange}
        propKey="url"
        value={formData.url || ''}
      />
      <AlmBindingDefinitionFormField
        help={
          <FormattedMessage
            id="settings.almintegration.form.personal_access_token.gitlab.help"
            values={{
              pat: (
                <Link
                  target="_blank"
                  to="https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html"
                >
                  {translate('settings.almintegration.form.personal_access_token.gitlab.help.url')}
                </Link>
              ),
              permission: <strong>Reporter</strong>,
              scope: <strong>api</strong>,
              doc_link: <Link to={toStatic}>{translate('learn_more')}</Link>,
            }}
          />
        }
        id="personal_access_token"
        isSecret
        isTextArea
        maxLength={2000}
        onFieldChange={onFieldChange}
        overwriteOnly={Boolean(formData.key)}
        propKey="personalAccessToken"
        value={formData.personalAccessToken}
      />
    </>
  );
}
