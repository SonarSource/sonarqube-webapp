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
  ButtonVariety,
  Select,
  Spinner,
  TextInput,
  toast,
} from '@sonarsource/echoes-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import type { CompanyProfile } from '../api/cost-savings-api';
import { useConfigurationMutation, useConfigurationQuery } from '../hooks/useCostSavings';

interface Props {
  onClose: () => void;
}

const INDUSTRY_OPTIONS = [
  { label: 'Healthcare', value: 'HEALTHCARE' },
  { label: 'Financial Services', value: 'FINANCIAL' },
  { label: 'Pharmaceutical', value: 'PHARMACEUTICAL' },
  { label: 'Manufacturing', value: 'MANUFACTURING' },
  { label: 'Technology', value: 'TECHNOLOGY' },
  { label: 'Energy', value: 'ENERGY' },
  { label: 'Professional Services', value: 'PROFESSIONAL_SERVICES' },
  { label: 'Transportation', value: 'TRANSPORTATION' },
  { label: 'Communications', value: 'COMMUNICATIONS' },
  { label: 'Education', value: 'EDUCATION' },
  { label: 'Retail', value: 'RETAIL' },
  { label: 'Media', value: 'MEDIA' },
  { label: 'Hospitality', value: 'HOSPITALITY' },
  { label: 'Public Sector', value: 'PUBLIC_SECTOR' },
  { label: 'Other', value: 'OTHER' },
];

const REGION_OPTIONS = [
  { label: 'United States', value: 'US' },
  { label: 'Middle East', value: 'MIDDLE_EAST' },
  { label: 'Canada', value: 'CANADA' },
  { label: 'Germany', value: 'GERMANY' },
  { label: 'Japan', value: 'JAPAN' },
  { label: 'United Kingdom', value: 'UK' },
  { label: 'France', value: 'FRANCE' },
  { label: 'Italy', value: 'ITALY' },
  { label: 'Latin America', value: 'LATIN_AMERICA' },
  { label: 'South Korea', value: 'SOUTH_KOREA' },
  { label: 'ASEAN', value: 'ASEAN' },
  { label: 'Australia', value: 'AUSTRALIA' },
  { label: 'India', value: 'INDIA' },
  { label: 'Global Average', value: 'GLOBAL' },
];

