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

import { SecurityStandardOptionGroup, StandardsInformationKey } from '../types/security';
import {
  STANDARDS_REGISTRY,
  type CategoryNormalization,
  type StandardDefinition,
} from './compliance-standards-registry-definitions';

export function getStandardDefinition(
  key: StandardsInformationKey,
): StandardDefinition | undefined {
  return STANDARDS_REGISTRY.find((s) => s.key === key);
}

export function getStandardDefinitionByQueryProp(
  queryProp: string,
): StandardDefinition | undefined {
  return STANDARDS_REGISTRY.find((s) => s.queryProp === queryProp);
}

export function isStandardAvailableInPDFReports(key: StandardsInformationKey): boolean {
  const definition = getStandardDefinition(key);
  return definition?.availableInPDFReports ?? false;
}

export function getStandardsAvailableInIssuesFilter(): StandardDefinition[] {
  // Filter out year-specific CWE Top 25 standards - these are only for Security Reports
  // CWE numbers don't change between years, only the "Top 25" list changes
  const issuesFilterStandards = STANDARDS_REGISTRY.filter((standard) => {
    // Exclude year-specific CWE Top 25 standards (cwe-2021, cwe-2022, cwe-2023, cwe-2024)
    // Keep the base 'cwe' standard for issues filtering
    return !(standard.enumKey === 'CWE_TOP_25' && standard.version);
  });

  const standardsByQueryProp = new Map<string, StandardDefinition[]>();

  issuesFilterStandards.forEach((standard) => {
    const existing = standardsByQueryProp.get(standard.queryProp) ?? [];
    standardsByQueryProp.set(standard.queryProp, [...existing, standard]);
  });

  // For each queryProp, select only one standard (prefer base standard without version)
  return Array.from(standardsByQueryProp.values()).map((standards) => {
    if (standards.length === 1) {
      return standards[0];
    }

    // Multiple standards share this queryProp - prefer the one without a version
    return standards.find((s) => !s.version) ?? standards[0];
  });
}

export function getStandardsAvailableInPDFReports(): StandardDefinition[] {
  return STANDARDS_REGISTRY.filter((s) => s.availableInPDFReports);
}

function getSecurityStandardValue(definition: StandardDefinition): string {
  // For most standards, derive from the displayName (e.g., 'pciDss_4.0' -> 'pciDss')
  const baseStandard = definition.displayName.split('_')[0];

  // Special cases that don't follow the pattern
  if (definition.enumKey === 'SONARSOURCE') {
    return 'sonarsourceSecurity';
  }

  // CWE standards should use 'cweTop25' (matches translation key securityreport.cweTop25)
  if (definition.enumKey === 'CWE_TOP_25') {
    return 'cweTop25';
  }

  // STIG standards should use 'stig' (matches translation key securityreport.stig)
  if (definition.enumKey === 'STIG') {
    return 'stig';
  }

  // OWASP MASVS should use the full queryProp including version
  if (definition.enumKey === 'OWASP_MASVS') {
    return definition.queryProp;
  }

  return baseStandard;
}

const SecurityStandardRuntime = Object.fromEntries(
  // Get unique enum keys (deduplicate versioned standards like PCI_DSS)
  Array.from(new Set(STANDARDS_REGISTRY.map((s) => s.enumKey))).map((enumKey) => {
    const definition = STANDARDS_REGISTRY.find((s) => s.enumKey === enumKey);
    return [enumKey, getSecurityStandardValue(definition as StandardDefinition)];
  }),
) as Record<string, string>;

export type SecurityStandard =
  (typeof SecurityStandardRuntime)[keyof typeof SecurityStandardRuntime];

export const SecurityStandard = SecurityStandardRuntime as {
  [K in keyof typeof SecurityStandardRuntime]: SecurityStandard;
};

export const STANDARDS_KEY_TO_SECURITY_STANDARD_MAP: Record<StandardsInformationKey, string> =
  Object.fromEntries(
    STANDARDS_REGISTRY.map((def) => [def.key, getSecurityStandardValue(def)]),
  ) as Record<StandardsInformationKey, string>;

export const ALL_STANDARD_KEYS = getStandardsAvailableInIssuesFilter().map((s) => s.key);

