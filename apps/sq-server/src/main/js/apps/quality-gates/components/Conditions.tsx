/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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
  Heading,
  MessageCallout,
  MessageVariety,
  Spinner,
  Text,
  ToggleTip,
} from '@sonarsource/echoes-react';
import { uniqBy } from 'lodash';
import { HighlightedSection } from '~design-system';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import { useMetrics } from '~sq-server-commons/context/metrics/withMetricsContext';
import { getLocalizedMetricName, translate } from '~sq-server-commons/helpers/l10n';
import { groupAndSortByPriorityConditions } from '~sq-server-commons/helpers/quality-gates';
import { Feature } from '~sq-server-commons/types/features';
import { Condition as ConditionType, QualityGate } from '~sq-server-commons/types/types';
import AddConditionModal from './AddConditionModal';
import ConditionsTable from './ConditionsTable';
import CaycCondition from './NewCodeBuiltInCondition';
import AiCondition from './OverallBuiltInCondition';

interface Props {
  isFetching?: boolean;
  qualityGate: QualityGate;
}

export default function Conditions({ qualityGate, isFetching }: Readonly<Props>) {
  const { isBuiltIn, actions, conditions = [], isAiCodeSupported } = qualityGate;

  const metrics = useMetrics();
  const { hasFeature } = useAvailableFeatures();

  const canEdit = Boolean(actions?.manageConditions);
  const existingConditions = conditions.filter((condition) => metrics[condition.metric]);
  const {
    overallCodeConditions,
    newCodeConditions,
    builtInNewCodeConditions,
    builtInOverallConditions,
  } = groupAndSortByPriorityConditions(existingConditions, metrics, isBuiltIn, isAiCodeSupported);

  const duplicates: ConditionType[] = [];
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

  const isBuiltInAiCodeSupported = isBuiltIn && isAiCodeSupported;

  return (
    <>
      <header className="sw-flex sw-items-center sw-mt-9 sw-mb-4 sw-justify-between">
        <div className="sw-flex sw-items-center sw-gap-2">
          <Heading as="h2" className="sw-typo-lg-semibold sw-m-0">
            {translate('quality_gates.conditions')}
          </Heading>
          {!isBuiltIn && <ToggleTip description={translate('quality_gates.conditions.help')} />}
          {isBuiltIn && <ToggleTip description={translate('quality_gates.conditions.hint')} />}
          <Spinner className="sw-ml-4 sw-mt-1" isLoading={isFetching} />
        </div>
        <div>{canEdit && <AddConditionModal qualityGate={qualityGate} />}</div>
      </header>
      {uniqDuplicates.length > 0 && (
        <MessageCallout className="sw-mb-4" variety={MessageVariety.Warning}>
          <div>
            <p>{translate('quality_gates.duplicated_conditions')}</p>
            <ul className="sw-my-2 sw-list-disc sw-pl-10">
              {uniqDuplicates.map((d) => (
                <li key={d.metric.key}>{getLocalizedMetricName(d.metric)}</li>
              ))}
            </ul>
          </div>
        </MessageCallout>
      )}
      <div className="sw-flex sw-flex-col sw-gap-8">
        {builtInNewCodeConditions.length > 0 && (
          <div>
            <div className="sw-flex sw-items-center sw-gap-2 sw-mb-2">
              <Heading as="h3">
                {isBuiltInAiCodeSupported
                  ? translate('quality_gates.conditions.new_code', 'long')
                  : translate('quality_gates.conditions.builtin')}
              </Heading>
            </div>

            <HighlightedSection className="sw-p-0 sw-my-2">
              <ul aria-label={translate('quality_gates.condition_simplification_list')}>
                {builtInNewCodeConditions.map((condition) => (
                  <CaycCondition
                    condition={condition}
                    key={condition.id}
                    metric={metrics[condition.metric]}
                  />
                ))}
              </ul>
            </HighlightedSection>

            {hasFeature(Feature.BranchSupport) && (
              <Text className="sw-mb-2" isSubtle>
                {translate('quality_gates.conditions', 'description')}
              </Text>
            )}
          </div>
        )}

        {newCodeConditions.length > 0 && (
          <div>
            <div className="sw-flex sw-justify-between">
              <Heading as="h3" className="sw-mb-2">
                {translate('quality_gates.conditions.new_code', 'long')}
              </Heading>
              {hasFeature(Feature.BranchSupport) && (
                <Text className="sw-mb-2" isSubtle>
                  {translate('quality_gates.conditions.new_code', 'description')}
                </Text>
              )}
            </div>

            <ConditionsTable
              canEdit={canEdit}
              conditions={newCodeConditions}
              metrics={metrics}
              qualityGate={qualityGate}
              scope="new"
            />
          </div>
        )}

        {overallCodeConditions.length > 0 && (
          <div className="sw-mt-5">
            <div className="sw-flex sw-justify-between">
              <Heading as="h3" className="sw-mb-2">
                {translate('quality_gates.conditions.overall_code', 'long')}
              </Heading>
              {hasFeature(Feature.BranchSupport) && (
                <Text className="sw-mb-2" isSubtle>
                  {translate('quality_gates.conditions.overall_code', 'description')}
                </Text>
              )}
            </div>

            <ConditionsTable
              canEdit={canEdit}
              conditions={overallCodeConditions}
              metrics={metrics}
              qualityGate={qualityGate}
              scope="overall"
            />
          </div>
        )}
        {builtInOverallConditions.length > 0 && (
          <div>
            <div className="sw-flex sw-items-center sw-gap-2 sw-mb-2">
              <Heading as="h3" className="sw-mb-2">
                {translate('quality_gates.conditions.overall_code', 'long')}
              </Heading>
            </div>

            <HighlightedSection className="sw-p-0 sw-my-2" id="ai-highlight">
              <ul aria-label={translate('quality_gates.cayc.condition_simplification_list')}>
                {builtInOverallConditions.map((condition) => (
                  <AiCondition
                    condition={condition}
                    key={condition.id}
                    metric={metrics[condition.metric]}
                  />
                ))}
              </ul>
            </HighlightedSection>
          </div>
        )}
      </div>

      {existingConditions.length === 0 && (
        <div className="sw-mt-4 sw-typo-default">
          <Text as="p">{translate('quality_gates.no_conditions')}</Text>
        </div>
      )}
    </>
  );
}
