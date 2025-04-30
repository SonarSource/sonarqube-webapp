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

import { Button } from '@sonarsource/echoes-react';
import * as React from 'react';
import { useIntl } from 'react-intl';
import { Spinner } from '~design-system';
import { RuleDetails } from '~shared/types/rules';
import { getRuleDetails } from '~sq-server-shared/api/rules';
import Tooltip from '~sq-server-shared/components/controls/Tooltip';
import { BaseProfile } from '~sq-server-shared/types/quality-profiles';
import ActivationFormModal from '../../coding-rules/components/ActivationFormModal';

interface Props {
  onDone: () => Promise<void>;
  profile: BaseProfile;
  ruleKey: string;
}

export default function ComparisonResultActivation(props: React.PropsWithChildren<Props>) {
  const { profile, ruleKey } = props;
  const [state, setState] = React.useState<'closed' | 'opening' | 'open'>('closed');
  const [rule, setRule] = React.useState<RuleDetails>();
  const intl = useIntl();

  const isOpen = state === 'open' && !!rule;

  const activateRuleMsg = intl.formatMessage(
    { id: 'quality_profiles.comparison.activate_rule' },
    { profile: profile.name },
  );

  const handleButtonClick = () => {
    setState('opening');
    getRuleDetails({ key: ruleKey }).then(
      ({ rule }) => {
        setState('open');
        setRule(rule);
      },
      () => {
        setState('closed');
      },
    );
  };

  return (
    <Spinner loading={state === 'opening'}>
      <Tooltip content={activateRuleMsg} side="bottom">
        <Button
          aria-label={activateRuleMsg}
          isDisabled={state !== 'closed'}
          onClick={handleButtonClick}
        >
          {intl.formatMessage({ id: 'activate' })}
        </Button>
      </Tooltip>

      {rule && (
        <ActivationFormModal
          isOpen={isOpen}
          modalHeader={intl.formatMessage({ id: 'coding_rules.activate_in_quality_profile' })}
          onClose={() => {
            setState('closed');
          }}
          onDone={props.onDone}
          onOpenChange={(open) => {
            setState(open ? 'open' : 'closed');
          }}
          profiles={[profile]}
          rule={rule}
        />
      )}
    </Spinner>
  );
}
