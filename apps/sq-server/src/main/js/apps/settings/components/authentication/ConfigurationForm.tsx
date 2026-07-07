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

import { Button, ButtonVariety, Modal, ModalSize, Spinner, Text } from '@sonarsource/echoes-react';
import { keyBy } from 'lodash';
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import DocumentationLink from '~sq-server-commons/components/common/DocumentationLink';
import { AlmAuthDocLinkKeys } from '~sq-server-commons/helpers/doc-links';
import { useSaveValuesMutation } from '~sq-server-commons/queries/settings';
import { AuthenticationTabs } from './Authentication';
import AuthenticationFormField from './AuthenticationFormField';
import { ConfigurationSettingValue } from './hook/useConfiguration';

interface Props {
  canBeSave: boolean;
  create: boolean;
  excludedField: string[];
  loading: boolean;
  onClose: () => void;
  setNewValue: (key: string, value: string | boolean) => void;
  tab: AuthenticationTabs;
  values: Record<string, ConfigurationSettingValue>;
}

interface ErrorValue {
  key: string;
  message: string;
}

const FORM_ID = 'configuration-form';

export default function ConfigurationForm(props: Readonly<Props>) {
  const { canBeSave, create, excludedField, loading, setNewValue, tab, values } = props;
  const { formatMessage } = useIntl();
  const [errors, setErrors] = React.useState<Record<string, ErrorValue>>({});

  const { mutateAsync: changeConfig } = useSaveValuesMutation();

  const header = formatMessage({
    id: `settings.authentication.form.${create ? 'create' : 'edit'}.${tab}`,
  });

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (canBeSave) {
      await onSave();
    } else {
      const errors = Object.values(values)
        .filter((v) => v.newValue === undefined && v.value === undefined && v.mandatory)
        .map((v) => ({ key: v.key, message: formatMessage({ id: 'field_required' }) }));

      setErrors(keyBy(errors, 'key'));
    }
  };

  const onSave = async () => {
    const data = await changeConfig(Object.values(values));

    const errors = data
      .filter(({ success }) => !success)
      .map(({ key }) => ({
        key,
        message: formatMessage({ id: 'default_save_field_error_message' }),
      }));

    setErrors(keyBy(errors, 'key'));

    if (errors.length === 0) {
      props.onClose();
    }
  };

  const formBody = (
    <form id={FORM_ID} onSubmit={handleSubmit}>
      <Spinner
        ariaLabel={formatMessage({ id: 'settings.authentication.form.loading' })}
        isLoading={loading}
      >
        <Text as="p" className="sw-mb-8" isSubtle>
          <FormattedMessage
            id="settings.authentication.help"
            values={{
              link: (
                <DocumentationLink to={AlmAuthDocLinkKeys[tab]}>
                  <FormattedMessage id="settings.authentication.help.link" />
                </DocumentationLink>
              ),
            }}
          />
        </Text>

        {Object.values(values).map((val) => {
          if (excludedField.includes(val.key)) {
            return null;
          }

          return (
            <div className="sw-mb-8" key={val.key}>
              <AuthenticationFormField
                definition={val.definition}
                error={errors[val.key]?.message}
                isNotSet={val.isNotSet}
                mandatory={val.mandatory}
                onFieldChange={setNewValue}
                settingValue={values[val.key]?.newValue ?? values[val.key]?.value}
              />
            </div>
          );
        })}
      </Spinner>
    </form>
  );

  return (
    <Modal
      content={formBody}
      isOpen
      onOpenChange={(open) => {
        if (!open) {
          props.onClose();
        }
      }}
      primaryButton={
        <Button
          form={FORM_ID}
          hasAutoFocus
          isDisabled={!canBeSave}
          isLoading={loading}
          type="submit"
          variety={ButtonVariety.Primary}
        >
          <FormattedMessage id="settings.almintegration.form.save" />
        </Button>
      }
      secondaryButton={
        <Button onClick={props.onClose}>
          <FormattedMessage id="cancel" />
        </Button>
      }
      size={ModalSize.Default}
      title={header}
    />
  );
}
