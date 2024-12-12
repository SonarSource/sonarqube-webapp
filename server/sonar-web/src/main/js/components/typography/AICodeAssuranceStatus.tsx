/*
 * SonarQube
 * Copyright (C) 2009-2024 SonarSource SA
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

import { Text } from '@sonarsource/echoes-react';
import { ComponentProps } from 'react';
import { FormattedMessage } from 'react-intl';
import { AiCodeAssuranceStatus } from '../../api/ai-code-assurance';
import AIAssuredIcon from '../icon-mappers/AIAssuredIcon';

type Props = ComponentProps<typeof Text> & {
  aiCodeAssuranceStatus: AiCodeAssuranceStatus;
};
const TRANSLATE_MAPPING = {
  [AiCodeAssuranceStatus.AI_CODE_ASSURED_ON]: 'projects.ai_code_assurance_on.description',
  [AiCodeAssuranceStatus.AI_CODE_ASSURED_OFF]: 'projects.ai_code_assurance_off.description',
  [AiCodeAssuranceStatus.AI_CODE_ASSURED_PASS]: 'projects.ai_code_assurance_pass.description',
  [AiCodeAssuranceStatus.AI_CODE_ASSURED_FAIL]: 'projects.ai_code_assurance_fail.description',
};
export default function AICodeAssuranceStatus({ aiCodeAssuranceStatus, ...rest }: Readonly<Props>) {
  if (aiCodeAssuranceStatus === AiCodeAssuranceStatus.NONE) {
    return null;
  }
  return (
    <Text {...rest}>
      <AIAssuredIcon variant={aiCodeAssuranceStatus} />
      <FormattedMessage id={TRANSLATE_MAPPING[aiCodeAssuranceStatus]} />
    </Text>
  );
}
