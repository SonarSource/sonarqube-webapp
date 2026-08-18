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

import { TextArea, TextInput } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';

interface SectionModalFormFieldsProps {
  description: string;
  name: string;
  onDescriptionChange: (value: string) => void;
  onNameChange: (value: string) => void;
}

export function SectionModalFormFields(props: Readonly<SectionModalFormFieldsProps>) {
  const { description, name, onDescriptionChange, onNameChange } = props;
  const { formatMessage } = useIntl();

  return (
    <div className="sw-space-y-6">
      <TextInput
        isRequired
        label={formatMessage({ id: 'dashboard.section_name' })}
        onChange={(event) => {
          onNameChange(event.target.value);
        }}
        placeholder={formatMessage({ id: 'dashboard.section_name_placeholder' })}
        value={name}
      />
      <TextArea
        isResizable
        label={formatMessage({ id: 'dashboard.section_description' })}
        onChange={(event) => {
          onDescriptionChange(event.target.value);
        }}
        placeholder={formatMessage({ id: 'dashboard.section_description_placeholder' })}
        rows={3}
        value={description}
      />
    </div>
  );
}
