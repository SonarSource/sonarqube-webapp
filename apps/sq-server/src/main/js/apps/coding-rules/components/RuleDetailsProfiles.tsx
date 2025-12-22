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
import { IconInheritance, LinkStandalone, Text, Tooltip } from '@sonarsource/echoes-react';
import { filter, isEqual, orderBy } from 'lodash';
import { FormattedMessage } from 'react-intl';
import tw from 'twin.macro';
import {
  ActionCell,
  CellComponent,
  ContentCell,
  DiscreetLink,
  SeparatorCircleIcon,
  SubTitle,
  Table,
  TableRow,
  TableRowInteractive,
} from '~design-system';
import { SOFTWARE_QUALITY_LABELS } from '~shared/helpers/l10n';
import { SoftwareQualityImpact } from '~shared/types/clean-code-taxonomy';
import { RuleActivationAdvanced, RuleDetails } from '~shared/types/rules';
import { SOFTWARE_QUALITIES } from '~sq-server-commons/helpers/constants';
import { translate } from '~sq-server-commons/helpers/l10n';
import { getQualityProfileUrl } from '~sq-server-commons/helpers/urls';
import { useStandardExperienceModeQuery } from '~sq-server-commons/queries/mode';
import {
  useActivateRuleMutation,
  useDeactivateRuleMutation,
} from '~sq-server-commons/queries/quality-profiles';
import { BaseProfile } from '~sq-server-commons/types/quality-profiles';
import BuiltInQualityProfileBadge from '../../quality-profiles/components/BuiltInQualityProfileBadge';
import ActivatedRuleActions from './ActivatedRuleActions';
import ActivationButton from './ActivationButton';

interface Props {
  activations: RuleActivationAdvanced[] | undefined;
  canDeactivateInherited?: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
  referencedProfiles: Record<string, BaseProfile>;
  ruleDetails: RuleDetails;
}

const MANDATORY_COLUMNS_COUNT = 2;

const PROFILES_HEADING_ID = 'rule-details-profiles-heading';

const softwareQualityOrderMap = new Map(
  SOFTWARE_QUALITIES.map((quality, index) => [quality, index]),
);

