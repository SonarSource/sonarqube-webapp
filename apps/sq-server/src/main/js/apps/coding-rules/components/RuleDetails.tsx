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
  Heading,
  IconQuestionMark,
  ModalAlert,
  Spinner,
} from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import DateFormatter from '~shared/components/intl/DateFormatter';
import { RuleActivationAdvanced } from '~shared/types/rules';
import {
  useDeleteRuleMutation,
  useRuleDetailsQuery,
  useUpdateRuleMutation,
} from '~sq-server-commons/queries/rules';
import HelpTooltip from '~sq-server-commons/sonar-aligned/components/controls/HelpTooltip';
import { BaseProfile } from '~sq-server-commons/types/quality-profiles';
import CustomRuleButton from './CustomRuleButton';
import RuleDetailsCustomRules from './RuleDetailsCustomRules';
import RuleDetailsDescription from './RuleDetailsDescription';
import RuleDetailsHeader from './RuleDetailsHeader';
import RuleDetailsIssues from './RuleDetailsIssues';
import { RuleDetailsParameters } from './RuleDetailsParameters';
import RuleDetailsProfiles from './RuleDetailsProfiles';

interface Props {
  allowCustomRules?: boolean;
  canDeactivateInherited?: boolean;
  canWrite?: boolean;
  onActivate: (profile: string, rule: string, activation: RuleActivationAdvanced) => void;
  onDeactivate: (profile: string, rule: string) => void;
  onDelete: (rule: string) => void;
  referencedProfiles: Record<string, BaseProfile>;
  referencedRepositories: Record<string, { key: string; language: string; name: string }>;
  ruleKey: string;
  selectedProfile?: BaseProfile;
}

export function RuleDetails(props: Readonly<Props>) {
  const {
    allowCustomRules,
    canDeactivateInherited,
    canWrite,
    referencedProfiles,
    referencedRepositories,
    ruleKey,
    selectedProfile,
  } = props;

  const intl = useIntl();

  const { isLoading: isLoadingRule, data } = useRuleDetailsQuery({
    actives: true,
    key: ruleKey,
  });

  const { mutate: updateRule } = useUpdateRuleMutation();
  const { mutate: deleteRule } = useDeleteRuleMutation({}, props.onDelete);

  const { rule: ruleDetails, actives = [] } = data ?? {};

  const params = ruleDetails?.params ?? [];
  const isCustom = ruleDetails?.templateKey !== undefined;
  const isEditable = canWrite && !!allowCustomRules && isCustom;

  const handleTagsChange = (tags: string[]) => {
    updateRule({ key: ruleKey, tags: tags.join() });
  };

  const handleActivate = () => {
    if (selectedProfile) {
      const active = actives.find((active) => active.qProfile === selectedProfile.key);

      if (active) {
        props.onActivate(selectedProfile.key, ruleKey, active);
      }
    }
  };

  const handleDeactivate = () => {
    if (selectedProfile && actives?.find((active) => active.qProfile === selectedProfile.key)) {
      props.onDeactivate(selectedProfile.key, ruleKey);
    }
  };

  return (
    <div className="it__coding-rule-details">
      <Spinner isLoading={isLoadingRule}>
        {ruleDetails && (
          <>
            <RuleDetailsHeader
              canWrite={canWrite}
              onTagsChange={handleTagsChange}
              referencedRepositories={referencedRepositories}
              ruleDetails={ruleDetails}
            />

            <RuleDetailsDescription canWrite={canWrite} ruleDetails={ruleDetails} />

            {params.length > 0 && <RuleDetailsParameters params={params} />}

            {isEditable && (
              <div className="coding-rules-detail-description sw-flex sw-items-center">
                {/* `templateRule` is used to get rule meta data, `customRule` is used to get parameter values */}
                {/* it's expected to pass the same rule to both parameters */}
                <CustomRuleButton customRule={ruleDetails} templateRule={ruleDetails}>
                  {({ onClick }) => (
                    <Button
                      className="js-edit-custom"
                      id="coding-rules-detail-custom-rule-change"
                      onClick={onClick}
                      variety={ButtonVariety.Default}
                    >
                      {intl.formatMessage({ id: 'edit' })}
                    </Button>
                  )}
                </CustomRuleButton>

                <ModalAlert
                  description={intl.formatMessage(
                    {
                      id: 'coding_rules.delete.custom.confirm',
                    },
                    {
                      name: ruleDetails.name,
                    },
                  )}
                  primaryButton={
                    <Button
                      className="sw-ml-2 js-delete"
                      id="coding-rules-detail-rule-delete"
                      onClick={() => {
                        deleteRule({ key: ruleKey });
                      }}
                      variety={ButtonVariety.DangerOutline}
                    >
                      {intl.formatMessage({ id: 'delete' })}
                    </Button>
                  }
                  secondaryButtonLabel={intl.formatMessage({ id: 'close' })}
                  title={intl.formatMessage({ id: 'coding_rules.delete_rule' })}
                >
                  <Button
                    className="sw-ml-2 js-delete"
                    id="coding-rules-detail-rule-delete"
                    variety={ButtonVariety.DangerOutline}
                  >
                    {intl.formatMessage({ id: 'delete' })}
                  </Button>
                </ModalAlert>

                <HelpTooltip
                  className="sw-ml-2"
                  overlay={
                    <div className="sw-py-4">
                      {intl.formatMessage({ id: 'coding_rules.custom_rule.removal' })}
                    </div>
                  }
                >
                  <IconQuestionMark />
                </HelpTooltip>
              </div>
            )}

            {ruleDetails.isTemplate && (
              <RuleDetailsCustomRules
                canChange={allowCustomRules && canWrite}
                ruleDetails={ruleDetails}
              />
            )}

            {!ruleDetails.isTemplate && (
              <RuleDetailsProfiles
                activations={actives}
                canDeactivateInherited={canDeactivateInherited}
                onActivate={handleActivate}
                onDeactivate={handleDeactivate}
                referencedProfiles={referencedProfiles}
                ruleDetails={ruleDetails}
              />
            )}

            {!ruleDetails.isTemplate && ruleDetails.type !== 'SECURITY_HOTSPOT' && (
              <RuleDetailsIssues ruleDetails={ruleDetails} />
            )}

            <div className="sw-flex sw-flex-col sw-gap-2 sw-mt-6" data-meta="available-since">
              <Heading as="h3">
                {intl.formatMessage({ id: 'coding_rules.available_since' })}
              </Heading>

              <DateFormatter date={ruleDetails.createdAt} />
            </div>
          </>
        )}
      </Spinner>
    </div>
  );
}
