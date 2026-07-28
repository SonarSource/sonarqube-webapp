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
  Button,
  ButtonVariety,
  Form,
  MessageInline,
  MessageVariety,
  Modal,
} from '@sonarsource/echoes-react';
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { ExtendedSettingDefinition, SettingType, SettingValue } from '~shared/types/settings';
import { hasMessage } from '~sq-server-commons/helpers/l10n';
import { parseError } from '~sq-server-commons/helpers/request';
import {
  useGetValueQuery,
  useResetSettingsMutation,
  useSaveValueMutation,
} from '~sq-server-commons/queries/settings';
import { SettingDefinitionAndValue } from '~sq-server-commons/types/settings';
import { Component } from '~sq-server-commons/types/types';
import { SETTING_DISABLED_WHEN } from '../constants';
import {
  combineDefinitionAndSettingValue,
  getSettingValue,
  isDefaultOrInherited,
  isEmptyValue,
  isURLKind,
} from '../utils';
import DefinitionActions from './DefinitionActions';
import DefinitionDescription from './DefinitionDescription';
import Input from './inputs/Input';

interface Props {
  component?: Component;
  definition: ExtendedSettingDefinition;
  getConfirmationMessage?: SettingDefinitionAndValue['getConfirmationMessage'];
  initialSettingValue?: SettingValue;
}

const formNoop = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
};
type FieldValue = string | string[] | boolean;

