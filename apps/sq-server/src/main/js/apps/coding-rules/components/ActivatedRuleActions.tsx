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
  ButtonIcon,
  ButtonSize,
  ButtonVariety,
  DropdownMenu,
  IconMoreVertical,
  ModalAlert,
  Tooltip,
} from '@sonarsource/echoes-react';
import { ReactNode } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Rule, RuleActivationAdvanced } from '~shared/types/rules';
import { BaseProfile } from '~sq-server-commons/types/quality-profiles';
import ActivationButton from './ActivationButton';

interface Props {
  activation: RuleActivationAdvanced;
  canDeactivateInherited?: boolean;
  handleDeactivate: (key?: string) => void;
  handleRevert: (key?: string) => void;
  mode?: 'dropdown' | 'buttons';
  onActivate: (severity: string, prioritizedRule: boolean) => Promise<void> | void;
  profile: BaseProfile;
  ruleDetails: Rule;
  showDeactivated?: boolean;
}

export default function ActivatedRuleActions(props: Readonly<Props>) {
  const intl = useIntl();
  const {
    activation,
    profile,
    ruleDetails,
    onActivate,
    handleRevert,
    handleDeactivate,
    showDeactivated,
    canDeactivateInherited,
    mode = 'buttons',
  } = props;

  const canEdit = profile.actions?.edit && !profile.isBuiltIn;
  const hasParent = activation.inherit !== 'NONE' && profile.parentKey !== undefined;

  const canChangeQp = !ruleDetails.isTemplate;
  const canRevertToParent = Boolean(
    hasParent && activation.inherit === 'OVERRIDES' && profile.parentName,
  );
  const canDeactivate = Boolean(!hasParent || canDeactivateInherited);
  const cannotDeactivateButSeeButton = Boolean(
    showDeactivated && hasParent && !canDeactivateInherited && activation.inherit !== 'OVERRIDES',
  );

  const renderActivationButton = (inDropdown = true) => (
    <ActivationButton
      activation={activation}
      ariaLabel={intl.formatMessage({ id: 'coding_rules.change_details_x' }, { '0': profile.name })}
      buttonText={intl.formatMessage({ id: 'change_verb' })}
      inDropdown={inDropdown}
      modalHeader={intl.formatMessage({ id: 'coding_rules.change_details' })}
      onDone={onActivate}
      profiles={[profile]}
      rule={ruleDetails}
    />
  );

  const renderRevertModal = (trigger: ReactNode) => (
    <ModalAlert
      description={
        <FormattedMessage
          id="coding_rules.revert_to_parent_definition.confirm"
          values={{ '0': String(profile.parentName) }}
        />
      }
      primaryButton={
        <Button
          onClick={() => {
            handleRevert(profile.key);
          }}
          variety={ButtonVariety.Danger}
        >
          <FormattedMessage id="yes" />
        </Button>
      }
      secondaryButtonLabel={intl.formatMessage({ id: 'close' })}
      title={<FormattedMessage id="coding_rules.revert_to_parent_definition" />}
    >
      {trigger}
    </ModalAlert>
  );

  const renderDeactivateModal = (trigger: ReactNode) => (
    <ModalAlert
      description={<FormattedMessage id="coding_rules.deactivate.confirm" />}
      primaryButton={
        <Button
          onClick={() => {
            handleDeactivate(profile.key);
          }}
          variety={ButtonVariety.Danger}
        >
          <FormattedMessage id="yes" />
        </Button>
      }
      secondaryButtonLabel={intl.formatMessage({ id: 'close' })}
      title={<FormattedMessage id="coding_rules.deactivate" />}
    >
      {trigger}
    </ModalAlert>
  );

  if (
    [canChangeQp, canRevertToParent, canDeactivate, cannotDeactivateButSeeButton].some(Boolean) &&
    canEdit
  ) {
    // Dropdown mode: render actions in a dropdown menu
    if (mode === 'dropdown') {
      return (
        <DropdownMenu
          items={
            <>
              {canChangeQp && renderActivationButton()}

              {canRevertToParent &&
                renderRevertModal(
                  <DropdownMenu.ItemButtonDestructive>
                    <FormattedMessage id="coding_rules.revert_to_parent_definition" />
                  </DropdownMenu.ItemButtonDestructive>,
                )}

              {(canDeactivate || cannotDeactivateButSeeButton) &&
                renderDeactivateModal(
                  <DropdownMenu.ItemButtonDestructive
                    ariaLabel={intl.formatMessage(
                      { id: 'coding_rules.deactivate_in_quality_profile_x' },
                      { '0': profile.name },
                    )}
                    helpText={
                      cannotDeactivateButSeeButton ? (
                        <FormattedMessage id="coding_rules.can_not_deactivate" />
                      ) : undefined
                    }
                    isDisabled={cannotDeactivateButSeeButton}
                  >
                    <FormattedMessage id="coding_rules.deactivate" />
                  </DropdownMenu.ItemButtonDestructive>,
                )}
            </>
          }
        >
          <ButtonIcon
            Icon={IconMoreVertical}
            ariaLabel={intl.formatMessage(
              { id: 'coding_rules.see_actions_for_profile_x' },
              { x: profile.name },
            )}
            className="sw-ml-1"
            size={ButtonSize.Medium}
            variety={ButtonVariety.DefaultGhost}
          />
        </DropdownMenu>
      );
    }

    // Buttons mode: render actions as horizontal buttons
    return (
      <div className="sw-flex sw-gap-2 sw-ml-4">
        {canChangeQp && renderActivationButton(false)}

        {canRevertToParent &&
          renderRevertModal(
            <Button variety={ButtonVariety.DangerOutline}>
              <FormattedMessage id="coding_rules.revert_to_parent_definition" />
            </Button>,
          )}

        {(canDeactivate || cannotDeactivateButSeeButton) &&
          renderDeactivateModal(
            cannotDeactivateButSeeButton ? (
              <Tooltip content={<FormattedMessage id="coding_rules.can_not_deactivate" />}>
                <Button
                  ariaLabel={intl.formatMessage(
                    { id: 'coding_rules.deactivate_in_quality_profile_x' },
                    { '0': profile.name },
                  )}
                  isDisabled
                  variety={ButtonVariety.DangerOutline}
                >
                  <FormattedMessage id="coding_rules.deactivate" />
                </Button>
              </Tooltip>
            ) : (
              <Button
                ariaLabel={intl.formatMessage(
                  { id: 'coding_rules.deactivate_in_quality_profile_x' },
                  { '0': profile.name },
                )}
                isDisabled={cannotDeactivateButSeeButton}
                variety={ButtonVariety.DangerOutline}
              >
                <FormattedMessage id="coding_rules.deactivate" />
              </Button>
            ),
          )}
      </div>
    );
  }

  return null;
}
