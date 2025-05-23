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

import { IconRefresh, Spinner, Tooltip } from '@sonarsource/echoes-react';
import { useNavigate } from 'react-router-dom';
import { Badge, BareButton, SubnavigationGroup, SubnavigationItem } from '~design-system';
import AIAssuredIcon, {
  AiIconColor,
} from '~sq-server-commons/components/icon-mappers/AIAssuredIcon';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import { translate } from '~sq-server-commons/helpers/l10n';
import { getQualityGateUrl } from '~sq-server-commons/helpers/urls';
import { useStandardExperienceModeQuery } from '~sq-server-commons/queries/mode';
import { Feature } from '~sq-server-commons/types/features';
import { CaycStatus, QualityGate } from '~sq-server-commons/types/types';
import BuiltInQualityGateBadge from './BuiltInQualityGateBadge';
import QGRecommendedIcon from './QGRecommendedIcon';

interface Props {
  currentQualityGate?: string;
  qualityGates: QualityGate[];
}

export default function List({ qualityGates, currentQualityGate }: Readonly<Props>) {
  const navigateTo = useNavigate();
  const { hasFeature } = useAvailableFeatures();
  const { data: isStandard, isLoading } = useStandardExperienceModeQuery();

  return (
    <SubnavigationGroup>
      {qualityGates.map(
        ({
          isDefault,
          isBuiltIn,
          name,
          caycStatus,
          hasMQRConditions,
          hasStandardConditions,
          isAiCodeSupported,
          actions,
        }) => {
          const isDefaultTitle = isDefault ? ` ${translate('default')}` : '';
          const isBuiltInTitle = isBuiltIn ? ` ${translate('quality_gates.built_in')}` : '';
          const isAICodeAssuranceQualityGate =
            hasFeature(Feature.AiCodeAssurance) && isAiCodeSupported;

          const shouldShowQualityGateUpdateIcon =
            actions?.manageConditions === true &&
            ((isStandard && hasMQRConditions === true) ||
              (!isStandard && hasStandardConditions === true));

          return (
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
                    {isDefault && <Badge className="sw-mr-2">{translate('default')}</Badge>}
                    {isBuiltIn && <BuiltInQualityGateBadge />}
                  </div>
                )}
              </div>
              <Spinner isLoading={isLoading}>
                <div className="sw-flex sw-ml-6">
                  {shouldShowQualityGateUpdateIcon && (
                    <Tooltip content={translate('quality_gates.mqr_mode_update.tooltip.message')}>
                      <span
                        className="sw-mr-1"
                        data-testid="quality-gates-mqr-standard-mode-update-indicator"
                      >
                        <IconRefresh color="echoes-color-icon-accent" />
                      </span>
                    </Tooltip>
                  )}

                  {isAICodeAssuranceQualityGate && (
                    <Tooltip
                      content={translate('quality_gates.ai_generated.tooltip.message')}
                      isOpen={shouldShowQualityGateUpdateIcon ? false : undefined}
                    >
                      <span
                        className="sw-mr-1 sw-flex sw-items-start"
                        data-testid="quality-gates-ai-assurance-indicator"
                      >
                        <AIAssuredIcon
                          color={
                            shouldShowQualityGateUpdateIcon
                              ? AiIconColor.Disable
                              : AiIconColor.Accent
                          }
                        />
                      </span>
                    </Tooltip>
                  )}
                  {caycStatus !== CaycStatus.NonCompliant && (
                    <Tooltip
                      content={translate('quality_gates.cayc.tooltip.message')}
                      isOpen={shouldShowQualityGateUpdateIcon ? false : undefined}
                    >
                      <span>
                        <QGRecommendedIcon isDisabled={shouldShowQualityGateUpdateIcon} />
                      </span>
                    </Tooltip>
                  )}
                </div>
              </Spinner>
            </SubnavigationItem>
          );
        },
      )}
    </SubnavigationGroup>
  );
}
