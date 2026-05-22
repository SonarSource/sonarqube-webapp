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

import { IconRefresh, Spinner, Tooltip, TooltipSide } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { BareButton, SubnavigationGroup, SubnavigationItem } from '~design-system';
import { BuiltInQualityGateBadge } from '~shared/components/quality-gates/BuiltInQualityGateBadge';
import { DefaultBadge } from '~shared/components/quality-gates/DefaultBadge';
import { QualityGateNewBadge } from '~shared/components/quality-gates/QualityGateNewBadge';
import { isAgenticQualityGate } from '~shared/helpers/quality-gates';
import AIAssuredIcon, {
  AiIconColor,
} from '~sq-server-commons/components/icon-mappers/AIAssuredIcon';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import { getQualityGateUrl } from '~sq-server-commons/helpers/urls';
import { useStandardExperienceModeQuery } from '~sq-server-commons/queries/mode';
import { Feature } from '~sq-server-commons/types/features';
import { CaycStatus, QualityGate } from '~sq-server-commons/types/types';
import QGRecommendedIcon from './QGRecommendedIcon';

interface Props {
  currentQualityGate?: string;
  qualityGates: QualityGate[];
}

export default function List({ qualityGates, currentQualityGate }: Readonly<Props>) {
  const { formatMessage } = useIntl();
  const navigateTo = useNavigate();
  const { hasFeature } = useAvailableFeatures();
  const { data: isStandard, isLoading } = useStandardExperienceModeQuery();

  const getTooltipContent = (qualityGate: QualityGate) => {
    if (shouldShowQualityGateUpdateIcon(qualityGate)) {
      return formatMessage({ id: 'quality_gates.mqr_mode_update.tooltip.message' });
    }

    if (qualityGate.isBuiltIn && qualityGate.isAiCodeSupported) {
      return formatMessage({ id: 'quality_gates.is_built_in.ai.tooltip' });
    }

    if (qualityGate.isBuiltIn) {
      return formatMessage({ id: 'quality_gates.is_built_in.tooltip' });
    }

    if (qualityGate.isAiCodeSupported && qualityGate.caycStatus !== CaycStatus.NonCompliant) {
      return formatMessage({ id: 'quality_gates.recommended_and_ai.tooltip' });
    }

    if (qualityGate.isAiCodeSupported) {
      return formatMessage({ id: 'quality_gates.ai_generated.tooltip.message' });
    }

    if (qualityGate.caycStatus !== CaycStatus.NonCompliant) {
      return formatMessage({ id: 'quality_gates.recommended.tooltip.message' });
    }

    return null;
  };

  const shouldShowQualityGateUpdateIcon = ({
    actions,
    hasMQRConditions,
    hasStandardConditions,
  }: QualityGate) => {
    return (
      actions?.manageConditions === true &&
      ((isStandard && hasMQRConditions === true) || (!isStandard && hasStandardConditions === true))
    );
  };

  return (
    <SubnavigationGroup as="ul" className="sw-box-border">
      {qualityGates.map((qualityGate) => {
        const { name, isDefault, isBuiltIn, caycStatus, isAiCodeSupported } = qualityGate;
        const isDefaultTitle = isDefault ? ` ${formatMessage({ id: 'default' })}` : '';
        const isBuiltInTitle = isBuiltIn
          ? ` ${formatMessage({ id: 'quality_gates.built_in' })}`
          : '';
        const isAICodeAssuranceQualityGate =
          hasFeature(Feature.AiCodeAssurance) && isAiCodeSupported;

        const showGateUpdateIcon = shouldShowQualityGateUpdateIcon(qualityGate);

        return (
          <li key={name}>
            <Tooltip content={getTooltipContent(qualityGate)} side={TooltipSide.Right}>
              <div>
                <SubnavigationItem
                  active={currentQualityGate === name}
                  className="it__list-group-item"
                  key={name}
                  onClick={() => {
                    navigateTo(getQualityGateUrl(name));
                  }}
                >
                  <div className="sw-flex sw-flex-col sw-min-w-0">
                    <BareButton
                      aria-current={currentQualityGate === name && 'page'}
                      className="sw-flex-1 sw-text-ellipsis sw-overflow-hidden sw-max-w-abs-250 sw-whitespace-nowrap"
                      title={`${name}${isDefaultTitle}${isBuiltInTitle}`}
                    >
                      {name}
                    </BareButton>

                    {(isDefault || isBuiltIn) && (
                      <div className="sw-mt-2">
                        {isAgenticQualityGate({ isBuiltIn: isBuiltIn ?? false, name }) && (
                          <QualityGateNewBadge className="sw-mr-2" />
                        )}

                        {isDefault && <DefaultBadge className="sw-mr-2" />}
                        {isBuiltIn && <BuiltInQualityGateBadge className="sw-mr-2" />}
                      </div>
                    )}
                  </div>
                  <Spinner isLoading={isLoading}>
                    <div className="sw-flex sw-ml-6">
                      {showGateUpdateIcon && (
                        <span
                          className="sw-mr-1"
                          data-testid="quality-gates-mqr-standard-mode-update-indicator"
                        >
                          <IconRefresh color="echoes-color-icon-accent" />
                        </span>
                      )}

                      {isAICodeAssuranceQualityGate && (
                        <span
                          className="sw-mr-1 sw-flex sw-items-start"
                          data-testid="quality-gates-ai-assurance-indicator"
                        >
                          <AIAssuredIcon
                            color={showGateUpdateIcon ? AiIconColor.Disable : AiIconColor.Accent}
                          />
                        </span>
                      )}
                      {caycStatus !== CaycStatus.NonCompliant && (
                        <span>
                          <QGRecommendedIcon isDisabled={showGateUpdateIcon} />
                        </span>
                      )}
                    </div>
                  </Spinner>
                </SubnavigationItem>
              </div>
            </Tooltip>
          </li>
        );
      })}
    </SubnavigationGroup>
  );
}
