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
import {
  Badge,
  Card,
  Link,
  LinkStandalone,
  Popover,
  Text,
  Tooltip,
} from '@sonarsource/echoes-react';
import { isEmpty } from 'lodash';
import { FormattedMessage, useIntl } from 'react-intl';
import { QualityGateIndicator, SeparatorCircleIcon, Tags, themeColor } from '~design-system';
import DateFromNow from '~shared/components/intl/DateFromNow';
import DateTimeFormatter from '~shared/components/intl/DateTimeFormatter';
import { isDefined, isStringDefined } from '~shared/helpers/types';
import { QGStatus } from '~shared/types/common';
import { ComponentQualifier } from '~shared/types/component';
import { MetricKey, MetricType } from '~shared/types/metrics';
import Favorite from '~sq-server-commons/components/controls/Favorite';
import { ContainsAICodeBadge } from '~sq-server-commons/components/shared/ContainsAICodeBadge';
import AICodeAssuranceStatus from '~sq-server-commons/components/typography/AICodeAssuranceStatus';
import { useCurrentUser } from '~sq-server-commons/context/current-user/CurrentUserContext';
import { getProjectUrl } from '~sq-server-commons/helpers/urls';
import Measure from '~sq-server-commons/sonar-aligned/components/measure/Measure';
import { formatMeasure } from '~sq-server-commons/sonar-aligned/helpers/measures';
import { isLoggedIn } from '~sq-server-commons/types/users';
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
        <Popover
          description={
            measures.projects !== '' && (
              <FormattedMessage id="x_projects_" values={{ count: measures.projects }} />
            )
          }
          title={<FormattedMessage id="qualifier.APP" />}
        >
          <Badge className="sw-ml-2" isInteractive variety="neutral">
            <FormattedMessage id="qualifier.APP" />
          </Badge>
        </Popover>
      )}

      <Popover
        description={<FormattedMessage id={`visibility.${visibility}.description.${qualifier}`} />}
      >
        <Badge className="sw-ml-2" isInteractive variety="neutral">
          <FormattedMessage id={`visibility.${visibility}`} />
        </Badge>
      </Popover>

      {project.containsAiCode && (
        <Popover description={<FormattedMessage id="projects.ai_code.tooltip.content" />}>
          <ContainsAICodeBadge className="sw-ml-2" isInteractive />
        </Popover>
      )}

      {awaitingScan && !isNewCode && !isEmpty(analysisDate) && measures.ncloc !== undefined && (
        <ChangeInCalculation qualifier={qualifier} />
      )}
    </div>
  );
}

function CardInfo({ project, isNewCode }: Readonly<ProjectCardSectionProps>) {
  const { analysisDate, key, measures, tags } = project;

  const intl = useIntl();

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

                  <span className="sw-typo-default">
                    <FormattedMessage id="metric.new_lines.name" />
                  </span>
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

                  <span className="sw-typo-default">
                    <FormattedMessage id="metric.ncloc.name" />
                  </span>
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
              ariaTagsListLabel={intl.formatMessage({ id: 'issue.tags' })}
              className="sw-typo-default"
              emptyText={intl.formatMessage({ id: 'issue.no_tag' })}
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
      <Text className="sw-py-4" isSubdued>
        {isNewCode && analysisDate ? (
          <FormattedMessage id={`projects.no_new_code_period.${qualifier}`} />
        ) : (
          <FormattedMessage id={`projects.not_analyzed.${qualifier}`} />
        )}
      </Text>

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
            <FormattedMessage id="projects.configure_analysis" />
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
                  status={(project.measures[MetricKey.alert_status] as QGStatus) ?? 'NONE'}
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
