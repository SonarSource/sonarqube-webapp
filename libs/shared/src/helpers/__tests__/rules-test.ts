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
import { RuleActivation, RuleParameter } from '../../types/rules';
import {
  getImpactsDiffBySeverity,
  getRuleParams,
  mergeImpacts,
  searchRulesResponseToRuleMetadata,
} from '../rules';

describe('rules helpers', () => {
  describe('searchRulesResponseToRuleMetadata', () => {
    it('returns empty metadata when the response is missing or has no rules', () => {
      expect(searchRulesResponseToRuleMetadata(undefined)).toEqual({});
      expect(searchRulesResponseToRuleMetadata({ rules: [] })).toEqual({});
    });

    it('maps name and language name by rule key', () => {
      expect(
        searchRulesResponseToRuleMetadata({
          rules: [
            { key: 'java:S1', langName: 'Java', name: 'Rule one' },
            { key: 'ts:S2', name: 'Rule two' },
          ],
        }),
      ).toEqual({
        'java:S1': { langName: 'Java', name: 'Rule one' },
        'ts:S2': { langName: undefined, name: 'Rule two' },
      });
    });
  });

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

  describe('getRuleParams', () => {
    it('should return empty object when ruleParams is undefined', () => {
      const result = getRuleParams({ ruleParams: undefined });

      expect(result).toEqual({});
    });

    it('should return empty object when ruleParams is empty', () => {
      const result = getRuleParams({ ruleParams: [] });

      expect(result).toEqual({});
    });

    it('should use default values when there are no activation params', () => {
      const ruleParams: RuleParameter[] = [
        { key: 'format', type: 'STRING', defaultValue: 'yyyy-MM-dd' },
        { key: 'max', type: 'INTEGER' },
      ];

      const result = getRuleParams({ ruleParams });

      expect(result).toEqual({ format: 'yyyy-MM-dd', max: '' });
    });

    it('should override default values with activation params', () => {
      const ruleParams: RuleParameter[] = [
        { key: 'format', type: 'STRING', defaultValue: 'yyyy-MM-dd' },
        { key: 'max', type: 'INTEGER', defaultValue: '10' },
      ];
      const activationParams: RuleActivation['params'] = [{ key: 'max', value: '20' }];

      const result = getRuleParams({ ruleParams, activationParams });

      expect(result).toEqual({ format: 'yyyy-MM-dd', max: '20' });
    });

    it('should not apply activation params when ruleParams is undefined', () => {
      const activationParams: RuleActivation['params'] = [{ key: 'max', value: '20' }];

      const result = getRuleParams({ ruleParams: undefined, activationParams });

      expect(result).toEqual({});
    });
  });

  describe('mergeImpacts', () => {
    it('should merge activation impacts over rule impacts for matching qualities', () => {
      const ruleImpacts: SoftwareQualityImpact[] = [
        {
          softwareQuality: SoftwareQuality.Maintainability,
          severity: SoftwareImpactSeverity.Medium,
        },
      ];
      const activationImpacts: SoftwareQualityImpact[] = [
        { softwareQuality: SoftwareQuality.Maintainability, severity: SoftwareImpactSeverity.High },
      ];

      const result = mergeImpacts(ruleImpacts, activationImpacts);

      expect(result.get(SoftwareQuality.Maintainability)).toBe(SoftwareImpactSeverity.High);
      expect(result.size).toBe(1);
    });

    it('should keep rule impacts when there are no activation impacts', () => {
      const ruleImpacts: SoftwareQualityImpact[] = [
        { softwareQuality: SoftwareQuality.Reliability, severity: SoftwareImpactSeverity.Low },
      ];

      const result = mergeImpacts(ruleImpacts);

      expect(result.get(SoftwareQuality.Reliability)).toBe(SoftwareImpactSeverity.Low);
      expect(result.size).toBe(1);
    });

    it('should ignore activation impacts without a corresponding rule impact', () => {
      const ruleImpacts: SoftwareQualityImpact[] = [
        {
          softwareQuality: SoftwareQuality.Maintainability,
          severity: SoftwareImpactSeverity.Medium,
        },
      ];
      const activationImpacts: SoftwareQualityImpact[] = [
        { softwareQuality: SoftwareQuality.Security, severity: SoftwareImpactSeverity.High },
      ];

      const result = mergeImpacts(ruleImpacts, activationImpacts);

      expect(result.has(SoftwareQuality.Security)).toBe(false);
      expect(result.get(SoftwareQuality.Maintainability)).toBe(SoftwareImpactSeverity.Medium);
      expect(result.size).toBe(1);
    });

    it('should override with changedImpactSeveritiesMap regardless of rule or activation impacts', () => {
      const ruleImpacts: SoftwareQualityImpact[] = [
        {
          softwareQuality: SoftwareQuality.Maintainability,
          severity: SoftwareImpactSeverity.Medium,
        },
      ];
      const activationImpacts: SoftwareQualityImpact[] = [
        { softwareQuality: SoftwareQuality.Maintainability, severity: SoftwareImpactSeverity.High },
      ];
      const changedImpactSeveritiesMap = new Map<SoftwareQuality, SoftwareImpactSeverity>([
        [SoftwareQuality.Maintainability, SoftwareImpactSeverity.Low],
      ]);

      const result = mergeImpacts(ruleImpacts, activationImpacts, changedImpactSeveritiesMap);

      expect(result.get(SoftwareQuality.Maintainability)).toBe(SoftwareImpactSeverity.Low);
    });

    it('should ignore changedImpactSeveritiesMap qualities absent from rule impacts', () => {
      const changedImpactSeveritiesMap = new Map<SoftwareQuality, SoftwareImpactSeverity>([
        [SoftwareQuality.Security, SoftwareImpactSeverity.Blocker],
      ]);

      const result = mergeImpacts([], [], changedImpactSeveritiesMap);

      expect(result.has(SoftwareQuality.Security)).toBe(false);
      expect(result.size).toBe(0);
    });

    it('should return an empty map when no impacts are provided', () => {
      const result = mergeImpacts();

      expect(result.size).toBe(0);
    });
  });
});
