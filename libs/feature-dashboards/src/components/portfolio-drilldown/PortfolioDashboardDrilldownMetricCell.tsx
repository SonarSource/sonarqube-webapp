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

import { RatingBadge, RatingBadgeRating, RatingBadgeSize, Table } from '@sonarsource/echoes-react';
import type { ReactElement, ReactNode } from 'react';
import { type IntlShape, useIntl } from 'react-intl';
import type { To } from 'react-router-dom';
import { QualityGateIndicator } from '~adapters/components/ui/QualityGateIndicator';
import { formatDashboardMeasure } from '~adapters/helpers/dashboard-measures';
import type { QGStatusExtended } from '~shared/types/common';
import { MetricType } from '~shared/types/metrics';
import type {
  PortfolioDashboardDrilldownDescriptor,
  PortfolioDashboardMeasureDrilldownDescriptor,
} from './portfolioPieChartDrilldown';

const METRIC_CELL_END_LINK_CLASS = 'sw-flex sw-w-full sw-justify-end';
const VALUE_CELL_JUSTIFY_END = 'sw-justify-end';

interface Props {
  descriptor: NonNullable<PortfolioDashboardDrilldownDescriptor>;
  to: To | null;
  value: string | number;
}

function cellWithOptionalEndDrilldownLink(to: To | null, content: ReactNode): ReactElement {
  if (to) {
    return (
      <Table.CellLink className={METRIC_CELL_END_LINK_CLASS} to={to}>
        {content}
      </Table.CellLink>
    );
  }
  return <Table.Cell className={VALUE_CELL_JUSTIFY_END}>{content}</Table.Cell>;
}

function issueCountNumberCell(to: To | null, value: number) {
  return cellWithOptionalEndDrilldownLink(to, formatDashboardMeasure(value, MetricType.Integer));
}

function numericValueCell(
  descriptor: NonNullable<PortfolioDashboardDrilldownDescriptor>,
  to: To | null,
  value: number,
) {
  const numericFormatType =
    descriptor.kind === 'computed-measures' && descriptor.numericFormatMetricType !== undefined
      ? descriptor.numericFormatMetricType
      : MetricType.Integer;
  const formatOptions =
    numericFormatType === MetricType.Percent ? { omitExtraDecimalZeros: true } : undefined;
  const formattedValue = formatDashboardMeasure(value, numericFormatType, formatOptions);

  if (descriptor.kind !== 'computed-measures') {
    return <Table.Cell className={VALUE_CELL_JUSTIFY_END}>{formattedValue}</Table.Cell>;
  }

  return cellWithOptionalEndDrilldownLink(to, formattedValue);
}

function stringComputedMeasureValueCell(
  descriptor: PortfolioDashboardMeasureDrilldownDescriptor,
  formatMessage: IntlShape['formatMessage'],
  to: To | null,
  value: string,
) {
  const { stringValueFormatMetricType } = descriptor;
  if (stringValueFormatMetricType === undefined) {
    return <Table.CellText content={value} />;
  }

  if (stringValueFormatMetricType === MetricType.Level) {
    const status = (String(value) || 'NOT_COMPUTED') as QGStatusExtended;
    const content = (
      <div className="sw-flex sw-items-center sw-gap-2">
        <QualityGateIndicator size="sm" status={status} />
        {formatDashboardMeasure(String(value), MetricType.Level)}
      </div>
    );
    return cellWithOptionalEndDrilldownLink(to, content);
  }

  if (stringValueFormatMetricType === MetricType.Rating) {
    const rawRating = String(value);
    const ratingLabel = formatDashboardMeasure(rawRating, MetricType.Rating);
    const content = ratingLabel ? (
      <RatingBadge
        ariaLabel={formatMessage({ id: 'metric.has_rating_X' }, { 0: ratingLabel })}
        rating={ratingLabel as RatingBadgeRating}
        size={RatingBadgeSize.ExtraSmall}
      />
    ) : (
      rawRating
    );
    return cellWithOptionalEndDrilldownLink(to, content);
  }

  return (
    <Table.CellText content={formatDashboardMeasure(String(value), stringValueFormatMetricType)} />
  );
}

export function PortfolioDashboardDrilldownMetricCell(props: Readonly<Props>) {
  const { descriptor, to, value } = props;
  const { formatMessage } = useIntl();

  if (descriptor.valueType === 'number' || typeof value === 'number') {
    const numericValue = typeof value === 'number' ? value : Number(value);
    if (value !== '' && Number.isFinite(numericValue)) {
      return descriptor.kind === 'issue-counts'
        ? issueCountNumberCell(to, numericValue)
        : numericValueCell(descriptor, to, numericValue);
    }
  }

  if (descriptor.kind === 'computed-measures') {
    return stringComputedMeasureValueCell(descriptor, formatMessage, to, String(value));
  }

  return <Table.CellText content={String(value)} />;
}