export default function Definition(props: Readonly<Props>) {
  const { component, definition, initialSettingValue } = props;
  const intl = useIntl();
  const { formatMessage } = intl;
  const [isEditing, setIsEditing] = React.useState(false);
  const [isOpenConfirmation, setIsOpenConfirmation] = React.useState(false);
  const [changedValue, setChangedValue] = React.useState<FieldValue>();
  const [validationMessage, setValidationMessage] = React.useState<string>();
  const ref = React.useRef<HTMLElement>(null);

  const { data: loadedSettingValue, isLoading } = useGetValueQuery({
    key: definition.key,
    component: component?.key,
  });

  // WARNING: do *not* remove `?? undefined` below, it is required to change `null` to `undefined`!
  // (Yes, it's ugly, we really shouldn't use `null` as the fallback value in useGetValueQuery)
  // prettier-ignore
  const settingValue = isLoading ? initialSettingValue : (loadedSettingValue ?? undefined);

  // The setting can be disabled by another setting.
  // Fetch the value of the other setting to know if the current one is disabled or not.
  const controllingKey = SETTING_DISABLED_WHEN[definition.key];
  const { data: controllingSettingValue, isLoading: loadingControllingSetting } = useGetValueQuery(
    { key: controllingKey ?? '', component: component?.key },
    { enabled: !!controllingKey },
  );

  const isDisabled = controllingKey
    ? loadingControllingSetting || controllingSettingValue?.value !== 'true'
    : false;

  const disabledReasonKey = `property.${definition.key}.disabled_reason`;
  const disabledReason =
    isDisabled && hasMessage(disabledReasonKey)
      ? formatMessage({ id: disabledReasonKey })
      : undefined;

  const requiresConfirmation = props.getConfirmationMessage != null;

  const { mutateAsync: resetSettingValue, isPending: isResetting } = useResetSettingsMutation();
  const { mutateAsync: saveSettingValue, isPending: isSaving } = useSaveValueMutation();

  const isPending = isResetting || isSaving;

  const handleChange = (changedValue: FieldValue) => {
    setChangedValue(changedValue);
    handleCheck(changedValue);
  };

  const handleReset = async () => {
    try {
      await resetSettingValue({ keys: [definition.key], component: component?.key });

      setChangedValue(undefined);
      ref.current?.focus();
      setValidationMessage(undefined);
    } catch (e) {
      const validationMessage = await parseError(e as Response);
      setValidationMessage(validationMessage);
      ref.current?.focus();
    }
  };

  const handleCancel = () => {
    setChangedValue(undefined);
    setValidationMessage(undefined);
    setIsEditing(false);
  };

  const handleCheck = (value?: FieldValue) => {
    if (isEmptyValue(definition, value)) {
      if (definition.defaultValue === undefined) {
        setValidationMessage(
          formatMessage({ id: 'settings.state.value_cant_be_empty_no_default' }),
        );
      } else {
        setValidationMessage(formatMessage({ id: 'settings.state.value_cant_be_empty' }));
      }
      ref.current?.focus();

      return false;
    }

    if (isURLKind(definition)) {
      try {
        // eslint-disable-next-line no-new
        new URL(value?.toString() ?? '');
      } catch (e) {
        setValidationMessage(
          formatMessage({ id: 'settings.state.url_not_valid' }, { url: value?.toString() ?? '' }),
        );
        ref.current?.focus();

        return false;
      }
    }

    if (definition.type === SettingType.JSON) {
      try {
        JSON.parse(value?.toString() ?? '');
      } catch (e) {
        setValidationMessage((e as Error).message);
        ref.current?.focus();

        return false;
      }
    }

    setValidationMessage(undefined);
    return true;
  };

  const handleConfirmation = () => {
    setIsOpenConfirmation(true);
  };

  const handleSave = async () => {
    setIsOpenConfirmation(false);
    if (changedValue !== undefined) {
      if (isEmptyValue(definition, changedValue)) {
        setValidationMessage(formatMessage({ id: 'settings.state.value_cant_be_empty' }));
        ref.current?.focus();

        return;
      }

      try {
        await saveSettingValue({
          component: component?.key,
          definition,
          newValue: changedValue,
          settingCurrentValue: loadedSettingValue ?? initialSettingValue,
        });

        setChangedValue(undefined);
        setIsEditing(false);
        ref.current?.focus();
      } catch (e) {
        const validationMessage = await parseError(e as Response);
        setValidationMessage(validationMessage);
        ref.current?.focus();
      }
    }
  };

  const hasError = validationMessage != null;
  const hasValueChanged = changedValue != null;
  const storedValue = hasValueChanged ? changedValue : getSettingValue(definition, settingValue);
  const effectiveValue = isDisabled ? false : storedValue;
  const isDefault = isDefaultOrInherited(settingValue);

  const settingDefinitionAndValue = combineDefinitionAndSettingValue(definition, settingValue);

  return (
    <div className="sw-flex sw-gap-12" data-key={definition.key} data-testid={definition.key}>
      <DefinitionDescription component={component} definition={definition} />
      <div className="sw-flex-1">
        <Form onSubmit={formNoop}>
          <Input
            disabledReason={disabledReason}
            hasValueChanged={hasValueChanged}
            isDisabled={isDisabled}
            isEditing={isEditing}
            isInvalid={hasError}
            onCancel={handleCancel}
            onChange={handleChange}
            onEditing={() => {
              setIsEditing(true);
            }}
            onSave={handleSave}
            ref={ref}
            setting={settingDefinitionAndValue}
            value={effectiveValue}
          />

          <div className="sw-mt-2">
            <output>
              {!isPending && validationMessage && (
                <MessageInline variety={MessageVariety.Danger}>
                  <FormattedMessage
                    id="settings.state.validation_failed"
                    values={{ '0': validationMessage }}
                  />
                </MessageInline>
              )}
            </output>
          </div>

          <DefinitionActions
            changedValue={changedValue}
            definition={definition}
            hasError={hasError}
            hasValueChanged={hasValueChanged}
            isDefault={isDefault}
            isEditing={isEditing}
            isResetting={isResetting}
            isSaving={isSaving}
            onCancel={handleCancel}
            onReset={handleReset}
            onSave={requiresConfirmation ? handleConfirmation : handleSave}
            setting={settingDefinitionAndValue}
          />
        </Form>
      </div>
      <Modal
        content={props.getConfirmationMessage?.(changedValue, intl)}
        isOpen={isOpenConfirmation}
        onOpenChange={(isOpen: boolean) => {
          setIsOpenConfirmation(isOpen);
        }}
        primaryButton={
          <Button onClick={handleSave} variety={ButtonVariety.Primary}>
            <FormattedMessage id="confirm" />
          </Button>
        }
        secondaryButton={
          <Button
            onClick={() => {
              setIsOpenConfirmation(false);
            }}
          >
            <FormattedMessage id="cancel" />
          </Button>
        }
        title={
          <FormattedMessage
            id="settings.state.confirmation.title"
            values={{
              name: definition.name,
              value: changedValue,
            }}
          />
        }
      />
    </div>
  );
}
