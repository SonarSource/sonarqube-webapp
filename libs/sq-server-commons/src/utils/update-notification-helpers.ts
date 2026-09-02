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

import { BannerVariety, MessageVariety } from '@sonarsource/echoes-react';
import { groupBy, isEmpty, mapValues } from 'lodash';
import { UpdateUseCase, sortUpgrades } from '../components/upgrade/utils';
import { SystemUpgrade } from '../types/system';

type GroupedSystemUpdate = {
  [x: string]: Record<string, SystemUpgrade[]>;
};

export const analyzeUpgrades = ({
  parsedVersion = [],
  upgrades,
}: {
  parsedVersion: number[] | undefined;
  upgrades: SystemUpgrade[];
}) => {
  const systemUpgrades = mapValues(
    groupBy(upgrades, (upgrade: SystemUpgrade) => {
      const [major] = upgrade.version.split('.');
      return major;
    }),
    (upgrades) =>
      groupBy(upgrades, (upgrade: SystemUpgrade) => {
        const [, minor] = upgrade.version.split('.');
        return minor;
      }),
  );

  const latest = [...upgrades].sort(
    (upgrade1, upgrade2) =>
      new Date(upgrade2.releaseDate ?? '').getTime() -
      new Date(upgrade1.releaseDate ?? '').getTime(),
  )[0];

  return {
    isMinorUpdate: isMinorUpdate(parsedVersion, systemUpgrades),
    isPatchUpdate: isLatestUpdatedAPatchUpdate(parsedVersion, systemUpgrades),
    latest,
  };
};

export const isCurrentVersionLTA = (parsedVersion: number[], latestLTS: string) => {
  const [currentMajor, currentMinor] = parsedVersion;
  const [ltsMajor, ltsMinor] = latestLTS.split('.').map(Number);
  return currentMajor === ltsMajor && currentMinor === ltsMinor;
};

// `latestLTA` is a major.minor string (e.g. "2026.1"). A version belongs to the LTA line
// when its major.minor matches exactly. Comparing on parsed numbers avoids the false
// positives of a raw string prefix match, where e.g. "2026.10.1".startsWith("2026.1") is true.
const isVersionLTA = (version: string, latestLTA: string) => {
  const [major, minor] = version.split('.').map(Number);
  const [ltaMajor, ltaMinor] = latestLTA.split('.').map(Number);
  return major === ltaMajor && minor === ltaMinor;
};

// Prefer the authoritative `lta` flag from /api/system/upgrades (available since 2026.5, backported
// to 2026.1, and aware of every LTA line via ltaVersions). Fall back to deriving it from latestLTA
// for older servers that don't send the flag.
const isLTAUpgrade = (upgrade: SystemUpgrade, latestLTA: string | undefined) => {
  if (upgrade.lta !== undefined) {
    return upgrade.lta;
  }
  return latestLTA !== undefined && isVersionLTA(upgrade.version, latestLTA);
};

// A section shown in the update modal. `kinds` drives the (possibly merged) header, e.g. a version
// that is both the latest release and the latest LTA carries ['latest', 'lta']. `upgrades` is
// newest-first: [0] is the version the section is about, the rest are collapsible intermediates.
export type UpgradeSectionKind = 'latest' | 'lta' | 'patch';

export interface UpgradeSection {
  kinds: UpgradeSectionKind[];
  upgrades: SystemUpgrade[];
}

// Canonical order used both to render the merged header and to key sections. 'latest' is the
// newest overall release, 'lta' the newest LTA line, 'patch' a newer patch on the installed line.
const SECTION_KIND_ORDER: UpgradeSectionKind[] = ['latest', 'lta', 'patch'];

const isNewerThan = (version: string, reference: number[]) => {
  // parseVersion returns [major, minor, <fractional artifact of ".patch">, patch]; the real patch
  // integer is at index 3, so skip index 2 (e.g. ".10" parses to 0.1 there, breaking comparisons).
  const [major = 0, minor = 0, , patch = 0] = parseVersion(version) ?? [];
  const [refMajor = 0, refMinor = 0, , refPatch = 0] = reference;
  if (major !== refMajor) {
    return major > refMajor;
  }
  if (minor !== refMinor) {
    return minor > refMinor;
  }
  return patch > refPatch;
};

const isSameMinorLine = (version: string, reference: number[]) => {
  const [major = 0, minor = 0] = parseVersion(version) ?? [];
  return major === reference[0] && minor === reference[1];
};

const findLTAHead = (
  newer: SystemUpgrade[],
  installed: number[],
  latestLTA: string | undefined,
): SystemUpgrade | undefined => {
  if (latestLTA !== undefined && isSameMinorLine(latestLTA, installed)) {
    return newer.find((upgrade) => isSameMinorLine(upgrade.version, installed));
  }
  return newer.find(
    (upgrade) => isLTAUpgrade(upgrade, latestLTA) && !isSameMinorLine(upgrade.version, installed),
  );
};

