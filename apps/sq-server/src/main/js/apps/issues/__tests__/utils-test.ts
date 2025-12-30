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

import { STANDARDS_REGISTRY } from '~shared/helpers/compliance-standards-registry';
import {
  CodeAttributeCategory,
  SoftwareImpactSeverity,
  SoftwareQuality,
} from '~shared/types/clean-code-taxonomy';
import { StandardsInformationKey } from '~shared/types/security';
import { IssueStatus } from '~sq-server-commons/types/issues';
import {
  parseQuery,
  serializeQuery,
  shouldOpenSonarSourceSecurityFacet,
  shouldOpenStandardsChildFacet,
  shouldOpenStandardsFacet,
} from '~sq-server-commons/utils/issues-utils';

beforeEach(() => {
  jest.clearAllMocks();
});

const generateStandardsWithValues = () =>
  Object.fromEntries(STANDARDS_REGISTRY.map((standard) => [standard.queryProp, ['a', 'b']]));

const generateEmptyStandards = () =>
  Object.fromEntries(STANDARDS_REGISTRY.map((standard) => [standard.queryProp, []]));

const generateExpectedComplianceStandards = () =>
  STANDARDS_REGISTRY.map((standard) => `${standard.backendKey}=a,b`).join('&');

describe('serialize/deserialize', () => {
  it('should serlialize correctly', () => {
    expect(
      serializeQuery({
        assigned: true,
        assignees: ['a', 'b'],
        author: ['a', 'b'],
        cleanCodeAttributeCategories: [CodeAttributeCategory.Responsible],
        impactSeverities: [SoftwareImpactSeverity.High],
        impactSoftwareQualities: [SoftwareQuality.Security],
        codeVariants: ['variant1', 'variant2'],
        createdAfter: new Date(1000000),
        createdAt: 'a',
        createdBefore: new Date(1000000),
        createdInLast: 'a',
        directories: ['a', 'b'],
        files: ['a', 'b'],
        issues: ['a', 'b'],
        languages: ['a', 'b'],
        linkedTicketStatus: [],
        projects: ['a', 'b'],
        rules: ['a', 'b'],
        sort: 'rules',
        scopes: ['a', 'b'],
        severities: ['a', 'b'],
        inNewCodePeriod: true,
        issueStatuses: [IssueStatus.Accepted, IssueStatus.Confirmed],
        tags: ['a', 'b'],
        types: ['a', 'b'],
        statuses: [],
        fixedInPullRequest: '',
        prioritizedRule: true,
        fromSonarQubeUpdate: true,
        // Dynamically add all security standards with ['a', 'b'] values
        ...generateStandardsWithValues(),
      }),
    ).toStrictEqual({
      assignees: 'a,b',
      author: ['a', 'b'],
      cleanCodeAttributeCategories: CodeAttributeCategory.Responsible,
      impactSeverities: SoftwareImpactSeverity.High,
      impactSoftwareQualities: SoftwareQuality.Security,
      codeVariants: 'variant1,variant2',
      complianceStandards: generateExpectedComplianceStandards(),
      createdAt: 'a',
      createdBefore: '1970-01-01',
      createdAfter: '1970-01-01',
      createdInLast: 'a',
      directories: 'a,b',
      files: 'a,b',
      issues: 'a,b',
      languages: 'a,b',
      projects: 'a,b',
      rules: 'a,b',
      s: 'rules',
      scopes: 'a,b',
      inNewCodePeriod: 'true',
      severities: 'a,b',
      issueStatuses: 'ACCEPTED,CONFIRMED',
      tags: 'a,b',
      types: 'a,b',
      prioritizedRule: 'true',
      fromSonarQubeUpdate: 'true',
    });
  });

  it('should deserialize correctly', () => {
    expect(
      parseQuery({
        assigned: 'true',
        assignees: 'first,second',
        author: ['author'],
        cleanCodeAttributeCategories: 'CONSISTENT',
        impactSeverities: 'LOW',
        severities: 'CRITICAL,MAJOR',
        impactSoftwareQualities: 'MAINTAINABILITY',
        prioritizedRule: 'true',
        fromSonarQubeUpdate: 'true',
      }),
    ).toStrictEqual({
      assigned: true,
      assignees: ['first', 'second'],
      author: ['author'],
      cleanCodeAttributeCategories: [CodeAttributeCategory.Consistent],
      codeVariants: [],
      createdAfter: undefined,
      createdAt: '',
      createdBefore: undefined,
      createdInLast: '',
      directories: [],
      files: [],
      impactSeverities: [SoftwareImpactSeverity.Low],
      impactSoftwareQualities: [SoftwareQuality.Maintainability],
      inNewCodePeriod: false,
      issues: [],
      languages: [],
      projects: [],
      rules: [],
      scopes: [],
      severities: ['CRITICAL', 'MAJOR'],
      sort: '',
      issueStatuses: [],
      statuses: [],
      tags: [],
      types: [],
      fixedInPullRequest: '',
      resolved: undefined,
      prioritizedRule: true,
      fromSonarQubeUpdate: true,
      linkedTicketStatus: [],
      // Dynamically add all security standards as empty arrays
      ...generateEmptyStandards(),
    });
  });

  it('should deserialize owaspTop10 from complianceStandards parameter', () => {
    expect(
      parseQuery({
        complianceStandards: 'owasp_top10:urn:sonar-security-standard:owasp:top10:2017=a1,a2',
      }).owaspTop10,
    ).toEqual(['a1', 'a2']);
  });

  it('should deserialize owaspTop10-2021 from complianceStandards parameter', () => {
    expect(
      parseQuery({
        complianceStandards: 'owasp_top10:urn:sonar-security-standard:owasp:top10:2021=a1,a2,a3',
      })['owaspTop10-2021'],
    ).toEqual(['a1', 'a2', 'a3']);
  });

  it('should deserialize owaspTop10-2025 from complianceStandards parameter', () => {
    expect(
      parseQuery({
        complianceStandards: 'owasp_top10:urn:sonar-security-standard:owasp:top10:2025=A01,A02',
      })['owaspTop10-2025'],
    ).toEqual(['A01', 'A02']);
  });

  it('should deserialize stig-ASD_V5R3 from complianceStandards parameter', () => {
    expect(
      parseQuery({
        complianceStandards: 'stig_asd:urn:sonar-security-standard:stig:asd:v5=V-222607,V-222642',
      })['stig-ASD_V5R3'],
    ).toEqual(['V-222607', 'V-222642']);
  });

  it('should deserialize stig-ASD_V6 from complianceStandards parameter', () => {
    expect(
      parseQuery({
        complianceStandards: 'stig_asd:urn:sonar-security-standard:stig:asd:v6=V-222609',
      })['stig-ASD_V6'],
    ).toEqual(['V-222609']);
  });

  it('should deserialize sonarsourceSecurity from complianceStandards parameter', () => {
    expect(
      parseQuery({
        complianceStandards:
          'sonar_standard:urn:sonar-security-standard:sonar:standard:unversioned=sql-injection,command-injection',
      }).sonarsourceSecurity,
    ).toEqual(['sql-injection', 'command-injection']);
  });

  it('should deserialize cwe from complianceStandards parameter', () => {
    expect(
      parseQuery({
        complianceStandards: 'cwe_standard:urn:sonar-security-standard:cwe:standard:4.18=79,89,352',
      }).cwe,
    ).toEqual(['79', '89', '352']);
  });

  it('should use complianceStandards parameter', () => {
    const result = parseQuery({
      complianceStandards: 'owasp_top10:urn:sonar-security-standard:owasp:top10:2017=a1,a2',
    });
    expect(result.owaspTop10).toEqual(['a1', 'a2']);
  });

  it('should map deprecated status and resolution query to new issue statuses', () => {
    expect(parseQuery({ statuses: 'OPEN' }).issueStatuses).toEqual([IssueStatus.Open]);
    expect(parseQuery({ statuses: 'REOPENED' }).issueStatuses).toEqual([IssueStatus.Open]);
    expect(parseQuery({ statuses: 'CONFIRMED' }).issueStatuses).toEqual([IssueStatus.Confirmed]);
    expect(parseQuery({ statuses: 'RESOLVED' }).issueStatuses).toEqual([
      IssueStatus.Fixed,
      IssueStatus.Accepted,
      IssueStatus.FalsePositive,
    ]);
    expect(parseQuery({ statuses: 'OPEN,REOPENED' }).issueStatuses).toEqual([IssueStatus.Open]);
    expect(parseQuery({ statuses: 'OPEN,CONFIRMED' }).issueStatuses).toEqual([
      IssueStatus.Open,
      IssueStatus.Confirmed,
    ]);

    // Resolutions
    expect(parseQuery({ resolutions: 'FALSE-POSITIVE' }).issueStatuses).toEqual([
      IssueStatus.FalsePositive,
    ]);
    expect(parseQuery({ resolutions: 'WONTFIX' }).issueStatuses).toEqual([IssueStatus.Accepted]);
    expect(parseQuery({ resolutions: 'REMOVED' }).issueStatuses).toEqual([IssueStatus.Fixed]);
    expect(parseQuery({ resolutions: 'REMOVED,WONTFIX,FALSE-POSITIVE' }).issueStatuses).toEqual([
      IssueStatus.Fixed,
      IssueStatus.Accepted,
      IssueStatus.FalsePositive,
    ]);

    // Both statuses and resolutions
    expect(
      parseQuery({ resolutions: 'FALSE-POSITIVE', statuses: 'RESOLVED' }).issueStatuses,
    ).toEqual([IssueStatus.FalsePositive]);
    expect(parseQuery({ resolutions: 'WONTFIX', statuses: 'RESOLVED' }).issueStatuses).toEqual([
      IssueStatus.Accepted,
    ]);

    // With resolved=false
    expect(
      parseQuery({ resolutions: 'WONTFIX', statuses: 'RESOLVED', resolved: 'false' }).issueStatuses,
    ).toEqual([IssueStatus.Accepted, IssueStatus.Open, IssueStatus.Confirmed]);
    expect(parseQuery({ statuses: 'OPEN', resolved: 'false' }).issueStatuses).toEqual([
      IssueStatus.Open,
    ]);

    // With new status
    expect(
      parseQuery({
        resolutions: 'WONTFIX',
        statuses: 'RESOLVED',
        resolved: 'false',
        issueStatuses: 'FIXED',
      }).issueStatuses,
    ).toEqual([IssueStatus.Fixed]);
  });
});

