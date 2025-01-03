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
import { IconSparkle, Link, LinkHighlight, Text, TextSize } from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { HelperHintIcon, themeBorder } from '~design-system';
import HelpTooltip from '~sonar-aligned/components/controls/HelpTooltip';
import { ComponentQualifier } from '~sonar-aligned/types/component';
import { AiCodeAssuranceStatus } from '../../../api/ai-code-assurance';
import { useAvailableFeatures } from '../../../app/components/available-features/withAvailableFeatures';
import DocumentationLink from '../../../components/common/DocumentationLink';
import AICodeAssuranceStatus from '../../../components/typography/AICodeAssuranceStatus';
import { DocLink } from '../../../helpers/doc-links';
import {
  useProjectBranchesAiCodeAssuranceStatusQuery,
  useProjectDetectedAiCodeQuery,
} from '../../../queries/ai-code-assurance';
import { Branch } from '../../../types/branch-like';
import { Feature } from '../../../types/features';
import { Component } from '../../../types/types';

interface Props {
  branch?: Branch;
  component: Component;
}

export default function AICodeStatus(props: Readonly<Props>) {
  const { branch, component } = props;
  const { hasFeature } = useAvailableFeatures();
  const intl = useIntl();

  const { data: aiCodeAssuranceStatus } = useProjectBranchesAiCodeAssuranceStatusQuery(
    {
      project: component,
      branch: branch?.name,
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

  if (aiCodeAssuranceStatus === AiCodeAssuranceStatus.NONE && detectedAiCode) {
    return (
      <AICodeAssuranceStatusWrapper className="sw-ml-6 sw-pl-6">
        <Text isHighlighted>
          <IconSparkle className="sw-mr-1" />
          <FormattedMessage id="projects.ai_code_detected.title" />
        </Text>
        <div className="sw-flex sw-items-center sw-gap-2 sw-mt-2">
          <Text as="p" size={TextSize.Small} isSubdued>
            <FormattedMessage id="projects.ai_code_detected.description" />
          </Text>
          <HelpTooltip
            className="sw-mb-1"
            placement="right"
            overlay={<FormattedMessage id="projects.ai_code_detected.tooltip.content" />}
          >
            <HelperHintIcon />
          </HelpTooltip>
        </div>

        <Link
          to={`/project/admin/extension/developer-server/ai-project-settings?id=${component.key}&qualifier=${component.qualifier}`}
        >
          {intl.formatMessage({ id: 'projects.ai_code_detected.link' })}
        </Link>
      </AICodeAssuranceStatusWrapper>
    );
  }

  return (
    <>
      {aiCodeAssuranceStatus !== AiCodeAssuranceStatus.NONE && (
        <AICodeAssuranceStatusWrapper className="sw-ml-6 sw-pl-6">
          <AICodeAssuranceStatus aiCodeAssuranceStatus={aiCodeAssuranceStatus} isHighlighted />
          <Text as="p" size={TextSize.Small} isSubdued className="sw-mt-2">
            {aiCodeAssuranceStatus === AiCodeAssuranceStatus.AI_CODE_ASSURED_OFF &&
              component.configuration?.showQualityGates && (
                <FormattedMessage
                  id="projects.branches.AI_CODE_ASSURANCE_OFF.admin.content"
                  values={{
                    link: (text) => <Link to="/project/quality_gate">{text}</Link>,
                  }}
                />
              )}

            {aiCodeAssuranceStatus === AiCodeAssuranceStatus.AI_CODE_ASSURED_OFF &&
              !component.configuration?.showQualityGates && (
                <FormattedMessage
                  id="projects.branches.AI_CODE_ASSURANCE_OFF.content"
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
              )}

            {aiCodeAssuranceStatus !== AiCodeAssuranceStatus.AI_CODE_ASSURED_OFF && (
              <FormattedMessage id={`projects.branch.info.${aiCodeAssuranceStatus}.content`} />
            )}
          </Text>
        </AICodeAssuranceStatusWrapper>
      )}
    </>
  );
}

const AICodeAssuranceStatusWrapper = styled.div`
  border-left: ${themeBorder('default', 'pageBlockBorder')};
`;
