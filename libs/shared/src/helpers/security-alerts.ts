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

import { PackageURL } from 'packageurl-js';
import {
  SecurityAlert,
  SecurityAlertBranch,
  SecurityAlertBranchScaRisk,
} from '../types/security-alert';

export function getSecurityAlertTitle(
  alert: SecurityAlert | undefined,
  fallbackLabel: string,
): string {
  const scaIssue = alert?.scaIssue;
  const cweInfo = scaIssue?.cwes?.find((cwe) => cwe.name != null);
  const vulnerabilityId = scaIssue?.vulnerabilityId;
  return vulnerabilityId && cweInfo?.name
    ? `${vulnerabilityId} - ${cweInfo.name}`
    : (vulnerabilityId ?? fallbackLabel);
}

export function getUniquePackages(
  affectedBranches: SecurityAlertBranch[],
): SecurityAlertBranchScaRisk[] {
  const allRisks = affectedBranches.flatMap((b) => b.scaRisks);
  return [...new Map(allRisks.map((r) => [`${r.packageEcosystem}:${r.packageName}`, r])).values()];
}

export function getPackageInfoFromUrl(packageUrl: string | null) {
  if (!packageUrl) {
    return null;
  }

  try {
    const packageInfo = PackageURL.fromString(packageUrl);
    return {
      packageEcosystem: packageInfo.type,
      packageName: packageInfo.name,
      packageVersion: packageInfo.version,
    };
  } catch {
    return null;
  }
}
