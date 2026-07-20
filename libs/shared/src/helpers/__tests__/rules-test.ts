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

import {
  SoftwareImpactSeverity,
  SoftwareQuality,
  SoftwareQualityImpact,
} from '../../types/clean-code-taxonomy';
import { getImpactsDiffBySeverity } from '../rules';

describe('rules helpers', () => {
  describe('getImpactsDiffBySeverity', () => {
    it('should separate rule impacts from custom activation impacts', () => {
      const ruleImpact: SoftwareQualityImpact = {
        softwareQuality: SoftwareQuality.Maintainability,
        severity: SoftwareImpactSeverity.Medium,
      };
      const activationImpact: SoftwareQualityImpact = {
        softwareQuality: SoftwareQuality.Maintainability,
        severity: SoftwareImpactSeverity.High,
      };

      const result = getImpactsDiffBySeverity([ruleImpact], [activationImpact]);

      expect(result.activationImpacts).toHaveLength(1);
      expect(result.activationImpacts[0]).toEqual(activationImpact);
      expect(result.ruleImpacts).toHaveLength(0);
    });

    it('should keep impacts with same severity in ruleImpacts', () => {
      const impact: SoftwareQualityImpact = {
        softwareQuality: SoftwareQuality.Maintainability,
        severity: SoftwareImpactSeverity.Medium,
      };

      const result = getImpactsDiffBySeverity([impact], [impact]);

      expect(result.ruleImpacts).toHaveLength(1);
      expect(result.ruleImpacts[0]).toEqual(impact);
      expect(result.activationImpacts).toHaveLength(0);
    });

    it('should handle multiple impacts with mixed severities', () => {
      const maintainabilityImpact: SoftwareQualityImpact = {
        softwareQuality: SoftwareQuality.Maintainability,
        severity: SoftwareImpactSeverity.Medium,
      };
      const reliabilityImpact: SoftwareQualityImpact = {
        softwareQuality: SoftwareQuality.Reliability,
        severity: SoftwareImpactSeverity.High,
      };

      const customMaintainability: SoftwareQualityImpact = {
        softwareQuality: SoftwareQuality.Maintainability,
        severity: SoftwareImpactSeverity.Low,
      };

      const result = getImpactsDiffBySeverity(
        [maintainabilityImpact, reliabilityImpact],
        [customMaintainability],
      );

      expect(result.activationImpacts).toHaveLength(1);
      expect(result.activationImpacts[0].softwareQuality).toBe(SoftwareQuality.Maintainability);
      expect(result.activationImpacts[0].severity).toBe(SoftwareImpactSeverity.Low);
      expect(result.ruleImpacts).toHaveLength(1);
      expect(result.ruleImpacts[0].softwareQuality).toBe(SoftwareQuality.Reliability);
    });

    it('should handle undefined activation impacts', () => {
      const impact: SoftwareQualityImpact = {
        softwareQuality: SoftwareQuality.Maintainability,
        severity: SoftwareImpactSeverity.Medium,
      };

      const result = getImpactsDiffBySeverity([impact]);

      expect(result.ruleImpacts).toHaveLength(1);
      expect(result.ruleImpacts[0]).toEqual(impact);
      expect(result.activationImpacts).toHaveLength(0);
    });

    it('should handle empty impacts array', () => {
      const result = getImpactsDiffBySeverity([]);

      expect(result.ruleImpacts).toHaveLength(0);
      expect(result.activationImpacts).toHaveLength(0);
    });

    it('should handle undefined rule impacts', () => {
      const result = getImpactsDiffBySeverity();

      expect(result.ruleImpacts).toHaveLength(0);
      expect(result.activationImpacts).toHaveLength(0);
    });

    it('should not match activation impacts without corresponding rule impacts', () => {
      const ruleImpact: SoftwareQualityImpact = {
        softwareQuality: SoftwareQuality.Maintainability,
        severity: SoftwareImpactSeverity.Medium,
      };

      const unmatchedActivationImpact: SoftwareQualityImpact = {
        softwareQuality: SoftwareQuality.Security,
        severity: SoftwareImpactSeverity.High,
      };

      const result = getImpactsDiffBySeverity(
        [ruleImpact],
        [unmatchedActivationImpact, ruleImpact],
      );

      // The unmatched activation impact is not returned since there's no corresponding rule impact
      expect(result.activationImpacts).toHaveLength(0);
      expect(result.ruleImpacts).toHaveLength(1);
      expect(result.ruleImpacts[0].softwareQuality).toBe(SoftwareQuality.Maintainability);
    });

    it('should handle multiple activation impacts for different qualities', () => {
      const ruleImpacts: SoftwareQualityImpact[] = [
        {
          softwareQuality: SoftwareQuality.Maintainability,
          severity: SoftwareImpactSeverity.Medium,
        },
        { softwareQuality: SoftwareQuality.Reliability, severity: SoftwareImpactSeverity.High },
        { softwareQuality: SoftwareQuality.Security, severity: SoftwareImpactSeverity.Medium },
      ];

      const activationImpacts: SoftwareQualityImpact[] = [
        { softwareQuality: SoftwareQuality.Maintainability, severity: SoftwareImpactSeverity.Low },
        { softwareQuality: SoftwareQuality.Reliability, severity: SoftwareImpactSeverity.Medium },
      ];

      const result = getImpactsDiffBySeverity(ruleImpacts, activationImpacts);

      expect(result.activationImpacts).toHaveLength(2);
      expect(result.activationImpacts.map((i) => i.softwareQuality)).toContain(
        SoftwareQuality.Maintainability,
      );
      expect(result.activationImpacts.map((i) => i.softwareQuality)).toContain(
        SoftwareQuality.Reliability,
      );

      expect(result.ruleImpacts).toHaveLength(1);
      expect(result.ruleImpacts[0].softwareQuality).toBe(SoftwareQuality.Security);
    });
  });
});
