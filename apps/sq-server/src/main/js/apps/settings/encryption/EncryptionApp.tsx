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

import { Spinner } from '@sonarsource/echoes-react';
import * as React from 'react';
import { useIntl } from 'react-intl';
import useEffectOnce from '~shared/helpers/useEffectOnce';
import { checkSecretKey, generateSecretKey } from '~sq-server-commons/api/settings';
import { AdminPageTemplate } from '~sq-server-commons/components/ui/AdminPageTemplate';
import EncryptionForm from './EncryptionForm';
import GenerateSecretKeyForm from './GenerateSecretKeyForm';

export default function EncryptionApp() {
  const { formatMessage } = useIntl();

  const [loading, setLoading] = React.useState(true);
  const [secretKey, setSecretKey] = React.useState('');
  const [secretKeyAvailable, setSecretKeyAvailable] = React.useState(false);

  useEffectOnce(() => {
    initialize();
  });

  const initialize = React.useCallback(() => {
    checkSecretKey().then(
      ({ secretKeyAvailable }) => {
        setLoading(false);
        setSecretKeyAvailable(secretKeyAvailable);
      },
      () => {
        setLoading(false);
      },
    );
  }, []);

  const doGenerateSecretKey = React.useCallback(() => {
    return generateSecretKey().then(({ secretKey }) => {
      setSecretKey(secretKey);
      setSecretKeyAvailable(false);
    });
  }, []);

  const pageTitle = formatMessage({ id: 'property.category.security.encryption' });

  return (
    <AdminPageTemplate breadcrumbs={[{ linkElement: pageTitle }]} title={pageTitle}>
      <div className="sw-my-8" id="encryption-page">
        <Spinner isLoading={loading}>
          {!secretKeyAvailable && (
            <GenerateSecretKeyForm generateSecretKey={doGenerateSecretKey} secretKey={secretKey} />
          )}
        </Spinner>

        {secretKeyAvailable && <EncryptionForm generateSecretKey={doGenerateSecretKey} />}
      </div>
    </AdminPageTemplate>
  );
}
