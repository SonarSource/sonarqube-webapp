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
  Layout,
  Link,
  LinkHighlight,
  Spinner,
  Text,
} from '@sonarsource/echoes-react';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { FlagMessage, RadioButton } from '~design-system';
import A11ySkipTarget from '~shared/components/a11y/A11ySkipTarget';
import { ProjectPageTemplate } from '~shared/components/pages/ProjectPageTemplate';
import { BuiltInQualityGateBadge } from '~shared/components/quality-gates/BuiltInQualityGateBadge';
import { QUALITY_GATE_AGENTIC_AI } from '~shared/helpers/quality-gates';
import { ComponentQualifier } from '~shared/types/component';
import { AiCodeAssuranceStatus } from '~sq-server-commons/api/ai-code-assurance';
import DocumentationLink from '~sq-server-commons/components/common/DocumentationLink';
import AIAssuredIcon, {
  AiIconColor,
} from '~sq-server-commons/components/icon-mappers/AIAssuredIcon';
import { AiIconVariant } from '~sq-server-commons/components/illustrations/AiAssuredIllustration';
import AiCodeAssuranceBanner from '~sq-server-commons/components/ui/AiCodeAssuranceBanner';
import withAvailableFeatures, {
  useAvailableFeatures,
  WithAvailableFeaturesProps,
} from '~sq-server-commons/context/available-features/withAvailableFeatures';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { isDiffMetric } from '~sq-server-commons/helpers/measures';
import { getQualityGateUrl } from '~sq-server-commons/helpers/urls';
import {
  useProjectBranchesAiCodeAssuranceStatusQuery,
  useProjectContainsAiCodeQuery,
} from '~sq-server-commons/queries/ai-code-assurance';
import {
  useAssociateGateWithProjectMutation,
  useDissociateGateWithProjectMutation,
} from '~sq-server-commons/queries/quality-gates';
import { Feature } from '~sq-server-commons/types/features';
import { Component, QualityGate } from '~sq-server-commons/types/types';
import AiAssuranceSuccessMessage from './AiAssuranceSuccessMessage';
import AiAssuranceWarningMessage from './AiAssuranceWarningMessage';
import { USE_SYSTEM_DEFAULT } from './constants';
import { QualityGateSelect } from './QualityGateSelect';

export interface ProjectQualityGateAppRendererProps extends WithAvailableFeaturesProps {
  allQualityGates?: QualityGate[];
  component: Component;
  currentQualityGate?: QualityGate;
  loading: boolean;
  onSelect: (id: string) => void;
  onSubmit: () => void;
  selectedQualityGateName: string;
}

function hasConditionOnNewCode(qualityGate: QualityGate): boolean {
  return !!qualityGate.conditions?.some((condition) => isDiffMetric(condition.metric));
}

