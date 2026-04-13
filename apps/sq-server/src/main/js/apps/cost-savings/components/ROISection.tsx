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

import { Heading, LinkStandalone } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import type { ROI } from '../api/cost-savings-api';
import { formatCurrency } from '../utils/format';

interface Props {
  onOpenConfig: () => void;
  roi?: ROI;
}

function ROISection({ roi, onOpenConfig }: Props) {
  const { formatMessage } = useIntl();

  if (!roi) {
    return (
      <div className="sw-p-6 sw-bg-blue-50">
        <Heading as="h2" className="sw-typo-semibold sw-mb-2">
          {formatMessage({ id: 'cost_savings.roi.title' })}
        </Heading>
        <p className="sw-text-sm sw-mb-3">{formatMessage({ id: 'cost_savings.roi.prompt' })}</p>
        <LinkStandalone onClick={onOpenConfig} to="">
          {formatMessage({ id: 'cost_savings.roi.configure' })}
        </LinkStandalone>
      </div>
    );
  }

  const maxBar = Math.max(roi.totalSavings, roi.licenseCost);

  return (
    <div className="sw-p-6">
      <Heading as="h2" className="sw-typo-semibold sw-mb-2">
        {formatMessage({ id: 'cost_savings.roi.title' })}
      </Heading>

      <p className="sw-text-lg sw-font-semibold sw-mb-4">
        {formatMessage({ id: 'cost_savings.roi.headline' }, { ratio: roi.ratio.toFixed(1) })}
      </p>

      {/* Bar chart: license cost vs savings */}
      <div className="sw-flex sw-flex-col sw-gap-3">
        <div>
          <div className="sw-flex sw-justify-between sw-text-sm sw-mb-1">
            <span>{formatMessage({ id: 'cost_savings.roi.license_cost' })}</span>
            <span className="sw-font-medium">{formatCurrency(roi.licenseCost)}</span>
          </div>
          <div className="sw-h-6 sw-bg-gray-100 sw-rounded sw-overflow-hidden">
            <div
              className="sw-h-full sw-bg-gray-400 sw-rounded"
              style={{ width: `${(roi.licenseCost / maxBar) * 100}%` }}
            />
          </div>
        </div>

        <div>
          <div className="sw-flex sw-justify-between sw-text-sm sw-mb-1">
            <span>{formatMessage({ id: 'cost_savings.roi.savings' })}</span>
            <span className="sw-font-medium">{formatCurrency(roi.totalSavings)}</span>
          </div>
          <div className="sw-h-6 sw-bg-gray-100 sw-rounded sw-overflow-hidden">
            <div
              className="sw-h-full sw-bg-green-500 sw-rounded"
              style={{ width: `${(roi.totalSavings / maxBar) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export { ROISection };