export function getStandardVersionsFromRegistry(securityStandard: string): string[] {
  const versions = STANDARDS_REGISTRY.filter(
    (def) => STANDARDS_KEY_TO_SECURITY_STANDARD_MAP[def.key] === securityStandard,
  )
    .map((def) => def.version)
    .filter((v): v is string => v !== undefined);

  // Return unique versions sorted in reverse order (newest first)
  return Array.from(new Set(versions))
    .sort((a, b) => a.localeCompare(b))
    .reverse();
}

export function getStandardLevels(key: StandardsInformationKey): string[] {
  const definition = getStandardDefinition(key);
  return definition?.levels ?? [];
}

export function getAllSecurityStandards(): string[] {
  return Array.from(new Set(Object.values(STANDARDS_KEY_TO_SECURITY_STANDARD_MAP)));
}

export function getAllStandardLevels(): string[] {
  const levels = STANDARDS_REGISTRY.flatMap((def) => def.levels ?? []);
  return Array.from(new Set(levels)).sort((a, b) => a.localeCompare(b));
}

export function getStandardsInformationKeyFromRegistry(
  securityStandard: string,
  version?: string,
): StandardsInformationKey {
  const matchingStandards = STANDARDS_REGISTRY.filter(
    (def) => STANDARDS_KEY_TO_SECURITY_STANDARD_MAP[def.key] === securityStandard,
  );

  // Fallback: If no definition found, return the input as-is
  // This handles edge cases gracefully without throwing
  if (matchingStandards.length === 0) {
    return securityStandard as StandardsInformationKey;
  }

  if (version) {
    const exactMatch = matchingStandards.find((def) => def.version === version);
    if (exactMatch) {
      return exactMatch.key;
    }
  }

  // Return the first match (typically the latest/default version)
  // Standards are ordered newest first in the registry
  return matchingStandards[0].key;
}

export function getStandardUrl(securityStandard: string): string | undefined {
  const definition = STANDARDS_REGISTRY.find(
    (def) => getSecurityStandardValue(def) === securityStandard,
  );
  return definition?.url;
}

export function getDefaultPdfStandards(): string[] {
  const defaults: string[] = [StandardsInformationKey.SONARSOURCE];

  // Find the latest CWE (registry is ordered newest first)
  // Special case: For PDF, CWE Top 25 uses format 'cweTop25-YYYY'
  const latestCwe = STANDARDS_REGISTRY.find(
    (def) =>
      (def.key === StandardsInformationKey.CWE_2024 ||
        def.key === StandardsInformationKey.CWE_2023 ||
        def.key === StandardsInformationKey.CWE_2022 ||
        def.key === StandardsInformationKey.CWE_2021) &&
      def.availableInPDFReports,
  );
  if (latestCwe?.version) {
    defaults.push(`cweTop25-${latestCwe.version}`);
  }

  // Find the latest OWASP Top 10 (registry is ordered newest first)
  const latestOwaspTop10 = STANDARDS_REGISTRY.find(
    (def) =>
      def.key === StandardsInformationKey.OWASP_TOP10_2025 ||
      def.key === StandardsInformationKey.OWASP_TOP10_2021 ||
      def.key === StandardsInformationKey.OWASP_TOP10,
  );
  if (latestOwaspTop10) {
    defaults.push(latestOwaspTop10.key);
  }

  return defaults;
}

/**
 * Generate PDF export option groups from the registry.
 * This function automatically creates the correct structure for PDF reports based on registry metadata.
 *
 * Special handling:
 * - Standards with levels (like OWASP ASVS): Creates level options for each version
 * - Standards with versions: Groups all versions together
 * - Standards without versions: Creates a simple single-option group
 *
 * Note: Returns loosely typed objects since the registry uses string-based keys.
 * The consuming code should cast these to the appropriate types if needed.
 */
