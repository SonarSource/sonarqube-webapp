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
  FormFieldWidth,
  Heading,
  Label,
  MessageCallout,
  RadioButtonGroup,
  Text,
  TextInput,
  Tooltip,
  toast,
} from '@sonarsource/echoes-react';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { unstable_usePrompt as usePrompt } from 'react-router-dom';
import { RequiredIcon } from '~design-system';
import DocumentationLink from '~sq-server-commons/components/common/DocumentationLink';
import { useAppState } from '~sq-server-commons/context/app-state/withAppStateContext';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { useGetValueQuery, useSaveSimpleValueMutation } from '~sq-server-commons/queries/settings';
import { supportsCustomProjectDashboards } from '../../../projectDashboards/permissions';
import { DASHBOARD_HISTORY_RETENTION_KEY } from '../../constants';
import { ReduceRetentionModal } from './ReduceRetentionModal';

type RetentionOption = 365 | 180 | 90 | 'custom';

const PRESET_OPTIONS = [365, 180, 90] as const;
const DEFAULT_DAYS = 365;
const DISPLAY_LIMIT_DAYS = 365;

function getOptionFromDays(days: number): RetentionOption {
  if ((PRESET_OPTIONS as ReadonlyArray<number>).includes(days)) {
    return days as (typeof PRESET_OPTIONS)[number];
  }
  return 'custom';
}

function getCurrentDays(option: RetentionOption, customValue: string): number | null {
  if (option !== 'custom') {
    return option;
  }
  const trimmed = customValue.trim();
  const parsed = Number.parseInt(trimmed, 10);
  // parsed < 0 guards against pasted negative values; min={0} only constrains the spinner
  if (Number.isNaN(parsed) || parsed < 0 || String(parsed) !== trimmed) {
    return null;
  }
  return parsed;
}

// Restricts input to positive whole integers. HTML5 numeric inputs natively permit
// certain non-digit characters because they represent valid mathematical notation:
// - `.` and `,` – decimal point (locale-dependent)
// - `e` and `E` – scientific notation exponent (e.g. 1e5)
// - `+` and `-` – positive and negative signs
// These are blocked here since only non-negative integers are valid for this field.
function handleCustomKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
  if (['.', ',', 'e', 'E', '+', '-'].includes(event.key)) {
    event.preventDefault();
  }
}

