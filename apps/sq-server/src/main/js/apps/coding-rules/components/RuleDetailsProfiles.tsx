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
import { LinkStandalone, Text, Tooltip } from '@sonarsource/echoes-react';
import { filter, isEqual } from 'lodash';
import { FormattedMessage } from 'react-intl';
import {
  ActionCell,
  CellComponent,
  ContentCell,
  DiscreetLink,
  InheritanceIcon,
  Note,
  SeparatorCircleIcon,
  SubTitle,
  Table,
  TableRow,
  TableRowInteractive,
} from '~design-system';
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
      <ActionCell>
        <ActivatedRuleActions
          activation={activation}
          canDeactivateInherited={canDeactivateInherited}
          handleDeactivate={handleDeactivate}
          handleRevert={handleRevert}
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
          <Note as="div" className="sw-flex sw-items-center sw-w-full">
            <InheritanceIcon
              fill={activation.inherit === 'OVERRIDES' ? 'destructiveIconFocus' : 'currentColor'}
            />

            <DiscreetLink
              aria-label={`${translate('quality_profiles.parent')} ${profile.parentName}`}
              className="sw-ml-1 sw-truncate"
              title={profile.parentName}
              to={getQualityProfileUrl(profile.parentName, profile.language)}
            >
              {profile.parentName}
            </DiscreetLink>
          </Note>
        )
      : null;

    const sortImpacts = (a: SoftwareQualityImpact, b: SoftwareQualityImpact) => {
      const indexA = softwareQualityOrderMap.get(a.softwareQuality) ?? -1;
      const indexB = softwareQualityOrderMap.get(b.softwareQuality) ?? -1;
      return indexA - indexB;
    };

    return (
      <TableRowInteractive key={profile.key}>
        <ContentCell className="sw-flex sw-flex-col sw-gap-2">
          <div className="sw-self-start sw-flex sw-gap-2 sw-items-center">
            <LinkStandalone
              aria-label={profile.name}
              className="sw-truncate sw-max-w-64"
              title={profile.name}
              to={getQualityProfileUrl(profile.name, profile.language)}
            >
              {profile.name}
            </LinkStandalone>

            {activation.prioritizedRule && (
              <>
                <SeparatorCircleIcon />
                <Text isSubdued>{translate('coding_rules.prioritized_rule.title')}</Text>
              </>
            )}
            {!isStandardMode &&
              Boolean(activation.impacts?.length) &&
              !isEqual(
                [...activation.impacts].sort(sortImpacts),
                [...(ruleDetails.impacts ?? [])].sort(sortImpacts),
              ) && (
                <>
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
                                        id={`software_quality.${impact.softwareQuality}`}
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
                    <Text isSubdued>{translate('coding_rules.impact_customized.message')}</Text>
                  </Tooltip>
                </>
              )}

            {isStandardMode &&
              activation.severity &&
              activation.severity !== ruleDetails.severity && (
                <>
                  <SeparatorCircleIcon />
                  <Text isSubdued>
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
                </>
              )}

            {profile.isBuiltIn && <BuiltInQualityProfileBadge />}
          </div>

          {inheritedProfileSection}
        </ContentCell>

        {showParamsColumn && (
          <CellComponent>
            {activation.params.map((param: { key: string; value: string }) => {
              const originalParam = parentActivation?.params.find((p) => p.key === param.key);
              const originalValue = originalParam?.value;

              return (
                <StyledParameter className="sw-my-4" key={param.key}>
                  <span className="key">{param.key}</span>

                  <span className="sep sw-mr-1">: </span>

                  <span className="value" title={param.value}>
                    {param.value}
                  </span>

                  {parentActivation && param.value !== originalValue && (
                    <div className="sw-flex sw-ml-4">
                      {translate('coding_rules.original')}

                      <span className="value sw-ml-1" title={originalValue}>
                        {originalValue}
                      </span>
                    </div>
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
          <Note>
            <FormattedMessage id="coding_rules.quality_profiles.description" />
          </Note>
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
          {activations.map(renderActivationRow)}
        </Table>
      )}
    </div>
  );
}

const StyledParameter = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  .value {
    display: inline-block;
    max-width: 300px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;
