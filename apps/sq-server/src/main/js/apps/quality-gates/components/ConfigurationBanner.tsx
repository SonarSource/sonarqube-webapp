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
  Button,
  LinkHighlight,
  MessageCallout,
  MessageVariety,
  Text,
} from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { MetricKey } from '~shared/types/metrics';
import DocumentationLink from '~sq-server-commons/components/common/DocumentationLink';
import AIAssuredIcon from '~sq-server-commons/components/icon-mappers/AIAssuredIcon';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import { useMetrics } from '~sq-server-commons/context/metrics/withMetricsContext';
import { CardWithPrimaryBackground } from '~sq-server-commons/design-system';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import {
  groupAndSortByPriorityConditions,
  MQR_CONDITIONS_MAP,
  STANDARD_CONDITIONS_MAP,
} from '~sq-server-commons/helpers/quality-gates';
import useLocalStorage from '~sq-server-commons/hooks/useLocalStorage';
import { useStandardExperienceModeQuery } from '~sq-server-commons/queries/mode';
import { Feature } from '~sq-server-commons/types/features';
import { CaycStatus, QualityGate } from '~sq-server-commons/types/types';
import FixQualityGateModal from './FixQualityGateModal';
import QGRecommendedIcon from './QGRecommendedIcon';
import UpdateConditionsFromOtherModeBanner from './UpdateConditionsFromOtherModeBanner';

interface Props {
  qualityGate: QualityGate;
}

export default function ConfigurationBanner({ qualityGate }: Readonly<Props>) {
  const { hasFeature } = useAvailableFeatures();
  const { data: isStandardMode } = useStandardExperienceModeQuery();

  const canAdmin = Boolean(qualityGate.actions?.manageConditions);
  const hasAICA = hasFeature(Feature.AiCodeAssurance) && qualityGate.isAiCodeSupported;
  const followsRecommendation = qualityGate.caycStatus !== CaycStatus.NonCompliant;
  const hasConditionsFromOtherMode =
    qualityGate[isStandardMode ? 'hasMQRConditions' : 'hasStandardConditions'];

  const [dismissedRecommendation, setDismissedRecommendation] = useLocalStorage(
    `sonar-recommendation-${qualityGate.name}`,
    false,
  );

  if (qualityGate.isBuiltIn && !hasAICA) {
    return <GateBuiltInBanner />;
  }

  if (qualityGate.isBuiltIn && hasAICA) {
    return <GateBuiltInAiBanner />;
  }

  if (hasConditionsFromOtherMode && canAdmin) {
    return <GateUpdateModeConditionsBanner qualityGate={qualityGate} />;
  }

  if (!followsRecommendation && !dismissedRecommendation && canAdmin) {
    return (
      <GateRecommendationBanner
        onDismiss={() => {
          setDismissedRecommendation(true);
        }}
        qualityGate={qualityGate}
      />
    );
  }

  if (followsRecommendation && hasAICA) {
    return <GateRecommendedWithAIBanner />;
  }

  if (followsRecommendation && !hasAICA) {
    return <GateRecommendedBanner />;
  }

  if (hasAICA) {
    return <GateAiQualifiedBanner />;
  }

  return null;
}

function GateBuiltInBanner() {
  return (
    <CardWithPrimaryBackground className="sw-p-4 sw-pl-6">
      <QGRecommendedIcon className="sw-mr-2" />
      <Text>
        <FormattedMessage
          id="quality_gates.banner.builtin.title"
          values={{
            link: (text) => (
              <DocumentationLink
                enableOpenInNewTab
                highlight={LinkHighlight.CurrentColor}
                to={DocLink.NewCodeRecommended}
              >
                {text}
              </DocumentationLink>
            ),
          }}
        />
      </Text>
    </CardWithPrimaryBackground>
  );
}

function GateBuiltInAiBanner() {
  return (
    <CardWithPrimaryBackground className="sw-p-4 sw-pl-6">
      <AIAssuredIcon className="sw-mr-2" />
      <Text>
        <FormattedMessage id="quality_gates.banner.builtin.ai.title" />
      </Text>
    </CardWithPrimaryBackground>
  );
}

