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

import styled from '@emotion/styled';
import { Card, Link, LinkStandalone, Text, Tooltip } from '@sonarsource/echoes-react';
import { isEmpty } from 'lodash';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  Badge,
  Note,
  QualityGateIndicator,
  SeparatorCircleIcon,
  Tags,
  themeColor,
} from '~design-system';
import Favorite from '~sq-server-shared/components/controls/Favorite';
import DateFromNow from '~sq-server-shared/components/intl/DateFromNow';
import DateTimeFormatter from '~sq-server-shared/components/intl/DateTimeFormatter';
import { ContainsAICodeBadge } from '~sq-server-shared/components/shared/ContainsAICodeBadge';
import AICodeAssuranceStatus from '~sq-server-shared/components/typography/AICodeAssuranceStatus';
import { useCurrentUser } from '~sq-server-shared/context/current-user/CurrentUserContext';
import { translate } from '~sq-server-shared/helpers/l10n';
import { isDefined, isStringDefined } from '~sq-server-shared/helpers/types';
import { getProjectUrl } from '~sq-server-shared/helpers/urls';
import Measure from '~sq-server-shared/sonar-aligned/components/measure/Measure';
import { formatMeasure } from '~sq-server-shared/sonar-aligned/helpers/measures';
import { Status } from '~sq-server-shared/sonar-aligned/types/common';
import { ComponentQualifier } from '~sq-server-shared/sonar-aligned/types/component';
import { MetricKey, MetricType } from '~sq-server-shared/sonar-aligned/types/metrics';
import { isLoggedIn } from '~sq-server-shared/types/users';
import ChangeInCalculation from '../../../../app/components/ChangeInCalculationPill';
import { Project } from '../../types';
import ProjectCardLanguages from './ProjectCardLanguages';
import ProjectCardMeasures from './ProjectCardMeasures';

interface ProjectCardProps {
  project: Project;
  type?: string;
}

interface ProjectCardSectionProps {
  isNewCode: boolean;
  project: ProjectCardProps['project'];
}

function CardTitle({ project, isNewCode }: Readonly<ProjectCardSectionProps>) {
  const { analysisDate, isFavorite, key, measures, name, qualifier, visibility } = project;
  const noSoftwareQualityMetrics = [
    MetricKey.software_quality_reliability_issues,
    MetricKey.software_quality_maintainability_issues,
    MetricKey.software_quality_security_issues,
  ].every((key) => measures[key] === undefined);
  const noRatingMetrics = [
    MetricKey.software_quality_reliability_rating,
    MetricKey.software_quality_maintainability_rating,
    MetricKey.software_quality_security_rating,
  ].every((key) => measures[key] === undefined);
  const awaitingScan =
    (noSoftwareQualityMetrics || noRatingMetrics) &&
    !isNewCode &&
    !isEmpty(analysisDate) &&
    measures.ncloc !== undefined;

  return (
    <div className="sw-flex sw-items-center">
      {isDefined(isFavorite) && (
        <Favorite
          className="sw-mr-2"
          component={key}
          componentName={name}
          favorite={isFavorite}
          qualifier={qualifier}
        />
      )}

      <span className="it__project-card-name" title={name}>
        <LinkStandalone to={getProjectUrl(key)}>{name}</LinkStandalone>
      </span>

      {qualifier === ComponentQualifier.Application && (
        <Tooltip
          content={
            <span>
              {translate('qualifier.APP')}
              {measures.projects !== '' && (
                <span>
                  {' ‒ '}
                  <FormattedMessage id="x_projects_" values={{ count: measures.projects }} />
                </span>
              )}
            </span>
          }
        >
          <span>
            <Badge className="sw-ml-2">{translate('qualifier.APP')}</Badge>
          </span>
        </Tooltip>
      )}

      <Tooltip content={translate('visibility', visibility, 'description', qualifier)}>
        <span>
          <Badge className="sw-ml-2">{translate('visibility', visibility)}</Badge>
        </span>
      </Tooltip>

      {project.containsAiCode && (
        <Tooltip content={translate('projects.ai_code.tooltip.content')}>
          <span>
            <ContainsAICodeBadge className="sw-ml-2" />
          </span>
        </Tooltip>
      )}

      {awaitingScan && !isNewCode && !isEmpty(analysisDate) && measures.ncloc !== undefined && (
        <ChangeInCalculation qualifier={qualifier} />
      )}
    </div>
  );
}

