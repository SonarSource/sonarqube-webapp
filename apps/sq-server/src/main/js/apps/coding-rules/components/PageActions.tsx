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

import { KeyboardHint } from '~shared/components/KeyboardHint';
import PageCounter from '~sq-server-commons/components/common/PageCounter';
import { translate } from '~sq-server-commons/helpers/l10n';
import { Paging } from '~sq-server-commons/types/types';

export interface PageActionsProps {
  paging?: Paging;
}

export default function PageActions(props: Readonly<PageActionsProps>) {
  return (
    <div className="sw-typo-default sw-flex sw-items-center sw-gap-6 sw-justify-end sw-flex-1">
      <KeyboardHint command="ArrowUp ArrowDown" title={translate('coding_rules.to_select_rules')} />
      <KeyboardHint command="ArrowLeft ArrowRight" title={translate('coding_rules.to_navigate')} />

      {props.paging && (
        <PageCounter
          className="sw-ml-2"
          label={translate('coding_rules._rules')}
          total={props.paging.total}
        />
      )}
    </div>
  );
}