function ProjectQualityGateAppRenderer(props: Readonly<ProjectQualityGateAppRendererProps>) {
  const { allQualityGates, component, currentQualityGate, loading, selectedQualityGateName } =
    props;
  const defaultQualityGate = allQualityGates?.find((g) => g.isDefault);
  const [isUserEditing, setIsUserEditing] = useState(false);
  const { hasFeature } = useAvailableFeatures();
  const intl = useIntl();

  const { data: aiAssuranceStatus, refetch: refetchAiCodeAssuranceStatus } =
    useProjectBranchesAiCodeAssuranceStatusQuery(
      { project: component },
      {
        enabled:
          component.qualifier === ComponentQualifier.Project && hasFeature(Feature.AiCodeAssurance),
      },
    );

  const { data: containsAiCodeData } = useProjectContainsAiCodeQuery(
    { project: component },
    {
      enabled:
        component.qualifier === ComponentQualifier.Project && hasFeature(Feature.AiCodeAssurance),
    },
  );
  const containsAiCode = containsAiCodeData === true;

  const { mutateAsync: associateGateWithProject, isPending: associateIsPending } =
    useAssociateGateWithProjectMutation();
  const { mutateAsync: dissociateGateWithProject, isPending: dissociateisPending } =
    useDissociateGateWithProjectMutation();
  const submitting = associateIsPending || dissociateisPending;

  const handleSubmit = async () => {
    const { allQualityGates, currentQualityGate, selectedQualityGateName } = props;

    if (allQualityGates === undefined || currentQualityGate === undefined) {
      return;
    }

    if (selectedQualityGateName === USE_SYSTEM_DEFAULT) {
      await dissociateGateWithProject({
        projectKey: component.key,
      });
    } else {
      await associateGateWithProject({
        gateName: selectedQualityGateName,
        projectKey: component.key,
      });
    }

    props.onSubmit();
  };

  const pageTitle = intl.formatMessage({ id: 'project_quality_gate.page' });

  if (loading) {
    return (
      <ProjectPageTemplate disableBranchSelector title={pageTitle}>
        <Spinner />
      </ProjectPageTemplate>
    );
  }

  if (
    allQualityGates === undefined ||
    defaultQualityGate === undefined ||
    currentQualityGate === undefined
  ) {
    return null;
  }

  const usesDefault = selectedQualityGateName === USE_SYSTEM_DEFAULT;
  const needsReanalysis = usesDefault
    ? // currentQualityGate.isDefault is not always up to date. We need to check
      // against defaultQualityGate explicitly.
      defaultQualityGate.name !== currentQualityGate.name
    : selectedQualityGateName !== currentQualityGate.name;

  const selectedQualityGate = allQualityGates.find((qg) => qg.name === selectedQualityGateName);

  return (
    <ProjectPageTemplate
      description={
        <Layout.ContentHeader.Description>
          <FormattedMessage id="quality_gates.projects.help" />
        </Layout.ContentHeader.Description>
      }
      disableBranchSelector
      title={pageTitle}
    >
      <A11ySkipTarget anchor="qg_main" />

      <div className="sw-flex sw-flex-col sw-items-start" id="project-quality-gate">
        {(aiAssuranceStatus === AiCodeAssuranceStatus.AI_CODE_ASSURED_ON ||
          aiAssuranceStatus === AiCodeAssuranceStatus.AI_CODE_ASSURED_PASS ||
          aiAssuranceStatus === AiCodeAssuranceStatus.AI_CODE_ASSURED_FAIL) && (
          <AiCodeAssuranceBanner
            className="sw-mb-10 sw-w-full"
            description={
              <FormattedMessage
                id="project_quality_gate.ai_generated_code_protected.description"
                values={{
                  p: (text) => <p>{text}</p>,
                  link: (text) => (
                    <DocumentationLink
                      className="sw-inline-block"
                      enableOpenInNewTab
                      highlight={LinkHighlight.Default}
                      to={DocLink.AiCodeAssurance}
                    >
                      {text}
                    </DocumentationLink>
                  ),
                }}
              />
            }
            iconVariant={AiIconVariant.Check}
            title={<FormattedMessage id="project_quality_gate.ai_generated_code_protected.title" />}
          />
        )}

        {aiAssuranceStatus === AiCodeAssuranceStatus.AI_CODE_ASSURED_OFF && (
          <AiCodeAssuranceBanner
            className="sw-mb-10 sw-w-full"
            description={
              <FormattedMessage
                id="project_quality_gate.ai_generated_code_not_protected.description"
                values={{
                  p: (text) => <p>{text}</p>,
                  link: (text) => (
                    <DocumentationLink
                      enableOpenInNewTab
                      highlight={LinkHighlight.Default}
                      to={DocLink.AiCodeAssurance}
                    >
                      {text}
                    </DocumentationLink>
                  ),
                  linkSonarWay: (text) => (
                    <Link
                      highlight={LinkHighlight.Default}
                      to={getQualityGateUrl(QUALITY_GATE_AGENTIC_AI)}
                    >
                      {text}
                    </Link>
                  ),
                  linkQualifyDoc: (text) => (
                    <DocumentationLink
                      enableOpenInNewTab
                      highlight={LinkHighlight.Default}
                      to={DocLink.AiCodeAssuranceQualifyQualityGate}
                    >
                      {text}
                    </DocumentationLink>
                  ),
                }}
              />
            }
            iconVariant={AiIconVariant.Default}
            title={
              <FormattedMessage id="project_quality_gate.ai_generated_code_not_protected.title" />
            }
          />
        )}

        <form
          className="sw-w-1/2"
          id="project_quality_gate"
          onSubmit={async (e) => {
            e.preventDefault();
            await handleSubmit();
            setIsUserEditing(false);
            refetchAiCodeAssuranceStatus();
          }}
        >
          <p className="sw-mb-4">
            <FormattedMessage id="project_quality_gate.page.description" />
          </p>
          <div className="sw-mb-4">
            <RadioButton
              checked={usesDefault}
              className="it__project-quality-default sw-items-start"
              disabled={submitting}
              onCheck={() => {
                setIsUserEditing(true);
                props.onSelect(USE_SYSTEM_DEFAULT);
              }}
              value={USE_SYSTEM_DEFAULT}
            >
              <div>
                <div className="sw-ml-1 sw-mb-2">
                  <FormattedMessage id="project_quality_gate.always_use_default" />
                </div>
                <div>
                  <Text isSubtle>
                    <FormattedMessage id="current_noun" />: {defaultQualityGate.name}
                    {defaultQualityGate.isAiCodeSupported && (
                      <AIAssuredIcon
                        className="sw-ml-1"
                        color={AiIconColor.Subtle}
                        height={16}
                        variant={AiCodeAssuranceStatus.AI_CODE_ASSURED_ON}
                        width={16}
                      />
                    )}
                    {defaultQualityGate.isBuiltIn && (
                      <BuiltInQualityGateBadge className="sw-ml-1" />
                    )}
                  </Text>
                </div>
                {containsAiCode &&
                  isUserEditing &&
                  usesDefault &&
                  defaultQualityGate.isAiCodeSupported === true && (
                    <AiAssuranceSuccessMessage className="sw-mt-1" />
                  )}

                {containsAiCode &&
                  isUserEditing &&
                  usesDefault &&
                  defaultQualityGate.isAiCodeSupported === false && (
                    <AiAssuranceWarningMessage className="sw-mt-1" />
                  )}
              </div>
            </RadioButton>
          </div>
          <div className="sw-mb-4">
            <RadioButton
              checked={!usesDefault}
              className="it__project-quality-specific sw-items-start sw-mt-1"
              disabled={submitting}
              onCheck={(value: string) => {
                setIsUserEditing(true);
                if (usesDefault) {
                  props.onSelect(value);
                }
              }}
              value={!usesDefault ? selectedQualityGateName : currentQualityGate.name}
            >
              <div>
                <div className="sw-ml-1 sw-mb-2">
                  <FormattedMessage id="project_quality_gate.always_use_specific" />
                </div>
              </div>
            </RadioButton>
            <div className="sw-ml-6">
              <QualityGateSelect
                allQualityGates={allQualityGates}
                isDisabled={submitting || usesDefault}
                isLoading={loading}
                onChange={(value) => {
                  if (value) {
                    setIsUserEditing(true);
                    props.onSelect(value);
                  }
                }}
                value={usesDefault ? currentQualityGate.name : selectedQualityGateName}
              />
            </div>
            {containsAiCode &&
              isUserEditing &&
              !usesDefault &&
              selectedQualityGate?.isAiCodeSupported === true && (
                <AiAssuranceSuccessMessage className="sw-mt-1 sw-ml-6" />
              )}

            {containsAiCode &&
              isUserEditing &&
              !usesDefault &&
              selectedQualityGate &&
              selectedQualityGate.isAiCodeSupported === false && (
                <AiAssuranceWarningMessage className="sw-mt-1 sw-ml-6" />
              )}

            {selectedQualityGate && !hasConditionOnNewCode(selectedQualityGate) && (
              <FlagMessage variant="warning">
                <FormattedMessage
                  id="project_quality_gate.no_condition_on_new_code"
                  values={{
                    link: (
                      <Link to={getQualityGateUrl(selectedQualityGate.name)}>
                        <FormattedMessage id="project_quality_gate.no_condition.link" />
                      </Link>
                    ),
                  }}
                />
              </FlagMessage>
            )}
            {needsReanalysis && (
              <FlagMessage className="sw-mt-4 sw-w-abs-600" variant="warning">
                <FormattedMessage id="project_quality_gate.requires_new_analysis" />
              </FlagMessage>
            )}
          </div>
          <div>
            <Button
              form="project_quality_gate"
              isDisabled={submitting}
              type="submit"
              variety={ButtonVariety.Primary}
            >
              <FormattedMessage id="save" />
            </Button>
            <Spinner isLoading={submitting} />
          </div>
        </form>
      </div>
    </ProjectPageTemplate>
  );
}

export default withAvailableFeatures(ProjectQualityGateAppRenderer);
