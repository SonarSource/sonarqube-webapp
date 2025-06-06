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

import { pick } from 'lodash';
import { Path } from 'react-router-dom';
import { getBranchLikeQuery } from '~shared/helpers/branch-like';
import { queryToSearchString } from '~shared/helpers/query';
import { BranchLikeBase } from '~shared/types/branch-like';
import { StandardsInformationKey } from '~shared/types/security';
import { Query } from '../../helpers/urls';

export { queryToSearchString } from '~shared/helpers/query';
export { getComponentIssuesUrl } from '~shared/helpers/urls';

/**
 * Generate URL for a component's security hotspot page
 */
export function getComponentSecurityHotspotsUrl(
  componentKey: string,
  branchLike?: BranchLikeBase,
  query: Query = {},
): Partial<Path> {
  const { inNewCodePeriod, hotspots, assignedToMe, files } = query;
  return {
    pathname: '/security_hotspots',
    search: queryToSearchString({
      id: componentKey,
      inNewCodePeriod,
      hotspots,
      assignedToMe,
      files,
      ...getBranchLikeQuery(branchLike),
      ...pick(query, [
        StandardsInformationKey.OWASP_TOP10_2021,
        StandardsInformationKey.OWASP_TOP10,
        StandardsInformationKey.SONARSOURCE,
        StandardsInformationKey.CWE,
        StandardsInformationKey.PCI_DSS_3_2,
        StandardsInformationKey.PCI_DSS_4_0,
        StandardsInformationKey.OWASP_ASVS_4_0,
        StandardsInformationKey.CASA,
        StandardsInformationKey.STIG_ASD_V5R3,
        'owaspAsvsLevel',
      ]),
    }),
    hash: '',
  };
}