export function generatePdfExportStandards(): Array<SecurityStandardOptionGroup> {
  const pdfStandards = getStandardsAvailableInPDFReports();

  // Group by SecurityStandard (the high-level category)
  const groupedBySecurityStandard = new Map<string, StandardDefinition[]>();
  for (const std of pdfStandards) {
    const securityStandard = STANDARDS_KEY_TO_SECURITY_STANDARD_MAP[std.key];
    if (!groupedBySecurityStandard.has(securityStandard)) {
      groupedBySecurityStandard.set(securityStandard, []);
    }
    groupedBySecurityStandard.get(securityStandard)?.push(std);
  }

  const result: SecurityStandardOptionGroup[] = [];

  // Process each SecurityStandard group
  for (const [securityStandard, standards] of groupedBySecurityStandard) {
    const hasVersions = standards.some((s) => s.version !== undefined);
    const hasLevels = standards.some((s) => s.levels && s.levels.length > 0);
    const labelMessageId = `securityreport.${securityStandard}`;

    if (hasLevels) {
      // OWASP ASVS case: Create separate groups for each version with level options
      for (const std of standards) {
        result.push({
          id: `${securityStandard}-${std.version}`,
          label: `${std.pdfLabel ?? std.displayName} ${std.version}`,
          labelMessageId,
          version: std.version,
          options: (std.levels ?? []).map((level) => ({
            id: `${std.key}-level${level}`,
            label: `Level ${level}`,
          })),
        });
      }
    } else if (hasVersions) {
      // Versioned standards (PCI DSS, OWASP Top 10, CWE Top 25, STIG, etc.)
      result.push({
        id: securityStandard,
        label: standards[0].pdfLabel ?? standards[0].displayName,
        labelMessageId,
        options: standards.map((std) => ({
          // Special case: CWE Top 25 PDF keys need to be in format 'cweTop25-YYYY'
          id:
            securityStandard === 'cweTop25' && std.version
              ? `${securityStandard}-${std.version}`
              : std.key,
          label: std.version ?? '',
        })),
      });
    } else {
      // Non-versioned standards (Sonar, CASA, OWASP MASVS)
      result.push({
        id: `${securityStandard}-group`,
        label: standards[0].pdfLabel ?? standards[0].displayName,
        labelMessageId,
        options: [
          {
            id: standards[0].key,
            label: standards[0].pdfLabel ?? standards[0].displayName,
            labelMessageId,
          },
        ],
      });
    }
  }

  return result;
}

export const COMPLIANCE_STANDARDS_BACKEND_KEYS = Object.fromEntries(
  STANDARDS_REGISTRY.map((s) => [s.key, s.backendKey]),
) as Record<StandardsInformationKey, string>;

export const BACKEND_KEY_TO_FRONTEND: Record<string, string> = Object.fromEntries(
  STANDARDS_REGISTRY.map((s) => [s.backendKey, s.key]),
);

export const FRONTEND_KEY_TO_QUERY_PROP: Record<string, string> = Object.fromEntries(
  STANDARDS_REGISTRY.map((s) => [s.key, s.queryProp]),
);

export function buildComplianceStandards(query: object): string | undefined {
  const standardGroups: string[] = [];
  const q = query as Record<string, unknown>;

  for (const [frontendKey, queryProp] of Object.entries(FRONTEND_KEY_TO_QUERY_PROP)) {
    const values = q[queryProp] as string[] | undefined;
    if (values?.length) {
      const backendKey =
        COMPLIANCE_STANDARDS_BACKEND_KEYS[
          frontendKey as keyof typeof COMPLIANCE_STANDARDS_BACKEND_KEYS
        ];
      standardGroups.push(`${backendKey}=${values.join(',')}`);
    }
  }

  return standardGroups.length > 0 ? standardGroups.join('&') : undefined;
}

/**
 * Normalizes a category value based on the standard's normalization rule from the registry.
 */
function normalizeCategory(
  normalization: CategoryNormalization | undefined,
  category: string,
): string {
  switch (normalization) {
    case 'owasp-padded':
      return normalizeOwaspCategory(category, true);
    case 'owasp-unpadded':
      return normalizeOwaspCategory(category, false);
    case 'cwe-prefix':
      return /^CWE-/i.exec(category) ? category : `CWE-${category}`;
    default:
      return category;
  }
}

/**
 * Normalizes an OWASP category: uppercase letter prefix + optional zero-padding.
 * e.g. 'a1' → 'A01' (with padding) or 'A1' (without), 'a10' → 'A10' (both)
 */
const OWASP_CATEGORY_REGEX = /^([a-zA-Z])(\d+)$/;

