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
import * as React from 'react';
import { useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { CodeSnippet, InputTextArea } from '~design-system';
import { ClipboardIconButton } from '~shared/components/clipboard';
import { encryptValue } from '~sq-server-commons/api/settings';
import DocumentationLink from '~sq-server-commons/components/common/DocumentationLink';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { translate } from '~sq-server-commons/helpers/l10n';

interface Props {
  generateSecretKey: () => Promise<void>;
}

export default function EncryptionForm({ generateSecretKey }: Readonly<Props>) {
  const [encrypting, setEncrypting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [encryptedValue, setEncryptedValue] = useState('');
  const [value, setValue] = useState('');

  const handleChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(event.currentTarget.value);
  }, []);

  const handleEncrypt = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      setEncrypting(true);
      encryptValue(value).then(
        ({ encryptedValue }) => {
          setEncryptedValue(encryptedValue);
          setEncrypting(false);
        },
        () => {
          setEncrypting(false);
        },
      );
    },
    [value],
  );

  const handleGenerateSecretKey = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      setGenerating(true);
      generateSecretKey().then(
        () => {
          setGenerating(false);
        },
        () => {
          setGenerating(false);
        },
      );
    },
    [generateSecretKey],
  );

  return (
    <div id="encryption-form-container">
      <div className="sw-mb-2">{translate('encryption.form_intro')}</div>
      <form id="encryption-form" onSubmit={handleEncrypt}>
        <InputTextArea
          autoFocus
          id="encryption-form-value"
          onChange={handleChange}
          required
          rows={5}
          size="large"
          value={value}
        />
        <div>
          <Button className="sw-my-2" isDisabled={encrypting || generating} type="submit">
            {translate('encryption.encrypt')}
          </Button>
          <Spinner isLoading={encrypting} />
        </div>
      </form>

      {encryptedValue && (
        <div className="sw-my-2">
          <label>{translate('encryption.encrypted_value')}</label>
          <div className="sw-flex">
            <CodeSnippet
              className="it__encrypted-value sw-max-w-full sw-break-words sw-p-1"
              isOneLine
              noCopy
              snippet={encryptedValue}
            />
            <ClipboardIconButton
              aria-label={translate('copy_to_clipboard')}
              className="sw-ml-4"
              copyValue={encryptedValue}
            />
          </div>
        </div>
      )}

      <form id="encryption-new-key-form" onSubmit={handleGenerateSecretKey}>
        <p className="sw-my-2">
          <FormattedMessage
            id="encryption.form_note"
            values={{
              moreInformationLink: (
                <DocumentationLink to={DocLink.InstanceAdminSecurity}>
                  {translate('more_information')}
                </DocumentationLink>
              ),
            }}
          />
        </p>

        <Button isDisabled={generating || encrypting} type="submit" variety={ButtonVariety.Primary}>
          {translate('encryption.generate_new_secret_key')}{' '}
        </Button>
        <Spinner isLoading={generating} />
      </form>
    </div>
  );
}
