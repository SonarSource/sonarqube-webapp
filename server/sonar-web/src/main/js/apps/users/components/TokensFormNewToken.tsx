/*
 * SonarQube
 * Copyright (C) 2009-2018 SonarSource SA
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
import * as React from 'react';
import ClipboardButton from '../../../components/controls/ClipboardButton';
import { translateWithParameters } from '../../../helpers/l10n';
import { Alert } from '../../../components/ui/Alert';

interface Props {
  token: { name: string; token: string };
}

export default function TokensFormNewToken({ token }: Props) {
  return (
    <div className="panel panel-white big-spacer-top">
      <Alert variant="warning">
        {translateWithParameters('users.tokens.new_token_created', token.name)}
      </Alert>
      <ClipboardButton copyValue={token.token} />
      <code className="big-spacer-left text-success">{token.token}</code>
    </div>
  );
}
