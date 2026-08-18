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

import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';

import { SectionModalFormFields } from './SectionModalFormFields';
import { SectionModalLayout } from './SectionModalLayout';

interface Props {
  initialDescription: string;
  initialName: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string, description: string) => void;
}

export function EditSectionModal(props: Readonly<Props>) {
  const { isOpen, onClose, onConfirm, initialName, initialDescription } = props;
  const { formatMessage } = useIntl();
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);

  const handleConfirm = () => {
    if (name.trim()) {
      onConfirm(name.trim(), description.trim());
      onClose();
    }
  };

  const handleCancel = () => {
    // Reset to initial values on cancel
    setName(initialName);
    setDescription(initialDescription);
    onClose();
  };

  // Reset form when modal opens with new values
  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setDescription(initialDescription);
    }
  }, [isOpen, initialName, initialDescription]);

  return (
    <SectionModalLayout
      body={
        <SectionModalFormFields
          description={description}
          name={name}
          onDescriptionChange={setDescription}
          onNameChange={setName}
        />
      }
      introDescription={formatMessage({ id: 'dashboard.section_creation_help' })}
      isOpen={isOpen}
      onCancel={handleCancel}
      onConfirm={handleConfirm}
      primaryButtonDisabled={!name.trim()}
      primaryButtonLabel={formatMessage({ id: 'save' })}
      title={formatMessage({ id: 'dashboard.edit_section_title' })}
    />
  );
}
