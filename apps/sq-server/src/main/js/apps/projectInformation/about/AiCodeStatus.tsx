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

import {
  Heading,
  IconSparkle,
  Link,
  LinkHighlight,
  LinkStandalone,
  Text,
} from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { useLocation } from 'react-router-dom';
import { ComponentQualifier } from '~shared/types/component';
import { AiCodeAssuranceStatus } from '~sq-server-commons/api/ai-code-assurance';
import DocumentationLink from '~sq-server-commons/components/common/DocumentationLink';
import AICodeAssuranceStatus from '~sq-server-commons/components/typography/AICodeAssuranceStatus';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { translate } from '~sq-server-commons/helpers/l10n';
import {
  useProjectBranchesAiCodeAssuranceStatusQuery,
  useProjectDetectedAiCodeQuery,
} from '~sq-server-commons/queries/ai-code-assurance';
import { Feature } from '~sq-server-commons/types/features';
import { Component } from '~sq-server-commons/types/types';
import { ProjectInformationSection } from './ProjectInformationSection';

interface Props {
  component: Component;
}

export default function AiCodeStatus(props: Readonly<Props>) {
  const { component } = props;
  const { search } = useLocation();
  const { hasFeature } = useAvailableFeatures();

  const { data: aiCodeAssuranceStatus } = useProjectBranchesAiCodeAssuranceStatusQuery(
    {
      project: component,
    },
    {
      enabled:
        component.qualifier === ComponentQualifier.Project && hasFeature(Feature.AiCodeAssurance),
    },
  );

  const { data: detectedAiCode } = useProjectDetectedAiCodeQuery(
    { project: component },
    {
      enabled:
        aiCodeAssuranceStatus === AiCodeAssuranceStatus.NONE &&
        component.configuration?.showSettings === true,
    },
  );

  if (aiCodeAssuranceStatus === undefined) {
    return null;
  }

  return (
    <>
      {(aiCodeAssuranceStatus !== AiCodeAssuranceStatus.NONE || detectedAiCode) && (
        <section className="sw-py-4">
          <Heading as="h3" className="sw-mb-2">
            {translate('project.info.contain_ai_code.title')}
          </Heading>
          <Text>
            <IconSparkle className="sw-mr-2" color="echoes-color-icon-accent" />
            <FormattedMessage
              id={
                detectedAiCode
                  ? 'project.info.detected_ai_code.description'
                  : 'project.info.contain_ai_code.description'
              }
            />
          </Text>
          {detectedAiCode && (
            <div className="sw-mt-2">
              <Link
                to={`/project/admin/extension/developer-server/ai-project-settings?id=${component.key}&qualifier=${component.qualifier}`}
              >
                {translate('projects.ai_code_detected.link')}
              </Link>
            </div>
          )}
        </section>
      )}

      {aiCodeAssuranceStatus !== AiCodeAssuranceStatus.NONE && (
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
                <Text isSubtle>
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
              <Text isSubtle>
                <FormattedMessage
                  id="project.info.ai_code_assurance.off.description"
                  values={{
                    link: (text) => (
                      <DocumentationLink
                        className="sw-text-nowrap"
                        enableOpenInNewTab
                        highlight={LinkHighlight.Subtle}
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
      )}
    </>
  );
}
