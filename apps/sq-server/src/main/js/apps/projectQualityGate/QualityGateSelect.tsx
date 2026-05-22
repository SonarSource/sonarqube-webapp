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

import { IconSparkleInShield, Select } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import { BuiltInQualityGateBadge } from '~shared/components/quality-gates/BuiltInQualityGateBadge';
import { DefaultBadge } from '~shared/components/quality-gates/DefaultBadge';
import { QualityGateNewBadge } from '~shared/components/quality-gates/QualityGateNewBadge';
import {
  getBuiltInQualityGateHelperTextKey,
  isAgenticQualityGate,
} from '~shared/helpers/quality-gates';
import { AiCodeAssuranceStatus } from '~sq-server-commons/api/ai-code-assurance';
import AIAssuredIcon, {
  AiIconColor,
} from '~sq-server-commons/components/icon-mappers/AIAssuredIcon';
import { QualityGate } from '~sq-server-commons/types/types';

function OptionSuffix({
  isDefault,
  isNew,
  isBuiltin,
  isAiAssured,
}: Readonly<{
  isAiAssured: boolean;
  isBuiltin: boolean;
  isDefault: boolean;
  isNew: boolean;
}>) {
  return (
    <>
      {isNew && <QualityGateNewBadge />}

      {isDefault && <DefaultBadge />}

      {isBuiltin && <BuiltInQualityGateBadge />}

      {isAiAssured && (
        <AIAssuredIcon
          color={AiIconColor.Subtle}
          height={16}
          variant={AiCodeAssuranceStatus.AI_CODE_ASSURED_ON}
          width={16}
        />
      )}
    </>
  );
}

export function QualityGateSelect({
  allQualityGates,
  isDisabled,
  onChange,
  isLoading,
  value,
}: Readonly<{
  allQualityGates: QualityGate[];
  isDisabled: boolean;
  isLoading?: boolean;
  onChange: (value: string) => void;
  value: string;
}>) {
  const { formatMessage } = useIntl();

  const options = allQualityGates.map((g) => {
    const disabled = g.conditions === undefined || g.conditions.length === 0;
    const isNew = isAgenticQualityGate({ isBuiltIn: g.isBuiltIn ?? false, name: g.name });

    let helpTextKey = getBuiltInQualityGateHelperTextKey({
      isBuiltIn: g.isBuiltIn ?? false,
      name: g.name,
    });
    if (disabled) {
      helpTextKey = 'project_quality_gate.no_condition';
    }

    return {
      disabled,
      label: g.name,
      value: g.name,
      helpText: helpTextKey ? formatMessage({ id: helpTextKey }) : undefined,
      suffix: (
        <OptionSuffix
          isAiAssured={g.isAiCodeSupported ?? false}
          isBuiltin={g.isBuiltIn ?? false}
          isDefault={g.isDefault ?? false}
          isNew={isNew}
        />
      ),
    };
  });

  const selectedQualityGate = allQualityGates.find((g) => g.name === value);
  const valueIcon = selectedQualityGate?.isAiCodeSupported ? <IconSparkleInShield /> : undefined;

  return (
    <Select
      ariaLabel={formatMessage({ id: 'project_quality_gate.select_specific_qg' })}
      className="it__project-quality-gate-select"
      data={options}
      isDisabled={isDisabled}
      isLoading={isLoading}
      isNotClearable
      onChange={(val) => {
        if (val) {
          onChange(val);
        }
      }}
      value={value}
      valueIcon={valueIcon}
    />
  );
}