function GateUpdateModeConditionsBanner({ qualityGate }: Readonly<Props>) {
  const metrics = useMetrics();
  const { data: isStandardMode } = useStandardExperienceModeQuery();
  const existingConditions =
    qualityGate.conditions?.filter((condition) => metrics[condition.metric]) ?? [];

  const { overallCodeConditions, newCodeConditions } = groupAndSortByPriorityConditions(
    existingConditions,
    metrics,
    qualityGate.isBuiltIn,
    qualityGate.isAiCodeSupported,
  );
  const conditionsToOtherModeMap = isStandardMode ? MQR_CONDITIONS_MAP : STANDARD_CONDITIONS_MAP;

  return (
    <UpdateConditionsFromOtherModeBanner
      newCodeConditions={newCodeConditions.filter(
        (c) => conditionsToOtherModeMap[c.metric as MetricKey] !== undefined,
      )}
      overallCodeConditions={overallCodeConditions.filter(
        (c) => conditionsToOtherModeMap[c.metric as MetricKey] !== undefined,
      )}
      qualityGateName={qualityGate.name}
    />
  );
}

function GateRecommendationBanner({
  qualityGate,
  onDismiss,
}: Readonly<Props & { onDismiss: () => void }>) {
  const intl = useIntl();
  const metrics = useMetrics();

  return (
    <MessageCallout
      action={
        <FixQualityGateModal
          conditions={qualityGate.conditions ?? []}
          metrics={metrics}
          qualityGate={qualityGate}
          scope="new-cayc"
        >
          <Button className="sw-mt-4">
            <FormattedMessage id="quality_gates.fix_modal.review_update" />
          </Button>
        </FixQualityGateModal>
      }
      onDismiss={onDismiss}
      title={intl.formatMessage({ id: 'quality_gates.banner.recommendation_update.title' })}
      variety={MessageVariety.Info}
    >
      <FormattedMessage
        id="quality_gates.banner.recommendation_update.description"
        values={{
          link: (text) => (
            <DocumentationLink
              enableOpenInNewTab
              highlight={LinkHighlight.CurrentColor}
              to={DocLink.NewCodeRecommended}
            >
              {text}
            </DocumentationLink>
          ),
        }}
      />
    </MessageCallout>
  );
}

function GateAiQualifiedBanner() {
  return (
    <CardWithPrimaryBackground className="sw-p-4 sw-pl-6">
      <AIAssuredIcon className="sw-mr-2" />
      <Text>
        <FormattedMessage
          id="quality_gates.info.aica.title"
          values={{
            link: (text) => (
              <DocumentationLink
                enableOpenInNewTab
                highlight={LinkHighlight.CurrentColor}
                to={DocLink.AiCodeAssuranceQualifyQualityGate}
              >
                {text}
              </DocumentationLink>
            ),
          }}
        />
      </Text>
    </CardWithPrimaryBackground>
  );
}

function GateRecommendedBanner() {
  return (
    <CardWithPrimaryBackground className="sw-p-4 sw-pl-6">
      <QGRecommendedIcon className="sw-mr-2" />
      <Text>
        <FormattedMessage
          id="quality_gates.info.recommended.title"
          values={{
            link: (text) => (
              <DocumentationLink
                enableOpenInNewTab
                highlight={LinkHighlight.CurrentColor}
                to={DocLink.NewCodeRecommended}
              >
                {text}
              </DocumentationLink>
            ),
          }}
        />
      </Text>
    </CardWithPrimaryBackground>
  );
}

function GateRecommendedWithAIBanner() {
  return (
    <CardWithPrimaryBackground className="sw-p-4 sw-pl-6">
      <Text isHighlighted>
        <FormattedMessage id="quality_gates.banner.info.multiple.title" />
      </Text>
      <Text as="p" className="sw-mt-4 sw-mb-2">
        <AIAssuredIcon className="sw-mr-2" />
        <FormattedMessage
          id="quality_gates.banner.info.multiple.aica"
          values={{
            link: (text) => (
              <DocumentationLink
                enableOpenInNewTab
                highlight={LinkHighlight.CurrentColor}
                to={DocLink.AiCodeAssuranceQualifyQualityGate}
              >
                {text}
              </DocumentationLink>
            ),
          }}
        />
      </Text>
      <Text as="p">
        <QGRecommendedIcon className="sw-mr-2" />
        <FormattedMessage
          id="quality_gates.banner.info.multiple.sonar"
          values={{
            link: (text) => (
              <DocumentationLink
                enableOpenInNewTab
                highlight={LinkHighlight.CurrentColor}
                to={DocLink.NewCodeRecommended}
              >
                {text}
              </DocumentationLink>
            ),
          }}
        />
      </Text>
    </CardWithPrimaryBackground>
  );
}