describe('shouldOpenStandardsFacet', () => {
  it('should open standard facet', () => {
    expect(shouldOpenStandardsFacet({ standards: true }, { types: [] })).toBe(true);
    expect(shouldOpenStandardsFacet({ owaspTop10: true }, { types: [] })).toBe(true);
    expect(shouldOpenStandardsFacet({}, { types: ['VULNERABILITY'] })).toBe(true);
    expect(shouldOpenStandardsFacet({ standards: false }, { types: ['VULNERABILITY'] })).toBe(true);
  });

  it('should NOT open standard facet', () => {
    expect(shouldOpenStandardsFacet({ standards: false }, { types: ['BUGS'] })).toBe(false);
    expect(shouldOpenStandardsFacet({}, { types: [] })).toBe(false);
    expect(shouldOpenStandardsFacet({}, {})).toBe(false);
    expect(shouldOpenStandardsFacet({}, { types: ['BUGS'] })).toBe(false);
    expect(shouldOpenStandardsFacet({}, { types: ['BUGS'] })).toBe(false);
  });
});

describe('shouldOpenStandardsChildFacet', () => {
  it('should open standard child facet', () => {
    expect(
      shouldOpenStandardsChildFacet({ owaspTop10: true }, {}, StandardsInformationKey.OWASP_TOP10),
    ).toBe(true);
    expect(
      shouldOpenStandardsChildFacet(
        { cwe: true },
        { owaspTop10: ['A1'] },
        StandardsInformationKey.OWASP_TOP10,
      ),
    ).toBe(true);
    expect(
      shouldOpenStandardsChildFacet(
        { owaspTop10: false },
        { owaspTop10: ['A1'] },
        StandardsInformationKey.OWASP_TOP10,
      ),
    ).toBe(true);
    expect(
      shouldOpenStandardsChildFacet(
        {},
        { owaspTop10: ['A1'] },
        StandardsInformationKey.OWASP_TOP10,
      ),
    ).toBe(true);
    expect(
      shouldOpenStandardsChildFacet(
        {},
        { owaspTop10: ['A1'], sonarsourceSecurity: ['sql-injection'] },
        StandardsInformationKey.SONARSOURCE,
      ),
    ).toBe(true);
    expect(
      shouldOpenStandardsChildFacet(
        { 'owaspMobileTop10-2024': true },
        {},
        StandardsInformationKey.OWASP_MOBILE_TOP10_2024,
      ),
    ).toBe(true);
    expect(
      shouldOpenStandardsChildFacet(
        {},
        { 'owaspMobileTop10-2024': ['M1'] },
        StandardsInformationKey.OWASP_MOBILE_TOP10_2024,
      ),
    ).toBe(true);
  });

  it('should NOT open standard child facet', () => {
    expect(
      shouldOpenStandardsChildFacet({ standards: true }, {}, StandardsInformationKey.OWASP_TOP10),
    ).toBe(false);
    expect(
      shouldOpenStandardsChildFacet({ cwe: true }, {}, StandardsInformationKey.OWASP_TOP10),
    ).toBe(false);
    expect(
      shouldOpenStandardsChildFacet(
        {},
        { types: ['VULNERABILITY'] },
        StandardsInformationKey.OWASP_TOP10,
      ),
    ).toBe(false);
    expect(
      shouldOpenStandardsChildFacet(
        {},
        { owaspTop10: ['A1'], sonarsourceSecurity: ['sql-injection'] },
        StandardsInformationKey.OWASP_TOP10_2021,
      ),
    ).toBe(false);
  });
});

describe('shouldOpenSonarSourceSecurityFacet', () => {
  it('should open sonarsourceSecurity facet', () => {
    expect(shouldOpenSonarSourceSecurityFacet({}, { sonarsourceSecurity: ['xss'] })).toBe(true);
    expect(shouldOpenSonarSourceSecurityFacet({ sonarsourceSecurity: true }, {})).toBe(true);
    expect(shouldOpenSonarSourceSecurityFacet({ standards: true }, {})).toBe(true);
    expect(shouldOpenSonarSourceSecurityFacet({}, { types: ['VULNERABILITY'] })).toBe(true);
    expect(
      shouldOpenSonarSourceSecurityFacet(
        { sonarsourceSecurity: false },
        { sonarsourceSecurity: ['xss'] },
      ),
    ).toBe(true);
  });

  it('should NOT open sonarsourceSecurity facet', () => {
    expect(shouldOpenSonarSourceSecurityFacet({ standards: false }, {})).toBe(false);
    expect(shouldOpenSonarSourceSecurityFacet({ owaspTop10: true }, {})).toBe(false);
    expect(shouldOpenSonarSourceSecurityFacet({ standards: true, cwe: true }, {})).toBe(false);
  });
});
