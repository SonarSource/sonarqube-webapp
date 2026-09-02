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

import { SystemUpgrade } from '../../types/system';
import { selectUpgradeSections } from '../update-notification-helpers';

function upgrade(version: string, lta?: boolean): SystemUpgrade {
  return { downloadUrl: '', version, ...(lta !== undefined && { lta }) };
}

// Compact view of a section: its ordered kinds and its head version, for readable assertions.
function shape(sections: ReturnType<typeof selectUpgradeSections>) {
  return sections.map((section) => ({
    kinds: section.kinds,
    head: section.upgrades[0].version,
  }));
}

describe('selectUpgradeSections - decision matrix', () => {
  it('row 1: non-LTA installed, patch + newer non-LTA, no newer LTA -> patch + latest', () => {
    const sections = selectUpgradeSections(
      [upgrade('10.5.1', false), upgrade('10.6.0', false)],
      '10.5.0',
      '9.9',
    );

    expect(shape(sections)).toEqual([
      { kinds: ['latest'], head: '10.6.0' },
      { kinds: ['patch'], head: '10.5.1' },
    ]);
  });

  it('row 2: non-LTA installed, patch + newer non-LTA + newer LTA -> latest + lta + patch', () => {
    const sections = selectUpgradeSections(
      [upgrade('2025.2.1', false), upgrade('2026.5.0', true), upgrade('2026.6.0', false)],
      '2025.2.0',
      '2026.5',
    );

    expect(shape(sections)).toEqual([
      { kinds: ['latest'], head: '2026.6.0' },
      { kinds: ['lta'], head: '2026.5.0' },
      { kinds: ['patch'], head: '2025.2.1' },
    ]);
  });

  it('row 3: LTA installed, inactive, newer non-LTA + newer LTA -> latest + lta (no patch)', () => {
    // Independent of the inactive banner state: selection is purely version-driven.
    const sections = selectUpgradeSections(
      [upgrade('2026.6.0', false), upgrade('2026.5.0', true)],
      '2026.1.0',
      '2026.5',
    );

    expect(shape(sections)).toEqual([
      { kinds: ['latest'], head: '2026.6.0' },
      { kinds: ['lta'], head: '2026.5.0' },
    ]);
  });

  it('row 4: LTA installed, only a patch on the same line -> latest+lta+patch merged', () => {
    // The patch is the only available upgrade and is itself an LTA patch → merges all three roles.
    const sections = selectUpgradeSections([upgrade('2026.1.5', true)], '2026.1.0', '2026.1');

    expect(shape(sections)).toEqual([{ kinds: ['latest', 'lta', 'patch'], head: '2026.1.5' }]);
  });

  it('row 5: LTA installed, patch + newer LTA, no newer non-LTA -> (latest+lta) + patch', () => {
    const sections = selectUpgradeSections(
      [upgrade('2026.1.5', true), upgrade('2026.5.0', true)],
      '2026.1.0',
      '2026.5',
    );

    // The newer LTA (2026.5.0) is also the newest release overall, so its titles merge.
    expect(shape(sections)).toEqual([
      { kinds: ['latest', 'lta'], head: '2026.5.0' },
      { kinds: ['patch'], head: '2026.1.5' },
    ]);
  });

  it('row 6: LTA installed, patch + newer LTA + newer non-LTA -> latest + lta + patch', () => {
    const sections = selectUpgradeSections(
      [upgrade('2026.1.5', true), upgrade('2026.5.0', true), upgrade('2026.6.0', false)],
      '2026.1.0',
      '2026.5',
    );

    expect(shape(sections)).toEqual([
      { kinds: ['latest'], head: '2026.6.0' },
      { kinds: ['lta'], head: '2026.5.0' },
      { kinds: ['patch'], head: '2026.1.5' },
    ]);
  });
});

describe('selectUpgradeSections - merged sections', () => {
  it('merges latest and lta when the newest release is itself an LTA', () => {
    // Doc example: on 2026.4, both 2026.4.1 (patch) and 2026.5 (LTA) released; 2026.5 is newest.
    const sections = selectUpgradeSections(
      [upgrade('2026.4.1', false), upgrade('2026.5.0', true)],
      '2026.4.0',
      '2026.5',
    );

    expect(shape(sections)).toEqual([
      { kinds: ['latest', 'lta'], head: '2026.5.0' },
      { kinds: ['patch'], head: '2026.4.1' },
    ]);
  });

  it('shows latest+lta+patch merged when installed on the LTA line with just a newer same-line patch', () => {
    // Row 4: the patch is the latest version overall and an LTA patch → all three roles merge.
    const sections = selectUpgradeSections([upgrade('2026.1.5', true)], '2026.1.0', '2026.1');

    expect(shape(sections)).toEqual([{ kinds: ['latest', 'lta', 'patch'], head: '2026.1.5' }]);
  });
});

