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

import { Button, ButtonVariety, Spinner } from '@sonarsource/echoes-react';
import { FormEvent, ReactElement } from 'react';
import { BasicSeparator, FlagMessage, RadioButton, SubHeading } from '~design-system';
import { translate } from '~sq-server-commons/helpers/l10n';
import { ProvisioningType } from '~sq-server-commons/types/provisioning';

interface Props {
  autoDescription: ReactElement;
  autoFeatureDisabledText: string | ReactElement;
  autoSettings?: ReactElement;
  autoTitle: string;
  canSave?: boolean;
  canSync?: boolean;
  disabledConfigText: string;
  enabled: boolean;
  hasDifferentProvider: boolean;
  hasFeatureEnabled: boolean;
  hasUnsavedChanges: boolean;
  isLoading?: boolean;
  jitDescription: string | ReactElement;
  jitSettings?: ReactElement;
  jitTitle: string;
  onCancel: () => void;
  onChangeProvisioningType: (val: ProvisioningType) => void;
  onSave: (e: FormEvent) => void;
  onSyncNow?: () => void;
  provisioningType: ProvisioningType;
  synchronizationDetails?: ReactElement;
}

export default function ProvisioningSection(props: Readonly<Props>) {
  const {
    isLoading,
    provisioningType,
    jitTitle,
    jitDescription,
    jitSettings,
    autoTitle,
    autoDescription,
    autoSettings,
    hasFeatureEnabled,
    hasDifferentProvider,
    autoFeatureDisabledText,
    synchronizationDetails,
    onChangeProvisioningType,
    onSave,
    onSyncNow,
    onCancel,
    hasUnsavedChanges,
    enabled,
    disabledConfigText,
    canSave = true,
    canSync,
  } = props;

  return (
    <div className="sw-mb-2">
      <form onSubmit={onSave}>
        <SubHeading as="h5">{translate('settings.authentication.form.provisioning')}</SubHeading>
        {enabled ? (
          <>
            <ul>
              <li>
                <RadioButton
                  checked={provisioningType === ProvisioningType.jit}
                  className="sw-items-start"
                  id="jit"
                  onCheck={onChangeProvisioningType}
                  value={ProvisioningType.jit}
                >
                  <div>
                    <div className="sw-typo-semibold">{jitTitle}</div>

                    <div className="sw-mt-1">{jitDescription}</div>
                  </div>
                </RadioButton>
                {provisioningType === ProvisioningType.jit && jitSettings && (
                  <div className="sw-ml-16 sw-mt-6 sw-max-w-[435px]">{jitSettings}</div>
                )}
                <BasicSeparator className="sw-my-4" />
              </li>
              <li>
                <RadioButton
                  checked={provisioningType === ProvisioningType.auto}
                  className="sw-items-start"
                  disabled={!hasFeatureEnabled || hasDifferentProvider}
                  id="github-auto"
                  onCheck={onChangeProvisioningType}
                  value={ProvisioningType.auto}
                >
                  <div>
                    <div className="sw-typo-semibold">{autoTitle}</div>
                    <div className="sw-mt-1">
                      {hasFeatureEnabled ? (
                        <>
                          {hasDifferentProvider && (
                            <p className="sw-mb-2 sw-typo-semibold">
                              {translate('settings.authentication.form.other_provisioning_enabled')}
                            </p>
                          )}
                          {autoDescription}
                        </>
                      ) : (
                        autoFeatureDisabledText
                      )}
                    </div>
                  </div>
                </RadioButton>
                {provisioningType === ProvisioningType.auto && (
                  <div className="sw-ml-6 sw-mt-6">
                    {synchronizationDetails}
                    {onSyncNow && (
                      <div className="sw-mb-4 sw-mt-6">
                        <Button
                          isDisabled={!canSync}
                          onClick={onSyncNow}
                          variety={ButtonVariety.Primary}
                        >
                          {translate('settings.authentication.github.synchronize_now')}
                        </Button>
                      </div>
                    )}
                    <div className="sw-ml-10 sw-mt-8 sw-max-w-[435px]">{autoSettings}</div>
                  </div>
                )}
                <BasicSeparator className="sw-my-4" />
              </li>
            </ul>
            <div className="sw-flex sw-gap-2 sw-h-800 sw-items-center">
              <Button
                isDisabled={!hasUnsavedChanges || !canSave}
                type="submit"
                variety={ButtonVariety.Primary}
              >
                {translate('save')}
              </Button>
              <Button isDisabled={!hasUnsavedChanges} onClick={onCancel}>
                {translate('cancel')}
              </Button>
              <Spinner isLoading={!!isLoading} />
              <FlagMessage className="sw-mb-0" variant="warning">
                {hasUnsavedChanges &&
                  !isLoading &&
                  translate('settings.authentication.github.configuration.unsaved_changes')}
              </FlagMessage>
            </div>
          </>
        ) : (
          <FlagMessage className="sw-mt-4" variant="info">
            {disabledConfigText}
          </FlagMessage>
        )}
      </form>
    </div>
  );
}
