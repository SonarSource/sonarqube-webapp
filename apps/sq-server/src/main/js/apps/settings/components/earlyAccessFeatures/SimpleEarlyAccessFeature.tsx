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
  ButtonGroup,
  ButtonVariety,
  Checkbox,
  Modal,
  ModalSize,
  Text,
} from '@sonarsource/echoes-react';
import { PropsWithChildren, useState } from 'react';
import { useIntl } from 'react-intl';
import { parseAsBoolean } from '~sq-server-shared/helpers/query';
import { StaleTime } from '~sq-server-shared/queries/common';
import { useGetValueQuery, useSaveSimpleValueMutation } from '~sq-server-shared/queries/settings';
import { SettingsKey } from '~sq-server-shared/types/settings';

interface Props {
  onChanged?: (value: boolean) => void;
  settingKey: SettingsKey;
}

export function SimpleEarlyAccessFeature({
  settingKey,
  onChanged,
  children,
}: Readonly<PropsWithChildren<Props>>) {
  const intl = useIntl();
  const { data } = useGetValueQuery({ key: settingKey }, { staleTime: StaleTime.NEVER });
  const settingValue = parseAsBoolean(data?.value);
  const [changed, setChanged] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { mutate } = useSaveSimpleValueMutation(
    false,
    intl.formatMessage({ id: successMessageKey[settingKey] }, { enabled: !settingValue }),
  );

  const handleSave = () => {
    mutate(
      { key: settingKey, value: (!settingValue).toString() },
      {
        onSuccess: () => {
          setConfirmOpen(false);
          setChanged(false);
          onChanged?.(!settingValue);
        },
      },
    );
  };

  if (!data) {
    return null;
  }

  return (
    <div>
      {children}
      <Checkbox
        checked={changed ? !settingValue : settingValue}
        className="sw-mt-6"
        label={intl.formatMessage({ id: checkboxLabelKey[settingKey] })}
        onCheck={(value: boolean) => {
          setChanged(value !== settingValue);
        }}
      />
      {changed && (
        <div>
          <ButtonGroup className="sw-mt-6">
            <Modal
              content={<DialogContent enable={!settingValue} settingKey={settingKey} />}
              isOpen={confirmOpen}
              onOpenChange={(val) => {
                if (!val) {
                  setConfirmOpen(false);
                }
              }}
              primaryButton={
                <Button onClick={handleSave} variety={ButtonVariety.Primary}>
                  {intl.formatMessage({ id: 'confirm' })}
                </Button>
              }
              secondaryButton={
                <Button
                  onClick={() => {
                    setConfirmOpen(false);
                  }}
                >
                  {intl.formatMessage({ id: 'cancel' })}
                </Button>
              }
              size={ModalSize.Wide}
              title={intl.formatMessage(
                { id: dialogTitleKey[settingKey] },
                { enable: !settingValue },
              )}
            >
              <Button
                onClick={() => {
                  setConfirmOpen(true);
                }}
                variety={ButtonVariety.Primary}
              >
                {intl.formatMessage({ id: 'save' })}
              </Button>
            </Modal>
            <Button
              onClick={() => {
                setChanged(false);
              }}
            >
              {intl.formatMessage({ id: 'cancel' })}
            </Button>
          </ButtonGroup>
        </div>
      )}
      <Text as="p" className="sw-mt-6" isSubdued>
        {intl.formatMessage({ id: 'settings.key_x' }, { '0': settingKey })}
      </Text>
    </div>
  );
}

const successMessageKey: Partial<Record<SettingsKey, string>> = {
  [SettingsKey.MISRACompliance]: 'settings.early_access.misra.success',
};

const checkboxLabelKey: Partial<Record<SettingsKey, string>> = {
  [SettingsKey.MISRACompliance]: 'settings.early_access.misra.checkbox_label',
};
const dialogTitleKey: Partial<Record<SettingsKey, string>> = {
  [SettingsKey.MISRACompliance]: 'settings.early_access.misra.dialog_title',
};

const dialogContentKey: Partial<Record<SettingsKey, string>> = {
  [SettingsKey.MISRACompliance]: 'settings.early_access.misra.dialog_description',
};

function DialogContent({
  settingKey,
  enable,
}: Readonly<{ enable: boolean; settingKey: SettingsKey }>) {
  const intl = useIntl();

  if (settingKey === SettingsKey.MISRACompliance) {
    return intl.formatMessage(
      {
        id: `${dialogContentKey[settingKey]}.${enable ? 'enable' : 'disable'}`,
      },
      {
        p: (text) => (
          <Text as="p" className="sw-my-4">
            {text}
          </Text>
        ),
      },
    );
  }

  return null;
}
