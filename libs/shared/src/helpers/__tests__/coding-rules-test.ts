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

import { SoftwareImpactSeverity } from '../../types/clean-code-taxonomy';
import { parseSeverities } from '../coding-rules';

describe('parseSeverities', () => {
  describe('without an active profile filter', () => {
    it('should populate impactSeverities from the "impactSeverities" param when only it is set', () => {
      expect(
        parseSeverities<SoftwareImpactSeverity>(
          { impactSeverities: 'HIGH,LOW' },
          'impactSeverities',
          'active_impactSeverities',
        ),
      ).toEqual({
        active_impactSeverities: [],
        impactSeverities: ['HIGH', 'LOW'],
      });
    });

    it('should fall back to the "active_impactSeverities" param when only it is set', () => {
      expect(
        parseSeverities<SoftwareImpactSeverity>(
          { active_impactSeverities: 'MEDIUM' },
          'impactSeverities',
          'active_impactSeverities',
        ),
      ).toEqual({
        active_impactSeverities: [],
        impactSeverities: ['MEDIUM'],
      });
    });

    it('should prefer the "impactSeverities" param when both are set', () => {
      expect(
        parseSeverities<SoftwareImpactSeverity>(
          { active_impactSeverities: 'MEDIUM', impactSeverities: 'HIGH' },
          'impactSeverities',
          'active_impactSeverities',
        ),
      ).toEqual({
        active_impactSeverities: [],
        impactSeverities: ['HIGH'],
      });
    });

    it('should return empty arrays when neither param is set', () => {
      expect(
        parseSeverities<SoftwareImpactSeverity>({}, 'impactSeverities', 'active_impactSeverities'),
      ).toEqual({
        active_impactSeverities: [],
        impactSeverities: [],
      });
    });

    it('should not treat activation=true alone as an active profile filter', () => {
      expect(
        parseSeverities<SoftwareImpactSeverity>(
          { activation: 'true', impactSeverities: 'HIGH' },
          'impactSeverities',
          'active_impactSeverities',
        ),
      ).toEqual({
        active_impactSeverities: [],
        impactSeverities: ['HIGH'],
      });
    });

    it('should not treat qprofile alone as an active profile filter', () => {
      expect(
        parseSeverities<SoftwareImpactSeverity>(
          { impactSeverities: 'HIGH', qprofile: 'my-profile' },
          'impactSeverities',
          'active_impactSeverities',
        ),
      ).toEqual({
        active_impactSeverities: [],
        impactSeverities: ['HIGH'],
      });
    });
  });

  describe('with an active profile filter (activation=true and qprofile set)', () => {
    it('should populate active_impactSeverities from the "impactSeverities" param when only it is set', () => {
      expect(
        parseSeverities<SoftwareImpactSeverity>(
          { activation: 'true', impactSeverities: 'HIGH,LOW', qprofile: 'my-profile' },
          'impactSeverities',
          'active_impactSeverities',
        ),
      ).toEqual({
        active_impactSeverities: ['HIGH', 'LOW'],
        impactSeverities: [],
      });
    });

    it('should use the "active_impactSeverities" param when only it is set', () => {
      expect(
        parseSeverities<SoftwareImpactSeverity>(
          { activation: 'true', active_impactSeverities: 'MEDIUM', qprofile: 'my-profile' },
          'impactSeverities',
          'active_impactSeverities',
        ),
      ).toEqual({
        active_impactSeverities: ['MEDIUM'],
        impactSeverities: [],
      });
    });

    it('should prefer the "active_impactSeverities" param when both are set', () => {
      expect(
        parseSeverities<SoftwareImpactSeverity>(
          {
            activation: 'true',
            active_impactSeverities: 'MEDIUM',
            impactSeverities: 'HIGH',
            qprofile: 'my-profile',
          },
          'impactSeverities',
          'active_impactSeverities',
        ),
      ).toEqual({
        active_impactSeverities: ['MEDIUM'],
        impactSeverities: [],
      });
    });

    it('should return empty arrays when neither param is set', () => {
      expect(
        parseSeverities<SoftwareImpactSeverity>(
          { activation: 'true', qprofile: 'my-profile' },
          'impactSeverities',
          'active_impactSeverities',
        ),
      ).toEqual({
        active_impactSeverities: [],
        impactSeverities: [],
      });
    });
  });

  it('should work with the plain severity keys', () => {
    expect(
      parseSeverities({ severities: 'BLOCKER,MINOR' }, 'severities', 'active_severities'),
    ).toEqual({
      active_severities: [],
      severities: ['BLOCKER', 'MINOR'],
    });
  });
});
