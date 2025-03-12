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
import { FormField, InputField, Modal } from '~design-system';
import MandatoryFieldsExplanation from '~sq-server-shared/components/ui/MandatoryFieldsExplanation';
import { translate } from '~sq-server-shared/helpers/l10n';
import { getQualityGateUrl } from '~sq-server-shared/helpers/urls';
import { useCreateQualityGateMutation } from '~sq-server-shared/queries/quality-gates';
import { useRouter } from '~sq-server-shared/sonar-aligned/components/hoc/withRouter';

interface Props {
  onClose: () => void;
}

export default function CreateQualityGateForm({ onClose }: Readonly<Props>) {
  const [name, setName] = React.useState('');
  const { mutateAsync: createQualityGate } = useCreateQualityGateMutation();
  const router = useRouter();

  const handleNameChange = (event: React.SyntheticEvent<HTMLInputElement>) => {
    setName(event.currentTarget.value);
  };

  const handleCreate = async () => {
    if (name !== undefined) {
      const qualityGate = await createQualityGate(name);
      onClose();
      router.push(getQualityGateUrl(qualityGate.name));
    }
  };

  const handleFormSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleCreate();
  };

  const body = (
    <form onSubmit={handleFormSubmit}>
      <MandatoryFieldsExplanation className="modal-field" />
      <FormField
        htmlFor="quality-gate-form-name"
        label={translate('name')}
        required
        requiredAriaLabel={translate('field_required')}
      >
        <InputField
          autoComplete="off"
          className="sw-mb-1"
          id="quality-gate-form-name"
          maxLength={256}
          name="key"
          onChange={handleNameChange}
          size="full"
          type="text"
          value={name}
        />
      </FormField>
    </form>
  );

  return (
    <Modal
      body={body}
      headerTitle={translate('quality_gates.create')}
      isScrollable
      onClose={onClose}
      primaryButton={
        <Button
          form="create-application-form"
          isDisabled={name === null || name === ''}
          onClick={handleCreate}
          type="submit"
        >
          {translate('quality_gate.create')}
        </Button>
      }
      secondaryButtonLabel={translate('cancel')}
    />
  );
}
