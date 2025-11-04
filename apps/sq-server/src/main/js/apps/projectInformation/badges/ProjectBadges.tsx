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

import styled from '@emotion/styled';
import {
  Button,
  Divider,
  Heading,
  Label,
  Select,
  SelectionCards,
  Spinner,
  ToggleButtonGroup,
  cssVar,
} from '@sonarsource/echoes-react';
import { isEmpty } from 'lodash';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Image } from '~adapters/components/common/Image';
import { CodeSnippet, FlagMessage } from '~design-system';
import { getBranchLikeQuery } from '~shared/helpers/branch-like';
import { isProject } from '~shared/helpers/component';
import { MetricKey } from '~shared/types/metrics';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
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
      <Heading as="h2" className="sw-mb-2">
        <FormattedMessage id="overview.badges.get_badge" />
      </Heading>
      <p className="sw-mb-4">
        <FormattedMessage id={`overview.badges.description.${qualifier}`} />
      </p>

      <Spinner isLoading={isLoading || isEmpty(token)}>
        <SelectionCards
          alignment="horizontal"
          ariaLabel={intl.formatMessage({ id: 'overview.badges.type' })}
          className="sw-mb-4"
          onChange={handleSelectType}
          options={[
            {
              value: BadgeType.measure,
              illustration: (
                <StyledBadgeWrapper className="sw-flex sw-items-center sw-justify-center">
                  <Image
                    alt={intl.formatMessage(
                      { id: `overview.badges.${BadgeType.measure}.alt` },
                      { metric: selectedMetricOption?.label },
                    )}
                    src={getBadgeUrl(BadgeType.measure, fullBadgeOptions, token, true)}
                  />
                </StyledBadgeWrapper>
              ),
              label: intl.formatMessage({
                id: `overview.badges.${BadgeType.measure}`,
              }),
              helpText: intl.formatMessage({
                id: `overview.badges.${BadgeType.measure}.description.${qualifier}`,
              }),
            },
            {
              value: BadgeType.qualityGate,
              illustration: (
                <StyledBadgeWrapper className="sw-flex sw-items-center sw-justify-center">
                  <Image
                    alt={intl.formatMessage({ id: `overview.badges.${BadgeType.qualityGate}.alt` })}
                    src={getBadgeUrl(BadgeType.qualityGate, fullBadgeOptions, token, true)}
                    style={{ width: '128px' }}
                  />
                </StyledBadgeWrapper>
              ),
              label: intl.formatMessage({
                id: `overview.badges.${BadgeType.qualityGate}`,
              }),
              helpText: intl.formatMessage({
                id: `overview.badges.${BadgeType.qualityGate}.description.${qualifier}`,
              }),
            },
            hasFeature(Feature.AiCodeAssurance) && isProject(qualifier)
              ? {
                  value: BadgeType.aiCodeAssurance,
                  illustration: (
                    <StyledBadgeWrapper className="sw-flex sw-items-center sw-justify-center">
                      <Image
                        alt={intl.formatMessage({
                          id: `overview.badges.${BadgeType.aiCodeAssurance}.alt`,
                        })}
                        src={getBadgeUrl(BadgeType.aiCodeAssurance, fullBadgeOptions, token, true)}
                      />
                    </StyledBadgeWrapper>
                  ),
                  label: intl.formatMessage({
                    id: `overview.badges.${BadgeType.aiCodeAssurance}`,
                  }),
                  helpText: intl.formatMessage({
                    id: `overview.badges.${BadgeType.aiCodeAssurance}.description.${qualifier}`,
                  }),
                }
              : null,
          ].filter((o) => o !== null)}
          value={selectedType}
        />
      </Spinner>

      {BadgeType.measure === selectedType && (
        <Select
          className="sw-w-abs-300 sw-mb-4"
          data={metricOptions}
          id="badge-param-customize"
          isNotClearable
          label={intl.formatMessage({ id: 'overview.badges.metric' })}
          onChange={(option) => {
            if (option) {
              setSelectedMetric(option as MetricKey);
            }
          }}
          value={selectedMetric}
        />
      )}

      <Divider className="sw-mb-4" />

      <div>
        <Label className="sw-block">
          <FormattedMessage id="overview.badges.format" />
        </Label>
        <ToggleButtonGroup
          aria-label={intl.formatMessage({ id: 'overview.badges.format' })}
          onChange={(value: BadgeFormats) => {
            setSelectedFormat(value);
          }}
          options={formatOptions}
          selected={selectedFormat}
        />
      </div>

      <Spinner className="sw-my-2" isLoading={isFetchingToken || isRenewing}>
        {!isLoading && (
          <CodeSnippet
            className="sw-p-6 it__code-snippet"
            copyAriaLabel={intl.formatMessage({ id: 'overview.badges.copy_snippet' })}
            language="plaintext"
            snippet={getBadgeSnippet(selectedType, fullBadgeOptions, token)}
            wrap
          />
        )}
      </Spinner>

      <FlagMessage className="sw-w-full" variant="warning">
        <p>
          <FormattedMessage id="overview.badges.leak_warning" />
          {canRenew && (
            <span className="sw-flex sw-flex-col">
              <FormattedMessage id="overview.badges.renew.description" />
              <Button
                className="sw-mt-2 it__project-info-renew-badge sw-mr-auto"
                isDisabled={isLoading}
                onClick={() => {
                  renewToken(project);
                }}
                variety="default"
              >
                <FormattedMessage id="overview.badges.renew" />
              </Button>
            </span>
          )}
        </p>
      </FlagMessage>
    </div>
  );
}

const StyledBadgeWrapper = styled.div`
  min-height: 116px;
  width: 100%;
  background-color: ${cssVar('color-background-neutral-subtle-default')};

  /* Force width auto because this is not a full-width illustration */
  & > img {
    width: auto;
  }
`;