function normalizeOwaspCategory(category: string, zeroPad: boolean): string {
  const match = OWASP_CATEGORY_REGEX.exec(category);
  if (!match) {
    return category.toUpperCase();
  }
  const [, letter, digits] = match;
  const num = String(Number(digits));
  const paddedNum = zeroPad ? num.padStart(2, '0') : num;
  return `${letter.toUpperCase()}${paddedNum}`;
}

/**
 * Builds a complianceStandards query value for a single standard key and category.
 * Uses the standards registry as the source of truth for backend keys and normalization rules.
 *
 * @param standardKey - A StandardsInformationKey (e.g., 'owaspTop10-2021', 'sonarsourceSecurity', 'cwe-2024')
 * @param category - The category value (e.g., 'a1', 'sql-injection', '79'), or undefined
 * @returns The complianceStandards value (e.g., 'owasp_top10:urn:...=A01'), or undefined if the key is unknown or category is missing
 */
export function buildComplianceStandardsForCategory(
  standardKey: string,
  category: string | undefined,
): string | undefined {
  if (!category) {
    return undefined;
  }

  const definition = STANDARDS_REGISTRY.find((s) => s.key === standardKey);
  if (!definition) {
    return undefined;
  }

  const normalized = normalizeCategory(definition.categoryNormalization, category);
  return `${definition.backendKey}=${normalized}`;
}

function processComplianceStandardGroup(group: string, result: Record<string, string[]>): void {
  const [backendKey, categoriesString] = group.split('=');
  if (!backendKey || !categoriesString) {
    return;
  }

  const frontendKey = BACKEND_KEY_TO_FRONTEND[backendKey];
  if (!frontendKey) {
    return;
  }

  const queryProp = FRONTEND_KEY_TO_QUERY_PROP[frontendKey];
  if (queryProp) {
    result[queryProp] = categoriesString.split(',');
  }
}

export function parseComplianceStandards(
  complianceStandardsString?: string,
): Record<string, string[]> {
  if (!complianceStandardsString) {
    return {};
  }

  const result: Record<string, string[]> = {};
  const groups = complianceStandardsString.split('&');

  for (const group of groups) {
    processComplianceStandardGroup(group, result);
  }

  return result;
}

export function populateStandardsFromParsed(
  parsedComplianceStandards: Record<string, string[]>,
): Record<string, string[]> {
  const result: Record<string, string[]> = {};

  for (const standard of STANDARDS_REGISTRY) {
    result[standard.queryProp] = parsedComplianceStandards[standard.queryProp] ?? [];
  }

  const baseCwe = STANDARDS_REGISTRY.find((s) => s.enumKey === 'CWE_TOP_25' && !s.version);
  if (baseCwe) {
    const yearCweStandards = STANDARDS_REGISTRY.filter(
      (s) => s.enumKey === 'CWE_TOP_25' && s.version,
    );
    const yearValues = yearCweStandards.flatMap((s) => result[s.queryProp] ?? []);
    if (yearValues.length > 0) {
      result[baseCwe.queryProp] = [...new Set([...result[baseCwe.queryProp], ...yearValues])];
      for (const yearCwe of yearCweStandards) {
        result[yearCwe.queryProp] = [];
      }
    }
  }

  return result;
}

/**
 * Parses all security standard values from a raw query object.
 * Handles both the new `complianceStandards` format and legacy individual params.
 *
 * @param rawQuery - The raw URL query params
 * @param parseSingleValue - Function to parse a single raw query value into a string array
 * @returns A record mapping each standard queryProp to its parsed string array
 */
export function parseStandardsFromQuery(
  rawQuery: Record<string, unknown>,
  parseSingleValue: (value: unknown) => string[],
): Record<string, string[]> {
  const parsedStandards = rawQuery.complianceStandards
    ? populateStandardsFromParsed(parseComplianceStandards(rawQuery.complianceStandards as string))
    : {};

  const allQueryProps = new Set(STANDARDS_REGISTRY.map((s) => s.queryProp));

  return Object.fromEntries(
    Array.from(allQueryProps).map((queryProp) => [
      queryProp,
      parsedStandards[queryProp] ?? parseSingleValue(rawQuery[queryProp]),
    ]),
  );
}