function ConfigurationPanel({ onClose }: Props) {
  const { formatMessage } = useIntl();
  const { data: config, isLoading } = useConfigurationQuery();
  const mutation = useConfigurationMutation();
  const drawerRef = useRef<HTMLDivElement>(null);

  const [draft, setDraft] = useState<Partial<CompanyProfile>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  const currentConfig = config ?? {
    industry: 'TECHNOLOGY',
    region: 'US',
  };

  const merged: CompanyProfile = { ...currentConfig, ...draft };

  // Escape key handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Focus management — focus the drawer on mount
  useEffect(() => {
    drawerRef.current?.focus();
  }, []);

  function handleSave() {
    mutation.mutate(merged, {
      onError: () => {
        toast.error({
          description: formatMessage({ id: 'cost_savings.config.save_error' }),
          duration: 'short',
        });
      },
      onSuccess: () => {
        toast.success({
          description: formatMessage({ id: 'cost_savings.config.saved' }),
          duration: 'short',
        });
        onClose();
      },
    });
  }

  return (
    <div className="sw-fixed sw-inset-0 sw-z-modal-overlay sw-flex sw-justify-end" role="dialog">
      {/* Backdrop */}
      <div
        className="sw-absolute sw-inset-0"
        onClick={onClose}
        style={{ backgroundColor: 'rgba(41, 0, 66, 0.3)' }}
      />

      {/* Drawer */}
      <div
        className="sw-relative sw-overflow-y-auto"
        ref={drawerRef}
        style={{
          width: 480,
          backgroundColor: 'white',
          boxShadow: '-8px 0 40px rgba(41, 0, 66, 0.1)',
          padding: 32,
        }}
        tabIndex={-1}
      >
        <div className="sw-flex sw-items-center sw-justify-between sw-mb-8">
          <h2 className="sw-font-bold" style={{ fontSize: 22, color: '#290042' }}>
            {formatMessage({ id: 'cost_savings.config.title' })}
          </h2>
          <Button onClick={onClose} variety={ButtonVariety.DefaultGhost}>
            {formatMessage({ id: 'close' })}
          </Button>
        </div>

        <Spinner isLoading={isLoading}>
          <div className="sw-flex sw-flex-col sw-gap-5">
            <div>
              <label
                className="sw-block sw-text-sm sw-font-semibold sw-mb-1.5"
                style={{ color: '#290042' }}
              >
                {formatMessage({ id: 'cost_savings.config.industry' })}
              </label>
              <Select
                data={INDUSTRY_OPTIONS}
                isNotClearable
                onChange={(value) => {
                  if (value) {
                    setDraft((d) => ({ ...d, industry: value }));
                  }
                }}
                value={merged.industry}
              />
            </div>

            <div>
              <label
                className="sw-block sw-text-sm sw-font-semibold sw-mb-1.5"
                style={{ color: '#290042' }}
              >
                {formatMessage({ id: 'cost_savings.config.region' })}
              </label>
              <Select
                data={REGION_OPTIONS}
                isNotClearable
                onChange={(value) => {
                  if (value) {
                    setDraft((d) => ({ ...d, region: value }));
                  }
                }}
                value={merged.region}
              />
            </div>

            <div>
              <label
                className="sw-block sw-text-sm sw-font-semibold sw-mb-1.5"
                style={{ color: '#290042' }}
              >
                {formatMessage({ id: 'cost_savings.config.hourly_rate' })}
              </label>
              <TextInput
                ariaLabel={formatMessage({ id: 'cost_savings.config.hourly_rate' })}
                onChange={(e: React.SyntheticEvent<HTMLInputElement>) => {
                  const val = parseFloat(e.currentTarget.value);
                  setDraft((d) => ({ ...d, hourlyRate: Number.isFinite(val) ? val : undefined }));
                }}
                placeholder="75"
                type="number"
                value={merged.hourlyRate?.toString() ?? ''}
              />
              <p className="sw-text-xs sw-mt-1.5" style={{ color: '#69809B' }}>
                {formatMessage({
                  id: 'cost_savings.config.hourly_rate_help',
                })}
              </p>
            </div>

            <div>
              <label
                className="sw-block sw-text-sm sw-font-semibold sw-mb-1.5"
                style={{ color: '#290042' }}
              >
                {formatMessage({ id: 'cost_savings.config.annual_revenue' })}
              </label>
              <TextInput
                ariaLabel={formatMessage({ id: 'cost_savings.config.annual_revenue' })}
                onChange={(e: React.SyntheticEvent<HTMLInputElement>) => {
                  const val = parseFloat(e.currentTarget.value);
                  setDraft((d) => ({
                    ...d,
                    annualRevenue: Number.isFinite(val) ? val : undefined,
                  }));
                }}
                placeholder={formatMessage({
                  id: 'cost_savings.config.optional',
                })}
                type="number"
                value={merged.annualRevenue?.toString() ?? ''}
              />
              <p className="sw-text-xs sw-mt-1.5" style={{ color: '#69809B' }}>
                {formatMessage({
                  id: 'cost_savings.config.annual_revenue_help',
                })}
              </p>
            </div>

            <div>
              <label
                className="sw-block sw-text-sm sw-font-semibold sw-mb-1.5"
                style={{ color: '#290042' }}
              >
                {formatMessage({ id: 'cost_savings.config.employee_count' })}
              </label>
              <TextInput
                ariaLabel={formatMessage({ id: 'cost_savings.config.employee_count' })}
                onChange={(e: React.SyntheticEvent<HTMLInputElement>) => {
                  const val = parseInt(e.currentTarget.value, 10);
                  setDraft((d) => ({
                    ...d,
                    employeeCount: Number.isFinite(val) ? val : undefined,
                  }));
                }}
                placeholder={formatMessage({
                  id: 'cost_savings.config.optional',
                })}
                type="number"
                value={merged.employeeCount?.toString() ?? ''}
              />
            </div>

            <div>
              <label
                className="sw-block sw-text-sm sw-font-semibold sw-mb-1.5"
                style={{ color: '#290042' }}
              >
                {formatMessage({ id: 'cost_savings.config.developer_count' })}
              </label>
              <TextInput
                ariaLabel={formatMessage({ id: 'cost_savings.config.developer_count' })}
                onChange={(e: React.SyntheticEvent<HTMLInputElement>) => {
                  const val = parseInt(e.currentTarget.value, 10);
                  setDraft((d) => ({
                    ...d,
                    developerCount: Number.isFinite(val) ? val : undefined,
                  }));
                }}
                placeholder={formatMessage({
                  id: 'cost_savings.config.optional',
                })}
                type="number"
                value={merged.developerCount?.toString() ?? ''}
              />
            </div>

            <div>
              <label
                className="sw-block sw-text-sm sw-font-semibold sw-mb-1.5"
                style={{ color: '#290042' }}
              >
                {formatMessage({ id: 'cost_savings.config.license_cost' })}
              </label>
              <TextInput
                ariaLabel={formatMessage({ id: 'cost_savings.config.license_cost' })}
                onChange={(e: React.SyntheticEvent<HTMLInputElement>) => {
                  const val = parseInt(e.currentTarget.value, 10);
                  setDraft((d) => ({ ...d, licenseCost: Number.isFinite(val) ? val : undefined }));
                }}
                placeholder={formatMessage({
                  id: 'cost_savings.config.optional',
                })}
                type="number"
                value={merged.licenseCost?.toString() ?? ''}
              />
              <p className="sw-text-xs sw-mt-1.5" style={{ color: '#69809B' }}>
                {formatMessage({
                  id: 'cost_savings.config.license_cost_help',
                })}
              </p>
            </div>

            {/* Anonymous benchmarking opt-in */}
            <div style={{ borderTop: '1px solid rgba(183, 211, 242, 0.4)', paddingTop: 20 }}>
              <label className="sw-flex sw-items-center sw-gap-2 sw-cursor-pointer">
                <input
                  checked={merged.telemetryOptIn === true}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, telemetryOptIn: e.currentTarget.checked }))
                  }
                  type="checkbox"
                />
                <span className="sw-text-sm sw-font-semibold" style={{ color: '#290042' }}>
                  {formatMessage({ id: 'cost_savings.config.telemetry_opt_in' })}
                </span>
              </label>
              <p className="sw-text-xs sw-mt-1.5 sw-ml-6" style={{ color: '#69809B' }}>
                {formatMessage({ id: 'cost_savings.config.telemetry_opt_in_help' })}
              </p>
            </div>

            {/* Advanced settings accordion */}
            <div style={{ borderTop: '1px solid rgba(183, 211, 242, 0.4)', paddingTop: 20 }}>
              <button
                className="sw-flex sw-items-center sw-gap-1.5 sw-text-sm sw-font-semibold sw-cursor-pointer sw-bg-transparent sw-border-none sw-p-0"
                onClick={() => setShowAdvanced((prev) => !prev)}
                style={{ color: '#126ED3' }}
                type="button"
              >
                <span>{showAdvanced ? '▾' : '▸'}</span>
                {formatMessage({ id: 'cost_savings.config.advanced' })}
              </button>

              {showAdvanced && (
                <div className="sw-mt-3">
                  <label
                    className="sw-block sw-text-sm sw-font-semibold sw-mb-1.5"
                    style={{ color: '#290042' }}
                  >
                    {formatMessage({ id: 'cost_savings.config.token_price' })}
                  </label>
                  <TextInput
                    ariaLabel={formatMessage({ id: 'cost_savings.config.token_price' })}
                    onChange={(e: React.SyntheticEvent<HTMLInputElement>) => {
                      const val = parseFloat(e.currentTarget.value);
                      setDraft((d) => ({
                        ...d,
                        tokenPricePerMillion: Number.isFinite(val) ? val : undefined,
                      }));
                    }}
                    placeholder="2.00"
                    type="number"
                    value={merged.tokenPricePerMillion?.toString() ?? ''}
                  />
                  <p className="sw-text-xs sw-mt-1.5" style={{ color: '#69809B' }}>
                    {formatMessage({
                      id: 'cost_savings.config.token_price_help',
                    })}
                  </p>
                </div>
              )}
            </div>

            <div className="sw-flex sw-gap-2 sw-mt-4">
              <Button
                isDisabled={mutation.isPending}
                onClick={handleSave}
                variety={ButtonVariety.Primary}
              >
                {formatMessage({ id: 'save' })}
              </Button>
              <Button onClick={onClose} variety={ButtonVariety.Default}>
                {formatMessage({ id: 'cancel' })}
              </Button>
            </div>
          </div>
        </Spinner>
      </div>
    </div>
  );
}

export { ConfigurationPanel };
