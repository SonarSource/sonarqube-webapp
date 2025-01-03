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

import { IconWarning, Text } from '@sonarsource/echoes-react';
import { translate } from '../../helpers/l10n';

interface Props {
  className?: string;
}

export default function AiAssuranceWarningMessage({ className }: Readonly<Props>) {
  return (
    <div className={className}>
      <IconWarning color="echoes-color-icon-warning" />
      <Text className="sw-ml-1" colorOverride="echoes-color-text-warning">
        {translate('project_quality_gate.not_ai_assured_quality_gate')}
      </Text>
    </div>
  );
}
