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
import { useRouter } from '~shared/components/hoc/withRouter';
import { isStringDefined } from '~shared/helpers/types';
import { translate } from '~sq-server-commons/helpers/l10n';
import { getQualityGateUrl } from '~sq-server-commons/helpers/urls';
import { useCopyQualityGateMutation } from '~sq-server-commons/queries/quality-gates';
import { QualityGate } from '~sq-server-commons/types/types';

interface Props extends React.PropsWithChildren {
  qualityGate: QualityGate;
}

const FORM_ID = 'rename-quality-gate';

export default function CopyQualityGateForm({ qualityGate, children }: Readonly<Props>) {
  const [name, setName] = React.useState(qualityGate.name);
  const { mutateAsync: copyQualityGate, isPending: isSubmitting } = useCopyQualityGateMutation(
    qualityGate.name,
  );
  const router = useRouter();

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.currentTarget.value);
  };

  const handleCopy = async (event: React.FormEvent) => {
    event.preventDefault();

    const newQualityGate = await copyQualityGate(name);
    router.push(getQualityGateUrl(newQualityGate.name));
  };

  const handleReset = () => {
    setName(qualityGate.name);
  };

  const buttonDisabled =
    !isStringDefined(name) || (qualityGate && qualityGate.name === name) || isSubmitting;

  return (
    <ModalForm
      content={
        <Form.Section
          description={
            <Text isSubtle>
              <FormattedMessage
                id="fields_marked_with_x_required"
                values={{ star: <RequiredIcon className="sw-m-0" /> }}
              />
            </Text>
          }
        >
          <TextInput
            aria-label={translate('name')}
            autoFocus
            id="quality-gate-form-name"
            isRequired
            label={translate('name')}
            maxLength={100}
            onChange={handleNameChange}
            value={name}
          />
        </Form.Section>
      }
      id={FORM_ID}
      isSubmitDisabled={buttonDisabled}
      isSubmitting={isSubmitting}
      onReset={handleReset}
      onSubmit={handleCopy}
      submitButtonLabel={translate('copy')}
      title={translate('quality_gates.copy')}
    >
      {children}
    </ModalForm>
  );
}
