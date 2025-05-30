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
  Button,
  ButtonIcon,
  ButtonSize,
  ButtonVariety,
  IconDelete,
  IconRefresh,
  ModalAlert,
  Text,
} from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  ActionCell,
  ContentCell,
  NumericalCell,
  Pill,
  PillHighlight,
  PillVariant,
  TableRow,
} from '~design-system';
import { Metric } from '~shared/types/measures';
import { MetricKey } from '~shared/types/metrics';
import { useMetrics } from '~sq-server-commons/context/metrics/withMetricsContext';
import { getLocalizedMetricName, translate } from '~sq-server-commons/helpers/l10n';
import {
  getLocalizedMetricNameNoDiffMetric,
  getOperatorLabel,
  isConditionWithFixedValue,
  isNonEditableMetric,
  MQR_CONDITIONS_MAP,
  STANDARD_CONDITIONS_MAP,
} from '~sq-server-commons/helpers/quality-gates';
import { useStandardExperienceModeQuery } from '~sq-server-commons/queries/mode';
import { useDeleteConditionMutation } from '~sq-server-commons/queries/quality-gates';
import {
  CaycStatus,
  Condition as ConditionType,
  QualityGate,
} from '~sq-server-commons/types/types';
import ConditionValue from './ConditionValue';
import EditConditionModal from './EditConditionModal';
import UpdateConditionsFromOtherModeModal from './UpdateConditionsFromOtherModeModal';

interface Props {
  canEdit: boolean;
  condition: ConditionType;
  isCaycModal?: boolean;
  metric: Metric;
  qualityGate: QualityGate;
  showEdit?: boolean;
}

export default function ConditionComponent({
  condition,
  canEdit,
  metric,
  qualityGate,
  showEdit,
  isCaycModal,
}: Readonly<Props>) {
  const { mutateAsync: deleteCondition } = useDeleteConditionMutation(qualityGate.name);
  const metrics = useMetrics();
  const intl = useIntl();
  const { data: isStandard } = useStandardExperienceModeQuery();
  const { op = 'GT' } = condition;

  const isCaycCompliantAndOverCompliant = qualityGate.caycStatus !== CaycStatus.NonCompliant;
  const isMetricFromOtherMode = isStandard
    ? MQR_CONDITIONS_MAP[condition.metric as MetricKey] !== undefined
    : STANDARD_CONDITIONS_MAP[condition.metric as MetricKey] !== undefined;

  return (
    <TableRow>
      <ContentCell>
        {getLocalizedMetricNameNoDiffMetric(metric, metrics)}
        {isMetricFromOtherMode && canEdit && (
          <Pill className="sw-ml-2" highlight={PillHighlight.Medium} variant={PillVariant.Neutral}>
            {intl.formatMessage({
              id: `quality_gates.metric.${isStandard ? 'mqr' : 'standard'}_mode_short`,
            })}
          </Pill>
        )}
        {metric.hidden && (
          <Text className="sw-ml-1" colorOverride="echoes-color-text-danger">
            {translate('deprecated')}
          </Text>
        )}
      </ContentCell>

      <ContentCell className="sw-whitespace-nowrap">{getOperatorLabel(op, metric)}</ContentCell>

      <NumericalCell className="sw-whitespace-nowrap">
        <ConditionValue
          condition={condition}
          isCaycCompliantAndOverCompliant={isCaycCompliantAndOverCompliant}
          isCaycModal={isCaycModal}
          metric={metric}
        />
      </NumericalCell>
      <ActionCell>
        {!isCaycModal && canEdit && (
          <>
            {isMetricFromOtherMode && (
              <UpdateConditionsFromOtherModeModal
                condition={condition}
                qualityGateName={qualityGate.name}
              >
                <ButtonIcon
                  Icon={IconRefresh}
                  ariaLabel={intl.formatMessage(
                    { id: 'quality_gates.mqr_mode_update.single_metric.tooltip.message' },
                    {
                      metric: getLocalizedMetricNameNoDiffMetric(metric, metrics),
                      mode: intl.formatMessage({
                        id: `settings.mode.${isStandard ? 'standard' : 'mqr'}.name`,
                      }),
                    },
                  )}
                  className="sw-mr-4"
                  variety={ButtonVariety.PrimaryGhost}
                />
              </UpdateConditionsFromOtherModeModal>
            )}
            {(!isCaycCompliantAndOverCompliant ||
              !isConditionWithFixedValue(condition) ||
              (isCaycCompliantAndOverCompliant && showEdit)) &&
              !isNonEditableMetric(condition.metric as MetricKey) &&
              !isMetricFromOtherMode && (
                <EditConditionModal
                  condition={condition}
                  header={translate('quality_gates.update_condition')}
                  metric={metric}
                  qualityGate={qualityGate}
                />
              )}
            {(!isCaycCompliantAndOverCompliant ||
              !condition.isCaycCondition ||
              (isCaycCompliantAndOverCompliant && showEdit)) && (
              <ModalAlert
                description={
                  <FormattedMessage
                    id="quality_gates.delete_condition.confirm.message"
                    values={{ metric: getLocalizedMetricName(metric) }}
                  />
                }
                primaryButton={
                  <Button onClick={() => deleteCondition(condition)} variety={ButtonVariety.Danger}>
                    {translate('delete')}
                  </Button>
                }
                secondaryButtonLabel={translate('close')}
                title={translate('quality_gates.delete_condition')}
              >
                <ButtonIcon
                  Icon={IconDelete}
                  ariaLabel={intl.formatMessage(
                    { id: 'quality_gates.condition.delete' },
                    { metric: metric.name },
                  )}
                  size={ButtonSize.Medium}
                  variety={ButtonVariety.DangerGhost}
                />
              </ModalAlert>
            )}
          </>
        )}
      </ActionCell>
    </TableRow>
  );
}
