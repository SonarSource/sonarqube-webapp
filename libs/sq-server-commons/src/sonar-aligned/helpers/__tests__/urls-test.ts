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

import { queryToSearchString } from '~shared/helpers/query';
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

  it('should forward some query parameters and use provided complianceStandards', () => {
    const result = getComponentSecurityHotspotsUrl(SIMPLE_COMPONENT_KEY, undefined, {
      inNewCodePeriod: 'true',
      ignoredParam: '1234',
      complianceStandards:
        'owasp_top10:urn:sonar-security-standard:owasp:top10:2021=a1&cwe_standard:urn:sonar-security-standard:cwe:standard:4.18=79,89,352&pci_dss:urn:sonar-security-standard:pci:dss:4.0=4.1,4.2',
    });

    expect(result).toEqual(
      expect.objectContaining({
        pathname: '/security_hotspots',
      }),
    );

    // Check that the search contains complianceStandards with all expected values
    expect(result.search).toContain('id=sonarqube');
    expect(result.search).toContain('inNewCodePeriod=true');
    expect(result.search).toContain('complianceStandards=');
    expect(result.search).toContain('owasp_top10');
    expect(result.search).toContain('2021');
    expect(result.search).toContain('a1');
    expect(result.search).toContain('cwe_standard');
    expect(result.search).toContain('79');
    expect(result.search).toContain('89');
    expect(result.search).toContain('352');
    expect(result.search).toContain('pci_dss');
    expect(result.search).toContain('4.1');
    expect(result.search).toContain('4.2');
    expect(result.search).not.toContain('ignoredParam');
  });

  it('should use provided complianceStandards parameter if already present', () => {
    expect(
      getComponentSecurityHotspotsUrl(SIMPLE_COMPONENT_KEY, undefined, {
        inNewCodePeriod: 'true',
        complianceStandards: 'owaspTop10-2021=a1&cwe=213',
      }),
    ).toEqual(
      expect.objectContaining({
        pathname: '/security_hotspots',
        search: queryToSearchString({
          id: SIMPLE_COMPONENT_KEY,
          inNewCodePeriod: 'true',
          complianceStandards: 'owaspTop10-2021=a1&cwe=213',
        }),
      }),
    );
  });
});
