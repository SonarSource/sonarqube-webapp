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

import { Button, ButtonVariety, Tooltip } from '@sonarsource/echoes-react';
import * as React from 'react';
import { useIntl } from 'react-intl';
import ConfirmButton from '~sq-server-commons/components/controls/ConfirmButton';
import { useDeactivateRuleMutation } from '~sq-server-commons/queries/quality-profiles';
import { BaseProfile } from '~sq-server-commons/types/quality-profiles';

interface Props {
  onDone: () => Promise<void>;
  profile: BaseProfile;
  ruleKey: string;
}

export function ComparisonResultDeactivation(props: React.PropsWithChildren<Props>) {
  const { profile, ruleKey } = props;
  const intl = useIntl();

  const { mutate: deactivateRule } = useDeactivateRuleMutation(() => props.onDone());

  const handleDeactivate = () => {
    deactivateRule({ key: profile.key, rule: ruleKey });
  };

  return (
    <ConfirmButton
      confirmButtonText={intl.formatMessage({ id: 'yes' })}
      modalBody={intl.formatMessage({ id: 'coding_rules.deactivate.confirm' })}
      modalHeader={intl.formatMessage({ id: 'coding_rules.deactivate' })}
      onConfirm={handleDeactivate}
    >
      {({ onClick }) => (
        <Tooltip
          content={intl.formatMessage(
            { id: 'quality_profiles.comparison.deactivate_rule' },
            { profile: profile.name },
          )}
        >
          <Button
            aria-label={intl.formatMessage(
              { id: 'quality_profiles.comparison.deactivate_rule' },
              { profile: profile.name },
            )}
            onClick={onClick}
            variety={ButtonVariety.DangerOutline}
          >
            {intl.formatMessage({ id: 'coding_rules.deactivate' })}
          </Button>
        </Tooltip>
      )}
    </ConfirmButton>
  );
}
