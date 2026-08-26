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
  Button,
  ButtonSize,
  Card,
  CardSize,
  DropdownMenu,
  DropdownMenuAlign,
  IconChevronDown,
  Text,
} from '@sonarsource/echoes-react';
import { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import type { PieChartSegment } from '../../types/visualization';

interface Props {
  allowAllOption?: boolean;
  descriptionMessageId?: string;
  onSegmentChange: (segmentValue: string | undefined) => void;
  queryKey?: 'label' | 'value';
  segments: PieChartSegment[];
  selectedSegmentValue?: string;
  sliceDimensionMessageId: string;
}

export function PortfolioDrilldownSliceFilterCard(props: Readonly<Props>) {
  const {
    allowAllOption = false,
    descriptionMessageId = 'portfolio_dashboard.breakdown.slice_filter.description',
    onSegmentChange,
    queryKey = 'value',
    segments,
    selectedSegmentValue,
    sliceDimensionMessageId,
  } = props;
  const { formatMessage } = useIntl();
  const selectableSegments = useMemo(
    () => segments.filter((segment) => !segment.value.startsWith('OTHER_')),
    [segments],
  );

  if (selectableSegments.length === 0 && !allowAllOption) {
    return null;
  }

  const dimensionLabel = formatMessage({ id: sliceDimensionMessageId });
  const allLabel = allowAllOption
    ? formatMessage({ id: 'portfolio_dashboard.breakdown.slice_filter.all' })
    : '';
  const getSegmentQuery = (segment: PieChartSegment) =>
    queryKey === 'value' ? segment.value : segment.label;
  const selectedSegment = selectableSegments.find(
    (segment) => getSegmentQuery(segment) === selectedSegmentValue,
  );
  const displayedValue = selectedSegment?.label ?? selectedSegmentValue ?? allLabel;

  return (
    <Card size={CardSize.Small}>
      <Card.Body className="sw-flex sw-items-center">
        <div className="sw-flex sw-max-w-full sw-flex-wrap sw-items-center sw-gap-3">
          <Text className="sw-text-center">
            <FormattedMessage
              id={descriptionMessageId}
              values={{
                dim: (chunks) => <span className="sw-font-regular">{chunks}</span>,
                dimension: dimensionLabel,
              }}
            />
          </Text>
          <DropdownMenu
            align={DropdownMenuAlign.End}
            items={
              <>
                {allowAllOption && (
                  <DropdownMenu.ItemButtonCheckable
                    isChecked={selectedSegmentValue === undefined}
                    key="slice-all"
                    onClick={() => {
                      if (selectedSegmentValue !== undefined) {
                        onSegmentChange(undefined);
                      }
                    }}
                  >
                    {allLabel}
                  </DropdownMenu.ItemButtonCheckable>
                )}
                {selectableSegments.map((segment) => (
                  <DropdownMenu.ItemButtonCheckable
                    isChecked={getSegmentQuery(segment) === selectedSegmentValue}
                    key={segment.value}
                    onClick={() => {
                      const segmentQuery = getSegmentQuery(segment);
                      onSegmentChange(
                        segmentQuery === selectedSegmentValue ? undefined : segmentQuery,
                      );
                    }}
                  >
                    {segment.label}
                  </DropdownMenu.ItemButtonCheckable>
                ))}
              </>
            }
          >
            <Button
              aria-label={formatMessage(
                { id: 'portfolio_dashboard.breakdown.slice_filter.trigger_aria' },
                { dimension: dimensionLabel, value: displayedValue },
              )}
              className="sw-font-regular"
              size={ButtonSize.Medium}
              suffix={<IconChevronDown />}
            >
              <FormattedMessage
                id="portfolio_dashboard.breakdown.slice_filter.dimension_with_value"
                values={{
                  b: (chunks) => <span className="sw-font-semibold">{chunks}</span>,
                  dim: (chunks) => <span className="sw-font-regular">{chunks}</span>,
                  dimension: dimensionLabel,
                  value: displayedValue,
                }}
              />
            </Button>
          </DropdownMenu>
        </div>
      </Card.Body>
    </Card>
  );
}
