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

import { Image } from '~adapters/components/common/Image';
import { translate, translateWithParameters } from '../../helpers/l10n';

interface Props {
  isGitHubUser: boolean | undefined;
  isGitLabUser: boolean | undefined;
}

export function IntegrationIcon({ isGitHubUser, isGitLabUser }: Readonly<Props>) {
  if (isGitHubUser) {
    return (
      <Image
        alt="github"
        aria-label={translateWithParameters('project_permission.managed', translate('alm.github'))}
        className="sw-ml-2"
        height={16}
        src="/images/alm/github.svg"
      />
    );
  }

  if (isGitLabUser) {
    return (
      <Image
        alt="gitlab"
        aria-label={translateWithParameters('project_permission.managed', translate('alm.gitlab'))}
        className="sw-ml-2"
        height={16}
        src="/images/alm/gitlab.svg"
      />
    );
  }

  return undefined;
}