export function DashboardRetentionSection() {
  const { formatMessage } = useIntl();
  const { edition } = useAppState();
  const isCommunityOrDeveloper = !supportsCustomProjectDashboards(edition);

  const { data: settingValue } = useGetValueQuery({
    key: DASHBOARD_HISTORY_RETENTION_KEY,
  });

  const parsedValue = Number.parseInt(settingValue?.value ?? '', 10);
  const savedDays = Number.isNaN(parsedValue) ? DEFAULT_DAYS : parsedValue;

  const [selectedOption, setSelectedOption] = useState<RetentionOption>(DEFAULT_DAYS);
  const [customValue, setCustomValue] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isReduceModalOpen, setIsReduceModalOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (settingValue !== undefined && !initialized) {
      const option = getOptionFromDays(savedDays);
      setSelectedOption(option);
      setCustomValue(option === 'custom' ? String(savedDays) : '');
      setInitialized(true);
    }
  }, [settingValue, initialized, savedDays]);

  const currentDays = getCurrentDays(selectedOption, customValue);
  const isDirty = initialized && currentDays !== null && currentDays !== savedDays;
  const isReducing = currentDays !== null && currentDays < savedDays;
  const showDisplayLimitCallout =
    selectedOption === 'custom' && currentDays !== null && currentDays > DISPLAY_LIMIT_DAYS;

  usePrompt({
    when: isDirty,
    message: formatMessage({
      id: isCommunityOrDeveloper
        ? 'settings.dashboard.retention.community.unsaved_changes'
        : 'settings.dashboard.retention.unsaved_changes',
    }),
  });

  const { mutate: saveRetentionSetting, isPending: isSavingRetention } = useSaveSimpleValueMutation(
    false,
    null,
  );

  function performSave(days: number) {
    saveRetentionSetting(
      { key: DASHBOARD_HISTORY_RETENTION_KEY, value: String(days) },
      {
        onSuccess: () => {
          const option = getOptionFromDays(days);
          setSelectedOption(option);
          setCustomValue(option === 'custom' ? String(days) : '');
          setIsReduceModalOpen(false);
          toast.success({
            description: formatMessage({
              id: isCommunityOrDeveloper
                ? 'settings.dashboard.retention.community.success'
                : 'settings.dashboard.retention.success',
            }),
            isDismissable: true,
          });
        },
      },
    );
  }

  function handleSave() {
    if (currentDays === null) {
      return;
    }
    if (isReducing) {
      setIsReduceModalOpen(true);
    } else {
      performSave(currentDays);
    }
  }

  function handleCancel() {
    const option = getOptionFromDays(savedDays);
    setSelectedOption(option);
    setCustomValue(option === 'custom' ? String(savedDays) : '');
    setValidationError(null);
  }

  function handleOptionChange(value: string) {
    setValidationError(null);
    if (value === 'custom') {
      setSelectedOption('custom');
    } else {
      setSelectedOption(Number.parseInt(value, 10) as (typeof PRESET_OPTIONS)[number]);
    }
  }

  function handleCustomValueChange(event: React.SyntheticEvent<HTMLInputElement>) {
    const value = event.currentTarget.value;
    setCustomValue(value);
    const trimmed = value.trim();
    const parsed = Number.parseInt(trimmed, 10);
    if (Number.isNaN(parsed) || parsed < 0 || String(parsed) !== trimmed) {
      setValidationError(formatMessage({ id: 'settings.dashboard.retention.custom.hint' }));
    } else {
      setValidationError(null);
    }
  }

  const radioOptions = [
    {
      label: formatMessage({ id: 'settings.dashboard.retention.option.365' }),
      value: '365',
    },
    {
      label: formatMessage({ id: 'settings.dashboard.retention.option.180' }),
      value: '180',
    },
    {
      label: formatMessage({ id: 'settings.dashboard.retention.option.90' }),
      value: '90',
    },
    {
      label: formatMessage({ id: 'settings.dashboard.retention.option.custom' }),
      value: 'custom',
    },
  ];

  const isSaveDisabled = !isDirty || currentDays === null || isSavingRetention;

  return (
    <>
      <div className="sw-p-6 sw-max-w-abs-800 sw-box-border">
        <Heading as="h4">
          <FormattedMessage
            id={
              isCommunityOrDeveloper
                ? 'settings.dashboard.retention.community.title'
                : 'settings.dashboard.retention.title'
            }
          />
        </Heading>

        <Text as="p" className="sw-mt-2">
          <FormattedMessage
            id={
              isCommunityOrDeveloper
                ? 'settings.dashboard.retention.community.description1'
                : 'settings.dashboard.retention.description1'
            }
            values={{ bold: (text) => <strong>{text}</strong> }}
          />
        </Text>

        <Text as="p" className="sw-mt-2">
          {isCommunityOrDeveloper ? (
            <FormattedMessage id="settings.dashboard.retention.community.description2" />
          ) : (
            <FormattedMessage
              id="settings.dashboard.retention.description2"
              values={{
                link: (text) => (
                  <DocumentationLink enableOpenInNewTab to={DocLink.DashboardHistoryRetention}>
                    {text}
                  </DocumentationLink>
                ),
              }}
            />
          )}
        </Text>

        {isCommunityOrDeveloper && (
          <MessageCallout className="sw-mt-4" variety="info">
            {formatMessage({ id: 'settings.dashboard.retention.coming_soon' })}
          </MessageCallout>
        )}

        <RadioButtonGroup
          ariaLabel={formatMessage({
            id: isCommunityOrDeveloper
              ? 'settings.dashboard.retention.community.title'
              : 'settings.dashboard.retention.title',
          })}
          className="sw-mt-6 sw-w-fit"
          id="dashboard-history-retention"
          onChange={handleOptionChange}
          options={radioOptions}
          value={selectedOption === 'custom' ? 'custom' : String(selectedOption)}
        />

        {selectedOption === 'custom' && (
          <div className="sw-mt-4">
            <Label className="sw-mb-2 sw-flex sw-items-center" htmlFor="dashboard-retention-custom">
              {formatMessage({ id: 'settings.dashboard.retention.custom.label' })}
              <RequiredIcon aria-label={formatMessage({ id: 'required' })} className="sw-ml-1" />
            </Label>
            <div className="sw-flex sw-items-center sw-gap-2">
              <TextInput
                id="dashboard-retention-custom"
                min={0}
                onChange={handleCustomValueChange}
                onKeyDown={handleCustomKeyDown}
                type="number"
                value={customValue}
                width={FormFieldWidth.Medium}
              />
              <Text>{formatMessage({ id: 'settings.dashboard.retention.custom.days_unit' })}</Text>
            </div>
            {validationError && (
              <Text
                className="sw-mt-2 sw-typo-helper-text"
                colorOverride="echoes-color-text-subtle"
              >
                {validationError}
              </Text>
            )}
          </div>
        )}

        {showDisplayLimitCallout && (
          <MessageCallout className="sw-mt-4" variety="info">
            <span className="sw-typo-semibold">
              {formatMessage({ id: 'settings.dashboard.retention.display_limit.title' })}
            </span>
            <p className="sw-mt-1">
              {formatMessage({ id: 'settings.dashboard.retention.display_limit.description' })}
            </p>
          </MessageCallout>
        )}

        <div className="sw-flex sw-gap-2 sw-mt-6">
          <Button
            isDisabled={isSaveDisabled}
            isLoading={isSavingRetention && !isReducing}
            onClick={handleSave}
            variety={ButtonVariety.Primary}
          >
            <FormattedMessage id="save" />
          </Button>
          {isDirty && (
            <Button
              isDisabled={isSavingRetention}
              onClick={handleCancel}
              variety={ButtonVariety.Default}
            >
              <FormattedMessage id="cancel" />
            </Button>
          )}
        </div>

        <Tooltip
          content={formatMessage({ id: 'settings.key_x' }, { 0: DASHBOARD_HISTORY_RETENTION_KEY })}
        >
          <Text as="div" className="sw-mt-4 sw-w-fit" isSubtle>
            <FormattedMessage id="settings.key_x" values={{ 0: DASHBOARD_HISTORY_RETENTION_KEY }} />
          </Text>
        </Tooltip>
      </div>

      <ReduceRetentionModal
        days={currentDays ?? savedDays}
        isOpen={isReduceModalOpen}
        isPending={isSavingRetention}
        onCancel={() => setIsReduceModalOpen(false)}
        onConfirm={() => {
          if (currentDays !== null) {
            performSave(currentDays);
          }
        }}
      />
    </>
  );
}
