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

import { queryToSearchString } from '~shared/helpers/query';
import { StandardsInformationKey } from '~shared/types/security';
import { getComponentSecurityHotspotsUrl } from '../urls';

const SIMPLE_COMPONENT_KEY = 'sonarqube';

describe('#getComponentSecurityHotspotsUrl', () => {
  it('should work with no extra parameters', () => {
    expect(getComponentSecurityHotspotsUrl(SIMPLE_COMPONENT_KEY)).toEqual(
      expect.objectContaining({
        pathname: '/security_hotspots',
        search: queryToSearchString({ id: SIMPLE_COMPONENT_KEY }),
      }),
    );
  });

  it('should forward some query parameters', () => {
    expect(
      getComponentSecurityHotspotsUrl(SIMPLE_COMPONENT_KEY, undefined, {
        inNewCodePeriod: 'true',
        [StandardsInformationKey.OWASP_TOP10_2021]: 'a1',
        [StandardsInformationKey.CWE]: '213',
        [StandardsInformationKey.OWASP_TOP10]: 'a1',
        [StandardsInformationKey.SONARSOURCE]: 'command-injection',
        [StandardsInformationKey.PCI_DSS_3_2]: '4.2',
        [StandardsInformationKey.PCI_DSS_4_0]: '4.1',
        ignoredParam: '1234',
      }),
    ).toEqual(
      expect.objectContaining({
        pathname: '/security_hotspots',
        search: queryToSearchString({
          id: SIMPLE_COMPONENT_KEY,
          inNewCodePeriod: 'true',
          [StandardsInformationKey.OWASP_TOP10_2021]: 'a1',
          [StandardsInformationKey.OWASP_TOP10]: 'a1',
          [StandardsInformationKey.SONARSOURCE]: 'command-injection',
          [StandardsInformationKey.CWE]: '213',
          [StandardsInformationKey.PCI_DSS_3_2]: '4.2',
          [StandardsInformationKey.PCI_DSS_4_0]: '4.1',
        }),
      }),
    );
  });
});