describe('selectUpgradeSections - backward compatibility & edge cases', () => {
  it('derives LTA membership from latestLTA when the API sends no lta flag', () => {
    const sections = selectUpgradeSections([upgrade('9.9.1'), upgrade('10.0.0')], '8.9.0', '9.9');

    // 9.9.1 has no lta flag but its major.minor matches latestLTA -> treated as LTA.
    expect(shape(sections)).toEqual([
      { kinds: ['latest'], head: '10.0.0' },
      { kinds: ['lta'], head: '9.9.1' },
    ]);
  });

  it('shows no LTA section when latestLTA is undefined and no lta flag is present', () => {
    const sections = selectUpgradeSections(
      [upgrade('10.0.0'), upgrade('10.1.0')],
      '9.9.0',
      undefined,
    );

    expect(sections.every((section) => !section.kinds.includes('lta'))).toBe(true);
  });

  it('does not treat a same-prefix minor line as LTA (2026.10 vs latestLTA 2026.1)', () => {
    const sections = selectUpgradeSections([upgrade('2026.10.0')], '2026.1.0', '2026.1');

    // "2026.10.0".startsWith("2026.1") is true, but 2026.10 is not the 2026.1 LTA line.
    expect(shape(sections)).toEqual([{ kinds: ['latest'], head: '2026.10.0' }]);
  });

  it('returns no sections when nothing is newer than the installed version', () => {
    const sections = selectUpgradeSections([upgrade('9.9.0'), upgrade('9.8.0')], '9.9.0', '9.9');

    expect(sections).toEqual([]);
  });

  it('collapses older releases on the same line into the section intermediates', () => {
    const sections = selectUpgradeSections(
      [upgrade('2026.1.0', true), upgrade('2026.1.1', true), upgrade('2026.1.3', true)],
      '2026.1.0',
      '2026.1',
    );

    expect(sections).toHaveLength(1);
    expect(sections[0].kinds).toEqual(['latest', 'lta', 'patch']);
    // Head is the newest patch; the older newer-than-installed patch is a collapsible intermediate.
    expect(sections[0].upgrades.map((u) => u.version)).toEqual(['2026.1.3', '2026.1.1']);
  });

  it('orders two-digit patch numbers numerically (2026.1.10 is newer than 2026.1.5)', () => {
    const sections = selectUpgradeSections(
      [upgrade('2026.1.5', true), upgrade('2026.1.10', true)],
      '2026.1.0',
      '2026.1',
    );

    expect(sections).toHaveLength(1);
    expect(sections[0].kinds).toEqual(['latest', 'lta', 'patch']);
    // 2026.1.10 must be the head (newest), with 2026.1.5 as the collapsible intermediate.
    expect(sections[0].upgrades.map((u) => u.version)).toEqual(['2026.1.10', '2026.1.5']);
  });

  it('collapses cross-line releases between installed and the latest head as intermediates', () => {
    // installed 2026.5; the newest LTA 2027.1 is the head, and every release between the installed
    // version and 2027.1 that is not another section head must collapse under it - nothing is lost.
    const sections = selectUpgradeSections(
      [
        upgrade('2026.5.1'),
        upgrade('2026.5.2'),
        upgrade('2026.6'),
        upgrade('2026.6.1'),
        upgrade('2026.7'),
        upgrade('2027.1', true),
      ],
      '2026.5',
      '2027.1',
    );

    expect(shape(sections)).toEqual([
      { kinds: ['latest', 'lta'], head: '2027.1' },
      { kinds: ['patch'], head: '2026.5.2' },
    ]);
    // 2026.7 / 2026.6.1 / 2026.6 are different lines than the head but still collapse under it.
    expect(sections[0].upgrades.map((u) => u.version)).toEqual([
      '2027.1',
      '2026.7',
      '2026.6.1',
      '2026.6',
    ]);
    // The patch section keeps only the installed line's releases.
    expect(sections[1].upgrades.map((u) => u.version)).toEqual(['2026.5.2', '2026.5.1']);
  });
});
