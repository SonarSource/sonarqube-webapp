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

import { Title } from '~design-system';
import { isApplication, isPortfolioLike } from '~shared/helpers/component';
import { translate } from '~sq-server-commons/helpers/l10n';
import { Component } from '~sq-server-commons/types/types';

interface Props {
  component: Pick<Component, 'qualifier'>;
}

function getDescription(qualifier: string) {
  if (isPortfolioLike(qualifier)) {
    return translate('portfolio_deletion.page.description');
  } else if (isApplication(qualifier)) {
    return translate('application_deletion.page.description');
  }

  return translate('project_deletion.page.description');
}

export default function Header(props: Readonly<Props>) {
  const { qualifier } = props.component;

  return (
    <header className="sw-mt-8 sw-mb-4">
      <Title className="sw-mb-4">{translate('deletion.page')}</Title>
      <p className="sw-mb-2">{getDescription(qualifier)}</p>
    </header>
  );
}
