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

import { Form, ModalForm, Text, TextInput } from '@sonarsource/echoes-react';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { RequiredIcon } from '~design-system';
import { translate } from '~sq-server-shared/helpers/l10n';
import { isStringDefined } from '~sq-server-shared/helpers/types';
import { getQualityGateUrl } from '~sq-server-shared/helpers/urls';
import { useRenameQualityGateMutation } from '~sq-server-shared/queries/quality-gates';
import { useRouter } from '~sq-server-shared/sonar-aligned/components/hoc/withRouter';
import { QualityGate } from '~sq-server-shared/types/types';

interface Props extends React.PropsWithChildren {
  qualityGate: QualityGate;
}

const FORM_ID = 'rename-quality-gate';

export default function RenameQualityGateForm({ qualityGate, children }: Readonly<Props>) {
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

  const confirmDisable = !isStringDefined(name) || (qualityGate && qualityGate.name === name);

  return (
    <ModalForm
      content={
        <Form.Section>
          <Text aria-hidden isSubdued>
            <FormattedMessage
              defaultMessage={translate('fields_marked_with_x_required')}
              id="fields_marked_with_x_required"
              values={{ star: <RequiredIcon className="sw-m-0" /> }}
            />
          </Text>
          <TextInput
            autoFocus
            id="quality-gate-form-name"
            isRequired
            label={translate('name')}
            maxLength={100}
            onChange={handleNameChange}
            type="text"
            value={name}
          />
        </Form.Section>
      }
      id={FORM_ID}
      isSubmitDisabled={confirmDisable}
      onSubmit={handleRename}
      submitButtonLabel={translate('rename')}
      title={translate('quality_gates.rename')}
    >
      {children}
    </ModalForm>
  );
}
