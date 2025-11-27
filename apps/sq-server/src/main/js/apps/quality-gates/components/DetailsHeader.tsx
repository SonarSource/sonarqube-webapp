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

import {
  Badge,
  BadgeVariety,
  Button,
  ButtonIcon,
  ButtonVariety,
  DropdownMenu,
  DropdownMenuAlign,
  Heading,
  IconMoreVertical,
} from '@sonarsource/echoes-react';
import { countBy } from 'lodash';
import * as React from 'react';
import { useCallback } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useMetrics } from '~sq-server-commons/context/metrics/withMetricsContext';
import {
  useGetAllQualityGateProjectsQuery,
  useSetAiSupportedQualityGateMutation,
  useSetQualityGateAsDefaultMutation,
} from '~sq-server-commons/queries/quality-gates';
import { CaycStatus, QualityGate } from '~sq-server-commons/types/types';
import BuiltInQualityGateBadge from './BuiltInQualityGateBadge';
import CopyQualityGateForm from './CopyQualityGateForm';
import DeleteQualityGateForm from './DeleteQualityGateForm';
import DisqualifyAiQualityGateForm from './DisqualifyAiQualityGateForm';
import FixQualityGateModal from './FixQualityGateModal';
import RenameQualityGateForm from './RenameQualityGateForm';

interface Props {
  qualityGate: QualityGate;
}

export default function DetailsHeader({ qualityGate }: Readonly<Props>) {
  const intl = useIntl();
  const metrics = useMetrics();
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
              {qualityGate.isDefault && (
                <Badge variety={BadgeVariety.Neutral}>
                  <FormattedMessage id="default" />
                </Badge>
              )}
              {qualityGate.isBuiltIn && <BuiltInQualityGateBadge />}
            </div>
          </div>
        </div>
        {actionsCount === 1 && (
          <>
            {actions.rename && (
              <RenameQualityGateForm qualityGate={qualityGate}>
                <Button
                  ariaLabel={intl.formatMessage(
                    { id: 'quality_gates.rename_x' },
                    { name: qualityGate.name },
                  )}
                >
                  <FormattedMessage id="rename" />
                </Button>
              </RenameQualityGateForm>
            )}
            {actions.copy && (
              <CopyQualityGateForm qualityGate={qualityGate}>
                <Button
                  ariaLabel={intl.formatMessage(
                    { id: 'quality_gates.copy_x' },
                    { name: qualityGate.name },
                  )}
                >
                  <FormattedMessage id="copy" />
                </Button>
              </CopyQualityGateForm>
            )}
            {actions.setAsDefault && (
              <Button
                ariaLabel={intl.formatMessage(
                  { id: 'quality_gates.set_as_default_x' },
                  { name: qualityGate.name },
                )}
                onClick={handleSetAsDefaultClick}
              >
                <FormattedMessage id="set_as_default" />
              </Button>
            )}
            {actions.delete && (
              <DeleteQualityGateForm qualityGate={qualityGate}>
                <Button
                  ariaLabel={intl.formatMessage(
                    { id: 'quality_gates.delete_x' },
                    { name: qualityGate.name },
                  )}
                  variety={ButtonVariety.Danger}
                >
                  <FormattedMessage id="delete" />
                </Button>
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
                    <DropdownMenu.ItemButton
                      ariaLabel={intl.formatMessage(
                        { id: 'quality_gates.rename_x' },
                        { name: qualityGate.name },
                      )}
                    >
                      <FormattedMessage id="rename" />
                    </DropdownMenu.ItemButton>
                  </RenameQualityGateForm>
                )}
                {actions.copy && (
                  <CopyQualityGateForm qualityGate={qualityGate}>
                    <DropdownMenu.ItemButton
                      ariaLabel={intl.formatMessage(
                        { id: 'quality_gates.copy_x' },
                        { name: qualityGate.name },
                      )}
                    >
                      <FormattedMessage id="copy" />
                    </DropdownMenu.ItemButton>
                  </CopyQualityGateForm>
                )}
                {actions.setAsDefault && (
                  <DropdownMenu.ItemButton
                    ariaLabel={intl.formatMessage(
                      { id: 'quality_gates.set_as_default_x' },
                      { name: qualityGate.name },
                    )}
                    onClick={handleSetAsDefaultClick}
                  >
                    <FormattedMessage id="set_as_default" />
                  </DropdownMenu.ItemButton>
                )}
                {actions.manageAiCodeAssurance && !isCountLoading && (
                  <DropdownMenu.ItemButton
                    ariaLabel={intl.formatMessage(
                      {
                        id: qualityGate.isAiCodeSupported
                          ? 'quality_gates.actions.disqualify_for_ai_code_assurance_x'
                          : 'quality_gates.actions.qualify_for_ai_code_assurance_x',
                      },
                      { name: qualityGate.name },
                    )}
                    onClick={handleSetQualityGateAiCodeAssurance}
                  >
                    <FormattedMessage
                      id={
                        qualityGate.isAiCodeSupported
                          ? 'quality_gates.actions.disqualify_for_ai_code_assurance'
                          : 'quality_gates.actions.qualify_for_ai_code_assurance'
                      }
                    />
                  </DropdownMenu.ItemButton>
                )}
                {actions.manageConditions && qualityGate.caycStatus === CaycStatus.NonCompliant && (
                  <FixQualityGateModal
                    conditions={qualityGate.conditions ?? []}
                    metrics={metrics}
                    qualityGate={qualityGate}
                    scope="new-cayc"
                  >
                    <DropdownMenu.ItemButton
                      ariaLabel={intl.formatMessage(
                        { id: 'quality_gates.conditions.update_x' },
                        { name: qualityGate.name },
                      )}
                    >
                      <FormattedMessage id="quality_gates.conditions.update" />
                    </DropdownMenu.ItemButton>
                  </FixQualityGateModal>
                )}
                {actions.delete && (
                  <>
                    <DropdownMenu.Separator />
                    <DeleteQualityGateForm qualityGate={qualityGate}>
                      <DropdownMenu.ItemButtonDestructive
                        ariaLabel={intl.formatMessage(
                          { id: 'quality_gates.delete_x' },
                          { name: qualityGate.name },
                        )}
                      >
                        <FormattedMessage id="delete" />
                      </DropdownMenu.ItemButtonDestructive>
                    </DeleteQualityGateForm>
                  </>
                )}
              </>
            }
          >
            <ButtonIcon Icon={IconMoreVertical} ariaLabel={intl.formatMessage({ id: 'actions' })} />
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
