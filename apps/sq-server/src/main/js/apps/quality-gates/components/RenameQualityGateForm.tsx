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

import { Button, ButtonVariety } from '@sonarsource/echoes-react';
import * as React from 'react';
import { FormField, InputField, Modal } from '~design-system';
import MandatoryFieldsExplanation from '~sq-server-shared/components/ui/MandatoryFieldsExplanation';
import { translate } from '~sq-server-shared/helpers/l10n';
import { getQualityGateUrl } from '~sq-server-shared/helpers/urls';
import { useRenameQualityGateMutation } from '~sq-server-shared/queries/quality-gates';
import { useRouter } from '~sq-server-shared/sonar-aligned/components/hoc/withRouter';
import { QualityGate } from '~sq-server-shared/types/types';

interface Props {
  onClose: () => void;
  qualityGate: QualityGate;
}

const FORM_ID = 'rename-quality-gate';

export default function RenameQualityGateForm({ qualityGate, onClose }: Readonly<Props>) {
  const [name, setName] = React.useState(qualityGate.name);
  const { mutateAsync: renameQualityGate } = useRenameQualityGateMutation(qualityGate.name);
  const router = useRouter();

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.currentTarget.value);
  };

  const handleRename = async (event: React.FormEvent) => {
    event.preventDefault();

    await renameQualityGate(name);
    router.push(getQualityGateUrl(name));
  };

  const confirmDisable = !name || (qualityGate && qualityGate.name === name);

  return (
    <Modal
      body={
        <form id={FORM_ID} onSubmit={handleRename}>
          <MandatoryFieldsExplanation />
          <FormField
            className="sw-my-2"
            htmlFor="quality-gate-form-name"
            label={translate('name')}
            required
          >
            <InputField
              autoFocus
              id="quality-gate-form-name"
              maxLength={100}
              onChange={handleNameChange}
              size="auto"
              type="text"
              value={name}
            />
          </FormField>
        </form>
      }
      headerTitle={translate('quality_gates.rename')}
      onClose={onClose}
      primaryButton={
        <Button
          form={FORM_ID}
          hasAutoFocus
          isDisabled={confirmDisable}
          type="submit"
          variety={ButtonVariety.Primary}
        >
          {translate('rename')}
        </Button>
      }
      secondaryButtonLabel={translate('cancel')}
    />
  );
}
