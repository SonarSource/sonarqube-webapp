/*
 * SonarQube
 * Copyright (C) 2009-2024 SonarSource SA
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
  Heading,
  IconSparkle,
  LinkHighlight,
  LinkStandalone,
  Text,
} from '@sonarsource/echoes-react';
import classNames from 'classnames';
import { PropsWithChildren, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useLocation } from 'react-router-dom';
import { BasicSeparator } from '~design-system';
import { ComponentQualifier, Visibility } from '~sonar-aligned/types/component';
import { AiCodeAssuranceStatus } from '../../../api/ai-code-assurance';
import { getProjectLinks } from '../../../api/projectLinks';
import { useAvailableFeatures } from '../../../app/components/available-features/withAvailableFeatures';
import DocumentationLink from '../../../components/common/DocumentationLink';
import AICodeAssuranceStatus from '../../../components/typography/AICodeAssuranceStatus';
import { DocLink } from '../../../helpers/doc-links';
import { translate } from '../../../helpers/l10n';
import { useProjectBranchesAiCodeAssuranceStatusQuery } from '../../../queries/ai-code-assurance';
import { Feature } from '../../../types/features';
import { Component, Measure, ProjectLink } from '../../../types/types';
import MetaDescription from './components/MetaDescription';
import MetaKey from './components/MetaKey';
import MetaLinks from './components/MetaLinks';
import MetaQualityGate from './components/MetaQualityGate';
import MetaQualityProfiles from './components/MetaQualityProfiles';
import MetaSize from './components/MetaSize';
import MetaTags from './components/MetaTags';
import MetaVisibility from './components/MetaVisibility';

export interface AboutProjectProps {
  component: Component;
  measures?: Measure[];
  onComponentChange: (changes: {}) => void;
}

export default function AboutProject(props: AboutProjectProps) {
  const { component, measures = [] } = props;
  const { search } = useLocation();
  const { hasFeature } = useAvailableFeatures();

  const isApp = component.qualifier === ComponentQualifier.Application;
  const [links, setLinks] = useState<ProjectLink[] | undefined>(undefined);
  const { data: aiCodeAssuranceStatus } = useProjectBranchesAiCodeAssuranceStatusQuery(
    {
      project: component,
    },
    {
      enabled:
        component.qualifier === ComponentQualifier.Project && hasFeature(Feature.AiCodeAssurance),
    },
  );

  useEffect(() => {
    if (!isApp) {
      getProjectLinks(component.key).then(
        (links) => setLinks(links),
        () => {},
      );
    }
  }, [component.key, isApp]);

  return (
    <>
      <Heading className="sw-mb-4" as="h2">
        {translate(isApp ? 'application' : 'project', 'about.title')}
      </Heading>

      {!isApp &&
        (component.qualityGate ||
          (component.qualityProfiles && component.qualityProfiles.length > 0)) && (
          <ProjectInformationSection className="sw-pt-0 sw-flex sw-flex-col sw-gap-4">
            {component.qualityGate && <MetaQualityGate qualityGate={component.qualityGate} />}

            {component.qualityProfiles && component.qualityProfiles.length > 0 && (
              <MetaQualityProfiles profiles={component.qualityProfiles} />
            )}
          </ProjectInformationSection>
        )}

      {aiCodeAssuranceStatus !== undefined &&
        aiCodeAssuranceStatus !== AiCodeAssuranceStatus.NONE && (
          <>
            <section className="sw-py-4">
              <Heading className="sw-mb-2" as="h3">
                {translate('project.info.contain_ai_code.title')}
              </Heading>
              <Text>
                <IconSparkle className="sw-mr-2" color="echoes-color-icon-accent" />
                <FormattedMessage id="project.info.contain_ai_code.description" />
              </Text>
            </section>

            <ProjectInformationSection className="sw-flex sw-flex-col sw-gap-2">
              <Heading as="h3">{translate('project.info.ai_code_assurance.title')}</Heading>
              <AICodeAssuranceStatus
                aiCodeAssuranceStatus={
                  aiCodeAssuranceStatus === AiCodeAssuranceStatus.AI_CODE_ASSURED_OFF
                    ? AiCodeAssuranceStatus.AI_CODE_ASSURED_OFF
                    : AiCodeAssuranceStatus.AI_CODE_ASSURED_ON
                }
              />
              {aiCodeAssuranceStatus === AiCodeAssuranceStatus.AI_CODE_ASSURED_OFF &&
                component.configuration?.showQualityGates && (
                  <>
                    <Text isSubdued>
                      <FormattedMessage id="project.info.ai_code_assurance.off.description_for_admin" />
                    </Text>
                    <LinkStandalone
                      to={{
                        pathname: '/project/quality_gate',
                        search,
                      }}
                    >
                      <FormattedMessage id="projects.ai_code_assurance.edit_quality_gate" />
                    </LinkStandalone>
                  </>
                )}

              {aiCodeAssuranceStatus === AiCodeAssuranceStatus.AI_CODE_ASSURED_OFF &&
                !component.configuration?.showQualityGates && (
                  <Text isSubdued>
                    <FormattedMessage
                      id="project.info.ai_code_assurance.off.description"
                      values={{
                        link: (text) => (
                          <DocumentationLink
                            className="sw-text-nowrap"
                            shouldOpenInNewTab
                            highlight={LinkHighlight.Subdued}
                            to={DocLink.AiCodeAssuranceQualifyQualityGate}
                          >
                            {text}
                          </DocumentationLink>
                        ),
                      }}
                    />
                  </Text>
                )}

              {aiCodeAssuranceStatus !== AiCodeAssuranceStatus.AI_CODE_ASSURED_OFF && (
                <FormattedMessage id="project.info.ai_code_assurance.on.description" />
              )}
            </ProjectInformationSection>
          </>
        )}

      {component.isAiCodeFixEnabled === true && (
        <ProjectInformationSection>
          <Heading className="sw-mb-2" as="h3">
            {translate('project.info.ai_code_fix.title')}
          </Heading>
          <FormattedMessage id="project.info.ai_code_fix.message" />
        </ProjectInformationSection>
      )}

      <ProjectInformationSection>
        <MetaKey componentKey={component.key} qualifier={component.qualifier} />
      </ProjectInformationSection>

      <ProjectInformationSection>
        <MetaVisibility
          qualifier={component.qualifier}
          visibility={component.visibility ?? Visibility.Public}
        />
      </ProjectInformationSection>

      <ProjectInformationSection>
        <MetaDescription description={component.description} isApp={isApp} />
      </ProjectInformationSection>

      <ProjectInformationSection>
        <MetaTags component={component} onComponentChange={props.onComponentChange} />
      </ProjectInformationSection>

      <ProjectInformationSection last={isApp || !links?.length}>
        <MetaSize component={component} measures={measures} />
      </ProjectInformationSection>

      {!isApp && links && links.length > 0 && (
        <ProjectInformationSection last>
          <MetaLinks links={links} />
        </ProjectInformationSection>
      )}
    </>
  );
}

interface ProjectInformationSectionProps {
  className?: string;
  last?: boolean;
}

function ProjectInformationSection(props: PropsWithChildren<ProjectInformationSectionProps>) {
  const { children, className, last = false } = props;
  return (
    <>
      <section className={classNames('sw-py-4', className)}>{children}</section>
      {!last && <BasicSeparator />}
    </>
  );
}
