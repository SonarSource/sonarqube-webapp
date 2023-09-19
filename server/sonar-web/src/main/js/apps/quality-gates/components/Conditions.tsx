/*
 * SonarQube
 * Copyright (C) 2009-2023 SonarSource SA
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
  ButtonSecondary,
  CardWithPrimaryBackground,
  FlagMessage,
  HeadingDark,
  HelperHintIcon,
  LightPrimary,
  Link,
  SubHeading,
  SubnavigationFlowSeparator,
  Title,
} from 'design-system';
import { differenceWith, map, times, uniqBy } from 'lodash';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import withAvailableFeatures, {
  WithAvailableFeaturesProps,
} from '../../../app/components/available-features/withAvailableFeatures';
import withMetricsContext from '../../../app/components/metrics/withMetricsContext';
import DocumentationTooltip from '../../../components/common/DocumentationTooltip';
import ModalButton, { ModalProps } from '../../../components/controls/ModalButton';
import { useDocUrl } from '../../../helpers/docs';
import { getLocalizedMetricName, translate } from '../../../helpers/l10n';
import { Feature } from '../../../types/features';
import { MetricKey } from '../../../types/metrics';
import {
  CaycStatus,
  Condition as ConditionType,
  Dict,
  Metric,
  QualityGate,
} from '../../../types/types';
import { groupAndSortByPriorityConditions } from '../utils';
import CaycConditionsListItem from './CaycConditionsListItem';
import ConditionModal from './ConditionModal';
import CaycReviewUpdateConditionsModal from './ConditionReviewAndUpdateModal';
import ConditionsTable from './ConditionsTable';

export const CAYC_CONDITIONS_LIST_ITEMS = 6;

interface Props extends WithAvailableFeaturesProps {
  metrics: Dict<Metric>;
  onAddCondition: (condition: ConditionType) => void;
  onRemoveCondition: (Condition: ConditionType) => void;
  onSaveCondition: (newCondition: ConditionType, oldCondition: ConditionType) => void;
  qualityGate: QualityGate;
  updatedConditionId?: string;
}

const FORBIDDEN_METRIC_TYPES = ['DATA', 'DISTRIB', 'STRING', 'BOOL'];
const FORBIDDEN_METRICS: string[] = [
  MetricKey.alert_status,
  MetricKey.releasability_rating,
  MetricKey.security_hotspots,
  MetricKey.new_security_hotspots,
];

export function Conditions({
  qualityGate,
  metrics,
  onRemoveCondition,
  onSaveCondition,
  onAddCondition,
  hasFeature,
  updatedConditionId,
}: Props) {
  const [editing, setEditing] = React.useState<boolean>(
    qualityGate.caycStatus === CaycStatus.NonCompliant
  );
  const canEdit = Boolean(qualityGate.actions?.manageConditions);
  const { conditions = [] } = qualityGate;
  const existingConditions = conditions.filter((condition) => metrics[condition.metric]);
  const { overallCodeConditions, newCodeConditions } = groupAndSortByPriorityConditions(
    existingConditions,
    metrics
  );

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

  const getDocUrl = useDocUrl();

  React.useEffect(() => {
    setEditing(qualityGate.caycStatus === CaycStatus.NonCompliant);
  }, [qualityGate]);

  const renderConditionModal = React.useCallback(
    ({ onClose }: ModalProps) => {
      const { conditions = [] } = qualityGate;
      const availableMetrics = differenceWith(
        map(metrics, (metric) => metric).filter(
          (metric) =>
            !metric.hidden &&
            !FORBIDDEN_METRIC_TYPES.includes(metric.type) &&
            !FORBIDDEN_METRICS.includes(metric.key)
        ),
        conditions,
        (metric, condition) => metric.key === condition.metric
      );
      return (
        <ConditionModal
          header={translate('quality_gates.add_condition')}
          metrics={availableMetrics}
          onAddCondition={onAddCondition}
          onClose={onClose}
          qualityGate={qualityGate}
        />
      );
    },
    [metrics, qualityGate, onAddCondition]
  );

  const renderCaycModal = React.useCallback(
    ({ onClose }: ModalProps) => {
      const { conditions = [] } = qualityGate;
      const canEdit = Boolean(qualityGate.actions?.manageConditions);
      return (
        <CaycReviewUpdateConditionsModal
          qualityGate={qualityGate}
          metrics={metrics}
          canEdit={canEdit}
          onRemoveCondition={onRemoveCondition}
          onSaveCondition={onSaveCondition}
          onAddCondition={onAddCondition}
          lockEditing={() => setEditing(false)}
          updatedConditionId={updatedConditionId}
          conditions={conditions}
          scope="new-cayc"
          onClose={onClose}
        />
      );
    },
    [qualityGate, metrics, updatedConditionId, onAddCondition, onRemoveCondition, onSaveCondition]
  );

  return (
    <div>
      {qualityGate.caycStatus !== CaycStatus.NonCompliant && (
        <CardWithPrimaryBackground className="sw-mb-9 sw-p-8">
          <Title as="h2" className="sw-mb-2 sw-heading-md">
            {translate('quality_gates.cayc.banner.title')}
          </Title>
          <SubHeading className="sw-body-sm sw-mb-4">
            <FormattedMessage
              id="quality_gates.cayc.banner.description1"
              defaultMessage={translate('quality_gates.cayc.banner.description1')}
              values={{
                cayc_link: (
                  <Link to={getDocUrl('/user-guide/clean-as-you-code/')}>
                    {translate('quality_gates.cayc')}
                  </Link>
                ),
              }}
            />
            {translate('quality_gates.cayc.banner.description2')}
          </SubHeading>
          <ul className="sw-body-sm">
            {times(CAYC_CONDITIONS_LIST_ITEMS, (i) => (
              <CaycConditionsListItem
                index={i}
                key={i}
                last={i === CAYC_CONDITIONS_LIST_ITEMS - 1}
              />
            ))}
          </ul>
        </CardWithPrimaryBackground>
      )}

      {qualityGate.caycStatus === CaycStatus.NonCompliant && canEdit && (
        <CardWithPrimaryBackground className="sw-mb-9 sw-p-8">
          <Title as="h2" className="sw-mb-2 sw-heading-md">
            {translate('quality_gates.cayc_missing.banner.title')}
          </Title>
          <SubHeading className="sw-body-sm sw-mb-4">
            <FormattedMessage
              id="quality_gates.cayc_missing.banner.description"
              defaultMessage={translate('quality_gates.cayc_missing.banner.description')}
              values={{
                cayc_link: (
                  <Link to={getDocUrl('/user-guide/clean-as-you-code/')}>
                    {translate('quality_gates.cayc')}
                  </Link>
                ),
              }}
            />
          </SubHeading>
          <SubnavigationFlowSeparator className="sw-m-0" />
          {canEdit && (
            <ModalButton modal={renderCaycModal}>
              {({ onClick }) => (
                <ButtonSecondary className="sw-mt-4" onClick={onClick}>
                  {translate('quality_gates.cayc_condition.review_update')}
                </ButtonSecondary>
              )}
            </ModalButton>
          )}
        </CardWithPrimaryBackground>
      )}

      <header className="sw-flex sw-items-center sw-mb-4 sw-justify-between">
        <div className="sw-flex">
          <HeadingDark className="sw-body-md-highlight sw-m-0">
            {translate('quality_gates.conditions')}
          </HeadingDark>
          <DocumentationTooltip
            className="sw-ml-2"
            content={translate('quality_gates.conditions.help')}
            links={[
              {
                href: '/user-guide/clean-as-you-code/',
                label: translate('quality_gates.conditions.help.link'),
              },
            ]}
          >
            <HelperHintIcon />
          </DocumentationTooltip>
        </div>
        <div>
          {(qualityGate.caycStatus === CaycStatus.NonCompliant || editing) && canEdit && (
            <ModalButton modal={renderConditionModal}>
              {({ onClick }) => (
                <ButtonSecondary data-test="quality-gates__add-condition" onClick={onClick}>
                  {translate('quality_gates.add_condition')}
                </ButtonSecondary>
              )}
            </ModalButton>
          )}
        </div>
      </header>

      {uniqDuplicates.length > 0 && (
        <FlagMessage variant="warning" className="sw-flex sw-mb-4">
          <p>
            <p>{translate('quality_gates.duplicated_conditions')}</p>
            <ul className="sw-my-2 sw-list-disc sw-pl-10">
              {uniqDuplicates.map((d) => (
                <li key={d.metric.key}>{getLocalizedMetricName(d.metric)}</li>
              ))}
            </ul>
          </p>
        </FlagMessage>
      )}

      {newCodeConditions.length > 0 && (
        <div>
          <HeadingDark as="h3" className="sw-mb-2">
            {translate('quality_gates.conditions.new_code', 'long')}
          </HeadingDark>
          {hasFeature(Feature.BranchSupport) && (
            <SubHeading as="p" className="sw-mb-2 sw-body-sm">
              {translate('quality_gates.conditions.new_code', 'description')}
            </SubHeading>
          )}
          <ConditionsTable
            qualityGate={qualityGate}
            metrics={metrics}
            canEdit={canEdit}
            onRemoveCondition={onRemoveCondition}
            onSaveCondition={onSaveCondition}
            updatedConditionId={updatedConditionId}
            conditions={newCodeConditions}
            showEdit={editing}
            scope="new"
          />
        </div>
      )}

      {overallCodeConditions.length > 0 && (
        <div className="sw-mt-5">
          <HeadingDark as="h3" className="sw-mb-2">
            {translate('quality_gates.conditions.overall_code', 'long')}
          </HeadingDark>

          {hasFeature(Feature.BranchSupport) && (
            <SubHeading as="p" className="sw-mb-2 sw-body-sm">
              {translate('quality_gates.conditions.overall_code', 'description')}
            </SubHeading>
          )}

          <ConditionsTable
            qualityGate={qualityGate}
            metrics={metrics}
            canEdit={canEdit}
            onRemoveCondition={onRemoveCondition}
            onSaveCondition={onSaveCondition}
            updatedConditionId={updatedConditionId}
            conditions={overallCodeConditions}
            scope="overall"
          />
        </div>
      )}

      {qualityGate.caycStatus !== CaycStatus.NonCompliant && !editing && canEdit && (
        <div className="sw-mt-4 sw-mb-10 it__qg-unfollow-cayc">
          <SubHeading as="p" className="sw-mb-2 sw-body-sm">
            <FormattedMessage
              id="quality_gates.cayc_unfollow.description"
              defaultMessage={translate('quality_gates.cayc_unfollow.description')}
              values={{
                cayc_link: (
                  <Link to={getDocUrl('/user-guide/clean-as-you-code/')}>
                    {translate('quality_gates.cayc')}
                  </Link>
                ),
              }}
            />
          </SubHeading>
          <ButtonSecondary className="sw-mt-2" onClick={() => setEditing(true)}>
            {translate('quality_gates.cayc.unlock_edit')}
          </ButtonSecondary>
        </div>
      )}

      {existingConditions.length === 0 && (
        <div className="sw-mt-4 sw-body-sm">
          <LightPrimary as="p">{translate('quality_gates.no_conditions')}</LightPrimary>
        </div>
      )}
    </div>
  );
}

export default withMetricsContext(withAvailableFeatures(Conditions));
