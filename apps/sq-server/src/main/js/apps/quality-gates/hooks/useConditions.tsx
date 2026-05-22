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

import { uniqBy } from 'lodash';
import { useMemo } from 'react';
import { Path } from 'react-router-dom';
import { useCurrentUser } from '~adapters/helpers/users';
import { ConditionScaSuffix } from '~shared/components/quality-gates/ConditionScaSuffix';
import { isScaMeasure } from '~shared/helpers/sca';
import { Metric } from '~shared/types/measures';
import { PinkDiamond } from '~sq-server-commons/components/icon-mappers/PinkDiamondIcon';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { useDocUrl } from '~sq-server-commons/helpers/docs';
import { groupAndSortByPriorityConditions } from '~sq-server-commons/helpers/quality-gates';
import { getGlobalSettingsUrl } from '~sq-server-commons/helpers/urls';
import { Condition } from '~sq-server-commons/types/types';
import { ADVANCED_SECURITY_CATEGORY } from '../../settings/constants';

export interface DecoratedCondition extends Condition {
  isDisabled?: boolean;
  suffix?: React.ReactNode;
}

export function createScaConditionDecorator({
  isScaEnabled,
  isScaAvailable,
  advancedSecuritySettingsUrl,
  advancedSecurityDocsUrl,
  upgradeIcon,
  isLoggedIn,
}: {
  advancedSecurityDocsUrl: string;
  advancedSecuritySettingsUrl: Partial<Path>;
  isLoggedIn: boolean;
  isScaAvailable: boolean;
  isScaEnabled: boolean;
  upgradeIcon: React.ReactNode;
}) {
  return (metricKey: string) => {
    const needSca = isScaMeasure(metricKey);
    return {
      isDisabled: needSca && (!isScaEnabled || !isScaAvailable),
      suffix: needSca ? (
        <ConditionScaSuffix
          advancedSecurityDocsUrl={advancedSecurityDocsUrl}
          advancedSecuritySettingsUrl={advancedSecuritySettingsUrl}
          isLoggedIn={isLoggedIn}
          isScaAvailable={isScaAvailable}
          isScaEnabled={isScaEnabled}
          metricKey={metricKey}
          upgradeIcon={upgradeIcon}
        />
      ) : undefined,
    };
  };
}

export const useConditions = ({
  conditions,
  isBuiltIn,
  isAiCodeSupported,
  metrics,
  isScaEnabled,
  isScaAvailable,
}: {
  conditions: Condition[];
  isAiCodeSupported?: boolean;
  isBuiltIn?: boolean;
  isScaAvailable?: boolean;
  isScaEnabled?: boolean;
  metrics: Record<string, Metric>;
}): {
  builtInNewCodeConditions: DecoratedCondition[];
  builtInOverallConditions: Condition[];
  existingConditions: Condition[];
  newCodeConditions: Condition[];
  overallCodeConditions: Condition[];
  uniqDuplicates: (Omit<Condition, 'metric'> & { metric: Metric })[];
} => {
  const docUrl = useDocUrl();

  const { isLoggedIn } = useCurrentUser();

  const existingConditions = conditions.filter((condition) => metrics[condition.metric]);
  const {
    overallCodeConditions,
    newCodeConditions,
    builtInNewCodeConditions,
    builtInOverallConditions,
  } = groupAndSortByPriorityConditions(existingConditions, metrics, isBuiltIn, isAiCodeSupported);

  const duplicates: Condition[] = [];
  const savedConditions = existingConditions.filter((condition) => condition.id != null);
  savedConditions.forEach((condition) => {
    const sameCount = savedConditions.filter((sample) => sample.metric === condition.metric).length;
    if (sameCount > 1) {
      duplicates.push(condition);
    }
  });

  const uniqDuplicates = uniqBy(duplicates, (d) => d.metric).map((condition) => ({
    ...condition,
    metric: metrics[condition.metric],
  }));

  const decorate = useMemo(
    () =>
      createScaConditionDecorator({
        isScaEnabled: isScaEnabled ?? false,
        isScaAvailable: isScaAvailable ?? false,
        advancedSecuritySettingsUrl: getGlobalSettingsUrl(ADVANCED_SECURITY_CATEGORY),
        advancedSecurityDocsUrl: docUrl(DocLink.AdvancedSecurity),
        upgradeIcon: <PinkDiamond />,
        isLoggedIn,
      }),
    [isScaEnabled, isScaAvailable, docUrl, isLoggedIn],
  );

  return {
    overallCodeConditions,
    newCodeConditions: newCodeConditions.map((c) => ({ ...c, ...decorate(c.metric) })),
    builtInNewCodeConditions: builtInNewCodeConditions.map((c) => ({
      ...c,
      ...decorate(c.metric),
    })),
    builtInOverallConditions,
    uniqDuplicates,
    existingConditions,
  };
};
