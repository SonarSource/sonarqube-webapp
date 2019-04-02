/*
 * SonarQube
 * Copyright (C) 2009-2019 SonarSource SA
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
export function extractStatusConditionsFromProjectStatus(
  projectStatus: T.QualityGateProjectStatus
): T.QualityGateStatusCondition[] {
  const { conditions } = projectStatus;
  return conditions
    ? conditions.map(c => ({
        actual: c.actualValue,
        error: c.errorThreshold,
        level: c.status,
        metric: c.metricKey,
        op: c.comparator,
        period: c.periodIndex
      }))
    : [];
}

export function isSameStatusConditionList(
  conditions?: T.QualityGateStatusCondition[],
  prevConditions?: T.QualityGateStatusCondition[]
): boolean {
  if (conditions === undefined || prevConditions === undefined) {
    return !(prevConditions || conditions);
  } else if (conditions.length !== prevConditions.length) {
    return false;
  } else {
    const filtered = conditions.filter(c1 => {
      return !prevConditions.find(c2 => c2.metric === c1.metric && c2.level === c1.level);
    });
    return filtered.length === 0;
  }
}
