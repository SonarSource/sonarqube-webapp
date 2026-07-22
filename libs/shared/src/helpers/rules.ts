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

import { SoftwareQualityImpact } from '../types/clean-code-taxonomy';
import { Rule, RuleActivation, RuleDetails } from '../types/rules';

export function getImpactsDiffBySeverity(
  ruleImpacts: SoftwareQualityImpact[] = [],
  activationImpacts?: SoftwareQualityImpact[],
) {
  return ruleImpacts.reduce<{
    activationImpacts: SoftwareQualityImpact[];
    ruleImpacts: SoftwareQualityImpact[];
  }>(
    (res, impact) => {
      const actImpact = activationImpacts?.find(
        (actImpact) => actImpact.softwareQuality === impact.softwareQuality,
      );

      if (actImpact && actImpact.severity !== impact.severity) {
        res.activationImpacts.push(actImpact);
      } else {
        res.ruleImpacts.push(impact);
      }

      return res;
    },
    { ruleImpacts: [], activationImpacts: [] },
  );
}

export function getRuleParams({
  rule,
  activation,
}: {
  rule: Rule | RuleDetails;
  activation?: RuleActivation;
}) {
  const params: Record<string, string> = {};
  if (rule.params) {
    for (const param of rule.params) {
      params[param.key] = param.defaultValue ?? '';
    }
    if (activation?.params) {
      for (const param of activation.params) {
        params[param.key] = param.value;
      }
    }
  }
  return params;
}
