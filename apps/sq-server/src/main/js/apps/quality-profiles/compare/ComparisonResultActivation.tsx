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

import { Button, Spinner } from '@sonarsource/echoes-react';
import * as React from 'react';
import { useIntl } from 'react-intl';
import Tooltip from '~sq-server-commons/components/controls/Tooltip';
import { useRuleDetailsQuery } from '~sq-server-commons/queries/rules';
import { BaseProfile } from '~sq-server-commons/types/quality-profiles';
import ActivationFormModal from '../../coding-rules/components/ActivationFormModal';

interface Props {
  onDone: () => Promise<void>;
  profile: BaseProfile;
  ruleKey: string;
}

export function ComparisonResultActivation(props: React.PropsWithChildren<Props>) {
  const { profile, ruleKey } = props;
  const [isOpen, setIsOpen] = React.useState(false);
  const intl = useIntl();

  const {
    data: ruleData,
    isFetching,
    refetch,
  } = useRuleDetailsQuery({ key: ruleKey }, { enabled: false });

  const rule = ruleData?.rule;

  const activateRuleMsg = intl.formatMessage(
    { id: 'quality_profiles.comparison.activate_rule' },
    { profile: profile.name },
  );

  const handleButtonClick = async () => {
    const result = await refetch();
    if (result.data) {
      setIsOpen(true);
    }
  };

  return (
    <Spinner isLoading={isFetching}>
      <Tooltip content={activateRuleMsg} side="bottom">
        <Button ariaLabel={activateRuleMsg} isDisabled={isFetching} onClick={handleButtonClick}>
          {intl.formatMessage({ id: 'activate' })}
        </Button>
      </Tooltip>

      {rule && (
        <ActivationFormModal
          isOpen={isOpen}
          modalHeader={intl.formatMessage({ id: 'coding_rules.activate_in_quality_profile' })}
          onClose={() => {
            setIsOpen(false);
          }}
          onDone={props.onDone}
          onOpenChange={setIsOpen}
          profiles={[profile]}
          rule={rule}
        />
      )}
    </Spinner>
  );
}

export default ComparisonResultActivation;
