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

import { Text } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { ActionCell, ContentCell, Table, TableRow } from '~design-system';
import { orderLinks } from '~sq-server-commons/helpers/projectLinks';
import { ProjectLink } from '~sq-server-commons/types/types';
import LinkRow from './ProjectLinkRow';

interface Props {
  links: ProjectLink[];
  onDelete: (linkId: string) => Promise<void>;
}

export default function ProjectLinkTable({ links, onDelete }: Readonly<Props>) {
  if (!links.length) {
    return (
      <Text isSubtle>
        <FormattedMessage id="project_links.no_results" />
      </Text>
    );
  }

  const orderedLinks = orderLinks(links);

  const linkRows = orderedLinks.map((link) => (
    <LinkRow key={link.id} link={link} onDelete={onDelete} />
  ));

  const header = (
    <TableRow>
      <ContentCell>
        <FormattedMessage id="project_links.name" />
      </ContentCell>
      <ContentCell>
        <FormattedMessage id="project_links.url" />
      </ContentCell>
      <ActionCell>&nbsp;</ActionCell>
    </TableRow>
  );

  return (
    <Table columnCount={3} header={header}>
      {linkRows}
    </Table>
  );
}
