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

import { Badge, Label, LinkHighlight, LinkStandalone } from '@sonarsource/echoes-react';
import classNames from 'classnames';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Path } from 'react-router-dom';
import { MetricKey } from '~shared/types/metrics';
import { NoDataIcon } from '../../design-system';
import { translateWithParameters } from '../../helpers/l10n';
import { localizeMetric } from '../../helpers/measures';

interface IssueMeasuresCardInnerProps extends React.HTMLAttributes<HTMLDivElement> {
  disabled?: boolean;
  failed?: boolean;
  footer?: React.ReactNode;
  header: React.ReactNode;
  icon?: React.ReactNode;
  metric: MetricKey;
  url: Partial<Path>;
  value?: string;
}

export function IssueMeasuresCardInner(props: Readonly<IssueMeasuresCardInnerProps>) {
  const { header, metric, icon, value, url, failed, footer, className, disabled, ...rest } = props;

  return (
    <div className={classNames('sw-flex sw-flex-col sw-gap-3', className)} {...rest}>
      <div
        className={classNames('sw-flex sw-flex-col sw-gap-2 sw-font-semibold', {
          'sw-opacity-60': disabled,
        })}
      >
        <div className="sw-flex sw-items-center sw-gap-2">
          <Label as="span" className="sw-whitespace-nowrap">
            {header}
          </Label>

          {failed && (
            <Badge variety="danger">
              <FormattedMessage id="overview.measures.failed_badge" />
            </Badge>
          )}
        </div>
        <div className="sw-flex sw-justify-between sw-items-center sw-h-9">
          <div className="sw-h-fit">
            <LinkStandalone
              aria-label={
                value
                  ? translateWithParameters(
                      'overview.see_more_details_on_x_of_y',
                      value,
                      localizeMetric(metric),
                    )
                  : translateWithParameters('no_measure_value_x', localizeMetric(metric))
              }
              className="it__overview-measures-value sw-w-fit sw-text-lg"
              highlight={LinkHighlight.Default}
              to={url}
            >
              {value ?? '-'}
            </LinkStandalone>
          </div>
          {value ? icon : <NoDataIcon size="md" />}
        </div>
      </div>
      {footer}
    </div>
  );
}
