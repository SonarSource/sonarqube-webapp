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

import { DangerButtonSecondary } from '~design-system';
import { Rule, RuleActivationAdvanced } from '~shared/types/rules';
import ConfirmButton from '~sq-server-commons/components/controls/ConfirmButton';
import Tooltip from '~sq-server-commons/components/controls/Tooltip';
import { translate, translateWithParameters } from '~sq-server-commons/helpers/l10n';
import { BaseProfile } from '~sq-server-commons/types/quality-profiles';
import ActivationButton from './ActivationButton';

interface Props {
  activation: RuleActivationAdvanced;
  canDeactivateInherited?: boolean;
  handleDeactivate: (key?: string) => void;
  handleRevert: (key?: string) => void;
  onActivate: (severity: string, prioritizedRule: boolean) => Promise<void> | void;
  profile: BaseProfile;
  ruleDetails: Rule;
  showDeactivated?: boolean;
}

export default function ActivatedRuleActions(props: Readonly<Props>) {
  const {
    activation,
    profile,
    ruleDetails,
    onActivate,
    handleRevert,
    handleDeactivate,
    showDeactivated,
    canDeactivateInherited,
  } = props;

  const canEdit = profile.actions?.edit && !profile.isBuiltIn;
  const hasParent = activation.inherit !== 'NONE' && profile.parentKey !== undefined;

  return (
    <>
      {canEdit && (
        <>
          {!ruleDetails.isTemplate && (
            <ActivationButton
              activation={activation}
              ariaLabel={translateWithParameters('coding_rules.change_details_x', profile.name)}
              buttonText={translate('change_verb')}
              className="sw-ml-2"
              modalHeader={translate('coding_rules.change_details')}
              onDone={onActivate}
              profiles={[profile]}
              rule={ruleDetails}
            />
          )}

          {hasParent && activation.inherit === 'OVERRIDES' && profile.parentName && (
            <ConfirmButton
              confirmButtonText={translate('yes')}
              confirmData={profile.key}
              isDestructive
              modalBody={translateWithParameters(
                'coding_rules.revert_to_parent_definition.confirm',
                profile.parentName,
              )}
              modalHeader={translate('coding_rules.revert_to_parent_definition')}
              onConfirm={handleRevert}
            >
              {({ onClick }) => (
                <DangerButtonSecondary className="sw-ml-2 sw-whitespace-nowrap" onClick={onClick}>
                  {translate('coding_rules.revert_to_parent_definition')}
                </DangerButtonSecondary>
              )}
            </ConfirmButton>
          )}

          {(!hasParent || canDeactivateInherited) && (
            <ConfirmButton
              confirmButtonText={translate('yes')}
              confirmData={profile.key}
              modalBody={translate('coding_rules.deactivate.confirm')}
              modalHeader={translate('coding_rules.deactivate')}
              onConfirm={handleDeactivate}
            >
              {({ onClick }) => (
                <DangerButtonSecondary
                  aria-label={translateWithParameters(
                    'coding_rules.deactivate_in_quality_profile_x',
                    profile.name,
                  )}
                  className="sw-ml-2 sw-whitespace-nowrap"
                  onClick={onClick}
                >
                  {translate('coding_rules.deactivate')}
                </DangerButtonSecondary>
              )}
            </ConfirmButton>
          )}

          {showDeactivated &&
            hasParent &&
            !canDeactivateInherited &&
            activation.inherit !== 'OVERRIDES' && (
              <Tooltip content={translate('coding_rules.can_not_deactivate')}>
                <DangerButtonSecondary
                  aria-label={translateWithParameters(
                    'coding_rules.deactivate_in_quality_profile_x',
                    profile.name,
                  )}
                  className="sw-ml-2"
                  disabled
                >
                  {translate('coding_rules.deactivate')}
                </DangerButtonSecondary>
              </Tooltip>
            )}
        </>
      )}
    </>
  );
}
