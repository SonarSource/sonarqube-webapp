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

import {
  Button,
  ButtonIcon,
  ButtonVariety,
  DropdownMenu,
  DropdownMenuAlign,
  Heading,
  IconMoreVertical,
  Tooltip,
} from '@sonarsource/echoes-react';
import { countBy } from 'lodash';
import * as React from 'react';
import { useCallback } from 'react';
import { Badge } from '~design-system';
import { translate } from '~sq-server-shared/helpers/l10n';
import {
  useGetAllQualityGateProjectsQuery,
  useSetAiSupportedQualityGateMutation,
  useSetQualityGateAsDefaultMutation,
} from '~sq-server-shared/queries/quality-gates';
import { CaycStatus, QualityGate } from '~sq-server-shared/types/types';
import BuiltInQualityGateBadge from './BuiltInQualityGateBadge';
import CopyQualityGateForm from './CopyQualityGateForm';
import DeleteQualityGateForm from './DeleteQualityGateForm';
import DisqualifyAiQualityGateForm from './DisqualifyAiQualityGateForm';
import RenameQualityGateForm from './RenameQualityGateForm';

interface Props {
  qualityGate: QualityGate;
}

export default function DetailsHeader({ qualityGate }: Readonly<Props>) {
  const [isQualifyAiFormOpen, setIsQualifyAiFormOpen] = React.useState(false);
  const actions = qualityGate.actions ?? {};
  const actionsCount = countBy([
    actions.rename,
    actions.copy,
    actions.delete,
    actions.setAsDefault,
  ]).true;
  const { mutateAsync: setQualityGateAsDefault } = useSetQualityGateAsDefaultMutation();
  const { mutateAsync: setAiSupportedQualityGate } = useSetAiSupportedQualityGateMutation();
  const { data: qualityGateProjectsHavingAiCode = [], isLoading: isCountLoading } =
    useGetAllQualityGateProjectsQuery(
      { gateName: qualityGate.name, selected: 'selected' },
      {
        select: (data) => data.results.filter((p) => p.containsAiCode),
      },
    );

  const handleSetAsDefaultClick = () => {
    if (!qualityGate.isDefault) {
      setQualityGateAsDefault({ name: qualityGate.name });
    }
  };

  const handleSetQualityGateAiCodeAssurance = () => {
    if (
      (qualityGateProjectsHavingAiCode?.length > 0 && qualityGate.isAiCodeSupported) ||
      (qualityGate.isDefault && qualityGate.isAiCodeSupported)
    ) {
      setIsQualifyAiFormOpen(true);
      return;
    }

    updateQualityGateAiCodeAssurance();
  };

  const updateQualityGateAiCodeAssurance = useCallback(() => {
    setAiSupportedQualityGate({
      isQualityGateAiSupported: !qualityGate.isAiCodeSupported,
      name: qualityGate.name,
    });
    setIsQualifyAiFormOpen(false);
  }, [qualityGate.isAiCodeSupported, qualityGate.name, setAiSupportedQualityGate]);
  return (
    <>
      <div className="it__layout-page-main-header sw-flex sw-items-center sw-justify-between sw-mb-9">
        <div className="sw-flex sw-flex-col">
          <div className="sw-flex sw-items-baseline">
            <Heading as="h2" className="sw-m-0">
              {qualityGate.name}
            </Heading>
            <div className="sw-flex sw-gap-2 sw-ml-4">
              {qualityGate.isDefault && <Badge>{translate('default')}</Badge>}
              {qualityGate.isBuiltIn && <BuiltInQualityGateBadge />}
            </div>
          </div>
        </div>
        {actionsCount === 1 && (
          <>
            {actions.rename && (
              <RenameQualityGateForm qualityGate={qualityGate}>
                <Button>{translate('rename')}</Button>
              </RenameQualityGateForm>
            )}
            {actions.copy && (
              <Tooltip
                content={
                  qualityGate.caycStatus === CaycStatus.NonCompliant
                    ? translate('quality_gates.cannot_copy_no_cayc')
                    : null
                }
              >
                <CopyQualityGateForm qualityGate={qualityGate}>
                  <Button isDisabled={qualityGate.caycStatus === CaycStatus.NonCompliant}>
                    {translate('copy')}
                  </Button>
                </CopyQualityGateForm>
              </Tooltip>
            )}
            {actions.setAsDefault && (
              <Tooltip
                content={
                  qualityGate.caycStatus === CaycStatus.NonCompliant
                    ? translate('quality_gates.cannot_set_default_no_cayc')
                    : null
                }
              >
                <Button
                  isDisabled={qualityGate.caycStatus === CaycStatus.NonCompliant}
                  onClick={handleSetAsDefaultClick}
                >
                  {translate('set_as_default')}
                </Button>
              </Tooltip>
            )}
            {actions.delete && (
              <DeleteQualityGateForm qualityGate={qualityGate}>
                <Button variety={ButtonVariety.Danger}>{translate('delete')}</Button>
              </DeleteQualityGateForm>
            )}
          </>
        )}

        {actionsCount > 1 && (
          <DropdownMenu
            align={DropdownMenuAlign.End}
            id="quality-gate-actions"
            items={
              <>
                {actions.rename && (
                  <RenameQualityGateForm qualityGate={qualityGate}>
                    <DropdownMenu.ItemButton>{translate('rename')}</DropdownMenu.ItemButton>
                  </RenameQualityGateForm>
                )}
                {actions.copy &&
                  (qualityGate.caycStatus === CaycStatus.NonCompliant ? (
                    <Tooltip content={translate('quality_gates.cannot_copy_no_cayc')}>
                      <DropdownMenu.ItemButton isDisabled>
                        {translate('copy')}
                      </DropdownMenu.ItemButton>
                    </Tooltip>
                  ) : (
                    <CopyQualityGateForm qualityGate={qualityGate}>
                      <DropdownMenu.ItemButton>{translate('copy')}</DropdownMenu.ItemButton>
                    </CopyQualityGateForm>
                  ))}
                {actions.setAsDefault && (
                  <Tooltip
                    content={
                      qualityGate.caycStatus === CaycStatus.NonCompliant
                        ? translate('quality_gates.cannot_set_default_no_cayc')
                        : null
                    }
                  >
                    <DropdownMenu.ItemButton
                      isDisabled={qualityGate.caycStatus === CaycStatus.NonCompliant}
                      onClick={handleSetAsDefaultClick}
                    >
                      {translate('set_as_default')}
                    </DropdownMenu.ItemButton>
                  </Tooltip>
                )}
                {actions.manageAiCodeAssurance && !isCountLoading && (
                  <DropdownMenu.ItemButton onClick={handleSetQualityGateAiCodeAssurance}>
                    {translate(
                      qualityGate.isAiCodeSupported
                        ? 'quality_gates.actions.disqualify_for_ai_code_assurance'
                        : 'quality_gates.actions.qualify_for_ai_code_assurance',
                    )}
                  </DropdownMenu.ItemButton>
                )}
                {actions.delete && (
                  <>
                    <DropdownMenu.Separator />
                    <DeleteQualityGateForm qualityGate={qualityGate}>
                      <DropdownMenu.ItemButtonDestructive>
                        {translate('delete')}
                      </DropdownMenu.ItemButtonDestructive>
                    </DeleteQualityGateForm>
                  </>
                )}
              </>
            }
          >
            <ButtonIcon Icon={IconMoreVertical} ariaLabel={translate('actions')} />
          </DropdownMenu>
        )}
      </div>

      {isQualifyAiFormOpen && (
        <DisqualifyAiQualityGateForm
          count={qualityGateProjectsHavingAiCode.length}
          isDefault={qualityGate.isDefault}
          onClose={() => {
            setIsQualifyAiFormOpen(false);
          }}
          onConfirm={updateQualityGateAiCodeAssurance}
        />
      )}
    </>
  );
}
