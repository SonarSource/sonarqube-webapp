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

import styled from '@emotion/styled';
import { cssVar, Heading, Text } from '@sonarsource/echoes-react';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { Accordion } from '~shared/components/Accordion';

interface DashboardDescriptionAccordionProps {
  className?: string;
  description: string;
}

export function DashboardDescriptionAccordion(props: Readonly<DashboardDescriptionAccordionProps>) {
  const { description } = props;
  const { formatMessage } = useIntl();
  const [isOpen, setIsOpen] = useState(false);
  const dashboardDescriptionLabel = formatMessage({ id: 'dashboard.about_this_dashboard' });

  return (
    <StyledAccordion
      ariaLabel={dashboardDescriptionLabel}
      header={<Heading as="h3">{dashboardDescriptionLabel}</Heading>}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    >
      <Text>{description}</Text>
    </StyledAccordion>
  );
}

const StyledAccordion = styled(Accordion)`
  &[open] summary {
    border-bottom: none;
  }

  &[open] .accordion-content {
    padding-top: 0;
  }

  background-color: ${cssVar('color-surface-default')};
`;
