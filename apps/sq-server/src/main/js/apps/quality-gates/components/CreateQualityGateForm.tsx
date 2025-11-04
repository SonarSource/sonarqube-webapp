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

import { Form, FormFieldWidth, ModalForm, Text, TextInput } from '@sonarsource/echoes-react';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { RequiredIcon } from '~design-system';
import { useRouter } from '~shared/components/hoc/withRouter';
import { translate } from '~sq-server-commons/helpers/l10n';
import { getQualityGateUrl } from '~sq-server-commons/helpers/urls';
import { useCreateQualityGateMutation } from '~sq-server-commons/queries/quality-gates';

export default function CreateQualityGateForm({ children }: Readonly<React.PropsWithChildren>) {
  const [name, setName] = React.useState('');
  const { mutateAsync: createQualityGate, isPending: submitting } = useCreateQualityGateMutation();
  const router = useRouter();

  const handleNameChange = (event: React.SyntheticEvent<HTMLInputElement>) => {
    setName(event.currentTarget.value);
  };

  const handleCreate = async () => {
    if (name !== undefined) {
      const qualityGate = await createQualityGate(name);
      router.push(getQualityGateUrl(qualityGate.name));
    }
  };

  const handleFormSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleCreate();
    handleReset();
  };

  const handleReset = () => {
    setName('');
  };

  const body = (
    <Form.Section>
      <Text aria-hidden isSubtle>
        <FormattedMessage
          id="fields_marked_with_x_required"
          values={{ star: <RequiredIcon className="sw-m-0" /> }}
        />
      </Text>

      <TextInput
        autoComplete="off"
        id="quality-gate-form-name"
        isRequired
        label={translate('name')}
        maxLength={256}
        name="key"
        onChange={handleNameChange}
        value={name}
        width={FormFieldWidth.Full}
      />
    </Form.Section>
  );

  return (
    <ModalForm
      content={body}
      id="create-application-form"
      isSubmitDisabled={name === null || name === '' || submitting}
      isSubmitting={submitting}
      onReset={handleReset}
      onSubmit={handleFormSubmit}
      secondaryButtonLabel={translate('cancel')}
      submitButtonLabel={translate('quality_gate.create')}
      title={translate('quality_gates.create')}
    >
      {children}
    </ModalForm>
  );
}
