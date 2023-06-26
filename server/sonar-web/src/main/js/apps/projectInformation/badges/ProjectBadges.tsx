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
  BasicSeparator,
  ButtonSecondary,
  CodeSnippet,
  DeferredSpinner,
  FlagMessage,
  FormField,
  IllustratedSelectionCard,
  InputSelect,
  SubTitle,
  ToggleButton,
} from 'design-system';
import { isEmpty } from 'lodash';
import * as React from 'react';
import { useState } from 'react';
import { getBranchLikeQuery } from '../../../helpers/branch-like';
import { translate } from '../../../helpers/l10n';
import { BranchLike } from '../../../types/branch-like';
import { MetricKey } from '../../../types/metrics';
import { Component } from '../../../types/types';
import {
  useBadgeMetricsQuery,
  useBadgeTokenQuery,
  useRenewBagdeTokenMutation,
} from '../query/badges';
import { BadgeFormats, BadgeOptions, BadgeType, getBadgeSnippet, getBadgeUrl } from './utils';

export interface ProjectBadgesProps {
  branchLike?: BranchLike;
  component: Component;
}

export default function ProjectBadges(props: ProjectBadgesProps) {
  const {
    branchLike,
    component: { key: project, qualifier, configuration },
  } = props;
  const [selectedType, setSelectedType] = useState(BadgeType.measure);
  const [metricOptions, setMetricOptions] = useState(MetricKey.alert_status);
  const [formatOption, setFormatOption] = useState<BadgeFormats>('md');
  const {
    data: token,
    isLoading: isLoadingToken,
    isFetching: isFetchingToken,
  } = useBadgeTokenQuery(project);
  const { data: metricsOptions, isLoading: isLoadingMetrics } = useBadgeMetricsQuery();
  const { mutate: renewToken, isLoading: isRenewing } = useRenewBagdeTokenMutation();
  const isLoading = isLoadingMetrics || isLoadingToken || isRenewing;

  const handleSelectBadge = (selectedType: BadgeType) => {
    setSelectedType(selectedType);
  };

  const formatOptions = [
    {
      label: translate('overview.badges.options.formats.md'),
      value: 'md',
    },
    {
      label: translate('overview.badges.options.formats.url'),
      value: 'url',
    },
  ] as const;

  const fullBadgeOptions: BadgeOptions = {
    project,
    metric: metricOptions,
    format: formatOption,
    ...getBranchLikeQuery(branchLike),
  };
  const canRenew = configuration?.showSettings;

  return (
    <div>
      <SubTitle>{translate('overview.badges.get_badge')}</SubTitle>
      <p className="big-spacer-bottom">{translate('overview.badges.description', qualifier)}</p>

      <DeferredSpinner loading={isLoading || isEmpty(token)}>
        <div className="sw-flex sw-space-x-4 sw-mb-4">
          <IllustratedSelectionCard
            className="sw-w-abs-300 it__badge-button"
            onClick={() => handleSelectBadge(BadgeType.measure)}
            selected={BadgeType.measure === selectedType}
            image={
              <img
                alt={translate('overview.badges', BadgeType.measure, 'alt')}
                src={getBadgeUrl(BadgeType.measure, fullBadgeOptions, token)}
              />
            }
            description={translate('overview.badges', BadgeType.measure, 'description', qualifier)}
          />
          <IllustratedSelectionCard
            className="sw-w-abs-300 it__badge-button"
            onClick={() => handleSelectBadge(BadgeType.qualityGate)}
            selected={BadgeType.qualityGate === selectedType}
            image={
              <img
                alt={translate('overview.badges', BadgeType.qualityGate, 'alt')}
                src={getBadgeUrl(BadgeType.qualityGate, fullBadgeOptions, token)}
                width="128px"
              />
            }
            description={translate(
              'overview.badges',
              BadgeType.qualityGate,
              'description',
              qualifier
            )}
          />
        </div>
      </DeferredSpinner>

      {BadgeType.measure === selectedType && (
        <FormField htmlFor="badge-param-customize" label={translate('overview.badges.metric')}>
          <InputSelect
            className="sw-w-abs-300"
            inputId="badge-param-customize"
            options={metricsOptions}
            onChange={(value) => {
              if (value) {
                setMetricOptions(value.value);
              }
            }}
            value={metricsOptions.find((m) => m.value === metricOptions)}
          />
        </FormField>
      )}

      <BasicSeparator className="sw-mb-4" />

      <FormField label={translate('overview.badges.format')}>
        <div className="sw-flex ">
          <ToggleButton
            label={translate('overview.badges.format')}
            options={formatOptions}
            onChange={(value: BadgeFormats) => {
              if (value) {
                setFormatOption(value);
              }
            }}
            value={formatOption}
          />
        </div>
      </FormField>

      <DeferredSpinner className="spacer-top spacer-bottom" loading={isFetchingToken || isRenewing}>
        {!isLoading && (
          <CodeSnippet
            language="plaintext"
            className="sw-p-6 it__code-snippet"
            snippet={getBadgeSnippet(selectedType, fullBadgeOptions, token)}
            wrap
          />
        )}
      </DeferredSpinner>

      <FlagMessage className="sw-w-full" variant="warning">
        <p>
          {translate('overview.badges.leak_warning')}
          {canRenew && (
            <span className="sw-flex sw-flex-col">
              {translate('overview.badges.renew.description')}{' '}
              <ButtonSecondary
                disabled={isLoading}
                className="spacer-top it__project-info-renew-badge sw-mr-auto"
                onClick={() => {
                  renewToken(project);
                }}
              >
                {translate('overview.badges.renew')}
              </ButtonSecondary>
            </span>
          )}
        </p>
      </FlagMessage>
    </div>
  );
}
