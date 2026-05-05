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

import { Button, MessageInline, MessageVariety, Spinner } from '@sonarsource/echoes-react';
import React from 'react';
import { translate } from '~sq-server-commons/helpers/l10n';

const intlPrefix = 'settings.authentication.configuration';

interface Props {
  flagMessageContent: React.ReactNode;
  flagMessageLabel: string;
  flagMessageVariant: `${MessageVariety}`;
  loading: boolean;
  onTestConf: () => void;
}

export default function GitLabConfigurationValidity(props: Readonly<Props>) {
  const { loading, flagMessageContent, flagMessageLabel, flagMessageVariant, onTestConf } = props;

  return (
    <>
      <div className="sw-flex sw-items-center">
        <Spinner className="sw-mr-2 sw-my-2" isLoading={loading} />
        {loading && <p>{translate(`${intlPrefix}.validity_check_loading`)}</p>}
      </div>
      <div
        aria-atomic
        aria-busy={loading}
        aria-label={flagMessageLabel}
        aria-live="polite"
        role="status"
      >
        {!loading && (
          <MessageInline className="sw-w-full" variety={flagMessageVariant}>
            {flagMessageContent}
          </MessageInline>
        )}
      </div>
      <Button
        className="sw-whitespace-nowrap sw-text-center sw-my-4"
        isDisabled={loading}
        onClick={onTestConf}
      >
        {translate(`${intlPrefix}.test`)}
      </Button>
    </>
  );
}
