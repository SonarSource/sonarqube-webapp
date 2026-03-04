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

import { StandardsInformationKey } from '../../types/security';
import {
  buildComplianceStandards,
  generatePdfExportStandards,
  getAllComplianceStandardFacets,
  getAllSecurityStandards,
  getAllStandardLevels,
  getDefaultPdfStandards,
  getStandardDefinition,
  getStandardDefinitionByQueryProp,
  getStandardLevels,
  getStandardsAvailableInIssuesFilter,
  getStandardsAvailableInPDFReports,
  getStandardsInformationKeyFromRegistry,
  getStandardUrl,
  getStandardVersionsFromRegistry,
  isComplianceStandardFacet,
  isStandardAvailableInPDFReports,
  mapBackendFacetKeyToQueryProp,
  mapFacetToBackendName,
  parseComplianceStandards,
  populateStandardsFromParsed,
} from '../compliance-standards-registry';
import { STANDARDS_REGISTRY } from '../compliance-standards-registry-definitions';

describe('compliance-standards-registry', () => {
  describe('STANDARDS_REGISTRY', () => {
    it('should contain all expected standards', () => {
      expect(STANDARDS_REGISTRY.length).toBeGreaterThan(0);
      expect(STANDARDS_REGISTRY).toContainEqual(
        expect.objectContaining({
          key: StandardsInformationKey.SONARSOURCE,
          displayName: 'sonarsourceSecurity',
        }),
      );
    });

    it('should have unique keys for each standard', () => {
      const keys = STANDARDS_REGISTRY.map((s) => s.key);
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(keys.length);
    });

    it('should have all required properties for each standard', () => {
      STANDARDS_REGISTRY.forEach((standard) => {
        expect(standard).toHaveProperty('backendKey');
        expect(standard).toHaveProperty('displayName');
        expect(standard).toHaveProperty('enumKey');
        expect(standard).toHaveProperty('key');
        expect(standard).toHaveProperty('queryProp');
        expect(standard).toHaveProperty('renderCategory');
        expect(typeof standard.renderCategory).toBe('function');
      });
    });
  });

  describe('getStandardDefinition', () => {
    it('should return the correct standard definition by key', () => {
      const definition = getStandardDefinition(StandardsInformationKey.SONARSOURCE);
      expect(definition).toBeDefined();
      expect(definition?.key).toBe(StandardsInformationKey.SONARSOURCE);
      expect(definition?.displayName).toBe('sonarsourceSecurity');
    });

    it('should return the correct definition for PCI DSS 4.0', () => {
      const definition = getStandardDefinition(StandardsInformationKey.PCI_DSS_4_0);
      expect(definition).toBeDefined();
      expect(definition?.key).toBe(StandardsInformationKey.PCI_DSS_4_0);
      expect(definition?.version).toBe('4.0');
    });

    it('should return the correct definition for OWASP Top 10 2025', () => {
      const definition = getStandardDefinition(StandardsInformationKey.OWASP_TOP10_2025);
      expect(definition).toBeDefined();
      expect(definition?.key).toBe(StandardsInformationKey.OWASP_TOP10_2025);
      expect(definition?.version).toBe('2025');
    });

    it('should return undefined for non-existent key', () => {
      const definition = getStandardDefinition('non-existent-key' as StandardsInformationKey);
      expect(definition).toBeUndefined();
    });
  });

  describe('getStandardDefinitionByQueryProp', () => {
    it('should return the correct standard definition by queryProp', () => {
      const definition = getStandardDefinitionByQueryProp('sonarsourceSecurity');
      expect(definition).toBeDefined();
      expect(definition?.queryProp).toBe('sonarsourceSecurity');
      expect(definition?.key).toBe(StandardsInformationKey.SONARSOURCE);
    });

    it('should return the correct definition for versioned standards', () => {
      const definition = getStandardDefinitionByQueryProp('pciDss-4.0');
      expect(definition).toBeDefined();
      expect(definition?.queryProp).toBe('pciDss-4.0');
      expect(definition?.version).toBe('4.0');
    });

    it('should return undefined for non-existent queryProp', () => {
      const definition = getStandardDefinitionByQueryProp('non-existent-query');
      expect(definition).toBeUndefined();
    });
  });

  describe('isStandardAvailableInPDFReports', () => {
    it('should return true for standards available in PDF reports', () => {
      expect(isStandardAvailableInPDFReports(StandardsInformationKey.SONARSOURCE)).toBe(true);
      expect(isStandardAvailableInPDFReports(StandardsInformationKey.PCI_DSS_4_0)).toBe(true);
      expect(isStandardAvailableInPDFReports(StandardsInformationKey.OWASP_TOP10_2025)).toBe(true);
    });

    it('should return false for CWE standard (non-versioned)', () => {
      expect(isStandardAvailableInPDFReports(StandardsInformationKey.CWE)).toBe(false);
    });

    it('should return false for non-existent standard', () => {
      expect(isStandardAvailableInPDFReports('non-existent' as StandardsInformationKey)).toBe(
        false,
      );
    });
  });

  describe('getStandardsAvailableInIssuesFilter', () => {
    it('should return standards for issues filter', () => {
      const standards = getStandardsAvailableInIssuesFilter();
      expect(standards.length).toBeGreaterThan(0);
    });

    it('should exclude year-specific CWE Top 25 standards', () => {
      const standards = getStandardsAvailableInIssuesFilter();
      const cweStandards = standards.filter((s) => s.queryProp.startsWith('cwe'));

      // Should only have the base 'cwe' standard, not cwe-2021, cwe-2022, etc.
      expect(cweStandards.length).toBe(1);
      expect(cweStandards[0].queryProp).toBe('cwe');
      expect(cweStandards[0].version).toBeUndefined();
    });

    it('should include only one standard per queryProp', () => {
      const standards = getStandardsAvailableInIssuesFilter();
      const queryProps = standards.map((s) => s.queryProp);
      const uniqueQueryProps = new Set(queryProps);
      expect(uniqueQueryProps.size).toBe(queryProps.length);
    });

    it('should prefer base standard without version when multiple exist', () => {
      const standards = getStandardsAvailableInIssuesFilter();
      const owaspTop10 = standards.find((s) => s.queryProp === 'owaspTop10');

      // When there are multiple versions, should prefer the base one without version
      // or return the first one if all have versions
      expect(owaspTop10).toBeDefined();
    });
  });

  describe('getStandardsAvailableInPDFReports', () => {
    it('should return only standards available in PDF reports', () => {
      const standards = getStandardsAvailableInPDFReports();
      standards.forEach((standard) => {
        expect(standard.availableInPDFReports).toBe(true);
      });
    });

    it('should include versioned CWE Top 25 standards', () => {
      const standards = getStandardsAvailableInPDFReports();
      const cweStandards = standards.filter((s) => s.enumKey === 'CWE_TOP_25');

      // Should include year-specific CWE standards (2021, 2022, 2023, 2024)
      expect(cweStandards.length).toBeGreaterThan(1);
    });

    it('should not include the base CWE standard', () => {
      const standards = getStandardsAvailableInPDFReports();
      const baseCwe = standards.find((s) => s.key === StandardsInformationKey.CWE);
      expect(baseCwe).toBeUndefined();
    });
  });

  describe('getStandardVersionsFromRegistry', () => {
    it('should return all versions for PCI DSS in reverse order', () => {
      const versions = getStandardVersionsFromRegistry('pciDss');
      expect(versions).toContain('4.0');
      expect(versions).toContain('3.2');
      expect(versions[0]).toBe('4.0'); // Newest first
      expect(versions[1]).toBe('3.2');
    });

    it('should return all versions for OWASP Top 10', () => {
      const versions = getStandardVersionsFromRegistry('owaspTop10');
      expect(versions.length).toBeGreaterThan(0);
      expect(versions).toContain('2025');
      expect(versions).toContain('2021');
      expect(versions).toContain('2017');
    });

    it('should return all versions for OWASP ASVS', () => {
      const versions = getStandardVersionsFromRegistry('owaspAsvs');
      expect(versions).toContain('5.0');
      expect(versions).toContain('4.0');
      expect(versions[0]).toBe('5.0'); // Newest first
    });

    it('should return all versions for CWE Top 25', () => {
      const versions = getStandardVersionsFromRegistry('cweTop25');
      expect(versions.length).toBeGreaterThan(0);
      expect(versions).toContain('2024');
      expect(versions).toContain('2023');
    });

    it('should return empty array for standard without versions', () => {
      const versions = getStandardVersionsFromRegistry('sonarsourceSecurity');
      expect(versions).toEqual([]);
    });

    it('should return empty array for non-existent standard', () => {
      const versions = getStandardVersionsFromRegistry('non-existent-standard');
      expect(versions).toEqual([]);
    });
  });

  describe('getStandardLevels', () => {
    it('should return levels for OWASP ASVS 5.0', () => {
      const levels = getStandardLevels(StandardsInformationKey.OWASP_ASVS_5_0);
      expect(levels).toEqual(['1', '2', '3']);
    });

    it('should return levels for OWASP ASVS 4.0', () => {
      const levels = getStandardLevels(StandardsInformationKey.OWASP_ASVS_4_0);
      expect(levels).toEqual(['1', '2', '3']);
    });

    it('should return empty array for standards without levels', () => {
      const levels = getStandardLevels(StandardsInformationKey.SONARSOURCE);
      expect(levels).toEqual([]);
    });

    it('should return empty array for non-existent standard', () => {
      const levels = getStandardLevels('non-existent' as StandardsInformationKey);
      expect(levels).toEqual([]);
    });
  });

  describe('getAllSecurityStandards', () => {
    it('should return all unique security standards', () => {
      const standards = getAllSecurityStandards();
      expect(standards.length).toBeGreaterThan(0);
      expect(standards).toContain('sonarsourceSecurity');
      expect(standards).toContain('pciDss');
      expect(standards).toContain('owaspTop10');
      expect(standards).toContain('cweTop25');
    });

    it('should not contain duplicates', () => {
      const standards = getAllSecurityStandards();
      const uniqueStandards = new Set(standards);
      expect(uniqueStandards.size).toBe(standards.length);
    });

    it('should include stig', () => {
      const standards = getAllSecurityStandards();
      expect(standards).toContain('stig');
    });

    it('should include casa', () => {
      const standards = getAllSecurityStandards();
      expect(standards).toContain('casa');
    });
  });

  describe('getAllStandardLevels', () => {
    it('should return all unique levels sorted', () => {
      const levels = getAllStandardLevels();
      expect(levels).toEqual(['1', '2', '3']);
    });

    it('should not contain duplicates', () => {
      const levels = getAllStandardLevels();
      const uniqueLevels = new Set(levels);
      expect(uniqueLevels.size).toBe(levels.length);
    });
  });

  describe('getStandardsInformationKeyFromRegistry', () => {
    it('should return the correct key for security standard without version', () => {
      const key = getStandardsInformationKeyFromRegistry('sonarsourceSecurity');
      expect(key).toBe(StandardsInformationKey.SONARSOURCE);
    });

    it('should return the correct key for security standard with version', () => {
      const key = getStandardsInformationKeyFromRegistry('pciDss', '4.0');
      expect(key).toBe(StandardsInformationKey.PCI_DSS_4_0);
    });

    it('should return the correct key for PCI DSS 3.2', () => {
      const key = getStandardsInformationKeyFromRegistry('pciDss', '3.2');
      expect(key).toBe(StandardsInformationKey.PCI_DSS_3_2);
    });

    it('should return the correct key for OWASP Top 10 2025', () => {
      const key = getStandardsInformationKeyFromRegistry('owaspTop10', '2025');
      expect(key).toBe(StandardsInformationKey.OWASP_TOP10_2025);
    });

    it('should return the correct key for OWASP Top 10 2021', () => {
      const key = getStandardsInformationKeyFromRegistry('owaspTop10', '2021');
      expect(key).toBe(StandardsInformationKey.OWASP_TOP10_2021);
    });

    it('should return the first match when version is not specified', () => {
      const key = getStandardsInformationKeyFromRegistry('owaspTop10');
      // Should return one of the OWASP Top 10 keys (typically the first/latest)
      expect(key).toBeDefined();
      expect(typeof key).toBe('string');
    });

    it('should return the first match when version does not exist', () => {
      const key = getStandardsInformationKeyFromRegistry('pciDss', '99.9');
      // Should fall back to first match
      expect([StandardsInformationKey.PCI_DSS_4_0, StandardsInformationKey.PCI_DSS_3_2]).toContain(
        key,
      );
    });

    it('should return input as-is for non-existent standard', () => {
      const key = getStandardsInformationKeyFromRegistry('non-existent-standard');
      expect(key).toBe('non-existent-standard');
    });

    it('should handle OWASP ASVS with versions', () => {
      const key50 = getStandardsInformationKeyFromRegistry('owaspAsvs', '5.0');
      expect(key50).toBe(StandardsInformationKey.OWASP_ASVS_5_0);

      const key40 = getStandardsInformationKeyFromRegistry('owaspAsvs', '4.0');
      expect(key40).toBe(StandardsInformationKey.OWASP_ASVS_4_0);
    });
  });

  describe('getStandardUrl', () => {
    it('should return the correct URL for OWASP ASVS', () => {
      const url = getStandardUrl('owaspAsvs');
      expect(url).toBe('https://owasp.org/www-project-application-security-verification-standard/');
    });

    it('should return the correct URL for OWASP Top 10', () => {
      const url = getStandardUrl('owaspTop10');
      expect(url).toBe('https://owasp.org/Top10/');
    });

    it('should return the correct URL for CWE', () => {
      const url = getStandardUrl('cweTop25');
      expect(url).toBe('https://cwe.mitre.org/top25/index.html');
    });

    it('should return undefined for standards without URL', () => {
      const url = getStandardUrl('sonarsourceSecurity');
      expect(url).toBeUndefined();
    });

    it('should return undefined for non-existent standard', () => {
      const url = getStandardUrl('non-existent-standard');
      expect(url).toBeUndefined();
    });
  });

  describe('getDefaultPdfStandards', () => {
    it('should include SonarSource Security', () => {
      const defaults = getDefaultPdfStandards();
      expect(defaults).toContain(StandardsInformationKey.SONARSOURCE);
    });

    it('should include the latest CWE Top 25 in correct format', () => {
      const defaults = getDefaultPdfStandards();
      const cweDefault = defaults.find((s) => s.startsWith('cweTop25-'));
      expect(cweDefault).toBeDefined();
      expect(cweDefault).toMatch(/^cweTop25-\d{4}$/);
    });

    it('should include the latest OWASP Top 10', () => {
      const defaults = getDefaultPdfStandards();
      const owaspKeys = [
        StandardsInformationKey.OWASP_TOP10_2025,
        StandardsInformationKey.OWASP_TOP10_2021,
        StandardsInformationKey.OWASP_TOP10,
      ];
      const hasOwaspDefault = defaults.some((s) =>
        owaspKeys.includes(s as StandardsInformationKey),
      );
      expect(hasOwaspDefault).toBe(true);
    });

    it('should return exactly 3 defaults', () => {
      const defaults = getDefaultPdfStandards();
      expect(defaults.length).toBe(3);
    });
  });

  describe('generatePdfExportStandards', () => {
    it('should generate PDF export standards structure', () => {
      const pdfStandards = generatePdfExportStandards();
      expect(pdfStandards.length).toBeGreaterThan(0);
    });

    it('should have correct structure for each group', () => {
      const pdfStandards = generatePdfExportStandards();
      pdfStandards.forEach((group) => {
        expect(group).toHaveProperty('id');
        expect(group).toHaveProperty('label');
        expect(group).toHaveProperty('options');
        expect(Array.isArray(group.options)).toBe(true);
        expect(group.options.length).toBeGreaterThan(0);
      });
    });

    it('should create level options for OWASP ASVS', () => {
      const pdfStandards = generatePdfExportStandards();
      const owaspAsvsGroups = pdfStandards.filter((g) => g.id.startsWith('owaspAsvs-'));

      expect(owaspAsvsGroups.length).toBeGreaterThan(0);
      owaspAsvsGroups.forEach((group) => {
        expect(group.options.length).toBe(3); // Three levels
        expect(group.options[0].label).toBe('Level 1');
        expect(group.options[1].label).toBe('Level 2');
        expect(group.options[2].label).toBe('Level 3');
      });
    });

    it('should group versioned standards correctly', () => {
      const pdfStandards = generatePdfExportStandards();
      const pciDssGroup = pdfStandards.find((g) => g.id === 'pciDss');

      expect(pciDssGroup).toBeDefined();
      expect(pciDssGroup?.options.length).toBeGreaterThanOrEqual(2); // At least 3.2 and 4.0
      expect(pciDssGroup?.options.some((o) => o.label === '4.0')).toBe(true);
      expect(pciDssGroup?.options.some((o) => o.label === '3.2')).toBe(true);
    });

    it('should format CWE Top 25 keys correctly', () => {
      const pdfStandards = generatePdfExportStandards();
      const cweGroup = pdfStandards.find((g) => g.id === 'cweTop25');

      expect(cweGroup).toBeDefined();
      cweGroup?.options.forEach((option) => {
        // CWE Top 25 PDF keys should be in format 'cweTop25-YYYY'
        expect(option.id).toMatch(/^cweTop25-\d{4}$/);
      });
    });

    it('should handle non-versioned standards correctly', () => {
      const pdfStandards = generatePdfExportStandards();
      const sonarGroup = pdfStandards.find((g) => g.id === 'sonarsourceSecurity-group');

      expect(sonarGroup).toBeDefined();
      expect(sonarGroup?.options.length).toBe(1);
      expect(sonarGroup?.options[0].id).toBe(StandardsInformationKey.SONARSOURCE);
    });

    it('should include all PDF-available standards', () => {
      const pdfStandards = generatePdfExportStandards();
      const allOptions = pdfStandards.flatMap((g) => g.options);

      // Should have options for all PDF-available standards
      expect(allOptions.length).toBeGreaterThan(0);
    });

    it('should create separate groups for each OWASP ASVS version', () => {
      const pdfStandards = generatePdfExportStandards();
      const asvsGroups = pdfStandards.filter((g) => g.id.startsWith('owaspAsvs-'));

      expect(asvsGroups.length).toBeGreaterThanOrEqual(2); // At least 4.0 and 5.0
      expect(asvsGroups.some((g) => g.id === 'owaspAsvs-4.0')).toBe(true);
      expect(asvsGroups.some((g) => g.id === 'owaspAsvs-5.0')).toBe(true);
    });

    it('should include OWASP Mobile Top 10 2024', () => {
      const pdfStandards = generatePdfExportStandards();
      const mobileGroup = pdfStandards.find((g) => g.id === 'owaspMobileTop10');

      expect(mobileGroup).toBeDefined();
      expect(mobileGroup?.options.some((o) => o.label === '2024')).toBe(true);
    });

    it('should include OWASP Top 10 for LLM 2025', () => {
      const pdfStandards = generatePdfExportStandards();
      const llmGroup = pdfStandards.find((g) => g.id === 'owaspLlmTop10');

      expect(llmGroup).toBeDefined();
      expect(llmGroup?.options.some((o) => o.label === '2025')).toBe(true);
    });

    it('should include CASA standard', () => {
      const pdfStandards = generatePdfExportStandards();
      const casaGroup = pdfStandards.find((g) => g.id === 'casa-group');

      expect(casaGroup).toBeDefined();
      expect(casaGroup?.options.length).toBe(1);
    });

    it('should include STIG standards', () => {
      const pdfStandards = generatePdfExportStandards();
      const stigGroup = pdfStandards.find((g) => g.id === 'stig');

      expect(stigGroup).toBeDefined();
      expect(stigGroup?.options.length).toBeGreaterThanOrEqual(2); // V5R3 and V6
    });
  });

  describe('buildComplianceStandards', () => {
    it('should build a compliance standards string from a query with values', () => {
      const query = { sonarsourceSecurity: ['xss', 'sql-injection'] };
      const result = buildComplianceStandards(query);

      expect(result).toBeDefined();
      expect(result).toContain('xss,sql-injection');
    });

    it('should combine multiple standards with &', () => {
      const query = {
        sonarsourceSecurity: ['xss'],
        cwe: ['CWE-79'],
      };
      const result = buildComplianceStandards(query);

      expect(result).toBeDefined();
      expect(result).toContain('xss');
      expect(result).toContain('CWE-79');
      expect(result).toContain('&');
    });

    it('should return undefined when no standards have values', () => {
      const query = { sonarsourceSecurity: [], cwe: [] };
      expect(buildComplianceStandards(query)).toBeUndefined();
    });

    it('should return undefined for an empty query', () => {
      expect(buildComplianceStandards({})).toBeUndefined();
    });

    it('should skip standards with empty arrays', () => {
      const query = {
        sonarsourceSecurity: ['xss'],
        cwe: [],
      };
      const result = buildComplianceStandards(query);

      expect(result).toBeDefined();
      expect(result).not.toContain('cwe');
    });
  });

  describe('parseComplianceStandards', () => {
    it('should parse a single standard group', () => {
      const backendKey = 'sonar_standard:urn:sonar-security-standard:sonar:standard:unversioned';
      const result = parseComplianceStandards(`${backendKey}=xss,sql-injection`);

      expect(result).toEqual({ sonarsourceSecurity: ['xss', 'sql-injection'] });
    });

    it('should parse multiple standard groups separated by &', () => {
      const sonarKey = 'sonar_standard:urn:sonar-security-standard:sonar:standard:unversioned';
      const cweKey = 'cwe_standard:urn:sonar-security-standard:cwe:standard:4.18';
      const result = parseComplianceStandards(`${sonarKey}=xss&${cweKey}=CWE-79,CWE-89`);

      expect(result.sonarsourceSecurity).toEqual(['xss']);
      expect(result.cwe).toEqual(['CWE-79', 'CWE-89']);
    });

    it('should return empty object for undefined input', () => {
      expect(parseComplianceStandards(undefined)).toEqual({});
    });

    it('should return empty object for empty string', () => {
      expect(parseComplianceStandards('')).toEqual({});
    });

    it('should skip groups with unknown backend keys', () => {
      const result = parseComplianceStandards('unknown_key=value1,value2');
      expect(result).toEqual({});
    });

    it('should skip malformed groups without =', () => {
      const result = parseComplianceStandards('malformed-no-equals');
      expect(result).toEqual({});
    });
  });

  describe('populateStandardsFromParsed', () => {
    it('should fill in empty arrays for all standards from an empty input', () => {
      const result = populateStandardsFromParsed({});

      STANDARDS_REGISTRY.forEach((standard) => {
        expect(result[standard.queryProp]).toEqual([]);
      });
    });

    it('should preserve parsed values and default others to empty arrays', () => {
      const parsed = { sonarsourceSecurity: ['xss'], cwe: ['CWE-79'] };
      const result = populateStandardsFromParsed(parsed);

      expect(result.sonarsourceSecurity).toEqual(['xss']);
      expect(result.cwe).toEqual(['CWE-79']);
      expect(result['pciDss-4.0']).toEqual([]);
    });
  });

  describe('buildComplianceStandards and parseComplianceStandards round-trip', () => {
    it('should round-trip a query through build and parse', () => {
      const query = {
        sonarsourceSecurity: ['xss', 'sql-injection'],
        cwe: ['CWE-79', 'CWE-89'],
        'pciDss-4.0': ['1', '2'],
      };

      const built = buildComplianceStandards(query);
      expect(built).toBeDefined();

      const parsed = populateStandardsFromParsed(parseComplianceStandards(built));

      expect(parsed.sonarsourceSecurity).toEqual(['xss', 'sql-injection']);
      expect(parsed.cwe).toEqual(['CWE-79', 'CWE-89']);
      expect(parsed['pciDss-4.0']).toEqual(['1', '2']);
    });

    it('should round-trip versioned OWASP standards', () => {
      const query = { 'owaspTop10-2025': ['A01', 'A02'] };

      const built = buildComplianceStandards(query);
      const parsed = populateStandardsFromParsed(parseComplianceStandards(built));

      expect(parsed['owaspTop10-2025']).toEqual(['A01', 'A02']);
    });
  });

  describe('mapBackendFacetKeyToQueryProp', () => {
    it('should map a known backend key to its query prop', () => {
      const result = mapBackendFacetKeyToQueryProp(
        'sonar_standard:urn:sonar-security-standard:sonar:standard:unversioned',
      );
      expect(result).toBe('sonarsourceSecurity');
    });

    it('should map PCI DSS 4.0 backend key', () => {
      const result = mapBackendFacetKeyToQueryProp(
        'pci_dss:urn:sonar-security-standard:pci:dss:4.0',
      );
      expect(result).toBe('pciDss-4.0');
    });

    it('should return the original key if not found', () => {
      expect(mapBackendFacetKeyToQueryProp('unknown-backend-key')).toBe('unknown-backend-key');
    });
  });

  describe('isComplianceStandardFacet', () => {
    it('should return true for known compliance standard facets', () => {
      expect(isComplianceStandardFacet('sonarsourceSecurity')).toBe(true);
      expect(isComplianceStandardFacet('cwe')).toBe(true);
      expect(isComplianceStandardFacet('pciDss-4.0')).toBe(true);
      expect(isComplianceStandardFacet('owaspTop10-2025')).toBe(true);
    });

    it('should return false for non-standard facets', () => {
      expect(isComplianceStandardFacet('languages')).toBe(false);
      expect(isComplianceStandardFacet('severities')).toBe(false);
      expect(isComplianceStandardFacet('unknown')).toBe(false);
    });
  });

  describe('getAllComplianceStandardFacets', () => {
    it('should return all queryProp values from the registry', () => {
      const facets = getAllComplianceStandardFacets();
      expect(facets.length).toBe(STANDARDS_REGISTRY.length);
      expect(facets).toContain('sonarsourceSecurity');
      expect(facets).toContain('cwe');
      expect(facets).toContain('pciDss-4.0');
    });
  });

  describe('mapFacetToBackendName', () => {
    it('should map compliance standard facets to complianceStandards', () => {
      expect(mapFacetToBackendName('sonarsourceSecurity')).toBe('complianceStandards');
      expect(mapFacetToBackendName('cwe')).toBe('complianceStandards');
      expect(mapFacetToBackendName('owaspTop10-2025')).toBe('complianceStandards');
      expect(mapFacetToBackendName('pciDss-4.0')).toBe('complianceStandards');
    });

    it('should return the original facet name for non-standard facets', () => {
      expect(mapFacetToBackendName('languages')).toBe('languages');
      expect(mapFacetToBackendName('severities')).toBe('severities');
      expect(mapFacetToBackendName('tags')).toBe('tags');
    });
  });
});