export default function RuleDetailsProfiles(props: Readonly<Props>) {
  const { activations = [], referencedProfiles, ruleDetails, canDeactivateInherited } = props;
  const { mutate: activateRule } = useActivateRuleMutation(props.onActivate);
  const { mutate: deactivateRule } = useDeactivateRuleMutation(props.onDeactivate);
  const { data: isStandardMode } = useStandardExperienceModeQuery();

  const canActivate = Object.values(referencedProfiles).some((profile) =>
    Boolean(profile.actions?.edit && profile.language === ruleDetails.lang),
  );
  const showParamsColumn =
    ruleDetails.templateKey === undefined &&
    ruleDetails?.params !== undefined &&
    ruleDetails.params.length > 0;

  const handleDeactivate = (key?: string) => {
    if (key !== undefined) {
      deactivateRule({
        key,
        rule: ruleDetails.key,
      });
    }
  };

  const handleRevert = (key?: string) => {
    if (key !== undefined) {
      activateRule({
        key,
        rule: ruleDetails.key,
        reset: true,
      });
    }
  };

  const renderRowActions = (activation: RuleActivationAdvanced, profile: BaseProfile) => {
    return (
      <ActionCell className="sw-align-top">
        <ActivatedRuleActions
          activation={activation}
          canDeactivateInherited={canDeactivateInherited}
          handleDeactivate={handleDeactivate}
          handleRevert={handleRevert}
          mode="dropdown"
          onActivate={props.onActivate}
          profile={profile}
          ruleDetails={ruleDetails}
        />
      </ActionCell>
    );
  };

  const renderActivationRow = (activation: RuleActivationAdvanced) => {
    const profile = referencedProfiles[activation.qProfile];

    if (!profile) {
      return null;
    }

    const parentActivation = activations.find((x) => x.qProfile === profile.parentKey);

    const inheritedProfileSection = profile.parentName
      ? (activation.inherit === 'OVERRIDES' || activation.inherit === 'INHERITED') && (
          <Text as="div" className="sw-flex sw-items-center sw-w-full" isSubtle>
            <IconInheritance
              color={
                activation.inherit === 'OVERRIDES'
                  ? 'echoes-color-icon-danger'
                  : 'echoes-color-icon-default'
              }
            />

            <DiscreetLink
              aria-label={`${translate('quality_profiles.parent')} ${profile.parentName}`}
              className="sw-ml-1 sw-truncate"
              title={profile.parentName}
              to={getQualityProfileUrl(profile.parentName, profile.language)}
            >
              {profile.parentName}
            </DiscreetLink>
          </Text>
        )
      : null;

    const sortImpacts = (a: SoftwareQualityImpact, b: SoftwareQualityImpact) => {
      const indexA = softwareQualityOrderMap.get(a.softwareQuality) ?? -1;
      const indexB = softwareQualityOrderMap.get(b.softwareQuality) ?? -1;
      return indexA - indexB;
    };

    return (
      <TableRowInteractive key={profile.key}>
        <ContentCell cellClassName="sw-align-top">
          <div className="sw-flex-col sw-flex sw-gap-1">
            <span>
              <LinkStandalone
                aria-label={profile.name}
                title={profile.name}
                to={getQualityProfileUrl(profile.name, profile.language)}
              >
                {profile.name}
              </LinkStandalone>
              {profile.isBuiltIn && <BuiltInQualityProfileBadge className="sw-ml-1" />}
            </span>
            {inheritedProfileSection}

            {activation.prioritizedRule && (
              <MetaProfileItem>
                <SeparatorCircleIcon />
                <Text isSubtle>{translate('coding_rules.prioritized_rule.title')}</Text>
              </MetaProfileItem>
            )}
            {!isStandardMode &&
              Boolean(activation.impacts?.length) &&
              !isEqual(
                [...activation.impacts].sort(sortImpacts),
                [...(ruleDetails.impacts ?? [])].sort(sortImpacts),
              ) && (
                <MetaProfileItem>
                  <SeparatorCircleIcon />
                  <Tooltip
                    content={
                      <>
                        {[...activation.impacts].sort(sortImpacts).map((impact) => {
                          const ruleImpact = ruleDetails.impacts?.find(
                            (i) => i.softwareQuality === impact.softwareQuality,
                          );
                          if (!ruleImpact || ruleImpact.severity === impact.severity) {
                            return null;
                          }
                          return (
                            <Text
                              as="div"
                              colorOverride="echoes-color-text-on-color"
                              key={impact.softwareQuality}
                            >
                              <FormattedMessage
                                id="coding_rules.impact_customized.detail"
                                values={{
                                  softwareQuality: (
                                    <Text colorOverride="echoes-color-text-on-color" isHighlighted>
                                      <FormattedMessage
                                        id={SOFTWARE_QUALITY_LABELS[impact.softwareQuality]}
                                      />
                                    </Text>
                                  ),
                                  recommended: (
                                    <Text
                                      className="sw-lowercase"
                                      colorOverride="echoes-color-text-on-color"
                                      isHighlighted
                                    >
                                      <FormattedMessage
                                        id={`severity_impact.${ruleImpact?.severity}`}
                                      />
                                    </Text>
                                  ),
                                  customized: (
                                    <Text
                                      className="sw-lowercase"
                                      colorOverride="echoes-color-text-on-color"
                                      isHighlighted
                                    >
                                      <FormattedMessage id={`severity_impact.${impact.severity}`} />
                                    </Text>
                                  ),
                                }}
                              />
                            </Text>
                          );
                        })}
                      </>
                    }
                  >
                    <Text isSubtle>{translate('coding_rules.impact_customized.message')}</Text>
                  </Tooltip>
                </MetaProfileItem>
              )}

            {isStandardMode &&
              activation.severity &&
              activation.severity !== ruleDetails.severity && (
                <MetaProfileItem>
                  <SeparatorCircleIcon />
                  <Text isSubtle>
                    <FormattedMessage
                      id="coding_rules.severity_customized.message"
                      values={{
                        recommended: (
                          <Text className="sw-lowercase" isHighlighted>
                            <FormattedMessage id={`severity.${ruleDetails.severity}`} />
                          </Text>
                        ),
                        customized: (
                          <Text className="sw-lowercase" isHighlighted>
                            <FormattedMessage id={`severity.${activation.severity}`} />
                          </Text>
                        ),
                      }}
                    />
                  </Text>
                </MetaProfileItem>
              )}
          </div>
        </ContentCell>

        {showParamsColumn && (
          <CellComponent>
            {activation.params.map((param: { key: string; value: string }) => {
              const parentValue = parentActivation?.params.find((p) => p.key === param.key)?.value;

              return (
                <StyledParameter key={param.key}>
                  <div className="sw-flex">
                    <Text className="sw-min-w-[100px]" isHighlighted>
                      {param.key}:
                    </Text>
                    <span className="fs-mask sw-inline-block sw-code sw-ml-2" title={param.value}>
                      {param.value}
                    </span>
                  </div>
                  {parentActivation && param.value !== parentValue && (
                    <Text className="sw-flex sw-mt-1" isSubtle>
                      <div className="sw-min-w-[100px]">
                        <FormattedMessage id="coding_rules.original" />
                      </div>
                      <span className="fs-mask sw-code sw-ml-2">{parentValue}</span>
                    </Text>
                  )}
                </StyledParameter>
              );
            })}
          </CellComponent>
        )}

        {renderRowActions(activation, profile)}
      </TableRowInteractive>
    );
  };

  return (
    <div className="js-rule-profiles sw-mb-8">
      <div className="sw-flex sw-justify-between sw-items-end">
        <div>
          <SubTitle id={PROFILES_HEADING_ID}>
            <FormattedMessage id="coding_rules.quality_profiles" />
          </SubTitle>
          <Text isSubtle>
            <FormattedMessage id="coding_rules.quality_profiles.description" />
          </Text>
        </div>

        {canActivate && (
          <ActivationButton
            buttonText={translate('coding_rules.activate')}
            modalHeader={translate('coding_rules.activate_in_quality_profile')}
            onDone={props.onActivate}
            profiles={filter(
              referencedProfiles,
              (profile) => !activations.find((activation) => activation.qProfile === profile.key),
            )}
            rule={ruleDetails}
          />
        )}
      </div>

      {activations.length > 0 && (
        <Table
          aria-labelledby={PROFILES_HEADING_ID}
          className="sw-my-6"
          columnCount={MANDATORY_COLUMNS_COUNT + +showParamsColumn}
          header={
            <TableRow>
              <ContentCell>{translate('profile_name')}</ContentCell>
              {showParamsColumn && <ContentCell>{translate('parameters')}</ContentCell>}
              <ActionCell>{translate('actions')}</ActionCell>
            </TableRow>
          }
          id="coding-rules-detail-quality-profiles"
        >
          {orderBy(activations, 'qProfile').map(renderActivationRow)}
        </Table>
      )}
    </div>
  );
}

const MetaProfileItem = styled.div`
  ${tw`sw-flex sw-items-center sw-gap-1 sw-mt-1`};
`;

const StyledParameter = styled.div`
  &:not(:first-of-type) {
    ${tw`sw-mt-3`};
  }
`;
