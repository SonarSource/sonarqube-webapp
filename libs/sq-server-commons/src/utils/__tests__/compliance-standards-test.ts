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

import { buildComplianceStandards, parseComplianceStandards } from '../compliance-standards';

describe('buildComplianceStandards', () => {
  it('should build compliance standards with multiple categories in same standard', () => {
    const query = {
      'stig-ASD_V5R3': ['V-222607', 'V-222642'],
      'stig-ASD_V6': ['V-222609'],
    };

    const result = buildComplianceStandards(query);

    expect(result).toBe(
      'stig_asd:urn:sonar-security-standard:stig:asd:v6=V-222609&stig_asd:urn:sonar-security-standard:stig:asd:v5=V-222607,V-222642',
    );
  });

  it('should build compliance standards with single category', () => {
    const query = {
      'owaspTop10-2025': ['A01'],
    };

    const result = buildComplianceStandards(query);

    expect(result).toBe('owasp_top10:urn:sonar-security-standard:owasp:top10:2025=A01');
  });

  it('should build compliance standards with OWASP 2017', () => {
    const query = {
      owaspTop10: ['a1', 'a2'],
    };

    const result = buildComplianceStandards(query);

    expect(result).toBe('owasp_top10:urn:sonar-security-standard:owasp:top10:2017=a1,a2');
  });

  it('should build compliance standards with OWASP 2021', () => {
    const query = {
      'owaspTop10-2021': ['a1', 'a2', 'a3'],
    };

    const result = buildComplianceStandards(query);

    expect(result).toBe('owasp_top10:urn:sonar-security-standard:owasp:top10:2021=a1,a2,a3');
  });

  it('should build compliance standards with multiple categories in multiple standards', () => {
    const query = {
      'owaspTop10-2025': ['A01', 'A02'],
      'stig-ASD_V5R3': ['V-222607', 'V-222642', 'V-222643'],
      'stig-ASD_V6': ['V-222609'],
    };

    const result = buildComplianceStandards(query);

    expect(result).toBe(
      'owasp_top10:urn:sonar-security-standard:owasp:top10:2025=A01,A02&stig_asd:urn:sonar-security-standard:stig:asd:v6=V-222609&stig_asd:urn:sonar-security-standard:stig:asd:v5=V-222607,V-222642,V-222643',
    );
  });

  it('should build compliance standards with all OWASP versions', () => {
    const query = {
      owaspTop10: ['a1'],
      'owaspTop10-2021': ['a2'],
      'owaspTop10-2025': ['A03'],
    };

    const result = buildComplianceStandards(query);

    expect(result).toBe(
      'owasp_top10:urn:sonar-security-standard:owasp:top10:2025=A03&owasp_top10:urn:sonar-security-standard:owasp:top10:2021=a2&owasp_top10:urn:sonar-security-standard:owasp:top10:2017=a1',
    );
  });

  it('should build compliance standards with PCI DSS 3.2', () => {
    const query = {
      'pciDss-3.2': ['1', '2', '3'],
    };

    const result = buildComplianceStandards(query);

    expect(result).toBe('pci_dss:urn:sonar-security-standard:pci:dss:3.2=1,2,3');
  });

  it('should build compliance standards with PCI DSS 4.0', () => {
    const query = {
      'pciDss-4.0': ['1', '2'],
    };

    const result = buildComplianceStandards(query);

    expect(result).toBe('pci_dss:urn:sonar-security-standard:pci:dss:4.0=1,2');
  });

  it('should build compliance standards with both PCI DSS versions', () => {
    const query = {
      'pciDss-3.2': ['1', '2'],
      'pciDss-4.0': ['3', '4'],
    };

    const result = buildComplianceStandards(query);

    expect(result).toBe(
      'pci_dss:urn:sonar-security-standard:pci:dss:4.0=3,4&pci_dss:urn:sonar-security-standard:pci:dss:3.2=1,2',
    );
  });

  it('should return undefined when no standards are provided', () => {
    const query = {};

    const result = buildComplianceStandards(query);

    expect(result).toBeUndefined();
  });

  it('should return undefined when standards arrays are empty', () => {
    const query = {
      'owaspTop10-2025': [],
      'stig-ASD_V5R3': [],
    };

    const result = buildComplianceStandards(query);

    expect(result).toBeUndefined();
  });
});