const attachIntermediates = (sections: Map<string, UpgradeSection>, newer: SystemUpgrade[]) => {
  const headVersions = [...sections.keys()];
  for (const upgrade of newer) {
    if (sections.has(upgrade.version)) {
      continue;
    }
    const ceiling = headVersions
      .filter(
        (headVersion) => !isNewerThan(upgrade.version, parseVersion(headVersion) ?? [0, 0, 0]),
      )
      .sort((a, b) => (isNewerThan(a, parseVersion(b) ?? [0, 0, 0]) ? 1 : -1))[0];
    if (ceiling !== undefined) {
      sections.get(ceiling)?.upgrades.push(upgrade);
    }
  }
};

// Selects which sections the update modal shows, following the MMF-5708 decision matrix. Returns an
// ordered (by head major.minor, descending) list of up to three sections:
//  - patch:  newest release on the installed major.minor line;
//  - lta:    newest LTA line strictly newer than the installed line;
//  - latest: newest non-LTA release, newer than both the installed line and the latest LTA.
// When one version fills several roles its section carries several kinds so the header can be
// merged. Purely version-driven (numeric compare, never release date) and independent of the
// banner use case.
export const selectUpgradeSections = (
  upgrades: SystemUpgrade[],
  installedVersion: string,
  latestLTA: string | undefined,
): UpgradeSection[] => {
  const sorted = sortUpgrades(upgrades);
  const installed = parseVersion(installedVersion) ?? [0, 0, 0];
  const newer = sorted.filter((upgrade) => isNewerThan(upgrade.version, installed));

  const heads: Partial<Record<UpgradeSectionKind, SystemUpgrade>> = {};

  const latestPatch = newer.find((upgrade) => isSameMinorLine(upgrade.version, installed));
  if (latestPatch !== undefined) {
    heads.patch = latestPatch;
  }

  const latestLTAUpgrade = findLTAHead(newer, installed, latestLTA);
  if (latestLTAUpgrade !== undefined) {
    heads.lta = latestLTAUpgrade;
  }

  const latestOnDifferentLine = newer.find(
    (upgrade) => !isSameMinorLine(upgrade.version, installed),
  );
  const latest = latestOnDifferentLine ?? newer[0];
  if (latest !== undefined) {
    heads.latest = latest;
  }

  // Merge roles that resolve to the same version into a single section, keyed by version string so a
  // version can never head two sections. `kinds` follow the canonical order.
  const sections = new Map<string, UpgradeSection>();
  for (const kind of SECTION_KIND_ORDER) {
    const head = heads[kind];
    if (head === undefined) {
      continue;
    }
    const existing = sections.get(head.version);
    if (existing === undefined) {
      sections.set(head.version, { kinds: [kind], upgrades: [head] });
    } else {
      existing.kinds.push(kind);
    }
  }

  // Attach every remaining newer release as a collapsible intermediate of the nearest section whose
  // head is at or above it, so nothing between the installed version and each section head is lost.
  attachIntermediates(sections, newer);

  // `newer` is sorted newest-first, so each section's upgrades stay newest-first: head then
  // intermediates in descending order.
  return [...sections.values()].sort((a, b) =>
    isNewerThan(a.upgrades[0].version, parseVersion(b.upgrades[0].version) ?? [0, 0, 0]) ? -1 : 1,
  );
};

const isMinorUpdate = (parsedVersion: number[], systemUpgrades: GroupedSystemUpdate) => {
  const [currentMajor, currentMinor] = parsedVersion;
  const allMinor = systemUpgrades[currentMajor] ?? {};

  return Object.keys(allMinor)
    .map(Number)
    .some((minor) => minor > currentMinor);
};

const isLatestUpdatedAPatchUpdate = (
  parsedVersion: number[],
  systemUpgrades: GroupedSystemUpdate,
) => {
  const [currentMajor, currentMinor, currentPatch] = parsedVersion;
  const allMinor = systemUpgrades[currentMajor];
  const allPatch = sortUpgrades(allMinor?.[currentMinor] ?? []);

  if (!isEmpty(allPatch)) {
    const [, , latestPatch] = allPatch[0].version.split('.').map(Number);
    const effectiveCurrentPatch = isNaN(currentPatch) ? 0 : currentPatch;
    const effectiveLatestPatch = isNaN(latestPatch) ? 0 : latestPatch;

    return effectiveCurrentPatch < effectiveLatestPatch;
  }

  return false;
};

export const parseVersion = (version: string) => {
  const VERSION_PARSER = /^(\d+)\.(\d+)(\.(\d+))?/;
  const regExpParsedVersion = VERSION_PARSER.exec(version);

  return regExpParsedVersion
    ?.slice(1)
    .map(Number)
    .map((n) => (isNaN(n) ? 0 : n));
};

export const isVersionAPatchUpdate = (version: string) =>
  ((parseVersion(version) ?? [])[2] ?? 0) !== 0;

export const BANNER_VARIANT: Record<string, BannerVariety> = {
  [UpdateUseCase.NewVersion]: BannerVariety.Info,
  [UpdateUseCase.CurrentVersionInactive]: BannerVariety.Danger,
  [UpdateUseCase.NewPatch]: BannerVariety.Warning,
};

export const MESSAGE_CALLOUT_VARIANT: Record<string, MessageVariety> = {
  [UpdateUseCase.NewVersion]: MessageVariety.Info,
  [UpdateUseCase.CurrentVersionInactive]: MessageVariety.Danger,
  [UpdateUseCase.NewPatch]: MessageVariety.Warning,
};