function CardInfo({ project, isNewCode }: Readonly<ProjectCardSectionProps>) {
  const { analysisDate, key, measures, tags } = project;

  return (
    <div className="sw-flex sw-justify-between sw-items-center sw-mt-3">
      <Text as="div" className="sw-flex sw-items-center" isSubdued>
        {isDefined(analysisDate) && analysisDate !== '' && (
          <DateTimeFormatter date={analysisDate}>
            {(formattedAnalysisDate) => (
              <span className="sw-typo-semibold" title={formattedAnalysisDate}>
                <FormattedMessage
                  id="projects.last_analysis_on_x"
                  values={{
                    date: <DateFromNow className="sw-typo-default" date={analysisDate} />,
                  }}
                />
              </span>
            )}
          </DateTimeFormatter>
        )}

        {isNewCode
          ? measures[MetricKey.new_lines] != null && (
              <>
                <SeparatorCircleIcon className="sw-mx-1" />

                <div>
                  <span className="sw-typo-semibold sw-mr-1" data-key={MetricKey.new_lines}>
                    <Measure
                      componentKey={key}
                      metricKey={MetricKey.new_lines}
                      metricType={MetricType.ShortInteger}
                      value={measures.new_lines}
                    />
                  </span>

                  <span className="sw-typo-default">{translate('metric.new_lines.name')}</span>
                </div>
              </>
            )
          : measures[MetricKey.ncloc] != null && (
              <>
                <SeparatorCircleIcon className="sw-mx-1" />

                <div>
                  <span className="sw-typo-semibold sw-mr-1" data-key={MetricKey.ncloc}>
                    <Measure
                      componentKey={key}
                      metricKey={MetricKey.ncloc}
                      metricType={MetricType.ShortInteger}
                      value={measures.ncloc}
                    />
                  </span>

                  <span className="sw-typo-default">{translate('metric.ncloc.name')}</span>
                </div>

                <SeparatorCircleIcon className="sw-mx-1" />

                <span className="sw-typo-default" data-key={MetricKey.ncloc_language_distribution}>
                  <ProjectCardLanguages distribution={measures.ncloc_language_distribution} />
                </span>
              </>
            )}

        {tags.length > 0 && (
          <>
            <SeparatorCircleIcon className="sw-mx-1" />

            <Tags
              ariaTagsListLabel={translate('issue.tags')}
              className="sw-typo-default"
              emptyText={translate('issue.no_tag')}
              tags={tags}
              tagsToDisplay={2}
              tooltip={Tooltip}
            />
          </>
        )}
      </Text>
      {project.aiCodeAssurance && (
        <AICodeAssuranceStatus aiCodeAssuranceStatus={project.aiCodeAssurance} />
      )}
    </div>
  );
}

function CardDetails({ project, isNewCode }: Readonly<ProjectCardSectionProps>) {
  const { analysisDate, key, leakPeriodDate, measures, qualifier, isScannable } = project;
  const intl = useIntl();
  const { currentUser } = useCurrentUser();

  if (!isEmpty(analysisDate) && (!isNewCode || !isEmpty(leakPeriodDate))) {
    return (
      <ProjectCardMeasures
        componentKey={key}
        componentQualifier={qualifier}
        isNewCode={isNewCode}
        measures={measures}
      />
    );
  }

  return (
    <div className="sw-flex sw-items-center">
      <Note className="sw-py-4">
        {isNewCode && analysisDate
          ? translate('projects.no_new_code_period', qualifier)
          : translate('projects.not_analyzed', qualifier)}
      </Note>

      {qualifier !== ComponentQualifier.Application &&
        isEmpty(analysisDate) &&
        isLoggedIn(currentUser) &&
        isScannable && (
          <Link
            aria-label={intl.formatMessage(
              { id: 'projects.configure_analysis_for_x' },
              { project: project.name },
            )}
            className="sw-ml-2 sw-typo-semibold"
            to={getProjectUrl(key)}
          >
            {translate('projects.configure_analysis')}
          </Link>
        )}
    </div>
  );
}

export default function ProjectCard(props: Readonly<ProjectCardProps>) {
  const { type, project } = props;
  const isNewCode = type === 'leak';
  const formatted = formatMeasure(project.measures[MetricKey.alert_status], MetricType.Level);

  return (
    <ProjectCardWrapper className="it__project_card" data-key={project.key}>
      <Card.Header
        description={CardInfo({ project, isNewCode })}
        hasDivider
        rightContent={
          isStringDefined(project.analysisDate) && (
            <Tooltip
              content={
                <FormattedMessage id="overview.quality_gate_x" values={{ status: formatted }} />
              }
            >
              <span className="sw-flex sw-items-center">
                <QualityGateIndicator
                  status={(project.measures[MetricKey.alert_status] as Status) ?? 'NONE'}
                />
                <Text className="sw-ml-2 sw-font-semibold">{formatted}</Text>
              </span>
            </Tooltip>
          )
        }
        title={<CardTitle isNewCode={isNewCode} project={project} />}
      />
      <Card.Body>{CardDetails({ project, isNewCode })}</Card.Body>
    </ProjectCardWrapper>
  );
}

const ProjectCardWrapper = styled(Card)`
  &.project-card-disabled *:not(g):not(path) {
    color: ${themeColor('projectCardDisabled')} !important;
  }
`;