/**
 * Maps a backend facet key to its frontend query prop name.
 * Used to convert backend API response facet keys to frontend query prop names.
 *
 * @param backendKey - The backend facet key (e.g., 'owasp_asvs:urn:sonar-security-standard:owasp:asvs:4.0')
 * @returns The frontend query prop name (e.g., 'owaspAsvs-4.0') or the original key if not found
 */
export function mapBackendFacetKeyToQueryProp(backendKey: string): string {
  const standard = STANDARDS_REGISTRY.find((s) => s.backendKey === backendKey);
  return standard?.queryProp || backendKey;
}

/**
 * Checks if a facet is a compliance standard.
 *
 * @param facet - The facet name to check
 * @returns true if the facet is a compliance standard, false otherwise
 */
export function isComplianceStandardFacet(facet: string): boolean {
  return STANDARDS_REGISTRY.some((s) => s.queryProp === facet);
}

/**
 * Gets all compliance standard facet names.
 *
 * @returns Array of all compliance standard facet names (queryProp values)
 */
export function getAllComplianceStandardFacets(): string[] {
  return STANDARDS_REGISTRY.map((s) => s.queryProp);
}

/**
 * Maps a facet name to its backend API name.
 * All compliance standards use the 'complianceStandards' facet on the backend,
 * so this function converts frontend standard facet names to the unified backend facet.
 *
 * @param facet - The frontend facet name (e.g., 'owaspTop10-2021', 'cwe', etc.)
 * @returns The backend facet name ('complianceStandards' for all standards, otherwise the original facet)
 */
export function mapFacetToBackendName(facet: string): string {
  if (isComplianceStandardFacet(facet)) {
    return 'complianceStandards';
  }
  return facet;
}

export const STANDARDS = 'standards';

/**
 * Determines whether the top-level "Standards" facet group should be open.
 * Used by both Issues and Rules pages on both SQC and SQS.
 */
export function shouldOpenStandardsFacet(
  openFacets: Record<string, boolean>,
  query: object,
): boolean {
  const q = query as Record<string, unknown>;
  return (
    openFacets[STANDARDS] ||
    isFilteredBySecurityIssueTypes(q) ||
    isOneStandardChildFacetOpen(openFacets, q)
  );
}

/**
 * Determines whether a specific standard child facet should be open.
 */
export function shouldOpenStandardsChildFacet(
  openFacets: Record<string, boolean>,
  query: object,
  standardType: string,
): boolean {
  const q = query as Record<string, unknown>;
  const filter = q[standardType] as string[] | undefined;
  return (
    openFacets[STANDARDS] !== false &&
    (openFacets[standardType] || (standardType !== StandardsInformationKey.CWE && !!filter?.length))
  );
}

/**
 * Determines whether the SonarSource Security child facet should be open.
 * Opens by default when the parent is open and no other child is open.
 */
export function shouldOpenSonarSourceSecurityFacet(
  openFacets: Record<string, boolean>,
  query: object,
): boolean {
  const q = query as Record<string, unknown>;
  return (
    shouldOpenStandardsChildFacet(openFacets, q, StandardsInformationKey.SONARSOURCE) ||
    (shouldOpenStandardsFacet(openFacets, q) && !isOneStandardChildFacetOpen(openFacets, q))
  );
}

function isFilteredBySecurityIssueTypes(query: Record<string, unknown>): boolean {
  const types = query.types as string[] | undefined;
  return !!types?.includes('VULNERABILITY');
}

function isOneStandardChildFacetOpen(
  openFacets: Record<string, boolean>,
  query: Record<string, unknown>,
): boolean {
  return ALL_STANDARD_KEYS.some((standardType) =>
    shouldOpenStandardsChildFacet(openFacets, query, standardType),
  );
}

/**
 * Maps an array of open frontend facet names to their backend API equivalents.
 * Deduplicates compliance standard facets (which all map to 'complianceStandards').
 *
 * @param openFacets - Record of facet name to open state
 * @param shouldRequest - Filter function to determine if a facet should be requested
 * @returns Deduplicated array of backend facet names
 */
export function mapOpenFacetsToBackendFacets(
  openFacets: Record<string, boolean>,
  shouldRequest: (facet: string) => boolean,
): string[] {
  const backendFacets = Object.keys(openFacets)
    .filter((facet) => openFacets[facet] && shouldRequest(facet))
    .map(mapFacetToBackendName);

  return [...new Set(backendFacets)];
}
