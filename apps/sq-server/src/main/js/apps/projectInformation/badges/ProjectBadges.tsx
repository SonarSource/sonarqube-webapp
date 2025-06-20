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

import { Spinner, ToggleButtonGroup } from '@sonarsource/echoes-react';
import { isEmpty } from 'lodash';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { Image } from '~adapters/components/common/Image';
import {
  BasicSeparator,
  ButtonSecondary,
  CodeSnippet,
  FlagMessage,
  FormField,
  IllustratedSelectionCard,
  InputSelect,
  SubTitle,
} from '~design-system';
import { getBranchLikeQuery } from '~shared/helpers/branch-like';
import { isProject } from '~shared/types/component';
import { MetricKey } from '~shared/types/metrics';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import { translate } from '~sq-server-commons/helpers/l10n';
import {
  useBadgeMetrics,
  useBadgeTokenQuery,
  useRenewBagdeTokenMutation,
} from '~sq-server-commons/queries/badges';
import { BranchLike } from '~sq-server-commons/types/branch-like';
import { Feature } from '~sq-server-commons/types/features';
import { Component } from '~sq-server-commons/types/types';
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
  const intl = useIntl();
  const [selectedType, setSelectedType] = useState(BadgeType.measure);
  const [selectedMetric, setSelectedMetric] = useState(MetricKey.alert_status);
  const [selectedFormat, setSelectedFormat] = useState<BadgeFormats>('md');
  const {
    data: token,
    isLoading: isLoadingToken,
    isFetching: isFetchingToken,
  } = useBadgeTokenQuery(project);
  const { data: metricOptions, isLoading: isLoadingMetrics } = useBadgeMetrics();
  const { mutate: renewToken, isPending: isRenewing } = useRenewBagdeTokenMutation();
  const { hasFeature } = useAvailableFeatures();
  const isLoading = isLoadingMetrics || isLoadingToken || isRenewing;

  const handleSelectType = (selectedType: BadgeType) => {
    setSelectedType(selectedType);
  };

  const formatOptions = [
    {
      label: intl.formatMessage({ id: 'overview.badges.options.formats.md' }),
      value: 'md',
    },
    {
      label: intl.formatMessage({ id: 'overview.badges.options.formats.url' }),
      value: 'url',
    },
  ];

  const fullBadgeOptions: BadgeOptions = {
    project,
    metric: selectedMetric,
    format: selectedFormat,
    ...getBranchLikeQuery(branchLike),
  };
  const canRenew = configuration?.showSettings;

  const selectedMetricOption = metricOptions.find((m) => m.value === selectedMetric);

  return (
    <div>
      <SubTitle>{translate('overview.badges.get_badge')}</SubTitle>
      <p className="sw-mb-4">{translate('overview.badges.description', qualifier)}</p>

      <Spinner isLoading={isLoading || isEmpty(token)}>
        <div className="sw-flex sw-space-x-4 sw-mb-4">
          <IllustratedSelectionCard
            className="sw-w-abs-300 it__badge-button"
            description={translate('overview.badges', BadgeType.measure, 'description', qualifier)}
            image={
              <Image
                alt={intl.formatMessage(
                  { id: `overview.badges.${BadgeType.measure}.alt` },
                  { metric: selectedMetricOption?.label },
                )}
                src={getBadgeUrl(BadgeType.measure, fullBadgeOptions, token, true)}
              />
            }
            onClick={() => {
              handleSelectType(BadgeType.measure);
            }}
            selected={BadgeType.measure === selectedType}
          />
          <IllustratedSelectionCard
            className="sw-w-abs-300 it__badge-button"
            description={translate(
              'overview.badges',
              BadgeType.qualityGate,
              'description',
              qualifier,
            )}
            image={
              <Image
                alt={translate('overview.badges', BadgeType.qualityGate, 'alt')}
                src={getBadgeUrl(BadgeType.qualityGate, fullBadgeOptions, token, true)}
                width="128px"
              />
            }
            onClick={() => {
              handleSelectType(BadgeType.qualityGate);
            }}
            selected={BadgeType.qualityGate === selectedType}
          />
          {hasFeature(Feature.AiCodeAssurance) && isProject(qualifier) && (
            <IllustratedSelectionCard
              className="sw-w-abs-300 it__badge-button"
              description={translate(
                'overview.badges',
                BadgeType.aiCodeAssurance,
                'description',
                qualifier,
              )}
              image={
                <Image
                  alt={translate('overview.badges', BadgeType.aiCodeAssurance, 'alt')}
                  src={getBadgeUrl(BadgeType.aiCodeAssurance, fullBadgeOptions, token, true)}
                />
              }
              onClick={() => {
                handleSelectType(BadgeType.aiCodeAssurance);
              }}
              selected={BadgeType.aiCodeAssurance === selectedType}
            />
          )}
        </div>
      </Spinner>

      {BadgeType.measure === selectedType && (
        <FormField htmlFor="badge-param-customize" label={translate('overview.badges.metric')}>
          <InputSelect
            className="sw-w-abs-300"
            inputId="badge-param-customize"
            onChange={(option) => {
              if (option) {
                setSelectedMetric(option.value);
              }
            }}
            options={metricOptions}
            value={selectedMetricOption}
          />
        </FormField>
      )}

      <BasicSeparator className="sw-mb-4" />

      <FormField label={intl.formatMessage({ id: 'overview.badges.format' })}>
        <div className="sw-flex ">
          <ToggleButtonGroup
            aria-label={intl.formatMessage({ id: 'overview.badges.format' })}
            onChange={(value: BadgeFormats) => {
              setSelectedFormat(value);
            }}
            options={formatOptions}
            selected={selectedFormat}
          />
        </div>
      </FormField>

      <Spinner className="sw-my-2" isLoading={isFetchingToken || isRenewing}>
        {!isLoading && (
          <CodeSnippet
            className="sw-p-6 it__code-snippet"
            copyAriaLabel={translate('overview.badges.copy_snippet')}
            language="plaintext"
            snippet={getBadgeSnippet(selectedType, fullBadgeOptions, token)}
            wrap
          />
        )}
      </Spinner>

      <FlagMessage className="sw-w-full" variant="warning">
        <p>
          {translate('overview.badges.leak_warning')}
          {canRenew && (
            <span className="sw-flex sw-flex-col">
              {translate('overview.badges.renew.description')}{' '}
              <ButtonSecondary
                className="sw-mt-2 it__project-info-renew-badge sw-mr-auto"
                disabled={isLoading}
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