describe('parseComplianceStandards', () => {
  it('should parse compliance standards with multiple categories', () => {
    const complianceString =
      'stig_asd:urn:sonar-security-standard:stig:asd:v5=V-222607,V-222642&stig_asd:urn:sonar-security-standard:stig:asd:v6=V-222609';

    const result = parseComplianceStandards(complianceString);

    expect(result).toEqual({
      'stig-ASD_V5R3': ['V-222607', 'V-222642'],
      'stig-ASD_V6': ['V-222609'],
    });
  });

  it('should parse compliance standards with single category', () => {
    const complianceString = 'owasp_top10:urn:sonar-security-standard:owasp:top10:2025=A01';

    const result = parseComplianceStandards(complianceString);

    expect(result).toEqual({
      'owaspTop10-2025': ['A01'],
    });
  });

  it('should parse OWASP 2017 compliance standards', () => {
    const complianceString = 'owasp_top10:urn:sonar-security-standard:owasp:top10:2017=a1,a2';

    const result = parseComplianceStandards(complianceString);

    expect(result).toEqual({
      owaspTop10: ['a1', 'a2'],
    });
  });

  it('should parse OWASP 2021 compliance standards', () => {
    const complianceString = 'owasp_top10:urn:sonar-security-standard:owasp:top10:2021=a1,a2,a3';

    const result = parseComplianceStandards(complianceString);

    expect(result).toEqual({
      'owaspTop10-2021': ['a1', 'a2', 'a3'],
    });
  });

  it('should parse compliance standards with multiple standards', () => {
    const complianceString =
      'owasp_top10:urn:sonar-security-standard:owasp:top10:2025=A01,A02&stig_asd:urn:sonar-security-standard:stig:asd:v5=V-222607,V-222642,V-222643&stig_asd:urn:sonar-security-standard:stig:asd:v6=V-222609';

    const result = parseComplianceStandards(complianceString);

    expect(result).toEqual({
      'owaspTop10-2025': ['A01', 'A02'],
      'stig-ASD_V5R3': ['V-222607', 'V-222642', 'V-222643'],
      'stig-ASD_V6': ['V-222609'],
    });
  });

  it('should parse compliance standards with all OWASP versions', () => {
    const complianceString =
      'owasp_top10:urn:sonar-security-standard:owasp:top10:2017=a1&owasp_top10:urn:sonar-security-standard:owasp:top10:2021=a2&owasp_top10:urn:sonar-security-standard:owasp:top10:2025=A03';

    const result = parseComplianceStandards(complianceString);

    expect(result).toEqual({
      owaspTop10: ['a1'],
      'owaspTop10-2021': ['a2'],
      'owaspTop10-2025': ['A03'],
    });
  });

  it('should parse PCI DSS 3.2 compliance standards', () => {
    const complianceString = 'pci_dss:urn:sonar-security-standard:pci:dss:3.2=1,2,3';

    const result = parseComplianceStandards(complianceString);

    expect(result).toEqual({
      'pciDss-3.2': ['1', '2', '3'],
    });
  });

  it('should parse PCI DSS 4.0 compliance standards', () => {
    const complianceString = 'pci_dss:urn:sonar-security-standard:pci:dss:4.0=1,2';

    const result = parseComplianceStandards(complianceString);

    expect(result).toEqual({
      'pciDss-4.0': ['1', '2'],
    });
  });

  it('should parse compliance standards with both PCI DSS versions', () => {
    const complianceString =
      'pci_dss:urn:sonar-security-standard:pci:dss:3.2=1,2&pci_dss:urn:sonar-security-standard:pci:dss:4.0=3,4';

    const result = parseComplianceStandards(complianceString);

    expect(result).toEqual({
      'pciDss-3.2': ['1', '2'],
      'pciDss-4.0': ['3', '4'],
    });
  });

  it('should return empty object when no string is provided', () => {
    const result = parseComplianceStandards(undefined);

    expect(result).toEqual({});
  });

  it('should handle malformed compliance strings gracefully', () => {
    const complianceString = 'invalid&malformed=';

    const result = parseComplianceStandards(complianceString);

    expect(result).toEqual({});
  });

  it('should round-trip correctly', () => {
    const original = {
      'stig-ASD_V5R3': ['V-222607', 'V-222642'],
      'stig-ASD_V6': ['V-222609'],
    };

    const serialized = buildComplianceStandards(original);
    const parsed = parseComplianceStandards(serialized);

    expect(parsed).toEqual(original);
  });

  it('should round-trip PCI DSS correctly', () => {
    const original = {
      'pciDss-3.2': ['1', '2', '3'],
      'pciDss-4.0': ['4', '5'],
    };

    const serialized = buildComplianceStandards(original);
    const parsed = parseComplianceStandards(serialized);

    expect(parsed).toEqual(original);
  });
});
