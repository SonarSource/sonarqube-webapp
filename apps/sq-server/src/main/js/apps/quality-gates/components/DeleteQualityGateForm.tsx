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

import { Button, ButtonVariety, ModalAlert } from '@sonarsource/echoes-react';
import { PropsWithChildren } from 'react';
import { FormattedMessage } from 'react-intl';
import { useRouter } from '~shared/components/hoc/withRouter';
import { translate } from '~sq-server-commons/helpers/l10n';
import { getQualityGatesUrl } from '~sq-server-commons/helpers/urls';
import { useDeleteQualityGateMutation } from '~sq-server-commons/queries/quality-gates';
import { QualityGate } from '~sq-server-commons/types/types';

interface Props extends PropsWithChildren {
  qualityGate: QualityGate;
}

export default function DeleteQualityGateForm({ qualityGate, children }: Readonly<Props>) {
  const { mutateAsync: deleteQualityGate } = useDeleteQualityGateMutation(qualityGate.name);
  const router = useRouter();

  const onDelete = async () => {
    await deleteQualityGate();
    router.push(getQualityGatesUrl());
  };

  return (
    <ModalAlert
      description={
        <FormattedMessage
          id="quality_gates.delete.confirm.message"
          values={{ qualityGate: qualityGate.name }}
        />
      }
      primaryButton={
        <Button hasAutoFocus onClick={onDelete} type="submit" variety={ButtonVariety.Danger}>
          {translate('delete')}
        </Button>
      }
      title={translate('quality_gates.delete')}
    >
      {children}
    </ModalAlert>
  );
}
