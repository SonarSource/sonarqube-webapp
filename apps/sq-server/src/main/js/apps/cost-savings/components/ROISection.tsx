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

import { LinkStandalone } from '@sonarsource/echoes-react';
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
      <div className="sw-p-8" style={{ backgroundColor: '#EEF4FC' }}>
        <h2 className="sw-font-bold sw-mb-3" style={{ fontSize: 20, color: '#290042' }}>
          {formatMessage({ id: 'cost_savings.roi.title' })}
        </h2>
        <p className="sw-text-sm sw-mb-4" style={{ color: '#69809B' }}>
          {formatMessage({ id: 'cost_savings.roi.prompt' })}
        </p>
        <LinkStandalone onClick={onOpenConfig} to="">
          {formatMessage({ id: 'cost_savings.roi.configure' })}
        </LinkStandalone>
      </div>
    );
  }

  const maxBar = Math.max(roi.totalSavings, roi.licenseCost);

  return (
    <div className="sw-p-8">
      <h2 className="sw-font-bold sw-mb-3" style={{ fontSize: 20, color: '#290042' }}>
        {formatMessage({ id: 'cost_savings.roi.title' })}
      </h2>

      <p className="sw-font-semibold sw-mb-6" style={{ fontSize: 18, color: '#290042' }}>
        {formatMessage({ id: 'cost_savings.roi.headline' }, { ratio: roi.ratio.toFixed(1) })}
      </p>

      {/* Bar chart: license cost vs savings */}
      <div className="sw-flex sw-flex-col sw-gap-5">
        <div>
          <div className="sw-flex sw-justify-between sw-text-sm sw-mb-2">
            <span style={{ color: '#290042' }}>
              {formatMessage({ id: 'cost_savings.roi.license_cost' })}
            </span>
            <span className="sw-font-semibold" style={{ color: '#69809B' }}>
              {formatCurrency(roi.licenseCost)}
            </span>
          </div>
          <div
            className="sw-overflow-hidden"
            style={{ height: 8, borderRadius: 4, backgroundColor: '#EEF4FC' }}
          >
            <div
              style={{
                height: '100%',
                borderRadius: 4,
                backgroundColor: '#69809B',
                width: `${(roi.licenseCost / maxBar) * 100}%`,
                transition: 'width 1s ease-out',
              }}
            />
          </div>
        </div>

        <div>
          <div className="sw-flex sw-justify-between sw-text-sm sw-mb-2">
            <span style={{ color: '#290042' }}>
              {formatMessage({ id: 'cost_savings.roi.savings' })}
            </span>
            <span className="sw-font-semibold" style={{ color: '#126ED3' }}>
              {formatCurrency(roi.totalSavings)}
            </span>
          </div>
          <div
            className="sw-overflow-hidden"
            style={{ height: 8, borderRadius: 4, backgroundColor: '#EEF4FC' }}
          >
            <div
              style={{
                height: '100%',
                borderRadius: 4,
                background: 'linear-gradient(90deg, #126ED3, #0F63BF)',
                width: `${(roi.totalSavings / maxBar) * 100}%`,
                transition: 'width 1s ease-out',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export { ROISection };
