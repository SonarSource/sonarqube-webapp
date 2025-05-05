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

import { FlagMessage } from '~design-system';
import { translate, translateWithParameters } from '~sq-server-commons/helpers/l10n';
import { useGithubProvisioningEnabledQuery } from '~sq-server-commons/queries/identity-provider/github';
import { useGilabProvisioningEnabledQuery } from '~sq-server-commons/queries/identity-provider/gitlab';
import { AlmKeys } from '~sq-server-commons/types/alm-settings';

export default function ProvisioningWarning() {
  const { data: gitHubProvisioningStatus } = useGithubProvisioningEnabledQuery();
  const { data: gitLabProvisioningStatus } = useGilabProvisioningEnabledQuery();

  if (gitHubProvisioningStatus || gitLabProvisioningStatus) {
    return (
      <FlagMessage className="sw-w-fit sw-mb-4" variant="warning">
        {translateWithParameters(
          'permission_templates.provisioning_warning',
          translate('alm', gitHubProvisioningStatus ? AlmKeys.GitHub : AlmKeys.GitLab),
        )}
      </FlagMessage>
    );
  }
  return null;
}
